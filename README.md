[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Prisma Schema Sorter

Prisma 2 tool to sort schema models, enums, generators and datasources

> Full docs can be found here: [click here](https://omar-dulaimi.github.io/prisma-schema-sorter/index.html)

## Table of Contents

- [Installation](#installing)
- [Examples](#examples)
  - [ES Module](#es-module)
  - [CommonJS](#commonjs)

## Installation

Using npm:

```bash
$ npm install prisma-schema-sorter
```

Using yarn:

```bash
$ yarn add prisma-schema-sorter
```

## Examples

### ES Module

```ts
import { sortPrismaSchema } from 'prisma-schema-sorter';
await sortPrismaSchema('./prisma/schema.prisma');
// => Success
```

### CommonJS

```js
var sortPrismaSchema = require('prisma-schema-sorter').sortPrismaSchema;
sortPrismaSchema().then();
// => Success
```
