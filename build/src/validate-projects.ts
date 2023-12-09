#!/usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

import { logEcho } from '@homeofthings/node-sys';
import { readCachedProjectGraph, ProjectGraph, ProjectGraphProjectNode } from '@nx/devkit';
import { Command } from 'commander';
import * as debugjs from 'debug';

import { APPNAME, ERRORS, LogLevel, WARNINGS, die, getWorkspaceDir, invariant, log, setApplication } from './utils/app';
import { readJson } from './utils/file';
import { glob } from './utils/glob';

// -----------------------------------------------------------------------------------------

interface Project extends ProjectGraphProjectNode {
  packageJson: any;
  projectJson: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debug = debugjs.default('build:validate-projects');
logEcho(false);

setApplication(__filename);
const WORKSPACE_DIR = path.resolve(getWorkspaceDir());

const program = new Command();
program
  .version('1.0')
  .command(APPNAME, { isDefault: true })
  .description('prepare all projects for publishing')
  .action(async () => {
    return validate(readCachedProjectGraph())
      .catch((err) => {
        die(`failed: ${err}`);
      })
      .then(() => {
        log(`succeeded`);
      });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function validate(graph: ProjectGraph): Promise<void> {
  const nxWorkspaceLibraryProjects = Object.values(graph.nodes);

  for (const nxProject of nxWorkspaceLibraryProjects) {
    if (!nxProject.data.root || nxProject.data.root === '.') {
      // this is the nx generated root project, we are not interested in;
      continue;
    }

    const project: Project = { ...nxProject } as any;
    log(`validating project ${project.name}...`);
    try {
      const projectRootDir = path.resolve(WORKSPACE_DIR, nxProject.data.root);

      const projectJsonPath = path.resolve(projectRootDir, 'project.json');
      project.projectJson = await readProjectJson(projectJsonPath);
      invariant(project.projectJson, LogLevel.FATAL, `file '${projectJsonPath}' not found`);

      const packageJsonPath = path.resolve(projectRootDir, 'package.json');
      project.packageJson = await readProjectJson(packageJsonPath);
      invariant(project.projectJson, project.type === 'lib' ? LogLevel.ERROR : LogLevel.INFO, `file '${packageJsonPath}' not found`);

      // validate $schema in project.json
      if (project.projectJson.$schema) {
        const projectJsonSchemaPath = path.resolve(projectRootDir, project.projectJson.$schema);
        invariant(fs.existsSync(projectJsonSchemaPath), LogLevel.ERROR, `wrong $schema property in project.json '${projectJsonPath}'`);
      } else {
        invariant(true, LogLevel.ERROR, `no $schema property in project.json '${projectJsonPath}'`);
      }

      // validate targets.build command
      const build = project.projectJson.targets?.build;
      invariant(build, LogLevel.ERROR, `target named 'build' not in project.json '${projectJsonPath}'`);
      if (build && project.packageJson) {
        const outputPath = build.options.outputPath;
        const expectedOutputPath = project.name === 'build' ? `dist/build` : `dist/packages/${project.packageJson.name}`;
        invariant(
          outputPath === expectedOutputPath,
          LogLevel.ERROR,
          `target.build.options.outputPath is '${outputPath}' instead of '${expectedOutputPath}' in project.json '${projectJsonPath}'`,
        );
      }

      // validate targets.publish command
      const publish = project.projectJson.targets?.publish;
      invariant(publish, LogLevel.ERROR, `target named 'publish' not in project.json '${projectJsonPath}'`);
      if (publish) {
        const command = publish.options?.command ?? '';
        const args = command.split(/ /);
        invariant(
          args[2] === nxProject.name,
          LogLevel.ERROR,
          `argument 1 in targets.publish.options.command is '${args[2]}' instead of '${nxProject.name}' in project.json '${projectJsonPath}'`,
        );
        const envFile = publish.options?.envFile;
        invariant(envFile === 'build/.env', LogLevel.ERROR, `targets.publish.options.envFile is set to '${envFile}' instead of 'build/.env' in project.json '${projectJsonPath}'`);
        const dependsOn = publish.dependsOn;
        invariant(Array.isArray(dependsOn) && dependsOn.includes('build'), LogLevel.ERROR, `targets.publish does not depend on 'build' in project.json '${projectJsonPath}'`);
      }

      // validate targets.version-bump command
      const versionBump = project.projectJson.targets?.['version-bump'];
      invariant(versionBump, LogLevel.ERROR, `target named 'version-bump' not in project.json '${projectJsonPath}'`);
      if (versionBump) {
        const command = versionBump.options?.command ?? '';
        const args = command.split(/ /);
        invariant(
          args[2] === nxProject.name,
          LogLevel.ERROR,
          `argument 1 in targets.version-bump.options.command is '${args[2]}' instead of '${nxProject.name}' in project.json '${projectJsonPath}'`,
        );
        invariant(
          args[3] === '{args.ver}',
          LogLevel.ERROR,
          `argument 1 in targets.version-bump.options.command is '${args[2]}' instead of '{args.ver}' in project.json '${projectJsonPath}'`,
        );
        const envFile = versionBump.options?.envFile;
        invariant(
          envFile === 'build/.env',
          LogLevel.ERROR,
          `targets.version-bump.options.envFile is set to '${envFile}' instead of 'build/.env' in project.json '${projectJsonPath}'`,
        );
      }

      // validate tsConfig*.json
      const tsConfigs = await glob(path.join(projectRootDir, 'tsconfig*.json'));
      for (const tsConfig of tsConfigs) {
        const json = await readProjectJson(tsConfig);

        // validate compilerOptions.outDir
        const outDir = json.compilerOptions?.outDir;
        if (!outDir) {
          continue;
        }
        const outputPath = path.resolve(projectRootDir, outDir);
        const expectedOutputPath = path.resolve(WORKSPACE_DIR, 'dist', 'out-tsc');
        invariant(outputPath === expectedOutputPath, LogLevel.ERROR, `outDir is '${outputPath}' instead of '${expectedOutputPath}' in '${tsConfig}'`);
      }

      log(`validating project ${project.name}: done`);
    } catch {
      die('failed to validate');
    }
  }
  if (ERRORS) {
    die(`${ERRORS} error(s) and ${WARNINGS} warning(s) found`);
  }
}

async function readProjectJson(path: string): Promise<any> {
  if (!fs.existsSync(path)) {
    return undefined;
  }
  try {
    return await readJson(path);
  } catch {
    throw new Error(`failed to read '${path}'`);
  }
}
