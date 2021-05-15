import * as config from 'config';
import { ConfigService } from './config.service';

jest.mock('config', () => ({
  has: jest.fn(),
  get: jest.fn(),
}));

describe('ConfigService', () => {
  let configService: ConfigService;
  let has: jest.Mock;
  let get: jest.Mock;

  beforeAll(() => {
    expect(config).toBeDefined();
    has = config.has as jest.Mock;
    get = config.get as jest.Mock;
    configService = new ConfigService({});
  });

  beforeEach(() => {
    has.mockReset();
    get.mockReset();
  });

  it('getOptionalString should return string', () => {
    const givenValue = 'foo';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalString('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getOptionalString should return non-string value as string', () => {
    const givenValue = 4711;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalString('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(`${givenValue}`);
  });

  it('getOptionalString should return undefined', () => {
    const givenValue = undefined;
    has.mockReturnValueOnce(false);
    const value = configService.getOptionalString('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(0);
    expect(value).toBe(givenValue);
  });

  it('getString should return config value', () => {
    const givenValue = 'foo';
    const defaultValue = 'bar';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getString('testKey', defaultValue);
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getString should return default value', () => {
    const defaultValue = 'bar';
    has.mockReturnValueOnce(false);
    const value = configService.getString('testKey', defaultValue);
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(0);
    expect(value).toBe(defaultValue);
  });

  it('getOptionalNumber should return number', () => {
    const givenValue = 4712;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalNumber('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getOptionalNumber should return non-number value as number', () => {
    const givenNumber = 4713;
    const givenValue = `${givenNumber}`;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalNumber('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(givenNumber);
  });

  it('getOptionalNumber should return undefined', () => {
    const givenValue = undefined;
    has.mockReturnValueOnce(false);
    const value = configService.getOptionalNumber('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(0);
    expect(value).toBe(givenValue);
  });

  it('getNumber should return config value', () => {
    const givenValue = 314;
    const defaultValue = 315;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getNumber('testKey', defaultValue);
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getNumber should return default value', () => {
    const defaultValue = 316;
    has.mockReturnValueOnce(false);
    const value = configService.getNumber('testKey', defaultValue);
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(0);
    expect(value).toBe(defaultValue);
  });

  it('getOptionalBoolean should return boolean', () => {
    const givenValue = true;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getOptionalBoolean should return non-boolean value "true" as boolean', () => {
    const givenValue = 'true';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(true);
  });

  it('getOptionalBoolean should return non-boolean value "1" as boolean', () => {
    const givenValue = '1';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(true);
  });

  it('getOptionalBoolean should return non-boolean value "false" as boolean', () => {
    const givenValue = 'false';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(false);
  });

  it('getOptionalBoolean should return non-boolean value "0" as boolean', () => {
    const givenValue = '0';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(false);
  });

  it('getOptionalBoolean should return non-boolean value "foo" as undefined', () => {
    const givenValue = 'foo';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(undefined);
  });

  it('getOptionalBoolean should return undefined', () => {
    const givenValue = undefined;
    has.mockReturnValueOnce(false);
    const value = configService.getOptionalBoolean('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(0);
    expect(value).toBe(givenValue);
  });

  it('getBoolean should return config value', () => {
    const givenValue = true;
    const defaultValue = false;
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getBoolean('testKey', defaultValue);
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getBoolean should return default value', () => {
    const defaultValue = true;
    has.mockReturnValueOnce(false);
    const value = configService.getBoolean('testKey', defaultValue);
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(0);
    expect(value).toBe(defaultValue);
  });

  it('getOptionalPath should return path', () => {
    const givenValue = '/foo';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getOptionalPath('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getOptionalPath should return undefined', () => {
    const givenValue = undefined;
    has.mockReturnValueOnce(false);
    const value = configService.getOptionalPath('testKey');
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(0);
    expect(value).toBe(givenValue);
  });

  it('getPath should return config value', () => {
    const givenValue = '/foo';
    const defaultValue = '/bar';
    has.mockReturnValueOnce(true);
    get.mockReturnValueOnce(givenValue);
    const value = configService.getPath('testKey', defaultValue);
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(1);
    expect(value).toBe(givenValue);
  });

  it('getPath should return default value', () => {
    const defaultValue = '/bar';
    has.mockReturnValueOnce(false);
    const value = configService.getPath('testKey', defaultValue);
    expect(has).toBeCalledTimes(1);
    expect(get).toBeCalledTimes(0);
    expect(value).toBe(defaultValue);
  });
});