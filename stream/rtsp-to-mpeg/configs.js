const path = require('path');

const genFfmpegFormatConfigs = (url, port, clientID, cameraID, time = null) => {
  const realConfigs = [
    '-rtsp_transport',
    'tcp',
    '-i',
    url,
    '-an',
    '-f',
    'mpegts',
    '-codec:v',
    'mpeg1video',
    '-b:v',
    '800k',
    '-r',
    '30',
    '-muxdelay',
    '0.4',
    '-copyts',
    `http://127.0.0.1:${port}/s1?clientID=${clientID}&cameraID=${cameraID}`,
  ];

  const historyConfigs = [
    '-rtsp_transport',
    'tcp',
    '-t',
    `${time}`,
    '-i',
    url,
    '-an',
    '-f',
    'mpegts',
    '-codec:v',
    'mpeg1video',
    '-b:v',
    '800k',
    '-r',
    '30',
    '-muxdelay',
    '0.4',
    '-copyts',
    `http://127.0.0.1:${port}/s1?clientID=${clientID}&cameraID=${cameraID}`,
  ];

  return time ? historyConfigs : realConfigs;
};
const mp4Path = path.join(__dirname, '../../public', 'live');
const genFfmpegFormatConfigsDownload = (
  url,
  time = 60,
  output = `${mp4Path}/video.mp4`
) => [
  '-rtsp_transport',
  'tcp',
  '-y',
  '-t',
  `${time}`,
  '-i',
  url,
  '-an',
  '-f',
  'mpegts',
  '-codec:v',
  'mpeg1video',
  '-b:v',
  '800k',
  '-r',
  '30',
  '-muxdelay',
  '0.4',
  '-copyts',
  `${output}`,
];

module.exports = { genFfmpegFormatConfigs, genFfmpegFormatConfigsDownload };
