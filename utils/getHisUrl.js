// hisRtsp = `rtsp://admin:${password}@${cameraIP}:554/Streaming/tracks/${channel}01?starttime=${startTime}%26endtime=${endTime}`;
function getHisUrl(cameraIP, channel, startTime, endTime) {
  // 参数验证
  if (
    typeof channel !== 'string' ||
    typeof startTime !== 'string' ||
    typeof endTime !== 'string'
  ) {
    throw new Error('Invalid parameters');
  }

  // 安全地获取密码
  const passwords = {
    '10.100.39.252': 'fff112233',
    '10.100.41.252': 'fff112233',
    '192.168.0.242': 'fff12345',
    // '192.168.0.120': 'fff12345',
  };

  // 构建 URL
  let user = 'admin';
  let psw;

  switch (cameraIP) {
    case '10.100.39.252':
      psw = passwords[cameraIP];
      break;
    case '10.100.41.252':
      psw = passwords[cameraIP];
      break;
    case '192.168.0.242':
      psw = passwords[cameraIP];
      break;
    default:
      console.log('hisUrl获取错误');
  }

  // 构建完整的 URL
  const hisRtsp = `rtsp://${user}:${encodeURIComponent(
    psw
  )}@${cameraIP}:554/Streaming/tracks/${channel}01?starttime=${encodeURIComponent(
    startTime
  )}&endtime=${encodeURIComponent(endTime)}`;

  return {
    cameraIP,
    user,
    psw,
    channel,
    startTime,
    endTime,
    hisRtsp,
  };
}

module.exports = { getHisUrl };
