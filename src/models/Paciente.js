const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
  idAuto: {
    type: Number,
    unique: true
  },
  nome: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  senha: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'paciente'
  },
  dataNascimento: {
    type: Date,
    required: true
  },
  telefone: {
    type: String,
    trim: true
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Middleware Mongoose para Auto-Incremento do idAuto
pacienteSchema.pre('save', async function (next) {
  if (this.isNew) {
    const ultimo = await this.constructor.findOne().sort({ idAuto: -1 });
    this.idAuto = ultimo && ultimo.idAuto ? ultimo.idAuto + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Paciente', pacienteSchema);