[![npm version](https://badge.fury.io/js/%40homeofthings%2Fnestjs-logger.svg)](https://badge.fury.io/js/%40homeofthings%2Fnestjs-logger)
[![Build Workflow](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml)
[![Coverage Status](https://codecov.io/gh/gms1/HomeOfThings/branch/master/graph/badge.svg?flag=nestjs-logger)](https://app.codecov.io/gh/gms1/HomeOfThings/tree/master/packages%2Fnode%2F%40homeofthings%2Fnestjs-logger)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/HomeOfThings/badge.svg)](https://snyk.io/test/github/gms1/HomeOfThings)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/@homeofthings/nestjs-logger.svg?style=flat-square)](https://github.com/gms1/HomeOfThings/blob/master/packages/node/@homeofthings/nestjs-logger/LICENSE)

# HomeOfThings - Logger for NestJs

a logging module for [NestJS](https://docs.nestjs.com/) based on [winston](https://www.npmjs.com/package/winston)
which provides a reasonable configured logger for the application-wide use by all the NestJs loggers.

## installation

```bash
npm install @homeofthings/nestjs-logger
```

## quick start

### import module in `AppModule` by providing options synchronously

```Typescript
@Module({
  imports: [
    LoggerModule.forRoot(LoggerModule, {
      // provide your options
    }),
  ],
})
export class AppModule {}
```

and set the injected `LoggerService` as the application logger:

```TypeScript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(LoggerService));
}
bootstrap();
```

### import module in `AppModule` by providing options asynchronously

```Typescript
@Module({
  imports: [
    LoggerModule.forRootAsync(LoggerModule, {
      imports: [], // optional
      useFactory: (): Promise<LoggerModuleOptions> =>
        Promise.resolve({
          // provide your options
        }),
      inject: [], // optional inject params for useFactory method
    }),
  ],
})
export class AppModule {}
```

and set the injected `LoggerService` as the application logger:

```TypeScript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(LoggerService));
}
bootstrap();
```

### using as Nest Logger and for bootstrapping

```TypeScript
const logger = LoggerModule.createLoggerService({
  // provide your options
});
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { loggger });
}
bootstrap();
```

> NOTE: using this method, there is probably no need for additional imports of the `LoggerModule` in AppModule or any child module, but
> anyway if you decide to do so, only the options given to the first method will be taken into account

### application logging

as recommended by nestjs:

```Typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
class MyService {
  private readonly logger = new Logger(MyService.name);

  doSomething() {
    this.logger.log('Doing something...');
  }
}
```

That way, the calls to this.logger.log() from MyService would result in calls to the method log from our logger instance.

### environment variables

- FORCE_COLORS ... force color output
- NO_COLORS ... disable color output

### default formatters

#### console

<pre>
22:07:22.698 <b style="color: #0000aa;">debug:  </b><b style="color:#00cc00;font-weight: bold;"> [Logger]</b> Logger initialized
22:07:22.914 <b style="color: #00aa00;">info:   </b><b style="color:#3366cc;font-weight: bold;"> [NestFactory]</b> Starting Nest application...
22:07:22.932 <b style="color: #0000aa;">debug:  </b><b style="color:#6633ff;font-weight: bold;"> [AppModule]</b> AppModule created
22:07:22.934 <b style="color: #00aa00;">info:   </b><b style="color:#66cc00;font-weight: bold;"> [InstanceLoader]</b> AppModule dependencies initialized
22:07:22.937 <b style="color: #0000aa;">debug:  </b><b style="color:#66cc00;font-weight: bold;"> [Application]</b> Application created
22:07:22.937 <b style="color: #0000aa;">debug:  </b><b style="color:#66cc00;font-weight: bold;"> [Application]</b> Configuration:
22:07:22.938 <b style="color: #0000aa;">debug:  </b><b style="color:#66cc00;font-weight: bold;"> [Application]</b>   environment: development
22:07:22.938 <b style="color: #0000aa;">debug:  </b><b style="color:#66cc00;font-weight: bold;"> [Application]</b>   directory: /home/gms/work/HOT/HomeOfThings/workspace/config
22:07:22.943 <b style="color: #00aa00;">info:   </b><b style="color:#ff3300;font-weight: bold;"> [RoutesResolver]</b> AppController {/api}:
22:07:22.947 <b style="color: #00aa00;">info:   </b><b style="color:#0066cc;font-weight: bold;"> [RouterExplorer]</b> Mapped {/api, GET} route
22:07:22.950 <b style="color: #00aa00;">info:   </b><b style="color:#3399cc;font-weight: bold;"> [NestApplication]</b> Nest application successfully started
22:07:22.958 <b style="color: #00aa00;">info:   </b><b style="color:#66cc00;font-weight: bold;"> [Application]</b> Listening on http://localhost:8080/api
</pre>

#### file

```text
2021-04-11T19:58:57.602Z debug:   [Logger] Logger initialized
2021-04-11T19:58:57.812Z info:    [NestFactory] Starting Nest application...
2021-04-11T19:58:57.835Z debug:   [AppModule] AppModule created
2021-04-11T19:58:57.837Z info:    [InstanceLoader] AppModule dependencies initialized
2021-04-11T19:58:57.839Z debug:   [Application] Application created
2021-04-11T19:58:57.840Z debug:   [Application] Configuration:
2021-04-11T19:58:57.841Z debug:   [Application]   environment: development
2021-04-11T19:58:57.841Z debug:   [Application]   directory: /home/gms/work/HOT/HomeOfThings/workspace/config
2021-04-11T19:58:57.847Z info:    [RoutesResolver] AppController {/api}:
2021-04-11T19:58:57.852Z info:    [RouterExplorer] Mapped {/api, GET} route
2021-04-11T19:58:57.855Z info:    [NestApplication] Nest application successfully started
2021-04-11T19:58:57.862Z info:    [Application] Listening on http://localhost:8080/api
```

## RELEASE NOTES

[CHANGELOG](./CHANGELOG.md)
