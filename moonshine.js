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
  static get COSTUMES() {
    return Symbol.for("costume");
  }
  static get SOUNDS() {
    return Symbol.for("sounds");
  }
  static get LIBRARY() {
    return Symbol.for("library");
  }
  static get BLOCKDEF() {
    return Symbol.for("blockdef");
  }
  static get TRIGGERCALL() {
    return Symbol.for("triggercall");
  }
  static get CONTEXT() {
    return Symbol.for("context");
  }
  static get STEP() {
    return Symbol.for("step");
  }
  static get PARSEERROR() {
    return Symbol.for("parseerror");
  }

  parseLines(lines) {
    const comments = [];
    const units = [];
    while (this.lineCount < lines.length) {
      let theLine = lines[this.lineCount].trim();
      if (theLine === "]") {
        break;
      }
      switch (this.unitLineType(lines[this.lineCount])) {
        case Parser.WHITESPACE:
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
      this.lineCount++;
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
    while (this.lineCount < lines.length - 1) {
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
    // Get name from first line
    // Iterate through lines getting Comment, Stage, Library, Sprite
    let theLine = lines[this.lineCount];
    let name = /\s*unit\s+(?<name>.*)\[\s*/.exec(theLine).groups.name.trim();
    let sprites = [];
    let costumes = [];
    let sounds = [];
    let stages = [];
    let libraries = [];
    let comments = [];
    while (this.lineCount < lines.length - 1) {
      this.lineCount++;
      theLine = lines[this.lineCount].trim();
      if (theLine === "]") {
        break;
      }
      switch (this.unitLineType(theLine)) {
        case Parser.WHITESPACE:
          break;
        case Parser.COMMENT:
          comments.push(this.Comment(lines));
          break;
        case Parser.SOUNDS:
          // We keep one array no matter how many blocks of Sounds are in the source file
          // Currently we are throwing away comments from Sound blocks
          sounds.push(...this.Sounds(lines).costumes);
          break;
        case Parser.COSTUMES:
          // Like Sounds, we keep one array even if there is more than one block of costumes
          // Currently we are throwing away comments from Costumes blocks
          costumes.push(...this.Costumes(lines).costumes);
          break;
        case Parser.SPRITE:
          sprites.push(this.Sprite(lines));
          break;
        case Parser.STAGE:
          stages.push(this.Stage(lines));
          break;
        case Parser.LIBRARY:
          libraries.push(this.Library(lines));
          break;
        default:
          this.unitError(lines);
          break;
      }
    }
    return {
      type: "Unit",
      name,
      sprites,
      sounds,
      costumes,
      stages,
      libraries,
      comments,
    };
  }

  BlockDef(lines) {
    // Get name from first line
    // Iterate through lines getting Comment, Steps
    let theLine = lines[this.lineCount];
    let name = /\s*define\s+(?<name>.*)\[\s*/.exec(theLine).groups.name.trim();
    let steps = [];
    let comments = [];
    while (this.lineCount < lines.length - 1) {
      this.lineCount++;
      theLine = lines[this.lineCount].trim();
      if (theLine === "]") {
        break;
      }
      switch (this.unitLineType(theLine)) {
        case Parser.WHITESPACE:
          break;
        case Parser.COMMENT:
          comments.push(this.Comment(lines));
          break;
        case Parser.CONTEXT:
          steps.push(this.Context(lines));
          break;
        case Parser.STEP:
          steps.push(this.Step(lines));
          break;
        default:
          this.unitError(lines);
          break;
      }
    }
    return { type: "BlockDef", name, steps, comments };
  }

  TriggerCall(lines) {
    // Get name from first line
    // Iterate through lines getting Comment, Steps
    let theLine = lines[this.lineCount];
    let name = /\s*when\s+(?<name>.*)\[\s*/.exec(theLine).groups.name.trim();
    let comments = [];
    let steps = [];
    while (this.lineCount < lines.length - 1) {
      this.lineCount++;
      theLine = lines[this.lineCount].trim();
      if (theLine === "]") {
        break;
      }
      switch (this.unitLineType(theLine)) {
        case Parser.WHITESPACE:
          break;
        case Parser.COMMENT:
          comments.push(this.Comment(lines));
          break;
        case Parser.CONTEXT:
          steps.push(this.Context(lines));
          break;
        case Parser.STEP:
          steps.push(this.Step(lines));
          break;
        default:
          this.unitError(lines);
          break;
      }
    }
    return { type: "TriggerCall", name, steps, comments };
  }

  Context(lines) {
    // Get name from first line
    // FIXME: Currently punting on parsing out the name and arguments
    // Iterate through lines getting Comment, Steps
    let theLine = lines[this.lineCount];
    let name = theLine.trim().slice(0, -1).trim(); // remove trailing "["
    let args = []; // these will be extracted from name
    let comments = [];
    let steps = [];
    while (this.lineCount < lines.length - 1) {
      this.lineCount++;
      theLine = lines[this.lineCount].trim();
      if (theLine === "]") {
        break;
      }
      switch (this.unitLineType(theLine)) {
        case Parser.WHITESPACE:
          break;
        case Parser.COMMENT:
          comments.push(this.Comment(lines));
          break;
        case Parser.CONTEXT:
          steps.push(this.Context(lines));
          break;
        case Parser.STEP:
          steps.push(this.Step(lines));
          break;
        default:
          this.unitError(lines);
          break;
      }
    }
    return { type: "Context", name, args, steps, comments };
  }

  Step(lines) {
    // Get name from first line
    // FIXME: Currently punting on parsing out the name and arguments
    let theLine = lines[this.lineCount];
    let name = theLine.trim().slice(0, -1).trim(); // remove trailing "["
    let args = []; // these will be extracted from name
    return { type: "Step", name, args };
  }

  Sprite(lines) {
    let theLine = lines[this.lineCount];
    let name = /\s*sprite\s+(?<name>.*)\[\s*/.exec(theLine).groups.name.trim();
    let costumes = [];
    let blockDefs = [];
    let triggerCalls = [];
    let forms = [];
    let sounds = [];
    let structs = [];
    let comments = [];
    while (this.lineCount < lines.length - 1) {
      this.lineCount++;
      theLine = lines[this.lineCount].trim();
      if (theLine === "]") {
        break;
      }
      switch (this.unitLineType(theLine)) {
        case Parser.WHITESPACE:
          break;
        case Parser.COMMENT:
          comments.push(this.Comment(lines));
          break;
        case Parser.COSTUMES:
          costumes.push(this.Costumes(lines));
          break;
        case Parser.TRIGGERCALL:
          triggerCalls.push(this.TriggerCall(lines));
          break;
        case Parser.FORM:
          forms.push(this.Form(lines));
          break;
        case Parser.SOUNDS:
          sounds.push(this.Sounds(lines));
          break;
        case Parser.STRUCT:
          structs.push(this.Struct(lines));
          break;
        case Parser.BLOCKDEF:
          blockDefs.push(this.BlockDef(lines));
          break;
        default:
          this.unitError(lines);
          break;
      }
    }
    return {
      type: "Sprite",
      name,
      blockDefs,
      triggerCalls,
      forms,
      sounds,
      costumes,
      structs,
      comments,
    };
  }

  Sounds(lines) {
    let theLine = lines[this.lineCount];
    let name = /\s*sounds\s+(?<name>.*)\[\s*/.exec(theLine).groups.name.trim();
    let sounds = [];
    let comments = [];
    while (this.lineCount < lines.length - 1) {
      this.lineCount++;
      theLine = lines[this.lineCount].trim();
      if (theLine === "]") {
        break;
      }
      switch (this.unitLineType(theLine)) {
        case Parser.WHITESPACE:
          break;
        case Parser.COMMENT:
          comments.push(this.Comment(lines));
          break;
        // FIXME: Does not actually support sounds yet
        default:
          this.unitError(lines);
          break;
      }
    }
    return {
      type: "Sounds",
      sounds,
      comments,
    };
  }

  Costumes(lines) {
    let theLine = lines[this.lineCount];
    let name = /\s*costumes\s+(?<name>.*)\[\s*/
      .exec(theLine)
      .groups.name.trim();
    let costumes = [];
    let comments = [];
    while (this.lineCount < lines.length - 1) {
      this.lineCount++;
      theLine = lines[this.lineCount].trim();
      if (theLine === "]") {
        break;
      }
      switch (this.unitLineType(theLine)) {
        case Parser.WHITESPACE:
          break;
        case Parser.COMMENT:
          comments.push(this.Comment(lines));
          break;
        // FIXME: Does not actually support costumes yet
        default:
          this.unitError(lines);
          break;
      }
    }
    return {
      type: "Costumes",
      costumes,
      comments,
    };
  }

  isUnit(line) {
    // OK, this is going to get a bit complex
    const theLine = line.trim();
    if (!theLine.startsWith("unit ")) return false;
    if (!theLine.endsWith("[")) return false;
    // FIXME: punt on complex nesting syntax for now
    return true;
  }

  isStage(line) {
    const theLine = line.trim();
    if (!theLine.startsWith("stage")) return false;
    if (!theLine.endsWith("[")) return false;
    return true;
  }

  isBlockDef(line) {
    const theLine = line.trim();
    if (!theLine.startsWith("define ")) return false;
    if (!theLine.endsWith("[")) return false;
    return true;
  }

  isTriggerCall(line) {
    const theLine = line.trim();
    if (!theLine.startsWith("when ")) return false;
    if (!theLine.endsWith("[")) return false;
    return true;
  }

  isSounds(line) {
    const theLine = line.trim();
    if (!theLine.startsWith("sounds ")) return false;
    if (!theLine.endsWith("[")) return false;
    return true;
  }

  isCostumes(line) {
    const theLine = line.trim();
    if (!theLine.startsWith("costumes ")) return false;
    if (!theLine.endsWith("[")) return false;
    return true;
  }
  isContext(line) {
    // important: called after other container types!
    const theLine = line.trim();
    if (!theLine.endsWith("[")) return false;
    return true;
  }

  isStep(line) {
    // important: called after other types
    return true;
  }

  isSprite(line) {
    const theLine = line.trim();
    if (!theLine.startsWith("sprite ")) return false;
    if (!theLine.endsWith("[")) return false;
    return true;
  }

  isLibrary(line) {
    const theLine = line.trim();
    if (!theLine.startsWith("library ")) return false;
    if (!theLine.endsWith("[")) return false;
    return true;
  }

  unitLineType(line) {
    if (this.isUnit(line)) return Parser.UNIT;
    if (this.isWhitespace(line)) return Parser.WHITESPACE;
    if (this.isComment(line)) return Parser.COMMENT;
    if (this.isSprite(line)) return Parser.SPRITE;
    if (this.isLibrary(line)) return Parser.LIBRARY;
    if (this.isStage(line)) return Parser.STAGE;
    if (this.isCostumes(line)) return Parser.COSTUMES;
    if (this.isSounds(line)) return Parser.SOUNDS;
    if (this.isBlockDef(line)) return Parser.BLOCKDEF;
    if (this.isTriggerCall(line)) return Parser.TRIGGERCALL;
    if (this.isContext(line)) return Parser.CONTEXT;
    if (this.isStep(line)) return Parser.STEP;
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
