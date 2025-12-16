const sections = [
  { id: 'concursos', label: 'Concursos', description: 'Registre informações de editais e prazos importantes.' },
  { id: 'objetivos', label: 'Objetivos', description: 'Liste o que você quer alcançar em curto e médio prazo.' },
  { id: 'metas', label: 'Metas', description: 'Detalhe metas mensuráveis e datas para acompanhar.' },
  { id: 'planos', label: 'Planos', description: 'Descreva rotinas, cronogramas e próximos passos.' },
  { id: 'desejos', label: 'Desejos', description: 'Anote ideias, referências e inspirações pessoais.' }
];

const sectionList = document.querySelector('#section-list');
const notesArea = document.querySelector('#notes-area');
const sectionTitle = document.querySelector('#section-title');
const fieldLabel = document.querySelector('#field-label');
const statusBar = document.querySelector('#status-bar');

let activeSection = null;
let saveTimeout = null;

function loadSavedContent(sectionId) {
  return localStorage.getItem(`notes:${sectionId}`) || '';
}

function saveContent(sectionId, content) {
  localStorage.setItem(`notes:${sectionId}`, content);
  statusBar.textContent = `Rascunho salvo para "${getLabel(sectionId)}".`;
}

function getLabel(sectionId) {
  return sections.find((section) => section.id === sectionId)?.label || 'Sessão';
}

function renderSections() {
  sections.forEach((section, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'section-button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    button.dataset.id = section.id;

    const title = document.createElement('div');
    title.textContent = section.label;

    const desc = document.createElement('span');
    desc.textContent = section.description;

    button.append(title, desc);
    button.addEventListener('click', () => selectSection(section.id));
    sectionList.appendChild(button);
  });
}

function selectSection(sectionId) {
  activeSection = sectionId;
  sectionTitle.textContent = getLabel(sectionId);
  fieldLabel.textContent = `Anotações em ${getLabel(sectionId)}`;

  sectionList.querySelectorAll('.section-button').forEach((button) => {
    const isActive = button.dataset.id === sectionId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', isActive.toString());
  });

  const saved = loadSavedContent(sectionId);
  notesArea.value = saved;
  notesArea.disabled = false;
  notesArea.focus();
  statusBar.textContent = saved ? 'Conteúdo recuperado do salvamento automático.' : 'Nada salvo ainda. Comece a escrever!';
}

function handleTyping() {
  if (!activeSection) {
    statusBar.textContent = 'Selecione um tópico antes de escrever.';
    return;
  }

  clearTimeout(saveTimeout);
  statusBar.textContent = 'Digitando...';
  saveTimeout = setTimeout(() => {
    saveContent(activeSection, notesArea.value.trim());
  }, 400);
}

renderSections();
notesArea.disabled = true;
notesArea.addEventListener('input', handleTyping);

// Seleciona automaticamente o primeiro tópico na carga inicial
if (sections.length > 0) {
  selectSection(sections[0].id);
}
