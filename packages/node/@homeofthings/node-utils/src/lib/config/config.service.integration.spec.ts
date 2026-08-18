/* eslint-disable @typescript-eslint/no-explicit-any */
// NOTE: This integration test file is excluded from Jest via testPathIgnorePatterns
// in jest.config.ts because it needs to load the real `config` module, which
// cannot be loaded in Jest ESM mode. The `config` npm package ships .js files
// that use ESM syntax (import/export) without "type": "module" in package.json,
// causing cjs-module-lexer to fail when parsing them as CJS.
import * as path from 'path';
import { fileURLToPath } from 'url';

import { ConfigService } from './config.service';

const DIRNAME = path.join(path.dirname(fileURLToPath(import.meta.url)), 'test');

process.env.NODE_CONFIG = '{}';

describe('ConfigService integration', () => {
  let configService: InstanceType<typeof ConfigService>;

  beforeEach(() => {
    configService = new ConfigService({ configDirectory: DIRNAME });
    const anotherConfigService = new ConfigService({ configDirectory: DIRNAME });
    expect(configService.environment).toBe('test');
    expect(anotherConfigService).toBe(configService);
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
