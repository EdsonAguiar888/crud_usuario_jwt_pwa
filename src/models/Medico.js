const mongoose = require('mongoose');

const medicoSchema = new mongoose.Schema({
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
    default: 'medico'
  },
  crm: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  especialidade: {
    type: String,
    required: true,
    trim: true
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
medicoSchema.pre('save', async function (next) {
  if (this.isNew) {
    const ultimo = await this.constructor.findOne().sort({ idAuto: -1 });
    this.idAuto = ultimo && ultimo.idAuto ? ultimo.idAuto + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Medico', medicoSchema);