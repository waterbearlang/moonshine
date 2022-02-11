const testdata = `unit Built-ins [
  library Controls hue: (0) language: (JavaScript) [

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
      hosted returns list:TypeBList[@
        let results;
        for (let index=0; index < list.length; index++){
          let item = list[index];
          results.push = action.map(block => block.run(index, item)).pop();
        }
      @]
    ] returns results:TypeBList
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
