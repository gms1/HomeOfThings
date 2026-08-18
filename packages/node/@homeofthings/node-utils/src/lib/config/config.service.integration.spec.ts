/* eslint-disable @typescript-eslint/no-explicit-any */
import * as path from 'path';
import { fileURLToPath } from 'url';

import { ConfigService } from './config.service';

const DIRNAME = path.join(path.dirname(fileURLToPath(import.meta.url)), 'test');

process.env.NODE_CONFIG = '{}';

// NOTE: This test is excluded via testPathIgnorePatterns in jest.config.ts
// because config v5 is intentionally dual CJS/ESM — config.js is CJS, config.mjs
// is ESM, but util.js uses ESM syntax without "type":"module" in package.json.
// Jest's ESM mode cannot resolve these deep .js imports properly because
// cjs-module-lexer fails when it encounters ESM syntax in a .js file without
// "type":"module". This is NOT a bug in config v5; it's a Jest limitation.
// See ADR-001 in memory-bank/decisions/.
describe('', () => {
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
