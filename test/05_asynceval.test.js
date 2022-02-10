import assert from "assert";
import Env from "../engine/env.js";

let resolve = async function (list) {
  let env = new Env();
  let l = Array.from(list);
  while (l.length) {
    await l.shift();
  }
  return list;
};

let list;

describe("test async list processing", function () {
  beforeEach(function () {
    let env = new Env();
    let value1 = async function (env) {
      return new Promise(resolve => {
        setTimeout(() => {
          console.log("pushing value 1");
          env.push("value1", 1);
          resolve(env);
        });
      });
    };

    let value2 = async function (env) {
      return new Promise(resolve => {
        console.log("pushing value 2");
        env.push("value2", 3 * env.get("value1"));
        setTimeout(() => env);
        resolve(env);
      });
    };

    let value3 = async function (env) {
      return new Promise(resolve => {
        env.push("value3", 5 * env.get("value2"));
        resolve(env);
      });
    };
    list = [value1(env), value2(env), value3(env)];
  });
  describe("test resolve", function () {
    it("get expected values", async function () {
      let [p, q, r] = await resolve(list);
      console.log(`r: ${r}`);
      assert.deepEqual(r.current(), { value1: 1, value2: 3, value3: 15 });
    });
  });
});
