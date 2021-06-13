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
const rootPackageJsonPath = path.join(workspaceDir, 'package.json');
const versionRegex = /^(\d+)\.(\d+)\.(\d+)((-rc\.)(\d+))?$/;

const DEFAULT_PACKAGE_PREFIX = 'hot-';

// -----------------------------------------------------------------------------------------
const program = new Command();
program
  .version('1.0')
  .command(`bump [<new-version>|keep|increment] [package]`, { isDefault: true })
  .description('bump version for all projects')
  .action(async (version?: string, packageName?: string) => {
    return versionBump(version, packageName)
      .catch((err) => {
        die(`failed: ${err}`);
      })
      .then(() => {
        log(`succeeded`);
      });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function versionBump(version?: string, packageName?: string) {
  const workspace = await readJson(workspaceJsonPath);
  if (!workspace.projects) {
    warn(`no projects are currently defined`);
    return;
  }
  const packageJsonPath = packageName ? path.join(workspaceDir, workspace.projects[packageName].root, 'package.json') : rootPackageJsonPath;
  const packageJson = await readJson(packageJsonPath);
  const newVersion = getNewVersion(packageJson, version);
  await bumpPackageVersion('workspace', packageJsonPath, newVersion);
  if (!packageName) {
    await Promise.all(
      Object.keys(workspace.projects)
        .filter((projectName) => projectName.substring(0, DEFAULT_PACKAGE_PREFIX.length) === DEFAULT_PACKAGE_PREFIX)
        .map((projectName) => {
          const projectPackageJson = path.join(workspaceDir, workspace.projects[projectName].root, 'package.json');
          return bumpPackageVersion(projectName, projectPackageJson, newVersion);
        }),
    );
  }
}

// -----------------------------------------------------------------------------------------
function getNewVersion(packageJson: any, version?: string): string {
  const currentVersionParts = packageJson.version.match(versionRegex);
  if (!currentVersionParts) {
    throw new Error(`current version '${packageJson.version}' is invalid`);
  }
  if (version && version !== 'keep' && version !== 'increment') {
    if (!version.match(versionRegex)) {
      throw new Error(`new version '${version}' is invalid`);
    }
    return version;
  }
  const increment = version === 'keep' ? 0 : 1;
  if (currentVersionParts[4]) {
    return `${currentVersionParts[1]}.${currentVersionParts[2]}.${currentVersionParts[3]}${currentVersionParts[5]}` + (increment + parseInt(currentVersionParts[6], 10)).toString();
  } else {
    return `${currentVersionParts[1]}.${currentVersionParts[2]}.` + (increment + parseInt(currentVersionParts[3], 10)).toString();
  }
}

// -----------------------------------------------------------------------------------------
async function bumpPackageVersion(projectName: string, filePath: string, newVersion: string): Promise<void> {
  const stat = await statFilePromised(filePath);
  if (!stat) {
    return;
  }

  const packageJson = await readJson(filePath);
  const oldVersion = packageJson.version;
  if (oldVersion !== newVersion) {
    packageJson.version = newVersion;
    await writeJson(filePath, packageJson);
    log(`  ${projectName}: ${filePath}: changed ${oldVersion} => ${newVersion}`);
  } else {
    log(`  ${projectName}: ${filePath}: ${oldVersion}`);
  }
}
