import { ExpressApplication } from '@homeofthings/hot-express';
import { ConfigModule } from '@homeofthings/nestjs-config';
import { DEFAULT_CONSOLE_LOGLEVEL, DEFAULT_FILE_LOGLEVEL, LoggerModule, LogLevel } from '@homeofthings/nestjs-logger';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import _debug from 'debug';
import * as path from 'path';
import { AppModule } from './app/app.module';

const debug = _debug('main');

debug('starting');

// create config and logging service
const configService = ConfigModule.createConfigService({});
const logger = LoggerModule.createLoggerService({
  consoleLogLevel: configService.getString('logging.console.level', DEFAULT_CONSOLE_LOGLEVEL) as LogLevel,
  consoleLogSilent: configService.getOptionalBoolean('logging.console.silent'),
  fileLogFileName: configService.getOptionalString('logging.file.path'),
  fileLogLevel: configService.getString('logging.file.level', DEFAULT_FILE_LOGLEVEL) as LogLevel,
  fileLogSilent: configService.getBoolean('logging.file.silent', true),
});

const expressApplication = new ExpressApplication(logger);

// global handlers
process.on('uncaughtExceptionMonitor', (err) => {
  logger.error(`An uncaught exception occurred: ${err}`, err.stack, 'main');
});

process.on('exit', (code) => {
  if (code) {
    logger.error(`Process exited with code: ${code}`, undefined, 'main');
  } else {
    logger.debug(`Process exited with code: ${code}`);
  }
});

process.on('SIGTERM', async () => {
  debug('SIGTERM signal received');
  await expressApplication.close();
});

process.on('SIGINT', async () => {
  debug('SIGINT signal received');
  process.kill(process.pid, 'SIGTERM');
});

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, expressApplication.adapter, { logger });
    app.enableCors();

    const appLogger = new Logger('Application');
    appLogger.debug(`Application created`);
    appLogger.debug(`Configuration:`);
    appLogger.debug(`  environment: ${configService.environment}`);
    appLogger.debug(`  directory: ${configService.configDirectory}`);

    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    const key = configService.getOptionalString('service.https.key');
    const cert = configService.getOptionalString('service.https.cert');

    if (
      !expressApplication.createServer({
        address: configService.getOptionalString('service.address'),
        http: {
          port: configService.getNumber('service.http.port', 80),
          maxHeaderSize: configService.getOptionalNumber('service.http.maxHeaderSize'),
          disabled: configService.getOptionalBoolean('service.http.disabled'),
          redirect: configService.getBoolean('server.http.redirct', true),
          redirectCode: configService.getOptionalNumber('server.http.redirectCode'),
          redirectLocation: configService.getOptionalString('server.http.redirectLocation'),
        },
        https: {
          port: configService.getNumber('service.https.port', 443),
          key: key ? path.resolve(configService.configDirectory, key) : undefined,
          cert: cert ? path.resolve(configService.configDirectory, cert) : undefined,
          maxHeaderSize: configService.getOptionalNumber('service.https.maxHeaderSize'),
          disabled: configService.getOptionalBoolean('service.https.disabled'),
        },
      })
    ) {
      return;
    }

    try {
      await expressApplication.listen((address: string) => {
        appLogger.log(`Listening on '${address}/${globalPrefix}/'`);
      });
    } catch (err) {
      await expressApplication.close();
      appLogger.log(`closed`);
      return;
    }
  } catch (err) {
    logger.error(`Bootstrapping failed: ${err}`, err.stack, 'main');
  }
}

bootstrap();
