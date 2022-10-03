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

const staticFiles = path.join(__dirname, 'static')

app.use(express.json())
app.use(express.static(staticFiles))

app.get('/', (req, res) => {
  res.sendFile(path.resolve(staticFiles, 'index.html'))
})

app.post('/files', upload.array('newsletter'), async (req, res) => {
  if (!req.files) res.status(400).json({ msg: 'No files uploaded' })

  const throughStream = new PassThrough()

  try {
    await archiveFiles(req.files as Express.Multer.File[], throughStream)
    await uploadZipToS3(throughStream)
    res.status(201).json({ msg: 'Successfully uploaded' })
  } catch (error) {
    res.status(500).json({ msg: 'Something went wrong' })
    throw error
  }
})

app.get('/files', handleDownload)

app.use('*', (req, res) => {
  res.sendStatus(404).end()
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Server running at port: ${port}`)
})
