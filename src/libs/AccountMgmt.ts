import { v4 as uuidv4 } from 'uuid'
import FileHandler from './FileHandler'

export interface IAccounts {
  [uid: string]: IAccountInfo
}

export interface IAccountInfo {
  name: string
  username: string
  password: string
  extra: string
}

export default {
  createUuid() {
    return uuidv4()
  },

  async addAccount(
    name: string,
    username: string,
    password: string,
    extraInfo: string = ''
  ) {
    const newAccount: IAccounts = {
      [this.createUuid()]: {
        name: name,
        username: username || '',
        password: password || '',
        extra: extraInfo || '',
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
        name: updatedInformation.name || originalInformation.name || '',
        username:
          updatedInformation.username || originalInformation.username || '',
        password:
          updatedInformation.password || originalInformation.password || '',
        extra: updatedInformation.extra || originalInformation.extra || '',
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

    const matchingUuid = Object.keys(currentAccounts).filter(
      (uuid) => currentAccounts[uuid].name.toLowerCase() == name.toLowerCase()
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

    const uuids = Object.keys(currentAccounts)
    const totalNumAccounts = uuids.length
    const matchingAccounts = uuids
      .map((uuid) => {
        const account: IAccountInfo = (currentAccounts as IAccounts)[uuid]
        if (!account) return null
        if (searchString) {
          const searchRegexp = new RegExp(searchString, 'i')
          const fieldMatches =
            account[field] && searchRegexp.test(account[field])
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
    return acc1.name.toLowerCase() < acc2.name.toLowerCase() ? -1 : 1
  },
}
