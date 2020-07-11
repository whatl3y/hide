import 'colors'
import columnify from 'columnify'
import { IAccountInfo } from './AccountMgmt'

const NOOP = () => {}

export default {
  noCryptSecret() {
    this.wrapInNewlines(() => {
      console.log(`You don't have environment variable CRYPT_SECRET set.`.red)
      console.log(
        `>export CRYPT_SECRET=[your all time master secret value]`.green
      )
    })
  },

  listSingleAccount(accountRecord: IAccountInfo) {
    this.wrapInNewlines(() =>
      console.log(this.columnify([accountRecord]).green)
    )
  },

  listAccounts(accountsAry: IAccountInfo[] = [], totalNumAccounts = 0) {
    const accounts = accountsAry.map((a) => {
      if (typeof a === 'string') return { name: a }

      delete a.password
      return a
    })

    this.wrapInNewlines(() => {
      console.log('I found the following accounts:'.blue)
      console.log(this.columnify(accounts).green)
      console.log(
        `${accountsAry.length} of ${totalNumAccounts} total accounts returned`
          .blue
      )
    })
  },

  twoLinesDifferentColors(
    str1: string,
    str2: string,
    color1: any = 'blue',
    color2: any = 'green'
  ) {
    this.wrapInNewlines(() => {
      if (str1.length > 0) console.log(str1[color1])
      if (str2.length > 0) console.log(str2[color2])
    })
  },

  singleLine(str: string, color: any = 'blue', numWrappedRows = 1) {
    this.wrapInNewlines(() => console.log(str[color]), numWrappedRows)
  },

  success(string: string, twoLineWrap = true) {
    let wrapper = (foo: any) => foo()
    if (twoLineWrap) wrapper = this.wrapInNewlines
    wrapper(() => console.log(string.green))
  },

  error(string: string) {
    this.wrapInNewlines(() => console.log(string.red))
  },

  wrapInNewlines(functionToWriteMoreOutput = NOOP, howMany = 1) {
    const newlineString =
      howMany - 1 > 0 ? new Array(howMany - 1).fill('\n').join('') : ''
    if (howMany > 0) console.log(newlineString)
    functionToWriteMoreOutput()
    if (howMany > 0) console.log(newlineString)
  },

  columnify(data: any) {
    return columnify(data, {
      minWidth: 15,
    })
  },
}
