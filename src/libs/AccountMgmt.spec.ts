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

  describe('#searchForAccountsByField()', function () {
    const accounts: any = {
      'uuid-1': { name: 'apple', username: 'user1', password: '', extra: '' },
      'uuid-2': { name: 'grape', username: 'user2', password: '', extra: '' },
      'uuid-3': { name: true, username: '', password: '', extra: '' },
      'uuid-4': {
        name: 'Bank (personal)',
        username: 'user4',
        password: '',
        extra: '',
      },
    }

    it(`should support regular expression searches`, async () => {
      const { matches } = await AccountMgmt.searchForAccountsByField(
        'name',
        '^ap',
        accounts
      )
      assert.deepEqual(
        matches.map((m: any) => m.uuid),
        ['uuid-1']
      )
    })

    it(`should not throw and should match non-string field values by their string representation`, async () => {
      const { matches } = await AccountMgmt.searchForAccountsByField(
        'name',
        'tr',
        accounts
      )
      assert.deepEqual(
        matches.map((m: any) => m.uuid),
        ['uuid-3']
      )
    })

    it(`should treat an invalid regular expression as a literal search string`, async () => {
      const { matches } = await AccountMgmt.searchForAccountsByField(
        'name',
        '(personal',
        accounts
      )
      assert.deepEqual(
        matches.map((m: any) => m.uuid),
        ['uuid-4']
      )
    })
  })

  describe('#sortByName()', function () {
    const account = (name: any): any => ({
      name: name,
      username: '',
      password: '',
      extra: '',
    })

    it(`should sort accounts by name case-insensitively`, () => {
      const accounts = [account('banana'), account('Apple'), account('cherry')]
      accounts.sort(AccountMgmt.sortByName)
      assert.deepEqual(
        accounts.map((a) => a.name),
        ['Apple', 'banana', 'cherry']
      )
    })

    it(`should not throw when a name is not a string (e.g. boolean from a value-less CLI flag)`, () => {
      const accounts = [account(true), account('apple'), account(123)]
      assert.doesNotThrow(() => accounts.sort(AccountMgmt.sortByName))
      assert.deepEqual(
        accounts.map((a) => a.name),
        [123, 'apple', true]
      )
    })
  })
})
