'use strict';

import { readFileSync } from 'fs';
import { join } from 'path';

export default {
  readSecurityFile
}

function readSecurityFile() {
  // Use path.join to create the correct relative path
  const privateKeyPath = join(__dirname, '../tls/private.key');
  try {
    return readFileSync(privateKeyPath, { encoding: 'utf-8' });
  } catch (error) {
    // Handle any errors that might occur during file reading, e.g., the file doesn't exist.
   // console.error('Error reading private.key:', error.message);
    throw Error("Can't read the file private.key" + error.message);
  }
}