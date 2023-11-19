// tslint:disable no-require-imports no-var-requires variable-name no-null-keyword
import { Bench } from 'tinybench';
import { JsonPointer as JsonPointerX } from 'jsonpointerx';
import { JsonPointer as json_ptr_i } from 'json-ptr';
const jsonpointer_i = require('jsonpointer');
const json_pointer_i = require('json-pointer');

const OPTIONS = { iterations: 20 };

const jpstring = '/l1/l2/l3/l4/l5/l6/l7/l8/l9/l10';
const content: any = { l1: { l2: { l3: { l4: { l5: { l6: { l7: { l8: { l9: { l10: '42' } } } } } } } } } };
const content2: any = { l1: { l2: { l3: { l4: { l5: { l6: { l7: { l8: { l9: null } } } } } } } } };

const jsonpointer = jsonpointer_i.compile(jpstring);
const jsonpointerx = JsonPointerX.compile(jpstring);
const json_ptr = json_ptr_i.create(jpstring);
const json_pointer = json_pointer_i;

async function benchGetDefinedProperty(message: string): Promise<void> {
  console.log(message);
  const bench = new Bench(OPTIONS);
  bench
    .add('jsonpointerx.get', () => jsonpointerx.get(content))
    .add('json-ptr.get', () => json_ptr.get(content))
    .add('jsonpointer.get', () => jsonpointer.get(content))
    .add('json_pointer.get', () => json_pointer.get(content, jpstring));
  await bench.run();
  console.table(bench.table());
}

async function benchGetPropertyFromNullAncestor(message: string): Promise<void> {
  console.log(message);
  const bench = new Bench(OPTIONS);
  bench
    .add('jsonpointerx.get', () => {
      try {
        jsonpointerx.get(content2);
      } catch (e) {}
    })
    .add('json-ptr.get', () => {
      try {
        json_ptr.has(content2);
      } catch (e) {}
    })
    .add('jsonpointer.get', () => {
      try {
        jsonpointer.get(content2);
      } catch (e) {}
    })

    .add('json_pointer.get', () => {
      try {
        json_pointer.get(content2, jpstring);
      } catch (e) {}
    });

  await bench.run();
  console.table(bench.table());
}

async function benchSetProperty(message: string): Promise<void> {
  console.log(message);
  const bench = new Bench(OPTIONS);
  bench
    .add('jsonpointerx.set', () => jsonpointerx.set(content, 123))
    .add('json-ptr.set', () => json_ptr.set(content, 123))
    .add('jsonpointer.set', () => jsonpointer.set(content, 123))
    .add('json_pointer.set', () => json_pointer.set(content, jpstring, 123));
  await bench.run();
  console.table(bench.table());
}

(async () => {
  try {
    await benchGetDefinedProperty('get defined property:');
    await benchGetPropertyFromNullAncestor('get property from null ancestor:');
    await benchSetProperty('set property:');
  } catch (err) {
    console.error('failed: ', err);
  }
})();
