import { promises as fs } from 'fs';
import { join } from 'path';

import { describe, expect, it } from 'vitest';

/**
 * `engines.node` said `>=18`, and that was simply untrue: the packaged CLI could not start on Node
 * 18 at all. It died with ERR_REQUIRE_ESM before running a line of this project's code.
 *
 * The reason is that the shipped `main` build is CommonJS while two of the three production
 * dependencies are ESM-only: `chalk` 5 and `yargs` 18 are both `"type": "module"` and neither
 * offers a `require` export condition. So `build/main/bin/cli.js` does `require("chalk")` and
 * `require("yargs")` against ESM, which only works on the Node versions where `require(esm)` is
 * available unflagged: 20.19.0 and later in the 20 line, 22.12.0 and later in the 22 line, and
 * everything from 23 up. Verified by installing the tarball into an empty directory: 18.19.1,
 * 18.20.8, 20.9.0 and 20.10.0 all fail; 20.19.0, 22.22.0 and 24.13.1 all work.
 *
 * That is exactly the range `yargs` itself declares, which makes it the binding constraint on this
 * package. Claiming anything wider is claiming support upstream has already withdrawn.
 */
describe('the declared Node support is true', () => {
  const repoRoot = join(__dirname, '..');

  const readJson = async (...segments: readonly string[]) =>
    JSON.parse(await fs.readFile(join(repoRoot, ...segments), 'utf-8'));

  it('claims no more than the strictest production dependency allows', async () => {
    const [ours, yargs] = await Promise.all([
      readJson('package.json'),
      readJson('node_modules', 'yargs', 'package.json'),
    ]);

    expect(
      ours.engines.node,
      'yargs is ESM-only and this package ships a CommonJS build that requires it, so this ' +
        'package cannot run anywhere yargs does not. If yargs has changed its range, decide the ' +
        'new range deliberately and re-verify the tarball on the new floor rather than widening ' +
        'this claim to match.',
    ).toBe(yargs.engines.node);
  });

  it('is stated the same way in the README, so the badge cannot drift from the truth', async () => {
    const [ours, readme] = await Promise.all([
      readJson('package.json'),
      fs.readFile(join(repoRoot, 'README.md'), 'utf-8'),
    ]);

    expect(
      readme,
      'The README is where people look before installing, so it has to carry the same range as ' +
        'engines.node verbatim.',
    ).toContain(ours.engines.node);
  });

  it('is satisfied by the Node running this suite, which is what CI proves on the floor', async () => {
    const ours = await readJson('package.json');
    const [major, minor] = process.versions.node.split('.').map(Number);

    const supported =
      (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major >= 23;

    expect(
      supported,
      `Running on Node ${process.versions.node}, which is outside ${ours.engines.node}.`,
    ).toBe(true);
  });
});
