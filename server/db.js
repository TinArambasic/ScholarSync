require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})
let _db

async function connect() {
  if (!_db) {
    await client.connect()
    _db = MONGODB_DB_NAME ? client.db(MONGODB_DB_NAME) : client.db()
  }
  return _db
}

function collection(name) {
  if (!_db) throw new Error('Database not connected. Call connect() first.')
  return _db.collection(name)
}

module.exports = { connect, collection, client }
