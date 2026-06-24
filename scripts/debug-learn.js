#!/usr/bin/env node
'use strict';
/**
 * fix-build-learn-index.js
 * Fixes the buildIndex function in build-learn.js to use shared header
 */
const fs = require('fs');
let src = fs.readFileSync('scripts/build-learn.js', 'utf8');

// Show the buildIndex return block
const idx1 = src.lastIndexOf("return `<!DOCTYPE html>");
console.log('buildIndex return at:', idx1);
console.log('Context (first 400):', JSON.stringify(src.substring(idx1, idx1+400)));
