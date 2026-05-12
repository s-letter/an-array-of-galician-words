# an-array-of-galician-words

[English](./README.md) · [Galego](./README.gl.md)

[![NPM version](https://img.shields.io/npm/v/an-array-of-galician-words.svg)](https://www.npmjs.com/package/an-array-of-galician-words)

List of ~687,000 Galician words.

Derived from the [LibreOffice Galician Hunspell dictionary](https://github.com/LibreOffice/dictionaries/tree/master/gl)
(`gl_ES`), processed and filtered to include only clean alphabetic words using the Galician character set
(`[a-záàâãéêèíïóòôõúùûüçñ]`).

Inspired by the architecture of [`an-array-of-english-words`](https://github.com/words/an-array-of-english-words)
by [Titus Wormer](https://github.com/wooorm).

## Install

```sh
npm install an-array-of-galician-words
```

## Use

```js
const words = require('an-array-of-galician-words')

console.log(words.length)     // ~687000
console.log(words.slice(0, 5))
// [ 'a', 'abáboro', 'abacá', 'abacéla', 'abade' ]

console.log(words.filter(w => w.startsWith('gal')))
// [ 'gala', 'galano', 'galego', ... ]
```

## API

The default export is a `string[]` of Galician words.

### TypeScript

Types are included:

```ts
import words = require('an-array-of-galician-words')

const filtered: string[] = words.filter(w => w.length === 5)
```

## Dataset

- **Source**: [LibreOffice dictionaries — gl](https://github.com/LibreOffice/dictionaries/tree/master/gl)
- **License**: GPL-2.0-or-later OR LGPL-2.1-or-later OR MPL-1.1
- **Filter**: Only characters matching `/^[a-záàâãéêèíïóòôõúùûüçñ]+$/`

## Build

To regenerate `index.json` from source:

```sh
node setup.js    # Download gl_ES.dic and gl_ES.aff
node expand.js   # Expand dictionary (memory-efficient, no external tools needed)
node build.js    # Clean, filter and generate index.json
```

## Credits

- **Linguistic data**: [LibreOffice dictionaries](https://github.com/LibreOffice/dictionaries/tree/master/gl)
- **Architectural pattern**: [Titus Wormer (@wooorm)](https://github.com/wooorm) — [`an-array-of-english-words`](https://github.com/words/an-array-of-english-words)

## License

(GPL-2.0-or-later OR LGPL-2.1-or-later OR MPL-1.1) © Pablo G. Guízar
