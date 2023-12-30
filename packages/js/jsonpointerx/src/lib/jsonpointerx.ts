/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const fromJpStringSearch = /~[01]/g;
const toJpStringSearch = /[~/]/g;

export interface JsonPointerOpts {
  noCompile?: boolean;
  blacklist?: string[];
}

export class JsonPointer {
  private static opts: JsonPointerOpts | undefined = {
    blacklist: ['__proto__', 'prototype'],
  };

  private readonly _segments: string[];
  get segments(): string[] {
    return this._segments.slice(0);
  }

  get root(): boolean {
    return this._segments.length === 0 ? true : false;
  }

  private fnGet!: (input: string) => any;

  /**
   * Creates an instance of JsonPointer.
   * @param [segments] - The path segments of the json-pointer / The decoded json-pointer
   * @param [noCompile] - disable compiling (using 'new Function')
   */
  constructor(segments?: string | string[], noCompile?: boolean) {
    if (segments) {
      if (Array.isArray(segments)) {
        this._segments = segments;
      } else {
        this._segments = [segments];
      }
    } else {
      this._segments = [];
    }
    if (JsonPointer.opts?.blacklist) {
      const blacklist = JsonPointer.opts?.blacklist;
      this._segments.forEach((segment) => {
        if (blacklist.includes(segment)) {
          throw new Error(`JSON pointer segment '${segment}' is blacklisted`);
        }
      });
    }
    if (noCompile || (JsonPointer.opts && JsonPointer.opts.noCompile)) {
      this.fnGet = this.notCompiledGet;
    } else {
      this.compileFunctions();
    }
  }

  /**
   * Get a value from a referenced location within an object
   *
   * @param input - The object to be read from
   * @returns The value from the referenced location or undefined
   */
  get(input: any): any {
    return this.fnGet(input);
  }

  /**
   * fallback if compilation (using 'new Function') is disabled
   *
   * @param input - The object to be read from
   * @returns The value from the referenced location or undefined
   */
  notCompiledGet(input: any): any {
    let node = input;
    for (let idx = 0; idx < this._segments.length;) {
      if (node == undefined) {
        return undefined;
      }
      node = node[this._segments[idx++]];
    }
    return node;
  }

  /**
   * Set a value to the referenced location within an object
   *
   * @param obj - To object to be written in
   * @param [value] - The value to be written to the referenced location
   * @returns       returns 'value' if pointer.length === 1 or 'input' otherwise
   *
   * throws if 'input' is not an object
   * throws if 'set' is called for a root JSON pointer
   * throws on invalid array index references
   * throws if one of the ancestors is a scalar (js engine): Cannot create propery 'foo' on 'baz'
   */
  set(input: any, value?: any): any {
    if (typeof input !== 'object') {
      throw new Error('Invalid input object.');
    }
    if (this._segments.length === 0) {
      throw new Error(`Set for root JSON pointer is not allowed.`);
    }

    const len = this._segments.length - 1;
    let node = input;
    let nextnode: any;
    let part: string;

    for (let idx = 0; idx < len;) {
      part = this._segments[idx++];
      nextnode = node[part];
      if (nextnode == undefined) {
        if (this._segments[idx] === '-') {
          nextnode = [];
        } else {
          nextnode = {};
        }
        if (Array.isArray(node)) {
          if (part === '-') {
            node.push(nextnode);
          } else {
            const i = parseInt(part, 10);
            if (isNaN(i)) {
              throw Error(`Invalid JSON pointer array index reference (level ${idx}).`);
            }
            node[i] = nextnode;
          }
        } else {
          node[part] = nextnode;
        }
      }
      node = nextnode;
    }

    part = this._segments[len];
    if (value === undefined) {
      delete node[part];
    } else {
      if (Array.isArray(node)) {
        if (part === '-') {
          node.push(value);
        } else {
          const i = parseInt(part, 10);
          if (isNaN(i)) {
            throw Error(`Invalid JSON pointer array index reference at end of pointer.`);
          }
          node[i] = value;
        }
      } else {
        node[part] = value;
      }
    }
    return input;
  }

  concat(p: JsonPointer): JsonPointer {
    return new JsonPointer(this._segments.concat(p.segments));
  }
  concatSegment(segment: string | string[]): JsonPointer {
    return new JsonPointer(this._segments.concat(segment));
  }
  concatPointer(pointer: string): JsonPointer {
    return this.concat(JsonPointer.compile(pointer));
  }

  toString(): string {
    if (this._segments.length === 0) {
      return '';
    }
    return '/'.concat(this._segments.map((v: string) => v.replace(toJpStringSearch, JsonPointer.toJpStringReplace)).join('/'));
  }

  toURIFragmentIdentifier(): string {
    if (this._segments.length === 0) {
      return '#';
    }
    return '#/'.concat(this._segments.map((v: string) => encodeURIComponent(v).replace(toJpStringSearch, JsonPointer.toJpStringReplace)).join('/'));
  }

  private compileFunctions(): void {
    let body = '';

    for (let idx = 0; idx < this._segments.length;) {
      const segment = this._segments[idx++].replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      body += `
      if (node == undefined) return undefined;
      node = node['${segment}'];
      `;
    }
    body += `
      return node;
    `;
    this.fnGet = new Function('node', body) as (input: string) => any;
  }

  /**
   * Instantiate a new 'JsonPointer' from encoded json-pointer
   *
   * @static
   * @param pointer - The encoded json-pointer
   * @param {boolean} [decodeOnly] - only decode and do not compile (using 'new Function')
   * @returns {JsonPointer}
   */
  static compile(pointer: string, decodeOnly?: boolean): JsonPointer {
    const segments = pointer.split('/');
    const firstSegment = segments.shift();
    if (firstSegment === '') {
      return new JsonPointer(
        segments.map((v: string) => v.replace(fromJpStringSearch, JsonPointer.fromJpStringReplace)),
        decodeOnly,
      );
    }
    if (firstSegment === '#') {
      return new JsonPointer(
        segments.map((v: string) => decodeURIComponent(v.replace(fromJpStringSearch, JsonPointer.fromJpStringReplace))),
        decodeOnly,
      );
    }
    throw new Error(`Invalid JSON pointer '${pointer}'.`);
  }

  /**
   * Get a value from a referenced location within an object
   *
   * @static
   * @param obj - The object to be read from
   * @param {string} pointer - The encoded json-pointer
   * @returns The value from the referenced location or undefined
   */
  static get(obj: any, pointer: string): any {
    return JsonPointer.compile(pointer).get(obj);
  }

  /**
   * Set a value to the referenced location within an object
   *
   * @static
   * @param obj - To object to be written in
   * @param pointer - The encoded json-pointer
   * @param [value] - The value to be written to the referenced location
   * @returns       returns 'value' if pointer.length === 1 or 'input' otherwise
   */
  static set(obj: any, pointer: string, value?: any): any {
    return JsonPointer.compile(pointer, true).set(obj, value);
  }

  /**
   * set global options
   *
   * @static
   * @param {JsonPointerOpts} opts
   */
  static options(opts?: JsonPointerOpts): JsonPointerOpts | undefined {
    if (opts) {
      JsonPointer.opts = { ...JsonPointer.opts, ...opts };
    }
    return JsonPointer.opts;
  }

  private static fromJpStringReplace(v: string): string {
    switch (v) {
      case '~1':
        return '/';
      case '~0':
        return '~';
    }
    /* istanbul ignore next */
    throw new Error('JsonPointer.escapedReplacer: this should not happen');
  }

  private static toJpStringReplace(v: string): string {
    switch (v) {
      case '/':
        return '~1';
      case '~':
        return '~0';
    }
    /* istanbul ignore next */
    throw new Error('JsonPointer.unescapedReplacer: this should not happen');
  }
}
