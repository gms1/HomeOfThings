[![npm version](https://badge.fury.io/js/jsonpointerx.svg)](https://badge.fury.io/js/jsonpointerx)
[![Build Workflow](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml)
[![Coverage Status](https://codecov.io/gh/gms1/HomeOfThings/branch/master/graph/badge.svg?flag=jsonpointerx)](https://app.codecov.io/gh/gms1/HomeOfThings/tree/master/packages%2Fjs%2Fjsonpointerx)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/jsonpointerx.svg?style=flat-square)](https://github.com/gms1/HomeOfThings/blob/master/packages/js/jsonpointerx/LICENSE)

# jsonpointerx

**jsonpointerx** is one of the x-th jsonpointer (rfc6901) implementation
The reason I started this project was the need for fast 'get / set' methods via JSON pointers ( see benchmark below )

## Introduction

### Installation

```shell
npm install jsonpointerx
```

### Usage

```JavaScript
import {JsonPointer} from 'jsonpointerx';

let content = { foo: ['bar', 'baz'], more: {x: 'y'} };
let jp = JsonPointer.compile('/foo/0');
let jp2 = JsonPointer.compile('/more');
let jp3 = new JsonPointer(['add','new']);    // another way to instantiate a JsonPointer using decoded path segments
                                             // (property names)

jp.get(content);                             // returns 'bar' (content.foo[0])

jp.set(content, 'bak');                      // sets content.foo[0] to 'bak'
jp.set(content);                             // deletes content.foo[0] (does not change the length of the array)
jp2.set(content);                            // deletes content.more

jp3.set(content, {key: 'value'});            // sets content.add.new.key to 'value'

jp.toString();                               // returns '/foo/0'
jp.toURIFragmentIdentifier();                // returns '#/foo/0'

jp2.concat(jp3).toString();                  // returns '/more/add/new'
jp2.concatSegment('add').toString();         // returns '/more/add'
jp2.concatSegment(['add','new']).toString(); // returns '/more/add/new'
jp2.concatPointer('/add/new').toString();    // returns '/more/add/new'

```

> NOTE: the 'get' method should never throw

for convenience these further static methods exist:

```JavaScript

JsonPointer.set(content, '/foo/0', 'bar');      // sets content.foo[0] to 'bar'
JsonPointer.get(content, '/foo/0');             // returns 'bar' (content.foo[0])

```

> NOTE: feel free to contribute if you have additional requirements

## Benchmark

```shell
gms@sirius:~/workspace/tools/benchmark/jsonpointerx$ npm test

> jsonpointer-bench@1.0.0 test
> ts-node ./src/jp-bench.ts

get defined property:
┌─────────┬────────────────────┬──────────────┬────────────────────┬──────────┬──────────┐
│ (index) │     Task Name      │   ops/sec    │ Average Time (ns)  │  Margin  │ Samples  │
├─────────┼────────────────────┼──────────────┼────────────────────┼──────────┼──────────┤
│    0    │ 'jsonpointerx.get' │ '24,027,866' │ 41.618342903253826 │ '±0.87%' │ 12013934 │
│    1    │   'json-ptr.get'   │ '22,944,210' │ 43.583980384803716 │ '±1.17%' │ 11472109 │
│    2    │ 'jsonpointer.get'  │ '4,184,033'  │ 239.0037980472164  │ '±0.08%' │ 2092017  │
│    3    │ 'json_pointer.get' │  '533,487'   │ 1874.456494550886  │ '±0.64%' │  266744  │
└─────────┴────────────────────┴──────────────┴────────────────────┴──────────┴──────────┘
get property from null ancestor:
┌─────────┬────────────────────┬──────────────┬────────────────────┬──────────┬──────────┐
│ (index) │     Task Name      │   ops/sec    │ Average Time (ns)  │  Margin  │ Samples  │
├─────────┼────────────────────┼──────────────┼────────────────────┼──────────┼──────────┤
│    0    │ 'jsonpointerx.get' │ '23,160,191' │ 43.177535195859214 │ '±1.04%' │ 11580096 │
│    1    │   'json-ptr.get'   │ '25,255,682' │ 39.59504991479924  │ '±0.06%' │ 12627842 │
│    2    │ 'jsonpointer.get'  │ '4,401,982'  │ 227.1703761632352  │ '±0.47%' │ 2200992  │
│    3    │ 'json_pointer.get' │  '186,445'   │ 5363.498878111937  │ '±0.47%' │  93223   │
└─────────┴────────────────────┴──────────────┴────────────────────┴──────────┴──────────┘
set property:
┌─────────┬────────────────────┬─────────────┬────────────────────┬──────────┬─────────┐
│ (index) │     Task Name      │   ops/sec   │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼────────────────────┼─────────────┼────────────────────┼──────────┼─────────┤
│    0    │ 'jsonpointerx.set' │ '9,247,707' │ 108.13490535394183 │ '±1.25%' │ 4623906 │
│    1    │   'json-ptr.set'   │ '4,804,467' │ 208.1396285237822  │ '±0.70%' │ 2402234 │
│    2    │ 'jsonpointer.set'  │ '3,387,908' │  295.167381741252  │ '±0.78%' │ 1693955 │
│    3    │ 'json_pointer.set' │  '395,497'  │ 2528.4619850516683 │ '±2.88%' │ 197749  │
└─────────┴────────────────────┴─────────────┴────────────────────┴──────────┴─────────┘

```

> NOTE: while 'json-ptr' is now similar fast for `get` operations, 'jsonpointerx' is about 2 times faster for the `set` operation

## Security

> NOTE: please do not feed this library with unsanitized user input

> NOTE: sometimes the use of `new Function('...')` is forbidden (e.g using strict content-security-policy)
> so you may want to disable this feature by setting the global 'noCompile' option to 'true':

```JavaScript
JsonPointer.options({noCompile: true});
```

> NOTE: you can blacklist certain JSON pointer segments. By default only `__proto__` and `prototype` are blacklisted

e.g to add 'foo' to the blacklist:

```JavaScript
JsonPointer.options().blacklist.push('foo');
```

or

```Javascript
JsonPointer.options({blacklist: ['__proto__', 'prototype', 'foo']});
```

## License

**jsonpointerx** is licensed under the MIT License:
[LICENSE](./LICENSE)

## Release Notes

[CHANGELOG](./CHANGELOG.md)
