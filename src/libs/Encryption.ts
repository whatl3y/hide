import crypto from 'crypto'
import fs from 'fs'
import { promisify } from 'util'
import zlib from 'zlib'
import config from '../config'

const readFile = fs.promises.readFile
const inflate: any = promisify(zlib.inflate)
const deflate: any = promisify(zlib.deflate)

export default function Encryption(options: any = {}) {
  const alg = 'aes-256-ctr'
  const sec = options.secret || config.cryptography.password

  return {
    _algorithm: alg,
    _secret: sec,

    async encrypt(input: Buffer | string) {
      const secret = getFilledSecret(this._secret)
      const { iv, key } = getKeyAndIV(secret)
      const cipher = crypto.createCipheriv(this._algorithm, key, iv)

      const inputStr =
        input instanceof Buffer ? input.toString('base64') : input
      let cipherText = cipher.update(inputStr, 'utf8', 'base64')
      cipherText += cipher.final('base64')
      return await this.parseData(`${cipherText}:${iv.toString('base64')}`)
    },

    async encryptFileUtf8(filePath: string) {
      const fileText = await readFile(filePath, { encoding: 'utf8' })
      return await this.encrypt(fileText)
    },

    async decrypt(text: string) {
      const inflatedString = (await this.parseData(text, false)).toString()
      const [rawBase64, ivBase64] = inflatedString.split(':')
      const iv = Buffer.from(ivBase64, 'base64')
      const secret = getFilledSecret(this._secret)
      const { key } = getKeyAndIV(secret, iv)
      const decipher = crypto.createDecipheriv(this._algorithm, key, iv)

      let dec = decipher.update(rawBase64, 'base64', 'utf8')
      dec += decipher.final('utf8')
      return dec
    },

    async decryptFileUtf8(filePath: string) {
      const fileText = await readFile(filePath, { encoding: 'utf8' })
      return await this.decrypt(fileText)
    },

    async fileToHash(filePath: string) {
      return await new Promise((resolve, reject) => {
        const sha256Sum = crypto.createHash('sha256')

        const s = fs.createReadStream(filePath)
        s.on('data', (data) => sha256Sum.update(data))
        s.on('error', reject)
        s.on('end', () => resolve(sha256Sum.digest('base64')))
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
      switch (isRawData) {
        case false:
          return await inflate(Buffer.from(value, 'base64'))

        default:
          //true
          const compressedValue = await deflate(value)
          return Buffer.from(compressedValue as any).toString('base64')
      }
    },
  }
}

// Private methods
function getFilledSecret(secret: string): string {
  const sha256Sum = crypto.createHash('sha256')
  sha256Sum.update(secret)
  return sha256Sum.digest('base64')
}

function getKeyAndIV(key: string, iv?: Buffer) {
  const ivBuffer = iv || crypto.randomBytes(16)
  const derivedKey = crypto.pbkdf2Sync(key, ivBuffer, 1e5, 32, 'sha256')
  return {
    iv: ivBuffer,
    key: derivedKey,
  }
}
