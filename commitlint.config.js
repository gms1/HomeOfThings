module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Commit Message:
    //   - must be prefixed by a type; e.g. "type: description"
    //   - an optional scope can be added; e.g. "type(scope): description"
    //   - an optional body can be added which begins one blank line after the description
    //   - an optional footer can be added which begins one blank line after the body or the description
    //   - breaking change must append "!""; e.g. "type(scope)!: description"
    //       and optional in the footer (after a blank line after the boddy) must contain "BREAKING CHANGE" and description or issue reference; e.g "BREAKING CHANGE Fixes #13"
    //       (always causes major version update)
    //
    // Available types are:
    //
    //   - feat     A code change that about addition or removal of a feature. (causes minor version update)
    //   - fix      A code change that fixes a bug. (causes patch version update)
    //   - perf     A code change that improves performance (causes minor version update)
    //   - refactor A code change that neither fixes a bug nor adds/removes a feature nor changes the style or improves performance
    //   - style    A code change that does not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
    //
    //   - docs     Documentation only changes (README.md)
    //   - test     Update testing suite, cypress files
    //
    //   - build    Working on build scripts, configurations,...
    //   - chore    Installing new dependencies, or bumping deps (causes patch version update)
    //   - ci       Update github workflows, husky
    //   - release  Bump the package version for a new release (NOTE: added this, after looking how Angular does it)
    //
    //   - revert   when reverting commits
    //
    'type-enum': [2, 'always', ['feat', 'fix', 'perf', 'refactor', 'style', 'build', 'chore', 'ci', 'release', 'docs', 'test', 'revert']],
    //
    // Configure available scopes
    // 'scope-enum': [2, 'always', ['yourscope', 'yourscope']],
  },
};
