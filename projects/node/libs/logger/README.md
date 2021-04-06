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
