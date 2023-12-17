import { PromiseFactories, sequentialize } from './sequentialize';

describe('sequentialize', () => {
  it('should resolve', async () => {
    let givenNumber = 0;

    const promises: PromiseFactories<number> = [];

    for (let i = 0; i < 30; i++) {
      promises.push(() => (givenNumber++ === i ? Promise.resolve(i) : Promise.reject(i)));
    }
    const result = await sequentialize(promises);
    let lastNumber = 0;
    for (const i of result) {
      expect(i).toBe(lastNumber++);
    }
  });
});
