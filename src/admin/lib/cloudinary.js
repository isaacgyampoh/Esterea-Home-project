const CLOUD  = 'dd6iapard'
const PRESET = 'esterea_unsigned'

// Transform a Cloudinary URL to a width-optimised version.
export const cdn = (url, w = 80) =>
  url ? url.replace('/upload/', `/upload/w_${w},q_auto,f_auto/`) : ''

// Upload a file to Cloudinary (unsigned). Reports progress 0-100.
export function uploadImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', PRESET)
    fd.append('folder', 'esterea')

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`)

    xhr.upload.onprogress = e => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText)
        if (res.secure_url) resolve(res.secure_url)
        else reject(new Error(res.error?.message || 'Upload failed'))
      } catch {
        reject(new Error('Upload failed'))
      }
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(fd)
  })
}
