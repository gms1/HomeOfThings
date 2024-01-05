#!/usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

import { setEcho } from '@homeofthings/node-sys';
import { Dictionary } from '@homeofthings/node-utils';
import { ProjectGraph, ProjectGraphProjectNode, readCachedProjectGraph } from '@nx/devkit';
import { Command } from 'commander';

import { APPNAME, die, getWorkspaceDir, invariant, log, LogLevel, setApplication, verbose, warn } from './utils/app';
import { readJson, writeJson } from './utils/file';
import { gitLogChanges, logGitLogChanges } from './utils/git/log';
import { GitCommit } from './utils/git/model/commit';
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
    return versionBumpCommand(readCachedProjectGraph(), projectName, version)
      .catch((err) => {
        die(`failed: ${err}`);
      })
      .then(() => {
        log(`succeeded`);
      });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function versionBumpCommand(graph: ProjectGraph, projectName: string, version: string): Promise<void> {
  const nxProject = graph.nodes[projectName];
  if (!nxProject) {
    die(`project '${projectName}' not found`);
    return;
  }

  try {
    await bumpPackageVersion(graph, nxProject, version);
    return;
  } catch (err) {
    return Promise.reject(err);
  }
}

// -----------------------------------------------------------------------------------------
function getNewVersion(packageJson: any, version: string, commits: GitCommit[]): string {
  const currentVersionParts = packageJson.version.match(versionRegex);
  if (!currentVersionParts) {
    throw new Error(`current version '${packageJson.version}' is invalid`);
  }
  if (version === 'keep') {
    return packageJson.version;
  }
  if (version === 'increment') {
    if (currentVersionParts[4]) {
      // release candidate
      return `${currentVersionParts[1]}.${currentVersionParts[2]}.${currentVersionParts[3]}${currentVersionParts[5]}` + (parseInt(currentVersionParts[6], 10) + 1).toString();
    }

    let major = false;
    let minor = false;
    commits.forEach((commit) => {
      if (commit.breakingChange) {
        major = true;
        return;
      }
      switch (commit.type) {
        case 'feat':
        case 'perf':
          minor = true;
          break;
      }
    });
    const part = major ? 1 : minor ? 2 : 3;
    currentVersionParts[part] = (parseInt(currentVersionParts[part], 10) + 1).toString();
    for (let n = part + 1; n <= 3; n++) {
      currentVersionParts[n] = 0;
    }
    return `${currentVersionParts[1]}.${currentVersionParts[2]}.${currentVersionParts[3]}`;
  } else {
    if (!version.match(versionRegex)) {
      throw new Error(`new version '${version}' is invalid`);
    }
    return version;
  }
}

// -----------------------------------------------------------------------------------------
async function bumpPackageVersion(graph: ProjectGraph, nxProject: ProjectGraphProjectNode, version: string): Promise<void> {
  try {
    const projectRoot = path.resolve(WORKSPACE_DIR, nxProject.data.root);
    const packageJsonPath = path.resolve(projectRoot, 'package.json');
    const packageJson = await readJson(packageJsonPath);
    const projectName = packageJson.name;

    const commits = await gitLogChanges(projectRoot);
    const newVersion = getNewVersion(packageJson, version, commits);

    const oldVersion = packageJson.version;

    if (oldVersion !== newVersion) {
      packageJson.version = newVersion;

      const [externalPackageVersions, externalPeerDependencyVersions] = await getAllExternalPackageVersions();
      const internalPackageVersions = await getAllInternalPackageVersions(graph, nxProject);

      updatePackageDependencies(packageJson, externalPackageVersions, internalPackageVersions, externalPeerDependencyVersions);

      packageJson.repository = {
        type: 'git',
        url: 'git+https://github.com/gms1/HomeOfThings.git',
      };

      if (!packageJson.author?.email) {
        packageJson.author = { email: 'www.gms@gmx.at', name: 'Guenter Sandner' };
      }
      if (!packageJson.license) {
        packageJson.license = 'MIT';
      }
      if (!packageJson.homepage) {
        packageJson.homepage = 'https://github.com/gms1/HomeOfThings';
      }
      if (!packageJson.bugs?.url) {
        packageJson.bugs = {
          url: 'https://github.com/gms1/HomeOfThings/issues',
        };
      }
      invariant(packageJson.description, LogLevel.WARN, `no description defined in '${packageJsonPath}'`);
      invariant(packageJson.keywords?.length, LogLevel.WARN, `no keywords defined in '${packageJsonPath}'`);
      await writeJson(packageJsonPath, packageJson);
      warn(`${projectName}: changed ${oldVersion} => ${newVersion}`);
    } else {
      warn(`${projectName}: ${oldVersion} not changed`);
    }
    verbose('CHANGES:');
    logGitLogChanges(commits);
    return;
  } catch (err) {
    return Promise.reject(err);
  }
}

async function getAllExternalPackageVersions(): Promise<[Dictionary, Dictionary]> {
  const rootPackageJson = await readJson(path.resolve(WORKSPACE_DIR, 'package.json'));
  const externalPeerDependencyVersions = Object.assign({}, rootPackageJson.peerDependencies);
  const externalPackageVersions = Object.assign(
    {},
    rootPackageJson.optionalDependencies,
    rootPackageJson.devDependencies,
    rootPackageJson.dependencies,
    rootPackageJson.peerDependencies,
  );
  return [externalPackageVersions, externalPeerDependencyVersions];
}

async function getAllInternalPackageVersions(graph: ProjectGraph, nxProject: ProjectGraphProjectNode): Promise<Dictionary> {
  const internalPackageVersions: Dictionary = {};
  for (const otherProjectName in graph.nodes) {
    const otherNxProject = graph.nodes[otherProjectName] as ProjectGraphProjectNode;
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
    internalPackageVersions[otherPackageJson.name] = otherPackageJson.version;
  }
  return internalPackageVersions;
}

function updatePackageDependencies(packageJson: any, externalPackageVersions: Dictionary, internaPackageVersions: Dictionary, externalPeerDependencyVersions: Dictionary) {
  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    if (!packageJson[depType]) {
      continue;
    }
    const dependencies: { [name: string]: string } = packageJson[depType];
    for (const depPackageName in dependencies) {
      if (depType === 'peerDependencies') {
        if (!externalPeerDependencyVersions[depPackageName]) {
          die(`package '${depPackageName}' is not defined as '${depType}' in root package.json `);
        }
        dependencies[depPackageName] = externalPeerDependencyVersions[depPackageName] as string;
        continue;
      } else {
        if (externalPeerDependencyVersions[depPackageName]) {
          die(`package '${depPackageName}' should be defined as peer dependency but is defined as '${depType}'`);
        }
      }
      if (internaPackageVersions[depPackageName]) {
        dependencies[depPackageName] = '~' + internaPackageVersions[depPackageName];
        continue;
      }
      if (externalPackageVersions[depPackageName]) {
        dependencies[depPackageName] = externalPackageVersions[depPackageName] as string;
        continue;
      }
      die(`no version found for package '${depPackageName}' in ${depType}`);
    }
  }
}
