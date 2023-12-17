export function quoteArg(arg: string): string {
  if (arg.length > 0 && !/[^\w\d%+-./:=@_§€]/.test(arg)) {
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
