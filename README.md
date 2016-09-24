# moonshine
A programming language that maps nicely to blocks

Moonshine is a functional language, mostly immutable, with any mutable or side-effect parts clearly marked and detectable by code. My current thinking is that is is a combination of a subset of JS2106 plus libraries, but I go back and forth on that. If it varies from a pure subset of JS, then it has to remain very regular and easy/fast to parse and validate.

Some of the building blocks, for now:

* Mori, for immutable data structures and functional helpers http://swannodette.github.io/mori/ and https://github.com/swannodette/mori
* Ohm, for parsing https://github.com/dethe/ohm and https://www.pubnub.com/blog/2016-08-30-javascript-parser-ohm-makes-creating-a-programming-language-easy/
* Underscore.string https://github.com/epeli/underscore.string#api
* Math (including matrices, vectors): http://mathjs.org/docs/reference/functions.html
* [Music Lib]
* [Physics Lib]
* [Game Lib]
* [Graphics Lib]


Examples
