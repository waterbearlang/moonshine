import assert from "assert";
import Env from "../engine/env.js";

let env, list;

let resolve = async list => {
  let env = new Env();
  let l = list.slice();
  while (l.length) {
    await l.shift()();
  }
};

describe("test async list processing", function () {
  beforeEach(function () {
    env = new Env();
    let value1 = async function() {
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
    list = [value1, value2, value3];
  });
  describe("test resolve", function () {
    it("get expected values", async function () {
      await resolve(list);
      assert.deepEqual(env.current(), { value1: 1, value2: 3, value3: 15 });
    });
  });
});
