import assert from 'assert'
import AccountMgmt from './AccountMgmt.js'

const mgmt = AccountMgmt()

describe('AccountMgmt', function() {
  describe('#createUuid()', function() {
    it(`should create a UUID without error`, () => {
      const newUuid = mgmt.createUuid()
      assert.equal(typeof newUuid, 'string')
      assert.equal(true, newUuid.length > 10)
    })
  })
})
