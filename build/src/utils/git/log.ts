import { exec } from '@homeofthings/node-sys';

import { verbose, warn } from '../app';
import { CHANGELOG_COMMIT_TYPES, CommitType, GitCommit } from './model/commit';

function parseGitLogHeaderLine(linenr: number, expect: string, line?: string): string {
  const words = !line ? undefined : line.match(/^(\S*)\s+(\S.*)?$/)?.slice(1);
  if (!Array.isArray(words) || words[0] !== expect) {
    throw new Error(`expected line ${linenr} to start with '${expect}', but got: '${line}'`);
  }
  return words[1] ?? '';
}

function parseGitLogEmptyLine(linenr: number, line?: string): string {
  if (line?.length !== 0) {
    throw new Error(`expected line ${linenr} to be empty, but got: '${line}'`);
  }
  return line;
}

function parseGitLogMessageLine(linenr: number, line?: string): string {
  if (line === undefined) {
    throw new Error(`expected line ${linenr} to be non-empty, but got undefined`);
  }
  return line.trimStart();
}

export async function gitLog(...argc: string[]): Promise<GitCommit[]> {
  const out: string[] = [];
  await exec('git', 'log', '--pretty=fuller', ...argc)
    .setStdOut(out)
    .run();
  let linenr = 0;
  let line: string | undefined;
  let words: string[] | undefined;
  let current: GitCommit = {} as GitCommit;
  const commits: GitCommit[] = [];
  while (out.length) {
    linenr++;
    line = out.shift();
    words = line?.split(/\s+/);
    if (words?.[0] === 'commit' && typeof words[1] === 'string') {
      if (current.hash) {
        commits.push(current);
      }
      current = {} as GitCommit;
      current.hash = words[1];
      linenr++;
      current.author = parseGitLogHeaderLine(linenr++, 'Author:', out.shift());
      current.authorDate = parseGitLogHeaderLine(linenr++, 'AuthorDate:', out.shift());
      current.commit = parseGitLogHeaderLine(linenr++, 'Commit:', out.shift());
      current.commitdate = parseGitLogHeaderLine(linenr++, 'CommitDate:', out.shift());
      parseGitLogEmptyLine(linenr, out.shift());
      current.title = parseGitLogMessageLine(linenr, out.shift());
      const type = current.title.match(/^(feat|fix|perf|refactor|style|build|chore|ci|release|docs|test|revert)(\([^)]*\))?(!)?:/);
      if (!type) {
        warn('failed to parse commit message: ', current.title);
      } else {
        current.type = type[1] as CommitType;
        if (type[3]) {
          current.breakingChange = true;
        }
      }

      current.full = [];
      continue;
    } else {
      current.full.push(parseGitLogMessageLine(linenr, line));
    }
  }
  if (current.hash) {
    commits.push(current);
  }
  return commits;
}

export async function gitLogLastRelease(projectRoot: string): Promise<GitCommit[]> {
  return await gitLog('--max-count=1', '--grep', '^release:', projectRoot);
}

export async function gitLogFrom(projectRoot: string, firstCommit?: GitCommit): Promise<GitCommit[]> {
  if (firstCommit) {
    return await gitLog(`${firstCommit.hash}..`, projectRoot);
  } else {
    return await gitLog(projectRoot);
  }
}

export function gitIsChange(commit: GitCommit): boolean {
  if (commit.breakingChange) {
    return true;
  }
  return CHANGELOG_COMMIT_TYPES.includes(commit.type);
}

export async function gitLogChangesFrom(projectRoot: string, firstCommit?: GitCommit): Promise<GitCommit[]> {
  return (await gitLogFrom(projectRoot, firstCommit)).filter((commit) => gitIsChange(commit));
}

export async function gitLogChanges(projectRoot: string) {
  const releaseCommits = await gitLogLastRelease(projectRoot);
  return gitLogChangesFrom(projectRoot, releaseCommits?.[0]);
}

export function logGitLogChanges(commits: GitCommit[]) {
  commits.forEach((commit) => {
    verbose(commit.title);
  });
}
