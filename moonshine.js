// moonshine.js

// Attempt to hand-roll a parser

// Top level must be "unit NAME" or comment or whitespace then contents bracketed by [ and ]
// Within the unit at the top level there can be:
// * Comment
// * Stage
// * Library
// * Sprite
// * And eventually non-visible things like databases and such

// Within a Sprite there can be:
// * Comment
// * BlockDef
// * TriggerCall
// * Form (or local variables and their defaults?)
// * Sounds
// * Costumes
// * Struct

// While I would like to be able to point at an exact character for errors
// at least initially Moonshine will be strictly line-based so I don't have to (hopefully)
// build a character-by-character state machine
// So, keep the line number, parse the line. If it is expected, all good.
// If it has an error, take the unparsed line apart to find the error to report a character
// offset.

// Currently BlockCall and ValueCall look identical, but differ in where they can appear
// which should be fairly trivial to handle, but might have been tricky with Peggy

class Parser {
  constructor() {
    this.lineCount = 0;
  }

  reset() {
    this.lineCount = 0;
  }

  // Symbols for parser, constants on the Parser object
  static get WHITESPACE() {
    return Symbol.for("whitespace");
  }
  static get COMMENT() {
    return Symbol.for("comment");
  }
  static get UNIT() {
    return Symbol.for("unit");
  }
  static get SPRITE() {
    return Symbol.for("sprite");
  }
  static get STAGE() {
    return Symbol.for("stage");
  }
  static get LIBRARY() {
    return Symbol.for("library");
  }
  static get PARSEERROR() {
    return Symbol.for("parseerror");
  }

  parseLines(lines) {
    const comments = [];
    const units = [];
    while (this.lineCount < lines.length) {
      switch (this.unitLineType(lines[this.lineCount])) {
        case Parser.WHITESPACE:
          this.lineCount++;
          break;
        case Parser.COMMENT:
          comments.push(this.Comment(lines));
          break;
        case Parser.UNIT:
          units.push(this.Unit(lines));
          break;
        default:
          this.unitError(lines);
          break;
      }
    }
    return { comments, units };
  }

  parse(text) {
    return this.parseLines(text.split("\n"));
  }

  isWhitespace(line) {
    return !line.trim();
  }

  isComment(line) {
    const theLine = line.trim();
    if (theLine.startsWith("//") || theLine.startsWith("/*")) return true;
    return false;
  }

  isNumber(text) {
    if (Number.isNaN(Number(text))) {
      return false;
    }
    return true;
  }

  isName(text) {
    // FIXME
    return true;
  }

  Comment(lines) {
    let theLine = lines[this.lineCount];
    if (theLine.trim().startsWith("//")) {
      return { type: "Comment", value: theLine.split("//")[1].trim() };
    }
    let commentLines = [];
    theLine = theLine.trim().split("/*")[1].trim();
    while (true) {
      if (theLine.endsWith("*/")) {
        theLine = theLine.split("*/")[0].trim();
        commentLines.push(theLine);
        break;
      } else {
        commentLines.push(theLine);
      }
      this.lineCount++;
      theLine = lines[this.lineCount].trim();
    }
    return { type: "Comment", value: commentLines.join("\n") };
  }

  Unit(lines) {
    // Get name and signature from first line
    // Iterate through lines getting Comment, Stage, Library, Sprite
    let theLine = lines[this.lineCount];
    let name = /\s*unit\s+(?<name>.*)\[\s*/.exec(theLine).groups.name;
    let sprites = [];
    let stages = [];
    let libraries = [];
    let comments = [];
    while (true) {
      this.lineCount++;
      theLine = lines[this.lineCount].trim();
      if (theLine === "]") {
        this.lineCount++;
        break;
      } else {
        if (isComment(theLine)) {
          comments.push(this.Comment(lines));
        }
        if (isSprite(theLine)) {
          comments.push(this.Sprite(lines));
        }
      }
    }
    return { type: "Unit", name, args, expressions };
  }

  isUnit(line) {
    // OK, this is going to get a bit complex
    const theLine = line.trim();
    if (!theLine.startsWith("unit ")) return false;
    if (!theLine.endsWith("[")) return false;
    // FIXME: punt on complex nesting syntax for now
    return true;
  }

  unitLineType(line) {
    if (this.isUnit(line)) return Parser.UNIT;
    if (this.isWhitespace(line)) return Parser.WHITESPACE;
    if (this.isComment(line)) return Parser.COMMENT;
    if (this.isSprite(line)) return Parser.SPRITE;
    if (this.isLibrary(line)) return Parser.LIBRARY;
    if (this.isStage(line)) return Parser.STAGE;
    return Parser.PARSEERROR;
  }

  unitError(lines) {
    const err = `Error on line ${this.lineCount + 1}: "${
      lines[this.lineCount]
    }"`;
    console.error(err);
    throw new Error(err);
  }
}

export default Parser;
