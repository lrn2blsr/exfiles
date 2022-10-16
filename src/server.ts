import dotenv from 'dotenv'
dotenv.config()

import path from 'path'

import express, { NextFunction, Request, Response } from 'express'
const app = express()

import multer from 'multer'
const upload = multer()
// const upload = multer({
//   limits: {
//     files: 15,
//     fileSize: 3 * 1024 * 1024,
//     fieldSize: 3 * 1024 * 1024,
//   },
//   fileFilter(req, file, callback) {
//     callback(null, true)
//   },
// })

import { archiveFiles } from './archiveFiles'
import { handleDownload } from './handleDownload'
import { createReadStream } from 'fs'

const staticFiles = path.join(__dirname, 'static')

// issue with upload size was with nginx default settings, but leaving this change for now
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.static(staticFiles))

app.get('/', (req, res) => {
  res.sendFile(path.resolve(staticFiles, 'index.html'))
})

app.post('/files', upload.array('newsletter'), async (req, res) => {
  if (!req.files) res.status(400).json({ msg: 'No files uploaded' })

  try {
    const result = await archiveFiles(req.files as Express.Multer.File[])
    if (result) {
      return res.status(201).json({ msg: 'Successfully uploaded' })
    }

    throw new Error('Something went during archiving or uploading to s3.')
  } catch (error) {
    res.status(500).json({ msg: 'Something went wrong' })
    throw error
  }
})

app.get('/files', handleDownload)

// app.get('/files', (req, res) => {
//   const filePath = path.join(__dirname, 'files/newsletter.zip')
//   const rs = createReadStream(filePath)
//   res.attachment('newsletter.zip')
//   rs.pipe(res)
// })

app.use('*', (req, res) => {
  res.sendStatus(404).end()
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  next()
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Server running at port: ${port}`)
})
