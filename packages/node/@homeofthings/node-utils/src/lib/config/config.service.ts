import * as process from 'node:process';

import nodeConfig from 'config';
import * as debugjs from 'debug';
import * as path from 'path';

import { ConfigOptions } from './config.options';

process.env.SUPPRESS_NO_CONFIG_WARNING = '1';
const debug = debugjs.default('hot:node-utils');

let _configData: Record<string, any>;

/** Resolve a dot-separated key path on an object, returning undefined if any segment is missing. */
function getPath<T>(object: Record<string, any>, key: string): T | undefined {
  return key.split('.').reduce<any>((o, k) => o?.[k], object) as T | undefined;
}

/** Deep-clone an object via JSON round-trip (equivalent to Util.toObject from config). */
function toObject(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

/** ConfigService to read configured values. */
export class ConfigService {
  public static readonly DEFAULT_ENV = 'development'; // NOTE: node-config is using this if neither NODE_CONFIG_ENV nor NODE_ENV is defined and non empty (truthy)
  private static _instance: ConfigService;

  readonly configDirectory!: string;
  readonly environment!: string;

  get opts(): ConfigOptions {
    return this._opts;
  }

  constructor(private _opts: ConfigOptions) {
    if (ConfigService._instance) {
      return ConfigService._instance;
    }
    ConfigService._instance = this;

    this.environment = this._opts.environment || process.env.NODE_CONFIG_ENV || process.env.NODE_ENV || ConfigService.DEFAULT_ENV;
    this.configDirectory = this._opts.configDirectory || process.env.NODE_CONFIG_DIR || path.resolve(process.cwd(), 'config');

    debug(`environment: '${this.environment}'`);
    debug(`config-directory: '${this.configDirectory}'`);
    this.reloadConfig();
  }

  private getValue<T>(key: string): T | undefined {
    return getPath<T>(_configData, key);
  }

  /**
   * @description get immutable config
   * NOTE: consider using `getOptionalObject` to get the corresponding mutable object
   * @param key - the configuration key
   * @return {object|undefined}
   */
  getConfig(key: string): object | undefined {
    const value = key ? this.getValue<object>(key) : _configData;
    return typeof value === 'object' ? value : undefined;
  }

  reloadConfig(): void {
    // sync our settings with node-config
    // NOTE: do not overwrite NODE_ENV
    process.env.NODE_CONFIG_ENV = this.environment;
    process.env.NODE_CONFIG_DIR = this.configDirectory;

    // nodeConfig.util.loadFileConfigs() reads config from env vars
    // (NODE_CONFIG_ENV, NODE_CONFIG_DIR, etc.) and returns the raw config object.
    _configData = nodeConfig.util.loadFileConfigs();
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
   * @description get an object
   * @param key - the configuration key
   * @param defaultValue - the default value to use if key is not configured
   * @return {object|undefined}
   */
  getObject(key: string, defaultValue: object): object {
    const value = this.getOptionalObject(key);
    return value != undefined ? value : toObject(defaultValue);
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
    if (typeof value === 'number' || value === undefined) {
      return value;
    }
    const parsedValue = parseFloat(`${value}`);
    return isNaN(parsedValue) ? undefined : parsedValue;
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
   * @description get optional cloned object
   * @param key - the configuration key
   * @return {object|undefined}
   */
  getOptionalObject(key: string): object | undefined {
    const value = this.getConfig(key);
    return typeof value === 'object' ? toObject(value) : undefined;
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

  static getInstance(): ConfigService {
    return this._instance;
  }
}
