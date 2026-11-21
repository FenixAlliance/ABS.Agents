// Regenerates every absuite-*-cli/SKILL.md from the CLI's own `absuite commands -o json`.
// Usage: absuite commands -o json > commands.json; node .abs/generate-cli-skills.mjs commands.json skills skills <platformSha>
// then node .abs/check-cli-skills.mjs commands.json skills (exit 0 = every cited command and option exists).
// Writes only under <outDir> (pass skills twice to update in place). Keeps the owners' sections that cite no command and no flag.
import fs from "node:fs"; import path from "node:path";
const [cmdJson, skillsDir, outDir, cliSha] = process.argv.slice(2);
if (!cliSha) { console.error("usage: generate-cli-skills.mjs <commands.json> <skillsDir> <outDir> <cliSha>"); process.exit(2); }
const all = JSON.parse(fs.readFileSync(cmdJson, "utf8")).commands;
const byPath = new Map(all.map(c => [c.path, c]));
const norm = r => r.replace(/\{[^}]+\}/g, "{}").replace(/\/+$/, "").toLowerCase();
const routeOf = c => { const m = c.description.match(/(?:sends|reads) (GET|POST|PUT|PATCH|DELETE) (\/api\/[^\s;,)]+?)(?=[.;,)]?(?:\s|$))/i); return m ? { verb: m[1], route: m[2] } : null; };
const byRoute = new Map();
for (const c of all) { const r = routeOf(c); if (r) (byRoute.get(norm(r.route)) ?? byRoute.set(norm(r.route), []).get(norm(r.route))).push(c.path); }

const SESSION = /^(login|logout|me|account|config|interactive|completion|commands)( |$)|^tenants (list|use)$/;
// Skills whose area the CLI leaves out on purpose or cannot reach yet, with the reason the CLI's own catalog gives.
const NOT_IN_CLI = {
  "absuite-security-cli": "The CLI leaves the Security service out on purpose: security, OAuth, webhooks and security logs stay with Studio and the REST API (GenericCommandCatalog.ExcludedClients and ExcludedServices).",
  "absuite-system-cli": "The CLI leaves the System service out on purpose: it is an operator surface (GenericCommandCatalog.ExcludedClients and ExcludedServices).",
  "absuite-identity-cli": "The CLI's only identity commands are its own sign-in ones (login, logout, me, account). OAuth clients, applications and tokens are left out on purpose (AuthServiceClient, ApplicationPrincipalsServiceClient and the token and secret route terms are excluded).",
  "absuite-cart-cli": "The CLI has no cart commands yet: CartServiceClient's calls are not workspace-scoped, and this CLI's generic commands take exactly one workspace (TenantId).",
  "absuite-globe-cli": "The CLI has no globe commands yet: GlobeServiceClient's calls are not workspace-scoped, and this CLI's generic commands take exactly one workspace (TenantId).",
  "absuite-forex-cli": "The CLI has no forex commands yet: ForexServiceClient cannot be built by the CLI (it has no IApiClientService constructor).",
  "absuite-users-cli": "The CLI's only user command is `absuite me`. UsersServiceClient's calls are not workspace-scoped, and this CLI's generic commands take exactly one workspace (TenantId).",
  "absuite-onboarding-cli": "The CLI has no onboarding commands. Sign-in and the workspace choice are covered below; the onboarding flow itself runs in Studio or over the REST API.",
};
// The platform installs only manifests that declare this apiVersion and their kind (DefinitionManifestParser).
const MANIFEST_API_VERSION = "apiVersion: abs.fenixalliance.com/v1alpha1";
const DROP_HEADINGS = /^(prerequisites|command structure|cli commands quick reference|quick reference|end-to-end workflow|api usage essentials|authentication|output|global options|common flags)/i;

const titleCase = s => s.replace(/(^|-)([a-z])/g, (_, a, b) => (a ? " " : "") + b.toUpperCase());
const esc = s => String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
const shortDesc = c => c.description
  .replace(/ Field flags are listed under Options; --json or --file takes the same fields\./, "")
  .replace(/,? ?(then )?(sends|reads) (GET|POST|PUT|PATCH|DELETE) \/api\/\S+?(?=[.;]?(\s|$))[.;]?/i, ".")
  .replace(/: reads it, applies --json\/--file and the field flags\./, ": reads it, applies --json/--file and the field flags, then saves it.")
  .replace(/\.\.\s+asks first/, "; it asks first").replace(/\.\./g, ".")
  .replace(/\s+/g, " ").trim();
const STOCK = new Set(["--columns", "--top", "--skip", "--json", "--file", "--dry-run", "--yes"]);
const optCell = c => c.options.filter(o => !STOCK.has(o.name)).map(o => "`" + o.name + "`" + (o.required ? " (required)" : "")).join(", ");
const stock = c => c.options.filter(o => STOCK.has(o.name)).map(o => o.name).join(" ");

function parseSkill(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fm = m ? m[1] : ""; const body = m ? text.slice(m[0].length) : text;
  const get = k => (fm.match(new RegExp("^" + k + ":\\s*(.*)$", "m")) || [])[1]?.trim();
  const sections = []; let cur = null;
  for (const line of body.split(/\r?\n/)) {
    if (/^## /.test(line)) { cur = { heading: line.slice(3).trim(), lines: [] }; sections.push(cur); }
    else if (cur) cur.lines.push(line);
  }
  return { name: get("name"), key: get("key"), version: get("version"), sections };
}
const bumpMinor = v => { const [a, b] = (v || "1.0.0").split(".").map(Number); return `${a}.${b + 1}.0`; };
const citesCli = s => /\babsuite\s+[A-Za-z]/.test(s) || /--[A-Z]/.test(s) || /list-commands/.test(s) || /ABSUITE_[A-Z]/.test(s);
const KEEP_HEADINGS = /^(key concepts|enums|enumerations|notes)/i;

function commandsFor(skill) {
  const twin = path.join(skillsDir, skill.replace(/-cli$/, ""), "SKILL.md");
  if (!fs.existsSync(twin)) return { twinRoutes: 0, missing: [], paths: [] };
  const t = fs.readFileSync(twin, "utf8");
  const routes = [...new Set([...t.matchAll(/\/api\/v2\/[A-Za-z0-9_\-\/{}]+/g)].map(m => norm(m[0])))];
  const hit = new Set(); const missing = [];
  for (const r of routes) { const p = byRoute.get(r); if (p) p.forEach(x => hit.add(x)); else missing.push(r); }
  // Hand-written commands carry no route: take every command of a resource one of whose routes matched.
  const resources = new Set([...hit].map(p => p.split(" ").slice(0, 2).join(" ")).filter(r => r.includes(" ")));
  for (const c of all) { const w = c.path.split(" "); if (w.length > 2 && resources.has(w.slice(0, 2).join(" "))) hit.add(c.path); }
  const firsts = new Set([...hit].map(p => p.split(" ")[0]));
  for (const c of all) { const w = c.path.split(" "); if (w.length === 2 && !routeOf(c) && firsts.has(w[0])) hit.add(c.path); }
  for (const p of [...hit]) if (SESSION.test(p)) hit.delete(p);
  return { twinRoutes: routes.length, missing, paths: [...hit].sort() };
}

function essentials(twinName) {
  return [
    "## Before you start",
    "",
    "- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.",
    "- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.",
    "- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.",
    "- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.",
    "- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.",
    "- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query \"<JMESPath>\"` filters the result before it is printed.",
    "- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.",
    "- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill." + (twinName ? ` Anything not listed here: the \`${twinName}\` REST skill.` : ""),
    "",
  ].join("\n");
}

const VERB_ORDER = ["list", "count", "get", "show", "extended", "create", "update", "delete"];
function commandSection(paths) {
  const groups = new Map();
  for (const p of paths) { const w = p.split(" "); const key = w.length > 2 ? w.slice(0, 2).join(" ") : w[0]; (groups.get(key) ?? groups.set(key, []).get(key)).push(byPath.get(p)); }
  const out = ["## Commands", "", `${paths.length} commands, from \`absuite commands -o json\`. "Reads" commands never change data. Writes take field flags or \`--json\`/\`--file\` with the same fields, and \`--dry-run\` prints the request without sending it. Deletes ask first unless \`--yes\` (with \`--no-input\` and no \`--yes\`, a delete fails with exit 2).`, ""];
  for (const [g, cs] of [...groups].sort()) {
    cs.sort((a, b) => { const va = VERB_ORDER.indexOf(a.path.split(" ").pop()), vb = VERB_ORDER.indexOf(b.path.split(" ").pop()); return a.path.split(" ").length - b.path.split(" ").length || (va < 0 ? 99 : va) - (vb < 0 ? 99 : vb) || a.path.localeCompare(b.path); });
    out.push(`### ${titleCase(g.split(" ").pop())} (\`absuite ${g}\`)`, "", "| Command | Kind | Arguments | Options | What it does |", "|---|---|---|---|---|");
    for (const c of cs) {
      const r = routeOf(c);
      const what = esc(shortDesc(c)) + (r ? ` \`${r.verb} ${r.route}\`` : "");
      const args = c.arguments.map(a => "`<" + a.name + ">`").join(" ");
      const opts = [optCell(c), stock(c) ? "`" + stock(c).split(" ").join("` `") + "`" : ""].filter(Boolean).join("; ");
      out.push(`| \`absuite ${c.path}\` | ${c.readOnly ? "Reads" : "Writes"} | ${args} | ${opts} | ${what} |`);
    }
    out.push("");
  }
  return out.join("\n");
}

function example(paths) {
  const list = paths.map(p => byPath.get(p)).find(c => / list$/.test(c.path) && !c.options.some(o => o.required));
  const create = paths.map(p => byPath.get(p)).find(c => / create$/.test(c.path) && !c.options.some(o => o.required));
  if (!list && !create) return "";
  const lines = ["## Example", "", "```bash"];
  if (list) lines.push(`absuite ${list.path}${list.options.some(o => o.name === "--top") ? " --top 5" : ""} -o json --query "[].id"`);
  if (create) {
    const flags = create.options.filter(o => !STOCK.has(o.name)).slice(0, 2).map(o => `${o.name} <value>`).join(" ");
    lines.push(`absuite ${create.path} ${flags} --dry-run   # prints the POST, sends nothing`, `absuite ${create.path} ${flags} -o json --no-input`);
  }
  lines.push("```", "");
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });
const summary = [];
// absuite-login-cli and absuite-cli are written whole further down.
for (const d of fs.readdirSync(skillsDir).filter(d => /^absuite-.+-cli$/.test(d) && d !== "absuite-login-cli").sort()) {
  const src = fs.readFileSync(path.join(skillsDir, d, "SKILL.md"), "utf8");
  const s = parseSkill(src);
  const area = d.replace(/^absuite-/, "").replace(/-cli$/, "");
  const twinName = fs.existsSync(path.join(skillsDir, `absuite-${area}`, "SKILL.md")) ? `absuite-${area}` : null;
  const { twinRoutes, missing, paths } = commandsFor(d);
  const version = bumpMinor(s.version);
  const kept = s.sections.filter(x => KEEP_HEADINGS.test(x.heading) && !DROP_HEADINGS.test(x.heading) && !citesCli(x.heading + "\n" + x.lines.join("\n")));
  const reads = paths.filter(p => byPath.get(p).readOnly).length;
  const groupsTxt = [...new Set(paths.map(p => p.split(" ")[0]))].map(g => "`absuite " + g + "`").join(", ");
  const why = NOT_IN_CLI[d];
  const desc = why && paths.length === 0
    ? `How the ${titleCase(area)} area relates to the absuite CLI: the CLI has no ${area} commands today, so this skill says what the CLI does cover and points to the ${twinName ?? "REST"} skill for the rest.`
    : `Drive the Alliance Business Suite (ABS) ${titleCase(area)} area with the absuite CLI: ${paths.length} commands (${reads} read, ${paths.length - reads} write) under ${groupsTxt}, each generated from the platform's ServiceClients and checked against \`absuite commands -o json\`.${twinName ? ` For routes the CLI does not cover, use the ${twinName} REST skill.` : ""}`;
  const fm = ["---", MANIFEST_API_VERSION, "kind: Skill", `name: ${s.name}`, `key: ${s.key}`, `version: ${version}`, "description: >", ...desc.match(/.{1,100}(\s|$)/g).map(l => "  " + l.trim()), "---", ""].join("\n");
  const head = [`# Alliance Business Suite — ${titleCase(area)} Skill (CLI)`, "",
    `Generated from the absuite CLI at Platform ${cliSha} (\`absuite commands -o json\`). The commands, arguments and options below are the CLI's own; re-run \`absuite commands -o json\` before relying on one.`, ""];
  if (why) head.push("> **Not in the CLI:** " + why + (twinName ? ` Use the \`${twinName}\` REST skill for this area.` : ""), "");
  else if (missing.length) head.push(`> **Coverage:** ${twinName ? `the \`${twinName}\` REST skill documents ${twinRoutes} routes; ` : ""}${missing.length} of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.`, "");
  const body = [fm, head.join("\n"), essentials(twinName), paths.length ? commandSection(paths) : "", paths.length ? example(paths) : "",
    ...kept.map(x => ["## " + x.heading, ...x.lines].join("\n").replace(/\s+$/, "") + "\n")].filter(Boolean).join("\n");
  fs.mkdirSync(path.join(outDir, d), { recursive: true });
  fs.writeFileSync(path.join(outDir, d, "SKILL.md"), body.replace(/\n{3,}/g, "\n\n").replace(/\n*$/, "\n"));
  summary.push(`${d}\t${s.version}->${version}\tcmds ${paths.length}\tkept ${kept.map(x => x.heading).join("; ")}`);
}
if (path.resolve(outDir) !== path.resolve(skillsDir)) fs.writeFileSync(path.join(outDir, "summary.tsv"), summary.join("\n") + "\n");
console.log(summary.join("\n"));

// ---- The hub (absuite-cli) and the sign-in skill (absuite-login-cli): written whole, from the same JSON.
function rules() {
  return [
    "## Output and queries", "",
    "- `-o table` (the default; `human` also works), `json`, `jsonc`, `tsv`, `yaml` or `none`. `ABS_OUTPUT` sets the default.",
    "- `--query \"<JMESPath>\"` is applied to the result before it is printed, in every format: `absuite crm contacts list -o json --query \"[].name\"`. A bad expression is a usage error (exit 2).",
    "- `--columns a,b,c` picks the fields of the human table. `--only-show-errors` hides warnings and notices; `--verbose` says what the command runs with; `--debug` traces each HTTP call (method, address without its query, status, time; never headers, tokens or bodies).",
    "- Errors always print on standard error, whatever `-o` or `--only-show-errors` say. With `-o json` or `-o jsonc` they are one JSON document: `{\"error\":{\"message\",\"code\",\"correlation\",\"validation\",\"exitCode\"}}`. The API's error code and correlation id are always shown; quote them to support.", "",
    "## Exit codes", "",
    "Scripts can rely on these: a number never changes meaning.", "",
    "| Code | Meaning |", "|---|---|",
    "| 0 | Done. |",
    "| 1 | The API refused or failed the request for a reason no narrower code describes (a validation error, a feature that is off, an unexpected failure). |",
    "| 2 | A bad flag, argument, `--query` expression or configuration value; or input was needed under `--no-input`. |",
    "| 3 | Not signed in, or the session expired and could not be refreshed. |",
    "| 4 | No OS-protected credential store on this computer, so the session could not be kept (it is never kept in plain text). |",
    "| 5 | The record does not exist in this workspace. |",
    "| 6 | Signed in, but not allowed to do this (403). |",
    "| 7 | The server failed (5xx). |",
    "| 8 | The server could not be reached, or did not answer in time. |", "",
    "## Agents: run tokens", "",
    "An agent on its own computer uses its run token instead of `absuite login`:", "",
    "- Set `ABS_TOKEN` (the token) or `ABS_TOKEN_FILE` (an absolute path to a file holding only the token; read fresh on every command, so rotation needs no restart). Set one, never both: both is a usage error.",
    "- The token is used only with `--url` or `ABS_URL`; otherwise the CLI says it is ignored. It is never sent over plain http:// except to a server on the same computer (localhost, 127.0.0.1 or ::1).",
    "- The token says who the agent is; the workspace's roles decide what it may do (CEO ruling, 2026-11-10). A read passes the run-token check; the workspace's roles still decide what it can see. A write meets the same permission checks as a person's, and a governed capability goes to Approvals, whose answer is returned as-is.",
    "- Refusals a run token can meet, with the API code shown in the error: `trust.agent_api.unbound_run` (the token names no run or workspace), `trust.agent_api.unpermissioned_write` (a write whose use case names no permission and no role, the one write roles cannot govern), `trust.agent_api.gate_unavailable` (the check could not decide, so it refused). They end with exit 6 or 1. `trust.agent_api.unclassified_write` is no longer returned; older audit rows may still show it.",
    "- Always pass `--no-input` and `-o json`, and act on the exit code, not on the text.", "",
  ].join("\n");
}
function sessionTable(paths) {
  const out = ["| Command | Kind | Arguments | Options | What it does |", "|---|---|---|---|---|"];
  for (const p of paths) { const c = byPath.get(p); if (!c) continue;
    out.push(`| \`absuite ${c.path}\` | ${c.readOnly ? "Reads" : "Writes"} | ${c.arguments.map(a => "`<" + a.name + ">`").join(" ")} | ${c.options.map(o => "`" + o.name + "`").join(", ")} | ${esc(c.description)} |`); }
  return out.join("\n") + "\n";
}
const SESSION_PATHS = all.map(c => c.path).filter(p => /^(login|logout|me|account( |$)|tenants (list|use)$)/.test(p));
const CONFIG_PATHS = all.map(c => c.path).filter(p => /^(config|interactive|completion|commands)( |$)/.test(p));
function writeWhole(dir, desc, title, bodyParts) {
  const src = parseSkill(fs.readFileSync(path.join(skillsDir, dir, "SKILL.md"), "utf8"));
  const fm = ["---", MANIFEST_API_VERSION, "kind: Skill", `name: ${src.name}`, `key: ${src.key}`, `version: ${bumpMinor(src.version)}`, "description: >", ...desc.match(/.{1,100}(\s|$)/g).map(l => "  " + l.trim()), "---", ""].join("\n");
  const text = [fm, `# ${title}`, "", `Generated from the absuite CLI at Platform ${cliSha} (\`absuite commands -o json\` and \`absuite --help\`). Re-run \`absuite commands -o json\` before relying on a command.`, "", ...bodyParts].join("\n");
  fs.mkdirSync(path.join(outDir, dir), { recursive: true });
  fs.writeFileSync(path.join(outDir, dir, "SKILL.md"), text.replace(/\n{3,}/g, "\n\n").replace(/\n*$/, "\n"));
  console.log(`${dir}\t${src.version}->${bumpMinor(src.version)}\twhole`);
}
const install = ["## Install", "", "`npm install -g @fenixalliance/absuite` installs a self-contained binary for your platform. `absuite --version` prints its version; `absuite --help` lists the commands.", ""].join("\n");
writeWhole("absuite-login-cli",
  "Sign in to the Alliance Business Suite (ABS) with the absuite CLI: device-code login (the default), password login for a server on this computer, run tokens for agents, the workspace choice, sign-out, and the exit codes a script acts on.",
  "Alliance Business Suite — Sign-in Skill (CLI)",
  [install,
   "## Sign in", "",
   "- `absuite login --url https://<server>` opens a one-time code sign-in in your browser (`--device`, the default). `--timeout <seconds>` stops waiting (1 to 3600).",
   "- `--with-password` signs in with email and password, on servers that allow it; prefer the device flow. `--email` names the account; `--password-stdin` reads the password from standard input, for scripts, and only for a server on this computer (localhost).",
   "- The session is kept in the OS-protected credential store, never in plain text; without one, the command ends with exit 4. Sessions are per profile; `--profile <name>` or `ABS_PROFILE` picks the profile.",
   "- Then `absuite me` shows who you are, and `absuite account show` the profile, server and workspace.", "",
   "## Choose the workspace", "",
   "Every service command acts in one workspace (tenant). `absuite account list` lists yours; `absuite account set --tenant <id|name>` (or `absuite tenants use <id|name>`) saves one in the profile; `absuite account clear` forgets it. `--tenant <id>` or `ABS_TENANT` overrides it for one command.", "",
   "## Commands", "", sessionTable(SESSION_PATHS),
   "## Sign out", "", "`absuite logout` revokes the session on the server and removes it from this computer; `--all` does so for every profile and server.", "",
   rules()]);
const groupCounts = new Map(); for (const c of all) { const g = c.path.split(" ")[0]; groupCounts.set(g, (groupCounts.get(g) ?? 0) + 1); }
const svc = [...groupCounts].filter(([g]) => !/^(login|logout|me|account|config|interactive|completion|commands)$/.test(g)).sort();
writeWhole("absuite-cli",
  "The absuite command line for the Alliance Business Suite (ABS): install, sign in, pick a workspace, find commands, shape output with -o and JMESPath --query, read exit codes, and run as an agent with a run token. Start here; each area has its own absuite-<area>-cli skill.",
  "Alliance Business Suite — absuite CLI",
  [install,
   "## Shape of a command", "",
   "`absuite <service> <resource> <verb> [arguments] [options]`, for example `absuite crm contacts list --top 10`. The service is the API's own `api/v2/<X>Service` name, so the CLI never invents a name the API does not have. Verbs: `list`, `count`, `get`, `show`, `create`, `update`, `delete`, and a few named ones.", "",
   "- `absuite commands -o json` lists every command (" + all.length + " in this build) with its arguments, options and whether it only reads. Agents should read it rather than guess.",
   "- `absuite <command> --help` shows one command. `absuite interactive` starts a session with Tab completion and history (a terminal only; `--plain` for screen readers). `absuite completion <bash|pwsh|zsh>` prints a shell completion script.",
   "- Writes take field flags or `--json '{...}'` / `--file <path>` with the same fields (flags win). `--dry-run` prints the request and sends nothing. `update` reads the record, applies your fields, then saves it whole. `delete` asks first unless `--yes`.",
   "- The CLI has no PATCH. Bulk, destructive and identity-bending operations, secrets, tokens, settings, and the Security, System, Trust and Licensing services are left out on purpose; use Studio or the REST skills for those.", "",
   "## Services", "", "| Service | Commands |", "|---|---|", ...svc.map(([g, n]) => `| \`absuite ${g}\` | ${n} |`), "",
   "## Sign-in, workspace and settings", "", sessionTable([...SESSION_PATHS, ...CONFIG_PATHS]),
   "Settings: `--profile`, `--url` and `--tenant` on any command, or `ABS_PROFILE`, `ABS_URL`, `ABS_TENANT`, `ABS_OUTPUT`. `absuite config list` shows each setting and where it comes from. No secret is ever stored in the settings.", "",
   rules()]);
