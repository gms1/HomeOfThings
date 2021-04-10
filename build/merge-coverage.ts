#!/usr/bin/env ts-node-script
import * as path from 'path';
import * as fs from 'fs';
import * as lcov_total from 'lcov-total';
import * as chalk from 'chalk';
import { Command } from 'commander';
import { globPromised } from './ts/utils/glob';
import { unlinkPromised, writeTextFilePromised } from './ts/utils/fs';
import { die, log, setApplication } from './ts/common';

setApplication(__filename);
const workdir = process.cwd();
const workspaceDir = path.relative(workdir, path.resolve(__dirname, '..'));

const coverageDirectory = path.join(workspaceDir, 'coverage');
const coverageReport = path.join(coverageDirectory, 'lcov.info');

// -----------------------------------------------------------------------------------------
const program = new Command();
program
  .version('1.0')
  .command(`merge-coverage`, { isDefault: true })
  .description(`merge coverage reports found in '${coverageDirectory}'`)
  .action(async () => {
    try {
      await unlinkPromised(coverageReport);
      const files = await globPromised(path.join(coverageDirectory, '**', 'lcov.info'));
      const mergedReport = files.reduce((mergedReport, currFile) => (mergedReport += fs.readFileSync(currFile)), '');
      await writeTextFilePromised(coverageReport, mergedReport);
      const result: number = lcov_total(coverageReport);
      const color = result >= 80 ? 82 : result >= 70 ? 136 : 196;
      log(`overall coverage result: ${chalk.bold.ansi256(color)(result.toFixed(2))}`);
    } catch (err) {
      die(`failed: ${err}`);
    }
    log(`succeeded`);
  });
program.parse(process.argv);
