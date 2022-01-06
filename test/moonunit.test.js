const testdata = `unit Pong [
  sprite Ball [
    // No content for test
  ]
]`;

const moonshine = require("../moonshine_cjs.js");

test("parse", () => {
  // make sure no exceptions are thrown during parsing
  let ast = moonshine.parse(testdata);
  expect(ast); // not null or undefined
});

test("parse unit", () => {
  let ast = moonshine.parse(testdata);
  expect(ast.type === "Unit");
  expect(ast.name === "Pong");
});
