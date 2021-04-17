/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { ConfigModule } from '@homeofthings/nestjs-config';
import { DEFAULT_CONSOLE_LOGLEVEL, DEFAULT_FILE_LOGLEVEL, LOGLEVEL, LoggerModule } from '@homeofthings/nestjs-logger';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as _dbg from 'debug';
import * as express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import { AppModule } from './app/app.module';

const debug = _dbg('main');

debug('starting');

// create config and logging service
const configService = ConfigModule.createConfigService({});
const logger = LoggerModule.createLoggerService({
  consoleLogLevel: configService.getString('logging.console.level', DEFAULT_CONSOLE_LOGLEVEL) as LOGLEVEL,
  consoleLogSilent: configService.getOptionalBoolean('logging.console.silent'),
  fileLogFileName: configService.getOptionalString('logging.file.path'),
  fileLogLevel: configService.getString('logging.file.level', DEFAULT_FILE_LOGLEVEL) as LOGLEVEL,
  fileLogSilent: configService.getBoolean('logging.file.silent', true),
});

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

/**
 * @description create http server if not disabled
 */
async function createHttpServer(server: express.Express, appLogger: Logger, globalPrefix: string) {
  if (configService.getOptionalBoolean('service.http.disabled')) {
    return;
  }
  const port = configService.getNumber('service.http.port', 8080);
  const address = configService.getString('service.http.address', 'localhost');
  appLogger.debug(`  http:`);
  appLogger.debug(`    port: ${port}`);
  appLogger.debug(`    address: ${address}`);
  http.createServer(server).listen(port, address, () => {
    appLogger.log('Listening on http://' + address + ':' + port + '/' + globalPrefix);
  });
}

/**
 * @description create https server if not disabled
 */
async function createHttpsServer(server: express.Express, appLogger: Logger, globalPrefix: string) {
  if (configService.getOptionalBoolean('service.https.disabled')) {
    return;
  }
  const port = configService.getNumber('service.https.port', 8443);
  const address = configService.getString('service.https.address', 'localhost');
  const keyFile = configService.getOptionalString('service.https.key');
  const certFile = configService.getOptionalString('service.https.cert');

  if (!keyFile) {
    throw new Error(`not starting https: key is not defined`);
  }
  if (!certFile) {
    throw new Error(`not starting https: certFile is not defined`);
  }

  let key: string;
  try {
    key = fs.readFileSync(fs.readFileSync(path.resolve(configService.configDirectory, keyFile)), 'utf-8');
  } catch (err) {
    appLogger.error(`failed to read private key file '${keyFile}': ${err}`);
    return;
  }

  let cert: string;
  try {
    key = fs.readFileSync(fs.readFileSync(path.resolve(configService.configDirectory, certFile)), 'utf-8');
  } catch (err) {
    appLogger.error(`failed to read cert chain file '${certFile}': ${err}`);
    return;
  }

  appLogger.debug(`  https:`);
  appLogger.debug(`    port: ${port}`);
  appLogger.debug(`    address: ${address}`);
  https
    .createServer(
      {
        key,
        cert,
      },
      server,
    )
    .listen(443, address, () => {
      appLogger.log('Listening on https://' + address + ':' + port + '/' + globalPrefix);
    });
}

/**
 * @description bootstrap our application
 */
async function bootstrap() {
  try {
    const server = express();

    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), { logger });
    const appLogger = new Logger('Application');
    appLogger.debug(`Application created`);
    appLogger.debug(`Configuration:`);
    appLogger.debug(`  environment: ${configService.environment}`);
    appLogger.debug(`  directory: ${configService.configDirectory}`);

    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    createHttpsServer(server, appLogger, globalPrefix);
    createHttpServer(server, appLogger, globalPrefix);
  } catch (err) {
    logger.error(`Bootstrapping failed: ${err}`, err.stack, 'main');
  }
}

bootstrap();
