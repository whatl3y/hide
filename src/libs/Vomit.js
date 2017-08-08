import colors from 'colors'
import columnify from 'columnify'

const NOOP = ()=>{}

export default {
  noCryptSecret() {
    this.wrapInNewlines(() => {
      console.log(`You don't have environment variable CRYPT_SECRET set.`.red)
      console.log(`>export CRYPT_SECRET=[your all time master secret value]`.green)
    })
  },

  listSingleAccount(accountRecord) {
    this.wrapInNewlines(() => console.log(columnify([accountRecord]).green))
  },

  listAccounts(accountsAry=[], totalNumAccounts=0) {
    const accounts = accountsAry.map(a => {
      if (typeof a === 'string')
        return {name: a}
      return {name: a.name, username: a.username, uuid: a.uuid}
    })

    this.wrapInNewlines(() => {
      console.log("I found the following accounts:".blue)
      console.log(columnify(accounts).green)
      console.log(`${accountsAry.length} of ${totalNumAccounts} total accounts returned`.blue)
    })
  },

  success(string) {
    this.wrapInNewlines(() => console.log(string.green))
  },

  error(string) {
    this.wrapInNewlines(() => console.log(string.red))
  },

  wrapInNewlines(functionToWriteMoreOutput=NOOP, howMany=1) {
    const newlineString = new Array(howMany-1).fill('\n').join('')
    if (howMany > 0) console.log(newlineString)
    functionToWriteMoreOutput()
    if (howMany > 0) console.log(newlineString)
  }
}
