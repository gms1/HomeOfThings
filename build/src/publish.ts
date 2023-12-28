#!/usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

import { cp, exec, popd, pushd, setEcho } from '@homeofthings/node-sys';
import { ProjectGraph, readCachedProjectGraph } from '@nx/devkit';
import { Command } from 'commander';

import { APPNAME, die, getWorkspaceDir, invariant, log, LogLevel, setApplication, verbose, warn } from './utils/app';
import { enrichProject } from './utils/projects/enrich';
import { Project } from './utils/projects/model/project';

// -----------------------------------------------------------------------------------------
const LICENSE_FILE = 'LICENSE';
const README_FILE = 'README.md';
const CHANGELOG_FILE = 'CHANGELOG.md';

const FILES = [README_FILE, LICENSE_FILE, CHANGELOG_FILE];

setEcho(false);

setApplication(__filename);
const WORKSPACE_DIR = path.resolve(getWorkspaceDir());

const program = new Command();
program
  .version('1.0')
  .command(`${APPNAME} <project-name> [dry-run|run|force]`, { isDefault: true })
  .description('publish package')
  .action(async (projectName: string, mode?: string) => {
    return publishCommand(readCachedProjectGraph(), projectName, mode).catch((err) => {
      die(`failed: ${err}`);
    });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function publishCommand(graph: ProjectGraph, projectName: string, mode?: string): Promise<void> {
  const nxProject = graph.nodes[projectName];

  if (!nxProject) {
    die(`project '${projectName}' not found`);
  }
  invariant(!mode || /^(dry-run|run|force)$/.test(mode), LogLevel.FATAL, `invalid argument '${mode}', only 'dry-run', 'run' or 'force' allowed`);

  const project = await enrichProject(WORKSPACE_DIR, { ...nxProject } as Project);
  if (!project) {
    return;
  }
  if (!project.publishable) {
    verbose(`skipping non publishable project:   ${project.sourcePackageJson.name}: ` + project.nonPublishableReasons.join(', '));
    return;
  }
  if (project.published) {
    verbose(`skipping already published version: ${project.sourcePackageJson.name}@${project.sourcePackageJson.version}`);
    return;
  }
  if (!project.generated) {
    verbose(`skipping not generated project:     ${project.sourcePackageJson.name}@${project.sourcePackageJson.version}`);
    return;
  }

  log(`publishing: ${project.outputPackageJson.name}@${project.outputPackageJson.version} ...`);
  pushd(project.outputDir);

  try {
    // NOTE: executor @nx/rollup:rollup (used by jsonpointerx) does not copy files outside of srcRoot
    // so we copy them here if they do not exist
    for (const fileName of FILES) {
      const trgFile = fileName;
      const srcFile = path.resolve(WORKSPACE_DIR, project.data.root, fileName);
      if (!fs.existsSync(trgFile)) {
        if (fs.existsSync(srcFile)) {
          warn(`copying ${fileName}`);
          await cp(srcFile, trgFile, { preserveTimestamps: true });
        } else {
          warn(`missing ${fileName} file`);
        }
      }
    }
    invariant(project.outputPackageJson.description, LogLevel.WARN, `no description defined in '${project.sourcePackageJsonPath}'`);
    invariant(project.outputPackageJson.keywords?.length, LogLevel.WARN, `no keywords defined in '${project.sourcePackageJsonPath}'`);

    invariant(project.outputPackageJson.author?.email, LogLevel.FATAL, `no author.email defined in '${project.sourcePackageJsonPath}'`);
    invariant(project.outputPackageJson.license, LogLevel.FATAL, `no license defined in '${project.sourcePackageJsonPath}'`);
    invariant(project.outputPackageJson.repository?.url, LogLevel.FATAL, `no repository.url defined in '${project.sourcePackageJsonPath}'`);
    invariant(project.outputPackageJson.homepage, LogLevel.FATAL, `no homepage defined in '${project.sourcePackageJsonPath}'`);
    invariant(project.outputPackageJson.bugs?.url, LogLevel.FATAL, `no bugs.url defined in '${project.sourcePackageJsonPath}'`);
    if (mode !== 'force' && mode !== 'run') {
      warn(`skipping publishing ${project.sourcePackageJson.name}@${project.sourcePackageJson.version} because dry-run is enabled`);
      return;
    }
    await exec('npm', 'publish', '--access', 'public').run();
    if (project.outputPackageJson.deprecated) {
      warn(`waiting 1min before deprecating this package`);
      await new Promise((resolve) => setTimeout(resolve, 60000));
      await exec('npm', 'deprecate', project.outputPackageJson.name, project.outputPackageJson.deprecated).run();
    }
    log(`succeeded`);
  } catch (err) {
    return Promise.reject(err);
  } finally {
    popd();
  }
}
