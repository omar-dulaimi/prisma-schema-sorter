# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.5.0...v3.0.0) (2026-07-28)


### ⚠ BREAKING CHANGES

* **breaking:** for any caller that relied on failures being swallowed.

Unknown commands and unknown options also exited 0, silently. The worst case was
a misspelled --schema, which was ignored, so the tool fell back to
./prisma/schema.prisma and reported success against a file the user had not
named. Both are now usage errors that exit 1.

engines said node >=18 and that was false. The packaged CLI could not start on
Node 18 at all: it died with ERR_REQUIRE_ESM before reaching this project's code.
The shipped main build is CommonJS while two of the three production dependencies
are ESM-only, so build/main/bin/cli.js does require("chalk") and require("yargs")
against ES modules. That only works where require(esm) is unflagged. Verified
from the tarball: 18.19.1, 18.20.8, 20.9.0 and 20.10.0 all fail, while 20.19.0,
22.22.0 and 24.13.1 all work.

The range is corrected rather than made to work on 18. Making 18 work would mean
downgrading yargs a whole major, because yargs 18 is itself ESM-only and declares
^20.19.0 || ^22.12.0 || >=23. Upstream has already dropped Node 18, which reached
end of life in April 2025, and the package was contradicting its own dependency
tree inside a single npm install: it claimed >=18 while yargs in the same output
warned that 18 was unsupported. engines now matches that range exactly, so Node
18 users get an EBADENGINE warning at install time instead of a stack trace at
run time, and --engine-strict refuses outright.

Note the range is not a rounded-down >=20. Node 20.0 through 20.18 cannot run
this either, so a naive >=20 would have been a second false claim.

Regression cover, each confirmed to fail against the pre-fix build first:

- The library rejects rather than resolves when the schema cannot be read.
- The compiled bin is spawned and its exit status asserted, for a missing schema,
  an unreadable path, no command, an unknown command and a misspelled option,
  with --help asserted to still exit 0 so "non-zero" is not the answer to
  everything.
- Every failure must print "Failed.". Adding strict() alone moved failures into
  yargs' own handler, which printed a usage dump and no marker at all while the
  exit code looked right, so a custom fail handler now owns that path and this
  test pins it.
- Every failure must print it exactly once. yargs calls the fail handler and
  also rejects the promise from parseAsync when a command handler rejects, so a
  plain backstop printed the whole error object, stack and all, a second time.
  Neither of these last two was in the original defect; both were introduced
  while fixing it and caught by running the packaged CLI rather than the suite.
- engines.node may not claim more than yargs allows, and the README must state
  the same range verbatim, because the badge was a second copy of the false
  claim.
- CI installs the tarball and asserts the failing invocations fail. That job
  previously had to grep stdout for "Failed." precisely because the exit status
  carried no signal; the comment explaining that workaround is now gone.
- The CI package matrix pins 20.19.0, the exact floor of the declared range. The
  claim went untested for as long as it did because nothing ever ran the bottom
  of the range.

Full gate green on Node 22.22.0 with npm 10.9.4 and Node 24.13.1 with npm 11.8.0.
No dependency or lockfile changes, and npm ci verified on both npm 10 and npm 11.

Scoped `breaking` deliberately. Correcting an exit code is the kind of fix that
breaks the callers who had adapted to the broken behaviour, and shipping it as a
patch would be its own false claim.
* **breaking:** Four user-visible behaviours change.

The CLI now exits 1 instead of 0 when it cannot sort the schema, so a pipeline
that was silently passing over an unreadable schema, an unknown command or a
misspelled option will start failing. That is the point of the change, but it
will turn currently-green steps red.

sortPrismaSchema now rejects instead of catching, logging and resolving. Callers
that never attached a `.catch()`, including the pattern the old README showed,
will see an unhandled rejection terminate the process instead of a swallowed
error. Attach a `.catch()` or wrap the `await`.

sortPrismaSchema no longer prints "Success." or "Failed." itself. Anything
scraping stdout from the library rather than the CLI sees nothing now.

engines.node narrows from ">=18" to "^20.19.0 || ^22.12.0 || >=23". No working
setup loses support, because the CLI could never start below that floor, but
installs on Node 18 or on Node 20.0 through 20.18 now warn, and fail outright
under --engine-strict.

### Bug Fixes

* **breaking:** exit non-zero on a failed sort and fix the Node range ([beb13eb](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/beb13ebb9d72e0e491e22f8cee2f80020896194f))
* **ci:** regenerate the lockfile so npm 10 and npm 11 both accept it ([1e764b3](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/1e764b30bbd0f6d38069d9e1f55cd96e85621360))
* **ci:** turn errexit off in the step that runs commands expected to fail ([6784653](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/6784653723c77f19a3cc9d5332bc29ed85bc9bd9))
* stop deleting composite types, views and comments ([f0808fd](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/f0808fdba786cd79b4eb4571db4054e309093574))

## [2.0.0](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.5.0...v2.0.0) (2026-07-28)

### ⚠ BREAKING CHANGES

* **breaking:** for any caller that relied on failures being swallowed.

Unknown commands and unknown options also exited 0, silently. The worst case was
a misspelled --schema, which was ignored, so the tool fell back to
./prisma/schema.prisma and reported success against a file the user had not
named. Both are now usage errors that exit 1.

engines said node >=18 and that was false. The packaged CLI could not start on
Node 18 at all: it died with ERR_REQUIRE_ESM before reaching this project's code.
The shipped main build is CommonJS while two of the three production dependencies
are ESM-only, so build/main/bin/cli.js does require("chalk") and require("yargs")
against ES modules. That only works where require(esm) is unflagged. Verified
from the tarball: 18.19.1, 18.20.8, 20.9.0 and 20.10.0 all fail, while 20.19.0,
22.22.0 and 24.13.1 all work.

The range is corrected rather than made to work on 18. Making 18 work would mean
downgrading yargs a whole major, because yargs 18 is itself ESM-only and declares
^20.19.0 || ^22.12.0 || >=23. Upstream has already dropped Node 18, which reached
end of life in April 2025, and the package was contradicting its own dependency
tree inside a single npm install: it claimed >=18 while yargs in the same output
warned that 18 was unsupported. engines now matches that range exactly, so Node
18 users get an EBADENGINE warning at install time instead of a stack trace at
run time, and --engine-strict refuses outright.

Note the range is not a rounded-down >=20. Node 20.0 through 20.18 cannot run
this either, so a naive >=20 would have been a second false claim.

Regression cover, each confirmed to fail against the pre-fix build first:

- The library rejects rather than resolves when the schema cannot be read.
- The compiled bin is spawned and its exit status asserted, for a missing schema,
  an unreadable path, no command, an unknown command and a misspelled option,
  with --help asserted to still exit 0 so "non-zero" is not the answer to
  everything.
- Every failure must print "Failed.". Adding strict() alone moved failures into
  yargs' own handler, which printed a usage dump and no marker at all while the
  exit code looked right, so a custom fail handler now owns that path and this
  test pins it.
- Every failure must print it exactly once. yargs calls the fail handler and
  also rejects the promise from parseAsync when a command handler rejects, so a
  plain backstop printed the whole error object, stack and all, a second time.
  Neither of these last two was in the original defect; both were introduced
  while fixing it and caught by running the packaged CLI rather than the suite.
- engines.node may not claim more than yargs allows, and the README must state
  the same range verbatim, because the badge was a second copy of the false
  claim.
- CI installs the tarball and asserts the failing invocations fail. That job
  previously had to grep stdout for "Failed." precisely because the exit status
  carried no signal; the comment explaining that workaround is now gone.
- The CI package matrix pins 20.19.0, the exact floor of the declared range. The
  claim went untested for as long as it did because nothing ever ran the bottom
  of the range.

Full gate green on Node 22.22.0 with npm 10.9.4 and Node 24.13.1 with npm 11.8.0.
No dependency or lockfile changes, and npm ci verified on both npm 10 and npm 11.

Scoped `breaking` deliberately. Correcting an exit code is the kind of fix that
breaks the callers who had adapted to the broken behaviour, and shipping it as a
patch would be its own false claim.
* **breaking:** Four user-visible behaviours change.

The CLI now exits 1 instead of 0 when it cannot sort the schema, so a pipeline
that was silently passing over an unreadable schema, an unknown command or a
misspelled option will start failing. That is the point of the change, but it
will turn currently-green steps red.

sortPrismaSchema now rejects instead of catching, logging and resolving. Callers
that never attached a `.catch()`, including the pattern the old README showed,
will see an unhandled rejection terminate the process instead of a swallowed
error. Attach a `.catch()` or wrap the `await`.

sortPrismaSchema no longer prints "Success." or "Failed." itself. Anything
scraping stdout from the library rather than the CLI sees nothing now.

engines.node narrows from ">=18" to "^20.19.0 || ^22.12.0 || >=23". No working
setup loses support, because the CLI could never start below that floor, but
installs on Node 18 or on Node 20.0 through 20.18 now warn, and fail outright
under --engine-strict.

### 🐛 Bug Fixes

* **breaking:** exit non-zero on a failed sort and fix the Node range ([beb13eb](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/beb13ebb9d72e0e491e22f8cee2f80020896194f))
* **ci:** regenerate the lockfile so npm 10 and npm 11 both accept it ([1e764b3](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/1e764b30bbd0f6d38069d9e1f55cd96e85621360))
* **ci:** turn errexit off in the step that runs commands expected to fail ([6784653](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/6784653723c77f19a3cc9d5332bc29ed85bc9bd9))
* stop deleting composite types, views and comments ([f0808fd](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/f0808fdba786cd79b4eb4571db4054e309093574))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.4.0-rc.1](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.3.4...v1.4.0-rc.1) (2021-11-19)

### Features

- **cli:** implement cli ([92c6d2a](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/92c6d2a47d9adf917c83e8b67d6e48f2821d8abd))
- implement main functionality ([fd3f04b](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/fd3f04b28c705d1dd775bc0e6ec2a8d877774bc8))
- **main:** sort datasources, generators and enums ([26cdff8](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/26cdff885ae4cb9b21fed761cd9c6f06eb642412))

### Bug Fixes

- **lib/index.ts:** replace fs-extra with fs ([86883f4](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/86883f439f1572a4a40593bd8d03b99283578ee2)), closes [#1](https://github.com/omar-dulaimi/prisma-schema-sorter/issues/1)
- **package.json:** fix library binary path ([89c9bcd](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/89c9bcda786bc2fffd8e15ef95d4aefcb5658d20))

### [1.3.4](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.3.3...v1.3.4) (2021-11-13)

### Bug Fixes

- **lib/index.ts:** replace fs-extra with fs ([94280da](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/94280daaa67b9ee0f98feab96c72f4a3020cdc83)), closes [#1](https://github.com/omar-dulaimi/prisma-schema-sorter/issues/1)

### [1.3.3](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.3.2...v1.3.3) (2021-11-05)

### [1.3.2](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.3.1...v1.3.2) (2021-11-05)

### Bug Fixes

- **package.json:** fix library binary path ([1939689](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/19396893f7f25c2e86df219d2b405d9c4788e0ca))

### [1.3.1](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.3.0...v1.3.1) (2021-11-05)

## [1.3.0](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.2.0...v1.3.0) (2021-11-05)

### Features

- **cli:** implement cli ([c48ff69](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/c48ff698c756a7c8e8d3bcddfe57422acc1787f1))

## [1.2.0](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.1.5...v1.2.0) (2021-10-31)

### Features

- **main:** sort datasources, generators and enums ([b682d3a](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/b682d3a0cfb230c087836bc0ec13c7d03b7c1ced))

### [1.1.5](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.1.4...v1.1.5) (2021-10-29)

### [1.1.4](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.1.2...v1.1.4) (2021-10-29)

### [1.1.3](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.1.2...v1.1.3) (2021-10-29)

### [1.1.2](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.1.1...v1.1.2) (2021-10-29)

### [1.1.1](https://github.com/omar-dulaimi/prisma-schema-sorter/compare/v1.1.0...v1.1.1) (2021-10-29)

## 1.1.0 (2021-10-29)

### Features

- implement main functionality ([7555132](https://github.com/omar-dulaimi/prisma-schema-sorter/commit/75551324256c8fe868f06636b5aaa267d8f5dea8))
