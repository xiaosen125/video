// 时间格式转换
function timestampTotz(timestampMs) {
  var date = new Date(Number(timestampMs));
  var chinaTime = new Date(date.getTime());

  var year = chinaTime.getFullYear();
  var month = ('0' + (chinaTime.getMonth() + 1)).slice(-2);
  var day = ('0' + chinaTime.getDate()).slice(-2);
  var hours = ('0' + chinaTime.getHours()).slice(-2);
  var minutes = ('0' + chinaTime.getMinutes()).slice(-2);
  var seconds = ('0' + chinaTime.getSeconds()).slice(-2);

  var formattedTime =
    year + month + day + 't' + hours + minutes + seconds + 'z';

  return formattedTime;
}

//
function timeToSeconds(timeStr) {
  const [hours, minutes, secondsWithMs] = timeStr.split(':');
  const [seconds, milliseconds] = secondsWithMs.split('.');
  const totalSeconds =
    parseInt(hours, 10) * 3600 +
    parseInt(minutes, 10) * 60 +
    parseInt(seconds, 10) +
    parseInt(milliseconds, 10) / 1000;
  return totalSeconds;
}

function convertTimestamp(timestamp, unit = 'milliseconds') {
  switch (unit) {
    case 'milliseconds':
      return timestamp / 1000;
    case 'seconds':
      return timestamp;
    case 'minutes':
      return timestamp * 60;
    case 'hours':
      return timestamp * 60 * 60;
    default:
      throw new Error('Unsupported time unit');
  }
}

module.exports = {
  timestampTotz,
  timeToSeconds,
  convertTimestamp,
};
