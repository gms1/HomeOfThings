[![npm version](https://badge.fury.io/js/%40homeofthings%2Fnestjs-sqlite3.svg)](https://badge.fury.io/js/%40homeofthings%2Fnestjs-sqlite3)
[![Build Status](https://api.travis-ci.com/gms1/HomeOfThings.svg?branch=master)](https://travis-ci.com/gms1/HomeOfThings)
[![Coverage Status](https://codecov.io/gh/gms1/HomeOfThings/branch/master/graph/badge.svg?flag=nestjs-sqlite3)](https://codecov.io/gh/gms1/HomeOfThings)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)
[![Dependency Status](https://david-dm.org/gms1/HomeOfThings.svg)](https://david-dm.org/gms1/HomeOfThings)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/HomeOfThings/badge.svg)](https://snyk.io/test/github/gms1/HomeOfThings)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/@homeofthings/nestjs-sqlite3.svg?style=flat-square)](https://github.com/gms1/HomeOfThings/blob/master/LICENSE)

# HomeOfThings - Sqlite3 for NestJs

based on [sqlite3orm](https://www.npmjs.com/package/sqlite3orm)

## installation

```bash
npm install @homeofthings/nestjs-sqlite3
```

## quick start

### import module in `AppModule` by providing options synchronously

```Typescript
@Module({
  imports: [
    Sqlite3Module.forRoot(Sqlite3Module, {}),
  ],
})
export class AppModule {}
```

### import module in `AppModule` by providing options asynchronously

```Typescript
@Module({
  imports: [
    Sqlite3Module.forRootAsync(Sqlite3Module, {
      imports: [], // optional
      useFactory: (): Promise<Sqlite3ModuleOptions> => Promise.resolve({
        // provide your options
      }),
      inject: [], // optional inject params for useFactory method
    }),
  ],
})
export class AppModule {}
```


## RELEASE NOTES

[CHANGELOG](./CHANGELOG.md)
