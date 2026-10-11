const api = '/api';
const token = localStorage.getItem('token');

const divMedicos = document.getElementById('medicos');
const divPacientes = document.getElementById('pacientes');
const statusMedico = document.getElementById('statusMedico');
const statusPaciente = document.getElementById('statusPaciente');
const userInfoDisplay = document.getElementById('userInfoDisplay');

const usuarioLogadoStr = localStorage.getItem('usuario');
if (usuarioLogadoStr && userInfoDisplay) {
  try {
    const usuarioLogado = JSON.parse(usuarioLogadoStr);
    userInfoDisplay.textContent = `${usuarioLogado.nome || 'Usuário'} (${(usuarioLogado.role || 'user').toUpperCase()})`;
  } catch (e) {
    console.error('Erro ao ler usuário:', e);
  }
}

function mostrarMensagem(mensagem, erro = false, elementoStatus = statusMedico) {
  if (!elementoStatus) return;
  elementoStatus.textContent = mensagem;
  elementoStatus.style.color = erro ? '#b91c1c' : '#166534';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/';
}

if (!token) {
  window.location.href = '/';
}

function alternarAba(aba) {
  document.getElementById('secaoMedicos').style.display = aba === 'medicos' ? 'block' : 'none';
  document.getElementById('secaoPacientes').style.display = aba === 'pacientes' ? 'block' : 'none';

  document.getElementById('btnTabMedicos').className = aba === 'medicos' ? 'primary small' : 'secondary small';
  document.getElementById('btnTabPacientes').className = aba === 'pacientes' ? 'primary small' : 'secondary small';

  if (aba === 'medicos') listarMedicos();
  if (aba === 'pacientes') listarPacientes();
}

async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(`${api}${url}`, {
    ...opcoes,
    headers: {
      ...(opcoes.body ? { 'Content-Type': 'application/json' } : {}),
      ...opcoes.headers,
      Authorization: `Bearer ${token}`
    }
  });

  if (resposta.status === 401) {
    logout();
    throw new Error('Sua sessão expirou. Entre novamente.');
  }

  const texto = await resposta.text();
  let dados = null;

  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = { message: texto };
    }
  }

  if (!resposta.ok) {
    if (resposta.status === 403) {
      throw new Error('Você não tem permissão para realizar esta ação.');
    }
    const mensagem = Array.isArray(dados?.message) ? dados.message.join(', ') : dados?.message || `Erro HTTP ${resposta.status}`;
    throw new Error(mensagem);
  }

  return dados;
}

// ==========================================
// CRUD: MÉDICOS
// ==========================================
async function listarMedicos() {
  if (!divMedicos) return;
  divMedicos.textContent = 'Carregando médicos...';
  try {
    const medicos = await requisicao('/medicos');
    const lista = Array.isArray(medicos) ? medicos : medicos?.medicos ?? medicos?.data;

    if (!Array.isArray(lista)) throw new Error('A API não retornou uma lista válida.');

    divMedicos.replaceChildren();
    if (lista.length === 0) {
      divMedicos.textContent = 'Nenhum médico cadastrado.';
      return;
    }

    lista.forEach(medico => {
      const artigo = document.createElement('article');
      artigo.className = 'user-item';

      const info = document.createElement('div');
      info.className = 'user-info';

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = 'DR';

      const detalhes = document.createElement('div');
      const nome = document.createElement('strong');
      nome.textContent = `${medico.nome || 'Médico'} (CRM: ${medico.crm || 'N/A'})`;

      const esp = document.createElement('span');
      esp.textContent = `Especialidade: ${medico.especialidade} | Tel: ${medico.telefone || 'N/A'}`;

      const meta = document.createElement('small');
      meta.textContent = `ID: ${medico.idAuto || 'N/A'} | E-mail: ${medico.email || 'N/A'}`;

      detalhes.append(nome, esp, meta);
      info.append(avatar, detalhes);

      const acoes = document.createElement('div');
      acoes.className = 'actions';

      const editar = document.createElement('button');
      editar.className = 'secondary small';
      editar.textContent = 'Editar';
      editar.onclick = () => editarMedico(medico);

      const excluir = document.createElement('button');
      excluir.className = 'danger small';
      excluir.textContent = 'Excluir';
      excluir.onclick = () => removerMedico(medico._id);

      acoes.append(editar, excluir);
      artigo.append(info, acoes);
      divMedicos.appendChild(artigo);
    });
  } catch (erro) {
    divMedicos.textContent = erro.message;
    mostrarMensagem(erro.message, true, statusMedico);
  }
}

async function criarMedico() {
  const nome = document.getElementById('medicoNome').value.trim();
  const email = document.getElementById('medicoEmail').value.trim();
  const senha = document.getElementById('medicoSenha').value;
  const crm = document.getElementById('medicoCrm').value.trim();
  const especialidade = document.getElementById('medicoEspecialidade').value.trim();
  const telefone = document.getElementById('medicoTelefone').value.trim();

  if (!nome || !email || !senha || !crm || !especialidade) {
    mostrarMensagem('Preencha nome, e-mail, senha, CRM e especialidade.', true, statusMedico);
    return;
  }

  try {
    await requisicao('/medicos', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha, crm, especialidade, telefone })
    });

    document.getElementById('medicoNome').value = '';
    document.getElementById('medicoEmail').value = '';
    document.getElementById('medicoSenha').value = '';
    document.getElementById('medicoCrm').value = '';
    document.getElementById('medicoEspecialidade').value = '';
    document.getElementById('medicoTelefone').value = '';

    mostrarMensagem('Médico cadastrado com sucesso!', false, statusMedico);
    await listarMedicos();
  } catch (erro) {
    mostrarMensagem(erro.message, true, statusMedico);
  }
}








async function editarMedico(medico) {
  const nome = prompt('Nome:', medico.nome || '');
  if (nome === null) return;

  const especialidade = prompt('Especialidade:', medico.especialidade || '');
  if (especialidade === null) return;

  const telefone = prompt('Telefone:', medico.telefone || '');
  if (telefone === null) return;



  try {
    await requisicao(`/medicos/${encodeURIComponent(medico._id)}`, {
      method: 'PUT',
      body: JSON.stringify({
        nome: nome.trim(),
        especialidade: especialidade.trim(),
        telefone: telefone.trim(),
       
      })
    });
    mostrarMensagem('Médico atualizado com sucesso!', false, statusMedico);
    await listarMedicos();
  } catch (erro) {
    mostrarMensagem(erro.message, true, statusMedico);
  }
}



async function removerMedico(id) {
  if (!confirm('Deseja excluir este médico?')) return;
  try {
    await requisicao(`/medicos/${encodeURIComponent(id)}`, { method: 'DELETE' });
    mostrarMensagem('Médico excluído com sucesso!', false, statusMedico);
    await listarMedicos();
  } catch (erro) {
    mostrarMensagem(erro.message, true, statusMedico);
  }
}

// ==========================================
// CRUD: PACIENTES
// ==========================================
async function listarPacientes() {
  if (!divPacientes) return;
  divPacientes.textContent = 'Carregando pacientes...';
  try {
    const pacientes = await requisicao('/pacientes');
    const lista = Array.isArray(pacientes) ? pacientes : pacientes?.pacientes ?? pacientes?.data;

    if (!Array.isArray(lista)) throw new Error('A API não retornou uma lista válida.');

    divPacientes.replaceChildren();
    if (lista.length === 0) {
      divPacientes.textContent = 'Nenhum paciente cadastrado.';
      return;
    }

    lista.forEach(paciente => {
      const artigo = document.createElement('article');
      artigo.className = 'user-item';

      const info = document.createElement('div');
      info.className = 'user-info';

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = 'PA';

      const detalhes = document.createElement('div');
      const nome = document.createElement('strong');
      const dataNasc = paciente.dataNascimento ? new Date(paciente.dataNascimento).toISOString().split('T')[0] : 'N/A';
      nome.textContent = `${paciente.nome || 'Paciente'} (Nasc: ${dataNasc})`;

      const tel = document.createElement('span');
      tel.textContent = `Telefone: ${paciente.telefone || 'N/A'}`;

      const meta = document.createElement('small');
      meta.textContent = `ID: ${paciente.idAuto || 'N/A'} | E-mail: ${paciente.email || 'N/A'}`;

      detalhes.append(nome, tel, meta);
      info.append(avatar, detalhes);

      const acoes = document.createElement('div');
      acoes.className = 'actions';

      const editar = document.createElement('button');
      editar.className = 'secondary small';
      editar.textContent = 'Editar';
      editar.onclick = () => editarPaciente(paciente);

      const excluir = document.createElement('button');
      excluir.className = 'danger small';
      excluir.textContent = 'Excluir';
      excluir.onclick = () => removerPaciente(paciente._id);

      acoes.append(editar, excluir);
      artigo.append(info, acoes);
      divPacientes.appendChild(artigo);
    });
  } catch (erro) {
    divPacientes.textContent = erro.message;
    mostrarMensagem(erro.message, true, statusPaciente);
  }
}

async function criarPaciente() {
  const nome = document.getElementById('pacienteNome').value.trim();
  const email = document.getElementById('pacienteEmail').value.trim();
  const senha = document.getElementById('pacienteSenha').value;
  const dataNascimento = document.getElementById('pacienteNascimento').value;
  const telefone = document.getElementById('pacienteTelefone').value.trim();

  if (!nome || !email || !senha || !dataNascimento) {
    mostrarMensagem('Preencha nome, e-mail, senha e data de nascimento.', true, statusPaciente);
    return;
  }

  try {
    await requisicao('/pacientes', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha, dataNascimento, telefone })
    });

    document.getElementById('pacienteNome').value = '';
    document.getElementById('pacienteEmail').value = '';
    document.getElementById('pacienteSenha').value = '';
    document.getElementById('pacienteNascimento').value = '';
    document.getElementById('pacienteTelefone').value = '';

    mostrarMensagem('Paciente cadastrado com sucesso!', false, statusPaciente);
    await listarPacientes();
  } catch (erro) {
    mostrarMensagem(erro.message, true, statusPaciente);
  }
}


async function editarPaciente(paciente) {
  const nome = prompt('Nome:', paciente.nome || '');
  if (nome === null) return;

  const dataNascimento = prompt('Data de Nascimento (AAAA-MM-DD):', paciente.dataNascimento ? paciente.dataNascimento.split('T')[0] : '');
  if (dataNascimento === null) return;

  const telefone = prompt('Telefone:', paciente.telefone || '');
  if (telefone === null) return;


  try {
    await requisicao(`/pacientes/${encodeURIComponent(paciente._id)}`, {
      method: 'PUT',
      body: JSON.stringify({
        nome: nome.trim(),
        dataNascimento: dataNascimento.trim(),
        telefone: telefone.trim(),
        
      })
    });
    mostrarMensagem('Paciente atualizado com sucesso!', false, statusPaciente);
    await listarPacientes();
  } catch (erro) {
    mostrarMensagem(erro.message, true, statusPaciente);
  }
}



async function removerPaciente(id) {
  if (!confirm('Deseja excluir este paciente?')) return;
  try {
    await requisicao(`/pacientes/${encodeURIComponent(id)}`, { method: 'DELETE' });
    mostrarMensagem('Paciente excluído com sucesso!', false, statusPaciente);
    await listarPacientes();
  } catch (erro) {
    mostrarMensagem(erro.message, true, statusPaciente);
  }
}

// Inicialização
if (token) {
  listarMedicos();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .catch(erro => console.error('Service Worker falhou:', erro));
}