import assert from "assert";
import Env from "../engine/env.js";

let env;

describe("test env functionality", function () {
  before(function () {
    env = new Env();
  });
  describe("test push", function () {
    it("env exists", function () {
      assert.ok(env);
    });
    it("push without error", function () {
      assert.ok(env.push("one", 1));
    });
    it("push puts value in place", function () {
      assert.equal(env._values["one"][0], 1);
    });
  });
  describe("test get", function () {
    it("get works with index", function () {
      assert.equal(env.get("one", 0), 1);
    });
    it("get works without index", function () {
      assert.equal(env.get("one"), 1);
    });
  });
  describe("test current", function () {
    it("does current return the right things?", function () {
      assert.deepEqual(env.current(), { one: 1 });
    });
  });
  describe("test clone", function () {
    let c;
    before(function () {
      env.push("two", 2);
      env.push("one", 11);
      c = env.clone();
    });
    it("clone should initially be the same", function () {
      assert.deepEqual(env._values, c._values);
    });
    it("clone should diverge on changes", function () {
      c.push("three", 3);
      assert.notDeepEqual(env._values, c._values);
    });
  });
});
