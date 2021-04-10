[![npm version](https://badge.fury.io/js/%40homeofthings%2Flogger.svg)](https://badge.fury.io/js/%40homeofthings%2Flogger)
[![Build Status](https://api.travis-ci.com/gms1/HomeOfThings.svg?branch=master)](https://travis-ci.com/gms1/HomeOfThings)
[![Coverage Status](https://coveralls.io/repos/github/gms1/HomeOfThings/badge.svg?branch=master&service=github)](https://coveralls.io/github/gms1/HomeOfThings?branch=master)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)
[![Dependency Status](https://david-dm.org/gms1/HomeOfThings.svg)](https://david-dm.org/gms1/HomeOfThings)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/HomeOfThings/badge.svg)](https://snyk.io/test/github/gms1/HomeOfThings)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

# HomeOfThings - Logger

a logging module for [NestJS](https://docs.nestjs.com/) based on [winston](https://www.npmjs.com/package/winston)

## installation

```bash
npm install @homeofthings/logger winston
```

## quick start

### import module by providing options synchronously

```Typescript
@Module({
  imports: [
    LoggerModule.forRoot({
      // provide your options
    }),
  ],
})
export class AppModule {}
```

### import module by providing options asynchronously

```Typescript
@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [], // optional
      useFactory: (): Promise<LoggerModuleOptions> => Promise.resolve({
        // provide your options
      }),
      inject: [], // optional inject params for useFactory method
    }),
  ],
})
export class AppModule {}
```

### using as Nest Logger after bootstrapping

```TypeScript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(LoggerService));
}
bootstrap();
```

### using as Nest Logger and for bootstrapping

```TypeScript
const logger: LoggerModule.createLogger({
      // provide your options
    });
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {loggger});
}
bootstrap();

```

### application logging

as recommended by nestjs:

```Typescript

import { Logger, Injectable } from '@nestjs/common';

@Injectable()
class MyService {
  private readonly logger = new Logger(MyService.name);
  
  doSomething() {
    this.logger.log('Doing something...');
  }
}
```

That way, the calls to this.logger.log() from MyService would result in calls to the method log from our logger instance.
