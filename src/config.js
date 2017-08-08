import path from 'path'

export default {
  filepath: process.env.PASSWORDS_FILEPATH || path.join(__dirname, '..', 'files'),
  filename: process.env.PASSWORDS_FILENAME || '__node-passwords',

  cryptography: {
    algorithm: process.env.CRYPT_ALGORITHM || 'aes-256-ctr',
    password: process.env.CRYPT_SECRET
  }
}
