import { ConfigService as NodeUtilsConfigService } from '@homeofthings/node-utils';
import { Inject, Injectable } from '@nestjs/common';

import { CONFIG_MODULE_OPTIONS_TOKEN, ConfigModuleOptions } from './model';

process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

/** ConfigService to read configured values. */
@Injectable()
export class ConfigService extends NodeUtilsConfigService {
  constructor(@Inject(CONFIG_MODULE_OPTIONS_TOKEN) _opts: ConfigModuleOptions) {
    super(_opts);
  }
}
