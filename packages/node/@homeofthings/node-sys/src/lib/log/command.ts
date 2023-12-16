import * as debugjs from 'debug';

import { logVerbose } from './log';
import { getCommand } from '../process';

const debug = debugjs.default('sys:log:command');

const DEFAULT_PROMPT = '$ ';
let echoEnabled = true;
let currentPrompt = DEFAULT_PROMPT;

export function setEcho(echo?: boolean): boolean {
  if (typeof echo === 'boolean') {
    echoEnabled = echo;
  }
  return echoEnabled;
}

export function setPrompt(prompt: string) {
  currentPrompt = prompt;
}

export function getPrompt(): string {
  return currentPrompt;
}

export function logCommand(command: string): void {
  if (!echoEnabled) {
    debug(currentPrompt + command);
    return;
  }
  logVerbose(currentPrompt + command);
}

export function logCommandArgs(...args: string[]) {
  logCommand(getCommand(false, args));
}

export function logCommandResult<T = string | string[]>(output: T): T {
  const result = Array.isArray(output) ? output.join('\n') : output;
  if (!echoEnabled) {
    debug(result);
    return output;
  }
  logVerbose('', result);
  return output;
}
