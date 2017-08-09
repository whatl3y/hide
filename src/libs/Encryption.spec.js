import path from 'path'
import assert from 'assert'
import Encryption from './Encryption.js'

describe('Encryption', function() {
  const enc = Encryption({secret: 'abc123'})
  const originalText = 'test123'
  let cipherText
  let plainText
  let hash

  describe('#encrypt()', function() {
    it(`should encrypt string without issue`, () => {
      cipherText = enc.encrypt(originalText)
      assert.equal(typeof cipherText, 'string')
    })
  })

  describe('#decrypt()', function() {
    it(`should decrypt cipher string without issue`, () => {
      plainText = enc.decrypt(cipherText)
      assert.equal(typeof plainText, 'string')
      assert.equal(plainText, originalText)
    })
  })

  describe('#stringToHash()', function() {
    it(`should hash string without issue`, () => {
      hash = enc.stringToHash(plainText)
      assert.equal(typeof hash, 'string')
    })
  })

  describe('#fileToHash()', function() {
    it(`should hash file contents without errors`, async () => {
      await enc.fileToHash(path.join(__dirname, 'Encryption.js'))
    })
  })

  describe(`#parseData()`, () => {
    const key = 'test_compress_1'

    it('should be a valid base64 string on deflate, then be a valid Buffer and the correct value on inflate', async () => {
      const base64string = await enc.parseData('lance123')
      const buff         = await enc.parseData(base64string, false)
      const lance123     = buff.toString()

      assert.equal(true, typeof base64string === 'string')
      assert.equal(true, buff instanceof Buffer)
      assert.equal('lance123', lance123)
    })
  })
})
