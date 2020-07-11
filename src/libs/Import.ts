import fs from 'fs'
import parse from 'csv-parse'

export default {
  csv(filepath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const parser = parse({ columns: true })
      parser.on('error', reject)
      parser.on('end', resolve)
      fs.createReadStream(filepath).pipe(parser)
    })
  },
}
