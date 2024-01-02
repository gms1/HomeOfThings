[![npm version](https://badge.fury.io/js/%40homeofthings%2Fnode-utils.svg)](https://badge.fury.io/js/%40homeofthings%2Fnode-utils)
[![Build Workflow](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml)
[![Coverage Status](https://codecov.io/gh/gms1/HomeOfThings/branch/master/graph/badge.svg?flag=node-utils)](https://app.codecov.io/gh/gms1/HomeOfThings/tree/master/packages%2Fnode%2F%40homeofthings%2Fnode-utils)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/HomeOfThings/badge.svg)](https://snyk.io/test/github/gms1/HomeOfThings)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/@homeofthings/node-utils.svg?style=flat-square)](https://github.com/gms1/HomeOfThings/blob/master/packages/node/@homeofthings/node-utils/LICENSE)

# @homeofthings/node-utils

- `AsyncContext<T>`: little wrapper around `AsyncLocalStorage` providing default value

  ```Typescript
  asyncContext = new AsyncContext(defaultContext);
  ...
  asyncContext.set(newContext)
  ...
  currentContext = asyncContext.get();
  ```

- `ConfigService`: singleton service based on node-config

```Typescript
configService = new ConfigService({ configDirectory: 'path/to/config' });
```

then use one of the methods provided by the `ConfigService`:

```TypeScript
export declare class ConfigService {
  readonly configDirectory: string;
  readonly environment: string;

  constructor(_opts: ConfigOptions);

  getConfig(key: string): object | undefined;
  reloadConfig(): void;

  getString(key: string, defaultValue: string): string;
  getNumber(key: string, defaultValue: number): number;
  getBoolean(key: string, defaultValue: boolean): boolean;
  getObject(key: string, defaultValue: object): object;

  // resolve path relative to config-directory
  getPath(key: string, defaultValue: string): string;

  getOptionalString(key: string): string | undefined;
  getOptionalNumber(key: string): number | undefined;
  getOptionalBoolean(key: string): boolean | undefined;
  getOptionalObject(key: string): object | undefined;

  // resolve path relative to config-directory
  getOptionalPath(key: string): string | undefined;
}
```

- `LruCache<T>`: LRU cache

  ```Typescript
  cache = new LruCache<UserSession, number>(SESSION_CACHE_SIZE);

  cache.set(id, userSession); // add this to the cache and mark it as least recently used
  ...
  cache.get(anotherId); // if it is available in the cache it will be marked as least recently used
  ```

- `sequentialize`: run `Promises` in sequence

  ```Typescript
  await sequentialize(item.map(() => doWork(item)));
  ```

- `wait`: wait until a condition is true or timed out

  ```Typescript
  await wait(condition); // polls until condition is true
  await wait(condition, 1000); // polls until condition is true or timed out after 1000ms
  ```

- `WritableStrings`: a `Writable` for writing to a string array

- `quoteArgs` and `quoteArg`: quote arguments for better readability (e.g. for logging)
