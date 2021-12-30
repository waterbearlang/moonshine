const testdata = `unit Pong [
  sprite Ball [
    // No content for test
  ]
]`;

const moonshine = require("../moonshine_cjs.js");

test("parse", () => {
  expect(moonshine.parse(testdata));
});

test("parse unit", () => {
  expect(moonshine.parse(testdata).type === "Unit");
  expect(moonshine.parse(testdata).name === "Pong");
});
