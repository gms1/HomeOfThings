/**
 * CJS stub for config/lib/util.js
 *
 * The real config v5 module uses ESM syntax (import/export) in a .js file
 * without "type": "module" in its package.json, which causes cjs-module-lexer
 * to fail when Jest processes it. This stub provides the same export surface
 * (Util, Load) with no-op implementations, so that packages which transitively
 * depend on config through @homeofthings/node-utils can load without error.
 *
 * Individual test files that need specific mock behavior should use
 * jest.unstable_mockModule('config/lib/util.js', ...) which takes precedence
 * over this moduleNameMapper entry.
 */

const Util = {
  getPath: (obj, key) => undefined,
  toObject: (obj) => obj ? JSON.parse(JSON.stringify(obj)) : obj,
  makeImmutable: (obj) => obj,
};

class Load {
  constructor() {
    this.config = {};
  }
  scan() {
    return this;
  }
  static fromEnvironment() {
    return new Load();
  }
}

module.exports = { Util, Load };
