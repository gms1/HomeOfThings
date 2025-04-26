#!/usr/bin/env ts-node-script

import * as path from 'node:path';
import * as process from 'node:process';

import { setEcho } from '@homeofthings/node-sys';
import { ProjectGraph, readCachedProjectGraph } from '@nx/devkit';
import { Command } from 'commander';
import * as debugjs from 'debug';

import { APPNAME, die, getWorkspaceDir, setApplication } from './utils/app';
import { gitLogChanges, logGitLogChanges } from './utils/git/log';
import { setProjectPublishable } from './utils/projects/enrich';
import { Project } from './utils/projects/model/project';

// -----------------------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debug = debugjs.default('build:changelog');
setEcho(false);

setApplication(__filename);
const WORKSPACE_DIR = path.resolve(getWorkspaceDir());

const program = new Command();
program
  .version('1.0')
  .command(`${APPNAME} <project-name>`, { isDefault: true })
  .description('print changelog for project')
  .action(async (projectName: string) => {
    return changeLogsCommand(readCachedProjectGraph(), projectName)
      .catch((err) => {
        die(`failed: ${err}`);
      });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function changeLogsCommand(graph: ProjectGraph, projectName: string): Promise<void> {
  const nxProject = graph.nodes[projectName];
  if (!nxProject) {
    die(`project '${projectName}' not found`);
    return;
  }

  try {
    await changeLog(nxProject as Project);
  } catch (err) {
    die(`changelog for project ${nxProject.name}: failed: `, err);
  }
}

async function changeLog(nxProject: Project): Promise<Project | undefined> {
  const project = await setProjectPublishable(WORKSPACE_DIR, { ...nxProject } as Project);
  if (!project) {
    return project;
  }

  const commits = await gitLogChanges(path.resolve(WORKSPACE_DIR, project.data.root));
  if (!commits.length) {
    return;
  }

  logGitLogChanges(commits, project.publishable);
  return project;
}
