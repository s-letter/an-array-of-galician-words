const fs = require('fs');
const path = require('path');
const readline = require('readline');

const INPUT_FILE = path.join(__dirname, 'data', 'raw_words.txt');
const OUTPUT_FILE = path.join(__dirname, 'index.json');

// Galician character set (lowercase only):
// Base alphabet + accented vowels (á à â ã é ê è í ï ó ò ô õ ú ù û ü) + ç + ñ
// Source: TRY line in gl_ES.aff
const VALID_WORD_REGEX = /^[a-záàâãéêèíïóòôõúùûüçñ]+$/;

async function build() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Error: File not found at ${INPUT_FILE}`);
    console.error('Please run "npx hunspell-reader words -o data/raw_words.txt -s -u -l data/gl_ES.dic" first.');
    process.exit(1);
  }

  console.log('Processing raw_words.txt...');

  const wordsSet = new Set();
  let lineCount = 0;

  const fileStream = fs.createReadStream(INPUT_FILE, { encoding: 'utf8' });

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    lineCount++;
    if (lineCount % 500000 === 0) {
      console.log(`Processed ${lineCount} lines...`);
    }

    // Extract the stem (everything before the first /)
    let word = line.split('/')[0];

    if (!word) continue;

    // Unicode normalization (NFC) and lowercase
    word = word.normalize('NFC').toLowerCase();

    // Critical filter: only valid Galician alphabetic characters
    if (VALID_WORD_REGEX.test(word)) {
      wordsSet.add(word);
    }
  }

  console.log(`Done reading. Total lines processed: ${lineCount}`);
  console.log(`Unique valid words found: ${wordsSet.size}`);

  console.log('Sorting alphabetically...');
  const sortedWords = Array.from(wordsSet).sort((a, b) =>
    a.localeCompare(b, 'gl', { sensitivity: 'base' })
  );

  console.log(`Writing result to ${OUTPUT_FILE}...`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedWords, null, 2), 'utf8');

  console.log('Build complete! index.json generated successfully.');
}

build().catch(err => {
  console.error('Build failed:', err);
});
