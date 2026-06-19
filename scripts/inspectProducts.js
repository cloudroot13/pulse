const fs = require('fs')
const path = 'src/data/products.ts'
const s = fs.readFileSync(path, 'utf8')
const start = s.indexOf('export const productCatalog')
if (start === -1) { console.error('productCatalog not found'); process.exit(1) }
const arrStart = s.indexOf('[', start)
const arrEnd = s.indexOf('\n]', arrStart)
const content = s.slice(arrStart + 1, arrEnd)
const items = content.split(/\n\s*},\s*\n\s*\{/)
items.forEach((it) => {
  const idMatch = it.match(/id:\s*'([^']+)'/)
  const imageMatch = it.match(/image:\s*([a-zA-Z0-9_\.\-]+)/)
  const galleryMatch = it.match(/gallery:\s*\[([^\]]+)\]/s)
  if (idMatch) {
    const id = idMatch[1]
    const image = imageMatch ? imageMatch[1] : '<no image>'
    const gallery = galleryMatch ? galleryMatch[1].replace(/\s+/g,' ').trim() : ''
    console.log(id.padEnd(30), '->', image.padEnd(30), 'gallery:', gallery)
  }
})
