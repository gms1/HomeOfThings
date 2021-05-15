import * as chalk from 'chalk';
import * as supports_color from 'supports-color';
import * as winston from 'winston';

const colorizer = winston.format.colorize();

// unit test should not depend on the provided terminal
/* istanbul ignore next */
const supportsColor = (supports_color.stdout || supports_color.stderr || process.env.FORCE_COLOR) && !process.env.NO_COLORS;

function fileLevelFormat(level: string) {
  return (level + ':      ').substr(0, 8);
}

function consoleLevelFormat(level: string) {
  // unit test should not depend on the provided terminal
  /* istanbul ignore next */
  return supportsColor ? colorizer.colorize(level, fileLevelFormat(level)) : fileLevelFormat(level);
}

function fileContextFormat(context?: string) {
  return context ? ` [${context}]` : '';
}

function consoleContextFormat(context?: string) {
  if (!context) {
    return fileContextFormat(context);
  }
  let color: number;
  if (CONTEXT_COLOR_CACHE.context === context) {
    color = CONTEXT_COLOR_CACHE.color as number;
  } else {
    color = selectColor(context);
    CONTEXT_COLOR_CACHE.context = context;
    CONTEXT_COLOR_CACHE.color = color;
  }
  // unit test should not depend on the provided terminal
  /* istanbul ignore next */
  return chalk.bold?.ansi256 ? chalk.bold.ansi256(color)(fileContextFormat(context)) : fileContextFormat(context);
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
// stolen from https://github.com/visionmedia/debug/blob/master/src/node.js

const CONTEXT_COLOR_CACHE: { color?: number; context?: string } = {};

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

function selectColor(namespace: string) {
  let hash = 0;

  for (let i = 0; i < namespace.length; i++) {
    hash = (hash << 5) - hash + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return DEBUG_COLORS[Math.abs(hash) % DEBUG_COLORS.length];
}
