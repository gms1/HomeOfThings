[![npm version](https://badge.fury.io/js/%40homeofthings%2Fnode-sys.svg)](https://badge.fury.io/js/%40homeofthings%2Fnode-sys)
[![Build Workflow](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml)
[![Coverage Status](https://codecov.io/gh/gms1/HomeOfThings/branch/master/graph/badge.svg?flag=node-sys)](https://app.codecov.io/gh/gms1/HomeOfThings/tree/master/packages%2Fnode%2F%40homeofthings%2Fnode-sys)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/HomeOfThings/badge.svg)](https://snyk.io/test/github/gms1/HomeOfThings)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/@homeofthings/node-sys.svg?style=flat-square)](https://github.com/gms1/HomeOfThings/blob/master/packages/node/@homeofthings/node-sys/LICENSE)

# @homeofthings/node-sys

This library is mainly intended to be helpful for build and installation tasks. It includes a Fluent API for spawning child processes and many file-system related functions that work and are named similarly to their shell counterparts.

## Fluent API for spawning child processes

```Typescript
const out: string[] = [];
await exec('node', '-e', `console.log("hello world")`).setStdOut(out).run();
```

```Typescript
const script: string[] = [`console.log("hello world")`];
await exec('node').setStdIn(script).run();
```

```Typescript
const out: string[] = [];
await sh('ls -l *.md').setStdOut(out).run();
```

```Typescript
const out: string[] = [];
await pipe(sh('ls -l *.md')).to(exec('wc', '-l').setStdOut(out)).run();
// out[0] contains the number of *.md files as string
```

## file-system related functions

file-system related functions that work and are named similarly to their shell counterparts, e.g.:
cd, pwd, pushd, popd, dirs, realpath, stat, which, unlink, ln, mktemp, chmod, chown, mkdir, rm, rmdir, touch, cp, mv, rename, ...

```Typescript
await rm('myfile.bak');
await rm(['myfile.bak', 'mytmpdir'], { recursive: true, force: true });
await rm(glob('**/*.bak'));
```
