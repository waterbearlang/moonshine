const moonshine = require("./moonshine.js");
const fs = require("fs");

const script = fs.readFileSync("test.moonshine", "utf8");
//console.log(script);
let ast;
try {
  ast = moonshine.parse(script);
  // console.log(JSON.stringify(ast, null, 2));
} catch (e) {
  if (!e.location) {
    throw e;
  }
  console.error("Error parsing script");
  console.error("\tLocation start: %o", e.location.start);
  console.error("\tLocation end: %o", e.location.end);
  console.error("\tMessage: %s", e.message);
  process.exit();
}

console.assert(ast.name === "Vector", `expected "Vector", got "${ast.name}"`);
console.assert(
  ast.type === "Namespace",
  'expected "Namespace", got "%s"',
  ast.type
);
console.assert(
  ast.values.length === 18,
  "expected 18 values, got %s",
  ast.values.length
);
let values = ast.values.filter(v => v.type !== "Comment");
fs.writeFileSync("test.out.json", JSON.stringify(values, null, 2));
console.assert(
  values.length === 9,
  "expected 9 non-comment values, got %s",
  values.length
);
console.assert(
  values[0].name === "fromXY",
  'expected %s name to be "fromXY"',
  values[0].name
);
console.assert(
  values[0].type === "Step",
  "expected %s to be a Step, was %s",
  values[0].name,
  values[0].type
);
console.assert(
  values[0].params.length === 2,
  "expected %s to take 2 params, found %s",
  values[0].name,
  values[0].params.length
);
console.assert(
  values[1].name === "fromMag_angle_unit",
  'expected %s name to be "fromMag_angle_unit"',
  values[1].name
);
console.assert(
  values[1].type === "Step",
  "expected %s to be a Step, was %s",
  values[1].name,
  values[1].type
);
console.assert(
  values[2].name === "add",
  'expected %s name to be "add"',
  values[2].name
);
console.assert(
  values[2].type === "Step",
  "expected %s to be a Step, was %s",
  values[2].name,
  values[2].type
);
console.assert(
  values[3].name === "whenMagExceedsStage",
  'expected %s name to be "whenMagExceedsStage"',
  values[3].name
);
console.assert(
  values[3].type === "Trigger",
  "expected %s to be a Trigger, was %s",
  values[3].name,
  values[3].type
);
console.assert(
  values[4].name === "eachFrame",
  'expected %s name to be "eachFrame"',
  values[4].name
);
console.assert(
  values[4].type === "Trigger",
  "expected %s to be a Trigger, was $s",
  values[4].name,
  values[4].type
);
console.assert(
  values[4].locals.length === 2,
  "expected %s to have 2 locals, found %s",
  values[4].name,
  JSON.stringify(values[4])
);
console.assert(
  values[5].name === "forEach",
  'expected %s name to be "forEach"',
  values[5].name
);
console.assert(
  values[5].type === "Context",
  "expected %s to be a Context, was %s",
  values[5].name,
  values[5].type
);
console.assert(
  values[6].name === "withVector",
  'expected %s name to be "withVector"',
  values[6].name
);
console.assert(
  values[6].type === "Context",
  "expected %s to be a Context, was %s",
  values[6].name,
  values[6].type
);
console.assert(
  values[7].name === "unit",
  'expected %s name to be "unit"',
  values[7].name
);
console.assert(
  values[7].type === "Value",
  "expected %s to be a Value, was %s",
  values[7].name,
  values[7].type
);
console.assert(
  values[7].returnType === "Vector",
  "expected %s to be a Vector, was %s",
  values[7].name,
  values[7].returnType
);
console.assert(
  values[8].name === "asArray",
  'expected %s name to be "asArray"',
  values[8].name
);
console.assert(
  values[8].type === "Step",
  "expected %s to be a Step, was %s",
  values[8].name,
  values[8].type
);
