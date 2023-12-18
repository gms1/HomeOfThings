#!/usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-explicit-any */
import { setEcho } from '@homeofthings/node-sys';
import { Dictionary } from '@homeofthings/node-utils';
import { ProjectGraph, ProjectGraphProjectNode, readCachedProjectGraph } from '@nx/devkit';
import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

import { APPNAME, die, getWorkspaceDir, log, setApplication, warn } from './utils/app';
import { readJson, writeJson } from './utils/file';
// -----------------------------------------------------------------------------------------
// NOTE: call this script using `npx nx run <project>:version-bump --ver <new version>|increment|keep`

setEcho(false);

setApplication(__filename);
const WORKSPACE_DIR = path.resolve(getWorkspaceDir());

const versionRegex = /^(\d+)\.(\d+)\.(\d+)((-rc\.)(\d+))?$/;

const program = new Command();
program
  .version('1.0')
  .command(`${APPNAME} <project-name> <<new-version>|increment|keep> `, { isDefault: true })
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
    await bumpPackageVersion(graph, nxProject, version);
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
async function bumpPackageVersion(graph: ProjectGraph, nxProject: ProjectGraphProjectNode, version: string): Promise<void> {
  try {
    const packageJsonPath = path.resolve(WORKSPACE_DIR, nxProject.data.root, 'package.json');
    const packageJson = await readJson(packageJsonPath);
    const projectName = packageJson.name;
    const newVersion = getNewVersion(packageJson, version);

    const oldVersion = packageJson.version;

    if (oldVersion !== newVersion) {
      packageJson.version = newVersion;

      const rootPackageJson = await readJson(path.resolve(WORKSPACE_DIR, 'package.json'));
      const internalDependencies: Dictionary = {};
      for (const otherProjectName in graph.nodes) {
        const otherNxProject = graph.nodes[otherProjectName];
        if (otherNxProject.data.root === nxProject.data.root) {
          continue;
        }
        const otherProjectPackageJson = path.resolve(WORKSPACE_DIR, otherNxProject.data.root, 'package.json');
        if (!fs.existsSync(otherProjectPackageJson)) {
          continue;
        }
        const otherPackageJson = await readJson(otherProjectPackageJson);
        if (!otherPackageJson.name || !otherPackageJson.version || otherPackageJson.version === '0.0.0') {
          continue;
        }
        internalDependencies[otherPackageJson.name] = otherPackageJson.version;
      }

      updatePackageDependencies(graph, packageJson, rootPackageJson, internalDependencies);
      await writeJson(packageJsonPath, packageJson);
      warn(`${projectName}: changed ${oldVersion} => ${newVersion}`);
    } else {
      warn(`${projectName}: ${oldVersion} not changed`);
    }
    return;
  } catch (err) {
    return Promise.reject(err);
  }
}

function updatePackageDependencies(graph: ProjectGraph, packageJson: any, rootPackageJson: any, internalDependencies: Dictionary) {
  const externalDependencies = Object.assign(
    {},
    rootPackageJson.optionalDependencies,
    rootPackageJson.peerDependencies,
    rootPackageJson.devDependencies,
    rootPackageJson.dependencies,
  );

  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    if (!packageJson[depType]) {
      continue;
    }
    const dependencies: { [name: string]: string } = packageJson[depType];
    for (const depPackageName in dependencies) {
      if (externalDependencies[depPackageName]) {
        dependencies[depPackageName] = externalDependencies[depPackageName];
        continue;
      }
      if (internalDependencies[depPackageName]) {
        dependencies[depPackageName] = '~' + internalDependencies[depPackageName];
        continue;
      }
      // console.log('internalDependencies: ', internalDependencies);
      die(`no version found for package '${depPackageName}' in ${depType}: `);
    }
  }
}
