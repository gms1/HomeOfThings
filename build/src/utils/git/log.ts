import * as fs from 'node:fs';
import * as path from 'node:path';

import { exec } from '@homeofthings/node-sys';
import { logInfo, logVerbose } from '@homeofthings/node-utils';

import { CHANGELOG_COMMIT_TYPES, CommitType, GitCommit } from './model/commit';

function stripCr(line: string | undefined): string | undefined {
  return line?.replace(/\r/g, '');
}

function parseGitLogHeaderLine(linenr: number, expect: string, line?: string): string {
  const stripped = stripCr(line);
  const words = !stripped ? undefined : stripped.match(/^(\S*)\s+(\S.*)?$/)?.slice(1);
  if (!Array.isArray(words) || words[0] !== expect) {
    throw new Error(`expected line ${linenr} to start with '${expect}', but got: '${line}'`);
  }
  return words[1] ?? '';
}

function parseGitLogEmptyLine(linenr: number, line?: string): string {
  const stripped = stripCr(line);
  if (stripped?.length !== 0) {
    throw new Error(`expected line ${linenr} to be empty, but got: '${line}'`);
  }
  return stripped;
}

function parseGitLogMessageLine(linenr: number, line?: string): string {
  if (line === undefined) {
    throw new Error(`expected line ${linenr} to be non-empty, but got undefined`);
  }
  return stripCr(line)!.trimStart();
}

export async function gitLog(hashMap: Record<string, string>, ...argc: string[]): Promise<GitCommit[]> {
  const out: string[] = [];
  await exec('git', 'log', '--no-merges', '--pretty=fuller', ...argc)
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
      const shortHash = current.hash.substring(0, 7);
      current.title = hashMap[current.hash] ?? hashMap[shortHash] ?? current.title;
      const type = current.title.match(/^(feat|fix|perf|refactor|style|build|chore|ci|release|docs|test|revert)(\([^)]*\))?(!)?:/);
      if (!type) {
        // warn('failed to parse commit message: ', current.title);
        current.type = 'unknown';
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

export async function gitLogLastRelease(projectRoot: string, hashMap: Record<string, string> = {}): Promise<GitCommit[]> {
  return await gitLog(hashMap, '--max-count=1', '--grep', '^release:', projectRoot);
}

export function gitIsChange(commit: GitCommit): boolean {
  if (commit.breakingChange) {
    return true;
  }
  return CHANGELOG_COMMIT_TYPES.includes(commit.type);
}

export async function gitLogChanges(projectRoot: string, workspaceDir: string, hashMap: Record<string, string> = {}) {
  const releaseCommits = await gitLogLastRelease(projectRoot, hashMap);
  const firstCommit = releaseCommits[0];
  const rootPaths = [path.resolve(workspaceDir, 'package-lock.json'), path.resolve(workspaceDir, 'package.json')];
  let commits: GitCommit[];
  if (firstCommit) {
    commits = await gitLog(hashMap, `${firstCommit.hash}..`, projectRoot, ...rootPaths);
  } else {
    commits = await gitLog(hashMap, projectRoot, ...rootPaths);
  }
  return commits.filter((commit) => gitIsChange(commit));
}

/**
 * Load a hash mapping file from tmp/changelog-hash-map.json.
 * The file should contain a JSON object mapping commit hashes to override commit titles.
 * Keys can be either full commit hashes or short hashes (at least 7 characters).
 * When a commit title is overridden, its type is re-parsed from the new title.
 * Commits whose overridden type is not in CHANGELOG_COMMIT_TYPES will be excluded from the changelog.
 * Example: { "9ecf4dc": "build: restructure project layout", "93ac0db": "fix: correct typo" }
 */
export function loadHashMap(workspaceDir: string): Record<string, string> {
  const hashMapPath = path.resolve(workspaceDir, 'tmp', 'changelog-hash-map.json');
  try {
    if (fs.existsSync(hashMapPath)) {
      const content = fs.readFileSync(hashMapPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch {
    // ignore errors, return empty map
  }
  return {};
}

export function logGitLogChanges(commits: GitCommit[], publishable = true) {
  if (publishable) {
    logInfo('not yet published:');
  }
  commits.forEach((commit) => {
    const shortHash = commit.hash.substring(0, 7);
    logVerbose(`${shortHash} ${commit.title}`);
  });
}
