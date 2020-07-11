import readline from 'readline'

export default function Readline() {
  return {
    rl: readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    }),

    ask(question: string, close: boolean = true): Promise<string> {
      return new Promise((resolve) => {
        this.rl.question(question, (answer) => {
          resolve(answer)

          if (close) this.close()
        })
      })
    },

    close() {
      this.rl.close()
    },
  }
}
