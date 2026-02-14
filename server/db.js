require('dotenv').config()
const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_forum'
const client = new MongoClient(MONGODB_URI)
let _db

async function connect() {
  if (!_db) {
    await client.connect()
    _db = client.db() // use DB from URI
  }
  return _db
}

function collection(name) {
  if (!_db) throw new Error('Database not connected. Call connect() first.')
  return _db.collection(name)
}

module.exports = { connect, collection, client }
