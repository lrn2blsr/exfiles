import dotenv from 'dotenv'
dotenv.config()

import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

export async function uploadSingleToS3(files: Express.Multer.File[]) {
  for await (let file of files) {
    const upload = new Upload({
      params: {
        Bucket: process.env.BUCKET,
        Key: file.originalname,
        Body: file.buffer,
      },
      client: new S3({}),
    })

    upload.on('httpUploadProgress', (progress) => {
      console.log(progress)
    })

    await upload.done()
  }
}
