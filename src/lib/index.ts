import { promises as fs } from 'fs';

import { Block, getSchema, printSchema, Schema } from '@mrleebo/prisma-ast';

import { PrismaSchemaSectionType } from '../types';

import { ascendingSorter } from './../helpers';

/**
 * Section kinds that get sorted, in the order they are written back out.
 *
 * `type` and `view` are included because a schema may contain them, and anything not collected here
 * is lost: the file is rewritten from the collected sections alone. A schema with neither produces
 * byte-identical output to before, since the order of the original four is unchanged.
 */
const SORTED_KINDS = [
  'generator',
  'datasource',
  'model',
  'type',
  'view',
  'enum',
] as const;

type SortedKind = (typeof SORTED_KINDS)[number];

const isSortedKind = (type: string): type is SortedKind =>
  (SORTED_KINDS as readonly string[]).includes(type);

/**
 * A block together with the comments written directly above it.
 *
 * The parser emits a comment as its own entry, immediately before the block it documents, so sorting
 * the blocks alone would leave every comment attached to whichever block landed in that position.
 */
type Section = PrismaSchemaSectionType & { readonly nodes: Block[] };

/**
 * Sort the prisma schema found at the given path in ascending order.
 *
 * ### Example (es module)
 * ```js
 * import { sortPrismaSchema } from 'prisma-schema-sorter'
 * await sortPrismaSchema("./prisma/schema.prisma")
 * // => Success
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * var sortPrismaSchema = require('prisma-schema-sorter').sortPrismaSchema;
 * sortPrismaSchema("./prisma/schema.prisma").then();
 * // => Success
 * ```
 * @param path - path to the prisma schema
 */
export const sortPrismaSchema = async (path: string) => {
  try {
    const schema = await fs.readFile(path, { encoding: 'utf-8' });
    const jsonSchema = getSchema(schema);
    const grouped = new Map<SortedKind, Section[]>(
      SORTED_KINDS.map((kind) => [kind, [] as Section[]]),
    );
    // Anything the parser produces that is not a known section kind. Kept rather than dropped, so a
    // schema using a feature this version predates still survives a sort.
    const unrecognised: Block[] = [];
    let pendingComments: Block[] = [];

    jsonSchema.list.forEach((section) => {
      const type = (section as Block).type;

      if (type === 'comment') {
        pendingComments.push(section as Block);
        return;
      }
      // Blank lines; printSchema puts spacing back between blocks.
      if (type === 'break') {
        return;
      }

      if (isSortedKind(type)) {
        const named = section as Block & { name: string };
        grouped.get(type)?.push({
          name: named.name,
          value: named,
          nodes: [...pendingComments, named],
        });
      } else {
        unrecognised.push(...pendingComments, section as Block);
      }
      pendingComments = [];
    });

    const sortedSections = SORTED_KINDS.flatMap((kind) => {
      const sections = grouped.get(kind) ?? [];
      sections.sort(ascendingSorter);
      return sections.flatMap((section) => section.nodes);
    });

    const sortedJsonSchema = {
      type: 'schema',
      // Trailing comments belong to no block, so they stay at the end rather than being discarded.
      list: [...sortedSections, ...unrecognised, ...pendingComments],
    } as Schema;

    const sortedSchema = printSchema(sortedJsonSchema);
    // Remove blank lines at the start and end of the file
    const trimmedSchema = sortedSchema.replace(/^\s*\n/, '').trimEnd() + '\n';
    await fs.writeFile(path, trimmedSchema);
    console.log('Success.');
  } catch (error) {
    console.log('Failed.');
    console.log(error);
  }
};
