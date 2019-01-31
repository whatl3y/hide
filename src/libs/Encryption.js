import crypto from 'crypto'
import fs from 'fs'
import zlib from 'zlib'
import promisify from 'es6-promisify'
import config from '../config'

const readFile = promisify(fs.readFile)
const inflate = promisify(zlib.inflate)
const deflate = promisify(zlib.deflate)

export default function Encryption(options={}) {
  const alg = options.algorithm || config.cryptography.algorithm
  const sec = options.secret || config.cryptography.password

  return {
    _algorithm: alg,
    _secret:    sec,

    encrypt(text) {
      const secret      = getFilledSecret(this._secret, this.getAlgorithmKeyLength())
      const { iv, key } = getKeyAndIV(secret)
      const cipher      = crypto.createCipheriv(this._algorithm, key, iv)

      let cipherText = cipher.update(text, 'utf8', 'hex')
      cipherText += cipher.final('hex')
      return `${cipherText}:${iv.toString('hex')}`
    },

    async encryptFileUtf8(filePath) {
      const fileText = await readFile(filePath, { encoding: 'utf8' })
      return await this.encrypt(fileText)
    },

    decrypt(text) {
      const [ raw, ivHex ] = text.split(':')
      const iv          = Buffer.from(ivHex, 'hex')
      const secret      = getFilledSecret(this._secret, this.getAlgorithmKeyLength())
      const key         = (secret instanceof Buffer) ? secret : Buffer.from(secret)
      const decipher    = crypto.createDecipheriv(this._algorithm, key, iv)

      let dec = decipher.update(raw, 'hex', 'utf8')
      dec += decipher.final('utf8')
      return dec
    },

    async decryptFileUtf8(filePath) {
      const fileText = await readFile(filePath, { encoding: 'utf8' })
      return await this.decrypt(fileText)
    },

    stringToHash(string) {
      const md5Sum = crypto.createHash("md5")
      md5Sum.update(string)
      return md5Sum.digest("hex")
    },

    async fileToHash(filePath) {
      return await new Promise((resolve, reject) => {
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
          return await inflate(Buffer.from(value, 'base64'))

        default:  //true
          const compressedValue = await deflate(value)
          return Buffer.from(compressedValue).toString('base64')
      }
    },

    getAlgorithmKeyLength() {
      const map = {
        "des-ede3": 24,
        "aes128": 16,
        "aes-128-cbc": 16,
        "aes192": 24,
        "aes256": 32
      }
      return map[this._algorithm]
    },

    deprecated: {
      _algorithm: alg,
      _secret:    sec,

      encrypt(text) {
        const cipher = crypto.createCipher(this._algorithm, this._secret)
        let crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex')
        return crypted
      },

      async encryptFileUtf8(filePath) {
        const fileText = await readFile(filePath, { encoding: 'utf8' })
        return this.encrypt(fileText)
      },

      decrypt(text) {
        const decipher = crypto.createDecipher(this._algorithm, this._secret)
        let dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8')
        return dec
      },

      async decryptFileUtf8(filePath) {
        const fileText = await readFile(filePath, { encoding: 'utf8' })
        return this.decrypt(fileText)
      }
    },
  }
}

// Private methods
function getFilledSecret(secret, numBytes=32) {
  if (secret.length < numBytes)
    return getFilledSecret(`${secret}_${secret}`, numBytes)
  return secret.slice(0, numBytes)
}

function getKeyAndIV(key) {
  const ivBuffer = crypto.randomBytes(16)
  const keyBuffer = (key instanceof Buffer) ? key : Buffer.from(key)
  return { iv: ivBuffer, key: keyBuffer }
}
