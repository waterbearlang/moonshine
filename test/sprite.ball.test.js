const testdata = `unit Pong [
  sprite Ball [

    when 🏁 clicked [
      Initialize
      Reset
      repeat until ((Game Over) = (1))[
        move (speed) steps
      ]
    ]

    costumes [
      // Not supported yet
    ]

    sounds [
      // Not supported yet
    ]

    define Reset [
      goto x: (0) y: (-45)
      point in direction (pick random (1) to (360))
      wait (0.5) seconds
    ]

    define Initialize [
      hide variable (Winner)
      set speed to (5)
      show
      set (Game Over) to (0)
    ]

    when I receive (Bounce)[
      turn ↻ (((Bounce Direction) - (direction)) * 2) degrees
      move (speed) steps
    ]

    when I receive (Score Player)[
      change (speed) by (0.5)
      Reset
    ]
  ]
]`;

let ast;

const moonshine = require("../moonshine_cjs.js");

beforeAll(() => {
  try {
    ast = moonshine.parse(testdata);
  } catch (e) {
    if (!e.location) {
      throw e;
    }
    console.log(
      `Error parsing script at line ${e.location.start.line}, col ${e.location.start.column}: ${e.message}`
    );
  }
});

test("unit", () => {
  console.log(`unit test ast: ${JSON.stringify(ast)}`);
  expect(ast.name === "Pong");
  expect(ast.type === "Unit");
});

test("output", () => {
  let fs = require("fs");
  fs.writeFileSync("test.out.json", JSON.stringify(ast, null, 2));
  expect(ast);
});
