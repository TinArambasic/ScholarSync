require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const { connect, collection } = require('./db')
const { validateEmail, validateUsername, validatePassword, validateRequired, sanitizeString } = require('./validation')
const { generateToken, verifyToken, optionalAuth } = require('./auth')
const upload = require('./upload')

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Helper to start server after DB connects
async function start() {
  await connect()

  // Questions
  app.get('/api/questions', optionalAuth, async (req, res) => {
    try {
      const { forYou } = req.query
      
      // If forYou=true and user is authenticated, filter by joined courses
      if (forYou === 'true' && req.user) {
        const user = await collection('users').findOne({ _id: req.user._id })
        const joinedCourses = user?.joinedCourses || []
        
        if (joinedCourses.length === 0) {
          return res.json([])
        }
        
        const docs = await collection('questions')
          .find({ courseId: { $in: joinedCourses } })
          .toArray()
        return res.json(docs)
      }
      
      // Default: return all questions
      const docs = await collection('questions').find({}).toArray()
      res.json(docs)
    } catch (err) { 
      console.error('Error fetching questions:', err)
      res.status(500).json({ message: 'DB error' }) 
    }
  })

  app.get('/api/questions/:id', async (req, res) => {
    try {
      const q = await collection('questions').findOne({ _id: req.params.id })
      if(!q) return res.status(404).json({ message: 'Not found' })
      res.json(q)
    } catch (err) { res.status(500).json({ message: 'DB error' }) }
  })

  app.post('/api/questions', verifyToken, upload.single('attachment'), async (req, res) => {
    try {
      let { title, content, courseId } = req.body
      
      title = sanitizeString(title)
      content = sanitizeString(content)
      courseId = sanitizeString(courseId)
      
      if(!validateRequired(title) || !validateRequired(content) || !validateRequired(courseId)) {
        return res.status(400).json({ message: 'Sva polja su obavezna' })
      }
      
      if(title.length < 5) {
        return res.status(400).json({ message: 'Naslov mora imati najmanje 5 znakova' })
      }
      if(content.length < 10) {
        return res.status(400).json({ message: 'Sadržaj mora imati najmanje 10 znakova' })
      }
      
      const question = {
        _id: 'q' + Date.now(),
        title,
        content,
        courseId,
        userId: req.user._id,
        author: { username: req.user.username, role: req.user.role },
        answersCount: 0,
        isCompleted: false,
        likes: [],
        createdAt: new Date().toISOString()
      }
      
      // Add attachment if file was uploaded
      if (req.file) {
        question.attachment = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: `/uploads/${req.file.filename}`,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      }
      
      await collection('questions').insertOne(question)
      res.json(question)
    } catch (err) { 
      console.error('Error creating question:', err)
      res.status(500).json({ message: err.message || 'DB error' }) 
    }
  })

  app.patch('/api/questions/:id', verifyToken, async (req, res) => {
    try {
      const id = req.params.id
      const question = await collection('questions').findOne({ _id: id })
      
      if(!question) return res.status(404).json({ message: 'Question not found' })
      
      // Only allow author or admin to update
      if(question.userId !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - you can only update your own questions' })
      }
      
      // Allow updating isCompleted field
      const { isCompleted } = req.body
      const updateFields = {}
      
      if (typeof isCompleted === 'boolean') {
        updateFields.isCompleted = isCompleted
      }
      
      await collection('questions').updateOne({ _id: id }, { $set: updateFields })
      const updated = await collection('questions').findOne({ _id: id })
      
      res.json(updated)
    } catch (err) { 
      console.error('Error updating question:', err)
      res.status(500).json({ message: 'DB error' }) 
    }
  })

  app.delete('/api/questions/:id', verifyToken, async (req, res) => {
    try {
      const id = req.params.id
      const question = await collection('questions').findOne({ _id: id })
      
      if(!question) return res.status(404).json({ message: 'Question not found' })
      
      // Only allow author or admin to delete
      if(question.userId !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - you can only delete your own questions' })
      }
      
      await collection('questions').deleteOne({ _id: id })
      // Also delete associated answers
      await collection('answers').deleteMany({ questionId: id })
      
      res.json({ success: true })
    } catch (err) { res.status(500).json({ message: 'DB error' }) }
  })

  app.post('/api/questions/:id/like', verifyToken, async (req, res) => {
    try {
      const id = req.params.id
      const userId = req.user._id
      const question = await collection('questions').findOne({ _id: id })
      
      if(!question) return res.status(404).json({ message: 'Question not found' })
      
      const likes = question.likes || []
      const hasLiked = likes.includes(userId)
      
      if (hasLiked) {
        // Unlike - remove user from likes array
        await collection('questions').updateOne(
          { _id: id },
          { $pull: { likes: userId } }
        )
      } else {
        // Like - add user to likes array
        await collection('questions').updateOne(
          { _id: id },
          { $addToSet: { likes: userId } }
        )
      }
      
      const updated = await collection('questions').findOne({ _id: id })
      res.json(updated)
    } catch (err) { 
      console.error('Error toggling question like:', err)
      res.status(500).json({ message: 'DB error' }) 
    }
  })

  // Answers
  app.get('/api/answers', async (req, res) => {
    try {
      const { questionId } = req.query
      const filter = questionId ? { questionId } : {}
      const answers = await collection('answers').find(filter).toArray()
      res.json(answers)
    } catch (err) { res.status(500).json({ message: 'DB error' }) }
  })

  app.get('/api/answers/:id', async (req, res) => {
    try {
      const answer = await collection('answers').findOne({ _id: req.params.id })
      if(!answer) return res.status(404).json({ message: 'Not found' })
      res.json(answer)
    } catch (err) { res.status(500).json({ message: 'DB error' }) }
  })

  app.post('/api/answers', verifyToken, upload.single('attachment'), async (req, res) => {
    try {
      let { content, questionId } = req.body
      
      // Sanitize content
      content = sanitizeString(content)
      
      // Validate required fields
      if(!validateRequired(content)) {
        return res.status(400).json({ message: 'Sadržaj odgovora je obavezan' })
      }
      if(!validateRequired(questionId)) {
        return res.status(400).json({ message: 'ID pitanja je obavezan' })
      }
      
      // Validate content length
      if(content.length < 10) {
        return res.status(400).json({ message: 'Odgovor mora imati najmanje 10 znakova' })
      }
      if(content.length > 5000) {
        return res.status(400).json({ message: 'Odgovor može imati maksimalno 5000 znakova' })
      }
      
      const answer = { 
        _id: 'a' + Date.now(), 
        content, 
        questionId, 
        userId: req.user._id, 
        author: { username: req.user.username, role: req.user.role }, 
        createdAt: new Date().toISOString(), 
        isHighlighted: false,
        likes: []
      }
      
      // Add attachment if file was uploaded
      if(req.file) {
        answer.attachment = '/uploads/' + req.file.filename
      }
      
      await collection('answers').insertOne(answer)
      
      // Increment answer count on question
      await collection('questions').updateOne(
        { _id: questionId },
        { $inc: { answersCount: 1 } }
      )
      
      res.json(answer)
    } catch (err) { res.status(500).json({ message: 'DB error' }) }
  })

  app.patch('/api/answers/:id', verifyToken, async (req, res) => {
    try {
      const id = req.params.id
      const answer = await collection('answers').findOne({ _id: id })
      
      if(!answer) return res.status(404).json({ message: 'Not found' })
      
      // Only allow author or admin to edit
      if(answer.userId !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - you can only edit your own answers' })
      }
      
      await collection('answers').updateOne({ _id: id }, { $set: req.body })
      const updated = await collection('answers').findOne({ _id: id })
      res.json(updated)
    } catch (err) { res.status(500).json({ message: 'DB error' }) }
  })

  app.delete('/api/answers/:id', verifyToken, async (req, res) => {
    try {
      const id = req.params.id
      const answer = await collection('answers').findOne({ _id: id })
      
      if(!answer) return res.status(404).json({ message: 'Not found' })
      
      // Only allow author or admin to delete
      if(answer.userId !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - you can only delete your own answers' })
      }
      
      await collection('answers').deleteOne({ _id: id })
      
      // Decrement answer count on question
      await collection('questions').updateOne(
        { _id: answer.questionId },
        { $inc: { answersCount: -1 } }
      )
      
      res.json({ success: true })
    } catch (err) { res.status(500).json({ message: 'DB error' }) }
  })

  app.post('/api/answers/:id/like', verifyToken, async (req, res) => {
    try {
      const id = req.params.id
      const userId = req.user._id
      const answer = await collection('answers').findOne({ _id: id })
      
      if(!answer) return res.status(404).json({ message: 'Answer not found' })
      
      const likes = answer.likes || []
      const hasLiked = likes.includes(userId)
      
      if (hasLiked) {
        // Unlike - remove user from likes array
        await collection('answers').updateOne(
          { _id: id },
          { $pull: { likes: userId } }
        )
      } else {
        // Like - add user to likes array
        await collection('answers').updateOne(
          { _id: id },
          { $addToSet: { likes: userId } }
        )
      }
      
      const updated = await collection('answers').findOne({ _id: id })
      res.json(updated)
    } catch (err) { 
      console.error('Error toggling answer like:', err)
      res.status(500).json({ message: 'DB error' }) 
    }
  })

  // Users & courses
  app.get('/api/users', async (req, res) => {
    try { res.json(await collection('users').find({}).toArray()) } catch (err) { res.status(500).json({ message: 'DB error' }) }
  })

  app.get('/api/courses', async (req, res) => {
    try { res.json(await collection('courses').find({}).toArray()) } catch (err) { res.status(500).json({ message: 'DB error' }) }
  })

  // Join course
  app.post('/api/courses/:courseId/join', verifyToken, async (req, res) => {
    try {
      const { courseId } = req.params
      const userId = req.user._id
      
      // Check if course exists
      const course = await collection('courses').findOne({ _id: courseId })
      if (!course) {
        return res.status(404).json({ message: 'Kolegij nije pronađen' })
      }
      
      // Check if already joined
      const user = await collection('users').findOne({ _id: userId })
      if (user.joinedCourses && user.joinedCourses.includes(courseId)) {
        return res.status(400).json({ message: 'Već ste pridruženi ovom kolegiju' })
      }
      
      // Add course to user's joinedCourses
      await collection('users').updateOne(
        { _id: userId },
        { $addToSet: { joinedCourses: courseId } }
      )
      
      res.json({ success: true, message: 'Uspješno ste se pridružili kolegiju' })
    } catch (err) {
      console.error('Error joining course:', err)
      res.status(500).json({ message: 'Greška prilikom pridruživanja kolegiju' })
    }
  })

  // Unjoin course
  app.post('/api/courses/:courseId/unjoin', verifyToken, async (req, res) => {
    try {
      const { courseId } = req.params
      const userId = req.user._id
      
      // Remove course from user's joinedCourses
      await collection('users').updateOne(
        { _id: userId },
        { $pull: { joinedCourses: courseId } }
      )
      
      res.json({ success: true, message: 'Uspješno ste napustili kolegij' })
    } catch (err) {
      console.error('Error unjoining course:', err)
      res.status(500).json({ message: 'Greška prilikom napuštanja kolegija' })
    }
  })

  // Search endpoint
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q ? req.query.q.toLowerCase() : ''
      
      if (!query || query.trim().length === 0) {
        return res.json({ questions: [], users: [], courses: [] })
      }
      
      // Search questions by title and content
      const questions = await collection('questions')
        .find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } }
          ]
        })
        .limit(10)
        .toArray()
      
      // Search users by username
      const users = await collection('users')
        .find({ username: { $regex: query, $options: 'i' } })
        .limit(10)
        .toArray()
      
      // Search courses by title and description
      const courses = await collection('courses')
        .find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        })
        .limit(10)
        .toArray()
      
      // Process questions to include course names
      const allCourses = await collection('courses').find({}).toArray()
      const processedQuestions = questions.map(q => ({
        ...q,
        courseName: allCourses.find(c => c._id === q.courseId)?.title || q.courseId
      }))
      
      res.json({
        questions: processedQuestions,
        users: users.map(u => ({ _id: u._id, username: u.username, profilePicture: u.profilePicture || '' })),
        courses
      })
    } catch (err) { 
      console.error('Search error:', err)
      res.status(500).json({ message: 'DB error' }) 
    }
  })

  // Auth
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body
      if(!username || !password) return res.status(400).json({ success: false, message: 'Potrebna korisničko ime i lozinka' })

      if(username === 'demo' && password === 'demo123'){
        const demoUser = { _id: 'u_demo', username: 'demo', email: 'demo@example.com', role: 'student', joinedCourses: [], bio: '', profilePicture: '' }
        const token = generateToken(demoUser)
        return res.json({ success: true, user: demoUser, token })
      }

      const user = await collection('users').findOne({ username })
      if(!user) return res.status(401).json({ success: false, message: 'Krivo korisničko ime ili lozinka' })

      // Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password)
      if(!isMatch) return res.status(401).json({ success: false, message: 'Krivo korisničko ime ili lozinka' })

      const userData = { _id: user._id, username: user.username, email: user.email, role: user.role, joinedCourses: user.joinedCourses, bio: user.bio || '', profilePicture: user.profilePicture || '' }
      const token = generateToken(userData)
      res.json({ success: true, user: userData, token })
    } catch (err) { res.status(500).json({ success: false, message: 'DB error' }) }
  })

  app.post('/api/register', async (req, res) => {
    try {
      let { username, email, password } = req.body
      
      // Sanitize inputs
      username = sanitizeString(username)
      email = sanitizeString(email)
      
      // Validate inputs
      if(!validateRequired(username) || !validateRequired(email) || !validateRequired(password)) {
        return res.status(400).json({ success: false, message: 'Sva polja su obavezna' })
      }
      
      if(!validateUsername(username)) {
        return res.status(400).json({ success: false, message: 'Korisničko ime mora biti 3-20 znakova (slova, brojevi, _)' })
      }
      
      if(!validateEmail(email)) {
        return res.status(400).json({ success: false, message: 'Nevažeća email adresa' })
      }
      
      if(!validatePassword(password)) {
        return res.status(400).json({ success: false, message: 'Lozinka mora imati najmanje 6 znakova' })
      }

      const exists = await collection('users').findOne({ username })
      if(exists) return res.status(400).json({ success: false, message: 'Korisničko ime je već zauzeto' })
      
      const emailExists = await collection('users').findOne({ email })
      if(emailExists) return res.status(400).json({ success: false, message: 'Email je već registriran' })

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = { _id: 'u' + Date.now(), username, email, password: hashedPassword, role: 'student', joinedCourses: [], bio: '', profilePicture: '', createdAt: new Date().toISOString() }
      await collection('users').insertOne(newUser)

      const userData = { _id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role, joinedCourses: newUser.joinedCourses, bio: newUser.bio, profilePicture: newUser.profilePicture }
      const token = generateToken(userData)
      res.json({ success: true, user: userData, token })
    } catch (err) { 
      if(err.code === 11000) {
        return res.status(400).json({ success: false, message: 'Korisnik već postoji' })
      }
      res.status(500).json({ success: false, message: 'DB error' }) 
    }
  })

  // Profile endpoints
  app.get('/api/profile', verifyToken, async (req, res) => {
    try {
      const user = await collection('users').findOne({ _id: req.user._id })
      if (!user) return res.status(404).json({ success: false, message: 'Korisnik nije pronađen' })
      
      const userData = { _id: user._id, username: user.username, email: user.email, role: user.role, joinedCourses: user.joinedCourses, bio: user.bio || '', profilePicture: user.profilePicture || '' }
      res.json({ success: true, user: userData })
    } catch (err) {
      res.status(500).json({ success: false, message: 'DB error' })
    }
  })

  app.patch('/api/profile', verifyToken, (req, res, next) => {
    upload.single('profilePicture')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: 'Greška pri uploadu: ' + err.message })
      }
      next()
    })
  }, async (req, res) => {
    try {
      let { email, username, bio, currentPassword, newPassword } = req.body
      const user = await collection('users').findOne({ _id: req.user._id })
      
      if (!user) return res.status(404).json({ success: false, message: 'Korisnik nije pronađen' })
      
      const updates = {}
      
      // Update username if provided
      if (username && username !== user.username) {
        username = sanitizeString(username)
        
        if (username.length < 3 || username.length > 20) {
          return res.status(400).json({ success: false, message: 'Korisničko ime mora biti 3-20 znakova' })
        }
        
        // Check if username already exists
        const usernameExists = await collection('users').findOne({ username, _id: { $ne: user._id } })
        if (usernameExists) {
          return res.status(400).json({ success: false, message: 'Korisničko ime je već zauzeto' })
        }
        
        updates.username = username
      }
      
      // Update email if provided
      if (email && email !== user.email) {
        email = sanitizeString(email)
        
        if (!validateEmail(email)) {
          return res.status(400).json({ success: false, message: 'Nevažeća email adresa' })
        }
        
        // Check if email already exists
        const emailExists = await collection('users').findOne({ email, _id: { $ne: user._id } })
        if (emailExists) {
          return res.status(400).json({ success: false, message: 'Email je već registriran' })
        }
        
        updates.email = email
      }
      
      // Update bio if provided
      if (bio !== undefined) {
        bio = sanitizeString(bio)
        
        if (bio.length > 500) {
          return res.status(400).json({ success: false, message: 'Biografija može imati maksimalno 500 znakova' })
        }
        
        updates.bio = bio
      }
      
      // Update profile picture if uploaded
      if (req.file) {
        updates.profilePicture = `/uploads/${req.file.filename}`
      }
      
      // Update password if provided
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Potrebna je trenutna lozinka' })
        }
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Netočna trenutna lozinka' })
        }
        
        if (!validatePassword(newPassword)) {
          return res.status(400).json({ success: false, message: 'Nova lozinka mora imati najmanje 6 znakova' })
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        updates.password = hashedPassword
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'Nema promjena za spremanje' })
      }
      
      // Update user in database
      await collection('users').updateOne(
        { _id: req.user._id },
        { $set: updates }
      )
      
      // Return updated user data
      const updatedUser = await collection('users').findOne({ _id: req.user._id })
      const userData = { 
        _id: updatedUser._id, 
        username: updatedUser.username, 
        email: updatedUser.email, 
        role: updatedUser.role, 
        joinedCourses: updatedUser.joinedCourses,
        bio: updatedUser.bio || '',
        profilePicture: updatedUser.profilePicture || ''
      }
      
      res.json({ success: true, message: 'Profil uspješno ažuriran', user: userData })
    } catch (err) {
      console.error('Error updating profile:', err)
      res.status(500).json({ success: false, message: 'DB error' })
    }
  })

  app.delete('/api/profile', verifyToken, async (req, res) => {
    try {
      const userId = req.user._id
      
      // Get all user's answers to update question counts
      const userAnswers = await collection('answers').find({ userId }).toArray()
      
      // Decrement answersCount for each question that has user's answer
      for (const answer of userAnswers) {
        await collection('questions').updateOne(
          { _id: answer.questionId },
          { $inc: { answersCount: -1 } }
        )
      }
      
      // Delete all user's answers
      await collection('answers').deleteMany({ userId })
      
      // Delete all user's questions
      await collection('questions').deleteMany({ userId })
      
      // Delete the user account
      await collection('users').deleteOne({ _id: userId })
      
      res.json({ success: true, message: 'Profil uspješno obrisan' })
    } catch (err) {
      console.error('Error deleting profile:', err)
      res.status(500).json({ success: false, message: 'DB error' })
    }
  })

  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => console.log(`API listening on ${PORT}`))
}

start().catch(err => {
  console.error('Failed to start server', err)
  process.exit(1)
})
