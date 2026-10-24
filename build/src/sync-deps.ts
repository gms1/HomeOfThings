#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as path from 'node:path';
import * as process from 'node:process';

import { setEcho } from '@homeofthings/node-sys';
import { ProjectGraph, ProjectGraphProjectNode, readCachedProjectGraph } from '@nx/devkit';
import { Command } from 'commander';

import { APPNAME, die, getWorkspaceDir, log, setApplication, verbose, warn } from './utils/app';
import { readJson, writeJson } from './utils/file';
import { getAllExternalPackageVersions, getAllInternalPackageVersions, updatePackageDependencies } from './utils/projects/deps';
// -----------------------------------------------------------------------------------------
// NOTE: call this script using `npx nx run build:sync-deps`
//       synchronizes dependency versions of all workspace packages with the versions
//       defined in the root package.json and with the versions of the internal packages

setEcho(false);

setApplication(__filename);
const WORKSPACE_DIR = path.resolve(getWorkspaceDir());

const program = new Command();
program
  .version('1.0')
  .command(APPNAME, { isDefault: true })
  .description('synchronize dependency versions of all workspace packages')
  .action(async () => {
    return syncDepsCommand(readCachedProjectGraph())
      .catch((err) => {
        die(`failed: ${err}`);
      })
      .then(() => {
        log(`succeeded`);
      });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function syncDepsCommand(graph: ProjectGraph): Promise<void> {
  const [externalPackageVersions, externalPeerDependencyVersions] = await getAllExternalPackageVersions(WORKSPACE_DIR);

  const nxWorkspaceLibraryProjects = Object.values(graph.nodes).sort((a, b) => a.name.localeCompare(b.name));

  for (const nxProject of nxWorkspaceLibraryProjects) {
    if (!nxProject.data.root || nxProject.data.root === '.') {
      // this is the nx generated root project, we are not interested in;
      continue;
    }

    try {
      log(`synchronizing dependencies of project ${nxProject.name}...`);
      await syncProjectDependencies(graph, nxProject, externalPackageVersions, externalPeerDependencyVersions);
      log(`synchronizing dependencies of project ${nxProject.name}: done`);
    } catch (err) {
      die(`synchronizing dependencies of project ${nxProject.name}: failed: `, err);
    }
  }
}

// -----------------------------------------------------------------------------------------
async function syncProjectDependencies(
  graph: ProjectGraph,
  nxProject: ProjectGraphProjectNode,
  externalPackageVersions: any,
  externalPeerDependencyVersions: any,
): Promise<void> {
  const projectRoot = path.resolve(WORKSPACE_DIR, nxProject.data.root);
  const packageJsonPath = path.resolve(projectRoot, 'package.json');
  const packageJson = await readJson(packageJsonPath);
  if (!packageJson.name) {
    verbose(`no package name defined in '${packageJsonPath}', skipped`);
    return;
  }
  if (packageJson.private == true) {
    // private packages (e.g. the build tools or standalone benchmarks) are not
    // published and manage their dependencies on their own, their placeholders
    // are intentional
    verbose(`package '${packageJson.name}' is private, skipped`);
    return;
  }

  const packageJsonBefore = JSON.stringify(packageJson, undefined, 2);

  const internalPackageVersions = await getAllInternalPackageVersions(WORKSPACE_DIR, graph, nxProject);
  const unresolvedPackages = updatePackageDependencies(packageJson, internalPackageVersions, externalPackageVersions, externalPeerDependencyVersions);
  for (const unresolvedPackage of unresolvedPackages) {
    warn(`no version found for package '${unresolvedPackage}' in '${packageJsonPath}'`);
  }

  if (JSON.stringify(packageJson, undefined, 2) === packageJsonBefore) {
    verbose(`${packageJson.name}: dependencies already up-to-date`);
    return;
  }

  await writeJson(packageJsonPath, packageJson);
  warn(`${packageJson.name}: dependencies updated`);
}
