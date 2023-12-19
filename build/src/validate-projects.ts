#!/usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-explicit-any */

import { setEcho } from '@homeofthings/node-sys';
import { readCachedProjectGraph, ProjectGraph } from '@nx/devkit';
import { Command } from 'commander';
import * as debugjs from 'debug';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

import { APPNAME, ERRORS, LogLevel, WARNINGS, die, getWorkspaceDir, invariant, log, setApplication } from './utils/app';
import { readJson } from './utils/file';
import { glob } from './utils/glob';
import { setProjectSourcePackageJson } from './utils/projects/enrich';
import { Project } from './utils/projects/model/project';

// -----------------------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debug = debugjs.default('build:validate-projects');
setEcho(false);

setApplication(__filename);
const WORKSPACE_DIR = path.resolve(getWorkspaceDir());

const program = new Command();
program
  .version('1.0')
  .command(APPNAME, { isDefault: true })
  .description('valid project configurations')
  .action(async () => {
    return validateProjectsCommand(readCachedProjectGraph())
      .catch((err) => {
        die(`failed: ${err}`);
      })
      .then(() => {
        log(`succeeded`);
      });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function validateProjectsCommand(graph: ProjectGraph): Promise<void> {
  const nxWorkspaceLibraryProjects = Object.values(graph.nodes);

  for (const nxProject of nxWorkspaceLibraryProjects) {
    if (!nxProject.data.root || nxProject.data.root === '.') {
      // this is the nx generated root project, we are not interested in;
      continue;
    }

    const project: Project = { ...nxProject } as any;
    try {
      log(`validating project ${project.name}...`);
      await validateProject(project);
      log(`validating project ${project.name}: done`);
    } catch (err) {
      die(`validating project ${project.name}: failed: `, err);
    }
  }
  if (ERRORS) {
    die(`${ERRORS} error(s) and ${WARNINGS} warning(s) found`);
  }
}

async function validateProject(inputProject: Project) {
  // validate package.json
  const project = await setProjectSourcePackageJson(WORKSPACE_DIR, { ...inputProject });
  if (!project) {
    return;
  }

  if (project.sourcePackageJson) {
    invariant(
      project.sourcePackageJson.version != '0.0.1',
      LogLevel.ERROR,
      `wrong version in '${project.sourcePackageJsonPath}', we should not use the version '${project.sourcePackageJson.version}', since it is the default`,
    );
  }

  const projectRootDir = path.resolve(WORKSPACE_DIR, project.data.root);
  const projectJsonPath = path.resolve(projectRootDir, 'project.json');
  const projectJson = await readJson(projectJsonPath);
  invariant(projectJson, LogLevel.FATAL, `file '${projectJsonPath}' not found`);

  // validate $schema in project.json
  if (projectJson.$schema) {
    const projectJsonSchemaPath = path.resolve(projectRootDir, projectJson.$schema);
    invariant(fs.existsSync(projectJsonSchemaPath), LogLevel.ERROR, `wrong $schema property in project.json '${projectJsonPath}'`);
  } else {
    invariant(true, LogLevel.ERROR, `no $schema property in project.json '${projectJsonPath}'`);
  }

  // validate targets.build command
  const build = projectJson.targets?.build;
  invariant(build, LogLevel.ERROR, `target named 'build' not in project.json '${projectJsonPath}'`);
  if (build && project.sourcePackageJson) {
    const outputPath = build.options.outputPath;
    const expectedOutputPath = project.name === 'build' ? `dist/build` : `dist/packages/${project.sourcePackageJson.name}`;
    invariant(
      outputPath === expectedOutputPath,
      LogLevel.ERROR,
      `target.build.options.outputPath is '${outputPath}' instead of '${expectedOutputPath}' in project.json '${projectJsonPath}'`,
    );
  }

  // validate targets.publish command
  const publish = projectJson.targets?.publish;
  invariant(publish, LogLevel.ERROR, `target named 'publish' not in project.json '${projectJsonPath}'`);
  if (publish) {
    const command = publish.options?.command ?? '';
    const args = command.split(/ /);
    invariant(
      args[2] === project.name,
      LogLevel.ERROR,
      `argument 1 in targets.publish.options.command is '${args[2]}' instead of '${project.name}' in project.json '${projectJsonPath}'`,
    );
    invariant(
      args[3] === '{args.mode}',
      LogLevel.ERROR,
      `argument 2 in targets.publish.options.command is '${args[3]}' instead of '{args.mode}' in project.json '${projectJsonPath}'`,
    );
    const envFile = publish.options?.envFile;
    invariant(envFile === 'build/.env', LogLevel.ERROR, `targets.publish.options.envFile is set to '${envFile}' instead of 'build/.env' in project.json '${projectJsonPath}'`);
    const dependsOn = publish.dependsOn;
    invariant(Array.isArray(dependsOn) && dependsOn.includes('build'), LogLevel.ERROR, `targets.publish does not depend on 'build' in project.json '${projectJsonPath}'`);
  }

  // validate targets.version-bump command
  const versionBump = projectJson.targets?.['version-bump'];
  invariant(versionBump, LogLevel.ERROR, `target named 'version-bump' not in project.json '${projectJsonPath}'`);
  if (versionBump) {
    const command = versionBump.options?.command ?? '';
    const args = command.split(/ /);
    invariant(
      args[2] === project.name,
      LogLevel.ERROR,
      `argument 1 in targets.version-bump.options.command is '${args[2]}' instead of '${project.name}' in project.json '${projectJsonPath}'`,
    );
    invariant(
      args[3] === '{args.ver}',
      LogLevel.ERROR,
      `argument 2 in targets.version-bump.options.command is '${args[3]}' instead of '{args.ver}' in project.json '${projectJsonPath}'`,
    );
    const envFile = versionBump.options?.envFile;
    invariant(envFile === 'build/.env', LogLevel.ERROR, `targets.version-bump.options.envFile is set to '${envFile}' instead of 'build/.env' in project.json '${projectJsonPath}'`);
  }

  // validate tsConfig*.json
  const tsConfigs = await glob(path.join(projectRootDir, 'tsconfig*.json'));
  for (const tsConfig of tsConfigs) {
    const json = await readJson(tsConfig);

    // validate compilerOptions.outDir
    const outDir = json.compilerOptions?.outDir;
    if (!outDir) {
      continue;
    }
    const outputPath = path.resolve(projectRootDir, outDir);
    const expectedOutputPath = path.resolve(WORKSPACE_DIR, 'dist', 'out-tsc');
    invariant(outputPath === expectedOutputPath, LogLevel.ERROR, `outDir is '${outputPath}' instead of '${expectedOutputPath}' in '${tsConfig}'`);
  }
}
