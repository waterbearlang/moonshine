const testdata = `
name: Controls
hue: 0
language: JavaScript

define PI [
  hosted returns elapsed:Number [@
    return Math.PI;
  @]
] returns elapsed:Number

define trigger each frame (elapsed time:Number) (steps:BlockList)[
  hosted [@
    steps.forEach(step => step.run());
  @]
]

define context loop over (list:TypeAList) (action:BlockList)[
  // needs locals for item and index
  // returns a new list
  hosted returns results:TypeBList[@
    let results;
    for (let index=0; index < list.length; index++){
      let item = list[index];
      results.push = action.map(block => block.run(index, item)).pop();
    }
  @]
] returns results:TypeBList
`;

let ast;

import Parser from "../moonshine.js";
import assert from "assert";

const parser = new Parser();

describe("Test host language escaping", function () {
  before(function () {
    ast = parser.parse(testdata);
  });
  describe("parse", function () {
    it("unit should be found", function () {
      assert.equal(ast.units.length, 1);
    });
  });
  describe("test library", function () {
    let library;
    it("library should exist", function () {
      library = ast.units[0].libraries[0];
      assert.ok(library);
    });
    it("library should have 3 block definitions", function () {
      assert.equal(library.blockDefs.length, 3);
    });
  });
  describe("test BlockDef", function () {
    let blockDef;
    it("first blockDef should be type BlockDef", function () {
      blockDef = ast.units[0].libraries[0].blockDefs[0];
      assert.ok(blockDef);
      assert.equal(blockDef.type, "BlockDef");
    });
    it("blockdef should have returns", function () {
      assert.equal(blockDef.returns.name, "elapsed");
      assert.equal(blockDef.returns.type, "Number");
    });
  });
  describe("test BlockDef hosted", function () {
    let hosted;
    it("first step should be of type Hosted", function () {
      hosted = ast.units[0].libraries[0].blockDefs[0].steps[0];
      assert.ok(hosted);
      assert.equal(hosted.type, "Hosted");
    });
    it("hosted should have return type", function () {
      assert.equal(hosted.returns.name, "elapsed");
      assert.equal(hosted.returns.type, "Number");
    });
    it("hosted should have code", function () {
      assert.equal(hosted.code.trim(), "return Math.PI;");
    });
  });
  describe("test TriggerDef hosted", function () {
    let hosted;
    it("first step should be of type HostedNoReturns", function () {
      hosted = ast.units[0].libraries[0].blockDefs[1].steps[0];
      assert.ok(hosted);
      assert.equal(hosted.type, "HostedNoReturns");
    });
    it("hosted should have code", function () {
      assert.equal(hosted.code.trim(), "steps.forEach(step => step.run());");
    });
  });
  describe("test ContextDef hosted", function () {
    let hosted;
    it("first step should be of type Hosted", function () {
      hosted = ast.units[0].libraries[0].blockDefs[2].steps[0];
      assert.ok(hosted);
      assert.equal(hosted.type, "Hosted");
    });
    it("hosted should have return type", function () {
      assert.equal(hosted.returns.name, "results");
      assert.equal(hosted.returns.type, "TypeBList");
    });
    it("hosted should have code", function () {
      assert.ok(hosted.code.trim().startsWith("let results;"));
      assert.ok(hosted.code.trim().endsWith("}"));
      assert.equal(hosted.code.split("\n").length, 5);
    });
  });
});
