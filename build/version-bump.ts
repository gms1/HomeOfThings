#!/usr/bin/env ts-node-script
import * as path from 'path';
import * as process from 'process';
import { Command } from 'commander';
import { die, log, setApplication, warn } from './ts/utils/app';
import { readJson, writeJson } from './ts/utils/file';

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
  .command(`bump [<new-version>|increment|keep] [package]`, { isDefault: true })
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
async function versionBump(version?: string, packageName?: string): Promise<void> {
  try {
    const workspace = await readJson(workspaceJsonPath);
    if (!workspace.projects) {
      warn(`no projects are currently defined`);
      return;
    }
    if (packageName) {
      const projectPackageJson = path.join(workspaceDir, workspace.projects[packageName].root, 'package.json');
      await bumpPackageVersion(packageName, projectPackageJson, version);
    } else {
      await bumpPackageVersion('hot-workspace', rootPackageJsonPath, version);
      await Promise.all(
        Object.keys(workspace.projects)
          .filter((projectName) => projectName.substring(0, DEFAULT_PACKAGE_PREFIX.length) === DEFAULT_PACKAGE_PREFIX)
          .sort((a, b) => a.localeCompare(b))
          .map((projectName) => {
            const projectPackageJson = path.join(workspaceDir, workspace.projects[projectName].root, 'package.json');
            return bumpPackageVersion(projectName, projectPackageJson, version);
          }),
      );
      if (version === 'keep') {
        await Promise.all(
          Object.keys(workspace.projects)
            .filter((projectName) => projectName.substring(0, DEFAULT_PACKAGE_PREFIX.length) !== DEFAULT_PACKAGE_PREFIX)
            .sort((a, b) => a.localeCompare(b))
            .map((projectName) => {
              const projectPackageJson = path.join(workspaceDir, workspace.projects[projectName].root, 'package.json');
              return bumpPackageVersion(projectName, projectPackageJson, version);
            }),
        );
      }
    }
    return;
  } catch (err) {
    return Promise.reject(err);
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
async function bumpPackageVersion(projectName: string, filePath: string, version: string): Promise<void> {
  try {
    const packageJson = await readJson(filePath);
    const newVersion = getNewVersion(packageJson, version);

    const oldVersion = packageJson.version;
    if (oldVersion !== newVersion) {
      packageJson.version = newVersion;
      await writeJson(filePath, packageJson);
      log(`  ${projectName}: ${filePath}: changed ${oldVersion} => ${newVersion}`);
    } else {
      log(`  ${projectName}: ${filePath}: ${oldVersion}`);
    }
    return;
  } catch (err) {
    return Promise.reject(err);
  }
}
