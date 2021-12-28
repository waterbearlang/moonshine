const data = `unit Pong [
  sprite Ball [
    // No content for test
  ]
]`;

const moonshine = require("../moonshine_cjs.js");

test("parse", () => {
  expect(moonshine.parse(data));
});

test("parse unit", () => {
  expect(moonshine.parse(data).type === "Unit");
  expect(moonshine.parse(data).name === "Pong");
});
