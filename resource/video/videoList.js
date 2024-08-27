const { ifSystem } = require('../../utils/operatingSystem');

let videoList;

if (ifSystem() == 'win32') {
  videoList = [
    {
      id: 1,
      value:
        'rtsp://807e9439d5ca.entrypoint.cloud.wowza.com:1935/app-rC94792j/068b9c9a_stream2',
    },
    {
      id: 2,
      value: 'rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream',
    },
  ];
} else if (ifSystem() == 'linux') {
  videoList = [];
}

module.exports = { videoList };
