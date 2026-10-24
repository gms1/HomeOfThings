const { withNx } = require('@nx/rollup/with-nx');

// These options were migrated by @nx/rollup:convert-to-inferred from project.json
const options = {
  outputPath: '../../../dist/packages/jsonpointerx',
  main: './src/index.ts',
  tsConfig: './tsconfig.lib.json',
  assets: [],
  project: './package.json',
  compiler: 'swc',
  format: ['cjs', 'esm'],
  sourceMap: true,
};

const config = withNx(options, {
  // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
  // e.g.
  // output: { sourcemap: true },
});

module.exports = config;
