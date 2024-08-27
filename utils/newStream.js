const configs = require('../configs/configs');
const VideoStream = require('../stream/stream/videoStream');

function videoStream(rtspUrl, clientID, cameraID, time) {
  const options = {
    url: rtspUrl,
    port: configs.port,
    time,
  };

  return new VideoStream(options, clientID, cameraID);
}

module.exports = { videoStream };
