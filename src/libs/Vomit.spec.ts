import { describe, it } from 'node:test'
import assert from 'assert'
import Vomit from './Vomit.ts'

// capture everything written to console.log while `fn` runs
function captureLogs(fn: () => void): string {
  const originalLog = console.log
  const lines: string[] = []
  console.log = (...args: any[]) => {
    lines.push(args.map((a) => String(a)).join(' '))
  }
  try {
    fn()
  } finally {
    console.log = originalLog
  }
  return lines.join('\n')
}

describe('Vomit', function () {
  describe('#listAccounts()', function () {
    const account = (): any => ({
      name: 'facebook.com',
      username: 'fbuser',
      password: 'my_secret_pw',
      extra: '',
      uuid: 'def7f984-c2d7-4069-907c-facfad597123',
    })

    it(`hides the password (and its column) by default`, () => {
      const output = captureLogs(() => Vomit.listAccounts([account()], 1))
      assert.equal(output.includes('my_secret_pw'), false)
      assert.equal(/PASSWORD/i.test(output), false)
    })

    it(`shows the password when showPasswords is true`, () => {
      const output = captureLogs(() =>
        Vomit.listAccounts([account()], 1, true)
      )
      assert.equal(output.includes('my_secret_pw'), true)
    })

    it(`does not throw when given plain string entries`, () => {
      assert.doesNotThrow(() =>
        captureLogs(() => Vomit.listAccounts(['just-a-name'] as any, 1, true))
      )
    })
  })
})
