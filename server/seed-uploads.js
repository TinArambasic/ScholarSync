const fs = require('fs')
const path = require('path')

// Copy any bundled files from seed-uploads/ into the uploads/ directory
// (the Railway volume) on startup, so existing attachments/profile pictures
// survive the move to persistent storage. Existing files are never overwritten.
function seedUploads() {
  const seedDir = path.join(__dirname, 'seed-uploads')
  const uploadDir = path.join(__dirname, 'uploads')

  if (!fs.existsSync(seedDir)) return
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  let copied = 0
  for (const file of fs.readdirSync(seedDir)) {
    if (file === '.gitignore') continue
    const src = path.join(seedDir, file)
    const dest = path.join(uploadDir, file)
    if (fs.statSync(src).isFile() && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest)
      copied++
    }
  }

  if (copied > 0) console.log(`Seeded ${copied} file(s) into uploads`)
}

module.exports = seedUploads
