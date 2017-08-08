'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _Encryption = require('./Encryption.js');

var _Encryption2 = _interopRequireDefault(_Encryption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Encryption', function () {
  const enc = (0, _Encryption2.default)({ secret: 'abc123' });
  const originalText = 'test123';
  let cipherText;
  let plainText;
  let hash;

  describe('#encrypt()', function () {
    it(`should encrypt string without issue`, () => {
      cipherText = enc.encrypt(originalText);
      _assert2.default.equal(typeof cipherText, 'string');
    });
  });

  describe('#decrypt()', function () {
    it(`should decrypt cipher string without issue`, () => {
      plainText = enc.decrypt(cipherText);
      _assert2.default.equal(typeof plainText, 'string');
      _assert2.default.equal(plainText, originalText);
    });
  });

  describe('#stringToHash()', function () {
    it(`should hash string without issue`, () => {
      hash = enc.stringToHash(plainText);
      _assert2.default.equal(typeof hash, 'string');
    });
  });

  describe('#fileToHash()', function () {
    it(`should hash file contents without errors`, async () => {
      await enc.fileToHash(_path2.default.join(__dirname, 'Encryption.js'));
    });
  });

  describe('#hashPassword() and #comparePassword()', function () {
    let plainPassword = 'test123';
    let hashedPassword;

    it(`hashPassword should hash a password as expected`, async () => {
      hashedPassword = await enc.hashPassword(plainPassword);
      _assert2.default.equal(true, plainPassword != hashedPassword);
      _assert2.default.equal(true, hashedPassword.length > 0);
    });

    it(`comparePassword should compare hash with plain password correctly`, async () => {
      const matches = await enc.comparePassword(plainPassword, hashedPassword);
      _assert2.default.equal(true, matches);
    });
  });

  describe(`#parseData()`, () => {
    const key = 'test_compress_1';

    it('should be a valid base64 string on deflate, then be a valid Buffer and the correct value on inflate', async () => {
      const base64string = await enc.parseData('lance123');
      const buff = await enc.parseData(base64string, false);
      const lance123 = buff.toString();

      _assert2.default.equal(true, typeof base64string === 'string');
      _assert2.default.equal(true, buff instanceof Buffer);
      _assert2.default.equal('lance123', lance123);
    });
  });
});