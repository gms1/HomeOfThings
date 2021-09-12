import { ConfigModule } from '@homeofthings/nestjs-config';
import { DEFAULT_CONSOLE_LOGLEVEL, DEFAULT_FILE_LOGLEVEL, LoggerModule, LogLevel } from '@homeofthings/nestjs-logger';
import { writeFileIfChanged } from '@homeofthings/nestjs-utils';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Command } from 'commander';
import _debug from 'debug';
import * as path from 'path';
import { AppModule } from './app/app.module';
import { ExpressApplication } from './express/express-application';

const DEFAULT_SERVICE_LIMIT_JSON_BODY = '10kb';
const DEFAULT_SERVICE_SESSION_NAME = 'sessionId';
const DEFAULT_SERVICE_SESSION_SECRET = 'hot';
const DEFAULT_SERVICE_SESSION_MAX_AGE = 900000;
const GLOBAL_API_PREFIX = 'api';
const COMMAND_EXPORT_API = 'export-api';

const MAIN_CONTEXT = 'hot:main';
const debug = _debug(MAIN_CONTEXT);
debug('starting');

// create config and logging service
const configService = ConfigModule.createConfigService({});
const logger = LoggerModule.createLoggerService({
  consoleLogLevel: configService.getString('service.logging.console.level', DEFAULT_CONSOLE_LOGLEVEL) as LogLevel,
  consoleLogSilent: configService.getOptionalBoolean('service.logging.console.silent'),
  fileLogFileName: configService.getOptionalString('service.logging.file.path'),
  fileLogLevel: configService.getString('service.logging.file.level', DEFAULT_FILE_LOGLEVEL) as LogLevel,
  fileLogSilent: configService.getBoolean('service.logging.file.silent', true),
});

const key = configService.getOptionalString('service.https.key');
const cert = configService.getOptionalString('service.https.cert');

const expressApplication = new ExpressApplication(logger, {
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
  trustProxy: configService.getOptionalString('service.trustProxy'),
  limits: {
    jsonBody: configService.getString('service.limits.jsonBody', DEFAULT_SERVICE_LIMIT_JSON_BODY),
  },
  session: {
    secret: configService.getString('service.session.secret', DEFAULT_SERVICE_SESSION_SECRET).split(','),
    name: configService.getString('service.session.name', DEFAULT_SERVICE_SESSION_NAME),
    maxAge: configService.getNumber('service.session.maxAge', DEFAULT_SERVICE_SESSION_MAX_AGE),
  },
});

const OPENAPI_DOCUMENT = new DocumentBuilder()
  .setTitle('HomeOfThings-OpenAPI')
  .setDescription('HomeOfTHings - OpenAPI specification')
  .setVersion('1.0')
  .addTag('HomeOfThings')
  .addTag('home-of-things')
  .build();

// global handlers
process.on('uncaughtExceptionMonitor', (err) => {
  logger.error(`An uncaught exception occurred: ${err}`, err.stack, MAIN_CONTEXT);
});

process.on('exit', (code) => {
  if (code) {
    logger.error(`Process exited with code: ${code}`, undefined, MAIN_CONTEXT);
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
  debug('bootstrapping');
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, expressApplication.adapter, { logger });

    const appLogger = new Logger('Application');
    appLogger.debug(`Application created`);
    appLogger.debug(`Configuration:`);
    appLogger.debug(`  environment: ${configService.environment}`);
    appLogger.debug(`  directory: ${configService.configDirectory}`);

    const document = SwaggerModule.createDocument(app, OPENAPI_DOCUMENT);
    SwaggerModule.setup(GLOBAL_API_PREFIX, app, document);
    app.setGlobalPrefix(GLOBAL_API_PREFIX);

    const program = new Command();
    program
      .command(`${COMMAND_EXPORT_API} <spec-file>`)
      .description('export OpenAPI specification')
      .action(async (specFile) => {
        try {
          const changed = await writeFileIfChanged(specFile, JSON.stringify(document, undefined, 2));
          if (changed) {
            console.warn(`OpenAPI spec '${specFile}' changed successfully`);
          } else {
            console.log(`OpenAPI spec '${specFile}' is up-to-date`);
          }
        } catch (err) {
          console.error(`OpenAPI spec to '${specFile}: failed to export ': ${err.message}`);
        }
        await app.close();
        process.exit(0);
      });

    await program.parseAsync(process.argv);

    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    if (!expressApplication.createServer()) {
      return;
    }

    try {
      await expressApplication.listen((address: string) => {
        appLogger.log(`Listening on '${address}/${GLOBAL_API_PREFIX}/'`);
      });
    } catch (err) {
      await expressApplication.close();
      appLogger.log(`closed`);
      return;
    }
  } catch (err) {
    logger.error(`bootstrapping failed: ${err}`, err.stack, MAIN_CONTEXT);
  }
}

bootstrap();
