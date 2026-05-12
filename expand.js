/**
 * expand.js — Expands a Hunspell .dic file by applying .aff suffix/prefix rules.
 * Memory-efficient: processes one word at a time and streams output to disk.
 * 
 * Usage: node expand.js
 * Output: data/raw_words.txt
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DIC_FILE = path.join(__dirname, 'data', 'gl_ES.dic');
const AFF_FILE = path.join(__dirname, 'data', 'gl_ES.aff');
const OUTPUT_FILE = path.join(__dirname, 'data', 'raw_words.txt');

// ─── Parse the .aff file ────────────────────────────────────────────────────

function parseAff(affPath) {
  const content = fs.readFileSync(affPath, 'utf8');
  const lines = content.split(/\r?\n/);

  const rules = {}; // flagId -> { type: 'SFX'|'PFX', combinable, entries: [] }
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Handle SFX / PFX headers: SFX flag Y/N count
    const headerMatch = line.match(/^(SFX|PFX)\s+(\S+)\s+([YN])\s+(\d+)/);
    if (headerMatch) {
      const [, type, flag, combinable, countStr] = headerMatch;
      const count = parseInt(countStr, 10);
      const entries = [];

      for (let j = 1; j <= count; j++) {
        const entryLine = lines[i + j] ? lines[i + j].trim() : '';
        // SFX flag strip add condition [morphological]
        const m = entryLine.match(/^(?:SFX|PFX)\s+\S+\s+(\S+)\s+(\S+)\s+(\S+)/);
        if (m) {
          entries.push({ strip: m[1], add: m[2], condition: m[3] });
        }
      }

      if (!rules[flag]) {
        rules[flag] = { type, combinable: combinable === 'Y', entries };
      } else {
        // merge entries for flags defined in multiple blocks (shouldn't happen but safety)
        rules[flag].entries.push(...entries);
      }
      i += count + 1;
      continue;
    }

    i++;
  }

  return rules;
}

// ─── Apply a single rule entry to a word ────────────────────────────────────

function applyEntry(word, entry, type) {
  const { strip, add, condition } = entry;

  // Build regex from condition
  let condRegex;
  try {
    if (condition === '.') {
      condRegex = null; // always matches
    } else if (type === 'SFX') {
      condRegex = new RegExp(condition + '$');
    } else {
      condRegex = new RegExp('^' + condition);
    }
  } catch {
    return null;
  }

  if (condRegex && !condRegex.test(word)) return null;

  if (type === 'SFX') {
    // Strip suffix
    let stem = word;
    if (strip !== '0' && strip !== '') {
      if (!word.endsWith(strip)) return null;
      stem = word.slice(0, word.length - strip.length);
    }
    return stem + (add === '0' ? '' : add.split('/')[0]);
  } else {
    // PFX: Strip prefix
    let stem = word;
    if (strip !== '0' && strip !== '') {
      if (!word.startsWith(strip)) return null;
      stem = word.slice(strip.length);
    }
    return (add === '0' ? '' : add.split('/')[0]) + stem;
  }
}

// ─── Expand a single dic entry ───────────────────────────────────────────────

function expandWord(stem, flagStr, rules, combinable = true) {
  const forms = new Set();
  forms.add(stem);

  if (!flagStr) return forms;

  // Flags are separated by comma in numeric mode
  const flags = flagStr.split(',').map(f => f.trim()).filter(Boolean);

  const sfxForms = [];

  for (const flag of flags) {
    const rule = rules[flag];
    if (!rule) continue;

    const base = rule.type === 'SFX' ? stem : stem;

    for (const entry of rule.entries) {
      const form = applyEntry(base, entry, rule.type);
      if (form) {
        forms.add(form);
        if (rule.type === 'SFX' && rule.combinable) {
          sfxForms.push({ form, entry });
        }
      }
    }
  }

  // Cross-product: apply PFX rules to SFX-derived forms (combinable)
  if (combinable) {
    for (const flag of flags) {
      const rule = rules[flag];
      if (!rule || rule.type !== 'PFX' || !rule.combinable) continue;

      for (const { form } of sfxForms) {
        for (const entry of rule.entries) {
          const crossForm = applyEntry(form, entry, 'PFX');
          if (crossForm) forms.add(crossForm);
        }
      }
    }
  }

  return forms;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Parsing .aff rules...');
  const rules = parseAff(AFF_FILE);
  console.log(`Loaded ${Object.keys(rules).length} affix rules.`);

  const outStream = fs.createWriteStream(OUTPUT_FILE, { encoding: 'utf8' });

  const dicStream = fs.createReadStream(DIC_FILE, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: dicStream, crlfDelay: Infinity });

  let lineNum = 0;
  let wordCount = 0;

  for await (const line of rl) {
    lineNum++;
    if (lineNum === 1) continue; // first line is word count

    const slashIdx = line.indexOf('/');
    let stem, flagStr;

    if (slashIdx === -1) {
      stem = line.trim();
      flagStr = '';
    } else {
      stem = line.slice(0, slashIdx).trim();
      // flags may have extra content after space (morphological data)
      const rest = line.slice(slashIdx + 1).split(/\s/)[0];
      flagStr = rest;
    }

    if (!stem) continue;

    const forms = expandWord(stem, flagStr, rules);
    for (const form of forms) {
      outStream.write(form + '\n');
      wordCount++;
    }

    if (lineNum % 10000 === 0) {
      console.log(`Processed ${lineNum} stems → ${wordCount} forms so far...`);
    }
  }

  await new Promise((resolve, reject) => {
    outStream.end(err => (err ? reject(err) : resolve()));
  });

  console.log(`\nDone! ${lineNum - 1} stems expanded to ${wordCount} forms.`);
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log('\nNow run: node build.js');
}

main().catch(err => {
  console.error('Expansion failed:', err);
  process.exit(1);
});
