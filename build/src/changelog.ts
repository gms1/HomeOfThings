#!/usr/bin/env tsx

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

import { setEcho } from '@homeofthings/node-sys';
import { ProjectGraph, readCachedProjectGraph } from '@nx/devkit';
import { Command } from 'commander';
import * as debugjs from 'debug';

import { APPNAME, die, getWorkspaceDir, log, setApplication, verbose, warn } from './utils/app';
import { readTextFile, writeFile, writeTextFile } from './utils/file';
import { gitLogChanges, loadHashMap, logGitLogChanges } from './utils/git/log';
import { GitCommit } from './utils/git/model/commit';
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
  .option('--write', 'write changelog to CHANGELOG.md file instead of printing to stdout')
  .action(async (projectName: string, options: { write?: boolean }) => {
    return changeLogsCommand(readCachedProjectGraph(), projectName, options.write)
      .catch((err) => {
        die(`failed: ${err}`);
      });
  });
program.parse(process.argv);

// -----------------------------------------------------------------------------------------
async function changeLogsCommand(graph: ProjectGraph, projectName: string, writeMode?: boolean): Promise<void> {
  const nxProject = graph.nodes[projectName];
  if (!nxProject) {
    die(`project '${projectName}' not found`);
    return;
  }

  try {
    await changeLog(nxProject as Project, writeMode);
  } catch (err) {
    die(`changelog for project ${nxProject.name}: failed: `, err);
  }
}

// -----------------------------------------------------------------------------------------
async function changeLog(nxProject: Project, writeMode?: boolean): Promise<Project | undefined> {
  const project = await setProjectPublishable(WORKSPACE_DIR, { ...nxProject } as Project);
  if (!project || !project.publishable) {
    if (project?.nonPublishableReasons?.length) {
      verbose(`skipping ${nxProject.name}: ${project.nonPublishableReasons.join(', ')}`);
    }
    return project;
  }

  const hashMap = loadHashMap(WORKSPACE_DIR);
  const commits = await gitLogChanges(path.resolve(WORKSPACE_DIR, project.data.root), WORKSPACE_DIR, hashMap);
  if (!commits.length) {
    if (writeMode) {
      // Still write "maintenance release" if there are no changelog-relevant commits but version was bumped
      await writeChangelog(project, []);
    }
    return project;
  }

  logGitLogChanges(commits, project.publishable);

  if (writeMode) {
    await writeChangelog(project, commits);
  }

  return project;
}

// -----------------------------------------------------------------------------------------
const COMMIT_TYPE_PRIORITY: Record<string, number> = {
  feat: 1,
  perf: 2,
  fix: 3,
  revert: 4,
  unknown: 5,
};

function formatChangelogEntry(version: string, commits: GitCommit[]): string {
  // Deduplicate by commit hash
  const seen = new Set<string>();
  const uniqueCommits = commits.filter((commit) => {
    if (seen.has(commit.hash)) {
      return false;
    }
    seen.add(commit.hash);
    return true;
  });

  const lines: string[] = [];

  // Check if all commits are just chore commits (dependency upgrades etc.)
  const isMaintenance = uniqueCommits.length === 0 || uniqueCommits.every(
    (commit) => commit.type === 'chore' || commit.type === 'refactor' || commit.type === 'style',
  );

  lines.push(`## ${version}`);
  lines.push('');

  if (isMaintenance) {
    lines.push('- maintenance release');
  } else {
    const filteredCommits = uniqueCommits.filter(
      (commit) => commit.type !== 'chore' && commit.type !== 'refactor' && commit.type !== 'style',
    );
    filteredCommits.sort((a, b) => {
      const priorityA = COMMIT_TYPE_PRIORITY[a.type] ?? 99;
      const priorityB = COMMIT_TYPE_PRIORITY[b.type] ?? 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.title.localeCompare(b.title);
    });
    for (const commit of filteredCommits) {
      lines.push(`- ${commit.title}`);
    }
  }
  lines.push('');

  return lines.join('\n');
}

// -----------------------------------------------------------------------------------------
async function writeChangelog(project: Project, commits: GitCommit[]): Promise<void> {
  const projectRoot = path.resolve(WORKSPACE_DIR, project.data.root);
  const changelogPath = path.resolve(projectRoot, 'CHANGELOG.md');
  const packageName = project.sourcePackageJson?.name ?? path.basename(projectRoot);
  const version = project.sourcePackageJson?.version ?? '0.0.0';

  const title = `# CHANGELOG for ${packageName}`;
  const newEntry = formatChangelogEntry(version, commits);

  let existingContent = '';
  if (fs.existsSync(changelogPath)) {
    existingContent = await readTextFile(changelogPath);
  }

  let updatedContent: string;

  // Check if existing content starts with the title
  const titlePattern = `# CHANGELOG`;
  if (existingContent.startsWith(titlePattern)) {
    // Find the end of the title line(s) and prepend after it
    const lines = existingContent.split('\n');
    let insertIndex = 0;

    // Skip title line and any blank lines after it
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      if (i === 0 || (insertIndex === i && line.trim() === '')) {
        insertIndex = i + 1;
      } else {
        break;
      }
    }

    // Check if there's already an entry for this version
    const versionHeader = `## ${version}`;
    const existingVersionIndex = lines.findIndex((line) => line === versionHeader);
    if (existingVersionIndex >= 0) {
      // Update existing version entry — find the next version header or end of file
      let nextVersionIndex = lines.length;
      for (let i = existingVersionIndex + 1; i < lines.length; i++) {
        if ((lines[i] ?? '').startsWith('## ')) {
          nextVersionIndex = i;
          break;
        }
      }
      // Replace the existing entry
      const beforeEntry = lines.slice(0, existingVersionIndex);
      const afterEntry = lines.slice(nextVersionIndex);
      updatedContent = [...beforeEntry, ...newEntry.split('\n'), ...afterEntry].join('\n');
    } else {
      // Prepend new entry after the title
      const beforeEntry = lines.slice(0, insertIndex);
      const afterEntry = lines.slice(insertIndex);
      updatedContent = [...beforeEntry, ...newEntry.split('\n'), ...afterEntry].join('\n');
    }
  } else {
    // No existing file or doesn't start with title — create new
    updatedContent = `${title}\n\n${newEntry}\n`;
  }

  await writeTextFile(changelogPath, updatedContent);
  verbose(`wrote changelog for ${packageName} v${version} to ${changelogPath}`);
}
