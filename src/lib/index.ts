import { promises as fs } from 'fs';

import { getSchema, printSchema, Schema } from '@mrleebo/prisma-ast';

import { PrismaSchemaSectionType } from '../types';

import { ascendingSorter } from './../helpers';

/**
 * Sort the prisma schema found at the given path in ascending order.
 *
 * ### Example (es module)
 * ```js
 * import { sortPrismaSchema } from 'prisma-schema-sorter'
 * await sortPrismaSchema("./schema.prisma")
 * // => Success
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * var sortPrismaSchema = require('prisma-schema-sorter').sortPrismaSchema;
 * sortPrismaSchema("./schema.prisma").then();
 * // => Success
 * ```
 * @param path - path to the prisma schema
 */
export const sortPrismaSchema = async (path: string) => {
  try {
    const schema = await fs.readFile(path, { encoding: 'utf-8' });
    const jsonSchema = getSchema(schema);
    const generators: PrismaSchemaSectionType[] = [];
    const dataSources: PrismaSchemaSectionType[] = [];
    const models: PrismaSchemaSectionType[] = [];
    const enums: PrismaSchemaSectionType[] = [];
    jsonSchema.list.forEach((section) => {
      if (section.type === 'generator') {
        generators.push({
          name: section.name,
          value: section,
        });
      } else if (section.type === 'datasource') {
        dataSources.push({
          name: section.name,
          value: section,
        });
      } else if (section.type === 'model') {
        models.push({
          name: section.name,
          value: section,
        });
      } else if (section.type === 'enum') {
        enums.push({
          name: section.name,
          value: section,
        });
      }
    });

    generators.sort(ascendingSorter);
    dataSources.sort(ascendingSorter);
    models.sort(ascendingSorter);
    enums.sort(ascendingSorter);
    const sortedSections = [...generators, ...dataSources, ...models, ...enums];
    const sortedJsonSchema = {
      type: 'schema',
      list: sortedSections.map((section) => section.value),
    } as Schema;

    const sortedSchema = printSchema(sortedJsonSchema);
    await fs.writeFile(path, sortedSchema);
    console.log('Success.');
  } catch (error) {
    console.log('Failed.');
    console.log(error);
  }
};
