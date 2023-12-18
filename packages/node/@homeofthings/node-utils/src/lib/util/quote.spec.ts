import { quoteArg, quoteArgs } from './quote';

describe('quote', () => {
  it('`quoteArg` should quote the arg', () => {
    const givenArgs = ['', "'", 'hello', 'hel lo', 'hello "world"'];
    const expectedArgs = [`''`, `"'"`, `hello`, "'hel lo'", '\'hello "world"\''];

    for (let idx = 0; idx < givenArgs.length; idx++) {
      expect(quoteArg(givenArgs[idx])).toBe(expectedArgs[idx]);
    }
  });

  it('`quoteArgs` should join the quoted args', () => {
    const givenArgs = ['hello', 'world'];
    const expectedArgs = 'hello world';
    expect(quoteArgs(...givenArgs)).toBe(expectedArgs);
  });
});
