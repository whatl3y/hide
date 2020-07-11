import path from 'path'
import assert from 'assert'
import Encryption from './Encryption'

describe('Encryption', function () {
  const enc = Encryption({ secret: 'abc123' })
  const originalText = 'test123'
  let cipherTextAndIv: any
  let plainText: string

  describe('#encrypt()', function () {
    it(`should encrypt string without issue`, async () => {
      cipherTextAndIv = await enc.encrypt(originalText)
      assert.equal(typeof cipherTextAndIv, 'string')
      // assert.equal(2, cipherTextAndIv.split(':').length)
    })
  })

  describe('#decrypt()', function () {
    it(`should decrypt cipher string without issue`, async () => {
      plainText = await enc.decrypt(cipherTextAndIv)
      assert.equal(typeof plainText, 'string')
      assert.equal(plainText, originalText)
    })
  })

  describe('#fileToHash()', function () {
    it(`should hash file contents without errors`, async () => {
      await enc.fileToHash(path.join(__dirname, 'Encryption.ts'))
    })
  })

  describe(`#parseData()`, () => {
    const key = 'test_compress_1'

    it('should be a valid base64 string on deflate, then be a valid Buffer and the correct value on inflate', async () => {
      const base64string = await enc.parseData('lance123')
      if (typeof base64string !== 'string')
        throw new Error('needs to be string')

      const buff = await enc.parseData(base64string, false)
      const lance123 = buff.toString()

      assert.equal(true, typeof base64string === 'string')
      assert.equal(true, buff instanceof Buffer)
      assert.equal('lance123', lance123)
    })
  })
})
