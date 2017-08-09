import minimist from 'minimist'
import AccountMgmt from './libs/AccountMgmt'
import FileHandler from './libs/FileHandler'
import Import from './libs/Import'
import Vomit from './libs/Vomit'
import config from './config'

// Ex. >node dist/index search -s my_search_string
const argv = minimist(process.argv.slice(2))
const [command] = argv._

// we want to enforce CRYPT_SECRET to be set manually
if (!config.cryptography.password) {
  Vomit.noCryptSecret()
  process.exit()
}

;(async () => {
  try {
    const extra     = argv.e || argv.extra
    const name      = argv.n || argv.name
    const password  = argv.p || argv.password
    const uid       = argv.i || argv.id || argv.uuid
    const username  = argv.u || argv.username

    switch (command) {
      case 'add':
        if (!name)
          return Vomit.error('An account name (-n or --name) parameter is a required at a minimum to add a new account.')

        await AccountMgmt.addAccount(name, username, password, extra)
        Vomit.success(`Successfully added account '${name}'!`)

        break

      case 'delete':
        if (!uid)
          return Vomit.error('A uuid (-u or --uuid) is a required to delete an account.')

        const result = await AccountMgmt.deleteAccountByUuid(uid)
        if (result)
          Vomit.success(`Successfully deleted account with uuid: '${uid}'`)
        else
          Vomit.error(`We didn't find an account with uuid: '${uid}'`)

        break

      case 'search':
        const searchString = argv.s || argv.search
        const info = await AccountMgmt.searchForAccountsByName(searchString)
        Vomit.listAccounts(info.matches, info.total)
        break

      case 'show':
        if (uid) {
          const account = await AccountMgmt.findAccountByUuid(uid)
          if (account) {
            if (!password)
              delete(account.password)
            Vomit.listSingleAccount(account)

          } else {
            Vomit.error(`We didn't find an account with uuid: ${uid}`)
          }
        } else if (name) {
          const account = await AccountMgmt.findAccountByName(name)
          if (account) {
            if (!password)
              delete(account.password)
            Vomit.listSingleAccount(account)

          } else {
            Vomit.error(`We didn't find an account with name: ${name}`)
          }
        } else {
          Vomit.error('Either a name (-n or --name) or uuid (-u or --uuid) parameter is a required at a minimum to show the details for an account.')
        }

        break

      case 'update':
        if (uid) {
          const account = await AccountMgmt.findAccountByUuid(uid)
          if (account) {
            await AccountMgmt.updateAccount(uid, {name: name, username: username, password: password, extra: extra}, account)
            Vomit.success(`Successfully updated account with uuid: '${uid}'!`)
          } else {
            Vomit.error(`We didn't find an account with uuid: ${uid}`)
          }
        } else if (name) {
          const account = await AccountMgmt.findAccountByName(name)
          if (account) {
            await AccountMgmt.updateAccount(account.uuid, {name: name, username: username, password: password, extra: extra}, account)
            Vomit.success(`Successfully updated account with name: '${name}'!`)
          } else {
            Vomit.error(`We didn't find an account with name: ${name}`)
          }
        } else {
          Vomit.error('Either a name (-n or --name) or uuid (-u or --uuid) parameter is a required at a minimum to show the details for an account.')
        }

        break

      case 'import':
        const importFilePath = argv.f || argv.filepath
        if (FileHandler.doesFileExist(importFilePath)) {
          let rows = await Import.csv(importFilePath)
          const numAccounts = rows.length
          while (rows.length > 0) {
            const row = rows.shift()
            if (row.name)
              await AccountMgmt.addAccount(row.name, row.username, row.password, row.extra)
          }
          Vomit.success(`Successfully added ${numAccounts} accounts from CSV: ${importFilePath}!`)

        } else {
          Vomit.error(`We can't find filepath provided: ${importFilePath}`)
        }

        break

      default:
        Vomit.error(`I don't recognize what you are trying to do.\nPlease refer to the documentation for what commands I support.`)
    }

    process.exit()

  } catch(err) {
    if (typeof err === 'string')
      Vomit.error(err)
    else
      console.error(err)
    process.exit()
  }
})()
