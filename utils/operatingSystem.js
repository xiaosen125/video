const os = require('os');

function ifSystem() {
  if (os.platform() == 'win32') {
    return 'win32';
  } else if (os.platform() == 'linux') {
    return 'linux';
  } else {
    return 'mac';
  }
}

module.exports = { ifSystem };
