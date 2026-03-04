import fs from 'fs'

const getDownloads = (downloadsPath: string) => fs.readdirSync(downloadsPath)
const resetDownloads = (downloadsPath: string) => {
  fs.rmSync(downloadsPath, { recursive: true, force: true })
  return null
}

export default {
  getDownloads,
  resetDownloads,
}
