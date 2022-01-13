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

import moonshine from "../moonshine.js";
import assert from "assert";

describe("Unit", function () {
  before(() => {
    ast = moonshine.parse(testdata);
  });
  describe("parse", () => {
    it("unit should be found", () => ast.units.length === 1);
    it("unit should not be null or undefined", () => !!ast.units[0]);
    it("unit should have type Unit", () => ast.units[0].type === "Unit");
    it("unit should be named Pong", () => ast.units[0].name === "Pong");
  });
});
