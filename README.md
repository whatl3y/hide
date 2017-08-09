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
>npm install -g hide
```

## Config

#### CRYPT_SECRET (required)
The following should be set to control the global
secret that's used with AES-256 to secure the data stored on your machine.

!!!DON'T LOSE/FORGET THIS!!!

```
>export CRYPT_SECRET=[your all time master secret value]
```

#### NODE_HIDE_FILEPATH
Directory where the encrypted file will live -- default: home directory (either process.env.HOME on unix/linux/mac or process.env.USERPROFILE on windows)

```
>export NODE_HIDE_FILEPATH=~
```

#### NODE_HIDE_FILENAME
Name of flat file that holds the encrypted data of your accounts -- default: '\_\_node-hide-accounts'

```
>export NODE_HIDE_FILENAME=my_encrypted_file
```

## Usage

### Add an account

#### Parameters

- -n / --name (REQUIRED): The name of the account you're storing. It can be any alphanumeric characters.
- -u / --username (optional): The username for the account.
- -p / --password (optional): The password for the account.
- -e / --extra (optional): Any additional information you'd like to provide about the account.

```

>hide add -n my_new_account -u myname -p the_secret_password -e "Some extra stuff!!!!"

Successfully added account 'my_new_account'!

```

### Delete an account

#### PARAMETERS
- -i / --uuid: The unique identifier of the account you want to review.

```

>hide delete -i f62d5a21-4119-4a05-bced-0dca8f310d4b

Successfully deleted account with uuid: 'f62d5a21-4119-4a05-bced-0dca8f310d4b'

```

### Update an account

#### Parameters
Either uuid or name are at least required:
- -i / --uuid: The unique identifier of the account you want to review.
- -n / --name: The name of the account you're storing. It can be any alphanumeric characters.

Optional
- -u / --username (optional): The username for the account.
- -p / --password (optional): The password for the account.
- -e / --extra (optional): Any additional information you'd like to provide about the account.

```

>hide update -n facebook.com -u fbuser -p my_password1

Successfully updated account with name: 'facebook.com'!

```

### Search your accounts

#### Parameters

- -s / --search (optional): An optional term to look for accounts based on
a case-insensitive search against the NAME or USERNAME.
NOTE: the `search` command never shows the password for the account. Use `show` to retrieve the password.

```

>hide search

I found the following accounts:
NAME                USERNAME        EXTRA            UUID                                
facebook.com        userna                           def7f984-c2d7-4069-907c-facfad597123
instagram.com       iguser                           def7f984-abc1-1111-2222-facfad597123
2 of 2 total accounts returned

>hide search -s facebook

I found the following accounts:
NAME                USERNAME        EXTRA            UUID                                
facebook.com        userna                           def7f984-c2d7-4069-907c-facfad597123
1 of 2 total accounts returned

```

### Show a single account

#### Parameters
Either uuid or name are at least required:
- -i / --uuid: The unique identifier of the account you want to review.
- -n / --name: The name of the account you're reviewing.

Optional
- -p / --password (optional): Whether to show the password. DEFAULT: false

```

>hide show -i def7f984-c2d7-4069-907c-facfad597123
>hide show -n facebook.com

NAME            USERNAME        EXTRA           UUID                                
facebook.com    fbuser                          f62d5a21-4119-4a05-bced-0dca8f310d4b

>hide show -n facebook.com -p

NAME            USERNAME        PASSWORD        EXTRA           UUID                                
facebook.com    fbuser          my_password1                    f62d5a21-4119-4a05-bced-0dca8f310d4b

```

### Import from a CSV

Note: This requires the CSV have headers that match the following:

name: the account name
username: the username of the account
password: the password of the account
extra: any desired extra information you want to provide

#### Parameters
- -f / --filepath: The full filepath of the CSV that we're importing data from.

```

>hide import -f /Users/yourname/myfile.csv

Successfully added 123 accounts from CSV: /Users/yourname/myfile.csv!

```

## Development

If you want to clone and add/update functionality, you can build
using the following command.

### Build

```
>npm run build
```

### Tests

```
>npm test
```
