#!/usr/bin/env node

import minimist from 'minimist'
import fs from 'fs'
import path from 'path'
import AccountMgmt from './libs/AccountMgmt.ts'
import Encryption from './libs/Encryption.ts'
import FileHandler from './libs/FileHandler.ts'
import Import from './libs/Import.ts'
import Readline from './libs/Readline.ts'
import Vomit from './libs/Vomit.ts'
import config from './config.ts'

const writeFile = fs.promises.writeFile

// treat all values as strings so minimist doesn't coerce numeric-looking
// values to numbers (destroying leading zeros) or value-less flags to
// booleans. A value-less flag (e.g. `hide add -n`) becomes '' instead of
// true so the required-parameter guards below catch it.
const argv = minimist(process.argv.slice(2), {
  string: [
    '_',
    'n',
    'name',
    'u',
    'username',
    'p',
    'password',
    'e',
    'extra',
    't',
    'text',
    'f',
    'file',
    'i',
    'id',
    'uuid',
    's',
    'search',
    'filepath',
  ],
})
const [command, second] = argv._

// we want to enforce CRYPT_SECRET to be set manually
if (!config.cryptography.password && !['file', 'version'].includes(command)) {
  Vomit.noCryptSecret()
  process.exit()
}

;(async () => {
  try {
    // minimist returns an array when a flag is repeated (e.g. `-p a -p b`);
    // take the last occurrence so a single string flows downstream
    const lastValue = (val: any) =>
      Array.isArray(val) ? val[val.length - 1] : val

    const extra = lastValue(argv.e || argv.extra)
    const name = lastValue(argv.n || argv.name)
    // don't use `||` here: a value-less `-p` parses as '' and needs to
    // survive so `show` can treat it as the "reveal password" flag
    const password = lastValue(
      argv.p === undefined ? argv.password : argv.p
    )
    const uid = lastValue(argv.i || argv.id || argv.uuid)
    const username = lastValue(argv.u || argv.username)

    // encryption/decryption methods
    const text = lastValue(argv.t || argv.text)
    const file = lastValue(argv.f || argv.file)

    const encryption = Encryption()
    const fullPath = path.join(config.filepath, config.filename)

    switch (command) {
      case 'file':
        Vomit.twoLinesDifferentColors(
          `Your encrypted file is in the following location:`,
          fullPath,
          'blue',
          'green'
        )
        break

      case 'version':
        const packageJson = JSON.parse(
          await fs.promises.readFile(
            new URL('../package.json', import.meta.url),
            'utf8'
          )
        )
        Vomit.success(packageJson.version, false)
        break

      case 'add':
        const accountName = name || second
        if (!accountName)
          return Vomit.error(
            'An account name (-n or --name) parameter is a required at a minimum to add a new account.'
          )

        await AccountMgmt.addAccount(accountName, username, password, extra)
        Vomit.success(`Successfully added account '${accountName}'!`)

        break

      case 'delete':
        if (!uid)
          return Vomit.error(
            'A uuid (-i or --id or --uuid) is a required to delete an account.'
          )

        const result = await AccountMgmt.deleteAccountByUuid(uid)
        if (result)
          return Vomit.success(
            `Successfully deleted account with uuid: '${uid}'`
          )

        Vomit.error(`We didn't find an account with uuid: '${uid}'`)

        break

      case 'search':
        const searchString = lastValue(argv.s || argv.search) || second
        // reveal passwords in the results with a value-less `-p`/`--password`,
        // mirroring the `show` command. We require it be value-less ('') rather
        // than any string: `-p` is a string option that swallows the next
        // token, so `search -p foo` makes `password` = 'foo' -- treating that
        // as "reveal" would dump every password when the user only meant to
        // search for "foo". Put the term first instead: `search foo -p`.
        const shouldShowPasswords = password === '' || password === 'true'
        const allAccounts = await FileHandler.getAndDecryptFlatFile()
        const nameMatchInfo = await AccountMgmt.searchForAccountsByName(
          searchString,
          allAccounts
        )
        const usernameMatchInfo = await AccountMgmt.searchForAccountsByUsername(
          searchString,
          allAccounts
        )
        const allMatches = []
          .concat(nameMatchInfo.matches)
          .concat(usernameMatchInfo.matches)
          .sort(AccountMgmt.sortByName)
          .reduce((acc, val) => {
            if (acc.indexOf(val) === -1) acc.push(val)
            return acc
          }, [])

        const info = {
          matches: allMatches,
          total: nameMatchInfo.total,
        }
        Vomit.listAccounts(info.matches, info.total, shouldShowPasswords)
        break

      case 'show':
        // `-p` is a value-less flag here, which minimist's string option
        // parses as '' -- any string (including '') means "show password"
        const shouldShowPassword = typeof password === 'string'
        if (uid) {
          const account = await AccountMgmt.findAccountByUuid(uid)
          if (account) {
            if (!shouldShowPassword) delete account.password
            return Vomit.listSingleAccount(account)
          }
          return Vomit.error(`We didn't find an account with uuid: ${uid}`)
        } else if (name || second) {
          const nameStringToTry = name || second
          const account = await AccountMgmt.findAccountByName(nameStringToTry)
          if (account) {
            if (!shouldShowPassword) delete account.password
            return Vomit.listSingleAccount(account)
          }
          return Vomit.error(
            `We didn't find an account with name: ${nameStringToTry}`
          )
        }
        Vomit.error(
          'Either a name (-n or --name) or uuid (-i or --id or --uuid) parameter is a required at a minimum to show the details for an account.'
        )

        break

      case 'update':
        if (uid) {
          const account = await AccountMgmt.findAccountByUuid(uid)
          if (account) {
            await AccountMgmt.updateAccount(
              uid,
              {
                name: name,
                username: username,
                password: password,
                extra: extra,
              },
              account
            )
            return Vomit.success(
              `Successfully updated account with uuid: '${uid}'!`
            )
          }
          return Vomit.error(`We didn't find an account with uuid: ${uid}`)
        } else if (name) {
          const account = await AccountMgmt.findAccountByName(name)
          if (account) {
            await AccountMgmt.updateAccount(
              account.uuid,
              {
                name: name,
                username: username,
                password: password,
                extra: extra,
              },
              account
            )
            return Vomit.success(
              `Successfully updated account with name: '${name}'!`
            )
          }
          return Vomit.error(`We didn't find an account with name: ${name}`)
        }
        Vomit.error(
          'Either a name (-n or --name) or uuid (-i or --id or --uuid) parameter is a required at a minimum to show the details for an account.'
        )

        break

      case 'decryptfile':
        const answer = await Readline().ask(
          'Are you sure you want to decrypt your file and save it to disk (yes/no): '
        )
        if (answer.toLowerCase() === 'yes') {
          const decryptedFullPath = `${fullPath}.json`
          const fileData = await FileHandler.getAndDecryptFlatFile()
          await writeFile(decryptedFullPath, JSON.stringify(fileData))
          Vomit.success(
            `Successfully saved your decrypted account data to:\n${decryptedFullPath}`
          )
        }
        break

      case 'recrypt':
        const dest = path.join(config.filepath, config.filename)
        const encryption2 = Encryption({ secret: second })
        const currentFileData = await FileHandler.getAndDecryptFlatFile()
        const encryptedString = await encryption2.encrypt(
          JSON.stringify(currentFileData)
        )
        await writeFile(dest, encryptedString)
        Vomit.success(
          `Successfully updated your encrypted file with new secret to: ${dest}`
        )
        break

      case 'import':
        const importFilePath = file || lastValue(argv.filepath) || second
        if (importFilePath && FileHandler.doesFileExist(importFilePath)) {
          let rows = await Import.csv(importFilePath)
          let numAccountsImported = 0
          let numAccountsNotImported = 0
          const totalRows = rows.length
          while (rows.length > 0) {
            const row = rows.shift()
            if (row.name) {
              numAccountsImported++
              await AccountMgmt.addAccount(
                row.name,
                row.username,
                row.password,
                row.extra
              )
            } else {
              numAccountsNotImported++
            }
          }
          const str1 = `Successfully added ${numAccountsImported} accounts from CSV: ${importFilePath}!`
          const str2 =
            numAccountsNotImported > 0
              ? `Did not add ${numAccountsNotImported} accounts because we didn't see an account name ('name' CSV header).`
              : ''
          Vomit.twoLinesDifferentColors(str1, str2, 'green', 'red')
          return Vomit.singleLine(
            `Total number of rows in spreadsheet: ${totalRows}\n`,
            'blue',
            0
          )
        }
        Vomit.error(
          `We can't find filepath provided: ${
            importFilePath || 'NO FILE PROVIDED'
          }`
        )

        break

      case 'encrypt':
        const plain = text || second
        let cipherText
        if (plain) {
          cipherText = await encryption.encrypt(plain)
          Vomit.success(cipherText.toString())
        } else if (file) {
          cipherText = await encryption.encryptFileUtf8(file)
          Vomit.success(cipherText.toString())
        } else {
          Vomit.error(
            `Please enter text (-t or --text) or a file path (-f or --file) to encrypt text.`
          )
        }
        break

      case 'decrypt':
        const cipher = text || second
        let plainText
        if (cipher) {
          plainText = await encryption.decrypt(cipher)
          Vomit.success(plainText)
        } else if (file) {
          plainText = await encryption.decryptFileUtf8(file)
          Vomit.success(plainText)
        } else {
          Vomit.error(
            `Please enter text (-t or --text) or a file path (-f or --file) to encrypt text.`
          )
        }
        break

      default:
        Vomit.error(
          `I don't recognize what you are trying to do.\nPlease refer to the documentation for what commands I support.`
        )
    }

    process.exit()
  } catch (err: any) {
    if (typeof err === 'string') {
      Vomit.error(err)
    } else if (err.toString() == 'TypeError: Bad input string') {
      Vomit.error(
        `Uh oh, The error we got is '${err.toString()}'\n\nThis usually means the CRYPT_SECRET is different for the info you're trying to decrypt than was used to encrypt it. Full stack trace below.`
      )
      console.log(err)
    } else {
      console.log(err)
    }
    process.exit()
  }
})()
