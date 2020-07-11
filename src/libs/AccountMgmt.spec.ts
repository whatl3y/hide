import assert from 'assert'
import AccountMgmt from './AccountMgmt'

describe('AccountMgmt', function () {
  describe('#createUuid()', function () {
    it(`should create a UUID without error`, () => {
      const newUuid = AccountMgmt.createUuid()
      assert.equal(typeof newUuid, 'string')
      assert.equal(true, newUuid.length > 10)
    })
  })
})
