const testdata = `unit Built-ins [
  library Controls hue: (0) [
    define frame count[
      // updated every frame
    ] returns count:Integer

    define trigger each frame (elapsed time:Number) (steps:BlockList)[
      step
    ]

    define context loop over (list:TypeAList) (action:BlockList)[
      // needs locals for item and index
      // returns a new list
    ] returns TypeB:List
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
});
