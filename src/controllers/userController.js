const bcrypt = require('bcryptjs')
const User = require('../models/User')

async function list(req, res) {
  const users = await User.find().select('-senha')
  res.json(users)
}

async function findById(req, res) {
  const user = await User.findById(req.params.id).select('-senha')
  res.json(user)
}

async function create(req, res) {
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

async function update(req, res) {
  const dados = {
    nome: req.body.nome,
    email: req.body.email,
    role: req.body.role
  }

  if (req.body.senha) {
    dados.senha = await bcrypt.hash(req.body.senha, 10)
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    dados,
    { new: true }
  ).select('-senha')

  res.json(user)
}

async function remove(req, res) {
  await User.findByIdAndDelete(req.params.id)
  res.json({ mensagem: 'Usuário removido' })
}

module.exports = {
  list,
  findById,
  create,
  update,
  remove
}
