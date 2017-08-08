# hide

CLI utility to store and retrieve account information securely on your machine.

## Description

This is a CLI utility that can be used to store your account information,
including websites, usernames, passwords, and additional info, securely using
AES-256 bit encryption using a master secret that you configure.

## Why?

I've previously used Last Pass to securely store passwords for me within the
context of a browser extension, and it worked decent. The problem is I not only
have a ton of accounts with different passwords that I like to see,
but I'm a developer so basically always live in a terminal window.
This tool gives me the freedom to retrieve a username and/or password (among other information)
about an account with a single command, and store it on my machine using AES-256
bit encryption with a password I set.

## Install

```
>npm install -g pw
```

## Config

The following environment variables can be used to configure
how and where passwords are stored.

The only required environment variables

```js
// REQUIRED
// The "master" secret used to encrypt the flat file with
// all your accounts and passwords.
// !!!Make sure you don't lose this, or you can't decrypt your accounts!!!
process.env.CRYPT_SECRET

// optional
// The cipher to use to encrypt the accounts flat file
// https://nodejs.org/api/crypto.html#crypto_crypto_getciphers
// default: 'aes-256-ctr'
process.env.CRYPT_ALGORITHM

// optional
// The filepath on your machine where the encrypted flat files that
// store your information will reside.
// default: ./files
process.env.PASSWORDS_FILEPATH

// optional
// The name of the file on your machine where the encrypted flat files that
// store your information will reside.
// NOTE: this is only the filename and NOT the full path (path.join is
// used to build the full path using PASSWORDS_FILEPATH + PASSWORDS_FILENAME)
// default: __node-passwords
process.env.PASSWORDS_FILENAME
```

## Usage

### Add an account

#### Parameters

1. -n / --name (REQUIRED): The name of the account you're storing. It can be any alphanumeric characters.
2. -u / --username (optional): The username for the account.
3. -p / --password (optional): The password for the account.
4. -e / --extra (optional): Any additional information you'd like to provide about the account.

```
>hide add -n my_new_account -u myname -p the_secret_password -e "Some extra stuff!!!!"

Successfully added account 'my_new_account'!
```

### Update an account

### Search your accounts

#### Parameters

1. -s / --search (optional): An optional term to look for accounts based on
a case-insensitive search against the NAME or USERNAME.
NOTE: the `search` command never shows the password for the account. Use `show` to retrieve the password.

```
>hide search
I found the following accounts:
NAME                USERNAME        EXTRA            UUID                                
facebook.com        userna                           def7f984-c2d7-4069-907c-facfad597123
instagram.com       iguser                           def7f984-abc1-1111-2222-facfad597123
1 of 2 total accounts returned

>hide search [[-s or --search] term]
I found the following accounts:
NAME                USERNAME        EXTRA            UUID                                
facebook.com        userna                           def7f984-c2d7-4069-907c-facfad597123
1 of 2 total accounts returned
```

### Show information about a single account

## Development

If you want to clone and add/update functionality, you can build
using the following command.

### Build

Building the files requires gulp.

```
>npm run build
```

### Tests

```
>npm test
```
