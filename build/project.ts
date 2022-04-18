#!/usr/bin/env ts-node-script
// tslint:disable: no-console
import * as path from 'path';
import { Command } from 'commander';
import { die, error, log, setApplication } from './ts/utils/app';
import { readJson, writeJson } from './ts/utils/file';

setApplication(__filename);
const workdir = process.cwd();
const workspaceDir = path.relative(workdir, path.resolve(__dirname, '..'));

const nxJsonPath = path.join(workspaceDir, 'nx.json');
const workspaceJsonPath = path.join(workspaceDir, 'workspace.json');

// -----------------------------------------------------------------------------------------
async function renameProjectInWorkspaceJson(oldName: string, newName: string): Promise<void> {
  const filePath = workspaceJsonPath;
  const json = await readJson(filePath);
  if (json.projects[newName]) {
    throw new Error(`project '${newName}' already defined in '${filePath}'`);
  }
  const project = json.projects[oldName];
  if (!project) {
    throw new Error(`project '${oldName}' not found in '${filePath}'`);
  }
  if (project.prefix === oldName) {
    project.prefix = 'hot';
  }
  const serveBuildTarget = project.targets.serve?.options?.buildTarget;
  if (serveBuildTarget && serveBuildTarget.substr(0, oldName.length + 1) === `${oldName}:`) {
    project.targets.serve.options.buildTarget = newName + serveBuildTarget.substr(oldName.length);
  }
  delete json.projects[oldName];
  json.projects[newName] = project;
  if (json.defaultProject === oldName) {
    json.defaultProject = newName;
  }
  await writeJson(filePath, json);
}

// -----------------------------------------------------------------------------------------
async function renameProjectInNxJson(oldName: string, newName: string): Promise<void> {
  const filePath = nxJsonPath;
  const json = await readJson(filePath);
  if (json.projects[newName]) {
    throw new Error(`project '${newName}' already defined in '${filePath}'`);
  }
  const project = json.projects[oldName];
  if (!project) {
    throw new Error(`project '${oldName}' not found in '${filePath}'`);
  }
  delete json.projects[oldName];
  json.projects[newName] = project;
  await writeJson(filePath, json);
}

// -----------------------------------------------------------------------------------------
const program = new Command();
program
  .version('1.0')
  .command(`rename <old-name> <new-name>` /*, { isDefault: true }*/)
  .description('rename project')
  .action(async (oldName, newName) => {
    return Promise.all([renameProjectInWorkspaceJson(oldName, newName), renameProjectInNxJson(oldName, newName)])
      .catch((err) => {
        die(`failed: ${err}`);
      })
      .then(() => log(`succeeded`));
  });
program.parse(process.argv);
