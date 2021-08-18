const { getJestProjects } = require('@nrwl/jest');

const { defaults } = require('jest-config');
module.exports = { projects: getJestProjects() };
