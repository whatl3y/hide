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
    this.wrapInNewlines(() => console.log(this.columnify([accountRecord]).green))
  },

  listAccounts(accountsAry=[], totalNumAccounts=0) {
    const accounts = accountsAry.map(a => {
      if (typeof a === 'string')
        return {name: a}

      delete(a.password)
      return a
    })

    this.wrapInNewlines(() => {
      console.log("I found the following accounts:".blue)
      console.log(this.columnify(accounts).green)
      console.log(`${accountsAry.length} of ${totalNumAccounts} total accounts returned`.blue)
    })
  },

  twoLinesDifferentColors(str1, str2, color1='blue', color2='green') {
    this.wrapInNewlines(() => {
      if (str1.length > 0) console.log(str1[color1])
      if (str2.length > 0) console.log(str2[color2])
    })
  },

  singleLine(str, color='blue', numWrappedRows=1) {
    this.wrapInNewlines(() => console.log(str[color]), numWrappedRows)
  },

  success(string, twoLineWrap=true) {
    let wrapper = foo => foo()
    if (twoLineWrap)
      wrapper = this.wrapInNewlines
    wrapper(() => console.log(string.green))
  },

  error(string) {
    this.wrapInNewlines(() => console.log(string.red))
  },

  wrapInNewlines(functionToWriteMoreOutput=NOOP, howMany=1) {
    const newlineString = (howMany-1 > 0) ? new Array(howMany-1).fill('\n').join('') : ''
    if (howMany > 0) console.log(newlineString)
    functionToWriteMoreOutput()
    if (howMany > 0) console.log(newlineString)
  },

  columnify(data) {
    return columnify(data, {
      minWidth: 15
    })
  }
}
