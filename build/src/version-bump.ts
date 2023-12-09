#!/usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as path from 'node:path';
import * as process from 'node:process';

import { logEcho } from '@homeofthings/node-sys';
import { Command } from 'commander';

import { die, getWorkspaceDir, log, setApplication } from './utils/app';
import { readJson, writeJson } from './utils/file';
import { ProjectGraph, readCachedProjectGraph } from 'nx/src/devkit-exports';
// -----------------------------------------------------------------------------------------
// NOTE: call this script using `npx nx run <project>:version-bump --ver <new version>|increment|keep`

logEcho(false);

setApplication(__filename);
const WORKSPACE_DIR = path.resolve(getWorkspaceDir());

const versionRegex = /^(\d+)\.(\d+)\.(\d+)((-rc\.)(\d+))?$/;

const program = new Command();
program
  .version('1.0')
  .command(`version-bump <project-name> <<new-version>|increment|keep> `, { isDefault: true })
  .description('bump version for all projects')
  .action(async (projectName: string, version: string) => {
    return versionBump(readCachedProjectGraph(), projectName, version)
      .catch((err) => {
        die(`failed: ${err}`);
      })
      .then(() => {
        log(`succeeded`);
      });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function versionBump(graph: ProjectGraph, projectName: string, version: string): Promise<void> {
  const nxProject = graph.nodes[projectName];
  if (!nxProject) {
    die(`project '${projectName}' not found`);
  }

  try {
    const projectPackageJson = path.resolve(WORKSPACE_DIR, nxProject.data.root, 'package.json');
    await bumpPackageVersion(nxProject.data.root, projectPackageJson, version);
    return;
  } catch (err) {
    return Promise.reject(err);
  }
}

// -----------------------------------------------------------------------------------------
function getNewVersion(packageJson: any, version: string): string {
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
async function bumpPackageVersion(projectDir: string, filePath: string, version: string): Promise<void> {
  try {
    const packageJson = await readJson(filePath);
    const projectName = packageJson.name;
    const newVersion = getNewVersion(packageJson, version);

    const oldVersion = packageJson.version;
    if (oldVersion !== newVersion) {
      packageJson.version = newVersion;
      await writeJson(filePath, packageJson);
      log(`${projectName}: changed ${oldVersion} => ${newVersion}`);
    } else {
      log(`${projectName}: ${oldVersion}`);
    }
    return;
  } catch (err) {
    return Promise.reject(err);
  }
}
