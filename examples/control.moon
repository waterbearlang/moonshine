name: Controls
hue: 0
language: JavaScript

define wait (seconds:Number) seconds[
  // pause before calling next block
  log (seconds)
] returns elapsed:Number

define trigger each frame (elapsed time:Number) (steps:BlockList)[
  render triangles
  consolidate sprites
]

define context loop over (list:TypeAList) (action:BlockList)[
  // needs locals for item and index
  // returns a new list
  before (action)
  action
  after (action)
] returns list:TypeBList
