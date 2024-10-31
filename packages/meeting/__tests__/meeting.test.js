'use strict';

const meeting = require('..');
const assert = require('assert').strict;

assert.strictEqual(meeting(), 'Hello from meeting');
console.info('meeting tests passed');
