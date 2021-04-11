/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@homeofthings/config';
import { DEFAULT_CONSOLE_LOGLEVEL, DEFAULT_FILE_LOGLEVEL, LoggerModule } from '@homeofthings/logger';
import { AppModule } from './app/app.module';

import { LOGLEVEL } from 'projects/node/libs/logger/src/lib/model';

import * as _dbg from 'debug';
const debug = _dbg('main');

debug('starting');

const configService = ConfigModule.createConfigService({});
const logger = LoggerModule.createLoggerService({
  consoleLogLevel: configService.getString('logging.console.level', DEFAULT_CONSOLE_LOGLEVEL) as LOGLEVEL,
  consoleLogSilent: configService.getOptionalBoolean('logging.console.silent'),
  fileLogFileName: configService.getOptionalString('logging.file.path'),
  fileLogLevel: configService.getString('logging.file.level', DEFAULT_FILE_LOGLEVEL) as LOGLEVEL,
  fileLogSilent: configService.getBoolean('logging.file.silent', true),
});

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

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, { logger });
    const appLogger = new Logger('Application');
    appLogger.debug(`Application created`);
    appLogger.debug(`Configuration:`);
    appLogger.debug(`  environment: ${configService.environment}`);
    appLogger.debug(`  directory: ${configService.configDirectory}`);

    const port: number = configService.getNumber('listening.port', 8080);
    const hostname: string = configService.getString('listening.address', 'localhost');

    const globalApiPrefix = 'api';
    app.setGlobalPrefix(globalApiPrefix);
    await app.listen(port, hostname, () => {
      appLogger.log('Listening on http://' + hostname + ':' + port + '/' + globalApiPrefix);
    });
  } catch (err) {
    logger.error(`Bootstrapping failed: ${err}`, err.stack, 'main');
  }
}

bootstrap();
