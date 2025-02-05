const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      if (file.endsWith('.mdx') || file.endsWith('.md')) {
        arrayOfFiles.push(path.join(dirPath, file))
      }
    }
  })

  return arrayOfFiles
}

function generateTagData() {
  const blogDir = path.join(process.cwd(), 'data/blog')
  const tagData = {}

  const files = getAllFiles(blogDir)

  files.forEach((file) => {
    const source = fs.readFileSync(file, 'utf8')
    const { data } = matter(source)
    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach((tag) => {
        const formattedTag = tag.toLowerCase()
        tagData[formattedTag] = (tagData[formattedTag] || 0) + 1
      })
    }
  })

  // Write the tag data to a JSON file
  const tagDataPath = path.join(process.cwd(), 'app/tag-data.json')
  fs.writeFileSync(tagDataPath, JSON.stringify(tagData))
  console.log('Tag data generated successfully!')
}

generateTagData() 