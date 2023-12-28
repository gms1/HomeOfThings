#!/usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as path from 'node:path';
import * as process from 'node:process';

import { setEcho } from '@homeofthings/node-sys';
import { ProjectGraph, readCachedProjectGraph } from '@nx/devkit';
import { Command } from 'commander';
import * as debugjs from 'debug';

import { APPNAME, die, getWorkspaceDir, log, setApplication } from './utils/app';
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
  .command(APPNAME, { isDefault: true })
  .description('print changelog for projects')
  .action(async () => {
    return changeLogsCommand(readCachedProjectGraph())
      .catch((err) => {
        die(`failed: ${err}`);
      })
      .then(() => {
        log(`succeeded`);
      });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function changeLogsCommand(graph: ProjectGraph): Promise<void> {
  const nxWorkspaceLibraryProjects = Object.values(graph.nodes);

  for (const nxProject of nxWorkspaceLibraryProjects) {
    if (!nxProject.data.root || nxProject.data.root === '.') {
      // this is the nx generated root project, we are not interested in;
      continue;
    }
    try {
      await changeLog(nxProject as Project);
    } catch (err) {
      die(`changelog for project ${nxProject.name}: failed: `, err);
    }
  }
}

async function changeLog(nxProject: Project): Promise<Project | undefined> {
  const project = await setProjectPublishable(WORKSPACE_DIR, { ...nxProject } as Project);
  if (!project?.publishable) {
    return project;
  }

  const commits = await gitLogChanges(path.resolve(WORKSPACE_DIR, project.data.root));
  if (!commits.length) {
    return;
  }
  logGitLogChanges(commits);
  return project;
}
