import { createWriteStream, existsSync, mkdirSync } from 'node:fs'
import * as path from 'node:path'
import { PassThrough } from 'node:stream'

const dir = path.resolve(__dirname, 'files')

export function saveZipFile(stream: PassThrough) {
  return new Promise(async (resolve, reject) => {
    if (!existsSync(dir)) {
      mkdirSync(dir)
    }
    const filePath = path.join(dir, 'newsletter.zip')
    const file = createWriteStream(filePath)
    stream.pipe(file)
    file.on('finish', (err: ErrorCallback) => {
      if (err) reject(err)
      resolve('Success')
    })
  })
}
