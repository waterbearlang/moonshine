const testdata = `unit Built-ins [
  library Controls hue: (0) language: (JavaScript) [

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

describe("Test host language escaping", function () {
  before(function () {
    ast = parser.parse(testdata);
  });
  describe("parse", function () {
    it("unit should be found", function () {
      assert.equal(ast.units.length, 1);
    });
  });
});
