import fs from 'fs'
import parse from 'csv-parse'

export default {
  csv(filepath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const rows: any[] = []
      // bom: Excel's default "CSV UTF-8" export prefixes a BOM that would
      // otherwise corrupt the first header ('name' -> '﻿name');
      // skip_empty_lines: stray blank lines would otherwise abort the parse
      const parser = parse({ columns: true, bom: true, skip_empty_lines: true })
      parser.on('error', reject)
      // the parser is a stream: rows have to be consumed via 'readable' or
      // its 'end' event never fires (and 'end' carries no rows itself)
      parser.on('readable', () => {
        let row
        while ((row = parser.read())) {
          rows.push(row)
        }
      })
      parser.on('end', () => resolve(rows))
      fs.createReadStream(filepath).on('error', reject).pipe(parser)
    })
  },
}
