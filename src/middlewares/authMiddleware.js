const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const token = req.headers.authorization.split(' ')[1]
  const payload = jwt.verify(token, process.env.JWT_SECRET)
  req.user = payload
  next()
}

module.exports = authMiddleware
