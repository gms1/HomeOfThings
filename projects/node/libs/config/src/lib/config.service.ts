import * as _dbg from 'debug';
import * as process from 'process';
import * as path from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigModuleOptions, CONFIG_MODULE_OPTIONS_TOKEN } from './model';

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
import * as config from 'config';

const debug = _dbg('Config');

@Injectable()
export class ConfigService {
  readonly environment: string;
  readonly configDirectory: string;

  constructor(@Inject(CONFIG_MODULE_OPTIONS_TOKEN) private _opts: ConfigModuleOptions) {
    this.environment = process.env.NODE_CONFIG_ENV || '';
    this.configDirectory = process.env.NODE_CONFIG_DIR || process.cwd() + '/config';
    debug(`config-directory: '${this.configDirectory}'`);
    debug(`environment: '${this.environment}'`);
  }

  getString(key: string, defaultValue: string): string {
    const value = this.getOptionalString(key);
    return value != undefined ? value : defaultValue;
  }

  getNumber(key: string, defaultValue: number): number {
    const value = this.getOptionalNumber(key);
    return value != undefined ? value : defaultValue;
  }

  getBoolean(key: string, defaultValue: boolean): boolean {
    const value = this.getOptionalBoolean(key);
    return value != undefined ? value : defaultValue;
  }

  getPath(key: string, defaultValue: string): string {
    const value = this.getOptionalPath(key);
    return value != undefined ? value : defaultValue;
  }

  private getValue<T>(key: string): T | undefined {
    return config.has(key) ? config.get(key) : undefined;
  }

  getOptionalString(key: string): string | undefined {
    const value = this.getValue<string>(key);
    return typeof value === 'string' || value === undefined ? value : `${value}`;
  }

  getOptionalNumber(key: string): number | undefined {
    const value = this.getValue<number>(key);
    return typeof value === 'number' || value === undefined ? value : parseInt(`${value}`);
  }

  getOptionalBoolean(key: string): boolean | undefined {
    const value = this.getValue<boolean>(key);
    if (typeof value === 'boolean' || value === undefined) {
      return value;
    }
    const stringValue = `${value}`;
    if (['true', '1', 'yes', 'y'].includes(stringValue)) {
      return true;
    }
    if (['false', '0', 'no', 'n'].includes(stringValue)) {
      return false;
    }
    return undefined;
  }

  getOptionalPath(key: string): string | undefined {
    const value = this.getOptionalString(key);
    if (!value) {
      return value;
    }
    return path.resolve(this.configDirectory, value);
  }
}
