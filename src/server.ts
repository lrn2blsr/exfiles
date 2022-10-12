import dotenv from 'dotenv'
dotenv.config()

import path from 'path'
import { PassThrough } from 'stream'

import express from 'express'
const app = express()

import multer from 'multer'
const upload = multer()

import { archiveFiles } from './archiveFiles'
import { uploadZipToS3 } from './uploadZipToS3'
import { handleDownload } from './handleDownload'
import { saveZipFile } from './saveZipFile'
import { createReadStream } from 'fs'

const staticFiles = path.join(__dirname, 'static')

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.static(staticFiles))

app.get('/', (req, res) => {
  res.sendFile(path.resolve(staticFiles, 'index.html'))
})

app.post('/files', upload.array('newsletter'), async (req, res) => {
  if (!req.files) res.status(400).json({ msg: 'No files uploaded' })

  const throughStream = new PassThrough()

  try {
    await archiveFiles(req.files as Express.Multer.File[], throughStream)
    // await uploadZipToS3(throughStream)
    const result = await saveZipFile(throughStream)
    if (result) {
      console.log(result)
      res.status(201).json({ msg: 'Successfully uploaded' })
    }
  } catch (error) {
    res.status(500).json({ msg: 'Something went wrong' })
    throw error
  }
})

// app.get('/files', handleDownload)

app.get('/files', (req, res) => {
  const filePath = path.join(__dirname, 'files/newsletter.zip')
  const rs = createReadStream(filePath)
  res.attachment('newsletter.zip')
  rs.pipe(res)
})

app.use('*', (req, res) => {
  res.sendStatus(404).end()
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Server running at port: ${port}`)
})
