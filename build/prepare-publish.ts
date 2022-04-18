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

// -----------------------------------------------------------------------------------------
const program = new Command();
program
  .version('1.0')
  .command(`prepare-publish`, { isDefault: true })
  .description('prepare all projects for publishing')
  .action(async () => {
    return preparePublishing()
      .catch((err) => {
        die(`failed: ${err}`);
      })
      .then(() => {
        log(`succeeded`);
      });
  });
program.parse(process.argv);

async function preparePublishing(): Promise<void> {
  try {
    const workspace = await readJson(workspaceJsonPath);
    if (!workspace.projects) {
      warn(`no projects are currently defined`);
      return Promise.resolve();
    }
    await Promise.all(
      Object.keys(workspace.projects)
        .filter((projectName) => workspace.projects[projectName].projectType === 'library')
        .sort((a, b) => a.localeCompare(b))
        .map((projectName) => prepareProject(projectName, path.join(workspace.projects[projectName].targets?.build?.options?.outputPath, 'package.json'))),
    );
  } catch (err) {
    return Promise.reject(err);
  }
  return Promise.resolve();
}

async function prepareProject(projectName: string, filePath?: string): Promise<void> {
  try {
    const packageJson = await readJson(filePath);

    // special dependencies as peer dependencies
    if (packageJson.dependencies) {
      const peerDependencies = Object.keys(packageJson.dependencies).filter((dep) => dep.startsWith('@nestjs/') || dep.startsWith('@angular/') || dep === 'rxjs');
      if (peerDependencies.length) {
        packageJson.peerDependencies = packageJson.peerDependencies || {};
        peerDependencies.forEach((dep) => {
          let depVersion = packageJson.dependencies[dep];
          if (depVersion.startsWith('~')) {
            depVersion = '^' + depVersion.substring(1);
          }
          packageJson.peerDependencies[dep] = depVersion;
          delete packageJson.dependencies[dep];
        });
        if (!Object.keys(packageJson.dependencies).length) {
          delete packageJson.dependencies;
        }
      }
    }

    // enable publishing
    if (packageJson.scripts) {
      delete packageJson.scripts['prepublishOnly'];
      if (!Object.keys(packageJson.scripts).length) {
        delete packageJson.scripts;
      }
    }
    await writeJson(filePath, packageJson);
    log(`${packageJson.name} ${packageJson.version} done`);
  } catch (err) {
    return Promise.reject(err);
  }
}
