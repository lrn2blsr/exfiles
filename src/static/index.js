const form = document.querySelector('form')
const dropArea = document.getElementById('drop-area')
const resetBtn = document.getElementById('reset')
const imgBox = document.getElementById('img-box')

form.addEventListener('submit', handleFormSubmit)

dropArea.addEventListener('dragenter', handleDragEnter)
dropArea.addEventListener('dragleave', handleDragLeave)
dropArea.addEventListener('dragover', handleDragOver)
dropArea.addEventListener('drop', handleDrop)

resetBtn.addEventListener('click', resetFilesToUpload)

let filesToUpload = []

function handleDragEnter(ev) {
  ev.preventDefault()
  ev.stopPropagation()

  dropArea.classList.add(['highlight'])
}

function handleDragLeave(ev) {
  ev.preventDefault()
  ev.stopPropagation()

  dropArea.classList.remove(['highlight'])
}

function handleDragOver(ev) {
  ev.preventDefault()
  ev.stopPropagation()

  dropArea.classList.add(['highlight'])
}

// Managing files to be uploaded

function handleDrop(ev) {
  ev.preventDefault()
  ev.stopPropagation()

  dropArea.classList.remove(['highlight'])

  const data = ev.dataTransfer
  const files = data?.files

  filesToUpload = [...files]
  dispayFiles(filesToUpload)
}

function handleChange(files) {
  filesToUpload = [...files]
  dispayFiles(filesToUpload)
}

function resetFilesToUpload() {
  filesToUpload = []
  dispayFiles(filesToUpload)
}

// Submitting files to server

async function handleFormSubmit(ev) {
  ev.preventDefault()

  const url = new URL('/files', window.location.origin)

  const formData = new FormData()
  filesToUpload?.forEach((file) => {
    formData.append('newsletter', file, file.name)
  })

  // Previous way of handling submitted files (with inline onchange handler)

  // let formData
  // if (filesToUpload.length) {
  //   formData = new FormData()
  //   filesToUpload?.forEach((file) => {
  //     formData.append('newsletter', file, file.name)
  //   })
  // } else {
  //   formData = new FormData(ev.target)
  // }

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  yieldResult(response.ok)
}

// Displaying information about result to users

function yieldResult(success) {
  const h2 = document.createElement('h2')
  h2.style.padding = '1rem 2rem'
  h2.style.margin = '1rem auto'

  if (success) {
    h2.textContent = 'Files successfully uploaded'
    h2.style.border = '2px solid green'
    filesToUpload = []
    dispayFiles(filesToUpload)
  } else {
    h2.textContent = 'Ups..., Something went wrong!'
    h2.style.border = '2px solid red'
  }

  dropArea.style.display = 'none'
  const infoBar = form.insertBefore(
    h2,
    form.firstElementChild.nextElementSibling
  )

  setTimeout(() => {
    form.removeChild(infoBar)
    dropArea.style.display = 'block'
  }, 4000)
}

// Displaying visual information about files which will be submitted

function dispayFiles(files) {
  if (!files.length) {
    while (imgBox.hasChildNodes()) {
      imgBox.removeChild(imgBox.lastElementChild)
    }
    return
  }

  for (let file of files) {
    const reader = new FileReader()

    reader.readAsDataURL(file)
    reader.onloadend = function displayPreview() {
      const img = document.createElement('img')
      img.src = reader.result
      img.alt = file.name
      imgBox.appendChild(img)
    }
  }
}
