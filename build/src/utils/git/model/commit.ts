export type CommitType = 'feat' | 'fix' | 'perf' | 'refactor' | 'style' | 'build' | 'chore' | 'ci' | 'release' | 'docs' | 'test' | 'revert';

export const CHANGELOG_COMMIT_TYPES = ['feat', 'fix', 'perf', 'chore', 'revert'];

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
