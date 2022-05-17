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
  describe("Test Metadata", function () {
    it("test with minimal content", function () {
      assert.equal(parser.Metadata(["a:b"]).a, "b");
    });
    it("test with actual metadata", function () {
      assert.equal(
        parser.Metadata(["name: Controls", "hue: 90"]).name,
        "Controls"
      );
    });
    it("test with whitespace lines", function () {
      assert.equal(
        parser.Metadata(["", "name: Controls", "     ", "hue: 90"]).hue,
        "90"
      );
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
  // describe("Test Unit", function () {
  //   it("test empty unit", function () {
  //     assert.equal(parser.Unit(["name: fnordSuch"]).type, "Unit");
  //   });
  // });
  describe("Test unitLineType", function () {
    // it("Test unit type", function () {
    //   assert.equal(parser.unitLineType("name: fnordSuch"), Parser.UNIT);
    // });
    // it("Test metadata type", function () {
    //   assert.equal(parser.unitLineType("a:b"), Parser.METADATA);
    //   assert.equal(parser.unitLineType("name: Pong"), Parser.METADATA);
    //   assert.equal(parser.unitLineType("name: Controls"), Parser.METADATA);
    //   assert.equal(parser.unitLineType("hue: 0"), Parser.METADATA);
    //   assert.equal(parser.unitLineType("hue: 90"), Parser.METADATA);
    // });
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
    it("Test costume type", function () {
      assert.equal(parser.unitLineType("costumes["), Parser.COSTUMES);
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
