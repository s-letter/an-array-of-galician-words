const fs = require('fs');
const https = require('https');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const SCRIPTS_DIR = path.join(__dirname, 'scripts');

// Create directories if they don't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(SCRIPTS_DIR)) {
  fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
}

const files = [
  {
    url: 'https://raw.githubusercontent.com/LibreOffice/dictionaries/refs/heads/master/gl/gl_ES.dic',
    dest: path.join(DATA_DIR, 'gl_ES.dic')
  },
  {
    url: 'https://raw.githubusercontent.com/LibreOffice/dictionaries/refs/heads/master/gl/gl_ES.aff',
    dest: path.join(DATA_DIR, 'gl_ES.aff')
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} ...`);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        file.close();
        fs.unlink(dest, () => {});
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function setup() {
  try {
    for (const file of files) {
      if (!fs.existsSync(file.dest)) {
        await downloadFile(file.url, file.dest);
        console.log(`Downloaded ${path.basename(file.dest)} successfully.`);
      } else {
        console.log(`${path.basename(file.dest)} already exists.`);
      }
    }

    console.log('\n--- NEXT STEPS ---');
    console.log('Dictionary files downloaded. Now expand the dictionary using hunspell-reader:');
    console.log('\n  npx hunspell-reader words -o data/raw_words.txt -s -u -l data/gl_ES.dic\n');
    console.log('Once data/raw_words.txt is generated, run: node build.js');

  } catch (err) {
    console.error('Error during setup:', err);
  }
}

setup();
