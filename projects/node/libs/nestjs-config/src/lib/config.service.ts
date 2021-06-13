import _debug from 'debug';
import * as process from 'process';
import * as path from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigModuleOptions, CONFIG_MODULE_OPTIONS_TOKEN } from './model';

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
import * as config from 'config';

const debug = _debug('Config');

/** ConfigService to read configured values. */
@Injectable()
export class ConfigService {
  readonly configDirectory: string;
  readonly environment: string;

  constructor(@Inject(CONFIG_MODULE_OPTIONS_TOKEN) private _opts: ConfigModuleOptions) {
    this.configDirectory = process.env.NODE_CONFIG_DIR ?? process.cwd() + '/config';
    this.environment = process.env.NODE_CONFIG_ENV ?? '';
    debug(`config-directory: '${this.configDirectory}'`);
    debug(`environment: '${this.environment}'`);
  }

  /**
   * @description get a string
   * @param key - the configuration key
   * @param defaultValue - the default value to use if key is not configured
   * @return {string|undefined}
   */
  getString(key: string, defaultValue: string): string {
    const value = this.getOptionalString(key);
    return value != undefined ? value : defaultValue;
  }

  /**
   * @description get a number
   * @param key - the configuration key
   * @param defaultValue - the default value to use if key is not configured
   * @return {number|undefined}
   */
  getNumber(key: string, defaultValue: number): number {
    const value = this.getOptionalNumber(key);
    return value != undefined ? value : defaultValue;
  }

  /**
   * @description get a boolean
   * @param key - the configuration key
   * @param defaultValue - the default value to use if key is not configured
   * @return {boolean|undefined}
   */
  getBoolean(key: string, defaultValue: boolean): boolean {
    const value = this.getOptionalBoolean(key);
    return value != undefined ? value : defaultValue;
  }

  /**
   * @description resolves an file or directory path relative to the config directory
   * @param key - the configuration key
   * @param defaultValue - the default value to use if key is not configured
   * @return {string|undefined} the resulting path
   */
  getPath(key: string, defaultValue: string): string {
    const value = this.getOptionalPath(key);
    return value != undefined ? value : path.resolve(this.configDirectory, defaultValue);
  }

  private getValue<T>(key: string): T | undefined {
    return config.has(key) ? config.get(key) : undefined;
  }

  /**
   * @description get optional string
   * @param key - the configuration key
   * @return {string|undefined}
   */
  getOptionalString(key: string): string | undefined {
    const value = this.getValue<string>(key);
    return typeof value === 'string' || value === undefined ? value : `${value}`;
  }

  /**
   * @description get optional number
   * @param key - the configuration key
   * @return {number|undefined}
   */

  getOptionalNumber(key: string): number | undefined {
    const value = this.getValue<number>(key);
    return typeof value === 'number' || value === undefined ? value : parseInt(`${value}`);
  }

  /**
   * @description get optional boolean
   * @param key - the configuration key
   * @return {boolean|undefined}
   */

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

  /**
   * @description resolves an optional file or directory path relative to the config directory
   * @param key - the configuration key
   * @return {string|undefined} the resulting path
   */
  getOptionalPath(key: string): string | undefined {
    const value = this.getOptionalString(key);
    if (!value) {
      return value;
    }
    return path.resolve(this.configDirectory, value);
  }
}
