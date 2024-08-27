const EventEmitter = require('events');
const { Mpeg1Muxer } = require('../rtsp-to-mpeg/mpeg1muxer');

class VideoStream extends EventEmitter {
  constructor(options, clientID, cameraID) {
    super(options);
    this.name = options.name;
    this.url = options.url;
    this.port = options.port;
    this.time = options.time;
    this.width = options.width;
    this.height = options.height;
    this.stream = 0;
    this.clientID = clientID;
    this.cameraID = cameraID;
    this.mpeg1Muxer = null;
  }

  // 开始转码
  startTransCodo() {
    this.mpeg1Muxer = new Mpeg1Muxer(
      { url: this.url, port: this.port, time: this.time },
      this.clientID,
      this.cameraID
    );

    let gettingInputData = false;
    let gettingOutputData = false;
    let inputData = [];
    let outputData = [];

    // this.mpeg1Muxer.on('mpeg1data', (data) => { return this.emit('camdata', data) })
    this.mpeg1Muxer.on('ffmpegError', (data) => {
      data = data.toString();
      if (data.indexOf('Input #') !== -1) {
        gettingInputData = true;
      }
      if (data.indexOf('Output #') !== -1) {
        gettingInputData = false;
        gettingOutputData = true;
      }
      if (data.indexOf('frame') === 0) {
        gettingOutputData = false;
      }
      if (gettingInputData) {
        inputData.push(data.toString());
        let size = data.match(/\d+x\d+/);
        if (size != null) {
          size = size[0].split('x');
          if (this.width == null) {
            this.width = parseInt(size[0], 10);
          }
          if (this.height == null) {
            return (this.height = parseInt(size[1], 10));
          }
        }
      }
    });
    this.mpeg1Muxer.on('ffmpegError', (data) => {
      return;
      //return global.process.stderr.write(data);
    });

    return this;
  }

  //停止转码
  // async stopTransCodo() {}
}

module.exports = VideoStream;
