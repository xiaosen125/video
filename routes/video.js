// express资源
const express = require('express');
const router = express.Router();
const path = require('path');

// 工具函数
const { videoStream } = require('../utils/newStream');
const fs = require('fs');

// 时间工具
const moment = require('moment');
moment.locale('zh-cn');

// 视频列表
const { videoList } = require('../resource/video/videoList');
const { HkVideoInit } = require('../utils/getVideoList');
const { timestampTotz, convertTimestamp } = require('../utils/time');
const { Mpeg1MuxerDownload } = require('../stream/rtsp-to-mpeg/mpeg1muxer');
const {
  getdb,
  defaultWrite,
  removeCameraID,
  removeDownload,
  removeCurrentClientID,
} = require('../resource/mapTable/db');
const { getHisUrl } = require('../utils/getHisUrl');
const { killProcessByPid } = require('../utils/killffmpegPid');

// 全局变量
var ipcList = [];
var playStatic;
// 更新播放的记录和进程
async function updateRecord(clientID) {
  const mapData = getdb('mapData');
  if (!mapData) await defaultWrite();
  if (mapData && mapData[clientID] && Array.isArray(mapData[clientID])) {
    const delData = await removeCameraID(clientID);
    delData.forEach(async (item) => {
      await killProcessByPid(item.ffmpegPid);
    });
  }
}

// 更新下载的记录和进程
async function updateDownload(clientID) {
  const mapData = getdb('mapData');
  if (!mapData) await defaultWrite();
  if (mapData && mapData[clientID] && Array.isArray(mapData[clientID])) {
    const delData = await removeDownload(clientID);
    delData.forEach(async (item) => {
      await killProcessByPid(item.ffmpegPid);
    });
  }
}

// 清除当前clientID记录
async function clearCurrentClientID(clientID) {
  const mapData = getdb('mapData');
  if (!mapData) await defaultWrite();
  if (mapData && mapData[clientID] && Array.isArray(mapData[clientID])) {
    const delData = await removeCurrentClientID(clientID);
    delData.forEach(async (item) => {
      await killProcessByPid(item.ffmpegPid);
    });
  }
}

/* 首页 */
router.get('/', async (req, res, next) => {
  try {
    res.status(200).sendFile(path.join(__dirname, '../web/index.html'));
  } catch (err) {
    res.status(500).send({ error: '服务器内部错误：' + err });
  }
});

/* 刷新 */
router.post('/', async (req, res, next) => {
  const { clientID } = req.body;
  try {
    clearCurrentClientID(clientID);
    res.status(200).send({
      code: 200,
      msg: '执行成功',
    });
  } catch (err) {
    res.status(500).send({ error: '服务器内部错误：' + err });
  }
});

// /* 摄像头列表接口 */
router.post('/ipcList', (req, res) => {
  try {
    ipcList = HkVideoInit(videoList);
    res.status(200).send(ipcList);
  } catch (err) {
    res.status(500).send({ error: '服务器内部错误：' + err });
  }
});

/* 播放实时监控 */
router.post('/play', async (req, res, next) => {
  const { clientID, cameraID } = req.body;
  try {
    await updateRecord(clientID);
    // 启动新进程
    ipcList.forEach(async (item) => {
      if (item.id == cameraID) {
        playStatic = await videoStream(item.rtsp, clientID, cameraID);
        playStatic.startTransCodo();
      }
    });

    res.status(200).send({ cameraID });
  } catch (error) {
    res.status(500).send({ error: '内部服务器错误' + error });
  }
});

/* 播放监控回放 */
router.post('/getHis', async (req, res) => {
  const {
    channel,
    startTimestamp,
    endTimestamp,
    cameraIP,
    clientID,
    cameraID,
  } = req.body;
  if (!startTimestamp || !endTimestamp || !channel || !cameraIP) {
    return res.status(400).send({ error: '时间、通道和摄像机不能为空' });
  }
  if (startTimestamp >= endTimestamp) {
    return res.status(400).send({ error: '开始时间不能大于或等于结束时间' });
  }
  let timeDiff = convertTimestamp(endTimestamp - startTimestamp);
  let startTime = timestampTotz(startTimestamp);
  let endTime = timestampTotz(endTimestamp);
  // 自己的rtsp回放地址
  // const hisRtsp = `rtsp://账号:密码@${cameraIP}:554/Streaming/tracks/10${channel}?starttime=${startTime}&endtime=${endTime}`;
  const hisRtsp = '';
  try {
    await updateRecord(clientID);
    if (!hisRtsp) throw new Error('hisRtsp 不能为空，请检查 RTSP 地址');
    // 启动新进程
    playStatic = await videoStream(hisRtsp, clientID, cameraID, timeDiff);
    playStatic.startTransCodo();
    res.status(200).send({
      name: cameraIP,
      type: '',
      channel,
      startTime,
      endTime,
      rtsp: hisRtsp,
    });
  } catch (e) {
    res.status(500).send({ error: '服务器内部错误：' + e });
  }
});

// 下载回放
router.post('/download', async (req, res) => {
  const { cameraIP, channel, startTimestamp, endTimestamp, clientID } =
    req.body;
  // 下载的逻辑
  if (!startTimestamp || !endTimestamp || !channel || !cameraIP) {
    return res.status(400).send({ error: '时间、通道和摄像机不能为空' });
  }
  if (startTimestamp >= endTimestamp) {
    return res.status(400).send({ error: '开始时间不能大于或等于结束时间' });
  }
  try {
    let timeDiff = convertTimestamp(endTimestamp - startTimestamp);
    let startTime = timestampTotz(startTimestamp);
    let endTime = timestampTotz(endTimestamp);
    // 自己的rtsp下载地址
    // const rtspUrl =  `rtsp://账号:密码@${cameraIP}:554/Streaming/tracks/10${channel}?starttime=${startTime}&endtime=${endTime}`;
    const rtspUrl = '';
    await updateDownload(clientID);
    if (!rtspUrl) throw new Error('rtspUrl 不能为空，请检查 RTSP 地址');
    const st = new Mpeg1MuxerDownload(
      { url: rtspUrl, time: timeDiff },
      clientID
    );
    console.log(`准备开始下载(${timeDiff}s)...`);
    st.on('progress', (data) => {
      console.log(data);
    });
    const codeEnd = await st.onEnd();
    if (codeEnd) {
      const filePath = path.join(__dirname, '../public', 'live', 'video.mp4');
      const fileStream = fs.createReadStream(filePath);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
      fileStream.pipe(res);
    } else {
      res.status(200).send({ code: 200, msg: '取消下载' });
    }
  } catch (err) {
    res.status(500).send({ error: '服务器内部错误：' + err });
  }
});

// 终止下载回放
router.post('/downloadEnd', async (req, res) => {
  const { clientID } = req.body;
  try {
    await updateDownload(clientID);
    res.status(200).send({ code: 200, msg: '终止成功' });
  } catch (err) {
    res.status(500).send({ error: '服务器内部错误：' + err });
  }
});

// 关闭页面
router.post('/close', async (req, res) => {
  const { clientID } = req.body;
  try {
    clearCurrentClientID(clientID);
    res.status(200).send({ code: 200, msg: '关闭成功' });
  } catch (err) {
    res.status(500).send({ error: '服务器内部错误：' + err });
  }
});

module.exports = router;
