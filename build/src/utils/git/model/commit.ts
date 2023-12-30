export type CommitType = 'feat' | 'perf' | 'fix' | 'chore' | 'style' | 'refactor' | 'docs' | 'test' | 'build' | 'ci' | 'release' | 'revert' | 'unknown';

export const CHANGELOG_COMMIT_TYPES = ['feat', 'perf', 'fix', 'chore', 'refactor', 'revert'];

export interface GitCommit {
  hash: string;
  author: string;
  authorDate: string;
  commit: string;
  commitdate: string;
  type: CommitType;
  breakingChange: boolean;
  title: string;
  full: string[];
}
