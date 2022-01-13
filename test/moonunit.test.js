const testdata = `unit Pong [
  sprite Ball [
    // No content for test
  ]
]`;

import moonshine from "../moonshine.js";

test("parse", () => {
  // make sure no exceptions are thrown during parsing
  let ast = moonshine.parse(testdata);
  expect(ast); // not null or undefined
});

test("parse unit", () => {
  let ast = moonshine.parse(testdata);
  expect(ast.units.length === 1);
  expect(ast.units[0].type === "Unit");
  expect(ast.units[0].name === "Pong");
});
