require('dotenv').config()
const { connect, collection, client } = require('./db')

async function createIndexes() {
  try {
    await connect()
    console.log('Creating MongoDB indexes...')

    // Users collection indexes
    await collection('users').createIndex({ username: 1 }, { unique: true })
    await collection('users').createIndex({ email: 1 }, { unique: true })
    console.log('✓ Users indexes created (unique username, email)')

    // Questions collection indexes
    await collection('questions').createIndex({ courseId: 1 })
    await collection('questions').createIndex({ userId: 1 })
    await collection('questions').createIndex({ createdAt: -1 })
    console.log('✓ Questions indexes created (courseId, userId, createdAt)')

    // Answers collection indexes
    await collection('answers').createIndex({ questionId: 1 })
    await collection('answers').createIndex({ userId: 1 })
    await collection('answers').createIndex({ createdAt: -1 })
    console.log('✓ Answers indexes created (questionId, userId, createdAt)')

    // Courses collection indexes
    await collection('courses').createIndex({ year: 1 })
    await collection('courses').createIndex({ type: 1 })
    console.log('✓ Courses indexes created (year, type)')

    console.log('\n✅ All indexes created successfully')
  } catch (err) {
    console.error('❌ Index creation failed:', err.message)
  } finally {
    await client.close()
    process.exit()
  }
}

createIndexes()
