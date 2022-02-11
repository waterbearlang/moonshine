class Env {
  constructor(values) {
    this._values = values || {};
  }
  clone() {
    return new Env(JSON.parse(JSON.stringify(this._values)));
  }
  push(key, value) {
    if (!this._values[key]) {
      this._values[key] = [];
    }
    this._values[key].push(value);
    return this;
  }
  get(key, index) {
    let arr = this._values[key];
    if (!arr) {
      throw new Error(`No array found for key "${key}"`);
    }
    if (!arr.length) {
      throw new Error(`Array for key "${key}" is empty`);
    }
    if (index === undefined) {
      // if index is not specified, return the most recent item
      return arr[arr.length - 1];
    }
    return arr[index];
  }
  current() {
    let ret = {};
    for (let key in this._values) {
      ret[key] = this.get(key);
    }
    return ret;
  }
}

export default Env;
