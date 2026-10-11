const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function register(req, res) {
  const senhaHash = await bcrypt.hash(req.body.senha, 10)

  const user = await User.create({
    nome: req.body.nome,
    email: req.body.email,
    senha: senhaHash,
    role: req.body.role || 'user'
  })

  res.status(201).json({
    id: user._id,
    nome: user.nome,
    email: user.email,
    role: user.role
  })
}

async function login(req, res) {
  const user = await User.findOne({
    email: req.body.email
  })

  if (!user) {
    return res.status(401).json({
      mensagem: 'E-mail ou senha inválidos'
    })
  }

  const senhaValida = await bcrypt.compare(
    req.body.senha,
    user.senha
  )

  if (!senhaValida) {
    return res.status(401).json({
      mensagem: 'E-mail ou senha inválidos'
    })
  }

  const token = jwt.sign(
    {
      id: user._id,
      nome: user.nome,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h'
    }
  )

  res.json({
    token,
    usuario: {
      id: user._id,
      nome: user.nome,
      email: user.email,
      role: user.role
    }
  })
}

module.exports = {
  register,
  login
}