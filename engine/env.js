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
    if (index === undefined) {
      // if index is not specified, return the most recent item
      return this._values[key].slice(-1)[0];
    }
    return this._values[key][index];
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
