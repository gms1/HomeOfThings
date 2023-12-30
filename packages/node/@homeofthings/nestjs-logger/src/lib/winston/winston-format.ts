import chalk from 'chalk';
import * as supports_color from 'supports-color';
import * as winston from 'winston';

const colorizer = winston.format.colorize();

// unit test should not depend on the provided terminal

/* istanbul ignore next */
const supportsColor = (supports_color.stdout || supports_color.stderr || process.env.FORCE_COLOR) && !process.env.NO_COLORS;

/* istanbul ignore next */
const colorizeLevel: (level: string, text: string) => string = supportsColor
  ? (level: string, text: string) => colorizer.colorize(level, text)
  : (level: string, text: string) => text;

/* istanbul ignore next */
const colorizeContext: (context: string, text: string) => string = supportsColor && chalk.bold?.ansi256
  ? (context: string, text: string) => chalk.bold.ansi256(getContextColor(context))(text)
  : supportsColor && chalk.ansi256
  ? (context: string, text: string) => chalk.ansi256(getContextColor(context))(text)
  : (context: string, text: string) => text;

function fileLevelFormat(level: string) {
  return (level + ':      ').substr(0, 8);
}

function consoleLevelFormat(level: string) {
  return colorizeLevel(level, fileLevelFormat(level));
}

function fileContextFormat(context?: string) {
  return context ? ` [${context}]` : '';
}

function consoleContextFormat(context?: string) {
  if (!context) {
    return fileContextFormat(context);
  }
  return colorizeContext(context, fileContextFormat(context));
}

export const DEFAULT_CONSOLE_FORMAT = winston.format.printf(({ level, message, timestamp, stack, context, ...meta }) => {
  let line = `${timestamp} ${consoleLevelFormat(level)}${consoleContextFormat(context)} ${message}`;
  if (Object.keys(meta).length) {
    line += ' ' + JSON.stringify(meta);
  }
  if (stack) {
    line += '\n' + stack;
  }
  return line;
});

export const DEFAULT_FILE_FORMAT = winston.format.printf(({ level, message, timestamp, stack, context, ...meta }) => {
  let line = `${timestamp} ${fileLevelFormat(level)}${fileContextFormat(context)} ${message}`;
  if (Object.keys(meta).length) {
    line += ' ' + JSON.stringify(meta);
  }
  if (stack) {
    line += '\n' + stack;
  }
  return line;
});

// ######################################################################################################
const CONTEXT_COLOR_CACHE: { [context: string]: number | undefined } = {};
const CONTEXT_COLOR_CACHE_SIZE = 10;

export function getContextColor(context: string): number {
  let color = CONTEXT_COLOR_CACHE[context];
  if (color !== undefined) {
    return color;
  }
  const keys = Object.keys(CONTEXT_COLOR_CACHE);
  /* istanbul ignore if */
  if (keys.length > CONTEXT_COLOR_CACHE_SIZE - 1) {
    keys.splice(0, keys.length - CONTEXT_COLOR_CACHE_SIZE + 1).forEach((key) => delete CONTEXT_COLOR_CACHE[key]);
  }
  CONTEXT_COLOR_CACHE[context] = color = selectColor(context);
  return color;
}

// ######################################################################################################
// stolen from https://github.com/visionmedia/debug/blob/master/src/node.js

const DEBUG_COLORS = [
  20,
  21,
  26,
  27,
  32,
  33,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  56,
  57,
  62,
  63,
  68,
  69,
  74,
  75,
  76,
  77,
  78,
  79,
  80,
  81,
  92,
  93,
  98,
  99,
  112,
  113,
  128,
  129,
  134,
  135,
  148,
  149,
  160,
  161,
  162,
  163,
  164,
  165,
  166,
  167,
  168,
  169,
  170,
  171,
  172,
  173,
  178,
  179,
  184,
  185,
  196,
  197,
  198,
  199,
  200,
  201,
  202,
  203,
  204,
  205,
  206,
  207,
  208,
  209,
  214,
  215,
  220,
  221,
];

function selectColor(namespace: string): number {
  let hash = 0;

  for (let i = 0; i < namespace.length; i++) {
    hash = (hash << 5) - hash + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return DEBUG_COLORS[Math.abs(hash) % DEBUG_COLORS.length] as number;
}
