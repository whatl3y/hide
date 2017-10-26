import uuidv4 from 'uuid/v4'
import FileHandler from './FileHandler'

export default {
  createUuid() {
    return uuidv4()
  },

  async addAccount(name, username, password, extraInfo="") {
    const newAccount = {
      [this.createUuid()]: {
        name:     name,
        username: username || '',
        password: password || '',
        extra:    extraInfo || ''
      }
    }
    const rawAccountInfo = await FileHandler.getAndDecryptFlatFile()
    return await FileHandler.writeObjToFile(newAccount, rawAccountInfo || {})
  },

  async updateAccount(uuid, updatedInformation={}, originalInformation={}) {
    const updatedAccount = {
      [uuid]: {
        name:     updatedInformation.name || originalInformation.name || '',
        username: updatedInformation.username || originalInformation.username || '',
        password: updatedInformation.password || originalInformation.password || '',
        extra:    updatedInformation.extra || originalInformation.extra || ''
      }
    }
    const rawAccountInfo = await FileHandler.getAndDecryptFlatFile()
    return await FileHandler.writeObjToFile(updatedAccount, rawAccountInfo || {})
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

  async searchForAccountsByName(searchString=null, currentAccounts=null) {
    return await this.searchForAccountsByField('name', searchString, currentAccounts)
  },

  async searchForAccountsByUsername(searchString, currentAccounts=null) {
    return await this.searchForAccountsByField('username', searchString, currentAccounts)
  },

  async searchForAccountsByField(field, searchString=null, currentAccounts=null) {
    currentAccounts = currentAccounts || (await FileHandler.getAndDecryptFlatFile())
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
        const searchRegexp  = new RegExp(searchString, 'i')
        const fieldMatches  = account[field] && searchRegexp.test(account[field])
        if (fieldMatches)
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

  sortByName(acc1, acc2) {
    return (acc1.name.toLowerCase() < acc2.name.toLowerCase()) ? -1 : 1
  }
}
