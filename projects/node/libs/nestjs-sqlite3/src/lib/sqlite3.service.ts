import { Inject, Injectable } from '@nestjs/common';
import { Sqlite3ModuleOptions, SQLITE3_MODULE_OPTIONS_TOKEN } from './model';

@Injectable()
export class Sqlite3Service {
  constructor(@Inject(SQLITE3_MODULE_OPTIONS_TOKEN) _options: Sqlite3ModuleOptions) {}
}
