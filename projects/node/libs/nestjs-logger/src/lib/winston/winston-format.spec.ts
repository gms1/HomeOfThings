import * as winston from 'winston';
import { DEFAULT_CONSOLE_FORMAT, DEFAULT_FILE_FORMAT, getContextColor } from './winston-format';

describe('Winston Default Console Format', () => {
  it('should build console log message with context', () => {
    const givenInfo: winston.Logform.TransformableInfo = {
      timestamp: 'timestamp',
      level: 'info',
      message: 'info message',
      context: 'logger',
    };
    const resultInfo = DEFAULT_CONSOLE_FORMAT.transform(givenInfo);
    const message = resultInfo[Object.getOwnPropertySymbols(resultInfo)[0]];
    expect(message).toMatch(/^timestamp\s+.*info:.*\s+.*\[logger\].* info message$/);
  });

  it('should build console log message with stack', () => {
    const givenInfo: winston.Logform.TransformableInfo = {
      timestamp: 'timestamp',
      level: 'error',
      message: 'error message',
      stack: 'trace',
    };
    const resultInfo = DEFAULT_CONSOLE_FORMAT.transform(givenInfo);
    const message = resultInfo[Object.getOwnPropertySymbols(resultInfo)[0]];
    expect(message).toMatch(/^timestamp\s+.*error:.*\s+error message\ntrace$/);
  });

  it('should build console log message with meta info', () => {
    const givenInfo: winston.Logform.TransformableInfo = {
      timestamp: 'timestamp',
      level: 'debug',
      message: 'debug message',
      meta: { x: 1 },
    };
    const resultInfo = DEFAULT_CONSOLE_FORMAT.transform(givenInfo);
    const message = resultInfo[Object.getOwnPropertySymbols(resultInfo)[0]];
    expect(message).toMatch(/^timestamp\s+.*debug:.*\s+debug message \{"meta":\{"x":1\}\}$/);
  });

  it('get context color', () => {
    const givenContext = 'test context';
    const firstColor = getContextColor(givenContext);
    const secondColor = getContextColor(givenContext);
    expect(firstColor).toBe(secondColor);
  });
});

describe('Winston Default File Format', () => {
  it('should build file log message with context', () => {
    const givenInfo: winston.Logform.TransformableInfo = {
      timestamp: 'timestamp',
      level: 'info',
      message: 'info message',
      context: 'logger',
    };
    const resultInfo = DEFAULT_FILE_FORMAT.transform(givenInfo);
    const message = resultInfo[Object.getOwnPropertySymbols(resultInfo)[0]];
    expect(message).toBe('timestamp info:    [logger] info message');
  });

  it('should build file log message with stack', () => {
    const givenInfo: winston.Logform.TransformableInfo = {
      timestamp: 'timestamp',
      level: 'error',
      message: 'error message',
      stack: 'trace',
    };
    const resultInfo = DEFAULT_FILE_FORMAT.transform(givenInfo);
    const message = resultInfo[Object.getOwnPropertySymbols(resultInfo)[0]];
    expect(message).toBe('timestamp error:   error message\ntrace');
  });

  it('should build file log message with meta info', () => {
    const givenInfo: winston.Logform.TransformableInfo = {
      timestamp: 'timestamp',
      level: 'debug',
      message: 'debug message',
      meta: { x: 1 },
    };
    const resultInfo = DEFAULT_FILE_FORMAT.transform(givenInfo);
    const message = resultInfo[Object.getOwnPropertySymbols(resultInfo)[0]];
    expect(message).toBe('timestamp debug:   debug message {"meta":{"x":1}}');
  });
});
