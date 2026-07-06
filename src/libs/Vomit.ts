import { styleText } from 'util'
import columnify from 'columnify'
import type { IAccountInfo } from './AccountMgmt.ts'

const NOOP = () => {}

// coerce to string defensively (CLI parsing can hand us non-strings) --
// styleText throws on non-string input, unlike the old `colors` library
function colorize(color: any, text: any): string {
  return styleText(color, String(text))
}

export default {
  noCryptSecret() {
    this.wrapInNewlines(() => {
      console.log(
        colorize('red', `You don't have environment variable CRYPT_SECRET set.`)
      )
      console.log(
        colorize(
          'green',
          `>export CRYPT_SECRET=[your all time master secret value]`
        )
      )
    })
  },

  listSingleAccount(accountRecord: IAccountInfo) {
    this.wrapInNewlines(() =>
      console.log(colorize('green', this.columnify([accountRecord])))
    )
  },

  listAccounts(accountsAry: IAccountInfo[] = [], totalNumAccounts = 0) {
    const accounts = accountsAry.map((a) => {
      if (typeof a === 'string') return { name: a }

      delete a.password
      return a
    })

    this.wrapInNewlines(() => {
      console.log(colorize('blue', 'I found the following accounts:'))
      console.log(colorize('green', this.columnify(accounts)))
      console.log(
        colorize(
          'blue',
          `${accountsAry.length} of ${totalNumAccounts} total accounts returned`
        )
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
      if (str1.length > 0) console.log(colorize(color1, str1))
      if (str2.length > 0) console.log(colorize(color2, str2))
    })
  },

  singleLine(str: string, color: any = 'blue', numWrappedRows = 1) {
    this.wrapInNewlines(() => console.log(colorize(color, str)), numWrappedRows)
  },

  success(string: string, twoLineWrap = true) {
    let wrapper = (foo: any) => foo()
    if (twoLineWrap) wrapper = this.wrapInNewlines
    wrapper(() => console.log(colorize('green', string)))
  },

  error(string: string) {
    this.wrapInNewlines(() => console.log(colorize('red', string)))
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
