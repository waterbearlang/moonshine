const moonshine = require("./moonshine.js");
const fs = require("fs");

const script = fs.readFileSync("test.moonshine", "utf8");
//console.log(script);
try{
  let ast = moonshine.parse(script);
  console.log(JSON.stringify(ast, null, 2));
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
