'use strict';

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _AccountMgmt = require('./libs/AccountMgmt');

var _AccountMgmt2 = _interopRequireDefault(_AccountMgmt);

var _FileHandler = require('./libs/FileHandler');

var _FileHandler2 = _interopRequireDefault(_FileHandler);

var _Vomit = require('./libs/Vomit');

var _Vomit2 = _interopRequireDefault(_Vomit);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Ex. >node dist/index search -s my_search_string
const argv = (0, _minimist2.default)(process.argv.slice(2));
const [command] = argv._;

// we want to enforce CRYPT_SECRET to be set manually
if (!_config2.default.cryptography.password) {
  _Vomit2.default.noCryptSecret();
  process.exit();
}

;(async () => {
  try {
    // common command line parameters
    const name = argv.n || argv.name;
    const password = argv.p || argv.password;
    const uid = argv.u || argv.uuid;

    switch (command) {
      case 'add':
        const username = argv.u || argv.username;
        const extra = argv.e || argv.extra;

        if (!name) return _Vomit2.default.error('An account name (-n or --name) parameter is a required at a minimum to add a new account.');

        await _AccountMgmt2.default.addAccount(name, username, password, extra);
        _Vomit2.default.success(`Successfully added account '${name}'!`);

        break;

      case 'delete':
        if (!uid) return _Vomit2.default.error('A uuid (-u or --uuid) is a required to delete an account.');

        const result = await _AccountMgmt2.default.deleteAccountByUuid(uid);
        if (result) _Vomit2.default.success(`Successfully deleted account with uuid: '${uid}'`);else _Vomit2.default.error(`We didn't find an account with uuid: '${uid}'`);

        break;

      case 'search':
        const searchString = argv.s;
        const info = await _AccountMgmt2.default.searchForAccountsByName(searchString);
        _Vomit2.default.listAccounts(info.matches, info.total);
        break;

      case 'show':
        if (uid) {
          const account = await _AccountMgmt2.default.findAccountByUuid(uid);
          if (account) {
            if (!password) delete account.password;
            _Vomit2.default.listSingleAccount(account);
          } else {
            _Vomit2.default.error(`We didn't find an account with uuid: ${uid}`);
          }
        } else if (name) {
          const account = await _AccountMgmt2.default.findAccountByName(name);
          if (account) {
            if (!password) delete account.password;
            _Vomit2.default.listSingleAccount(account);
          } else {
            _Vomit2.default.error(`We didn't find an account with name: ${name}`);
          }
        } else {
          return _Vomit2.default.error('Either a name (-n or --name) or uuid (-u or --uuid) parameter is a required at a minimum to show the details for an account.');
        }

        break;

      case 'update':

        break;
    }

    process.exit();
  } catch (err) {
    if (typeof err === 'string') _Vomit2.default.error(err);else console.error(err);
    process.exit();
  }
})();