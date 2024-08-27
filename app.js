const express = require('express');
const serveStatic = require('serve-static');
const http = require('http');
const path = require('path');
const cors = require('cors');

const WebSocket = require('ws');

const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const configs = require('./configs/configs');
const { getIpAddress } = require('./utils/getLocalhost');

const app = express();
const port = configs.port;
const server = http.createServer(app);
const ip = getIpAddress();

app.use(
  serveStatic(path.join(__dirname, 'public'), {
    redirect: false,
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// 路由
const videoRouter = require('./routes/video');
app.use('/live', videoRouter);

// ================ server监听 ====================
server.on('request', (req, res) => {
  let params = req.url.slice(1).split('/')[0].split('?');
  if (params[0] == 's1') {
    const urlParams = new URLSearchParams(req.url);
    const clientID = urlParams.get('/s1?clientID');
    const cameraID = urlParams.get('cameraID');
    req.on('data', (data) => {
      wss.sendToClient(clientID, cameraID, data);
    });
    req.on('end', () => {
      console.log('http请求结束');
    });
  }
});

// ================== websocket ==================
const wss = new WebSocket.Server({ server });
let clients = new Map();
wss.connectionCount = 0;
// 向特定客户端发送消息的函数
wss.sendToClient = (clientID, cameraID, data) => {
  const clientInfo = clients.get(clientID);
  if (clientInfo?.cameraID != cameraID) return;
  if (clientInfo && clientInfo.readyState === WebSocket.OPEN) {
    clientInfo.send(data);
  } else {
    clients.delete(clientID);
  }
};
wss.on('connection', (socket, upgradeReq) => {
  wss.connectionCount++;
  // console.log('WebSocket已连接...');
  const urlParams = new URLSearchParams('?' + upgradeReq.url);
  const clientID = urlParams.get('/videoService/clientID');
  const cameraID = urlParams.get('cameraID');
  socket.id = clientID;
  socket.cameraID = cameraID;
  clients.set(clientID, socket);
  socket.on('close', async (code, message) => {
    wss.connectionCount--;
    clients.delete(socket.id);
    // console.log('WebSocket已关闭...');
  });
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({
    status: 500,
    message: err.message,
    error: err,
  });
});

server.listen(port, () => {
  console.log(`http://${ip}:${port}/live`);
});
