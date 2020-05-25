const moonshine = require("./moonshine.js");
const fs = require("fs");

const script = fs.readFileSync("test.moonshine", "utf8");
//console.log(script);
console.log(JSON.stringify(moonshine.parse(script), null, 2));
