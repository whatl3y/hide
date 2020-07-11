import crypto from 'crypto'
import fs from 'fs'
import { promisify } from 'util'
import zlib from 'zlib'
import config from '../config'

const readFile = fs.promises.readFile
const inflate: any = promisify(zlib.inflate)
const deflate: any = promisify(zlib.deflate)

export default function Encryption(options: any = {}) {
  const alg = options.algorithm || config.cryptography.algorithm
  const sec = options.secret || config.cryptography.password

  return {
    _algorithm: alg,
    _secret: sec,

    encrypt(text: string) {
      const secret = getFilledSecret(this._secret, this.getAlgorithmKeyLength())
      const { iv, key } = getKeyAndIV(secret)
      const cipher = crypto.createCipheriv(this._algorithm, key, iv)

      let cipherText = cipher.update(text, 'utf8', 'hex')
      cipherText += cipher.final('hex')
      return `${cipherText}:${iv.toString('hex')}`
    },

    async encryptFileUtf8(filePath: string) {
      const fileText = await readFile(filePath, { encoding: 'utf8' })
      return await this.encrypt(fileText)
    },

    decrypt(text: string) {
      const [raw, ivHex] = text.split(':')
      const iv = Buffer.from(ivHex, 'hex')
      const secret = getFilledSecret(this._secret, this.getAlgorithmKeyLength())
      const key = secret instanceof Buffer ? secret : Buffer.from(secret)
      const decipher = crypto.createDecipheriv(this._algorithm, key, iv)

      let dec = decipher.update(raw, 'hex', 'utf8')
      dec += decipher.final('utf8')
      return dec
    },

    async decryptFileUtf8(filePath: string) {
      const fileText = await readFile(filePath, { encoding: 'utf8' })
      return await this.decrypt(fileText)
    },

    stringToHash(str: string) {
      const md5Sum = crypto.createHash('md5')
      md5Sum.update(str)
      return md5Sum.digest('hex')
    },

    async fileToHash(filePath: string) {
      return await new Promise((resolve, reject) => {
        const md5Sum = crypto.createHash('md5')

        const s = fs.createReadStream(filePath)
        s.on('data', (data) => md5Sum.update(data))
        s.on('error', reject)
        s.on('end', () => resolve(md5Sum.digest('hex')))
      })
    },

    // Handles any gzip/deflating/inflating we might be doing to data
    // we're passing to and from Redis.
    // NOTE: if inflating, we will always return a raw Buffer. If deflating,
    // we return a base64 encoded string.
    async parseData(
      value: string,
      isRawData: boolean = true
    ): Promise<Buffer | string> {
      let returnValue
      switch (isRawData) {
        case false:
          return await inflate(Buffer.from(value, 'base64'))

        default:
          //true
          const compressedValue = await deflate(value)
          return Buffer.from(compressedValue as any).toString('base64')
      }
    },

    getAlgorithmKeyLength() {
      const map: any = {
        'des-ede3': 24,
        aes128: 16,
        'aes-128-cbc': 16,
        aes192: 24,
        aes256: 32,
      }
      return map[this._algorithm]
    },

    deprecated: {
      _algorithm: alg,
      _secret: sec,

      encrypt(text: string) {
        const cipher = crypto.createCipher(this._algorithm, this._secret)
        let crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex')
        return crypted
      },

      async encryptFileUtf8(filePath: string) {
        const fileText = await readFile(filePath, { encoding: 'utf8' })
        return this.encrypt(fileText)
      },

      decrypt(text: string) {
        const decipher = crypto.createDecipher(this._algorithm, this._secret)
        let dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8')
        return dec
      },

      async decryptFileUtf8(filePath: string) {
        const fileText = await readFile(filePath, { encoding: 'utf8' })
        return this.decrypt(fileText)
      },
    },
  }
}

// Private methods
function getFilledSecret(secret: string, numBytes = 32): Buffer | string {
  if (secret.length < numBytes)
    return getFilledSecret(`${secret}_${secret}`, numBytes)
  return secret.slice(0, numBytes)
}

function getKeyAndIV(key: Buffer | string) {
  const ivBuffer = crypto.randomBytes(16)
  const keyBuffer = key instanceof Buffer ? key : Buffer.from(key)
  return { iv: ivBuffer, key: keyBuffer }
}
