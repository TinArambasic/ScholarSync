require('dotenv').config()
const { connect, collection } = require('./db')

async function migrate() {
  try {
    await connect()
    console.log('Connected to database')

    // Update all users to have joinedCourses array if they don't have one
    const result = await collection('users').updateMany(
      { joinedCourses: { $exists: false } },
      { $set: { joinedCourses: [] } }
    )

    console.log(`Migration complete: ${result.modifiedCount} users updated with joinedCourses field`)
    process.exit(0)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  }
}

migrate()
