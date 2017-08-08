'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _Encryption = require('./Encryption');

var _Encryption2 = _interopRequireDefault(_Encryption);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mkdirPromise = _util2.default.promisify(_fs2.default.mkdir);
const writeFilePromise = _util2.default.promisify(_fs2.default.writeFile);
const readFilePromise = _util2.default.promisify(_fs2.default.readFile);

const encryption = (0, _Encryption2.default)();

exports.default = {
  filepath: _path2.default.join(_config2.default.filepath, _config2.default.filename),

  async getAndDecryptFlatFile() {
    if (this.doesDirectoryExist(_config2.default.filepath)) {
      if (this.doesFileExist(this.filepath)) {
        const rawFileData = await readFilePromise(this.filepath);
        if (rawFileData.length === 0) return null;else {
          const inflatedString = await encryption.parseData(rawFileData.toString('utf8'), false);
          return JSON.parse(encryption.decrypt(inflatedString.toString('utf8')));
        }
      } else {
        await writeFilePromise(this.filepath, '');
        return null;
      }
    }

    await mkdirPromise(_config2.default.filepath);
    await writeFilePromise(this.filepath, '');
    return '';
  },

  async writeObjToFile(obj, origObj = {}) {
    const newObj = Object.assign(obj, origObj);
    const encryptedString = encryption.encrypt(JSON.stringify(newObj));
    const deflatedString = await encryption.parseData(encryptedString);
    return await writeFilePromise(this.filepath, deflatedString);
  },

  doesDirectoryExist(dirPath) {
    try {
      const exists = _fs2.default.statSync(dirPath).isDirectory();
      return exists;
    } catch (e) {
      return false;
    }
  },

  doesFileExist(filePath) {
    try {
      const exists = _fs2.default.statSync(filePath).isFile();
      return exists;
    } catch (e) {
      return false;
    }
  }
};