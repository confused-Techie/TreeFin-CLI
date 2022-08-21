#!/usr/bin/env node 

const treefin = require("../src/index.js");

(async ()=> {
  await treefin.main(process.argv.slice(2));
})();
