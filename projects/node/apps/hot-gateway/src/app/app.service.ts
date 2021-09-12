import { Injectable } from '@nestjs/common';
import { AppMessage } from './app.message.dto';

@Injectable()
export class AppService {
  getData(): AppMessage {
    return { message: 'Welcome to gateway!' };
  }
}
