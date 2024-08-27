const _ = require('lodash');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('resource/mapTable/map.json');
const db = low(adapter);

function defaultWrite() {
  const res = db.defaults({ mapData: {} }).write();
  return res;
}

function getdb(key) {
  const res = db.get(key).value();
  return res;
}

function setdb(key, value) {
  const res = db.set(key, value).write();
  return res;
}

// 没有使用
function removeByCameraID(clientID) {
  // clientData.forEach((item) => {
  //   if (item.cameraID === cameraID) {
  //     delData = clientData.splice(clientData.indexOf(item), 1);
  //   }
  // });
  // mapData.set(clientID, clientData).write();
  // return delData[0];
  const mapData = db.get('mapData');
  const clientData = mapData.get(clientID).value();
  const hasDownloadData = clientData.filter(
    (item) => !item.hasOwnProperty('cameraID')
  );
  const hasCameraIDData = clientData.filter((item) =>
    item.hasOwnProperty('cameraID')
  );
  clientData.splice(0, clientData.length, ...hasDownloadData);
  mapData.set(clientID, clientData).write();
  return hasCameraIDData;
}

function removeCameraID(clientID) {
  const mapData = db.get('mapData');
  const clientData = mapData.get(clientID).value();
  const hasDownloadData = clientData.filter(
    (item) => !item.hasOwnProperty('cameraID')
  );
  const hasCameraIDData = clientData.filter((item) =>
    item.hasOwnProperty('cameraID')
  );
  clientData.splice(0, clientData.length, ...hasDownloadData);
  mapData.set(clientID, clientData).write();
  return hasCameraIDData;
}

function removeDownload(clientID) {
  const mapData = db.get('mapData');
  const clientData = mapData.get(clientID).value();
  // console.log('clientData------>', clientData);
  const hasDownloadData = clientData.filter(
    (item) => !item.hasOwnProperty('cameraID')
  );
  const hasCameraIDData = clientData.filter((item) =>
    item.hasOwnProperty('cameraID')
  );
  clientData.splice(0, clientData.length, ...hasCameraIDData);
  mapData.set(clientID, clientData).write();
  // console.log('hasCameraIDData--->', hasCameraIDData);
  return hasDownloadData;
}

function removeCurrentClientID(clientID) {
  const mapData = db.get('mapData');
  const clientData = mapData.get(clientID).value();
  const cameraIDData = clientData.splice(0, clientData.length);
  db.get('mapData').unset(clientID).write();
  return cameraIDData;
}

function removeByClientID(clientID) {
  const res = db.get('mapData').unset(clientID).write();
  return res;
}

module.exports = {
  defaultWrite,
  getdb,
  setdb,
  removeByCameraID,
  removeCurrentClientID,
  removeByClientID,
  removeCameraID,
  removeDownload,
};
