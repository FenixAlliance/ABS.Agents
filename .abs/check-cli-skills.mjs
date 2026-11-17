// Gate: every `absuite <path>` cited is a real command or group, and every --flag on that line is an option of that
// command, a global option, or (for a group) of some command under it. Usage: node .abs/check-cli-skills.mjs <commands.json> <dir>
import fs from "node:fs"; import path from "node:path";
const [cmdJson, dir] = process.argv.slice(2);
const j = JSON.parse(fs.readFileSync(cmdJson, "utf8"));
const byPath = new Map(j.commands.map(c => [c.path, c]));
const globals = new Set(j.globalOptions.flatMap(o => [o.name, ...o.aliases]));
const prefixes = new Set(); for (const p of byPath.keys()) { const w = p.split(" "); for (let i = 1; i <= w.length; i++) prefixes.add(w.slice(0, i).join(" ")); }
let badCmd = 0, badOpt = 0, cited = 0; const report = [];
for (const d of fs.readdirSync(dir).filter(d => /^absuite(-.+)?-cli$/.test(d) && fs.existsSync(path.join(dir, d, "SKILL.md"))).sort()) {
  const lines = fs.readFileSync(path.join(dir, d, "SKILL.md"), "utf8").split("\n");
  let fence = false;
  for (const [i, raw] of lines.entries()) {
    if (/^\s*```/.test(raw)) { fence = !fence; continue; }
    // Only code is checked: a fenced block line whole, else each inline `code` span.
    const spans = fence ? [raw] : [...raw.matchAll(/`([^`]+)`/g)].map(x => x[1]);
    for (const line of spans)
    for (const m of line.matchAll(/(?:^|[\s(])absuite(?=\s|$)((?:\s+[A-Za-z<][A-Za-z0-9|<>-]*)*)([^|]*)/g)) {
      const words = m[1].trim().split(/\s+/).filter(w => w && !w.startsWith("<"));
      if (words.length === 0) { for (const f of m[2].matchAll(/(?:^|\s)(--?[A-Za-z][A-Za-z0-9-]*)/g)) if (!globals.has(f[1]) && f[1] !== "--version") { badOpt++; report.push(`${d}:${i + 1} unknown root option ${f[1]}`); } continue; }
      let k = 0; for (let n = words.length; n >= 1; n--) if (prefixes.has(words.slice(0, n).join(" "))) { k = n; break; }
      if (k === 0) { if (/^(CLI|command|commands?)$/i.test(words[0])) continue; badCmd++; report.push(`${d}:${i + 1} no command: absuite ${words.join(" ")}`); continue; }
      cited++;
      const p = words.slice(0, k).join(" "); const c = byPath.get(p);
      const allowed = new Set(globals);
      if (c) c.options.forEach(o => { allowed.add(o.name); o.aliases.forEach(a => allowed.add(a)); });
      else for (const [q, x] of byPath) if (q.startsWith(p + " ")) x.options.forEach(o => allowed.add(o.name));
      const tail = (m[1] + m[2]);
      for (const f of tail.matchAll(/(?:^|\s)(--?[A-Za-z][A-Za-z0-9-]*)/g)) if (!allowed.has(f[1])) { badOpt++; report.push(`${d}:${i + 1} unknown option ${f[1]} for absuite ${p}`); }
    }
  }
}
console.log(`cited ${cited}, not a command ${badCmd}, unknown options ${badOpt}`); console.log(report.slice(0, 40).join("\n"));
process.exit(badCmd || badOpt ? 1 : 0);
