const fs = require('fs')
const path = require('path')
const { connect, collection, client } = require('./db')

async function run() {
  const dbFile = path.join(__dirname, 'data', 'db.json')
  const raw = fs.readFileSync(dbFile)
  const data = JSON.parse(raw)

  try {
    await connect()

    const collections = Object.keys(data)
    for (const name of collections) {
      const docs = data[name]
      const col = collection(name)
      // Clear existing and insert
      if (docs && docs.length) {
        await col.deleteMany({})
        await col.insertMany(docs)
        console.log(`Migrated ${docs.length} documents into ${name}`)
      } else {
        await col.deleteMany({})
        console.log(`Cleared collection ${name} (no documents to insert)`)
      }
    }
    console.log('Migration complete')
  } catch (err) {
    console.error('Migration failed', err)
  } finally {
    await client.close()
    process.exit()
  }
}

run()
