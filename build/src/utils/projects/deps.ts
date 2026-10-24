/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { Dictionary } from '@homeofthings/node-utils';
import { ProjectGraph, ProjectGraphProjectNode } from '@nx/devkit';

import { readJson } from '../file';

// -----------------------------------------------------------------------------------------
export const DEP_SECTIONS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const;

// -----------------------------------------------------------------------------------------
export async function getAllExternalPackageVersions(workspaceRootDir: string): Promise<[Dictionary, Dictionary]> {
  const rootPackageJson = await readJson(path.resolve(workspaceRootDir, 'package.json'));
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

// -----------------------------------------------------------------------------------------
export async function getAllInternalPackageVersions(
  workspaceRootDir: string,
  graph: ProjectGraph,
  nxProject: ProjectGraphProjectNode,
): Promise<Dictionary> {
  const internalPackageVersions: Dictionary = {};
  for (const otherProjectName in graph.nodes) {
    const otherNxProject = graph.nodes[otherProjectName] as ProjectGraphProjectNode;
    if (otherNxProject.data.root === nxProject.data.root) {
      continue;
    }
    const otherProjectPackageJson = path.resolve(workspaceRootDir, otherNxProject.data.root, 'package.json');
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

// -----------------------------------------------------------------------------------------
/*
 * update dependency versions in a package.json:
 *   - internal dependencies are set to '~<version of the internal package>'
 *   - external and peer dependencies are set to the version defined in the root package.json
 *
 * returns the list of dependencies which could not be resolved
 */
export function updatePackageDependencies(
  packageJson: any,
  internalPackageVersions: Dictionary,
  externalPackageVersions: Dictionary,
  externalPeerDependencyVersions: Dictionary,
): string[] {
  const unresolved: string[] = [];
  for (const depType of DEP_SECTIONS) {
    if (!packageJson[depType]) {
      continue;
    }
    const dependencies: { [name: string]: string } = packageJson[depType];
    for (const depPackageName in dependencies) {
      if (internalPackageVersions[depPackageName]) {
        dependencies[depPackageName] = '~' + internalPackageVersions[depPackageName];
        continue;
      }
      const externalVersion = (externalPeerDependencyVersions[depPackageName] || externalPackageVersions[depPackageName]) as string;
      if (externalVersion) {
        dependencies[depPackageName] = externalVersion;
        continue;
      }
      unresolved.push(depPackageName);
    }
  }
  return unresolved;
}
