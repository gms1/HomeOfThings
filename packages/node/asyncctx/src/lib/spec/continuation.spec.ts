/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import * as fs from 'fs';

import { ContinuationLocalStorage } from '../ContinuationLocalStorage';

const clsOld: ContinuationLocalStorage<Number> = new ContinuationLocalStorage<Number>();

let clsNew: ContinuationLocalStorage<Number>;

let cls: ContinuationLocalStorage<Number>;

const DODEBUG = 0;
const nodeproc: any = process;

function debugId(prefix: string): void {
  if (!DODEBUG) {
    return;
  }
  cls.debugId('TEST: ' + prefix);
}

function triggerHookLength(): number {
  let hookInfo = cls.getHookInfo();
  let length = 0;
  while (hookInfo) {
    hookInfo = hookInfo.triggerHook;
    length += 1;
  }
  return length;
}

describe('test continuation but enable hooks right before each test:', () => {
  beforeEach((done) => {
    if (clsNew) {
      clsNew.dispose();
    }
    clsNew = new ContinuationLocalStorage<Number>();
    clsNew.disable();
    cls = clsNew;
    done();
  });

  it('calling process.nextTick should preserve continuation local storage', (done) => {
    cls.enable();
    debugId('process.nextTick: START BEGIN');
    const startId = cls.currId;
    const startValue = 111;
    expect(cls.setRootContext(startValue)).toBe(startValue);
    debugId('process.nextTick: START END  ');
    process.nextTick(() => {
      debugId('process.nextTick: OUTER BEGIN');
      const outerId = cls.currId;
      const outerPreviousId = cls.getTriggerId();
      expect(outerPreviousId).toBe(startId);
      expect(cls.getContext()).toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue)).toBe(outerValue);
      debugId('process.nextTick: OUTER END  ');
      process.nextTick(() => {
        debugId('process.nextTick: INNER BEGIN');
        const innerId = cls.currId;
        const innerPreviousId = cls.getTriggerId();
        expect(innerPreviousId).toBe(outerId);
        expect(cls.getContext()).toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue)).toBe(innerValue);
        debugId('process.nextTick: INNER END  ');
        cls.disable();
        done();
      });
    });
  });

  it('calling setImmediate should preserve continuation local storage', (done) => {
    cls.enable();
    debugId('setImmediate: START BEGIN');
    const startId = cls.currId;
    const startValue = 121;
    expect(cls.setRootContext(startValue)).toBe(startValue);
    debugId('setImmediate: START END  ');
    setImmediate(() => {
      debugId('setImmediate: OUTER BEGIN');
      const outerId = cls.currId;
      const outerPreviousId = cls.getTriggerId();
      expect(outerPreviousId).toBe(startId);
      expect(cls.getContext()).toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue)).toBe(outerValue);
      debugId('setImmediate: OUTER END  ');
      setImmediate(() => {
        debugId('setImmediate: INNER BEGIN');
        const innerId = cls.currId;
        const innerPreviousId = cls.getTriggerId();
        expect(innerPreviousId).toBe(outerId);
        expect(cls.getContext()).toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue)).toBe(innerValue);
        debugId('setImmediate: INNER END  ');
        cls.disable();
        done();
      });
    });
  });

  it('calling setTimeout should preserve continuation local storage', (done) => {
    cls.enable();
    debugId('setTimeout: START BEGIN');
    const startId = cls.currId;
    const startValue = 131;
    expect(cls.setRootContext(startValue)).toBe(startValue);
    debugId('setTimeout: START END  ');
    setTimeout(() => {
      debugId('setTimeout: OUTER BEGIN');
      const outerId = cls.currId;
      const outerPreviousId = cls.getTriggerId();
      expect(outerPreviousId).toBe(startId);
      expect(cls.getContext()).toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue)).toBe(outerValue);
      debugId('setTimeout: OUTER END  ');
      setTimeout(() => {
        debugId('setTimeout: INNER BEGIN');
        const innerId = cls.currId;
        const innerPreviousId = cls.getTriggerId();
        expect(innerPreviousId).toBe(outerId);
        expect(cls.getContext()).toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue)).toBe(innerValue);
        debugId('setTimeout: INNER END  ');
        cls.disable();
        done();
      }, 0);
    }, 0);
  });

  it('calling setInterval should preserve continuation local storage', (done) => {
    cls.enable();
    debugId('setInterval: START BEGIN');
    const startId = cls.currId;
    const startValue = 141;
    expect(cls.setRootContext(startValue)).toBe(startValue);
    debugId('setInterval: START END  ');
    const timer1 = setInterval(() => {
      debugId('setInterval: OUTER BEGIN');
      const outerId = cls.currId;
      const outerPreviousId = cls.getTriggerId();
      expect(outerPreviousId).toBe(startId);
      expect(cls.getContext()).toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue)).toBe(outerValue);
      debugId('setInterval: OUTER END  ');
      clearInterval(timer1);
      const timer2 = setInterval(() => {
        debugId('setInterval: INNER BEGIN');
        const innerId = cls.currId;
        const innerPreviousId = cls.getTriggerId();
        expect(innerPreviousId).toBe(outerId);
        expect(cls.getContext()).toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue)).toBe(innerValue);
        debugId('setInterval: INNER END  ');
        clearInterval(timer2);
        cls.disable();
        done();
      }, 100);
    }, 100);
  });

  it('calling fs should preserve continuation local storage', (done) => {
    cls.enable();
    debugId('fs: START BEGIN');
    const startId = cls.currId;
    const startValue = 151;
    expect(cls.setRootContext(startValue)).toBe(startValue);
    debugId('fs: START END  ');
    fs.access(__filename, () => {
      debugId('fs: OUTER BEGIN');
      const outerId = cls.currId;
      const outerPreviousId = cls.getTriggerId();
      expect(outerPreviousId).toBe(startId);
      expect(cls.getContext()).toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue)).toBe(outerValue);
      debugId('fs: OUTER END  ');
      fs.access(__filename, () => {
        debugId('fs: INNER BEGIN');
        const innerId = cls.currId;
        const innerPreviousId = cls.getTriggerId();
        expect(innerPreviousId).toBe(outerId);
        expect(cls.getContext()).toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue)).toBe(innerValue);
        debugId('fs: INNER END  ');
        cls.disable();
        done();
      });
    });
  });

  // NOTES:
  // the executor function of the top most Promise is running synchronously
  //   see: https://github.com/nodejs/node-eps/pull/18
  // so the cls-context inside this executor function is the same as the
  // cls-context of the caller

  it('chained promises should preserve continuation local storage', () => {
    cls.enable();
    debugId('promise: START BEGIN');
    const startId = cls.currId;
    const startValue = 161;
    let outerId: number;
    let outerValue: number;
    let innerId: number;
    let innerValue: number;
    let innermostId: number;
    let innermostValue: number;
    expect(cls.setRootContext(startValue)).toBe(startValue);
    debugId('promise: START END  ');
    return new Promise<number>((resolve, reject) => {
      debugId('promise: OUTER BEGIN');
      outerId = cls.currId;
      const outerPreviousId = cls.getTriggerId();
      expect(cls.getContext()).toBe(startValue);

      // The executor function is running synchronously!!!
      expect(outerId).toBe(startId);
      expect(cls.getContext()).toBe(startValue);
      outerValue = startValue;

      debugId('promise: OUTER END  ');
      resolve(outerValue);
    })
      .then((val) => {
        debugId('promise: OUTER THEN');
        return new Promise<number>((resolve, reject) => {
          debugId('promise: INNER BEGIN');
          innerId = cls.currId;
          const innerPreviousId = cls.getTriggerId();
          expect(innerPreviousId).toBe(outerId);
          expect(cls.getContext()).toBe(outerValue);
          innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue);
          debugId('promise: INNER END  ');
          resolve(innerValue);
        }).then((val2) => {
          debugId('promise: INNER THEN');
          return new Promise<number>((resolve, reject) => {
            debugId('promise: INNERMOST BEGIN');
            innermostId = cls.currId;
            const innermostPreviousId = cls.getTriggerId();
            // test https://github.com/nodejs/node/issues/13583
            expect(innermostPreviousId).toBe(innerId);
            expect(cls.getContext()).toBe(innerValue);
            innermostValue = innerValue + 1;
            expect(cls.setContext(innermostValue)).toBe(innermostValue);
            debugId('promise: INNERMOST END  ');
            resolve(innermostValue);
          });
        });
      })
      .then((val) => {
        cls.disable();
        return val;
      })
      .catch((err) => {
        cls.disable();
        fail(err);
      });
  });

  it('promise returned from promise executor function should preserve continuation local storage', () => {
    cls.enable();
    debugId('promise: START BEGIN');
    const startId = cls.currId;
    let outerId: number;
    let innerId: number;
    debugId('promise: START END  ');
    return new Promise<number>((resolve1, reject1) => {
      debugId('promise: OUTER BEGIN');
      outerId = cls.currId;
      expect(outerId).toBe(startId);
      return new Promise<number>((resolve2, reject2) => {
        debugId('promise: INNER BEGIN');
        innerId = cls.currId;
        expect(innerId).toBe(startId);
        resolve2(42);
      }).then(() => {
        resolve1(24);
      }); // <= resolving is requried
    })
      .catch((err) => {
        cls.disable();
        fail(err);
      })
      .then((val) => {
        cls.disable();
        return val;
      });
  });

  it('continuous local storage should only maintain triggerHook list up to first activated node', (done) => {
    cls.enable();
    setImmediate(() => {
      setImmediate(() => {
        const length = triggerHookLength();
        expect(length).toBe(1);
        done();
      });
    });
  });
});

// #######################################################################################################################

describe('test continuation with hooks enabled long before running these tests:', () => {
  beforeEach((done) => {
    cls = clsOld;
    done();
  });

  it('calling process.nextTick should preserve continuation local storage', (done) => {
    debugId('process.nextTick: START BEGIN');
    const startId = cls.currId;
    const startValue = 211;
    expect(cls.setContext(startValue)).toBe(startValue);
    debugId('process.nextTick: START END  ');
    process.nextTick(() => {
      debugId('process.nextTick: OUTER BEGIN');
      const outerId = cls.currId;
      const outerPreviousId = cls.getTriggerId();
      expect(outerPreviousId).toBe(startId);
      expect(cls.getContext()).toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue)).toBe(outerValue);
      debugId('process.nextTick: OUTER END  ');
      process.nextTick(() => {
        debugId('process.nextTick: INNER BEGIN');
        const innerId = cls.currId;
        const innerPreviousId = cls.getTriggerId();
        expect(innerPreviousId).toBe(outerId);
        expect(cls.getContext()).toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue)).toBe(innerValue);
        debugId('process.nextTick: INNER END  ');
        done();
      });
    });
  });

  it('calling setImmediate should preserve continuation local storage', (done) => {
    debugId('setImmediate: START BEGIN');
    const startId = cls.currId;
    const startValue = 221;
    expect(cls.setContext(startValue)).toBe(startValue);
    debugId('setImmediate: START END  ');
    setImmediate(() => {
      debugId('setImmediate: OUTER BEGIN');
      const outerId = cls.currId;
      const outerPreviousId = cls.getTriggerId();
      expect(outerPreviousId).toBe(startId);
      expect(cls.getContext()).toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue)).toBe(outerValue);
      debugId('setImmediate: OUTER END  ');
      setImmediate(() => {
        debugId('setImmediate: INNER BEGIN');
        const innerId = cls.currId;
        const innerPreviousId = cls.getTriggerId();
        expect(innerPreviousId).toBe(outerId);
        expect(cls.getContext()).toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue)).toBe(innerValue);
        debugId('setImmediate: INNER END  ');
        done();
      });
    });
  });

  it('calling setTimeout should preserve continuation local storage', (done) => {
    debugId('setTimeout: START BEGIN');
    const startId = cls.currId;
    const startValue = 231;
    expect(cls.setContext(startValue)).toBe(startValue);
    debugId('setTimeout: START END  ');
    setTimeout(() => {
      debugId('setTimeout: OUTER BEGIN');
      const outerId = cls.currId;
      const outerPreviousId = cls.getTriggerId();
      expect(outerPreviousId).toBe(startId);
      expect(cls.getContext()).toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue)).toBe(outerValue);
      debugId('setTimeout: OUTER END  ');
      setTimeout(() => {
        debugId('setTimeout: INNER BEGIN');
        const innerId = cls.currId;
        const innerPreviousId = cls.getTriggerId();
        expect(innerPreviousId).toBe(outerId);
        expect(cls.getContext()).toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue)).toBe(innerValue);
        debugId('setTimeout: INNER END  ');
        done();
      }, 0);
    }, 0);
  });

  it('calling setInterval should preserve continuation local storage', (done) => {
    debugId('setInterval: START BEGIN');
    const startId = cls.currId;
    const startValue = 241;
    expect(cls.setContext(startValue)).toBe(startValue);
    debugId('setInterval: START END  ');
    const timer1 = setInterval(() => {
      debugId('setInterval: OUTER BEGIN');
      const outerId = cls.currId;
      const outerPreviousId = cls.getTriggerId();
      expect(outerPreviousId).toBe(startId);
      expect(cls.getContext()).toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue)).toBe(outerValue);
      debugId('setInterval: OUTER END  ');
      clearInterval(timer1);
      const timer2 = setInterval(() => {
        debugId('setInterval: INNER BEGIN');
        const innerId = cls.currId;
        const innerPreviousId = cls.getTriggerId();
        expect(innerPreviousId).toBe(outerId);
        expect(cls.getContext()).toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue)).toBe(innerValue);
        debugId('setInterval: INNER END  ');
        clearInterval(timer2);
        done();
      }, 100);
    }, 100);
  });

  it('calling fs should preserve continuation local storage', (done) => {
    debugId('fs: START BEGIN');
    const startId = cls.currId;
    const startValue = 251;
    expect(cls.setContext(startValue)).toBe(startValue);
    debugId('fs: START END  ');
    fs.access(__filename, () => {
      debugId('fs: OUTER BEGIN');
      const outerId = cls.currId;
      const outerPreviousId = cls.getTriggerId();
      expect(outerPreviousId).toBe(startId);
      expect(cls.getContext()).toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue)).toBe(outerValue);
      debugId('fs: OUTER END  ');
      fs.access(__filename, () => {
        debugId('fs: INNER BEGIN');
        const innerId = cls.currId;
        const innerPreviousId = cls.getTriggerId();
        expect(innerPreviousId).toBe(outerId);
        expect(cls.getContext()).toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue)).toBe(innerValue);
        debugId('fs: INNER END  ');
        done();
      });
    });
  });

  // NOTES:
  // the executor function of the top most Promise is running synchronously
  //   see: https://github.com/nodejs/node-eps/pull/18
  // so the cls-context inside this executor function is the same as the
  // cls-context of the caller

  it('chained promises should preserve continuation local storage', () => {
    debugId('promise: START BEGIN');
    const startId = cls.currId;
    const startValue = 261;
    let outerId: number;
    let outerValue: number;
    let innerId: number;
    let innerValue: number;
    let innermostId: number;
    let innermostValue: number;
    expect(cls.setContext(startValue)).toBe(startValue);
    debugId('promise: START END  ');
    return new Promise<number>((resolve, reject) => {
      debugId('promise: OUTER BEGIN');
      outerId = cls.currId;
      const outerPreviousId = cls.getTriggerId();
      expect(cls.getContext()).toBe(startValue);

      // The executor function is running synchronously!!!
      expect(outerId).toBe(startId);
      expect(cls.getContext()).toBe(startValue);
      outerValue = startValue;

      debugId('promise: OUTER END  ');
      resolve(outerValue);
    })
      .then((val) => {
        debugId('promise: OUTER THEN');
        return new Promise<number>((resolve, reject) => {
          debugId('promise: INNER BEGIN');
          innerId = cls.currId;
          const innerPreviousId = cls.getTriggerId();
          expect(innerPreviousId).toBe(outerId);
          expect(cls.getContext()).toBe(outerValue);
          innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue);
          debugId('promise: INNER END  ');
          resolve(innerValue);
        }).then((val2) => {
          debugId('promise: INNER THEN');
          return new Promise<number>((resolve, reject) => {
            debugId('promise: INNERMOST BEGIN');
            innermostId = cls.currId;
            const innermostPreviousId = cls.getTriggerId();
            // test: https://github.com/nodejs/node/issues/13583
            expect(innermostPreviousId).toBe(innerId);
            expect(cls.getContext()).toBe(innerValue);
            innermostValue = innerValue + 1;
            expect(cls.setContext(innermostValue)).toBe(innermostValue);
            debugId('promise: INNERMOST END  ');
            resolve(innermostValue);
          });
        });
      })
      .then((val) => {
        return val;
      })
      .catch((err) => {
        fail(err);
      });
  });

  it('promise returned from promise executor function should preserve continuation local storage', () => {
    debugId('promise: START BEGIN');
    const startId = cls.currId;
    let outerId: number;
    let innerId: number;
    debugId('promise: START END  ');
    return new Promise<number>((resolve1, reject1) => {
      debugId('promise: OUTER BEGIN');
      outerId = cls.currId;
      expect(outerId).toBe(startId);
      return new Promise<number>((resolve2, reject2) => {
        debugId('promise: INNER BEGIN');
        innerId = cls.currId;
        expect(innerId).toBe(startId);
        resolve2(42);
      }).then(() => {
        resolve1(24);
      }); // <= resolving is requried
    })
      .catch((err) => {
        fail(err);
      })
      .then((val) => {
        return val;
      });
  });

  it('continuous local storage should only maintain triggerHook tree up to first activated node', (done) => {
    setImmediate(() => {
      setImmediate(() => {
        const length = triggerHookLength();
        expect(length).toBe(1);
        done();
      });
    });
  });
});
