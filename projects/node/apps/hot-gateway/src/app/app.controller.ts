import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { ApiResponse } from '@nestjs/swagger';
import { AppMessage } from './app.message.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiResponse({ type: AppMessage })
  getData() {
    return this.appService.getData();
  }
}
