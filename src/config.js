import path from 'path'
import appRootPath from 'app-root-path'

export default {
  filepath: process.env.NODE_HIDE_FILEPATH || '~',
  filename: process.env.NODE_HIDE_FILENAME || '__node-hide-accounts',

  cryptography: {
    algorithm: process.env.CRYPT_ALGORITHM || 'aes-256-ctr',
    password: process.env.CRYPT_SECRET
  }
}
