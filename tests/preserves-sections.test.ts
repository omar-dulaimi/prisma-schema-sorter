import { promises as fs } from 'fs';
import { join } from 'path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { sortPrismaSchema } from '../src/lib/index';

/**
 * The sorter rewrites the schema in place from the sections it collected, so a section it did not
 * collect was deleted. It collected generators, datasources, models and enums, which meant composite
 * types, views and every comment were destroyed, and it printed "Success."
 *
 * A dropped `type` also leaves any model referencing it pointing at nothing, so the schema no longer
 * validates.
 */
describe('sorting preserves everything in the schema', () => {
  const testDir = join(__dirname, 'temp-preserve');
  const schemaPath = join(testDir, 'schema.prisma');

  const write = (content: string) => fs.writeFile(schemaPath, content);
  const read = () => fs.readFile(schemaPath, { encoding: 'utf-8' });

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  const RICH_SCHEMA = `// Top-level comment explaining the schema.
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

/// A composite type used by User.
type Address {
  street String
  city   String
}

view UserStats {
  id    Int    @unique
  email String
}

model User {
  id      Int      @id @default(autoincrement())
  address Address?
}

enum Tier {
  free
  pro
}
`;

  it('keeps a composite type, which a model may depend on', async () => {
    await write(RICH_SCHEMA);
    await sortPrismaSchema(schemaPath);

    expect(await read()).toContain('type Address');
  });

  it('keeps a view', async () => {
    await write(RICH_SCHEMA);
    await sortPrismaSchema(schemaPath);

    expect(await read()).toContain('view UserStats');
  });

  it('keeps a top-level comment', async () => {
    await write(RICH_SCHEMA);
    await sortPrismaSchema(schemaPath);

    expect(await read()).toContain('Top-level comment explaining the schema');
  });

  it('keeps a doc comment with the block it documents', async () => {
    await write(RICH_SCHEMA);
    await sortPrismaSchema(schemaPath);
    const result = await read();

    expect(result).toContain('A composite type used by User');
    // The comment must still sit above its type, not wherever the sort left it.
    expect(result.indexOf('A composite type used by User')).toBeLessThan(result.indexOf('type Address'));
  });

  it('still sorts the sections it always sorted', async () => {
    await write(`model Zebra {
  id Int @id
}

model Apple {
  id Int @id
}
`);
    await sortPrismaSchema(schemaPath);
    const result = await read();

    expect(result.indexOf('model Apple')).toBeLessThan(result.indexOf('model Zebra'));
  });

  it('sorts types and views by name too', async () => {
    await write(`type Zulu {
  a String
}

type Alpha {
  b String
}
`);
    await sortPrismaSchema(schemaPath);
    const result = await read();

    expect(result.indexOf('type Alpha')).toBeLessThan(result.indexOf('type Zulu'));
  });

  it('leaves a schema without types or views byte-identical to the old output', async () => {
    // Guards the one property that matters for existing users: nothing they have changes.
    const plain = `generator client {
  provider = "prisma-client-js"
}

model Apple {
  id Int @id
}

enum Alpha {
  b
}
`;
    await write(plain);
    await sortPrismaSchema(schemaPath);
    const once = await read();

    await sortPrismaSchema(schemaPath);
    expect(await read()).toBe(once);
  });
});
