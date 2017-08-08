import uuidv4 from 'uuid/v4'
import FileHandler from './FileHandler'
import config from '../config'

export default {
  createUuid() {
    return uuidv4()
  },

  async addAccount(name, username, password, extraInfo="") {
    const newAccount = {
      [this.createUuid()]: {
        name:     name,
        username: username,
        password: password,
        extra:    extraInfo
      }
    }

    const rawAccountInfo = await FileHandler.getAndDecryptFlatFile()
    return await FileHandler.writeObjToFile(newAccount, rawAccountInfo || {})
  },

  async deleteAccountByUuid(uid) {
    let rawAccountInfo = await FileHandler.getAndDecryptFlatFile()
    if (!(rawAccountInfo && rawAccountInfo[uid]))
      return false

    delete(rawAccountInfo[uid])
    await FileHandler.writeObjToFile({}, rawAccountInfo)
    return true
  },

  async findAccountByUuid(uid) {
    const currentAccounts = await FileHandler.getAndDecryptFlatFile()
    if (!(currentAccounts && currentAccounts[uid]))
      return false
    return Object.assign(currentAccounts[uid], {uuid: uid})
  },

  async findAccountByName(name) {
    const currentAccounts = await FileHandler.getAndDecryptFlatFile()
    if (!currentAccounts)
      return false

    const matchingUuid = Object.keys(currentAccounts).filter(uuid => currentAccounts[uuid].name.toLowerCase() == name.toLowerCase())[0]

    if (!matchingUuid)
      return false
    return Object.assign(currentAccounts[matchingUuid], {uuid: matchingUuid})
  },

  async searchForAccountsByName(searchString=null) {
    const currentAccounts = await FileHandler.getAndDecryptFlatFile()
    if (!currentAccounts) {
      return {
        matches: [],
        total: 0
      }
    }

    const uuids             = Object.keys(currentAccounts)
    const totalNumAccounts  = uuids.length
    const matchingAccounts  = uuids.map(uuid => {
      const account = currentAccounts[uuid]
      if (!account)
        return null
      if (searchString) {
        const searchRegexp = new RegExp(searchString, 'i')
        const nameMatches = account.name && searchRegexp.test(account.name)
        const usernameMatches = account.username && searchRegexp.test(account.username)
        if (nameMatches || usernameMatches)
          return Object.assign(account, {uuid: uuid})
        return null
      }
      return Object.assign(account, {uuid: uuid})
    }).filter(info => !!info)

    return {
      matches: matchingAccounts,
      total: totalNumAccounts
    }
  },

  searchForAccountsByUsername(searchString) {

  }
}
