/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigService } from './config.service';
import { DIRNAME } from './test';

process.env.NODE_CONFIG = '{}';

describe('', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService({ configDirectory: DIRNAME });
    expect(configService.environment).toBe('test');
  });

  afterEach(() => {
    (ConfigService as any)._instance = undefined;
  });

  it('get configured object for key', () => {
    const givenSection = 'testSection';
    const expectedValue = { testKey: 'foo' };
    const defaultValue = {};
    expect(configService.getObject(givenSection, defaultValue)).toStrictEqual(expectedValue);
  });

  it('get default object for key', () => {
    const givenSection = 'testSectionNotDefined';
    const defaultValue = { testKey: 'foo' };
    const expectedValue = defaultValue;
    expect(configService.getObject(givenSection, defaultValue)).toStrictEqual(expectedValue);
  });

  it('get full config', () => {
    const givenSection = '';
    const expectedValue = { testSection: { testKey: 'foo' } };
    expect(configService.getOptionalObject(givenSection)).toStrictEqual(expectedValue);
  });
});
