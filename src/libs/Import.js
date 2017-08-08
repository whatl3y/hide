import fs from 'fs'
import csv from 'csv'

export default {
  csv(filepath) {
    return new Promise((resolve, reject) => {
      const parser = csv.parse({columns: true}, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
      fs.createReadStream(filepath).pipe(parser)
    })
  }
}
