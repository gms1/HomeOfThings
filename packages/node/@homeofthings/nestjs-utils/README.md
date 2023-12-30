[![npm version](https://badge.fury.io/js/%40homeofthings%2Fnestjs-utils.svg)](https://badge.fury.io/js/%40homeofthings%2Fnestjs-utils)
[![Build Workflow](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml)
[![Coverage Status](https://codecov.io/gh/gms1/HomeOfThings/branch/master/graph/badge.svg?flag=nestjs-utils)](https://app.codecov.io/gh/gms1/HomeOfThings/tree/master/packages%2Fnode%2F%40homeofthings%2Fnestjs-utils)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/HomeOfThings/badge.svg)](https://snyk.io/test/github/gms1/HomeOfThings)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/@homeofthings/nestjs-utils.svg?style=flat-square)](https://github.com/gms1/HomeOfThings/blob/master/packages/node/@homeofthings/nestjs-utils/LICENSE)

# HomeOfThings - common utilities for NestJs

[HomeOfThings](https://github.com/gms1/HomeOfThings)

## installation

```bash
npm install @homeofthings/nestjs-utils
```

## Dynamic Modules

## quick start

```Typescript
export const MY_MODULE_OPTIONS_TOKEN = 'MY_MODULE_OPTIONS_TOKEN';
export interface MyModuleOptions {
  ....
}

@Module({
  providers: [MyService],
  exports: [MyService],
})
export class MyModule extends createDynamicRootModule<MyModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {
}
```

> NOTE: additional module properties for 'imports', 'exports', 'providers' or 'controllers' can be passed as second parameter to this function

<!-- -->

> NOTE: of course the module can also be global scoped by the @Global() decorator

- use it synchronously:

```Typescript
const myModuleOptions: MyModuleOptions = {
  ...
}

@Module({
  imports: [MyModule.forRoot(MyModule, myModuleOptions)],
})
export class AppModule {}
```

- use it asynchonously:

```Typescript
const myAsyncModuleOptions: AsyncModuleOptions<MyModuleOptions> = {
  ...
}

@Module({
  imports: [MyModule.forRootAsync(MyModule, myAsyncModuleOptions)],
})
export class AppModule {}
```

> NOTE: forRoot/forRootAsync throws if the module is already registered.
> You can call register/registerAsync if you really want to register it more than once

- import it in any child module:

```Typescript
@Module({
  imports: [MyModule.forChild()],
})
export class ChildModule {}
```

> NOTE: no need to do this if the module is global scoped

### examples

- providing single option using either `forRoot` or `forRootAsync`

[@homeofthings/nestjs-logger](https://github.com/gms1/HomeOfThings/tree/master/projects/node/libs/nestjs-logger/)

- providing multiple options using eihter `register` or `registerAsync` (e.g. providing multiple connections)

[@homeofthings/nestjs-sqlite3](https://github.com/gms1/HomeOfThings/tree/master/projects/node/libs/nestjs-sqlite3/)

## more utilities

- `class LruCache<T>` - LRU cache
- `class AsyncContext<T>` - asynchronouse contest based on `AsyncLocalStorage`
