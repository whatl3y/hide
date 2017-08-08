'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Encryption;

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Encryption(options = {}) {
  return {
    _algorithm: options.algorithm || _config2.default.cryptography.algorithm,
    _secret: options.secret || _config2.default.cryptography.password,

    encrypt(text) {
      const cipher = _crypto2.default.createCipher(this._algorithm, this._secret);
      let crypted = cipher.update(text, 'utf8', 'hex');
      crypted += cipher.final('hex');
      return crypted;
    },

    decrypt(text) {
      const decipher = _crypto2.default.createDecipher(this._algorithm, this._secret);
      let dec = decipher.update(text, 'hex', 'utf8');
      dec += decipher.final('utf8');
      return dec;
    },

    stringToHash(string) {
      const md5Sum = _crypto2.default.createHash("md5");
      md5Sum.update(string);
      return md5Sum.digest("hex");
    },

    fileToHash(filePath) {
      return new Promise((resolve, reject) => {
        const md5Sum = _crypto2.default.createHash("md5");

        const s = _fs2.default.ReadStream(filePath);
        s.on("data", data => md5Sum.update(data));
        s.on("error", reject);
        s.on("end", () => resolve(md5Sum.digest("hex")));
      });
    },

    hashPassword(plainPassword, saltRounds = 10) {
      return _bcrypt2.default.hash(plainPassword, saltRounds);
    },

    comparePassword(plainPassword, hashedPassword) {
      return _bcrypt2.default.compare(plainPassword, hashedPassword);
    },

    // Handles any gzip/deflating/inflating we might be doing to data
    // we're passing to and from Redis.
    // NOTE: if inflating, we will always return a raw Buffer. If deflating,
    // we return a base64 encoded string.
    async parseData(value, isRawData = true) {
      const inflate = _util2.default.promisify(_zlib2.default.inflate);
      const deflate = _util2.default.promisify(_zlib2.default.deflate);

      let returnValue;
      switch (isRawData) {
        case false:
          return await inflate(new Buffer(value, 'base64'));

        default:
          //true
          const compressedValue = await deflate(value);
          return new Buffer(compressedValue).toString('base64');
      }
    }
  };
}