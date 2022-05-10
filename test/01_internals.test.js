import Parser from "../moonshine.js";
import assert from "assert";

const parser = new Parser();

describe("Test the parser parts", function () {
  beforeEach(function () {
    parser.reset();
  });
  describe("Test isWhitespace", function () {
    it("Single space", function () {
      assert.equal(parser.isWhitespace(" "), true);
    });
    it("Multiple spaces", function () {
      assert.equal(parser.isWhitespace("    "), true);
    });
    it("Spaces and tabs", function () {
      assert.equal(parser.isWhitespace(" \t \t "), true);
    });
    it("Fail for non-whitespace", function () {
      assert.equal(parser.isWhitespace(" abc "), false);
    });
  });
  describe("Test isComment", function () {
    it("single-line", function () {
      assert.equal(parser.isComment("// this is a comment"), true);
    });
    it("multi-line on a single line", function () {
      assert.equal(parser.isComment("/* also a comment */"), true);
    });
    it("multi-line", function () {
      assert.equal(
        parser.isComment(`/* this is a
                          comment across
                          multiple lines */`),
        true
      );
    });
    it("comment at end of line not supported", function () {
      assert.equal(
        parser.isComment("do () something () // bad comment"),
        false
      );
    });
    it("leading whitespace", function () {
      assert.equal(parser.isComment("    // this should be alright"), true);
    });
    it("trailing whitespace", function () {
      assert.equal(parser.isComment("//this should be fine too      "), true);
    });
  });
  describe("Test isUnit", function () {
    it("Test with minimal whitespace", function () {
      assert.equal(parser.isUnit("unit fnordSuch["), true);
    });
    it("test with some whitespace", function () {
      assert.equal(parser.isUnit("  unit    fnordSuch   [  "), true);
    });
    it("test with internal whitespace", function () {
      assert.equal(parser.isUnit("unit fnord such and such["), true);
    });
    it("test with invalid unit", function () {
      assert.equal(parser.isUnit("unitfnordSuch["), false);
    });
    it("test with invalid unit", function () {
      assert.equal(parser.isUnit("fnordSuch["), false);
    });
    it("test with invalid unit", function () {
      assert.equal(parser.isUnit("unit fnordSuch"), false);
    });
  });
  describe("Test Comment", function () {
    it("test with single-line", function () {
      assert.equal(parser.Comment(["// doh"]).type, "Comment");
    });
    it("test with multiline on one line", function () {
      assert.equal(parser.Comment(["/* doh */"]).type, "Comment");
    });
    it("test with multiline", function () {
      assert.equal(
        parser.Comment(["/* dorky", "dorky", "dorky", "dorky */"]).type,
        "Comment"
      );
    });
  });
  describe("Test Unit", function () {
    it("test empty unit", function () {
      assert.equal(parser.Unit(["name: fnordSuch"]).type, "Unit");
    });
  });
  describe("Test unitLineType", function () {
    it("Test unit type", function () {
      assert.equal(parser.unitLineType("name: fnordSuch"), Parser.UNIT);
    });
    it("Test comment type", function () {
      assert.equal(parser.unitLineType("// blah blah"), Parser.COMMENT);
    });
    it("Test whitespace type", function () {
      assert.equal(parser.unitLineType("   "), Parser.WHITESPACE);
    });
    it("Test sprite type", function () {
      assert.equal(parser.unitLineType("sprite hoopla["), Parser.SPRITE);
    });
    it("Test stage type", function () {
      assert.equal(parser.unitLineType("stage["), Parser.STAGE);
    });
    it("Test block def", function () {
      assert.equal(
        parser.unitLineType("define xyzzy(foo:bar) xrxbrbl fnord plugh["),
        Parser.BLOCKDEF
      );
    });
    it("Test context", function () {
      assert.equal(
        parser.unitLineType("septimus parsimus(explodius) ["),
        Parser.CONTEXTCALL
      );
    });
    it("Test step type", function () {
      assert.equal(
        parser.unitLineType("small furry creatures"),
        Parser.STEPCALL
      );
    });
    // Disabling unknown type as steps are currently swallowing all errors
    // it("Test unknown type", function(){
    //   assert.equal(parser.unitLineType("not a unit()"), Parser.PARSEERROR)});
  });
});
