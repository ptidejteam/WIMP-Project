'use strict';

const status = require('..');
const assert = require('assert').strict;

assert.strictEqual(status(), 'Hello from status');
console.info('status tests passed');
