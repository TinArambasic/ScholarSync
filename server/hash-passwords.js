require('dotenv').config()
const bcrypt = require('bcryptjs')
const { connect, collection, client } = require('./db')

async function run() {
  try {
    await connect()
    const users = await collection('users').find({}).toArray()

    console.log(`Found ${users.length} users to hash`)

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (user.password && !user.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(user.password, 10)
        await collection('users').updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        )
        console.log(`Hashed password for user: ${user.username}`)
      } else {
        console.log(`Skipping user ${user.username} (already hashed)`)
      }
    }

    console.log('Password hashing complete')
  } catch (err) {
    console.error('Hashing failed', err)
  } finally {
    await client.close()
    process.exit()
  }
}

run()
