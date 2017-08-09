import path from 'path'
import appRootPath from 'app-root-path'

export default {
  filepath: process.env.PASSWORDS_FILEPATH || path.join(appRootPath.path, '..', 'files'),
  filename: process.env.PASSWORDS_FILENAME || '__node-passwords',

  cryptography: {
    algorithm: process.env.CRYPT_ALGORITHM || 'aes-256-ctr',
    password: process.env.CRYPT_SECRET
  }
}
