export function quoteArg(arg: string): string {
  if (arg.length === 0) {
    return `''`;
  }
  if (!/[^\w\d%+-./:=@_§€]/.test(arg)) {
    return arg;
  }
  if (!/'/.test(arg)) {
    return `'` + arg + `'`;
  }
  return `"` + arg.replace(/(["\\$`!])/g, '\\$1') + `"`;
}

export function quoteArgs(...args: string[]): string {
  return args.map((arg) => quoteArg(arg)).join(' ');
}

export function quoteShellArgs(...args: string[]): string {
  return args
    .map((arg) => {
      if (/\?\*\[/.test(arg)) {
        // this must not be quoted since we want to make use of shell globbing
        // quoting partially e.g. '/my path/'* seems to be too hard to implement for now
        // so we are just escaping here e.g my\ path/* to avoid word splitting of this argument
        return arg.replace(/([^\\])(\s)/g, '$1\\$2');
      } else {
        return quoteArg(arg);
      }
    })
    .join(' ');
}
