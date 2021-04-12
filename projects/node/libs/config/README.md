[![npm version](https://badge.fury.io/js/%40homeofthings%2Fconfig.svg)](https://badge.fury.io/js/%40homeofthings%2Fconfig)
[![Build Status](https://api.travis-ci.com/gms1/HomeOfThings.svg?branch=master)](https://travis-ci.com/gms1/HomeOfThings)
[![Coverage Status](https://coveralls.io/repos/github/gms1/HomeOfThings/badge.svg?branch=master&service=github)](https://coveralls.io/github/gms1/HomeOfThings?branch=master)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)
[![Dependency Status](https://david-dm.org/gms1/HomeOfThings.svg)](https://david-dm.org/gms1/HomeOfThings)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/HomeOfThings/badge.svg)](https://snyk.io/test/github/gms1/HomeOfThings)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/@homeofthings/config.svg?style=flat-square)](./LICENSE)

# HomeOfThings - Config

a configuration module for [NestJS](https://docs.nestjs.com/) based on [node-config](https://www.npmjs.com/package/config)

## installation

```bash
npm install @homeofthings/config
```

## quick start

### import module by providing options synchronously

```Typescript
@Module({
  imports: [
    ConfigModule.forRoot({}),
  ],
})
export class AppModule {}
```

### import module by providing options asynchronously

```Typescript
@Module({
  imports: [
    ConfigModule.forRootAsync({
      imports: [], // optional
      useFactory: (): Promise<ConfigModuleOptions> => Promise.resolve({}),
      inject: [], // optional inject params for useFactory method
    }),
  ],
})
export class AppModule {}
```

### using for bootstrapping

```TypeScript
const configService = ConfigModule.createConfigService({});

...
bootstrap();

```

### read configuration values

```TypeScript
export declare class ConfigService {
    readonly environment: string;
    readonly configDirectory: string;
    constructor(_opts: ConfigModuleOptions);
    getString(key: string, defaultValue: string): string;
    getNumber(key: string, defaultValue: number): number;
    getBoolean(key: string, defaultValue: boolean): boolean | undefined;
    getOptionalString(key: string): string | undefined;
    getOptionalNumber(key: string): number | undefined;
    getOptionalBoolean(key: string): boolean | undefined;
}
```
