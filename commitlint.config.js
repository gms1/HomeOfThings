module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Commit Message:
    //   - must be prefixed by a type; e.g. "type: description"
    //   - an optional scope can be added; e.g. "type(scope): description"
    //   - an optional body can be added which begins one blank line after the description
    //   - an optional footer can be added which begins one blank line after the body
    //   - breaking change must append "!""; e.g. "type(scope)!: description"
    //       and optional in the footer (after a blank line after the boddy) must contain "BREAKING CHANGE" and description or issue reference; e.g "BREAKING CHANGE Fixes #13"
    //
    // Available types are:
    //
    //   - fix      A code change that fixes a bug. (causes patch version update)
    //   - feat     A code change that about addition or removal of a feature. (causes minor version update)
    //   - perf     A code change that improves performance (causes minor version update)
    //   - style    A code change that does not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
    //   - refactor A code change that neither fixes a bug nor adds/removes a feature nor changes the style or improves performance
    //
    //   - chore    Installing new dependencies, or bumping deps (causes patch version update)
    //   - build    Working on build scripts, configurations,...
    //   - ci       Update github workflows, husky
    //
    //   - test     Update testing suite, cypress files
    //
    //   - docs     Documentation only changes (README.md)
    //
    //   - revert   when reverting commits
    //
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'build', 'chore', 'refactor', 'ci', 'test', 'revert', 'perf']],
    //
    // Configure available scopes
    // 'scope-enum': [2, 'always', ['yourscope', 'yourscope']],
  },
};
