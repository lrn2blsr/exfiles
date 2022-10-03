import dotenv from 'dotenv'
dotenv.config()

import { PassThrough } from 'stream'
import { Request, Response } from 'express'

import { S3, _Error } from '@aws-sdk/client-s3'
const s3 = new S3({})

export async function handleDownload(req: Request, res: Response) {
  try {
    let s3File = await s3.getObject({
      Bucket: process.env.BUCKET,
      Key: 'newsletter.zip',
    })

    const stream = PassThrough.from(s3File.Body!)
    res.attachment('newsletter.zip')
    stream.pipe(res)
  } catch (error) {
    if ((error as _Error).Code === 'NoSuchKey') {
      console.log(`No such key`)
      res.status(404).json({ msg: 'No files bucket' })
    } else {
      console.log(error)
      res.status(500).json({ msg: 'Something went wrong' })
    }
  }
}
