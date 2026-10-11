# 🏥 Sistema de Gestão Clínica com JWT e PWA

🔗 **Acesse o projeto online:** [https://crud-usuario-jwt-pwa-rps8.onrender.com/usuarios.html](https://crud-usuario-jwt-pwa-rps8.onrender.com/usuarios.html)

Projeto didático e funcional para gestão de entidades clínicas (**Médicos** e **Pacientes**), construído como um **Progressive Web App (PWA)** com autenticação via **JWT**.

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)

## 📑 Sumário

- [🏥 Sistema de Gestão Clínica com JWT e PWA](#-sistema-de-gestão-clínica-com-jwt-e-pwa)
  - [📑 Sumário](#-sumário)
  - [📖 Visão Geral](#-visão-geral)
  - [🛠 Tecnologias](#-tecnologias)
  - [📁 Estrutura do Projeto](#-estrutura-do-projeto)
  - [🚀 Como Executar](#-como-executar)
  - [🧩 Arquitetura e Regras de Negócio](#-arquitetura-e-regras-de-negócio)
  - [🗄 Arquitetura de Dados](#-arquitetura-de-dados)
    - [Modelo de Médico (`src/models/Medico.js`)](#modelo-de-médico-srcmodelsmedicojs)
    - [Modelo de Paciente (`src/models/Paciente.js`)](#modelo-de-paciente-srcmodelspacientejs)
  - [🔐 Segurança e Middlewares](#-segurança-e-middlewares)
  - [📡 Endpoints da API](#-endpoints-da-api)
    - [Autenticação](#autenticação)
    - [Médicos (`/api/medicos`)](#médicos-apimedicos)
    - [Pacientes (`/api/pacientes`)](#pacientes-apipacientes)
  - [📱 Frontend e PWA](#-frontend-e-pwa)
  - [📄 Licença](#-licença)

## 📖 Visão Geral

Este projeto é um Sistema de Gestão Clínica desenvolvido em **Node.js**, **Express** e **MongoDB (Mongoose)**. O sistema foi refatorado de um CRUD genérico de usuários para **entidades clínicas especializadas** (Médicos e Pacientes), onde cada entidade possui **auto-identidade completa**:

- credenciais de acesso (`email` e `senha`);
- hash de senha com `bcryptjs`;
- papel (`role`) configurado como `user`;
- identificador numérico sequencial (`idAuto`).

## 🛠 Tecnologias

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- [JWT (JSON Web Token)](https://jwt.io/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [Swagger](https://swagger.io/) (documentação da API)
- HTML, CSS e JavaScript (Vanilla)
- PWA (Progressive Web App com Service Worker)

## 📁 Estrutura do Projeto

```text
crud_usuario_jwt_pwa/
├── frontend/
│   ├── auth.js
│   ├── index.html
│   ├── manifest.json
│   ├── service-worker.js
│   ├── style.css
│   ├── usuarios.html
│   └── usuarios.js
├── src/
│   ├── config/
│   │   └── swagger.js
│   ├── middlewares/
│   │   ├── adminMiddleware.js
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Medico.js
│   │   └── Paciente.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── medicoRoutes.js
│   │   └── pacienteRoutes.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## 🚀 Como Executar

1. Certifique-se de ter o **Node.js** instalado.
2. Configure o banco de dados (**MongoDB local** ou **MongoDB Atlas**).
3. Copie o arquivo `.env.example` para `.env` e preencha as variáveis de ambiente (como `MONGO_URI` e `JWT_SECRET`).
4. Instale as dependências do projeto:

   ```bash
   npm install
   ```

5. Inicie o servidor em ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Acesse a aplicação no navegador:

   ```text
   http://localhost:3000
   ```

7. Acesse a documentação interativa via Swagger:

   ```text
   http://localhost:3000/api-docs
   ```

## 🧩 Arquitetura e Regras de Negócio

- **Entidades especializadas:** o sistema substituiu o CRUD genérico de usuários por modelos autônomos para **Médicos** e **Pacientes**.
- **Identidade embutida:** cada médico e paciente possui diretamente suas credenciais de acesso (`email`, `senha` com hash bcrypt, `role: 'user'`) e um identificador numérico auto-incrementável (`idAuto`), eliminando dependências de IDs de usuários externos.
- **Segurança:** rotas protegidas por token JWT e validação de duplicidade (**HTTP 409** para e-mails ou CRMs já cadastrados).

## 🗄 Arquitetura de Dados

### Modelo de Médico (`src/models/Medico.js`)

Armazena as informações profissionais e de autenticação do corpo clínico.

| Campo           | Descrição                                                              |
| --------------- | ---------------------------------------------------------------------- |
| `idAuto`        | Identificador numérico sequencial único (auto-incrementado via middleware `pre('save')`) |
| `nome`          | Nome completo do médico                                                |
| `email`         | E-mail de acesso único                                                 |
| `senha`         | Hash seguro da senha (`bcryptjs`)                                      |
| `role`          | Papel de acesso (padrão `'user'`)                                      |
| `crm`           | Registro profissional único                                            |
| `especialidade` | Área de atuação médica                                                 |
| `telefone`      | Contato telefônico                                                     |
| `ativo`         | Status lógico do profissional                                          |

### Modelo de Paciente (`src/models/Paciente.js`)

Gerencia o cadastro dos pacientes no sistema.

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| `idAuto`         | Identificador numérico sequencial único        |
| `nome`           | Nome completo do paciente                      |
| `email`          | E-mail de contato e acesso único               |
| `senha`          | Hash seguro da senha                           |
| `role`           | Papel de acesso (`'user'`)                     |
| `dataNascimento` | Data de nascimento do paciente                 |
| `telefone`       | Contato telefônico                             |
| `ativo`          | Status lógico do cadastro                      |

## 🔐 Segurança e Middlewares

- **`authMiddleware.js`**: verifica a presença e a validade do token JWT enviado via header `Authorization: Bearer <token>`, injetando o payload decodificado em `req.user`.
- **`adminMiddleware.js`**: restringe ações administrativas com base na propriedade `role` do usuário autenticado.

## 📡 Endpoints da API

> A documentação interativa completa está disponível em `/api-docs` (Swagger).

### Autenticação

| Método | Rota              | Descrição                                              |
| ------ | ----------------- | ------------------------------------------------------ |
| POST   | `/api/auth/login` | Autentica o administrador/usuário e retorna o token JWT |

### Médicos (`/api/medicos`)

| Método | Rota               | Descrição                                                  |
| ------ | ------------------ | ---------------------------------------------------------- |
| GET    | `/api/medicos`     | Lista todos os médicos cadastrados (ocultando senhas)      |
| GET    | `/api/medicos/:id` | Busca um médico específico por ID                          |
| POST   | `/api/medicos`     | Cadastra um novo médico com identidade e credenciais próprias |
| PUT    | `/api/medicos/:id` | Atualiza dados do médico                                   |
| DELETE | `/api/medicos/:id` | Remove o médico do sistema                                 |

### Pacientes (`/api/pacientes`)

| Método | Rota                 | Descrição                              |
| ------ | -------------------- | -------------------------------------- |
| GET    | `/api/pacientes`     | Lista todos os pacientes cadastrados   |
| GET    | `/api/pacientes/:id` | Busca um paciente específico por ID    |
| POST   | `/api/pacientes`     | Cadastra um novo paciente              |
| PUT    | `/api/pacientes/:id` | Atualiza dados do paciente             |
| DELETE | `/api/pacientes/:id` | Remove o paciente do sistema           |

## 📱 Frontend e PWA

A aplicação web possui interface responsiva e recursos de Progressive Web App:

- **`/`**: tela inicial com autenticação (Login).
- **`/usuarios.html`**: painel clínico protegido, com abas separadas para o gerenciamento completo de Médicos e Pacientes.
- **`manifest.json`**: metadados de instalação do aplicativo.
- **`service-worker.js`**: cache inteligente dos arquivos estáticos (`/`, `/index.html`, `/usuarios.html`, `/style.css`, `/auth.js`, `/usuarios.js`, `/manifest.json`), permitindo o funcionamento offline dos assets e mantendo o *bypass* para as rotas da API, que sempre buscam dados atualizados na rede.

## 📄 Licença

Projeto de caráter didático. 
