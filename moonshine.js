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

let lineCount = 0;

// Symbols for parser
const WHITESPACE = Symbol.for("whitespace");
const COMMENT = Symbol.for("comment");
const UNIT = Symbol.for("unit");
const PARSEERROR = Symbol.for("parseerror");

// Regular expressions for parser
// a name can start with any letter or underscore followed by any letter, number, punctuation, symbol, mark, emoji, mathematical symbol or the space character. It should *not* allow parentheses or brackets, but that is not implemented yet
const letter = `\\p{L}`;
const number = `\\p{N}`;
const symbol = `\\p{S}`;
const punctuation = `\\p{P}`;
const name_part = `[${letter}_][${letter}${number}${punctuation}${symbol}_ ]*`
const name_part_rx = new RegExp(name_part, 'u');

function parseLines(lines) {
  const comments = [];
  const units = [];
  while (lineCount < lines.length) {
    switch (unitLineType(lines[lineCount])) {
      case WHITESPACE:
        lineCount++;
        break;
      case COMMENT:
        comments.push(Comment(lines));
        break;
      case UNIT:
        units.push(Unit(lines));
        break;
      default:
        unitError(lines);
        break;
    }
  }
  return { comments, units };
}

function parse(text) {
  return parseLines(text.split("\n"));
}

function isWhitespace(line) {
  return !!line.trim();
}

function isComment(line) {
  const theLine = line.trim();
  if (theLine.startsWith("//") || theLine.startsWith("/*")) return true;
  return false;
}

function isNumber(text){
  
}

function isName(text) {
  if (name_part_rx.test(text){ return true; }
  const parts = text.split(/[\(\)]/);

}

function isUnit(line) {
  const theLine = line.trim();
  // OK, this is going to get a bit complex
}

function unitLineType(line) {
  if (isUnit(line)) return UNIT;
  if (isWhitespace(line)) return WHITESPACE;
  if (isComment(line)) return COMMENT;
  return PARSEERROR;
}

function unitError(lines) {
  const err = `Error on line ${lineCount + 1}: "${lines[lineCount]}"`;
  console.error(err);
  throw new Error(err);
}

export default { parse, isWhitespace, isComment, isUnit, isName };
