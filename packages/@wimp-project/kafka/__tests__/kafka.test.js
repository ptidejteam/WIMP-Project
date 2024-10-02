'use strict';

const kafka = require('..');
const assert = require('assert').strict;

assert.strictEqual(kafka(), 'Hello from kafka');
console.info('kafka tests passed');
