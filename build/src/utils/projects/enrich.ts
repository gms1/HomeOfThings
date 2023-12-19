/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGNORE, exec, fs } from '@homeofthings/node-sys';
import * as debugjs from 'debug';
import * as path from 'node:path';

import { Project } from './model/project';
import { LogLevel, die, error, invariant, verbose, warn } from '../app';
import { readJson } from '../file';

const debug = debugjs.default('build:projects:enrich');

/*
 * set source package.json
 *
 */
export async function setProjectSourcePackageJson(workspaceRootDir: string, project: Project): Promise<Project | undefined> {
  if (!project.data.root || project.data.root === '.') {
    // this is the nx generated root project, we are not interested in;
    return undefined;
  }
  project.outputDir = project.data?.targets?.build?.options?.outputPath;
  invariant(project.outputDir, LogLevel.FATAL, `Could not find "build.options.outputPath" of project "${project.name}". Is project.json configured  correctly?`);

  project.sourcePackageJsonPath = path.resolve(workspaceRootDir, project.data.root, 'package.json');
  if (!(await fs.exists(project.sourcePackageJsonPath))) {
    project.nonPublishableReasons.push('no package.json');
    return project;
  }
  try {
    project.sourcePackageJson = await readJson(project.sourcePackageJsonPath);
  } catch (err) {
    error(`failed to read '${project.sourcePackageJsonPath}': `, err);
    return project;
  }
  return project;
}

/*
 * check if a probjects build is publishable
 *
 */
export async function setProjectPublishable(workspaceRootDir: string, project: Project): Promise<Project | undefined> {
  project.nonPublishableReasons = [];
  project.publishable = false;

  await setProjectSourcePackageJson(workspaceRootDir, project);
  if (!project?.sourcePackageJson) {
    return project;
  }

  if (project.sourcePackageJson.private == true) {
    project.nonPublishableReasons.push('is private');
  } else {
    if (!project.sourcePackageJson.version) {
      project.nonPublishableReasons.push('has no version');
    }
    if (/^0\.0\.[01]{1}$/.test(project.sourcePackageJson.version)) {
      project.nonPublishableReasons.push(`has version '${project.sourcePackageJson.version}'`);
    }
  }
  if (project.nonPublishableReasons.length) {
    return project;
  }
  project.publishable = true;
  return project;
}

/*
 * check if the current version of a probject is already published
 *
 */
export async function setProjectPublished(workspaceRootDir: string, project: Project): Promise<Project | undefined> {
  project.published = false;

  const outputLines: string[] = [];
  const exitCode = await exec('npm', 'view', project.sourcePackageJson.name as string, 'versions', '--json')
    .setStdOut(outputLines)
    .setStdErr(IGNORE)
    .setIgnoreExitCode()
    .run();
  const output = outputLines.join('');
  let json: any;
  try {
    json = JSON.parse(output);
  } catch {
    die(`failed to parse json received from calling: npm view ${project.sourcePackageJson.name} versions --json`);
    return undefined;
  }
  if (exitCode) {
    invariant(json.error?.code === 'E404', LogLevel.FATAL, `data recieved from calling 'npm view ${project.sourcePackageJson.name} versions --json' is not an error: ${output}`);
    verbose(`${project.sourcePackageJson.name} was never published`);
    return project;
  }
  invariant(
    Array.isArray(json) || typeof json === 'string',
    LogLevel.FATAL,
    `data recieved from calling 'npm view ${project.sourcePackageJson.name} versions --json' is not a JSON array or string: ${output}`,
  );
  if (!Array.isArray(json)) {
    json = [json];
  }
  debug('versions: ', output);
  if (json.indexOf(project.sourcePackageJson.version) >= 0) {
    project.published = true;
  } else {
    verbose(`${project.sourcePackageJson.name}@${project.sourcePackageJson.version} not yet published`);
  }
  return project;
}

/*
 * check if a probjects build is generated
 * NOTE: the target publish command depends on the target build, so the current build should be up-to-date
 */
export async function setProjectGenerated(workspaceRootDir: string, project: Project): Promise<Project | undefined> {
  project.generated = false;

  // validate package.json in output directory
  const outputPackageJsonPath = path.resolve(workspaceRootDir, project.outputDir, 'package.json');
  try {
    project.outputPackageJson = await readJson(outputPackageJsonPath);
  } catch (err) {
    warn(`failed to read '${outputPackageJsonPath}': `, err);
    return project;
  }
  invariant(
    project.sourcePackageJson.name && project.sourcePackageJson.name == project.outputPackageJson.name,
    LogLevel.FATAL,
    `name differs between package jsons in '${project.sourcePackageJsonPath}' and '${outputPackageJsonPath}'`,
  );
  invariant(
    project.sourcePackageJson.version && project.sourcePackageJson.version == project.outputPackageJson.version,
    LogLevel.FATAL,
    `version differs between package jsons in '${project.sourcePackageJsonPath}' and '${outputPackageJsonPath}'`,
  );

  project.generated = true;
  return project;
}

export async function enrichProject(workspaceRootDir: string, inputProject: Project): Promise<Project | undefined> {
  let project = await setProjectPublishable(workspaceRootDir, inputProject);
  if (!project?.publishable) {
    return project;
  }
  project = await setProjectPublished(workspaceRootDir, project);
  if (!project || project.published) {
    return project;
  }
  project = await setProjectGenerated(workspaceRootDir, project);
  return project;
}
