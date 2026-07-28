import { spawnSync } from 'child_process';
import { existsSync, promises as fs } from 'fs';
import { join } from 'path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { sortPrismaSchema } from '../src/lib/index';

/**
 * `sortPrismaSchema` used to wrap its whole body in a try/catch that printed "Failed." and the
 * error, then returned normally. Two consequences, both of which shipped:
 *
 * 1. The CLI had no failure path of its own, so `sort --schema=./nope.prisma` printed ENOENT and
 *    exited 0. To a package.json script, a Makefile or a CI step, that is indistinguishable from a
 *    successful sort, which is the worst possible outcome for a tool that rewrites files.
 * 2. A programmatic caller got a resolved promise either way. It cannot read a console message, so
 *    it had no way at all to learn that the schema was never sorted.
 *
 * The library therefore throws and the CLI is the only place that reports and sets the exit code.
 */
describe('failure is reported rather than swallowed', () => {
  const testDir = join(__dirname, 'temp-failure');
  const schemaPath = join(testDir, 'schema.prisma');

  const UNSORTED = `model Zebra {
  id Int @id
}

model Apple {
  id Int @id
}
`;

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('the library entry point', () => {
    it('rejects when the schema does not exist, instead of resolving', async () => {
      await expect(
        sortPrismaSchema(join(testDir, 'does-not-exist.prisma')),
      ).rejects.toThrow(/ENOENT/);
    });

    it('rejects when the schema path is a directory', async () => {
      await expect(sortPrismaSchema(testDir)).rejects.toThrow(/EISDIR|EPERM/);
    });

    it('still resolves when the schema does exist', async () => {
      await fs.writeFile(schemaPath, UNSORTED);

      await expect(sortPrismaSchema(schemaPath)).resolves.toBeUndefined();
      expect(await fs.readFile(schemaPath, 'utf-8')).toMatch(
        /model Apple[\s\S]*model Zebra/,
      );
    });
  });

  /**
   * Spawned against the compiled `bin` rather than the TypeScript source, because the exit code is
   * a property of the process a user actually starts. `npm test` builds before it runs the suite,
   * and CI does the same.
   */
  describe('the CLI process', () => {
    const cliPath = join(__dirname, '..', 'build', 'main', 'bin', 'cli.js');

    const runCli = (...args: readonly string[]) =>
      spawnSync(process.execPath, [cliPath, ...args], {
        cwd: testDir,
        encoding: 'utf-8',
      });

    it('has been built, so the assertions below mean something', () => {
      expect(
        existsSync(cliPath),
        `${cliPath} is missing. Run \`npm run build\` first; \`npm test\` does it for you.`,
      ).toBe(true);
    });

    it('exits non-zero when the schema does not exist', () => {
      const result = runCli('sort', '--schema=./does-not-exist.prisma');

      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toContain('ENOENT');
    });

    /**
     * Every failure has to carry the same marker. Adding `strict()` alone moved the failure into
     * yargs' own handler, which printed a usage dump and no "Failed." at all, so a caller grepping
     * for it saw nothing while the exit code was right. Both signals or neither.
     */
    it('prints "Failed." on every failure, not just some of them', () => {
      const invocations = [
        ['sort', '--schema=./does-not-exist.prisma'],
        ['sort', '--schema=.'],
        [],
        ['srot'],
        ['sort', '--shcema=./schema.prisma'],
      ] as const;

      for (const args of invocations) {
        const result = runCli(...args);

        expect(
          `${result.stdout}${result.stderr}`,
          `\`${args.join(' ') || '(no arguments)'}\` printed no "Failed.".`,
        ).toContain('Failed.');
      }
    });

    /**
     * yargs calls the fail handler and *also* rejects the promise from parseAsync for a rejected
     * command handler, so a naive backstop printed the whole error object, stack and all, twice.
     */
    it('reports each failure once, not twice', () => {
      const invocations = [
        ['sort', '--schema=./does-not-exist.prisma'],
        ['sort', '--schema=.'],
        [],
        ['srot'],
        ['sort', '--shcema=./schema.prisma'],
      ] as const;

      for (const args of invocations) {
        const result = runCli(...args);
        const occurrences = `${result.stdout}${result.stderr}`.split(
          'Failed.',
        ).length;

        expect(
          occurrences - 1,
          `\`${args.join(' ') || '(no arguments)'}\` reported its failure more than once.`,
        ).toBe(1);
      }
    });

    /**
     * Usage text in response to ENOENT tells the user their syntax was wrong when it was not.
     */
    it('does not answer a runtime error with a usage dump', () => {
      const result = runCli('sort', '--schema=./does-not-exist.prisma');

      expect(`${result.stdout}${result.stderr}`).not.toContain(
        'sort your prisma schema in ascending fashion',
      );
    });

    it('exits non-zero when the schema path is a directory', () => {
      const result = runCli('sort', '--schema=.');

      expect(result.status).not.toBe(0);
    });

    it('exits non-zero when given no command, having sorted nothing', () => {
      const result = runCli();

      expect(result.status).not.toBe(0);
    });

    it('exits non-zero on an unknown command', () => {
      const result = runCli('srot', '--schema=./schema.prisma');

      expect(result.status).not.toBe(0);
    });

    /**
     * A misspelled `--schema` used to be accepted silently and fall through to the default path, so
     * the tool reported success while sorting a different file, or none.
     */
    it('exits non-zero on an unknown option instead of using the default path', () => {
      const result = runCli('sort', '--shcema=./schema.prisma');

      expect(result.status).not.toBe(0);
    });

    it('exits zero and sorts the file on the happy path', async () => {
      await fs.writeFile(schemaPath, UNSORTED);

      const result = runCli('sort', '--schema=./schema.prisma');

      expect(`${result.stdout}${result.stderr}`).toContain('Success.');
      expect(result.status).toBe(0);
      expect(await fs.readFile(schemaPath, 'utf-8')).toMatch(
        /model Apple[\s\S]*model Zebra/,
      );
    });
  });
});
