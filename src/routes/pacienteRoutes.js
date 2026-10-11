const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const Paciente = require('../models/Paciente')
const authMiddleware = require('../middlewares/authMiddleware')

// Listar pacientes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pacientes = await Paciente.find().select('-senha')
    res.json(pacientes)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar pacientes', error: erro.message })
  }
})

// Buscar por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const paciente = await Paciente.findById(req.params.id).select('-senha')
    if (!paciente) return res.status(404).json({ mensagem: 'Paciente não encontrado' })
    res.json(paciente)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar paciente', error: erro.message })
  }
})

// Criar Paciente
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, email, senha, dataNascimento, telefone } = req.body

    if (!nome || !email || !senha || !dataNascimento) {
      return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' })
    }

    const existeEmail = await Paciente.findOne({ email })
    if (existeEmail) {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado no sistema.' })
    }

    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash(senha, salt)

    const ultimo = await Paciente.findOne().sort({ idAuto: -1 })
    const proximoIdAuto = ultimo && ultimo.idAuto ? ultimo.idAuto + 1 : 1

    const novoPaciente = new Paciente({
      idAuto: proximoIdAuto,
      nome,
      email,
      senha: senhaHash,
      role: 'user',
      dataNascimento,
      telefone
    })

    await novoPaciente.save()

    const pacienteRetorno = novoPaciente.toObject()
    delete pacienteRetorno.senha

    res.status(201).json({ mensagem: 'Paciente cadastrado com sucesso!', paciente: pacienteRetorno })
  } catch (erro) {
    if (erro.code === 11000) {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado no sistema.' })
    }
    res.status(500).json({ mensagem: 'Erro ao cadastrar paciente', error: erro.message })
  }
})

// Atualizar Paciente
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nome, dataNascimento, telefone, ativo } = req.body
    const pacienteAtualizado = await Paciente.findByIdAndUpdate(
      req.params.id,
      { nome, dataNascimento, telefone, ativo },
      { new: true, runValidators: true }
    ).select('-senha')

    if (!pacienteAtualizado) return res.status(404).json({ mensagem: 'Paciente não encontrado' })
    res.json({ mensagem: 'Paciente atualizado com sucesso!', paciente: pacienteAtualizado })
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao atualizar paciente', error: erro.message })
  }
})

// Deletar Paciente
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletado = await Paciente.findByIdAndDelete(req.params.id)
    if (!deletado) return res.status(404).json({ mensagem: 'Paciente não encontrado' })
    res.json({ mensagem: 'Paciente excluído com sucesso!' })
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao excluir paciente', error: erro.message })
  }
})

module.exports = router