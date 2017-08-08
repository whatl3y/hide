'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _csv = require('csv');

var _csv2 = _interopRequireDefault(_csv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  csv(filepath) {
    return new Promise((resolve, reject) => {
      const parser = _csv2.default.parse({ columns: true }, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
      _fs2.default.createReadStream(filepath).pipe(parser);
    });
  }
};