'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  filepath: process.env.PASSWORDS_FILEPATH || _path2.default.join(__dirname, '..', 'files'),
  filename: process.env.PASSWORDS_FILENAME || '__node-passwords',

  cryptography: {
    algorithm: process.env.CRYPT_ALGORITHM || 'aes-256-ctr',
    password: process.env.CRYPT_SECRET
  }
};