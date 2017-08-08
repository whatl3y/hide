# Passwords (pw)

## Install

```
>npm install -g pw
```

## Config

The following environment variables can be used to configure
how and where passwords are stored.

```js
// The cipher to use to encrypt the accounts flat file
// default: 'aes-256-ctr'
// https://nodejs.org/api/crypto.html#crypto_crypto_getciphers
process.env.CRYPT_ALGORITHM

// The "master" secret used to encrypt the flat file with
// all your accounts and passwords.
// !!!Make sure you don't lose this, or you can't decrypt your accounts!!!
process.env.CRYPT_SECRET

// The filepath on your machine where the encrypted flat files that
// store your information will reside.
// default: ./files
process.env.PASSWORDS_FILEPATH
```

## Usage

```
>pw -s facebook
// uuid: abc123
// account: facebook.com
// username: youremail@acme.com
```

## Development

If you want to clone and add/update functionality, you can build
using the following command.

### Build

```
>gulp build
```
