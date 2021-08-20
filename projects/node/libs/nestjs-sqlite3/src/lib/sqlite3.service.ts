import { Inject, Injectable } from '@nestjs/common';
import { Sqlite3ModuleOptions, SQLITE3_MODULE_OPTIONS_TOKEN } from './model';

@Injectable()
export class Sqlite3Service {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(@Inject(SQLITE3_MODULE_OPTIONS_TOKEN) private _options: Sqlite3ModuleOptions) {}
}
