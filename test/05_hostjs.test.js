const testdata = `unit Built-ins [
  library Controls hue: (0) language: (JavaScript)[

    define wait (seconds:Number) seconds[
      // pause before calling next block
      log (seconds)
    ] returns elapsed:Number

    define value1[
      hosted async returns (value1:Number)[
        return async(env) => {
          setTimeout(()=>env.push('value1', 1), 300);
        }
      ]
    ]

    define value2[
      hosted async returns (value2:Number)[
        return async(env) => {
          env.push('value2', 3 * env.get('value1'));
          setTimeout(()=>env, 100);
        }
      ]
    ]

    define value3[
      hosted async returns (value3:Number)[
        return async(env) => {
          env.push('value3', 5 * env.get('value2'));
        }
      ]
    ]

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
  });
});

