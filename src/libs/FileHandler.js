import fs from 'fs'
import path from 'path'
import promisify from 'es6-promisify'
import Encryption from './Encryption'
import config from '../config'

const mkdirPromise = promisify(fs.mkdir)
const writeFilePromise = promisify(fs.writeFile)
const readFilePromise = promisify(fs.readFile)

const encryption = Encryption()

export default {
  filepath: path.join(config.filepath, config.filename),

  async upgradeFrom3To4() {
    if (this.doesDirectoryExist(config.filepath)) {
      if (this.doesFileExist(this.filepath)) {
        const encryptedFileData = await readFilePromise(this.filepath)
        const inflatedString = await encryption.parseData(encryptedFileData.toString('utf8'), false)
        if (inflatedString.toString('utf8').split(':').length === 1) {
          const allAccountData = JSON.parse(encryption.deprecated.decrypt(inflatedString.toString('utf8')))
          await this.writeObjToFile(allAccountData)
          return true
        }
      }
    }
    return false
  },

  async getAndDecryptFlatFile() {
    if (this.doesDirectoryExist(config.filepath)) {
      if (this.doesFileExist(this.filepath)) {
        const rawFileData = await readFilePromise(this.filepath)
        if (rawFileData.length === 0)
          return null
        else {
          const inflatedString = await encryption.parseData(rawFileData.toString('utf8'), false)

          try {
            const accountsJson = JSON.parse(encryption.decrypt(inflatedString.toString('utf8')))
            return accountsJson
          } catch(err) {
            throw `We're having a problem parsing your flat file at '${this.filepath}'.
              This is likely due to a different master password, environment variable CRYPT_SECRET,
              being used that previously was set. Make sure you have the correct
              secret you used before and try again.`.replace(/\n\s+/g, '\n')
          }
        }
      } else {
        await writeFilePromise(this.filepath, '')
        return null
      }
    }

    await mkdirPromise(config.filepath)
    await writeFilePromise(this.filepath, '')
    return ''
  },

  async writeObjToFile(obj, origObj={}) {
    const newObj          = Object.assign(origObj, obj)
    const encryptedString = encryption.encrypt(JSON.stringify(newObj))
    const deflatedString  = await encryption.parseData(encryptedString)
    return await writeFilePromise(this.filepath, deflatedString)
  },

  doesDirectoryExist(dirPath) {
    try {
      const exists = fs.statSync(dirPath).isDirectory()
      return exists
    } catch(e) {
      return false
    }
  },

  doesFileExist(filePath) {
    try {
      const exists = fs.statSync(filePath).isFile()
      return exists
    } catch(e) {
      return false
    }
  }
}
