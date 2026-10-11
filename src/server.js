require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')

const medicoRoutes = require('./routes/medicoRoutes')
const pacienteRoutes = require('./routes/pacienteRoutes')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../frontend')))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.use('/api/medicos', medicoRoutes)
app.use('/api/pacientes', pacienteRoutes)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

mongoose.connect(process.env.MONGO_URI)

app.listen(process.env.PORT, () => {
  console.log(`Servidor em http://localhost:${process.env.PORT}`)
  console.log(`Swagger em http://localhost:${process.env.PORT}/api-docs`)
})




mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Conectado ao MongoDB com sucesso');
    
    // Opcional para resetar índices duplicados antigos presos no banco
    try {
      await mongoose.model('Medico').syncIndexes();
      await mongoose.model('Paciente').syncIndexes();
      console.log('Índices sincronizados com sucesso.');
    } catch (e) {
      console.log('Aviso ao sincronizar índices:', e.message);
    }
  })
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));