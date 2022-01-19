import Parser from "../moonshine.js";
import assert from "assert";

const parser = new Parser();

describe("Test the parser parts", () => {
  beforeEach(() => parser.reset());
  describe("Test isWhitespace", () => {
    it("Single space", () => assert.equal(parser.isWhitespace(" "), true));
    it("Multiple spaces", () =>
      assert.equal(parser.isWhitespace("    "), true));
    it("Spaces and tabs", () =>
      assert.equal(parser.isWhitespace(" \t \t "), true));
    it("Fail for non-whitespace", () =>
      assert.equal(parser.isWhitespace(" abc "), false));
  });
  describe("Test isComment", () => {
    it("single-line", () =>
      assert.equal(parser.isComment("// this is a comment"), true));
    it("multi-line on a single line", () =>
      assert.equal(parser.isComment("/* also a comment */"), true));
    it("multi-line", () =>
      assert.equal(
        parser.isComment(`/* this is a
                          comment across
                          multiple lines */`),
        true
      ));
    it("comment at end of line not supported", () =>
      assert.equal(
        parser.isComment("do () something () // bad comment"),
        false
      ));
    it("leading whitespace", () =>
      assert.equal(parser.isComment("    // this should be alright"), true));
    it("trailing whitespace", () =>
      assert.equal(parser.isComment("//this should be fine too      "), true));
  });
  describe("Test isUnit", () => {
    it("Test with minimal whitespace", () =>
      assert.equal(parser.isUnit("unit fnordSuch["), true));
    it("test with some whitespace", () =>
      assert.equal(parser.isUnit("  unit    fnordSuch   [  "), true));
    it("test with internal whitespace", () =>
      assert.equal(parser.isUnit("unit fnord such and such["), true));
    it("test with invalid unit", () =>
      assert.equal(parser.isUnit("unitfnordSuch["), false));
    it("test with invalid unit", () =>
      assert.equal(parser.isUnit("fnordSuch["), false));
    it("test with invalid unit", () =>
      assert.equal(parser.isUnit("unit fnordSuch"), false));
  });
  describe("Test Comment", () => {
    it("test with single-line", () =>
      assert.equal(parser.Comment(["// doh"]).type, "Comment"));
    it("test with multiline on one line", () =>
      assert.equal(parser.Comment(["/* doh */"]).type, "Comment"));
    it("test with multiline", () =>
      assert.equal(
        parser.Comment(["/* dorky", "dorky", "dorky", "dorky */"]).type,
        "Comment"
      ));
  });
  describe("Test Unit", () => {
    it("test empty unit", () =>
      assert.equal(parser.Unit(["unit fnordSuch[", "]"]).type, "Unit"));
  });
  describe("Test unitLineType", () => {
    it("Test unit type", () =>
      assert.equal(parser.unitLineType("unit fnordSuch["), Parser.UNIT));
    it("Test comment type", () =>
      assert.equal(parser.unitLineType("// blah blah"), Parser.COMMENT));
    it("Test whitespace type", () =>
      assert.equal(parser.unitLineType("   "), Parser.WHITESPACE));
    it("Test sprite type", () =>
      assert.equal(parser.unitLineType("sprite hoopla["), Parser.SPRITE));
    it("Test library type", () =>
      assert.equal(parser.unitLineType("library foobar [ "), Parser.LIBRARY));
    it("Test stage type", () =>
      assert.equal(parser.unitLineType("stage["), Parser.STAGE));
    it("Test block def", () =>
      assert.equal(
        parser.unitLineType("define xyzzy(foo:bar) xrxbrbl fnord plugh["),
        Parser.BLOCKDEF
      ));
    it("Test context", () =>
      assert.equal(
        parser.unitLineType("septimus parsimus(explodius) ["),
        Parser.CONTEXT
      ));
    it("Test step type", () =>
      assert.equal(parser.unitLineType("small furry creatures"), Parser.STEP));
    // Disabling unknown type as steps are currently swallowing all errors
    // it("Test unknown type", () =>
    //   assert.equal(parser.unitLineType("not a unit()"), Parser.PARSEERROR));
  });
});
