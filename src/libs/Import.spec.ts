import { describe, it, before, after } from 'node:test'
import assert from 'assert'
import fs from 'fs'
import os from 'os'
import path from 'path'
import Import from './Import.ts'

describe('Import', function () {
  describe('#csv()', function () {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hide-import-test-'))
    const csvPath = path.join(tmpDir, 'accounts.csv')

    before(() => {
      fs.writeFileSync(
        csvPath,
        [
          'name,username,password,extra',
          'account1,user1,pass1,extra1',
          'account2,user2,pass2,',
        ].join('\n')
      )
    })

    after(() => {
      fs.unlinkSync(csvPath)
      fs.rmdirSync(tmpDir)
    })

    it(`should resolve with all parsed rows`, async () => {
      const rows = await Import.csv(csvPath)
      assert.equal(rows.length, 2)
      assert.deepEqual(rows[0], {
        name: 'account1',
        username: 'user1',
        password: 'pass1',
        extra: 'extra1',
      })
      assert.equal(rows[1].name, 'account2')
    })

    it(`should handle a UTF-8 BOM (Excel "CSV UTF-8" export) and blank lines`, async () => {
      const bomCsvPath = path.join(tmpDir, 'bom.csv')
      fs.writeFileSync(
        bomCsvPath,
        '\ufeff' +
          'name,username,password,extra\nacct1,u1,p1,e1\n\nacct2,u2,p2,e2\n\n'
      )
      try {
        const rows = await Import.csv(bomCsvPath)
        assert.equal(rows.length, 2)
        assert.equal(rows[0].name, 'acct1')
        assert.equal(rows[1].name, 'acct2')
      } finally {
        fs.unlinkSync(bomCsvPath)
      }
    })

    it(`should reject on a nonexistent file`, async () => {
      let threw = false
      try {
        await Import.csv(path.join(tmpDir, 'does-not-exist.csv'))
      } catch (err) {
        threw = true
      }
      assert.equal(threw, true)
    })
  })
})
