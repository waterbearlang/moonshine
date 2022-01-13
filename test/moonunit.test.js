const testdata = `unit Pong [
  sprite Ball [
    // No content for test
  ]
]`;

import moonshine from "../moonshine.js";
import assert from "assert";

let ast;

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
