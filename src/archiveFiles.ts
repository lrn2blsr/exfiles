import dotenv from 'dotenv'
dotenv.config()
import archiver from 'archiver'
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  unlink,
} from 'node:fs'
import * as path from 'node:path'
import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

const dir = path.resolve(__dirname, 'files')

export async function archiveFiles(files: Express.Multer.File[]) {
  if (!existsSync(dir)) {
    mkdirSync(dir)
  }
  const filePath = path.join(dir, 'newsletter.zip')
  const file = createWriteStream(filePath)

  const archive = archiver('zip', {
    zlib: { level: 9 },
    statConcurrency: 1,
  })

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.log('warning')
    } else {
      console.error(err)
    }
  })

  archive.on('error', function (err) {
    console.error(err)
  })

  archive.pipe(file)

  // file.on('finish', () => {})

  const upload = new Upload({
    params: {
      Bucket: process.env.BUCKET,
      Key: 'newsletter.zip',
      Body: createReadStream(filePath),
    },
    client: new S3({}),
  })

  // upload.on('httpUploadProgress', (progress) =>
  //   console.log('S3 Progress', progress)
  // )

  for (let file of files) {
    archive.append(file.buffer, { name: `${file.originalname}` })
  }

  try {
    await archive.finalize()
    const result = await upload.done()
    const ok = result.$metadata.httpStatusCode === 200
    return ok
  } catch (error) {
    throw error
  }
}
