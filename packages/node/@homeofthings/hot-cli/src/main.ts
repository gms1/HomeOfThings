import { ConfigModule } from '@homeofthings/nestjs-config';
import { DEFAULT_CONSOLE_LOGLEVEL, DEFAULT_FILE_LOGLEVEL, LoggerModule, LogLevel } from '@homeofthings/nestjs-logger';
import _debug from 'debug';
import { BootstrapConsole } from 'nestjs-console';

import { AppModule } from './app/app.module';

const CLI_CONTEXT = 'hot:cli';
const debug = _debug(CLI_CONTEXT);

debug('starting');

// create config and logging service
const configService = ConfigModule.createConfigService({});
const logger = LoggerModule.createLoggerService({
  consoleLogLevel: configService.getString('cli.logging.console.level', DEFAULT_CONSOLE_LOGLEVEL) as LogLevel,
  consoleLogSilent: configService.getOptionalBoolean('cli.logging.console.silent'),
  fileLogFileName: configService.getOptionalString('cli.logging.file.path'),
  fileLogLevel: configService.getString('cli.logging.file.level', DEFAULT_FILE_LOGLEVEL) as LogLevel,
  fileLogSilent: configService.getBoolean('cli.logging.file.silent', true),
});

const bootstrap = new BootstrapConsole({
  module: AppModule,
  useDecorators: true,
});
bootstrap.init().then(async (app) => {
  try {
    await app.init();
    await bootstrap.boot();
    await app.close();
  } catch (err) {
    logger.error(`failed: ${err}`, (err as Error).stack, CLI_CONTEXT);
    await app.close();
    process.exit(1);
  }
});
