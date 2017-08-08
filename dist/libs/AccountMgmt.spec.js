'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _AccountMgmt = require('./AccountMgmt.js');

var _AccountMgmt2 = _interopRequireDefault(_AccountMgmt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('AccountMgmt', function () {
  describe('#createUuid()', function () {
    it(`should create a UUID without error`, () => {
      const newUuid = _AccountMgmt2.default.createUuid();
      _assert2.default.equal(typeof newUuid, 'string');
      _assert2.default.equal(true, newUuid.length > 10);
    });
  });
});