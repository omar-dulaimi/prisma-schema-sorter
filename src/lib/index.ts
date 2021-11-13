import { promises as fs } from 'fs';

import { PrismaSchemaSectionType } from '../types';

import { ascendingSorter } from './../helpers';

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
 * sortPrismaSchema().then();
 * // => Success
 * ```
 * @param path - path to the prisma schema
 */
export const sortPrismaSchema = async (path: string) => {
  try {
    const schema = await fs.readFile(path, { encoding: 'utf-8' });
    const schemaSections: string[] = schema.split('\n\n');
    const generators: PrismaSchemaSectionType[] = [];
    const dataSources: PrismaSchemaSectionType[] = [];
    const models: PrismaSchemaSectionType[] = [];
    const enums: PrismaSchemaSectionType[] = [];
    schemaSections.forEach((section) => {
      if (section.includes('generator')) {
        generators.push({
          name: section.split(' ')[1].trim(),
          value: section,
        });
      } else if (section.includes('datasource')) {
        dataSources.push({
          name: section.split(' ')[1].trim(),
          value: section,
        });
      } else if (section.includes('model')) {
        models.push({
          name: section.split(' ')[1].trim(),
          value: section,
        });
      } else if (section.includes('enum')) {
        enums.push({
          name: section.split(' ')[1].trim(),
          value: section,
        });
      }
    });

    generators.sort(ascendingSorter);
    dataSources.sort(ascendingSorter);
    models.sort(ascendingSorter);
    enums.sort(ascendingSorter);
    const sortedSections = [...generators, ...dataSources, ...models, ...enums];
    await fs.writeFile(
      path,
      sortedSections.map((section) => section.value).join('\n\n')
    );
    console.log('Success.');
  } catch (error) {
    console.log('Failed.');
    console.log(error);
  }
};
