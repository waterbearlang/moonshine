const fs = require("fs");

const mod = `export {
  peg$SyntaxError as SyntaxError,
  peg$parse as parse
};`.split('\n');

let script = fs.readFileSync('moonshine.js', 'utf8').split('\n');
let offset = script.indexOf('module.exports = {');
script.splice(offset, 4, ...mod);
fs.writeFileSync('moonshine_es.js', script.join('\n')); 