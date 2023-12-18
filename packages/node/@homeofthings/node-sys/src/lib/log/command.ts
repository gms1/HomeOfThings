import { logVerbose } from '@homeofthings/node-utils';
import * as debugjs from 'debug';

import { getCommand } from '../process';

const debug = debugjs.default('hot:node-sys:log:command');

const DEFAULT_PROMPT = '$ ';
let echoEnabled = true;
let currentPrompt = DEFAULT_PROMPT;

export function setEcho(echo: boolean): void {
  echoEnabled = echo;
}

export function getEcho(): boolean {
  return echoEnabled;
}

export function setPrompt(prompt: string): void {
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
