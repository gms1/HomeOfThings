[![npm version](https://badge.fury.io/js/asyncctx.svg)](https://badge.fury.io/js/asyncctx)
[![Build Workflow](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml)
[![Coverage Status](https://codecov.io/gh/gms1/HomeOfThings/branch/master/graph/badge.svg?flag=asyncctx)](https://app.codecov.io/gh/gms1/HomeOfThings/tree/master/packages%2Fnode%2Fasyncctx)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/HomeOfThings/badge.svg)](https://snyk.io/test/github/gms1/HomeOfThings)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/asyncctx.svg?style=flat-square)](https://github.com/gms1/HomeOfThings/blob/master/packages/node/asyncctx/LICENSE)

# node-async-context (asyncctx)

This module allows you to create an asynchronous execution context for JavaScript or TypeScript

> NOTE: This module is based on [async_hooks](https://github.com/nodejs/node/blob/master/doc/api/async_hooks.md) an experimental built-in node.js module introduced in v8.0.0

## Deprecation

<!-- -->

> NOTE: This module is now deprecated in favour of [AsyncLocalStorage](https://nodejs.org/api/async_context.html#async_context_new_asynclocalstorage)
> which is available for nodejs >= 12

### quick start using AsyncLocalStorage

```Typescript
 class ContinuationLocalStorage<T> extends AsyncLocalStorage<T> {
   public getContext(): T | undefined {
      return this.getStore();
    }
    public setContext(value: T): T {
      this.enterWith(value);
      return value;
    }
  }
```

## Introduction

To give you an idea of how **asyncctx** is supposed to be used:

```TypeScript
import { ContinuationLocalStorage } from 'asyncctx';

class MyLocalStorage {
  value: number;
}

let cls = new ContinuationLocalStorage<MyLocalStorage>();
cls.setRootContext({ value: 1});

process.nextTick(() => {
  let curr1 = cls.getContext(); // value is 1
  cls.setContext({ value: 2});  // value should be 2 in the current execution context and below
  process.nextTick(() => {
    let curr2 = cls.getContext(); // value is 2
    cls.setContext({ value: 3});  // value should be 3 in the current execution context and below
    process.nextTick(() => {
      let curr3 = cls.getContext(); // value is 3
    });
  });
  process.nextTick(() => {
    let curr4 = cls.getContext(); // value is 2
  });
});
```

## RELEASE NOTES

[CHANGELOG](./CHANGELOG.md)

## License

**node-async-context (asyncctx)** is licensed under the MIT License:
[LICENSE](./LICENSE)

