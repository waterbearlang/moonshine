const testdata = `unit Built-ins [
  library Controls hue: (0) [

    define wait (seconds:Number) seconds[
      // pause before calling next block
      log (seconds)
    ] returns elapsed:Number

    define trigger each frame (elapsed time:Number) (steps:BlockList)[
      render triangles
      consolidate sprites
    ]

    define context loop over (list:TypeAList) (action:BlockList)[
      // needs locals for item and index
      // returns a new list
      before (action)
      action
      after (action)
    ] returns list:TypeBList
  ]
]`;

let ast;

import Parser from "../moonshine.js";
import assert from "assert";

const parser = new Parser();

describe("Test library unit", function () {
  before(function () {
    ast = parser.parse(testdata);
  });
  describe("parse", function () {
    it("unit should be found", function () {
      assert.equal(ast.units.length, 1);
    });
    it("unit should not be null or undefined", function () {
      assert.ok(ast.units[0]);
    });
    it("unit should have type Unit", function () {
      assert.equal(ast.units[0].type, "Unit");
    });
    it("unit should be named Built-ins", function () {
      assert.equal(ast.units[0].name, "Built-ins");
    });
    it("unit should have a libraries array", function () {
      assert.ok(ast.units[0].libraries);
    });
  });
  describe("library", function () {
    let library;
    it("libraries[] should have at least one entry", function () {
      library = ast.units[0].libraries[0];
      assert.ok(library);
    });
    it("library name should be Controls", function () {
      assert.equal(library.name, "Controls");
    });
    it("library hue should be 0", function () {
      assert.strictEqual(library.hue, 0);
    });
    it("library contains at least 3 blockdefs", function () {
      assert.ok(library.blockDefs.length >= 3);
    });
  });
  describe("blockdef", function () {
    let blockdef;
    it("library should have a (step) blockdef", function () {
      ast.units[0].libraries[0].blockDefs.forEach(def => {
        if (def.type === "BlockDef") {
          blockdef = def;
        }
      });
      assert.ok(blockdef);
    });
    it("blockdef should be named wait () seconds", function () {
      assert.equal(blockdef.name, "wait () seconds");
    });
    it("blockdef should have one typed parameter", function () {
      assert.ok(blockdef.params[0]);
      assert.equal(blockdef.params[0].name, "seconds");
      assert.equal(blockdef.params[0].type, "Number");
    });
    it("blockdef should have typed returns", function () {
      assert.ok(blockdef.returns);
      assert.equal(blockdef.returns.name, "elapsed");
      assert.equal(blockdef.returns.type, "Number");
    });
    it("blockdef has steps", function () {
      assert.ok(blockdef.steps);
      assert.ok(blockdef.steps.length > 0);
      assert.equal(blockdef.steps[0].name, "log ()");
      assert.equal(blockdef.steps[0].args[0].value.name, "seconds");
    });
  });
  describe("contextdef", function () {
    let contextdef;
    it("library should have a contextdef", function () {
      ast.units[0].libraries[0].blockDefs.forEach(def => {
        if (def.type === "ContextDef") {
          contextdef = def;
        }
      });
      assert.ok(contextdef);
    });
    it("contextdef name should be loop over ()", function () {
      assert.equal(contextdef.name, "loop over ()");
    });
    it("contextdef should have one typed parameter", function () {
      assert.ok(contextdef.params[0]);
      assert.equal(contextdef.params[0].name, "list");
      assert.equal(contextdef.params[0].type, "TypeAList");
    });
    it("contextdef should have one blocklist", function () {
      assert.equal(contextdef.blocklists.length, 1);
      assert.ok(contextdef.blocklists[0]);
      assert.equal(contextdef.blocklists[0].name, "action");
    });
    it("contextdef should have typed returns", function () {
      assert.ok(contextdef.returns);
      assert.equal(contextdef.returns.name, "list");
      assert.equal(contextdef.returns.type, "TypeBList");
    });
    it("contextdef has 3 steps", function () {
      assert.ok(contextdef.steps);
      assert.equal(contextdef.steps.length, 3);
      assert.equal(contextdef.steps[0].name, "before ()");
      assert.equal(contextdef.steps[0].args[0].value.name, "action");
      assert.equal(contextdef.steps[1].name, "action");
      assert.equal(contextdef.steps[2].name, "after ()");
      assert.equal(contextdef.steps[2].args[0].value.name, "action");
    });
  });
  describe("triggerdef", function () {
    let triggerdef;
    it("library should have a triggerdef", function () {
      ast.units[0].libraries[0].blockDefs.forEach(def => {
        if (def.type === "TriggerDef") {
          triggerdef = def;
        }
      });
      assert.ok(triggerdef);
    });
    it("triggerdef name should be each frame ()", function () {
      assert.equal(triggerdef.name, "each frame ()");
    });
    it("triggerdef should have one typed parameter", function () {
      assert.ok(triggerdef.params[0]);
      assert.equal(triggerdef.params[0].name, "elapsed time");
      assert.equal(triggerdef.params[0].type, "Number");
    });
    it("triggerdef should have one blocklist", function () {
      assert.equal(triggerdef.blocklists.length, 1);
      assert.ok(triggerdef.blocklists[0]);
      assert.equal(triggerdef.blocklists[0].name, "steps");
    });
    it("triggerdef has 2 steps", function () {
      assert.ok(triggerdef.steps);
      assert.equal(triggerdef.steps.length, 2);
      assert.equal(triggerdef.steps[0].name, "render triangles");
      assert.equal(triggerdef.steps[1].name, "consolidate sprites");
    });
  });
});
