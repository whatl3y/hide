'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _FileHandler = require('./FileHandler');

var _FileHandler2 = _interopRequireDefault(_FileHandler);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  createUuid() {
    return (0, _v2.default)();
  },

  async addAccount(name, username, password, extraInfo = "") {
    const newAccount = {
      [this.createUuid()]: {
        name: name,
        username: username || '',
        password: password || '',
        extra: extraInfo || ''
      }
    };

    const rawAccountInfo = await _FileHandler2.default.getAndDecryptFlatFile();
    return await _FileHandler2.default.writeObjToFile(newAccount, rawAccountInfo || {});
  },

  async deleteAccountByUuid(uid) {
    let rawAccountInfo = await _FileHandler2.default.getAndDecryptFlatFile();
    if (!(rawAccountInfo && rawAccountInfo[uid])) return false;

    delete rawAccountInfo[uid];
    await _FileHandler2.default.writeObjToFile({}, rawAccountInfo);
    return true;
  },

  async findAccountByUuid(uid) {
    const currentAccounts = await _FileHandler2.default.getAndDecryptFlatFile();
    if (!(currentAccounts && currentAccounts[uid])) return false;
    return Object.assign(currentAccounts[uid], { uuid: uid });
  },

  async findAccountByName(name) {
    const currentAccounts = await _FileHandler2.default.getAndDecryptFlatFile();
    if (!currentAccounts) return false;

    const matchingUuid = Object.keys(currentAccounts).filter(uuid => currentAccounts[uuid].name.toLowerCase() == name.toLowerCase())[0];

    if (!matchingUuid) return false;
    return Object.assign(currentAccounts[matchingUuid], { uuid: matchingUuid });
  },

  async searchForAccountsByName(searchString = null) {
    const currentAccounts = await _FileHandler2.default.getAndDecryptFlatFile();
    if (!currentAccounts) {
      return {
        matches: [],
        total: 0
      };
    }

    const uuids = Object.keys(currentAccounts);
    const totalNumAccounts = uuids.length;
    const matchingAccounts = uuids.map(uuid => {
      const account = currentAccounts[uuid];
      if (!account) return null;
      if (searchString) {
        const searchRegexp = new RegExp(searchString, 'i');
        const nameMatches = account.name && searchRegexp.test(account.name);
        const usernameMatches = account.username && searchRegexp.test(account.username);
        if (nameMatches || usernameMatches) return Object.assign(account, { uuid: uuid });
        return null;
      }
      return Object.assign(account, { uuid: uuid });
    }).filter(info => !!info);

    return {
      matches: matchingAccounts,
      total: totalNumAccounts
    };
  },

  searchForAccountsByUsername(searchString) {}
};