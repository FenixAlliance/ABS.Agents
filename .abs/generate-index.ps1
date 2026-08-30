#requires -Version 7.0
<#
.SYNOPSIS
    Generates the ABS Gallery discovery index (.abs/gallery-index.json) from the
    paperclip manifest tree. Single source of truth: the manifests on disk.

.DESCRIPTION
    Scans paperclip/agents, paperclip/skills and paperclip/workflows for the three
    manifest kinds, extracts kind/key/path/name/version/description, computes the
    SHA-256 content hash over the LF bytes github serves, and writes a deterministic
    .abs/gallery-index.json (stable ordinal ordering by kind then key).

    Manifest kinds:
      Agent     paperclip/agents/<name>/AGENT.md  or  AGENTS.md
      Skill     paperclip/skills/<name>/SKILL.md
      Workflow  paperclip/workflows/<name>/WORKFLOW.json

    Field extraction:
      .md manifests  -> YAML frontmatter (key, name, version, description).
                        name falls back to the first Markdown H1, then the dir name.
                        key  falls back to the repo-relative manifest path.
      WORKFLOW.json  -> top-level key, name, version, description.

    Content hash:
      SHA-256 (lowercase hex) over the file bytes with CRLF normalized to LF, so the
      hash equals what github serves (LF) and matches the server's install/validate
      contentDigest. This is independent of the local core.autocrlf state: a working
      copy checked out with CRLF still hashes to the LF digest.

.PARAMETER Verify
    Do not write. Regenerate the index in memory and compare it byte-for-byte against
    the on-disk .abs/gallery-index.json. Exit 0 if identical, exit 1 if they differ
    (for CI / a pre-publish gate). Prints the first differing region.

.EXAMPLE
    pwsh .abs/generate-index.ps1
        Regenerate and write .abs/gallery-index.json.

.EXAMPLE
    pwsh .abs/generate-index.ps1 -Verify
        Fail (exit 1) if the committed index does not match a fresh generation.
#>
[CmdletBinding()]
param(
    [switch]$Verify
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
$ScriptDir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot     = Split-Path -Parent $ScriptDir
$PaperclipDir = Join-Path $RepoRoot 'paperclip'
$IndexPath    = Join-Path $ScriptDir 'gallery-index.json'
$SchemaVersion = 1

if (-not (Test-Path -LiteralPath $PaperclipDir)) {
    throw "paperclip directory not found at: $PaperclipDir"
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Repo-relative path with forward slashes.
function Get-RelativePath {
    param([string]$FullPath)
    $rel = [System.IO.Path]::GetRelativePath($RepoRoot, $FullPath)
    return ($rel -replace '\\', '/')
}

# Normalize CRLF (0x0D 0x0A) -> LF (0x0A) in a byte array. Makes hashing and comparison
# independent of the local core.autocrlf state and matches the LF bytes github serves.
function ConvertTo-LfBytes {
    param([byte[]]$Bytes)
    $out = New-Object System.Collections.Generic.List[byte] ($Bytes.Length)
    for ($i = 0; $i -lt $Bytes.Length; $i++) {
        if ($Bytes[$i] -eq 0x0D -and ($i + 1) -lt $Bytes.Length -and $Bytes[$i + 1] -eq 0x0A) {
            continue
        }
        $out.Add($Bytes[$i])
    }
    # Unary comma prevents PowerShell from unrolling the byte[] into Object[] on return.
    return , $out.ToArray()
}

# SHA-256 (lowercase hex) over the file bytes with CRLF normalized to LF.
function Get-ContentHash {
    param([string]$FullPath)
    $bytes = ConvertTo-LfBytes ([System.IO.File]::ReadAllBytes($FullPath))
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hash = $sha.ComputeHash($bytes)
    } finally {
        $sha.Dispose()
    }
    return ([System.BitConverter]::ToString($hash) -replace '-', '').ToLowerInvariant()
}

# Read a file as text, line endings normalized to LF.
function Get-NormalizedText {
    param([string]$FullPath)
    $text = [System.IO.File]::ReadAllText($FullPath)
    return ($text -replace "`r`n", "`n" -replace "`r", "`n")
}

# First Markdown H1 ("# Title", exactly one leading '#'), or $null.
function Get-FirstH1 {
    param([string]$Text)
    foreach ($line in $Text.Split([char]10)) {
        $m = [regex]::Match($line, '^#[ \t]+(\S.*?)\s*$')
        if ($m.Success) { return $m.Groups[1].Value }
    }
    return $null
}

# Parse the wanted scalar fields (key/name/version/description) from YAML frontmatter.
# Handles inline scalars, quoted scalars, folded (>) and literal (|) block scalars.
function ConvertFrom-Frontmatter {
    param([string]$Text)

    $result = [ordered]@{ key = $null; name = $null; version = $null; description = $null; hasFrontmatter = $false }
    $lines = $Text.Split([char]10)
    if ($lines.Count -lt 1 -or $lines[0].TrimEnd() -ne '---') { return $result }

    $end = -1
    for ($i = 1; $i -lt $lines.Count; $i++) {
        if ($lines[$i].TrimEnd() -eq '---') { $end = $i; break }
    }
    if ($end -lt 0) { return $result }

    $result.hasFrontmatter = $true
    if ($end -le 1) { return $result }
    $fm = $lines[1..($end - 1)]
    $wanted = @('key', 'name', 'version', 'description')

    for ($i = 0; $i -lt $fm.Count; $i++) {
        $line = $fm[$i]
        # Only top-level (unindented) keys.
        $km = [regex]::Match($line, '^([A-Za-z0-9_-]+):(.*)$')
        if (-not $km.Success) { continue }
        $k = $km.Groups[1].Value
        if ($wanted -notcontains $k) { continue }
        $rest = $km.Groups[2].Value.Trim()

        $blk = [regex]::Match($rest, '^([>|])([+-]?)(\d*)\s*$')
        if ($blk.Success) {
            $indicator = $blk.Groups[1].Value
            # Collect body: subsequent blank lines or lines indented deeper than the key.
            $body = New-Object System.Collections.Generic.List[string]
            $j = $i + 1
            while ($j -lt $fm.Count) {
                $bl = $fm[$j]
                if ($bl -match '^\s*$') { $body.Add(''); $j++; continue }
                if ($bl -match '^\s+\S') { $body.Add($bl); $j++; continue }
                break
            }
            $i = $j - 1
            while ($body.Count -gt 0 -and $body[$body.Count - 1] -eq '') { $body.RemoveAt($body.Count - 1) }

            $minIndent = [int]::MaxValue
            foreach ($b in $body) {
                if ($b -ne '') {
                    $indent = [regex]::Match($b, '^\s*').Value.Length
                    if ($indent -lt $minIndent) { $minIndent = $indent }
                }
            }
            if ($minIndent -eq [int]::MaxValue) { $minIndent = 0 }

            $dedented = New-Object System.Collections.Generic.List[string]
            foreach ($b in $body) {
                if ($b.Length -ge $minIndent) { $dedented.Add($b.Substring($minIndent)) }
                else { $dedented.Add($b) }
            }

            if ($indicator -eq '|') {
                $value = ($dedented -join "`n")
            } else {
                # Folded: join consecutive non-blank lines with a space; blank line -> newline.
                $sb = New-Object System.Text.StringBuilder
                $prevBlank = $true
                foreach ($b in $dedented) {
                    if ($b -eq '') { [void]$sb.Append("`n"); $prevBlank = $true }
                    else {
                        if (-not $prevBlank) { [void]$sb.Append(' ') }
                        [void]$sb.Append($b)
                        $prevBlank = $false
                    }
                }
                $value = $sb.ToString()
            }
            $result[$k] = $value.Trim()
        } else {
            $value = $rest
            if ($value.Length -ge 2) {
                $first = $value[0]; $last = $value[$value.Length - 1]
                if (($first -eq '"' -and $last -eq '"') -or ($first -eq "'" -and $last -eq "'")) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
            }
            $result[$k] = $value
        }
    }
    return $result
}

# Safe read of a JSON property value (or $null).
function Get-JsonProp {
    param($Obj, [string]$Name)
    $p = $Obj.PSObject.Properties[$Name]
    if ($null -eq $p) { return $null }
    return $p.Value
}

function Coerce-String {
    param($Value)
    if ($null -eq $Value) { return $null }
    $s = [string]$Value
    if ($s -eq '') { return $null }
    return $s
}

# ---------------------------------------------------------------------------
# Build a single definition record from a manifest file.
# ---------------------------------------------------------------------------
function New-Definition {
    param(
        [string]$Kind,
        [string]$FullPath
    )

    $relPath = Get-RelativePath $FullPath
    $dirName = Split-Path -Leaf (Split-Path -Parent $FullPath)
    $contentHash = Get-ContentHash $FullPath

    $key = $null; $name = $null; $version = $null; $description = $null

    if ($Kind -eq 'Workflow') {
        $obj = Get-NormalizedText $FullPath | ConvertFrom-Json
        $key         = Coerce-String (Get-JsonProp $obj 'key')
        $name        = Coerce-String (Get-JsonProp $obj 'name')
        $version     = Coerce-String (Get-JsonProp $obj 'version')
        $description = Coerce-String (Get-JsonProp $obj 'description')
    } else {
        $text = Get-NormalizedText $FullPath
        $fm = ConvertFrom-Frontmatter $text
        $key         = Coerce-String $fm.key
        $name        = Coerce-String $fm.name
        $version     = Coerce-String $fm.version
        $description = Coerce-String $fm.description
        if ($null -eq $name) { $name = Coerce-String (Get-FirstH1 $text) }
    }

    if ($null -eq $key)  { $key  = $relPath }
    if ($null -eq $name) { $name = $dirName }

    return [ordered]@{
        kind        = $Kind
        key         = $key
        path        = $relPath
        name        = $name
        version     = $version
        description = $description
        contentHash = $contentHash
    }
}

# ---------------------------------------------------------------------------
# Scan the manifest tree.
# ---------------------------------------------------------------------------
$defs = New-Object System.Collections.Generic.List[object]

$agentsDir    = Join-Path $PaperclipDir 'agents'
$skillsDir    = Join-Path $PaperclipDir 'skills'
$workflowsDir = Join-Path $PaperclipDir 'workflows'

if (Test-Path -LiteralPath $agentsDir) {
    Get-ChildItem -LiteralPath $agentsDir -Recurse -File |
        Where-Object { $_.Name -eq 'AGENT.md' -or $_.Name -eq 'AGENTS.md' } |
        ForEach-Object { $defs.Add((New-Definition -Kind 'Agent' -FullPath $_.FullName)) }
}
if (Test-Path -LiteralPath $skillsDir) {
    Get-ChildItem -LiteralPath $skillsDir -Recurse -File |
        Where-Object { $_.Name -eq 'SKILL.md' } |
        ForEach-Object { $defs.Add((New-Definition -Kind 'Skill' -FullPath $_.FullName)) }
}
if (Test-Path -LiteralPath $workflowsDir) {
    Get-ChildItem -LiteralPath $workflowsDir -Recurse -File |
        Where-Object { $_.Name -eq 'WORKFLOW.json' } |
        ForEach-Object { $defs.Add((New-Definition -Kind 'Workflow' -FullPath $_.FullName)) }
}

# ---------------------------------------------------------------------------
# Deterministic ordinal sort: kind, then key.
# ---------------------------------------------------------------------------
$defs.Sort([System.Comparison[object]] {
    param($a, $b)
    $c = [string]::CompareOrdinal([string]$a.kind, [string]$b.kind)
    if ($c -ne 0) { return $c }
    return [string]::CompareOrdinal([string]$a.key, [string]$b.key)
})

# ---------------------------------------------------------------------------
# Serialize deterministically (2-space indent, raw UTF-8, trailing LF, no BOM).
# ---------------------------------------------------------------------------
$stream = New-Object System.IO.MemoryStream
$options = New-Object System.Text.Json.JsonWriterOptions
$options.Indented = $true
$options.Encoder = [System.Text.Encodings.Web.JavaScriptEncoder]::UnsafeRelaxedJsonEscaping
$writer = New-Object System.Text.Json.Utf8JsonWriter($stream, $options)

$writer.WriteStartObject()
$writer.WriteNumber('schemaVersion', [int]$SchemaVersion)
$writer.WriteStartArray('definitions')
foreach ($d in $defs) {
    $writer.WriteStartObject()
    $writer.WriteString('kind', [string]$d.kind)
    $writer.WriteString('key', [string]$d.key)
    $writer.WriteString('path', [string]$d.path)
    $writer.WriteString('name', [string]$d.name)
    if ($null -eq $d.version) { $writer.WriteNull('version') } else { $writer.WriteString('version', [string]$d.version) }
    if ($null -eq $d.description) { $writer.WriteNull('description') } else { $writer.WriteString('description', [string]$d.description) }
    $writer.WriteString('contentHash', [string]$d.contentHash)
    $writer.WriteEndObject()
}
$writer.WriteEndArray()
$writer.WriteEndObject()
$writer.Flush()

$jsonBytes = $stream.ToArray()
$writer.Dispose()
$stream.Dispose()

# Utf8JsonWriter emits CRLF for indentation on Windows; force LF so the file is LF-only
# (matching what github serves). JSON string values never contain a raw CR byte -- an
# in-string carriage return is escaped as \r (two ASCII bytes) -- so the only 0x0D bytes
# are indentation newlines and are safe to strip. Then append a single trailing LF.
$outList = New-Object System.Collections.Generic.List[byte]
$outList.AddRange((ConvertTo-LfBytes $jsonBytes))
$outList.Add(0x0A)
$newBytes = $outList.ToArray()

# ---------------------------------------------------------------------------
# Verify mode: compare bytes, do not write.
# ---------------------------------------------------------------------------
if ($Verify) {
    if (-not (Test-Path -LiteralPath $IndexPath)) {
        Write-Host "VERIFY FAILED: index not found at $IndexPath" -ForegroundColor Red
        exit 1
    }
    # Normalize the on-disk copy to LF before comparing: a Windows checkout with
    # core.autocrlf=true may smudge the committed LF index to CRLF in the working tree.
    # This keeps -Verify a content/staleness check, not a line-ending check.
    $current = ConvertTo-LfBytes ([System.IO.File]::ReadAllBytes($IndexPath))
    $same = ($current.Length -eq $newBytes.Length)
    if ($same) {
        for ($i = 0; $i -lt $current.Length; $i++) {
            if ($current[$i] -ne $newBytes[$i]) { $same = $false; break }
        }
    }
    if ($same) {
        Write-Host "VERIFY OK: $(Get-RelativePath $IndexPath) matches a fresh generation ($($defs.Count) definitions)."
        exit 0
    }

    Write-Host "VERIFY FAILED: $(Get-RelativePath $IndexPath) is stale. Run: pwsh .abs/generate-index.ps1" -ForegroundColor Red
    $minLen = [Math]::Min($current.Length, $newBytes.Length)
    $diffAt = $minLen
    for ($i = 0; $i -lt $minLen; $i++) {
        if ($current[$i] -ne $newBytes[$i]) { $diffAt = $i; break }
    }
    $ctxStart = [Math]::Max(0, $diffAt - 40)
    $curCtx = [System.Text.Encoding]::UTF8.GetString($current[$ctxStart..([Math]::Min($current.Length - 1, $diffAt + 40))])
    $newCtx = [System.Text.Encoding]::UTF8.GetString($newBytes[$ctxStart..([Math]::Min($newBytes.Length - 1, $diffAt + 40))])
    Write-Host ("  on-disk length={0}  fresh length={1}  first diff at byte {2}" -f $current.Length, $newBytes.Length, $diffAt)
    Write-Host "  on-disk: $curCtx"
    Write-Host "  fresh  : $newCtx"
    exit 1
}

# ---------------------------------------------------------------------------
# Generate mode: write the index.
# ---------------------------------------------------------------------------
[System.IO.File]::WriteAllBytes($IndexPath, $newBytes)

$agentCount    = @($defs | Where-Object { $_.kind -eq 'Agent' }).Count
$skillCount    = @($defs | Where-Object { $_.kind -eq 'Skill' }).Count
$workflowCount = @($defs | Where-Object { $_.kind -eq 'Workflow' }).Count
Write-Host "Wrote $(Get-RelativePath $IndexPath): $($defs.Count) definitions (Agents=$agentCount, Skills=$skillCount, Workflows=$workflowCount)."
