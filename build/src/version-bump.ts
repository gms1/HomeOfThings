#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

import { setEcho } from '@homeofthings/node-sys';
import { ProjectGraph, ProjectGraphProjectNode, readCachedProjectGraph } from '@nx/devkit';
import { Command } from 'commander';

import { APPNAME, die, getWorkspaceDir, invariant, log, LogLevel, setApplication, verbose, warn } from './utils/app';
import { readJson, writeJson } from './utils/file';
import { gitLogChanges, loadHashMap, logGitLogChanges } from './utils/git/log';
import { GitCommit } from './utils/git/model/commit';
import { getAllExternalPackageVersions, getAllInternalPackageVersions, updatePackageDependencies } from './utils/projects/deps';
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

    const hashMap = loadHashMap(WORKSPACE_DIR);
    const commits = await gitLogChanges(projectRoot, WORKSPACE_DIR, hashMap);
    const newVersion = getNewVersion(packageJson, version, commits);

    const oldVersion = packageJson.version;

    if (oldVersion !== newVersion) {
      packageJson.version = newVersion;

      const [externalPackageVersions, externalPeerDependencyVersions] = await getAllExternalPackageVersions(WORKSPACE_DIR);
      const internalPackageVersions = await getAllInternalPackageVersions(WORKSPACE_DIR, graph, nxProject);

      const unresolvedPackages = updatePackageDependencies(packageJson, internalPackageVersions, externalPackageVersions, externalPeerDependencyVersions);
      if (unresolvedPackages.length) {
        die(`no version found for package(s) '${unresolvedPackages.join("', '")}'`);
      }

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
    const changelogPath = path.resolve(projectRoot, 'CHANGELOG.md');
    if (fs.existsSync(changelogPath)) {
      verbose(`CHANGES (${path.relative(WORKSPACE_DIR, changelogPath)}):`);
    } else {
      verbose('CHANGES:');
    }
    logGitLogChanges(commits);
    return;
  } catch (err) {
    return Promise.reject(err);
  }
}
