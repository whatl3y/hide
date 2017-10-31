import readline from 'readline'

export default function Readline() {
  return {
    rl: readline.createInterface({ input: process.stdin, output: process.stdout }),

    ask(question, close=true) {
      return new Promise((resolve, reject) => {
        this.rl.question(question, answer => {
          resolve(answer)

          if (close)
            this.close()
        })
      })
    },

    close() {
      this.rl.close()
    }
  }
}
