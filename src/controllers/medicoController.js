const Medico = require('../models/Medico');
const bcrypt = require('bcryptjs');

exports.listar = async (req, res) => {
  try {
    const medicos = await Medico.find().select('-senha');
    res.json(medicos);
  } catch (erro) {
    res.status(500).json({ message: 'Erro ao listar médicos', error: erro.message });
  }
};

exports.criar = async (req, res) => {
  try {
    const { nome, email, senha, crm, especialidade, telefone } = req.body;

    if (!nome || !email || !senha || !crm || !especialidade) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoMedico = new Medico({
      nome,
      email,
      senha: senhaHash,
      crm,
      especialidade,
      telefone
    });

    await novoMedico.save();
    
    const medicoRetorno = novoMedico.toObject();
    delete medicoRetorno.senha;

    res.status(201).json({ message: 'Médico cadastrado com sucesso!', medico: medicoRetorno });
  } catch (erro) {
    if (erro.code === 11000) {
      return res.status(409).json({ message: 'E-mail ou CRM já cadastrados.' });
    }
    res.status(500).json({ message: 'Erro ao cadastrar médico', error: erro.message });
  }
};


exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, especialidade, telefone, ativo } = req.body;

    const medicoAtualizado = await Medico.findByIdAndUpdate(
      id,
      { nome, especialidade, telefone, ativo },
      { new: true, runValidators: true }
    ).select('-senha');

    if (!medicoAtualizado) {
      return res.status(404).json({ message: 'Médico não encontrado.' });
    }

    res.json({ message: 'Médico atualizado com sucesso!', medico: medicoAtualizado });
  } catch (erro) {
    res.status(500).json({ message: 'Erro ao atualizar médico', error: erro.message });
  }
};


exports.remover = async (req, res) => {
  try {
    const { id } = req.params;
    const deletado = await Medico.findByIdAndDelete(id);

    if (!deletado) {
      return res.status(404).json({ message: 'Médico não encontrado.' });
    }

    res.json({ message: 'Médico excluído com sucesso!' });
  } catch (erro) {
    res.status(500).json({ message: 'Erro ao excluir médico', error: erro.message });
  }
};