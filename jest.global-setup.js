/**
 * Jest global setup that changes the working directory to the workspace root.
 *
 * When using @nx/jest/plugin to infer test targets, Jest runs with cwd set
 * to the project root (e.g. packages/node/sqlite3orm/). This causes relative
 * file paths in tests (like 'test1.db') to be created inside the project
 * directory instead of the workspace root. This setup ensures the cwd is
 * always the workspace root, matching the behavior of the explicit
 * @nx/jest:jest executor.
 */
module.exports = async function() {
  // The NX_WORKSPACE_ROOT is set by Nx when running tasks
  const workspaceRoot = process.env.NX_WORKSPACE_ROOT || process.cwd();
  process.chdir(workspaceRoot);
};
