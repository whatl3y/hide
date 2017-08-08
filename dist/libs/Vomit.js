'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _columnify = require('columnify');

var _columnify2 = _interopRequireDefault(_columnify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NOOP = () => {};

exports.default = {
  noCryptSecret() {
    this.wrapInNewlines(() => {
      console.log(`You don't have environment variable CRYPT_SECRET set.`.red);
      console.log(`>export CRYPT_SECRET=[your all time master secret value]`.green);
    });
  },

  listSingleAccount(accountRecord) {
    this.wrapInNewlines(() => console.log(this.columnify([accountRecord]).green));
  },

  listAccounts(accountsAry = [], totalNumAccounts = 0) {
    const accounts = accountsAry.map(a => {
      if (typeof a === 'string') return { name: a };

      delete a.password;
      return a;
    });

    this.wrapInNewlines(() => {
      console.log("I found the following accounts:".blue);
      console.log(this.columnify(accounts).green);
      console.log(`${accountsAry.length} of ${totalNumAccounts} total accounts returned`.blue);
    });
  },

  success(string) {
    this.wrapInNewlines(() => console.log(string.green));
  },

  error(string) {
    this.wrapInNewlines(() => console.log(string.red));
  },

  wrapInNewlines(functionToWriteMoreOutput = NOOP, howMany = 1) {
    const newlineString = new Array(howMany - 1).fill('\n').join('');
    if (howMany > 0) console.log(newlineString);
    functionToWriteMoreOutput();
    if (howMany > 0) console.log(newlineString);
  },

  columnify(data) {
    return (0, _columnify2.default)(data, {
      minWidth: 15
    });
  }
};