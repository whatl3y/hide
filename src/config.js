import path from 'path'
import appRootPath from 'app-root-path'

export default {
  filepath: process.env.NODE_HIDE_FILEPATH || getHomeDirectory(),
  filename: process.env.NODE_HIDE_FILENAME || '__node-hide-accounts',

  cryptography: {
    algorithm: process.env.CRYPT_ALGORITHM || 'aes-256-ctr',
    password: process.env.CRYPT_SECRET
  }
}

function getHomeDirectory() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
}
