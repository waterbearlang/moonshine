const moonshine = require("./moonshine.js");
const fs = require("fs");

const script = fs.readFileSync("test.moonshine", "utf8");
//console.log(script);
try{
  let ast = moonshine.parse(script);
  console.log(JSON.stringify(ast, null, 2));
  console.assert(ast.name === 'Vector', 'expected "Vector", got "%s"', ast.name);
  console.assert(ast.type === 'Namespace', 'expected "Namespace", got "%s"', ast.type);
  console.assert(ast.values.length === 16, 'expected 16 values, got %s', ast.values.length);
  let values = ast.values.filter(v => v.type !== 'Comment');
  console.assert(values.length === 8, 'expected 8 non-comment values, got %s', values.length);
  console.assert(values[0].type === 'Step', 'expected first value to be a Step, was %s', values[0].type);
  console.assert(values[0].params.length === 2, 'expected first value to take 2 params, found %s', values[0].params.length);
  console.assert(values[1].type === 'Step', 'expected value to be a Step, was %s', values[1].type);
  console.assert(values[2].type === 'Step', 'expected value to be a Step, was %s', values[2].type);
  console.assert(values[3].type === 'Trigger', 'expected value to be a Trigger, was %s', values[3].type);
  console.assert(values[4].type === 'Context', 'expected value to be a Context, was %s', values[4].type);
  console.assert(values[5].type === 'Context', 'expected value to be a Context, was %s', values[5].type);
  console.assert(values[6].type === 'Value', 'expected value to be a Value, was %s', values[6].type);
  console.assert(values[7].type === 'Step', 'expected value to be a Step, was %s', values[7].type);

}catch(e){
  if (!e.location){
    throw e;
  }
  console.error('Error parsing script');
  console.error('\tLocation start: %o', e.location.start);
  console.error('\tLocation end: %o', e.location.end);
  console.error('\tMessage: %s', e.message);
}

// FIXME: Add real tests rather than eyeballing the JSON results
