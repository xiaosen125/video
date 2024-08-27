const os = require('os');

function getIpAddress() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      const { address, family, internal } = interface;
      if (family === 'IPv4' && !internal) {
        return address;
      }
    }
  }

  return null; // 如果没有找到合适的 IP 地址，返回 null
}

module.exports = { getIpAddress };
