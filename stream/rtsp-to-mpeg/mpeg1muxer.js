const { timeToSeconds } = require('../../utils/time');
const {
  genFfmpegFormatConfigs,
  genFfmpegFormatConfigsDownload,
} = require('./configs');
const child_process = require('child_process');
const EventEmitter = require('events');

const { getdb, setdb, defaultWrite } = require('../../resource/mapTable/db');
class Mpeg1Muxer extends EventEmitter {
  constructor(options, clientID, cameraID = -1) {
    super(options);

    this.url = options.url;
    this.port = options.port;
    this.clientID = clientID;
    this.cameraID = cameraID;
    this.time = options.time;
    this.ffmpegPid = null;
    this.ffmpegConfigs = genFfmpegFormatConfigs(
      this.url,
      this.port,
      this.clientID,
      this.cameraID,
      this.time
    );

    this.stream = child_process.spawn('ffmpeg', this.ffmpegConfigs, {
      detached: false,
    });

    let mapInfo = {
      [clientID]: [
        {
          cameraID: this.cameraID,
          ffmpegPid: this.stream.pid,
        },
      ],
    };

    const mapData = getdb('mapData');
    if (!mapData) defaultWrite();

    if (typeof mapData === 'object' && mapData !== null) {
      if (mapData.hasOwnProperty(clientID)) {
        mapData[clientID] = [
          ...mapData[clientID],
          {
            cameraID: this.cameraID,
            ffmpegPid: this.stream.pid,
          },
        ];
      } else {
        mapData[clientID] = mapInfo[clientID];
      }
    } else {
      defaultWrite();
    }
    setdb('mapData', mapData);

    let tableData = [];
    Object.entries(mapData).forEach(([key, value]) => {
      value.forEach((item, index) => {
        tableData.push({
          key,
          cameraID: Number(item.cameraID) || 0,
          isDownload: Number(item.isDownload) || 0,
          ffmpegPid: item.ffmpegPid,
        });
      });
    });
    console.table(tableData);

    this.stream.stdout.on('data', (data) => {
      return this.emit('mpeg1data', data);
    });
    this.stream.stderr.on('data', (data) => {
      return this.emit('ffmpegError', data);
    });
    this.stream.on('close', (code) => {
      // console.log(`code`);
    });
  }
}

class Mpeg1MuxerDownload extends EventEmitter {
  constructor(options, clientID) {
    super(options);
    this.url = options.url;
    this.time = options.time;
    this.output = options.output;
    this.clientID = clientID;
    this.ffmpegPid = null;

    this.ffmpegConfigs = genFfmpegFormatConfigsDownload(
      this.url,
      this.time,
      this.output
    );
    this.stream = child_process.spawn('ffmpeg', this.ffmpegConfigs, {
      detached: false,
    });

    let mapInfo = {
      [clientID]: [
        {
          isDownload: '1',
          ffmpegPid: this.stream.pid,
        },
      ],
    };

    const mapData = getdb('mapData');
    if (!mapData) defaultWrite();
    if (typeof mapData === 'object' && mapData !== null) {
      if (mapData.hasOwnProperty(clientID)) {
        mapData[clientID] = [
          ...mapData[clientID],
          {
            isDownload: '1',
            ffmpegPid: this.stream.pid,
          },
        ];
      } else {
        mapData[clientID] = mapInfo[clientID];
      }
    } else {
      defaultWrite();
    }
    setdb('mapData', mapData);

    let tableData = [];
    Object.entries(mapData).forEach(([key, value]) => {
      value.forEach((item, index) => {
        tableData.push({
          key,
          cameraID: Number(item.cameraID) || 0,
          isDownload: Number(item.isDownload) || 0,
          ffmpegPid: item.ffmpegPid,
        });
      });
    });
    console.table(tableData);

    this.inputStreamStarted = true;
    this.stream.stdout.on('data', (data) => {
      return this.emit('mpeg1data', data);
    });
    this.stream.stderr.on('data', (data) => {
      this.onStderr(data);
      return this.emit('ffmpegError', data);
    });
  }

  onEnd() {
    return new Promise((resolve, reject) => {
      if (!this.stream) {
        reject(new Error('Stream is not initialized.'));
        return;
      }

      const handleClose = (code) => {
        if (code == 0) {
          resolve(true);
        } else if (code == 1) {
          resolve(false);
        }
      };

      const handleError = (err) => {
        reject(err);
      };

      // Add event listeners
      this.stream.on('close', handleClose);
      this.stream.on('error', handleError);

      // Cleanup: remove the event listeners when done
      this.stream.once('close', () => {
        this.stream.removeListener('close', handleClose);
        this.stream.removeListener('error', handleError);
      });
    });
  }

  onStderr(data) {
    const stderr = data.toString();
    if (stderr.includes('time=')) {
      const timeInfo = stderr.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
      if (timeInfo) {
        const currentTime = timeInfo[1];
        return this.emit('progress', timeToSeconds(currentTime));
      }
    }
  }
}

module.exports = { Mpeg1Muxer, Mpeg1MuxerDownload };
