const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, 'data', 'db.json')
function readDB(){
  try{ return JSON.parse(fs.readFileSync(DB_PATH)) } catch(e) { return { questions:[], answers:[], users:[], courses:[], notifications:[] } }
}
function writeDB(data){ fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)) }

const app = express()
app.use(cors())
app.use(express.json())

// Simple endpoints
app.get('/api/questions', (req, res) => {
  const db = readDB()
  res.json(db.questions)
})

app.get('/api/questions/:id', (req, res) => {
  const db = readDB()
  const q = db.questions.find(x => x._id === req.params.id)
  if(!q) return res.status(404).json({ message: 'Not found' })
  res.json(q)
})

app.get('/api/answers', (req, res) => {
  const { questionId } = req.query
  const db = readDB()
  let answers = db.answers
  if(questionId) answers = answers.filter(a => a.questionId === questionId)
  res.json(answers)
})

app.get('/api/users', (req, res) => {
  const db = readDB()
  res.json(db.users)
})

app.get('/api/courses', (req, res) => {
  const db = readDB()
  res.json(db.courses)
})

app.post('/api/answers', (req, res) => {
  const { content, questionId, author, userId } = req.body
  if(!content || !questionId) return res.status(400).json({ message: 'Invalid' })
  const db = readDB()
  const answer = { _id: 'a' + Date.now(), content, questionId, userId: userId || 'anonymous', author: author || { username: 'Anonymous', role: 'user' }, createdAt: new Date().toISOString(), isHighlighted: false }
  db.answers.push(answer)
  writeDB(db)
  res.json(answer)
})

app.patch('/api/answers/:id', (req, res) => {
  const db = readDB()
  const idx = db.answers.findIndex(a => a._id === req.params.id)
  if(idx === -1) return res.status(404).json({ message: 'Not found' })
  db.answers[idx] = { ...db.answers[idx], ...req.body }
  writeDB(db)
  res.json(db.answers[idx])
})

app.delete('/api/answers/:id', (req, res) => {
  const db = readDB()
  const idx = db.answers.findIndex(a => a._id === req.params.id)
  if(idx === -1) return res.status(404).json({ message: 'Not found' })
  const deleted = db.answers.splice(idx, 1)
  writeDB(db)
  res.json({ success: true })
})

// Auth endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  if(!username || !password) return res.status(400).json({ success: false, message: 'Potrebna korisničko ime i lozinka' })
  
  const db = readDB()
  
  // Demo user
  if(username === 'demo' && password === 'demo123'){
    const demoUser = { _id: 'u_demo', username: 'demo', email: 'demo@example.com', role: 'student', joinedCourses: [] }
    return res.json({ success: true, user: demoUser })
  }
  
  // Find user in DB
  const user = db.users.find(u => u.username === username && u.password === password)
  if(!user) return res.status(401).json({ success: false, message: 'Krivo korisničko ime ili lozinka' })
  
  res.json({ success: true, user: { _id: user._id, username: user.username, email: user.email, role: user.role, joinedCourses: user.joinedCourses } })
})

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body
  if(!username || !email || !password) return res.status(400).json({ success: false, message: 'Sva polja su obavezna' })
  
  const db = readDB()
  if(db.users.find(u => u.username === username)) return res.status(400).json({ success: false, message: 'Korisničko ime je već zauzeto' })
  
  const newUser = { _id: 'u' + Date.now(), username, email, password, role: 'student', joinedCourses: [], createdAt: new Date().toISOString() }
  db.users.push(newUser)
  writeDB(db)
  
  res.json({ success: true, user: { _id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role, joinedCourses: newUser.joinedCourses } })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API listening on ${PORT}`))
