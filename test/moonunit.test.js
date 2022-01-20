const testdata = `unit Pong [
  sprite Ball [
    // No content for test
  ]
]`;

import Parser from "../moonshine.js";
import assert from "assert";

let parser = new Parser();
let ast;

describe("Test a minimal unit", function () {
  before(function(){
    ast = parser.parse(testdata);
  });
  describe("parse", function(){
    it("unit should be found", function(){ assert.equal(ast.units.length, 1)});
    it("unit should not be null or undefined", function(){ assert.ok(ast.units[0])});
    it("unit should have type Unit", function(){
      assert.equal(ast.units[0].type, "Unit")});
    it("unit should be named Pong", function(){
      assert.equal(ast.units[0].name, "Pong")});
  });
});
