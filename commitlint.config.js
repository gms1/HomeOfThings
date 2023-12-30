module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // please see docs/DEVELOP.md
    //
    'type-enum': [2, 'always', ['feat', 'fix', 'perf', 'refactor', 'style', 'build', 'chore', 'ci', 'release', 'docs', 'test', 'revert']],
    //
    // Configure available scopes
    // 'scope-enum': [2, 'always', ['yourscope', 'yourscope']],

    'body-max-line-length': [2, 'always', 120],
    'footer-max-line-length': [2, 'always', 120],
    'header-max-length': [2, 'always', 120],
  },
};
