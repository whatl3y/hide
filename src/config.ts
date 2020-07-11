interface IConfig {
  filepath: string
  filename: string
  cryptography: IConfigCrypto
}

interface IConfigCrypto {
  password: string | undefined
}

const config: IConfig = {
  filepath: process.env.NODE_HIDE_FILEPATH || getHomeDirectory(),
  filename: process.env.NODE_HIDE_FILENAME || '__node-hide-accounts',

  cryptography: {
    password: process.env.CRYPT_SECRET,
  },
}

export default config

function getHomeDirectory() {
  return (
    process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] || '.'
  )
}
