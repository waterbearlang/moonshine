#!/usr/bin/env node
import { argv } from "node:process";
import { readFileSync, writeFileSync } from "node:fs";
import Parser from "../moonshine.js";

const parser = new Parser();

argv.slice(2).forEach((path, index) => {
  // each path should be to a .moon file
  let moon = readFileSync(path, "utf8");
  let ast = parser.parse(moon);
  let json = JSON.stringify(ast, null, 2);
  let out = writeFileSync(path.replace("moon", "json"), json);
});
