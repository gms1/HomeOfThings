#!/usr/bin/env ts-node-script
import * as path from 'path';
import * as fs from 'fs';
import * as lcov_total from 'lcov-total';
import * as chalk from 'chalk';
import { Command } from 'commander';
import { glob } from './ts/utils/glob';
import { unlink, writeFile } from './ts/utils/fs';
import { APPNAME, die, getWorkspaceDir, log, setApplication } from './ts/utils/app';
// -----------------------------------------------------------------------------------------

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
      await unlink(coverageReport, true);
      const files = await glob(path.join(coverageDirectory, '**', 'lcov.info'));
      const mergedReport = files.reduce((mergedReport, currFile) => (mergedReport += fs.readFileSync(currFile)), '');
      await writeFile(coverageReport, mergedReport);
      const result: number = lcov_total(coverageReport);
      const color = result >= 80 ? 82 : result >= 70 ? 136 : 196;
      log(`overall coverage result: ${chalk.bold.ansi256(color)(result.toFixed(2))}`);
    } catch (err) {
      die(`failed: ${err}`);
    }
    log(`succeeded`);
  });

program.parse(process.argv);
