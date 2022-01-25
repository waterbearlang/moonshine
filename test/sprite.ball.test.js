const testdata = `unit Pong [
  sprite Ball [

    when 🏁 clicked [
      Initialize
      Reset
      repeat until ((Game Over) = (1))[
        move (speed) steps
      ]
    ]

    costumes [
      // Not supported yet
    ]

    sounds [
      // Not supported yet
    ]

    // condition is a parameter slot
    // passing and failing are lists of steps
    define context if (condition:Boolean) [passing:BlockList] else [failing:BlockList] [
      // need to be able to escape into local code to implement
    ] returns this:Sprite

    // image is a local in the context of the trigger
    // action is the list of steps to be called
    // not everything is defined because we don't yet have a way to escape into
    // the host language
    define trigger (image:Image) loaded [action:BlockList][
      for each (item:Type) in (action)[
        item
      ]
    ]

    define Start at x (x:Number) y (y:Number)[
      go to x: (x) y: (y)
      turn to (90)
    ] returns this:Sprite

    when I receive (Bounce)[
      turn ↻ (((Bounce Direction) - (direction)) * 2) degrees
      move (speed) steps
    ]

    when I receive (Score Player)[
      change (speed) by (0.5)
      Reset
    ]
  ]
]`;

let ast;

import Parser from "../moonshine.js";
import assert from "assert";

const parser = new Parser();

describe("Test a more full-featured unit", function () {
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
    it("unit should be named Pong", function () {
      assert.equal(ast.units[0].name, "Pong");
    });
    it("unit should have a sprites array", function () {
      assert.ok(ast.units[0].sprites);
    });
    it("unit should have a stages array", function () {
      assert.ok(ast.units[0].stages);
    });
    it("unit should have a libraries array", function () {
      assert.ok(ast.units[0].libraries);
    });
    it("unit should have a comments array", function () {
      assert.ok(ast.units[0].comments);
    });
  });
  describe("sprite", function () {
    let sprite;
    it("there should be one sprite", function () {
      sprite = ast.units[0].sprites[0];
      assert.equal(ast.units[0].sprites.length, 1);
    });
    it("sprite should not be null or undefined", function () {
      assert.ok(sprite);
    });
    it("sprite should be named Ball", function () {
      assert.equal(sprite.name, "Ball");
    });
    it("sprite should have type Sprite", function () {
      assert.equal(sprite.type, "Sprite");
    });
    it("sprite should have a blockDefs array", function () {
      assert.ok(sprite.blockDefs);
    });
    it("sprite should have 3 blockDefs", function () {
      assert.equal(sprite.blockDefs.length, 3);
    });
    it("sprite blockDef should have correct type and name", function () {
      assert.equal(sprite.blockDefs[2].name, "Start at x () y ()");
      assert.equal(sprite.blockDefs[2].type, "BlockDef");
    });
    it("sprite blockDef should have 2 parameters with names and types", function () {
      assert.ok(sprite.blockDefs[2].params);
      assert.equal(sprite.blockDefs[2].params.length, 2);
      assert.equal(sprite.blockDefs[2].params[0].type, "Number");
      assert.equal(sprite.blockDefs[2].params[0].name, "x");
    });
    it("sprite blockDef should have a returns with name and type", function () {
      assert.ok(sprite.blockDefs[2].returns);
      console.log(JSON.stringify(sprite.blockDefs[2].returns));
      assert.equal(sprite.blockDefs[2].returns.name, "this");
      assert.equal(sprite.blockDefs[2].returns.type, "Sprite");
    });
    it("sprite should have a triggerCalls array", function () {
      assert.ok(sprite.triggerCalls);
    });
    it("sprite should have 3 triggerCalls", function () {
      assert.equal(sprite.triggerCalls.length, 3);
    });
    it("first sprite trigger should match name and type", function () {
      assert.equal(sprite.triggerCalls[0].name, "🏁 clicked");
      assert.equal(sprite.triggerCalls[0].type, "TriggerCall");
    });
    it("trigger should have steps and comments", function () {
      assert.ok(sprite.triggerCalls[0].steps);
      assert.ok(sprite.triggerCalls[0].comments);
    });
    it("Trigger should have 3 steps", function () {
      assert.equal(sprite.triggerCalls[0].steps.length, 3);
    });
    it("Trigger's 3rd step should have matching name", function () {
      assert.equal(sprite.triggerCalls[0].steps[2].name, "repeat until ()");
    });
    it("Trigger's 3rd step should have 1 argument", function () {
      assert.ok(sprite.triggerCalls[0].steps[2].args);
      assert.equal(sprite.triggerCalls[0].steps[2].args.length, 1);
    });
    it("argument should have matching type and name", function () {
      assert.equal(sprite.triggerCalls[0].steps[2].args[0].type, "BlockCall");
      assert.equal(
        sprite.triggerCalls[0].steps[2].args[0].value.name,
        "() = ()"
      );
    });
    it("argument should have 2 arguments of its own", function () {
      assert.ok(sprite.triggerCalls[0].steps[2].args[0].value.args);
      assert.equal(
        sprite.triggerCalls[0].steps[2].args[0].value.args.length,
        2
      );
    });
    it("first child argument should have matching type and value", function () {
      assert.equal(
        sprite.triggerCalls[0].steps[2].args[0].value.args[0].type,
        "BlockCall"
      );
      assert.equal(
        sprite.triggerCalls[0].steps[2].args[0].value.args[0].value.name,
        "Game Over"
      );
    });
    it("second child argument should have matching type and value", function () {
      assert.equal(
        sprite.triggerCalls[0].steps[2].args[0].value.args[1].type,
        "Number"
      );
      assert.equal(
        sprite.triggerCalls[0].steps[2].args[0].value.args[1].value,
        1
      );
    });
    it("sprite should have a forms array", function () {
      assert.ok(sprite.forms);
      assert.equal(sprite.forms.length, 0);
    });
    it("sprite should have a sounds array", function () {
      assert.ok(sprite.sounds);
      assert.equal(sprite.sounds.length, 0);
    });
    it("sprite should have a costumes array", function () {
      assert.ok(sprite.costumes);
      assert.equal(sprite.costumes.length, 0);
    });
    it("sprite should have a structs array", function () {
      assert.ok(sprite.structs);
      assert.equal(sprite.structs.length, 0);
    });
    it("sprite should have a comments array", function () {
      assert.ok(sprite.comments);
      assert.equal(sprite.comments.length, 0);
    });
  });
});
