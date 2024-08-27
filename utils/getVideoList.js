// 摄像头资源

let videoList = [];
// Hk摄像头资源列表
function HkVideoInit(vList) {
  videoList = [];

  vList.forEach((item, index) => {
    try {
      // 确保item.value存在且为字符串
      if (typeof item.value !== 'string') {
        throw new Error('无效的摄像头资源');
      }

      let data = {
        id: item.id,
        rtsp: item.value,
        cameraIp: '',
        name: item.id,
        channel: '',
        type: '测试' + item.id,
        coverSrc: '',
      };
      videoList.push(data);
    } catch (error) {
      console.error(`摄像头资源列表转换错误 ${index}: ${error.message}`);
    }
  });

  return videoList;
}

module.exports = {
  HkVideoInit,
};
