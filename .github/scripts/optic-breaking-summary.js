// Summarizes an `optic diff` run as Markdown for the PR opened by sync_bff_openapi.yml.
// The build regenerates the API clients from the swaggers, so it lists the changes that can break
// them: removed operations, renamed operationIds (= renamed client methods), removed / new required /
// retyped parameters and request body fields. Failed Optic checks are read from the text output,
// since `--json` doesn't include them.
// Usage: node optic-breaking-summary.js <label> <diff.json> <diff.txt>
const fs = require('fs');

const MAX_ROWS = 100;
const PROPERTY = /^\/schema(\/properties\/[^/]+)+$/;
const PROPERTY_TYPE = /^(\/schema(\/properties\/[^/]+)+)\/type$/;
const REQUIRED_PROPERTY = /^\/schema(\/properties\/[^/]+)*\/required\/\d+$/;

const [label, jsonFile, textFile] = process.argv.slice(2);
const { operations } = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
// eslint-disable-next-line no-control-regex
const text = fs.readFileSync(textFile, 'utf8').replace(/\x1b\[[0-9;]*m/g, '');

const summaryLine = (name) => (text.match(new RegExp(`${name}:.*`)) || [''])[0].trim();
const field = (key) => key.replace(/^\/schema\/properties\//, '').replace(/\/properties\//g, '.');

const rows = [];
for (const op of operations) {
  const add = (change) => rows.push(`| \`${op.name}\` | ${change} |`);
  if (op.change === 'removed') {
    add(`operation removed (\`${op.attributes[0]?.before?.operationId}\`)`);
    continue;
  }
  for (const a of op.attributes || []) {
    if (a.key === '/operationId' && a.change === 'changed') {
      add(`method renamed \`${a.before}\` → \`${a.after}\``);
    }
  }
  for (const p of op.parameters || []) {
    if (p.change === 'removed') {
      add(`${p.name} removed`);
    }
    if (p.change === 'added' && p.attributes[0]?.after?.required) {
      add(`new required ${p.name}`);
    }
    for (const a of p.attributes || []) {
      if (a.key === '/schema/type' && a.change === 'changed') {
        add(`${p.name} type \`${a.before}\` → \`${a.after}\``);
      }
      if (a.key === '/required' && a.after === true) {
        add(`${p.name} is now required`);
      }
    }
  }
  for (const ct of op.requestBody?.contentTypes || []) {
    for (const a of ct.attributes || []) {
      if (a.change === 'removed' && PROPERTY.test(a.key)) {
        add(`request body field \`${field(a.key)}\` removed`);
      }
      const retyped = a.change === 'changed' && a.key.match(PROPERTY_TYPE);
      if (retyped) {
        add(`request body field \`${field(retyped[1])}\` type \`${a.before}\` → \`${a.after}\``);
      }
      if (a.change === 'added' && REQUIRED_PROPERTY.test(a.key)) {
        add(`new required request body field \`${a.after}\``);
      }
    }
  }
}

const failedChecks = {};
for (const [, rule] of text.matchAll(/^\s*x \[([^\]]+)\]/gm)) {
  failedChecks[rule] = (failedChecks[rule] || 0) + 1;
}
const checks = Object.entries(failedChecks).sort((a, b) => b[1] - a[1]);
const breaking = rows.length > 0 || checks.length > 0;

const out = [
  `${breaking ? '⚠️' : '✅'} **${label}**: ${summaryLine('Operations')} · ${summaryLine('Checks')}`,
  '',
];
if (!breaking) {
  out.push('No breaking changes detected.', '');
}
if (rows.length) {
  out.push('| Operation | Change |', '|---|---|', ...rows.slice(0, MAX_ROWS));
  if (rows.length > MAX_ROWS) {
    out.push('', `…and ${rows.length - MAX_ROWS} more, see the workflow run.`);
  }
  out.push('');
}
if (checks.length) {
  out.push(
    'Failed Optic breaking-change checks (may include false positives on refactored schemas):',
    '',
    '| Rule | Occurrences |',
    '|---|---|',
    ...checks.map(([rule, count]) => `| ${rule} | ${count} |`),
    ''
  );
}
console.log(out.join('\n'));
