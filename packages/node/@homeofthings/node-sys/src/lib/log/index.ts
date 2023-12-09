import { WriteStream, createWriteStream } from 'node:fs';
import * as processNode from 'node:process';
import { format } from 'node:util';

import chalk from 'chalk';
import * as debugjs from 'debug';

import { quoteArgs } from '../util/quote';

const WARNING_PREFIX = 'WARNING: ';
const ERROR_PREFIX = 'ERROR: ';
const DEFAULT_PROMPT = '$ ';

const debug = debugjs.default('sys:log');

export let ECHO_ENABLED = true;
export let PROMPT = DEFAULT_PROMPT;

let LOGFILE: WriteStream | undefined;

export function logEcho(echo?: boolean): boolean {
  if (typeof echo === 'boolean') {
    ECHO_ENABLED = echo;
  }
  return ECHO_ENABLED;
}

export function logPrompt(prompt?: string): string {
  if (typeof prompt === 'string') {
    PROMPT = prompt;
  }
  return PROMPT;
}

export function logOpen(logfile: string, options?: BufferEncoding | { flags: string } | undefined): void {
  logClose();
  if (debug.enabled) {
    debug('opening logfile: ', logfile);
    debug('opening options: ', options);
  }
  LOGFILE = createWriteStream(logfile, options || { flags: 'w' });
  processNode.env['LOGFILE'] = logfile;
}

export function logClose(): void {
  if (LOGFILE !== undefined) {
    debug('closing logfile');
    LOGFILE.close();
    LOGFILE = undefined;
  }
  delete processNode.env['LOGFILE'];
}

export function logFile(...text: unknown[]): void {
  if (LOGFILE !== undefined && text.length) {
    LOGFILE.write(format('%s', ...text) + '\n');
  }
}

export function logInfo(...text: unknown[]): void {
  logFile(...text);
  console.info(...text);
}

export function logImportant(...text: unknown[]): void {
  logFile(...text);
  console.info(chalk.green(...text));
}

export function logWarn(...text: unknown[]): void {
  logFile(WARNING_PREFIX, ...text);
  console.warn(chalk.yellow(WARNING_PREFIX, ...text));
}

export function logError(...text: unknown[]): void {
  logFile(ERROR_PREFIX, ...text);
  console.error(chalk.red.bold(ERROR_PREFIX, ...text));
}

export function logCommand(command: string): void {
  if (!ECHO_ENABLED) {
    debug(PROMPT + command);
    return;
  }
  logInfo(PROMPT + command);
}

export function logCommandArgs(...args: string[]) {
  logCommand(getCommand(false, args));
}

export function logCommandResult<T = string | string[]>(output: T): T {
  const result = Array.isArray(output) ? output.join('\n') : output;
  if (!ECHO_ENABLED) {
    debug(result);
    return output;
  }
  logInfo(result);
  return output;
}

export function getCommand(shell: string | boolean | undefined, args: string[]): string {
  if (shell) {
    const command = typeof shell === 'string' ? quoteArgs(shell, '-c', ...args) : quoteArgs('sh', '-c', ...args);
    if (command.substring(0, 7) !== "sh -c '") {
      return command;
    }
    return command.substring(7, command.length - 1);
  } else {
    return quoteArgs(...args);
  }
}

//=================================================================
if (processNode.env['LOGFILE']) {
  const logfile = processNode.env['LOGFILE'];
  logOpen(logfile, { flags: 'a' });
}
