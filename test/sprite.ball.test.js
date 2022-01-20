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

    define Reset [
      go to x: (0) y: (-45)
      point in direction (pick random (1) to (360))
      wait (0.5) seconds
    ]

    define Initialize [
      hide variable (Winner)
      set speed to (5)
      show
      set (Game Over) to (0)
    ]

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
  before(function(){
    ast = parser.parse(testdata);
  });
  describe("parse", function() {
    it("unit should be found", function(){assert.equal(ast.units.length, 1)});
    it("unit should not be null or undefined", function(){assert.ok(ast.units[0])});
    it("unit should have type Unit", function(){
      assert.equal(ast.units[0].type, "Unit")});
    it("unit should be named Pong", function(){
      assert.equal(ast.units[0].name, "Pong")});
    it("unit should have a sprites array", function(){
      assert.ok(ast.units[0].sprites)});
    it("unit should have a stages array", function(){assert.ok(ast.units[0].stages)});
    it("unit should have a libraries array", function(){
      assert.ok(ast.units[0].libraries)});
    it("unit should have a comments array", function(){
      assert.ok(ast.units[0].comments)});
  });
  describe("sprite", function(){
    let sprite;
    it("there should be one sprite", function(){
      sprite = ast.units[0].sprites[0];
      assert.equal(ast.units[0].sprites.length, 1);
    });
    it("sprite should not be null or undefined", function(){assert.ok(sprite)});
    it("sprite should be named Ball", function(){assert.equal(sprite.name, "Ball")});
    it("sprite should have type Sprite", function(){
      assert.equal(sprite.type, "Sprite")});
  });
});
