const { getIpAddress } = require('../utils/getLocalhost');
// localhost configs
const port = '8080';
const ip = getIpAddress();
module.exports = {
  ip,
  port,
};
