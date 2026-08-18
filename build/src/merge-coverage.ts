#!/usr/bin/env tsx

import * as fs from 'node:fs';
import * as path from 'node:path';

import { rm, setEcho } from '@homeofthings/node-sys';
import chalk from 'chalk';
import { Command } from 'commander';

import { APPNAME, die, getWorkspaceDir, log, setApplication } from './utils/app';
import { writeFile } from './utils/file';
import { glob } from './utils/glob';
// -----------------------------------------------------------------------------------------
setEcho(false);

const COVERAGE_GREEN_LOWER_LIMIT = 85;

setApplication(__filename);
const coverageDirectory = path.join(getWorkspaceDir(), 'coverage');
const coverageReport = path.join(coverageDirectory, 'lcov.info');

const program = new Command();
program
  .version('1.0')
  .command(APPNAME, { isDefault: true })
  .description(`merge coverage reports found in '${coverageDirectory}'`)
  .action(async () => {
    // lcov-total v2 is ESM-only with no CJS entry point. The package has no
    // "exports" field, so bare specifier "lcov-total" cannot be resolved by
    // Node's ESM loader. A deep path import is required instead.
    // If a public export is added in a future version, switch to:
    //   import("lcov-total")
    const lcov_total_module = await import('lcov-total/src/index.js');
    const lcov_total = lcov_total_module.default as (filename: string) => number;
    if (typeof lcov_total !== 'function') {
      die(`lcov-total did not export a callable default — got ${typeof lcov_total}`);
    }
    try {
      await rm(coverageReport, { force: true });
      const files = await glob(path.join(coverageDirectory, '**', 'lcov.info'));
      await writeFile(coverageReport, files.reduce((acc, currFile) => acc + fs.readFileSync(currFile), ''));
      const result: number = lcov_total(coverageReport);
      const color = result >= COVERAGE_GREEN_LOWER_LIMIT ? 82 : result >= 70 ? 136 : 196;
      log(`overall coverage result: ${chalk.bold.ansi256(color)(result.toFixed(2))}`);
    } catch (err) {
      die(`failed: ${err}`);
    }
    log(`succeeded`);
  });

program.parseAsync(process.argv);
