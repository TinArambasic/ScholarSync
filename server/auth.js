const jwt = require('jsonwebtoken')

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET
  const nodeEnv = process.env.NODE_ENV || 'development'
  const isProduction = nodeEnv === 'production'

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required. Set it in environment variables before starting the server.')
  }

  const isPlaceholderSecret = jwtSecret === 'your-super-secret-jwt-key-change-this-in-production'

  if (isPlaceholderSecret || jwtSecret.length < 32) {
    if (isProduction) {
      throw new Error('JWT_SECRET is insecure in production. Use a strong random secret with at least 32 characters.')
    }

    console.warn('Warning: JWT_SECRET is weak or placeholder. Use a strong random secret before deploying.')
  }

  return jwtSecret
}

const JWT_SECRET = getJwtSecret()

function generateToken(user) {
  return jwt.sign(
    { 
      _id: user._id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// Optional middleware - doesn't fail if no token
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null
    return next()
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
  } catch (err) {
    req.user = null
  }
  
  next()
}

function verifySocketToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

module.exports = { generateToken, verifyToken, optionalAuth, verifySocketToken }
