[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Prisma Schema Sorter

Prisma 2 tool to sort schema models, enums, generators and datasources

> Full docs can be found here: [click here](https://omar-dulaimi.github.io/prisma-schema-sorter/index.html)

## Table of Contents

- [Installation](#installing)
- [Usage](#usage)
  - [Using the CLI](#using-the-cli)
  - [Programmatically](#programmatically)
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

# Usage

You can use the library in multiple ways as described below.

## 1- Using the CLI:

With the CLI, you get the same functionality but with greater flexibility. You could run the command as a one-off every now and then from the terminal like this:
<br>
<br>

```bash
$ npx prisma-schema-sorter sort --schema="./prisma/schema.prisma"
```

You could also keep the command as an npm script to run it as part of your workflow:

```js
{
    "scripts": {
      "sort-schema": "npx prisma-schema-sorter sort --schema='./prisma/schema.prisma'"
    }
}
```

Or even without the `npx` prefix:

```js
{
    "scripts": {
      "sort-schema": "prisma-schema-sorter sort --schema='./prisma/schema.prisma'"
    }
}
```

## 2- Programmatically:

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
