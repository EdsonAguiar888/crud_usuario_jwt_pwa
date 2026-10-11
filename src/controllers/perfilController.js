
const mongoose = require('mongoose')
const User = require('../models/User')

function criarController(Model, camposPermitidos) {
  async function list(req, res) {
    try {
      const registros = await Model.find()
        .populate('usuarioId', 'nome email')

      return res.json(registros)
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao listar registros'
      })
    }
  }

  async function findById(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          mensagem: 'ID inválido'
        })
      }

      const registro = await Model.findById(req.params.id)
        .populate('usuarioId', 'nome email')

      if (!registro) {
        return res.status(404).json({
          mensagem: 'Registro não encontrado'
        })
      }

      return res.json(registro)
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao consultar registro'
      })
    }
  }

  async function create(req, res) {
    try {
      const { usuarioId } = req.body

      if (!mongoose.isValidObjectId(usuarioId)) {
        return res.status(400).json({
          mensagem: 'ID de usuário inválido'
        })
      }

      const usuario = await User.findById(usuarioId)

      if (!usuario) {
        return res.status(404).json({
          mensagem: 'Usuário não encontrado'
        })
      }

      const dados = { usuarioId }

      for (const campo of camposPermitidos) {
        if (req.body[campo] !== undefined) {
          dados[campo] = req.body[campo]
        }
      }

      const registro = await Model.create(dados)

      await registro.populate('usuarioId', 'nome email')

      return res.status(201).json(registro)
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          mensagem: 'Usuário ou identificador já cadastrado'
        })
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          mensagem: 'Dados inválidos',
          detalhes: error.message
        })
      }

      return res.status(500).json({
        mensagem: 'Erro ao cadastrar registro'
      })
    }
  }

  async function update(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          mensagem: 'ID inválido'
        })
      }

      const dados = {}

      for (const campo of camposPermitidos) {
        if (req.body[campo] !== undefined) {
          dados[campo] = req.body[campo]
        }
      }

      const registro = await Model.findByIdAndUpdate(
        req.params.id,
        { $set: dados },
        {
          new: true,
          runValidators: true
        }
      ).populate('usuarioId', 'nome email')

      if (!registro) {
        return res.status(404).json({
          mensagem: 'Registro não encontrado'
        })
      }

      return res.json(registro)
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          mensagem: 'Identificador já cadastrado'
        })
      }

      return res.status(400).json({
        mensagem: 'Não foi possível atualizar o registro'
      })
    }
  }

  async function remove(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          mensagem: 'ID inválido'
        })
      }

      const registro = await Model.findByIdAndDelete(req.params.id)

      if (!registro) {
        return res.status(404).json({
          mensagem: 'Registro não encontrado'
        })
      }

      return res.json({
        mensagem: 'Registro removido com sucesso'
      })
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao remover registro'
      })
    }
  }

  return { list, findById, create, update, remove }
}

module.exports = criarController