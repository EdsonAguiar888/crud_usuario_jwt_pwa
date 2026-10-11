const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Ajuste o caminho se necessário conforme seu server.js
require('dotenv').config();

async function seedAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI não encontrada no arquivo .env');
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao MongoDB para execução do Seed...');

    const adminEmail = 'admin@admin.com';
    const adminExistente = await User.findOne({ email: adminEmail });

    if (adminExistente) {
      console.log('Seed: Usuário Administrador padrão já existe.');
    } else {
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash('12345', salt);

      const novoAdmin = new User({
        nome: 'Administrador Master',
        email: adminEmail,
        senha: senhaHash,
        role: 'admin'
      });

      await novoAdmin.save();
      console.log('Seed: Administrador padrão criado com sucesso! (E-mail: admin@admin.com / Senha: 12345)');
    }

    await mongoose.disconnect();
    console.log('Conexão do Seed encerrada.');
  } catch (erro) {
    console.error('Erro ao executar o seed do admin:', erro);
  }
}

seedAdmin();