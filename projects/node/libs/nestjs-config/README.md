[![npm version](https://badge.fury.io/js/%40homeofthings%2Fnestjs-config.svg)](https://badge.fury.io/js/%40homeofthings%2Fnestjs-config)
[![Build Status](https://api.travis-ci.com/gms1/HomeOfThings.svg?branch=master)](https://travis-ci.com/gms1/HomeOfThings)
[![Coverage Status](https://codecov.io/gh/gms1/HomeOfThings/branch/master/graph/badge.svg?flag=nestjs-config)](https://codecov.io/gh/gms1/HomeOfThings)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)
[![Dependency Status](https://david-dm.org/gms1/HomeOfThings.svg)](https://david-dm.org/gms1/HomeOfThings)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/HomeOfThings/badge.svg)](https://snyk.io/test/github/gms1/HomeOfThings)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/@homeofthings/nestjs-config.svg?style=flat-square)](https://github.com/gms1/HomeOfThings/blob/master/LICENSE)

# HomeOfThings - Config for NestJs

a configuration module for [NestJS](https://docs.nestjs.com/) providing a `ConfigurationService` based on [node-config](https://www.npmjs.com/package/config)

## installation

```bash
npm install @homeofthings/nestjs-config
```

## quick start

### import module in `AppModule` by providing options synchronously

```Typescript
@Module({
  imports: [
    ConfigModule.forRoot(ConfigModule, {}),
  ],
})
export class AppModule {}
```

### import module in `AppModule` by providing options asynchronously

```Typescript
@Module({
  imports: [
    ConfigModule.forRootAsync(ConfigModule, {
      imports: [], // optional
      useFactory: (): Promise<ConfigModuleOptions> => Promise.resolve({
        // provide your options
      }),
      inject: [], // optional inject params for useFactory method
    }),
  ],
})
export class AppModule {}
```

### import module in child modules

```Typescript
  @Module({
    imports: [ConfigModule.forChild()],
  })
  class ChildModule {
```

### using for bootstrapping

```TypeScript
const configService = ConfigModule.createConfigService({});

...
bootstrap();

```

> NOTE: if you decide to combine this method with the imports into `AppModule` from above, only the options given to the first method will be taken into account

### read configuration values

using one of the methods provided by the `ConfigService`:

```TypeScript
export declare class ConfigService {
    readonly configDirectory: string;
    readonly environment: string;

    constructor(_opts: ConfigModuleOptions);

    getString(key: string, defaultValue: string): string;
    getNumber(key: string, defaultValue: number): number;
    getBoolean(key: string, defaultValue: boolean): boolean;

    // resolve path relative to config-directory
    getPath(key: string, defaultValue: string): string;

    getOptionalString(key: string): string | undefined;
    getOptionalNumber(key: string): number | undefined;
    getOptionalBoolean(key: string): boolean | undefined;

    // resolve path relative to config-directory
    getOptionalPath(key: string): string | undefined;
}
```

## RELEASE NOTES

[CHANGELOG](./CHANGELOG.md)
