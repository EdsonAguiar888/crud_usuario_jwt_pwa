const Paciente = require('../models/Paciente');
const bcrypt = require('bcryptjs');

exports.listar = async (req, res) => {
  try {
    const pacientes = await Paciente.find().select('-senha');
    res.json(pacientes);
  } catch (erro) {
    res.status(500).json({ message: 'Erro ao listar pacientes', error: erro.message });
  }
};

exports.criar = async (req, res) => {
  try {
    const { nome, email, senha, dataNascimento, telefone } = req.body;

    if (!nome || !email || !senha || !dataNascimento) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoPaciente = new Paciente({
      nome,
      email,
      senha: senhaHash,
      dataNascimento,
      telefone
    });

    await novoPaciente.save();

    const pacienteRetorno = novoPaciente.toObject();
    delete pacienteRetorno.senha;

    res.status(201).json({ message: 'Paciente cadastrado com sucesso!', paciente: pacienteRetorno });
  } catch (erro) {
    if (erro.code === 11000) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }
    res.status(500).json({ message: 'Erro ao cadastrar paciente', error: erro.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, dataNascimento, telefone, ativo } = req.body;

    const pacienteAtualizado = await Paciente.findByIdAndUpdate(
      id,
      { nome, dataNascimento, telefone, ativo },
      { new: true, runValidators: true }
    ).select('-senha');

    if (!pacienteAtualizado) {
      return res.status(404).json({ message: 'Paciente não encontrado.' });
    }

    res.json({ message: 'Paciente atualizado com sucesso!', paciente: pacienteAtualizado });
  } catch (erro) {
    res.status(500).json({ message: 'Erro ao atualizar paciente', error: erro.message });
  }
};

exports.remover = async (req, res) => {
  try {
    const { id } = req.params;
    const deletado = await Paciente.findByIdAndDelete(id);

    if (!deletado) {
      return res.status(404).json({ message: 'Paciente não encontrado.' });
    }

    res.json({ message: 'Paciente excluído com sucesso!' });
  } catch (erro) {
    res.status(500).json({ message: 'Erro ao excluir paciente', error: erro.message });
  }
};