/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('config', () => ({
  has: jest.fn(),
  get: jest.fn(),
}));

import * as config from 'config';
import * as path from 'path';

import { ConfigService, DEFAULT_ENV } from './config.service';
import { ConfigModuleOptions } from './model';

describe('ConfigService', () => {
  let configService: ConfigService;
  let has: jest.Mock;
  let get: jest.Mock;

  beforeAll(() => {
    has = config.has as jest.Mock;
    get = config.get as jest.Mock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    configService = new ConfigService({});
  });

  afterEach(() => {
    (ConfigService as any)._instance = undefined;
  });

  it('getOptionalString should return string', () => {
    const givenValue = 'foo';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalString('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getOptionalString should return non-string value as string', () => {
    const givenValue = 4711;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalString('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(`${givenValue}`);
  });

  it('getOptionalString should return undefined', () => {
    has.mockReturnValueOnce(false);
    const value = configService.getOptionalString('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(0);
    expect(value).toBeUndefined();
  });

  it('getString should return config value', () => {
    const givenValue = 'foo';
    const defaultValue = 'bar';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getString('testKey', defaultValue);
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getString should return default value', () => {
    const defaultValue = 'bar';
    has.mockReturnValueOnce(false);
    const value = configService.getString('testKey', defaultValue);
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(0);
    expect(value).toBe(defaultValue);
  });

  it('getOptionalNumber should return number', () => {
    const givenValue = 4712;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalNumber('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getOptionalNumber should return string value as number', () => {
    const givenNumber = 4713.5;
    const givenValue = `${givenNumber}`;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalNumber('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(givenNumber);
  });

  it('getOptionalNumber should return undefined if config value cannot be parsed as number', () => {
    const givenNumber = 'not a number';
    const givenValue = `${givenNumber}`;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalNumber('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBeUndefined();
  });

  it('getOptionalNumber should return undefined', () => {
    has.mockReturnValueOnce(false);
    const value = configService.getOptionalNumber('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(0);
    expect(value).toBeUndefined();
  });

  it('getNumber should return config value', () => {
    const givenValue = 314;
    const defaultValue = 315;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getNumber('testKey', defaultValue);
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getNumber should return default value if config value is not defined', () => {
    const defaultValue = 316;
    has.mockReturnValueOnce(false);
    const value = configService.getNumber('testKey', defaultValue);
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(0);
    expect(value).toBe(defaultValue);
  });

  it('getNumber should return default value if config value cannot be parsed as number', () => {
    const givenValue = 'not a number';
    const defaultValue = 316;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getNumber('testKey', defaultValue);
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(defaultValue);
  });

  it('getOptionalBoolean should return boolean', () => {
    const givenValue = true;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getOptionalBoolean should return non-boolean value "true" as boolean', () => {
    const givenValue = 'true';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(true);
  });

  it('getOptionalBoolean should return non-boolean value "1" as boolean', () => {
    const givenValue = '1';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(true);
  });

  it('getOptionalBoolean should return non-boolean value "false" as boolean', () => {
    const givenValue = 'false';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(false);
  });

  it('getOptionalBoolean should return non-boolean value "0" as boolean', () => {
    const givenValue = '0';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(false);
  });

  it('getOptionalBoolean should return non-boolean value "foo" as undefined', () => {
    const givenValue = 'foo';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(undefined);
  });

  it('getOptionalBoolean should return undefined', () => {
    has.mockReturnValueOnce(false);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(0);
    expect(value).toBeUndefined();
  });

  it('getBoolean should return config value', () => {
    const givenValue = true;
    const defaultValue = false;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getBoolean('testKey', defaultValue);
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getBoolean should return default value if config value is not defined', () => {
    const defaultValue = true;
    has.mockReturnValueOnce(false);
    const value = configService.getBoolean('testKey', defaultValue);
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(0);
    expect(value).toBe(defaultValue);
  });

  it('getBoolean should return default value if config value cannot be parsed as boolean', () => {
    const givenValue = 'not a boolean';
    const defaultValue = false;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getBoolean('testKey', defaultValue);
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(defaultValue);
  });

  it('getOptionalPath should return absolute path as is', () => {
    const givenValue = '/foo';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalPath('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getOptionalPath should return resolved path', () => {
    const givenValue = 'foo';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalPath('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(path.resolve(configService.configDirectory, givenValue));
  });

  it('getOptionalPath should return undefined', () => {
    has.mockReturnValueOnce(false);
    const value = configService.getOptionalPath('testKey');
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(0);
    expect(value).toBeUndefined();
  });

  it('getPath should return absolute path as is', () => {
    const givenValue = '/foo';
    const defaultValue = '/bar';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getPath('testKey', defaultValue);
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getPath should return resolved path', () => {
    const givenValue = 'foo';
    const defaultValue = '/bar';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getPath('testKey', defaultValue);
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(value).toBe(path.resolve(configService.configDirectory, givenValue));
  });

  it('getPath should return absolute default path as is', () => {
    const defaultValue = '/bar';
    has.mockReturnValueOnce(false);
    const value = configService.getPath('testKey', defaultValue);
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(0);
    expect(value).toBe(defaultValue);
  });

  it('getPath should return resolved default path', () => {
    const defaultValue = 'bar';
    has.mockReturnValueOnce(false);
    const value = configService.getPath('testKey', defaultValue);
    expect(has).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(0);
    expect(value).toBe(path.resolve(configService.configDirectory, defaultValue));
  });
});

describe('ConfigService instantiation', () => {
  const givenNodeConfigEnv = 'envFromNodeConfigEnv';
  const givenNodeEnv = 'envFromNodeEnv';
  const givenOptionsEnv = 'envFromOptions';
  const givenNodeConfigDir = 'dirFromNodeConfigDir';
  const givenOptionsDir = 'dirFromOptions';
  let givenOptions: ConfigModuleOptions;

  beforeEach(() => {
    givenOptions = { environment: givenOptionsEnv, configDirectory: givenOptionsDir };
    process.env.NODE_CONFIG_ENV = givenNodeConfigEnv;
    process.env.NODE_ENV = givenNodeEnv;
    process.env.NODE_CONFIG_DIR = givenNodeConfigDir;
  });
  afterEach(() => {
    (ConfigService as any)._instance = undefined;
  });

  afterAll(() => {
    delete process.env.NODE_CONFIG_ENV;
    delete process.env.NODE_CONFIG_DIR;
    process.env.NODE_ENV = 'test';
  });

  it('should set singleton', () => {
    const configService = new ConfigService(givenOptions);
    expect(ConfigService.getInstance()).toBe(configService);
  });

  it('should set opts', () => {
    const configService = new ConfigService(givenOptions);
    expect(configService.opts).toBe(givenOptions);
  });

  it('environment should be taken from options', () => {
    const configService = new ConfigService(givenOptions);
    expect(configService.environment).toBe(givenOptionsEnv);
    expect(process.env.NODE_CONFIG_ENV).toBe(configService.environment);
  });

  it('environment should be taken from NODE_CONFIG_ENV', () => {
    delete givenOptions.environment;
    const configService = new ConfigService(givenOptions);
    expect(configService.environment).toBe(givenNodeConfigEnv);
    expect(process.env.NODE_CONFIG_ENV).toBe(configService.environment);
  });

  it('environment should be taken from NODE_ENV', () => {
    delete givenOptions.environment;
    delete process.env.NODE_CONFIG_ENV;
    const configService = new ConfigService(givenOptions);
    expect(configService.environment).toBe(givenNodeEnv);
    expect(process.env.NODE_CONFIG_ENV).toBe(configService.environment);
  });

  it('environment should be DEFAULT_ENV by default', () => {
    delete givenOptions.environment;
    delete process.env.NODE_CONFIG_ENV;
    delete process.env.NODE_ENV;
    const configService = new ConfigService(givenOptions);
    expect(configService.environment).toBe(DEFAULT_ENV);
    expect(process.env.NODE_CONFIG_ENV).toBe(DEFAULT_ENV);
  });

  it('config-directory should be taken from options', () => {
    const configService = new ConfigService(givenOptions);
    expect(configService.configDirectory).toBe(givenOptionsDir);
    expect(process.env.NODE_CONFIG_DIR).toBe(configService.configDirectory);
  });

  it('config-directory should be taken from NODE_CONFIG_DIR', () => {
    delete givenOptions.configDirectory;
    const configService = new ConfigService(givenOptions);
    expect(configService.configDirectory).toBe(givenNodeConfigDir);
    expect(process.env.NODE_CONFIG_DIR).toBe(configService.configDirectory);
  });

  it('config-directory should be "config" (inside current directory) by default', () => {
    delete givenOptions.configDirectory;
    delete process.env.NODE_CONFIG_DIR;
    const configService = new ConfigService(givenOptions);
    expect(configService.configDirectory).toBe(path.resolve(process.cwd(), 'config'));
    expect(process.env.NODE_CONFIG_DIR).toBe(configService.configDirectory);
  });
});
