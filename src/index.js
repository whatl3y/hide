import minimist from 'minimist'
import AccountMgmt from './libs/AccountMgmt'
import FileHandler from './libs/FileHandler'
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
    // common command line parameters
    const name = argv.n || argv.name
    const password = argv.p || argv.password
    const uid = argv.u || argv.uuid

    switch (command) {
      case 'add':
        const username = argv.u || argv.username
        const extra = argv.e || argv.extra

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
        const searchString = argv.s
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
          return Vomit.error('Either a name (-n or --name) or uuid (-u or --uuid) parameter is a required at a minimum to show the details for an account.')
        }

        break

      case 'update':

        break
    }

    process.exit()

  } catch(err) {
    console.error(err)
    process.exit()
  }
})()
