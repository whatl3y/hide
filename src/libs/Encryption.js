import crypto from 'crypto'
import fs from 'fs'
import zlib from 'zlib'
import promisify from 'es6-promisify'
import config from '../config'

const inflate = promisify(zlib.inflate)
const deflate = promisify(zlib.deflate)

export default function Encryption(options={}) {
  return {
    _algorithm: options.algorithm || config.cryptography.algorithm,
    _secret:    options.secret || config.cryptography.password,

    encrypt(text) {
      const cipher = crypto.createCipher(this._algorithm, this._secret)
      let crypted = cipher.update(text, 'utf8', 'hex')
      crypted += cipher.final('hex')
      return crypted
    },

    decrypt(text) {
      const decipher = crypto.createDecipher(this._algorithm, this._secret)
      let dec = decipher.update(text, 'hex', 'utf8')
      dec += decipher.final('utf8')
      return dec
    },

    stringToHash(string) {
      const md5Sum = crypto.createHash("md5")
      md5Sum.update(string)
      return md5Sum.digest("hex")
    },

    fileToHash(filePath) {
      return new Promise((resolve, reject) => {
        const md5Sum = crypto.createHash("md5")

        const s = fs.ReadStream(filePath)
        s.on("data", data => md5Sum.update(data))
        s.on("error", reject)
        s.on("end", () => resolve(md5Sum.digest("hex")))
      })
    },

    // Handles any gzip/deflating/inflating we might be doing to data
    // we're passing to and from Redis.
    // NOTE: if inflating, we will always return a raw Buffer. If deflating,
    // we return a base64 encoded string.
    async parseData(value, isRawData=true) {
      let returnValue
      switch (isRawData) {
        case false:
          return await inflate(new Buffer(value, 'base64'))

        default:  //true
          const compressedValue = await deflate(value)
          return new Buffer(compressedValue).toString('base64')
      }
    }
  }
}
