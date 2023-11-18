/* eslint-disable @typescript-eslint/no-explicit-any */

import { JsonPointer } from './jsonpointerx';

function testConvertString(ptr: string, isRoot = false): void {
  const jp = JsonPointer.compile(ptr);
  expect(jp.toString()).toEqual(ptr);
  expect(jp.root).toEqual(isRoot);
}

function testConvertURIFragment(ptr: string, alt?: string, isRoot = false): void {
  const jp = JsonPointer.compile(ptr);
  expect(jp.toURIFragmentIdentifier()).toEqual(alt ? alt : ptr);
  expect(jp.root).toEqual(isRoot);
}

const DEFAULT_OPTIONS = JsonPointer.options();

describe('json-pointer', () => {
  let rfcExample: any;

  beforeEach(() => {
    JsonPointer.options(DEFAULT_OPTIONS);
    rfcExample = {
      foo: ['bar', 'baz'],
      '': 0,
      'a/b': 1,
      'c%d': 2,
      'e^f': 3,
      'g|h': 4,
      'i\\j': 5,
      'k"l': 6,
      "k'l": 6,
      ' ': 7,
      'm~n': 8,
    };
  });

  it('convert', () => {
    testConvertString('', true);
    testConvertString('/foo');
    testConvertString('/foo/0');
    testConvertString('/');
    testConvertString('/a~1b');
    testConvertString('/c%d');
    testConvertString('/e^f');
    testConvertString('/g|h');
    testConvertString('/i\\j');
    testConvertString('/k"l');
    testConvertString("/k'l");
    testConvertString('/ ');
    testConvertString('/m~0n');

    testConvertURIFragment('#', undefined, true);
    testConvertURIFragment('#/foo');
    testConvertURIFragment('#/foo/0');
    testConvertURIFragment('#/');
    testConvertURIFragment('#/a~1b', '#/a%2Fb');
    testConvertURIFragment('#/c%25d');
    testConvertURIFragment('#/e%5Ef');
    testConvertURIFragment('#/g%7Ch');
    testConvertURIFragment('#/i%5Cj');
    testConvertURIFragment('#/k%22l');
    testConvertURIFragment('#/k%27l', "#/k'l");
    testConvertURIFragment('#/%20');
    testConvertURIFragment('#/m~0n');
  });

  function testGet(decodeOnly: boolean): void {
    expect(JsonPointer.compile('', decodeOnly).get(rfcExample)).toEqual(rfcExample);
    expect(JsonPointer.compile('/foo', decodeOnly).get(rfcExample)).toEqual(rfcExample.foo);
    expect(JsonPointer.compile('/foo/0', decodeOnly).get(rfcExample)).toEqual(rfcExample.foo[0]);
    expect(JsonPointer.compile('/', decodeOnly).get(rfcExample)).toEqual(rfcExample['']);
    expect(JsonPointer.compile('/a~1b', decodeOnly).get(rfcExample)).toEqual(rfcExample['a/b']);
    expect(JsonPointer.compile('/c%d', decodeOnly).get(rfcExample)).toEqual(rfcExample['c%d']);
    expect(JsonPointer.compile('/e^f', decodeOnly).get(rfcExample)).toEqual(rfcExample['e^f']);
    expect(JsonPointer.compile('/g|h', decodeOnly).get(rfcExample)).toEqual(rfcExample['g|h']);
    expect(JsonPointer.compile('/i\\j', decodeOnly).get(rfcExample)).toEqual(rfcExample['i\\j']);
    expect(JsonPointer.compile('/k"l', decodeOnly).get(rfcExample)).toEqual(rfcExample['k"l']);
    expect(JsonPointer.compile("/k'l", decodeOnly).get(rfcExample)).toEqual(rfcExample["k'l"]);
    expect(JsonPointer.compile('/ ', decodeOnly).get(rfcExample)).toEqual(rfcExample[' ']);
    expect(JsonPointer.compile('/m~0n', decodeOnly).get(rfcExample)).toEqual(rfcExample['m~n']);

    expect(JsonPointer.compile('#', decodeOnly).get(rfcExample)).toEqual(rfcExample);
    expect(JsonPointer.compile('#/foo', decodeOnly).get(rfcExample)).toEqual(rfcExample.foo);
    expect(JsonPointer.compile('#/foo/0', decodeOnly).get(rfcExample)).toEqual(rfcExample.foo[0]);
    expect(JsonPointer.compile('#/', decodeOnly).get(rfcExample)).toEqual(rfcExample['']);
    expect(JsonPointer.compile('#/a~1b', decodeOnly).get(rfcExample)).toEqual(rfcExample['a/b']);
    expect(JsonPointer.compile('#/c%25d', decodeOnly).get(rfcExample)).toEqual(rfcExample['c%d']);
    expect(JsonPointer.compile('#/e%5Ef', decodeOnly).get(rfcExample)).toEqual(rfcExample['e^f']);
    expect(JsonPointer.compile('#/g%7Ch', decodeOnly).get(rfcExample)).toEqual(rfcExample['g|h']);
    expect(JsonPointer.compile('#/i%5Cj', decodeOnly).get(rfcExample)).toEqual(rfcExample['i\\j']);
    expect(JsonPointer.compile('#/k%22l', decodeOnly).get(rfcExample)).toEqual(rfcExample['k"l']);
    expect(JsonPointer.compile('#/k%27l', decodeOnly).get(rfcExample)).toEqual(rfcExample["k'l"]);
    expect(JsonPointer.compile('#/%20', decodeOnly).get(rfcExample)).toEqual(rfcExample[' ']);
    expect(JsonPointer.compile('#/m~0n', decodeOnly).get(rfcExample)).toEqual(rfcExample['m~n']);

    // extended the rfc example:

    // should not throw on undefined ancestors:
    expect(JsonPointer.compile('/undef1', decodeOnly).get(rfcExample)).toBeUndefined();

    expect(JsonPointer.compile('/foo/undef2', decodeOnly).get(rfcExample)).toBeUndefined();
    expect(JsonPointer.compile('/foo/undef2/undef3', decodeOnly).get(rfcExample)).toBeUndefined();

    expect(JsonPointer.compile('/foo/-', decodeOnly).get(rfcExample)).toEqual(undefined);
    expect(JsonPointer.compile('/foo/0/bar', decodeOnly).get(rfcExample)).toEqual(undefined);

    // should not throw on null ancestors:
    rfcExample.foo.null1 = null;
    expect(JsonPointer.compile('/foo/null1', decodeOnly).get(rfcExample)).toEqual(rfcExample.foo.null1);
    expect(JsonPointer.compile('/foo/null1/undef3', decodeOnly).get(rfcExample)).toBeUndefined();

    // decoding of '~01'
    rfcExample.foo['~1'] = 'foo';
    expect(JsonPointer.compile('/foo/~01', decodeOnly).get(rfcExample)).toEqual(rfcExample.foo['~1']);

    // construct
    let jp: JsonPointer;

    jp = new JsonPointer('foo', decodeOnly);
    expect(jp.get(rfcExample)).toEqual(rfcExample.foo);

    jp = new JsonPointer(['foo', '0'], decodeOnly);
    expect(jp.get(rfcExample)).toEqual(rfcExample.foo[0]);

    jp = new JsonPointer(undefined, decodeOnly);
    expect(jp.get(rfcExample)).toEqual(rfcExample);
  }

  it('get compiled', () => {
    testGet(false);
  });

  it('get non compiled', () => {
    testGet(true);
  });

  it('get non compiled', () => {
    JsonPointer.options({ noCompile: true });
    testGet(false);
    JsonPointer.options({ noCompile: false });
  });

  it('get static', () => {
    expect(JsonPointer.get(rfcExample, '/foo/0')).toEqual(rfcExample.foo[0]);
  });

  it('set static', () => {
    const setValue = 'testValue';
    JsonPointer.set(rfcExample, '/foo/0', setValue);
    expect(JsonPointer.get(rfcExample, '/foo/0')).toEqual(setValue);
  });

  it('set', () => {
    let setValue: any = {};
    let jp: JsonPointer;

    expect(() => JsonPointer.compile('').set(rfcExample, setValue)).toThrowError('Set for root JSON pointer is not allowed.');

    setValue = ['baz', 'bar'];
    jp = JsonPointer.compile('/foo');
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    setValue = 'testValue';
    jp = JsonPointer.compile('/foo/0');
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    setValue = 8;
    jp = JsonPointer.compile('/');
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    setValue = 8;
    jp = JsonPointer.compile('/a~1b');
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    setValue = 7;
    jp = JsonPointer.compile('/c%d');
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    setValue = 6;
    jp = JsonPointer.compile('/e^f');
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    setValue = 5;
    jp = JsonPointer.compile('/g|h');
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    setValue = 4;
    jp = JsonPointer.compile('/i\\j');
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    setValue = 3;
    jp = JsonPointer.compile('/k"l');
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    setValue = 3;
    jp = JsonPointer.compile("/k'l");
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    setValue = 2;
    jp = JsonPointer.compile('/ ');
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    setValue = 1;
    jp = JsonPointer.compile('/m~0n');
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    // extended the rfc example:
    setValue = 'brz';
    jp = JsonPointer.compile('/unknown1/grz');
    jp.set(rfcExample, setValue);
    expect(jp.get(rfcExample)).toEqual(setValue);

    rfcExample.grz = { brz: { mau: 'dau' } };

    JsonPointer.compile('/grz/brz').set(rfcExample);
    expect(rfcExample.grz.brz).toBeUndefined();

    setValue = 'testValue2';
    let arrLen = rfcExample.foo.length;
    jp = JsonPointer.compile('/foo/-');
    jp.set(rfcExample, setValue);
    expect(rfcExample.foo[arrLen]).toEqual(setValue);

    arrLen = rfcExample.foo.length;
    jp = JsonPointer.compile('/foo/-/part');
    jp.set(rfcExample, setValue);
    expect(rfcExample.foo[arrLen].part).toEqual(setValue);

    arrLen = rfcExample.foo.length;
    jp = JsonPointer.compile(`/foo/${arrLen}/part`);
    jp.set(rfcExample, setValue);
    expect(rfcExample.foo[arrLen].part).toEqual(setValue);

    jp = JsonPointer.compile(`/new/-/part`);
    jp.set(rfcExample, setValue);
    expect(rfcExample.new[0].part).toEqual(setValue);

    setValue = 2;

    expect(() => JsonPointer.compile('/unknown1/grz/blub/xx').set(rfcExample, setValue)).toThrowError(/^Cannot create property/);

    expect(() => JsonPointer.compile('/unknown1/grz/blub').set(rfcExample, setValue)).toThrowError(/^Cannot create property/);

    expect(() => JsonPointer.compile('/foo/unknown2/unknown3').set(rfcExample, setValue)).toThrowError('Invalid JSON pointer array index reference (level 2).');

    expect(() => JsonPointer.compile('/foo/unknown2').set(rfcExample, setValue)).toThrowError('Invalid JSON pointer array index reference at end of pointer.');

    // more:
    expect(() => JsonPointer.compile('/grz/brz').set(43)).toThrowError('Invalid input object.');
    expect(() => JsonPointer.compile('/grz/brz').set('')).toThrowError('Invalid input object.');
  });

  it('concat', () => {
    expect(JsonPointer.compile('/foo').concat(JsonPointer.compile('/0')).get(rfcExample)).toEqual(rfcExample.foo[0]);

    expect(JsonPointer.compile('/foo').concatSegment('0').get(rfcExample)).toEqual(rfcExample.foo[0]);

    expect(JsonPointer.compile('/foo').concatPointer('/0').get(rfcExample)).toEqual(rfcExample.foo[0]);

    expect(JsonPointer.compile('/foo').concatPointer('#/0').get(rfcExample)).toEqual(rfcExample.foo[0]);
  });

  it('compile failure', () => {
    expect(() => JsonPointer.compile('abc')).toThrow();
    expect(() => JsonPointer.compile('#abc')).toThrow();
    expect(() => JsonPointer.compile('/a/__proto__/b')).toThrow(); // '__proto__' is blacklisted by default
    expect(() => JsonPointer.compile('/prototype/b')).toThrow(); // 'prototype' is blacklisted by default
  });
});
