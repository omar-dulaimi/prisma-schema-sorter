# Prisma Schema Sorter

[![npm version](https://badge.fury.io/js/prisma-schema-sorter.svg)](https://badge.fury.io/js/prisma-schema-sorter)
[![npm](https://img.shields.io/npm/dt/prisma-schema-sorter.svg)](https://www.npmjs.com/package/prisma-schema-sorter)
[![npm](https://img.shields.io/npm/l/prisma-schema-sorter.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%5E20.19.0%20%7C%7C%20%5E22.12.0%20%7C%7C%20%3E%3D23-brightgreen)](https://nodejs.org/)

A modern tool to sort Prisma schema elements alphabetically - models, enums, generators, and datasources. Keep your schema organized and maintainable.

## ✨ Features

- 🔄 **Sorts all schema elements**: Models, enums, generators, and datasources
- 🛠️ **CLI and programmatic usage**: Use it however fits your workflow
- 📦 **Zero configuration**: Works out of the box
- 🚀 **Fast and lightweight**: Built with performance in mind
- 🔧 **TypeScript support**: Fully typed for better development experience

> 📖 [Full documentation](https://omar-dulaimi.github.io/prisma-schema-sorter/index.html)


## ✅ Requirements

Node `^20.19.0 || ^22.12.0 || >=23`.

Those are exact lower bounds, not a rounded-down `>=20`. The published `main` build is CommonJS and
two of its dependencies are ESM-only, so it needs a Node version where `require()` of an ES module
works without a flag. That landed in 20.19.0 and 22.12.0. On anything older, including all of Node
18 and Node 20.0 through 20.18, the CLI cannot start and exits with `ERR_REQUIRE_ESM`.

## 📦 Installation

```bash
npm install prisma-schema-sorter
```

```bash
yarn add prisma-schema-sorter
```

```bash
pnpm add prisma-schema-sorter
```

## 🚀 Usage

### CLI Usage

Run as a one-time command:

```bash
npx prisma-schema-sorter sort --schema="./prisma/schema.prisma"
```

Add to your package.json scripts:

```json
{
  "scripts": {
    "sort-schema": "prisma-schema-sorter sort --schema='./prisma/schema.prisma'"
  }
}
```

Then run with:

```bash
npm run sort-schema
```

### Programmatic Usage

#### ES Modules / TypeScript

```typescript
import { sortPrismaSchema } from 'prisma-schema-sorter';

// Resolves once the schema has been rewritten. Throws if it cannot be read, parsed or written,
// so failures are yours to handle rather than being logged and swallowed.
await sortPrismaSchema('./prisma/schema.prisma');
```

#### CommonJS

```javascript
const { sortPrismaSchema } = require('prisma-schema-sorter');

sortPrismaSchema('./prisma/schema.prisma')
  .then(() => {
    console.log('Schema sorted successfully!');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
```

### Exit codes

The CLI exits `0` only when the schema was actually sorted. Anything else, whether an unreadable
schema, an unknown command or a misspelled option, prints `Failed.` and exits `1`, so a package.json
script or a CI step can rely on the status.

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

## 📝 License

This project is [MIT](LICENSE) licensed.
