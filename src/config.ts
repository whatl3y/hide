interface IConfig {
  filepath: string
  filename: string
  cryptography: IConfigCrypto
}

interface IConfigCrypto {
  algorithm: string
  password: string
}

const config: IConfig = {
  filepath: process.env.NODE_HIDE_FILEPATH || getHomeDirectory(),
  filename: process.env.NODE_HIDE_FILENAME || '__node-hide-accounts',

  cryptography: {
    algorithm: process.env.CRYPT_ALGORITHM || 'aes-256-ctr',
    password: process.env.CRYPT_SECRET || 'hide',
  },
}

export default config

function getHomeDirectory() {
  return (
    process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] || '.'
  )
}
