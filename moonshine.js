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
  static get CONTEXTDEF() {
    return Symbol.for("contextdef");
  }
  static get TRIGGERDEF(){
    return Symbol.for("triggerdef");
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
          this.unitError(lines, "unrecognized line in file");
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
    if (isNumber(text)) {
      return false;
    }
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

  // A name with optional parameters, used for value, step, and context blocks
  NameDef(text) {
    let current = [];
    let parts = [];
    let params = [];
    let index = 0;
    let value = null;
    while (index < text.length) {
      if (text[index] === "[") {
        this.nameError(text, index, "illegal open bracket");
      } else if (text[index] === "(") {
        parts.push(current.join(""));
        current.length = 0;
        ({ index, value } = this.Parameter(text, index));
        params.push(value);
        value = null;
      } else if (text[index] === ")") {
        this.nameError(text, index, "illegal close parens");
      } else {
        current.push(text[index]);
        index++;
      }
    }
    parts.push(current.join(""));
    return { name: parts.join("()").trim(), params };
  }

  NameCall(text) {
    let parts = [];
    let current = [];
    let args = [];
    let index = 0;
    let arg = null;
    // A name is any text, optionally containing embedded expressions
    if (text.trim().length === 0) {
      this.nameError(text, 0, "a name cannot be empty or only whitespace");
    }
    if (this.isNumber(text)) {
      this.nameError(text, 0, "a number cannot be used as a name");
    }
    while (index < text.length) {
      if (text[index] === "(") {
        parts.push(current.join(""));
        current.length = 0;
        ({ index, arg } = this.Expression(text, index));
        args.push(arg);
        arg = null;
      } else if (text[index] === "[") {
        this.nameError(text, index, "illegal open bracket");
      } else if (text[index] === ")") {
        this.nameError(text, index, "illegal close parens");
      } else {
        current.push(text[index]);
        index++;
      }
    }
    parts.push(current.join(""));
    return { name: parts.join("()"), args };
  }

  SimpleName(text) {
    if (!text) {
      this.nameError(text, 0, "Name cannot be undefined, null, or empty");
    }
    if (typeof text !== "string") {
      this.nameError(text, 0, "Name must be a string");
    }
    if (this.isWhitespace(text)) {
      this.nameError(text, 0, "Name cannot be only whitespace");
    }
    if (/[\(\)\[\]\:]/g.test(text)) {
      this.nameError(
        text,
        0,
        "Name cannot contain square brackets, parentheses, or colon"
      );
    }
    return text.trim();
  }

  Expression(text, index) {
    // An expression can be: a simple name, a number, or a name with arguments, where
    // the arguments themselves can be expressions
    // An expression is always surrounded by parentheses
    let parts = [];
    let current = [];
    let args = [];
    let arg = null;
    if (text[index] === "(") {
      index++;
    } else {
      this.nameError(text, index, 'an expression must begin with "("');
    }
    while (index < text.length) {
      if (text[index] === ")") {
        index++;
        parts.push(current.join(""));
        if (parts.length === 1 && this.isNumber(parts[0])) {
          return {
            index,
            arg: {
              type: "Number",
              value: Number(parts[0]),
            },
          };
          // FIXME: Allow string and other types here
        } else {
          return {
            index,
            arg: {
              type: "BlockCall",
              value: { name: parts.join("()"), args },
            },
          };
        }
      } else if (text[index] === "(") {
        parts.push(current.join(""));
        current.length = 0;
        ({ index, arg } = this.Expression(text, index));
        args.push(arg);
        arg = null;
      } else if (text[index] === "[") {
        this.nameError(text, index, "illegal open bracket");
      } else {
        current.push(text[index]);
        index++;
      }
    }
    // should not get here
    this.nameError(text, index, "missing close parens");
  }

  Returns(text) {
    // a return value is a typed name, like a parameter
    try {
      let [_, name, type] = /returns (.+):(.+)/.exec(text);
      return { name: this.SimpleName(name), type: this.SimpleName(type) };
    } catch (e) {
      this.nameError(text, 0, "problem parsing returns for block definition");
    }
  }

  Parameter(text, index) {
    let name = [];
    let type = [];
    let isName = true;
    if (text[index] === "(") {
      index++;
    } else {
      this.nameError(text, index, 'a parameter must begin with "("');
    }
    while (index < text.length) {
      if (text[index] === "(") {
        this.nameError(text, index, "illegal open parens");
      } else if (text[index] === "[") {
        this.nameError(text, index, "illegal open bracket");
      } else if (text[index] === ":") {
        isName = false;
        index++;
      } else if (text[index] === ")") {
        return {
          index: index + 1,
          value: { name: name.join(""), type: type.join("") },
        };
      } else {
        if (isName) {
          name.push(text[index]);
        } else {
          type.push(text[index]);
        }
        index++;
      }
    }
    this.nameError(text, index, "missing close parens");
  }

  Unit(lines) {
    // Get name from first line
    // Iterate through lines getting Comment, Stage, Library, Sprite
    let theLine = lines[this.lineCount];
    let name = /\s*unit\s+(?<name>.*)\[\s*/.exec(theLine).groups.name.trim();
    let sprites = [];
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
          this.unitError(lines, "unrecognized unit child type");
          break;
      }
    }
    return {
      type: "Unit",
      name,
      sprites,
      stages,
      libraries,
      comments,
    };
  }

  Library(lines){
    // A library has a name and a colour
    let theLine = lines[this.lineCount];
    // FIXME: Implement this
  }

  BlockDef(lines) {
    // Get name from first line
    // Iterate through lines getting Comment, Steps
    let theLine = lines[this.lineCount];
    let nameStr = /\s*define\s+(?<name>.*)\[\s*/
      .exec(theLine)
      .groups.name.trim();
    let { name, params } = this.NameDef(nameStr);
    let steps = [];
    let comments = [];
    let returns = null;
    while (this.lineCount < lines.length - 1) {
      this.lineCount++;
      theLine = lines[this.lineCount].trim();
      if (theLine.startsWith("]")) {
        returns = this.Returns(theLine.slice(1).trim());
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
          this.unitError(lines, "unrecognized BlockDef child type");
          break;
      }
    }
    return { type: "BlockDef", name, params, steps, returns, comments };
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
          this.unitError(lines, "Unrecognized TriggerCall child type");
          break;
      }
    }
    return { type: "TriggerCall", name, steps, comments };
  }

  Context(lines) {
    // Get name from first line
    // Iterate through lines getting Comment, Steps
    let theLine = lines[this.lineCount];
    let nameStr = theLine.trim().slice(0, -1).trim(); // remove trailing "["
    let { name, args } = this.NameCall(nameStr);
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
          this.unitError(lines, "unrecognized Context child type");
          break;
      }
    }
    return { type: "Context", name, args, steps, comments };
  }

  Step(lines) {
    // Get name from first line
    let theLine = lines[this.lineCount];
    let nameStr = theLine.trim();
    let { name, args } = this.NameCall(nameStr);
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
        case Parser.SOUNDS:
          // We keep one array no matter how many blocks of Sounds are in the source file
          // Currently we are throwing away comments from Sound blocks
          sounds.push(...this.Sounds(lines).sounds);
          break;
        case Parser.COSTUMES:
          // Like Sounds, we keep one array even if there is more than one block of costumes
          // Currently we are throwing away comments from Costumes blocks
          costumes.push(...this.Costumes(lines).costumes);
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
          this.unitError(lines, "unrecognized Sprite child type");
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
          this.unitError(lines, "unrecognized Sounds child type");
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
          this.unitError(lines, "unrecognized Costumes child type");
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

  isContextDef(line){
    // FIXME: Implement this
  }

  isTriggerDef(line){
    // FIXME: Implement this
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
    if (this.isLibrary(line)) return Parser.LIBRARY;
    if (this.isWhitespace(line)) return Parser.WHITESPACE;
    if (this.isComment(line)) return Parser.COMMENT;
    if (this.isSprite(line)) return Parser.SPRITE;
    if (this.isLibrary(line)) return Parser.LIBRARY;
    if (this.isStage(line)) return Parser.STAGE;
    if (this.isCostumes(line)) return Parser.COSTUMES;
    if (this.isSounds(line)) return Parser.SOUNDS;
    if (this.isContextDef(line)) return Parser.CONTEXTDEF;
    if (this.isTriggerDef(line)) return Parser.TRIGGERDEF;
    if (this.isBlockDef(line)) return Parser.BLOCKDEF;
    if (this.isTriggerCall(line)) return Parser.TRIGGERCALL;
    if (this.isContext(line)) return Parser.CONTEXT;
    if (this.isStep(line)) return Parser.STEP;
    return Parser.PARSEERROR;
  }

  nameError(text, index, msg) {
    const pointer = Array(index + 1).fill(" ");
    pointer.push("^");
    const err = `Name error ${msg} at index ${index}:\n"${text}"\n${pointer.join(
      ""
    )}`;
    console.error(err);
    throw new Error(err);
  }

  unitError(lines, msg) {
    const err = `Error ${msg} on line ${this.lineCount + 1}: "${
      lines[this.lineCount]
    }"`;
    console.error(err);
    throw new Error(err);
  }
}

export default Parser;
