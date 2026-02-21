require('dotenv').config()
const { connect, collection } = require('./db')

async function fixAnswerCounts() {
  try {
    await connect()
    console.log('Connected to database')

    // Get all questions
    const questions = await collection('questions').find({}).toArray()
    console.log(`Found ${questions.length} questions`)

    let fixed = 0

    for (const question of questions) {
      // Count actual answers for this question
      const actualCount = await collection('answers').countDocuments({ 
        questionId: question._id 
      })

      // If count is different, update it
      if (question.answersCount !== actualCount) {
        console.log(`Question ${question._id}: stored count = ${question.answersCount}, actual count = ${actualCount}`)
        
        await collection('questions').updateOne(
          { _id: question._id },
          { $set: { answersCount: actualCount } }
        )
        
        fixed++
      }
    }

    console.log(`\nFixed ${fixed} questions with incorrect answer counts`)
    console.log('Done!')
    process.exit(0)
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

fixAnswerCounts()
