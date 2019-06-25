#!/usr/bin/env node

const { spawnSync } = require('child_process');

const obj = spawnSync('eslint --fix ./', { encoding: 'utf8', shell: true });

obj.stdout && console.warn(`😈  ukoa: \n${obj.stdout}`);
obj.error && console.warn(`😭  ukoa: \n${obj.error}`);
obj.stderr && console.warn(`🔪 ukoa: \n${obj.stderr}`);
