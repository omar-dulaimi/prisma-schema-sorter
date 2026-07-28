#! /usr/bin/env node
import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { sortPrismaSchema } from '../lib';

const DEFAULT_SCHEMA_PATH = './prisma/schema.prisma';

let reported = false;

const markFailed = (): void => {
  reported = true;
  // The schema was not sorted, so the process must not look like it succeeded. `exitCode` rather
  // than `process.exit()` so the output above is flushed instead of truncated when piped.
  process.exitCode = 1;
};

const run = async (): Promise<void> => {
  await yargs(hideBin(process.argv))
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
          schema = DEFAULT_SCHEMA_PATH;
          console.log(
            chalk.green.bold(
              `Using default prisma path: ${DEFAULT_SCHEMA_PATH}`,
            ),
          );
        }
        await sortPrismaSchema(schema);
        console.log('Success.');
      },
    )
    // Both of these are exit-code correctness, not tidiness. Without them an invocation that sorted
    // nothing at all still exited 0 and printed nothing: a bare `prisma-schema-sorter`, a
    // misspelled command, and worst of all a misspelled `--schema`, which was silently ignored so
    // the tool reported success against the default path instead of the file the user named.
    .demandCommand(
      1,
      `No command given. Try: prisma-schema-sorter sort --schema=${DEFAULT_SCHEMA_PATH}`,
    )
    .strict()
    // Every way this can go wrong ends up here: yargs sends both its own usage errors and a
    // rejected command handler to the fail handler, so without one, a failed sort was reported by
    // yargs printing a usage dump that had nothing to do with the actual error. Supplying a handler
    // also means yargs stops exiting on its own, so setting the code here is required, not extra.
    .fail((message: string, error: Error | undefined, instance) => {
      console.log('Failed.');
      if (error) {
        // A runtime failure, such as a schema that cannot be read. Usage text would be noise.
        console.log(error);
      } else {
        instance.showHelp();
        console.log(message);
      }
      markFailed();
    })
    .parseAsync();
};

// A backstop for anything that escapes the handler above. It has to check `reported`, because for a
// rejected command handler yargs calls the fail handler *and* rejects the promise from parseAsync,
// which printed the whole error object twice.
run().catch((error: unknown) => {
  if (reported) {
    return;
  }
  console.log('Failed.');
  console.log(error);
  markFailed();
});
