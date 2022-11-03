#! /usr/bin/env node
import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { sortPrismaSchema } from '../lib';

yargs(hideBin(process.argv))
  .command(
    'sort',
    'sort your prisma schema in ascending fashion',
    (yargs) => {
      return yargs.option('schema', {
        describe: 'path to the prisma schema',
        type: 'string',
        demandOption: false,
      });
    },
    async (argv) => {
      let { schema } = argv;
      if (!schema) {
        schema = './schema.prisma';
        console.log(
          chalk.green.bold('Using default prisma path: ./schema.prisma')
        );
      }
      await sortPrismaSchema(schema);
    }
  )
  .parse();
