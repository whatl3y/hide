import { randomUUID } from 'crypto'
import FileHandler from './FileHandler.ts'

export interface IAccounts {
  [uid: string]: IAccountInfo
}

export interface IAccountInfo {
  name: string
  username: string
  // optional because listing paths delete it before display
  password?: string
  extra: string
}

export default {
  createUuid() {
    return randomUUID()
  },

  async addAccount(
    name: string,
    username: string,
    password: string,
    extraInfo: string = ''
  ) {
    const newAccount: IAccounts = {
      [this.createUuid()]: {
        // cast everything to strings in case CLI flag parsing gives us
        // booleans (e.g. `--name` with no value) or numbers
        name: String(name),
        username: String(username || ''),
        password: String(password || ''),
        extra: String(extraInfo || ''),
      },
    }
    const rawAccountInfo = await FileHandler.getAndDecryptFlatFile()
    return await FileHandler.writeObjToFile(newAccount, rawAccountInfo || {})
  },

  async updateAccount(
    uuid: string,
    updatedInformation: any = {},
    originalInformation: any = {}
  ) {
    const updatedAccount = {
      [uuid]: {
        name: String(
          updatedInformation.name || originalInformation.name || ''
        ),
        username: String(
          updatedInformation.username || originalInformation.username || ''
        ),
        password: String(
          updatedInformation.password || originalInformation.password || ''
        ),
        extra: String(
          updatedInformation.extra || originalInformation.extra || ''
        ),
      },
    }
    const rawAccountInfo = await FileHandler.getAndDecryptFlatFile()
    return await FileHandler.writeObjToFile(
      updatedAccount,
      rawAccountInfo || {}
    )
  },

  async deleteAccountByUuid(uid: string) {
    let rawAccountInfo = await FileHandler.getAndDecryptFlatFile()
    if (!(rawAccountInfo && rawAccountInfo[uid])) return false

    delete rawAccountInfo[uid]
    await FileHandler.writeObjToFile({}, rawAccountInfo)
    return true
  },

  async findAccountByUuid(uid: string) {
    const currentAccounts = await FileHandler.getAndDecryptFlatFile()
    if (!(currentAccounts && currentAccounts[uid])) return false
    return Object.assign(currentAccounts[uid], { uuid: uid })
  },

  async findAccountByName(name: string) {
    const currentAccounts = await FileHandler.getAndDecryptFlatFile()
    if (!currentAccounts) return false

    const searchName = String(name).toLowerCase()
    const matchingUuid = Object.keys(currentAccounts).filter(
      (uuid) => String(currentAccounts[uuid].name).toLowerCase() == searchName
    )[0]

    if (!matchingUuid) return false
    return Object.assign(currentAccounts[matchingUuid], { uuid: matchingUuid })
  },

  async searchForAccountsByName(
    searchString?: string,
    currentAccounts?: IAccounts
  ) {
    return await this.searchForAccountsByField(
      'name',
      searchString,
      currentAccounts
    )
  },

  async searchForAccountsByUsername(
    searchString?: string,
    currentAccounts?: IAccounts
  ) {
    return await this.searchForAccountsByField(
      'username',
      searchString,
      currentAccounts
    )
  },

  async searchForAccountsByField(
    field: 'name' | 'username' | 'password' | 'extra',
    searchString?: string,
    currentAccounts?: IAccounts
  ): Promise<any> {
    currentAccounts =
      currentAccounts || (await FileHandler.getAndDecryptFlatFile())
    if (!currentAccounts) {
      return {
        matches: [],
        total: 0,
      }
    }

    const searchRegexp = searchString ? getSearchRegexp(searchString) : null
    const uuids = Object.keys(currentAccounts)
    const totalNumAccounts = uuids.length
    const matchingAccounts = uuids
      .map((uuid) => {
        const account: IAccountInfo = (currentAccounts as IAccounts)[uuid]
        if (!account) return null
        if (searchRegexp) {
          const fieldMatches =
            account[field] && searchRegexp.test(String(account[field]))
          if (fieldMatches) return Object.assign(account, { uuid: uuid })
          return null
        }
        return Object.assign(account, { uuid: uuid })
      })
      .filter((info) => !!info)

    return {
      matches: matchingAccounts,
      total: totalNumAccounts,
    }
  },

  sortByName(acc1: IAccountInfo, acc2: IAccountInfo) {
    return String(acc1.name).toLowerCase() < String(acc2.name).toLowerCase()
      ? -1
      : 1
  },
}

// Private methods
function getSearchRegexp(searchString: string): RegExp {
  try {
    return new RegExp(searchString, 'i')
  } catch (err) {
    // not a valid regular expression (e.g. searching for "(personal"),
    // so escape it and match the search string literally
    return new RegExp(
      String(searchString).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'i'
    )
  }
}
