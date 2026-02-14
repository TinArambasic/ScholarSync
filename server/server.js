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
app.use(express.json())

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Helper to start server after DB connects
async function start() {
  await connect()

  // Questions
  app.get('/api/questions', async (req, res) => {
    try {
      const docs = await collection('questions').find({}).toArray()
      res.json(docs)
    } catch (err) { res.status(500).json({ message: 'DB error' }) }
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

  // Answers
  app.get('/api/answers', async (req, res) => {
    try {
      const { questionId } = req.query
      const filter = questionId ? { questionId } : {}
      const answers = await collection('answers').find(filter).toArray()
      res.json(answers)
    } catch (err) { res.status(500).json({ message: 'DB error' }) }
  })

  app.post('/api/answers', verifyToken, async (req, res) => {
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
        isHighlighted: false 
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

  // Users & courses
  app.get('/api/users', async (req, res) => {
    try { res.json(await collection('users').find({}).toArray()) } catch (err) { res.status(500).json({ message: 'DB error' }) }
  })

  app.get('/api/courses', async (req, res) => {
    try { res.json(await collection('courses').find({}).toArray()) } catch (err) { res.status(500).json({ message: 'DB error' }) }
  })

  // Auth
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body
      if(!username || !password) return res.status(400).json({ success: false, message: 'Potrebna korisničko ime i lozinka' })

      if(username === 'demo' && password === 'demo123'){
        const demoUser = { _id: 'u_demo', username: 'demo', email: 'demo@example.com', role: 'student', joinedCourses: [] }
        const token = generateToken(demoUser)
        return res.json({ success: true, user: demoUser, token })
      }

      const user = await collection('users').findOne({ username })
      if(!user) return res.status(401).json({ success: false, message: 'Krivo korisničko ime ili lozinka' })

      // Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password)
      if(!isMatch) return res.status(401).json({ success: false, message: 'Krivo korisničko ime ili lozinka' })

      const userData = { _id: user._id, username: user.username, email: user.email, role: user.role, joinedCourses: user.joinedCourses }
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
      const newUser = { _id: 'u' + Date.now(), username, email, password: hashedPassword, role: 'student', joinedCourses: [], createdAt: new Date().toISOString() }
      await collection('users').insertOne(newUser)

      const userData = { _id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role, joinedCourses: newUser.joinedCourses }
      const token = generateToken(userData)
      res.json({ success: true, user: userData, token })
    } catch (err) { 
      if(err.code === 11000) {
        return res.status(400).json({ success: false, message: 'Korisnik već postoji' })
      }
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
