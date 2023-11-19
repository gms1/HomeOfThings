#!/usr/bin/env ts-node-script
import * as path from 'path';
import * as fs from 'node:fs';
import * as process from 'process';
import { Command } from 'commander';
import { APPNAME, LogLevel, die, error, getWorkspaceDir, invariant, log, setApplication, warn } from './ts/utils/app';
import { readJson, writeJson } from './ts/utils/file';
import { readCachedProjectGraph, ProjectGraph, ProjectGraphProjectNode } from '@nx/devkit';
import { spawn } from './ts/utils/process';
import { copyFile } from './ts/utils/fs';
// -----------------------------------------------------------------------------------------
const LICENSE_FILE="LICENSE";
const README_FILE="README.md";

interface Project extends ProjectGraphProjectNode {
  sourcePackageJson: any;
  publishable: boolean; // true if the project is not private and has a proper version
  generated: boolean; // true if the project is built
  published: boolean; // true if the project has already published for the current version
  outputDir: string;
  outputPackageJson?: any;
}

function isGenerated(project?: Project): boolean {
  return project && project.publishable && project.generated;
}

function isPublishable(project?: Project): boolean {
  return isGenerated(project) && !project.published;
}

setApplication(__filename);
const WORKSPACE_DIR = path.resolve(getWorkspaceDir());

const program = new Command();
program
  .version('1.0')
  .command(APPNAME, { isDefault: true })
  .description('prepare all projects for publishing')
  .action(async () => {
    return publish(readCachedProjectGraph())
      .catch((err) => {
        die(`failed: ${err}`);
      })
      .then(() => {
        log(`succeeded`);
      });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function publish(graph: ProjectGraph): Promise<void> {
  const nxWorkspaceLibraryProjects = Object.values(graph.nodes).filter((n) => n.type === 'lib');

  const projects: Project[] = [];
  for (const nxProject of nxWorkspaceLibraryProjects) {
    const project: Project = await enrichProject(nxProject);
    if (!project) {
      continue;
    }
    if (!isPublishable(project)) {
      if (isGenerated(project)) {
        log(`${project.sourcePackageJson.name}@${project.sourcePackageJson.version}: skipping already published version`);
      } else {
        log(`${project.sourcePackageJson.name}@${project.sourcePackageJson.version}: is not publishable`);
      }
      continue;
    }
    projects.push(project);
  }

  for (const project of projects) {
    log(`publishing: '${project.sourcePackageJson.name}@${project.sourcePackageJson.version}'`);
    process.chdir(project.outputDir);

    try {
      // NOTE: executor @nx/rollup:rollup (used by jsonpointerx) does not copy files outside of srcRoot
      // so we copy them here if they do not exist
      const hasLicense = fs.existsSync(LICENSE_FILE);
      const hasReadme = fs.existsSync(README_FILE);
      if (!hasLicense) {
        await copyFile(path.resolve(WORKSPACE_DIR, project.data.sourceRoot, LICENSE_FILE), LICENSE_FILE);
      }
      if (!hasReadme) {
        await copyFile(path.resolve(WORKSPACE_DIR, project.data.sourceRoot, README_FILE), README_FILE);
      }

      const output  = await spawn('npm', 'publish', '--access public');
      console.log(output);
    } catch(err) {
      return Promise.reject(err);
    } finally {
      process.chdir(WORKSPACE_DIR)
    }
  }
}

// -----------------------------------------------------------------------------------------
async function enrichProject(nxProject: ProjectGraphProjectNode): Promise<Project | undefined> {
  const project: Project = { ...nxProject } as any;
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
  if (project.sourcePackageJson.private == true || !project.sourcePackageJson.version || project.sourcePackageJson.version === '0.0.0') {
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
  const versionsString = await spawn('npm', 'view', project.outputPackageJson.name as string, 'versions', '--json');
  let versions: string[];
  try {
    versions = JSON.parse(versionsString);
  } catch {
    die(`failed to parse json received from calling: npm view ${project.outputPackageJson.name} versions --json`);
    return undefined;
  }
  invariant(
    Array.isArray(versions),
    LogLevel.FATAL,
    `data recieved from calling 'npm view ${project.outputPackageJson.name} versions --json' is not an array: ${versionsString}`
  );
  if (versions.indexOf(project.outputPackageJson.version) >= 0) {
    project.published = true;
  } else {
    warn(`'${project.outputPackageJson.version}' not found in `, versions);
  }
  return project;
}
