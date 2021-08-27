import { Logger, Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConsoleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor() {
    this.logger.debug(`${AppModule.name} created`);
  }
}
