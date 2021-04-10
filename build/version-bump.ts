#!/usr/bin/env ts-node-script
import * as path from 'path';
import * as process from 'process';
import { Command } from 'commander';
import { die, log, readJson, setApplication, warn, writeJson } from './ts/common';
import { statFilePromised } from './ts/utils/fs';

setApplication(__filename);
const workdir = process.cwd();
const workspaceDir = path.relative(workdir, path.resolve(__dirname, '..'));

const workspaceJsonPath = path.join(workspaceDir, 'workspace.json');
const packageJsonPath = path.join(workspaceDir, 'package.json');
const versionRegex = /^(\d+)\.(\d+)\.(\d+)((-rc\.)(\d+))?$/;

// -----------------------------------------------------------------------------------------
const program = new Command();
program
  .version('1.0')
  .command(`bump [<new-version>|keep]`, { isDefault: true })
  .description('bump version for all projects')
  .action(async (version?: string) => {
    return versionBump(version)
      .catch((err) => {
        die(`failed: ${err}`);
      })
      .then(() => {
        log(`succeeded`);
      });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function versionBump(version?: string) {
  const workspace = await readJson(workspaceJsonPath);
  if (!workspace.projects) {
    warn(`no projects are currently defined`);
    return;
  }
  const packageJson = await readJson(packageJsonPath);
  const newVersion = getNewVersion(packageJson, version);
  await bumpPackageVersion(packageJsonPath, newVersion);
  await Promise.all(
    Object.keys(workspace.projects).map((projectName) => {
      const projectPackageJson = path.join(workspaceDir, workspace.projects[projectName].root, 'package.json');
      return bumpPackageVersion(projectPackageJson, newVersion);
    }),
  );
}

// -----------------------------------------------------------------------------------------
function getNewVersion(packageJson: any, version?: string): string {
  const currentVersionParts = packageJson.version.match(versionRegex);
  if (!currentVersionParts) {
    throw new Error(`current version '${packageJson.version}' is invalid`);
  }
  if (version && version !== 'keep') {
    if (!version.match(versionRegex)) {
      throw new Error(`new version '${version}' is invalid`);
    }
    return version;
  }
  const inc = version === 'keep' ? 0 : 1;
  if (currentVersionParts[4]) {
    return `${currentVersionParts[1]}.${currentVersionParts[2]}.${currentVersionParts[3]}${currentVersionParts[5]}` + (inc + parseInt(currentVersionParts[6], 10)).toString();
  } else {
    return `${currentVersionParts[1]}.${currentVersionParts[2]}.` + (inc + parseInt(currentVersionParts[3], 10)).toString();
  }
}

// -----------------------------------------------------------------------------------------
async function bumpPackageVersion(filePath: string, newVersion: string): Promise<void> {
  const stat = await statFilePromised(filePath);
  if (!stat) {
    return;
  }

  const packageJson = await readJson(filePath);
  const oldVersion = packageJson.version;
  if (oldVersion !== newVersion) {
    packageJson.version = newVersion;
    await writeJson(filePath, packageJson);
    log(`  ${filePath}: changed ${oldVersion} => ${newVersion}`);
  } else {
    log(`  ${filePath}: ${oldVersion}`);
  }
}
