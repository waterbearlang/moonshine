let value1 = async env => {
  return new Promise(resolve => {
    setTimeout(() => {
      env.push("value1", 1);
      resolve(env);
    });
  });
};

let value2 = async env => {
  return new Promise(resolve => {
    env.push("value2", 3 * env.get("value1"));
    setTimeout(() => env);
    resolve(env);
  });
};

let value3 = async env => {
  env.push("value3", 5 * env.get("value2"));
};

class Env {
  constructor(values) {
    this.values = values || {};
  }
  clone() {
    return new Env(JSON.parse(JSON.serialize(this.values)));
  }
  push(key, value) {
    if (!this.values[key]) {
      this.values[key] = [];
    }
    this.values[key].push(value);
  }
  get(key, index) {
    if (index === undefined) {
      // if index is not specified, return the most recent item
      return this.values[key].slice(-1)[0];
    }
    return this.values[key][index];
  }
  current() {
    let ret = {};
    for (let key in this.values) {
      ret[key] = this.get(key);
    }
    return ret;
  }
}

let list = [value1, value2, value3];

let resolve = async list => {
  let env = new Env();
  let l = list.slice();
  while (l.length) {
    await l.shift()();
  }
  console.log(env.current());
};


resolve(list);
