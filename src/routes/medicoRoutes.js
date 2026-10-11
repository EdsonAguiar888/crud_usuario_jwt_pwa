const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const Medico = require('../models/Medico')
const authMiddleware = require('../middlewares/authMiddleware')

// Listar médicos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const medicos = await Medico.find().select('-senha')
    res.json(medicos)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar médicos', error: erro.message })
  }
})

// Buscar por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const medico = await Medico.findById(req.params.id).select('-senha')
    if (!medico) return res.status(404).json({ mensagem: 'Médico não encontrado' })
    res.json(medico)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar médico', error: erro.message })
  }
})

// Criar Médico
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, email, senha, crm, especialidade, telefone } = req.body

    if (!nome || !email || !senha || !crm || !especialidade) {
      return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' })
    }

    const existeEmail = await Medico.findOne({ email })
    if (existeEmail) {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado no sistema.' })
    }

    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash(senha, salt)

    const ultimo = await Medico.findOne().sort({ idAuto: -1 })
    const proximoIdAuto = ultimo && ultimo.idAuto ? ultimo.idAuto + 1 : 1

    const novoMedico = new Medico({
      idAuto: proximoIdAuto,
      nome,
      email,
      senha: senhaHash,
      role: 'user',
      crm,
      especialidade,
      telefone
    })

    await novoMedico.save()

    const medicoRetorno = novoMedico.toObject()
    delete medicoRetorno.senha

    res.status(201).json({ mensagem: 'Médico cadastrado com sucesso!', medico: medicoRetorno })
  } catch (erro) {
    if (erro.code === 11000) {
      return res.status(409).json({ mensagem: 'E-mail ou CRM já cadastrados.' })
    }
    res.status(500).json({ mensagem: 'Erro ao cadastrar médico', error: erro.message })
  }
})

// Atualizar Médico
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nome, especialidade, telefone, ativo } = req.body
    const medicoAtualizado = await Medico.findByIdAndUpdate(
      req.params.id,
      { nome, especialidade, telefone, ativo },
      { new: true, runValidators: true }
    ).select('-senha')

    if (!medicoAtualizado) return res.status(404).json({ mensagem: 'Médico não encontrado' })
    res.json({ mensagem: 'Médico atualizado com sucesso!', medico: medicoAtualizado })
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao atualizar médico', error: erro.message })
  }
})

// Deletar Médico
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletado = await Medico.findByIdAndDelete(req.params.id)
    if (!deletado) return res.status(404).json({ mensagem: 'Médico não encontrado' })
    res.json({ mensagem: 'Médico excluído com sucesso!' })
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao excluir médico', error: erro.message })
  }
})

module.exports = router