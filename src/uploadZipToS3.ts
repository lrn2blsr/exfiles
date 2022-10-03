import dotenv from 'dotenv'
dotenv.config()

import { PassThrough } from 'node:stream'

import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

export async function uploadZipToS3(throughStream: PassThrough) {
  const upload = new Upload({
    params: {
      Bucket: process.env.BUCKET,
      Key: 'newsletter.zip',
      Body: throughStream,
    },
    client: new S3({}),
  })

  upload.on('httpUploadProgress', (progress) => console.log(progress))

  await upload.done()
}
