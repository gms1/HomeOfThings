#!/usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

import { cp, exec, logEcho, pushd, popd, IGNORE } from '@homeofthings/node-sys';
import { readCachedProjectGraph, ProjectGraph, ProjectGraphProjectNode } from '@nx/devkit';
import { Command } from 'commander';
import * as debugjs from 'debug';

import { APPNAME, LogLevel, die, error, getWorkspaceDir, invariant, log, setApplication, warn } from './utils/app';
import { readJson } from './utils/file';

// -----------------------------------------------------------------------------------------
const LICENSE_FILE = 'LICENSE';
const README_FILE = 'README.md';

interface Project extends ProjectGraphProjectNode {
  sourcePackageJson: any;
  nonPublishableReasons: string[];
  publishable: boolean; // true if the project is not private and has a proper version
  generated: boolean; // true if the project is built
  published: boolean; // true if the project has already published for the current version
  outputDir: string;
  outputPackageJson?: any;
}

const debug = debugjs.default('build:publish');
logEcho(false);

setApplication(__filename);
const WORKSPACE_DIR = path.resolve(getWorkspaceDir());

const program = new Command();
program
  .version('1.0')
  .command(`${APPNAME} <project-name> `, { isDefault: true })
  .description('publish package')
  .action(async (projectName: string) => {
    return publish(readCachedProjectGraph(), projectName).catch((err) => {
      die(`failed: ${err}`);
    });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function publish(graph: ProjectGraph, projectName: string): Promise<void> {
  const nxProject = graph.nodes[projectName];

  if (!nxProject) {
    die(`project '${projectName}' not found`);
  }
  const project: Project = await enrichProject(nxProject);
  if (!project) {
    return;
  }
  if (!project.publishable) {
    log(`skipping non publishable project:   ${project.sourcePackageJson.name}: ` + project.nonPublishableReasons.join(', '));
    return;
  }
  if (!project.generated) {
    log(`skipping not generated project:     ${project.sourcePackageJson.name}@${project.sourcePackageJson.version}`);
    return;
  }
  if (project.published) {
    log(`skipping already published version: ${project.sourcePackageJson.name}@${project.sourcePackageJson.version}`);
    return;
  }

  log(`publishing: '${project.outputPackageJson.name}@${project.outputPackageJson.version}'`);
  pushd(project.outputDir);

  try {
    // NOTE: executor @nx/rollup:rollup (used by jsonpointerx) does not copy files outside of srcRoot
    // so we copy them here if they do not exist
    const hasLicense = fs.existsSync(LICENSE_FILE);
    if (!hasLicense) {
      await cp(path.resolve(WORKSPACE_DIR, project.data.root, LICENSE_FILE), LICENSE_FILE, { preserveTimestamps: true });
    }
    const hasReadme = fs.existsSync(README_FILE);
    if (!hasReadme) {
      await cp(path.resolve(WORKSPACE_DIR, project.data.root, README_FILE), README_FILE), { preserveTimestamps: true };
    }
    await exec('npm', 'publish', '--access public').run();
    log(`succeeded`);
  } catch (err) {
    return Promise.reject(err);
  } finally {
    popd();
  }
}

// -----------------------------------------------------------------------------------------
async function enrichProject(nxProject: ProjectGraphProjectNode): Promise<Project | undefined> {
  const project: Project = { ...nxProject } as any;
  project.nonPublishableReasons = [];
  project.publishable = false;
  project.published = false;
  project.generated = false;
  if (!nxProject.data.root || nxProject.data.root === '.') {
    // this is the nx generated root project, we are not interested in;
    return undefined;
  }

  project.outputDir = project.data?.targets?.build?.options?.outputPath;
  invariant(project.outputDir, LogLevel.FATAL, `Could not find "build.options.outputPath" of project "${project.name}". Is project.json configured  correctly?`);

  const sourcePackageJsonPath = path.resolve(WORKSPACE_DIR, nxProject.data.root, 'package.json');
  try {
    project.sourcePackageJson = await readJson(sourcePackageJsonPath);
  } catch {
    error(`failed to read '${sourcePackageJsonPath}'`);
    return undefined;
  }
  if (project.sourcePackageJson.private == true) {
    project.nonPublishableReasons.push('is private');
  } else {
    if (!project.sourcePackageJson.version) {
      project.nonPublishableReasons.push('has no version');
    }
    if (project.sourcePackageJson.version === '0.0.0') {
      project.nonPublishableReasons.push(`has version '${project.sourcePackageJson.version}'`);
    }
  }
  if (project.nonPublishableReasons.length) {
    return project;
  }
  project.publishable = true;
  const outputPackageJsonPath = path.resolve(WORKSPACE_DIR, project.outputDir, 'package.json');
  try {
    project.outputPackageJson = await readJson(outputPackageJsonPath);
  } catch {
    warn(`failed to read '${outputPackageJsonPath}'`);
    return project;
  }
  invariant(
    project.sourcePackageJson.name && project.sourcePackageJson.name == project.outputPackageJson.name,
    LogLevel.FATAL,
    `name differs between package jsons in '${sourcePackageJsonPath}' and '${outputPackageJsonPath}'`,
  );
  invariant(
    project.sourcePackageJson.version && project.sourcePackageJson.version == project.outputPackageJson.version,
    LogLevel.FATAL,
    `version differs between package jsons in '${sourcePackageJsonPath}' and '${outputPackageJsonPath}'`,
  );
  project.generated = true;
  const outputLines: string[] = [];
  const context = await exec('npm', 'view', project.outputPackageJson.name as string, 'versions', '--json')
    .setStdOut(outputLines)
    .setStdErr(IGNORE)
    .setIgnoreExitCode()
    .run();
  const output = outputLines.join('');
  let json: any;
  try {
    json = JSON.parse(output);
  } catch {
    die(`failed to parse json received from calling: npm view ${project.outputPackageJson.name} versions --json`);
    return undefined;
  }
  if (context.exitCode) {
    invariant(json.error?.code === 'E404', LogLevel.FATAL, `data recieved from calling 'npm view ${project.outputPackageJson.name} versions --json' is not an error: ${output}`);
    log(`${project.outputPackageJson.name} was never published`);
    return project;
  }
  invariant(Array.isArray(json), LogLevel.FATAL, `data recieved from calling 'npm view ${project.outputPackageJson.name} versions --json' is not a JSON array: ${output}`);
  debug('versions: ', output);
  if (json.indexOf(project.outputPackageJson.version) >= 0) {
    project.published = true;
  } else {
    log(`${project.outputPackageJson.name}@${project.outputPackageJson.version} not yet published`);
  }
  return project;
}
