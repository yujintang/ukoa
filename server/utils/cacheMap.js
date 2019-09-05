const debug = require('debug')('ufo:cacheMap');

class CacheMap {
  constructor(ufo, interval) {
    this.store = new Map();
    this.ufo = ufo;
    this.interval = Number(interval) || 1000 * 60;
  }

  expireValue(asyncFunc, interval = this.interval) {
    return {
      interval,
      expire: Date.now() + Number(interval),
      value: null,
      asyncFunc,
    };
  }

  set(key, asyncFunc, interval = this.interval) {
    this.store.set(key, this.expireValue(asyncFunc, interval));
  }

  async get(key) {
    if (!this.has(key)) return undefined;
    const expireValue = this.store.get(key);
    if (Date.now() > expireValue.expire || expireValue.value === null) {
      debug(`cacheMap.get(${key}) not point cache`);
      expireValue.value = await expireValue.asyncFunc(this.ufo);
      expireValue.expire = Date.now() + Number(expireValue.interval);
    }
    return expireValue.value;
  }

  has(key) {
    return this.store.has(key);
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  get size() {
    return this.store.size;
  }
}

module.exports = CacheMap;
