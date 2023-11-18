const nxPreset = require('@nx/jest/preset').default;

nxPreset.coverageReporters = ['lcov', 'json', 'text-summary'];
nxPreset.collectCoverage = true;
nxPreset.passWithNoTests = true;

module.exports = { ...nxPreset };
