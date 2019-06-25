#!/usr/bin/env node

const { spawnSync } = require('child_process');

const cmd = process.argv.slice(2);
console.log(cmd)
if (!cmd) process.exit();
const obj = spawnSync(cmd.join(' '), { encoding: 'utf8', shell: true });

obj.stdout && console.warn(`😈  ukoa: \n${obj.stdout}`);
obj.error && console.warn(`😭  ukoa: \n${obj.error}`);
obj.stderr && console.warn(`🔪 ukoa: \n${obj.stderr}`);
