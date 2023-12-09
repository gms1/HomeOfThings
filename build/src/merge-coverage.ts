#!/usr/bin/env ts-node-script
import * as fs from 'node:fs';
import * as path from 'node:path';

import { rm, logEcho } from '@homeofthings/node-sys';
import chalk from 'chalk';
import { Command } from 'commander';
import lcov_total from 'lcov-total';

import { APPNAME, die, getWorkspaceDir, log, setApplication } from './utils/app';
import { writeFile } from './utils/file';
import { glob } from './utils/glob';
// -----------------------------------------------------------------------------------------
logEcho(false);

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
    try {
      await rm(coverageReport, { force: true });
      const files = await glob(path.join(coverageDirectory, '**', 'lcov.info'));
      const mergedReport = files.reduce((mergedReport, currFile) => (mergedReport += fs.readFileSync(currFile)), '');
      await writeFile(coverageReport, mergedReport);
      const result: number = lcov_total(coverageReport);
      const color = result >= COVERAGE_GREEN_LOWER_LIMIT ? 82 : result >= 70 ? 136 : 196;
      log(`overall coverage result: ${chalk.bold!.ansi256(color)(result.toFixed(2))}`);
    } catch (err) {
      die(`failed: ${err}`);
    }
    log(`succeeded`);
  });

program.parse(process.argv);
