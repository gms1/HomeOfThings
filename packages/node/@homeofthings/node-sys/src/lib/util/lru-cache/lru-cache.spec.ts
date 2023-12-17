import { LruCache } from './lru-cache';

class TestLruCache<T> extends LruCache<T> {
  override onInsert(_item: T) {
    super.onInsert(_item);
  }
  override onDelete(_item: T) {
    super.onDelete(_item);
  }
}

describe('LruCache', () => {
  const givenMaxEntries = 3;
  let lruCache: TestLruCache<number>;

  beforeEach(() => {
    lruCache = new TestLruCache<number>(givenMaxEntries);
    lruCache.set('1', 1);
    lruCache.set('2', 2);
    lruCache.set('3', 3);
  });

  it('should have stored the given values', () => {
    expect(lruCache.get('1')).toBe(1);
    expect(lruCache.get('2')).toBe(2);
    expect(lruCache.get('3')).toBe(3);
    expect(lruCache.size).toBe(lruCache.maxEntries);

    const onInsertSpy = jest.spyOn(lruCache, 'onInsert');
    const onDeleteSpy = jest.spyOn(lruCache, 'onDelete');
    expect(lruCache.has('1')).toBe(true);
    expect(lruCache.has('4')).toBe(false);
    expect(lruCache.get('1')).toBe(1);
    expect(lruCache.get('4')).toBe(undefined);
    expect(onDeleteSpy).toHaveBeenCalledTimes(0);
    expect(onInsertSpy).toHaveBeenCalledTimes(0);
  });

  it('should delete a given key', () => {
    const onDeleteSpy = jest.spyOn(lruCache, 'onDelete');
    lruCache.delete('2');
    expect(onDeleteSpy).toHaveBeenCalledTimes(1);
    expect(onDeleteSpy).toHaveBeenCalledWith(2);

    expect(lruCache.has('2')).toBe(false);
    expect(lruCache.get('1')).toBe(1);
    expect(lruCache.get('2')).toBeUndefined();
    expect(lruCache.get('3')).toBe(3);
    expect(lruCache.size).toBe(lruCache.maxEntries - 1);
  });

  it('should store only maxEntries by removing the least recently used item', () => {
    lruCache.get('3');
    lruCache.get('2');
    lruCache.get('1'); // '3' is least recently used item

    const onInsertSpy = jest.spyOn(lruCache, 'onInsert');
    const onDeleteSpy = jest.spyOn(lruCache, 'onDelete');
    lruCache.set('4', 4);
    expect(onDeleteSpy).toHaveBeenCalledTimes(1);
    expect(onDeleteSpy).toHaveBeenCalledWith(3);
    expect(onInsertSpy).toHaveBeenCalledTimes(1);
    expect(onInsertSpy).toHaveBeenCalledWith(4);

    expect(lruCache.get('1')).toBe(1);
    expect(lruCache.get('2')).toBe(2);
    expect(lruCache.get('3')).toBe(undefined);
    expect(lruCache.get('4')).toBe(4);
    expect(lruCache.size).toBe(lruCache.maxEntries);
  });

  it('should store only maxEntries by removing an existing item', () => {
    lruCache.get('3');
    lruCache.get('2');
    lruCache.get('1'); // '3' is least recently used item

    const onInsertSpy = jest.spyOn(lruCache, 'onInsert');
    const onDeleteSpy = jest.spyOn(lruCache, 'onDelete');
    lruCache.set('2', 5); // '2' is an existing item
    expect(onDeleteSpy).toHaveBeenCalledTimes(1);
    expect(onDeleteSpy).toHaveBeenCalledWith(2);
    expect(onInsertSpy).toHaveBeenCalledTimes(1);
    expect(onInsertSpy).toHaveBeenCalledWith(5);

    expect(lruCache.get('1')).toBe(1);
    expect(lruCache.get('2')).toBe(5);
    expect(lruCache.get('3')).toBe(3);
    expect(lruCache.size).toBe(lruCache.maxEntries);
  });

  it('should apply new positive maxEntries', () => {
    lruCache.get('3');
    lruCache.get('2');
    lruCache.get('1'); // '3' is least recently used item

    const onDeleteSpy = jest.spyOn(lruCache, 'onDelete');
    lruCache.maxEntries = 2;
    expect(onDeleteSpy).toHaveBeenCalledTimes(1);
    expect(onDeleteSpy).toHaveBeenCalledWith(3);

    expect(lruCache.size).toBe(lruCache.maxEntries);
    expect(lruCache.get('1')).toBe(1);
    expect(lruCache.get('2')).toBe(2);
    expect(lruCache.get('3')).toBe(undefined);
  });

  it('maxEntries not apply negative maxEntries', () => {
    const onDeleteSpy = jest.spyOn(lruCache, 'onDelete');
    lruCache.maxEntries = -5;
    expect(onDeleteSpy).toHaveBeenCalledTimes(3);

    expect(lruCache.maxEntries).toBe(0);
    expect(lruCache.size).toBe(0);
    expect(lruCache.get('1')).toBe(undefined);
    expect(lruCache.get('2')).toBe(undefined);
    expect(lruCache.get('3')).toBe(undefined);
  });

  it('should have default maxEntries defined', () => {
    const cache = new LruCache();
    expect(cache.maxEntries).toBeDefined();
  });
});
