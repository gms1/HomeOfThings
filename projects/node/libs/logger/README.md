[![npm version](https://badge.fury.io/js/%40homeofthings%2Flogger.svg)](https://badge.fury.io/js/%40homeofthings%2Flogger)
[![Build Status](https://api.travis-ci.com/gms1/HomeOfThings.svg?branch=master)](https://travis-ci.com/gms1/HomeOfThings)
[![Coverage Status](https://coveralls.io/repos/github/gms1/HomeOfThings/badge.svg?branch=master&service=github)](https://coveralls.io/github/gms1/HomeOfThings?branch=master)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)
[![Dependency Status](https://david-dm.org/gms1/HomeOfThings.svg)](https://david-dm.org/gms1/HomeOfThings)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/HomeOfThings/badge.svg)](https://snyk.io/test/github/gms1/HomeOfThings)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/@homeofthings/logger.svg?style=flat-square)](./LICENSE)

# HomeOfThings - Logger

a logging module for [NestJS](https://docs.nestjs.com/) based on [winston](https://www.npmjs.com/package/winston)

## installation

```bash
npm install @homeofthings/logger
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
const logger = LoggerModule.createLoggerService({
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

### environment variables

- FORCE_COLORS ... force color output
- NO_COLORS    ... disable color output

### default formatters

#### console

<pre>21:52:08.655 <b class=BLU>debug:  </b><b class="BOLD"></b><b class="BOLD" style="color:#00cc00;"> [Logger]</b><b class="BOLD"></b> Logger initialized
21:52:08.917 <b class=GRN>info:   </b><b class="BOLD"></b><b class="BOLD" style="color:#3366cc;"> [NestFactory]</b><b class="BOLD"></b> Starting Nest application...
21:52:08.931 <b class=BLU>debug:  </b><b class="BOLD"></b><b class="BOLD" style="color:#6633ff;"> [AppModule]</b><b class="BOLD"></b> AppModule created
21:52:08.932 <b class=GRN>info:   </b><b class="BOLD"></b><b class="BOLD" style="color:#66cc00;"> [InstanceLoader]</b><b class="BOLD"></b> AppModule dependencies initialized
21:52:08.935 <b class=BLU>debug:  </b><b class="BOLD"></b><b class="BOLD" style="color:#66cc00;"> [Application]</b><b class="BOLD"></b> Application created
21:52:08.935 <b class=BLU>debug:  </b><b class="BOLD"></b><b class="BOLD" style="color:#66cc00;"> [Application]</b><b class="BOLD"></b> Configuration:
21:52:08.936 <b class=BLU>debug:  </b><b class="BOLD"></b><b class="BOLD" style="color:#66cc00;"> [Application]</b><b class="BOLD"></b>   environment: development
21:52:08.936 <b class=BLU>debug:  </b><b class="BOLD"></b><b class="BOLD" style="color:#66cc00;"> [Application]</b><b class="BOLD"></b>   directory: /home/gms/work/HOT/HomeOfThings/workspace/config
21:52:08.942 <b class=GRN>info:   </b><b class="BOLD"></b><b class="BOLD" style="color:#ff3300;"> [RoutesResolver]</b><b class="BOLD"></b> AppController {/api}:
21:52:08.946 <b class=GRN>info:   </b><b class="BOLD"></b><b class="BOLD" style="color:#0066cc;"> [RouterExplorer]</b><b class="BOLD"></b> Mapped {/api, GET} route
21:52:08.948 <b class=GRN>info:   </b><b class="BOLD"></b><b class="BOLD" style="color:#3399cc;"> [NestApplication]</b><b class="BOLD"></b> Nest application successfully started
21:52:08.956 <b class=GRN>info:   </b><b class="BOLD"></b><b class="BOLD" style="color:#66cc00;"> [Application]</b><b class="BOLD"></b> Listening on http://localhost:8080/api
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
