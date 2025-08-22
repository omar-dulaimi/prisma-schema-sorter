# Prisma Schema Sorter

[![npm version](https://badge.fury.io/js/prisma-schema-sorter.svg)](https://badge.fury.io/js/prisma-schema-sorter)
[![npm](https://img.shields.io/npm/dt/prisma-schema-sorter.svg)](https://www.npmjs.com/package/prisma-schema-sorter)
[![npm](https://img.shields.io/npm/l/prisma-schema-sorter.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

A modern tool to sort Prisma schema elements alphabetically - models, enums, generators, and datasources. Keep your schema organized and maintainable.

## ✨ Features

- 🔄 **Sorts all schema elements**: Models, enums, generators, and datasources
- 🛠️ **CLI and programmatic usage**: Use it however fits your workflow
- 📦 **Zero configuration**: Works out of the box
- 🚀 **Fast and lightweight**: Built with performance in mind
- 🔧 **TypeScript support**: Fully typed for better development experience

> 📖 [Full documentation](https://omar-dulaimi.github.io/prisma-schema-sorter/index.html)


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

await sortPrismaSchema('./prisma/schema.prisma');
// => Success
```

#### CommonJS

```javascript
const { sortPrismaSchema } = require('prisma-schema-sorter');

sortPrismaSchema('./prisma/schema.prisma').then(() => {
  console.log('Schema sorted successfully!');
});
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

## 📝 License

This project is [MIT](LICENSE) licensed.
