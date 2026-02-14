// Validation utilities

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validateUsername(username) {
  // 3-20 characters, alphanumeric and underscore only
  const re = /^[a-zA-Z0-9_]{3,20}$/
  return re.test(username)
}

function validatePassword(password) {
  // At least 6 characters
  return password && password.length >= 6
}

function validateRequired(value) {
  return value !== undefined && value !== null && value.toString().trim() !== ''
}

function sanitizeString(str) {
  if (typeof str !== 'string') return ''
  return str.trim()
}

module.exports = {
  validateEmail,
  validateUsername,
  validatePassword,
  validateRequired,
  sanitizeString
}
