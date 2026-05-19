# an-array-of-galician-words

[English](./README.md) · [Galego](./README.gl.md)

[![Versión NPM](https://img.shields.io/npm/v/an-array-of-galician-words.svg)](https://www.npmjs.com/package/an-array-of-galician-words)

Lista de ~687.000 palabras en galego.

Derivada do [dicionario Hunspell galego de LibreOffice](https://github.com/LibreOffice/dictionaries/tree/master/gl)
(`gl_ES`), procesada e filtrada para incluír só palabras alfabéticas limpas co conxunto de caracteres galego
(`[a-záàâãéêèíïóòôõúùûüçñ]`).

Inspirada na arquitectura de [`an-array-of-english-words`](https://github.com/words/an-array-of-english-words)
de [Zeke Sikelianos](https://github.com/zeke).

## Instalación

```sh
npm install an-array-of-galician-words
```

## Uso

```js
const words = require('an-array-of-galician-words')

console.log(words.length)     // ~687000
console.log(words.slice(0, 5))
// [ 'a', 'abáboro', 'abacá', 'abacéla', 'abade' ]

console.log(words.filter(w => w.startsWith('gal')))
// [ 'gala', 'galano', 'galego', ... ]
```

## API

A exportación por defecto é un `string[]` de palabras en galego.

### TypeScript

Os tipos están incluídos:

```ts
import words = require('an-array-of-galician-words')

const filtered: string[] = words.filter(w => w.length === 5)
```

## Conxunto de datos

- **Fonte**: [LibreOffice dictionaries — gl](https://github.com/LibreOffice/dictionaries/tree/master/gl)
- **Licenza**: GPL-2.0-or-later OR LGPL-2.1-or-later OR MPL-1.1
- **Filtro**: Só caracteres que coinciden con `/^[a-záàâãéêèíïóòôõúùûüçñ]+$/`

## Construción

Para rexenerar `index.json` dende a fonte:

```sh
node setup.js    # Descarga gl_ES.dic e gl_ES.aff
node expand.js   # Expande o dicionario (eficiente en memoria, sen ferramentas externas)
node build.js    # Limpa, filtra e xera index.json
```

## Créditos

- **Datos lingüísticos**: [LibreOffice dictionaries](https://github.com/LibreOffice/dictionaries/tree/master/gl)
- **Patrón arquitectónico**: [Zeke Sikelianos (@zeke)](https://github.com/zeke) — [`an-array-of-english-words`](https://github.com/words/an-array-of-english-words)

## Licenza

(GPL-2.0-or-later OR LGPL-2.1-or-later OR MPL-1.1) © Pablo G. Guízar
