/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import * as path from 'path';

import type { ConfigOptions } from './config.options';

const mockLoadFileConfigs = jest.fn();

jest.unstable_mockModule('config', () => ({
  default: {
    util: {
      loadFileConfigs: mockLoadFileConfigs,
    },
  },
}));

const { ConfigService } = await import('./config.service');

describe('ConfigService', () => {
  let configService: InstanceType<typeof ConfigService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadFileConfigs.mockReturnValue({});
    configService = new ConfigService({});
  });

  afterEach(() => {
    (ConfigService as any)._instance = undefined;
  });

  it('getOptionalString should return string', () => {
    const givenValue = 'foo';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalString('testKey');
    expect(value).toBe(givenValue);
  });

  it('getOptionalString should return non-string value as string', () => {
    const givenValue = 4711;
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalString('testKey');
    expect(value).toBe(`${givenValue}`);
  });

  it('getOptionalString should return undefined', () => {
    mockLoadFileConfigs.mockReturnValue({});
    configService.reloadConfig();
    const value = configService.getOptionalString('testKey');
    expect(value).toBeUndefined();
  });

  it('getString should return config value', () => {
    const givenValue = 'foo';
    const defaultValue = 'bar';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getString('testKey', defaultValue);
    expect(value).toBe(givenValue);
  });

  it('getString should return default value', () => {
    const defaultValue = 'bar';
    mockLoadFileConfigs.mockReturnValue({});
    configService.reloadConfig();
    const value = configService.getString('testKey', defaultValue);
    expect(value).toBe(defaultValue);
  });

  it('getOptionalNumber should return number', () => {
    const givenValue = 4712;
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalNumber('testKey');
    expect(value).toBe(givenValue);
  });

  it('getOptionalNumber should return string value as number', () => {
    const givenNumber = 4713.5;
    const givenValue = `${givenNumber}`;
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalNumber('testKey');
    expect(value).toBe(givenNumber);
  });

  it('getOptionalNumber should return undefined if config value cannot be parsed as number', () => {
    const givenValue = 'not a number';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalNumber('testKey');
    expect(value).toBeUndefined();
  });

  it('getOptionalNumber should return undefined', () => {
    mockLoadFileConfigs.mockReturnValue({});
    configService.reloadConfig();
    const value = configService.getOptionalNumber('testKey');
    expect(value).toBeUndefined();
  });

  it('getNumber should return config value', () => {
    const givenValue = 314;
    const defaultValue = 315;
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getNumber('testKey', defaultValue);
    expect(value).toBe(givenValue);
  });

  it('getNumber should return default value if config value is not defined', () => {
    const defaultValue = 316;
    mockLoadFileConfigs.mockReturnValue({});
    configService.reloadConfig();
    const value = configService.getNumber('testKey', defaultValue);
    expect(value).toBe(defaultValue);
  });

  it('getNumber should return default value if config value cannot be parsed as number', () => {
    const givenValue = 'not a number';
    const defaultValue = 316;
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getNumber('testKey', defaultValue);
    expect(value).toBe(defaultValue);
  });

  it('getOptionalBoolean should return boolean', () => {
    const givenValue = true;
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalBoolean('testKey');
    expect(value).toBe(givenValue);
  });

  it('getOptionalBoolean should return non-boolean value "true" as boolean', () => {
    const givenValue = 'true';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalBoolean('testKey');
    expect(value).toBe(true);
  });

  it('getOptionalBoolean should return non-boolean value "1" as boolean', () => {
    const givenValue = '1';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalBoolean('testKey');
    expect(value).toBe(true);
  });

  it('getOptionalBoolean should return non-boolean value "false" as boolean', () => {
    const givenValue = 'false';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalBoolean('testKey');
    expect(value).toBe(false);
  });

  it('getOptionalBoolean should return non-boolean value "0" as boolean', () => {
    const givenValue = '0';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalBoolean('testKey');
    expect(value).toBe(false);
  });

  it('getOptionalBoolean should return non-boolean value "foo" as undefined', () => {
    const givenValue = 'foo';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalBoolean('testKey');
    expect(value).toBe(undefined);
  });

  it('getOptionalBoolean should return undefined', () => {
    mockLoadFileConfigs.mockReturnValue({});
    configService.reloadConfig();
    const value = configService.getOptionalBoolean('testKey');
    expect(value).toBeUndefined();
  });

  it('getBoolean should return config value', () => {
    const givenValue = true;
    const defaultValue = false;
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getBoolean('testKey', defaultValue);
    expect(value).toBe(givenValue);
  });

  it('getBoolean should return default value if config value is not defined', () => {
    const defaultValue = true;
    mockLoadFileConfigs.mockReturnValue({});
    configService.reloadConfig();
    const value = configService.getBoolean('testKey', defaultValue);
    expect(value).toBe(defaultValue);
  });

  it('getBoolean should return default value if config value cannot be parsed as boolean', () => {
    const givenValue = 'not a boolean';
    const defaultValue = false;
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getBoolean('testKey', defaultValue);
    expect(value).toBe(defaultValue);
  });

  it('getOptionalPath should return absolute path as is', () => {
    const givenValue = '/foo';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalPath('testKey');
    expect(value).toBe(givenValue);
  });

  it('getOptionalPath should return resolved path', () => {
    const givenValue = 'foo';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalPath('testKey');
    expect(value).toBe(path.resolve(configService.configDirectory, givenValue));
  });

  it('getOptionalPath should return undefined', () => {
    mockLoadFileConfigs.mockReturnValue({});
    configService.reloadConfig();
    const value = configService.getOptionalPath('testKey');
    expect(value).toBeUndefined();
  });

  it('getPath should return absolute path as is', () => {
    const givenValue = '/foo';
    const defaultValue = '/bar';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getPath('testKey', defaultValue);
    expect(value).toBe(givenValue);
  });

  it('getPath should return resolved path', () => {
    const givenValue = 'foo';
    const defaultValue = '/bar';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getPath('testKey', defaultValue);
    expect(value).toBe(path.resolve(configService.configDirectory, givenValue));
  });

  it('getPath should return absolute default path as is', () => {
    const defaultValue = '/bar';
    mockLoadFileConfigs.mockReturnValue({});
    configService.reloadConfig();
    const value = configService.getPath('testKey', defaultValue);
    expect(value).toBe(defaultValue);
  });

  it('getPath should return resolved default path', () => {
    const defaultValue = 'bar';
    mockLoadFileConfigs.mockReturnValue({});
    configService.reloadConfig();
    const value = configService.getPath('testKey', defaultValue);
    expect(value).toBe(path.resolve(configService.configDirectory, defaultValue));
  });
});

describe('ConfigService getConfig/getObject', () => {
  let configService: InstanceType<typeof ConfigService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadFileConfigs.mockReturnValue({});
    configService = new ConfigService({});
  });

  afterEach(() => {
    (ConfigService as any)._instance = undefined;
  });

  it('getConfig should return config object for key', () => {
    const givenValue = { subKey: 'subValue' };
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getConfig('testKey');
    expect(value).toEqual(givenValue);
  });

  it('getConfig should return undefined for non-object value', () => {
    const givenValue = 'foo';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getConfig('testKey');
    expect(value).toBeUndefined();
  });

  it('getConfig should return full config when no key is provided', () => {
    const givenConfig = { key1: 'val1', key2: 'val2' };
    mockLoadFileConfigs.mockReturnValue(givenConfig);
    configService.reloadConfig();
    const value = configService.getConfig('');
    expect(value).toEqual(givenConfig);
  });

  it('getObject should return cloned object for key', () => {
    const givenValue = { subKey: 'subValue' };
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getObject('testKey', {});
    expect(value).toEqual(givenValue);
    // verify it's a clone, not the same reference
    expect(value).not.toBe(givenValue);
  });

  it('getObject should return cloned default value when key not found', () => {
    const defaultValue = { defaultKey: 'defaultValue' };
    mockLoadFileConfigs.mockReturnValue({});
    configService.reloadConfig();
    const value = configService.getObject('testKey', defaultValue);
    expect(value).toEqual(defaultValue);
    expect(value).not.toBe(defaultValue);
  });

  it('getOptionalObject should return cloned object for key', () => {
    const givenValue = { subKey: 'subValue' };
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalObject('testKey');
    expect(value).toEqual(givenValue);
    expect(value).not.toBe(givenValue);
  });

  it('getOptionalObject should return undefined for non-object value', () => {
    const givenValue = 'foo';
    mockLoadFileConfigs.mockReturnValue({ testKey: givenValue });
    configService.reloadConfig();
    const value = configService.getOptionalObject('testKey');
    expect(value).toBeUndefined();
  });

  it('getOptionalObject should return undefined when key not found', () => {
    mockLoadFileConfigs.mockReturnValue({});
    configService.reloadConfig();
    const value = configService.getOptionalObject('testKey');
    expect(value).toBeUndefined();
  });

  it('should return existing instance when constructed twice', () => {
    const first = new ConfigService({});
    const second = new ConfigService({});
    expect(second).toBe(first);
  });
});

describe('ConfigService instantiation', () => {
  const givenNodeConfigEnv = 'envFromNodeConfigEnv';
  const givenNodeEnv = 'envFromNodeEnv';
  const givenOptionsEnv = 'envFromOptions';
  const givenNodeConfigDir = 'dirFromNodeConfigDir';
  const givenOptionsDir = 'dirFromOptions';
  let givenOptions: ConfigOptions;

  beforeEach(() => {
    givenOptions = { environment: givenOptionsEnv, configDirectory: givenOptionsDir };
    process.env.NODE_CONFIG_ENV = givenNodeConfigEnv;
    process.env.NODE_ENV = givenNodeEnv;
    process.env.NODE_CONFIG_DIR = givenNodeConfigDir;
    mockLoadFileConfigs.mockReturnValue({});
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
    expect(configService.environment).toBe(ConfigService.DEFAULT_ENV);
    expect(process.env.NODE_CONFIG_ENV).toBe(ConfigService.DEFAULT_ENV);
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
