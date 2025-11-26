const interests = [
  'Tecnologia',
  'Administração',
  'Jurídico',
  'Saúde',
  'Educação',
  'Segurança',
  'Infraestrutura'
];

const competitions = [
  {
    title: 'Analista de Sistemas - TRT 15ª Região',
    area: 'Tecnologia',
    status: 'aberto',
    location: 'Campinas (SP)',
    deadline: 'Edital publicado - provas em 20/10',
    summary: 'Vagas para analista judiciário com foco em desenvolvimento e sustentação de sistemas.',
    tags: ['Tribunal', 'Judiciário', 'Remoto parcial'],
    link: 'https://www.trt15.jus.br/'
  },
  {
    title: 'Prefeitura de Salvador - Analista Administrativo',
    area: 'Administração',
    status: 'inscricoes',
    location: 'Salvador (BA)',
    deadline: 'Inscrições até 05/09',
    summary: 'O concurso prevê formação de cadastro para cargos administrativos e planejamento.',
    tags: ['Prefeitura', 'Cadastro reserva', 'Gestão'],
    link: 'https://www.salvador.ba.gov.br/'
  },
  {
    title: 'Defensoria Pública da União - Técnico',
    area: 'Jurídico',
    status: 'previsto',
    location: 'Nacional',
    deadline: 'Edital aguardado para o 2º semestre',
    summary: 'Seleção prevista após autorização publicada em Diário Oficial.',
    tags: ['Federal', 'Assistência jurídica'],
    link: 'https://www.dpu.def.br/'
  },
  {
    title: 'Secretaria de Educação do DF - Pedagogo',
    area: 'Educação',
    status: 'aberto',
    location: 'Brasília (DF)',
    deadline: 'Edital publicado - provas em 03/11',
    summary: 'Vagas imediatas e cadastro reserva para pedagogos e orientadores educacionais.',
    tags: ['Carreira do magistério', 'Capital'],
    link: 'https://www.educacao.df.gov.br/'
  },
  {
    title: 'Polícia Civil de Minas Gerais - Investigador',
    area: 'Segurança',
    status: 'inscricoes',
    location: 'Belo Horizonte (MG)',
    deadline: 'Inscrições até 22/08',
    summary: 'Edital contempla vagas para investigador com foco em investigação digital.',
    tags: ['Segurança pública', 'Nível superior'],
    link: 'https://www.policiacivil.mg.gov.br/'
  },
  {
    title: 'Hospital Universitário - Enfermeiro',
    area: 'Saúde',
    status: 'previsto',
    location: 'Curitiba (PR)',
    deadline: 'Autorizado - edital em elaboração',
    summary: 'Concurso previsto para reforço das equipes de atenção clínica e urgência.',
    tags: ['Ebserh', 'Hospital universitário'],
    link: 'https://www.ebserh.gov.br/'
  },
  {
    title: 'Departamento Nacional de Infraestrutura de Transportes',
    area: 'Infraestrutura',
    status: 'previsto',
    location: 'Nacional',
    deadline: 'Autorizado - edital até 90 dias',
    summary: 'Seleção para analistas e engenheiros em programas de concessões e obras.',
    tags: ['Federal', 'Engenharia'],
    link: 'https://www.gov.br/dnit/'
  }
];

const keywordInput = document.querySelector('#keyword');
const statusSelect = document.querySelector('#status-filter');
const chipsContainer = document.querySelector('#interest-chips');
const clearAreasButton = document.querySelector('#clear-areas');
const form = document.querySelector('#search-form');
const resultsGrid = document.querySelector('#results-grid');
const resultsCount = document.querySelector('#results-count');
const emptyState = document.querySelector('#empty-state');

const selectedAreas = new Set();

function createChip(area) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'chip';
  chip.textContent = area;
  chip.setAttribute('aria-pressed', 'false');
  chip.addEventListener('click', () => toggleArea(area, chip));
  return chip;
}

function renderChips() {
  interests.forEach((area) => {
    const chip = createChip(area);
    chipsContainer.appendChild(chip);
  });
}

function toggleArea(area, chipElement) {
  if (selectedAreas.has(area)) {
    selectedAreas.delete(area);
    chipElement.classList.remove('is-active');
    chipElement.setAttribute('aria-pressed', 'false');
  } else {
    selectedAreas.add(area);
    chipElement.classList.add('is-active');
    chipElement.setAttribute('aria-pressed', 'true');
  }
  filterCompetitions();
}

function clearAreas() {
  selectedAreas.clear();
  chipsContainer.querySelectorAll('.chip').forEach((chip) => {
    chip.classList.remove('is-active');
    chip.setAttribute('aria-pressed', 'false');
  });
  filterCompetitions();
}

function statusLabel(status) {
  const labels = {
    aberto: 'Edital aberto',
    inscricoes: 'Inscrições abertas',
    previsto: 'Previsto'
  };
  return labels[status] || status;
}

function makeCard(data) {
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('role', 'listitem');

  const header = document.createElement('div');
  header.className = 'card__header';
  const title = document.createElement('h3');
  title.className = 'card__title';
  title.textContent = data.title;
  const statusPill = document.createElement('span');
  statusPill.className = `status status--${data.status}`;
  statusPill.textContent = statusLabel(data.status);
  header.append(title, statusPill);

  const meta = document.createElement('div');
  meta.className = 'card__meta';
  meta.innerHTML = `<span>📍 ${data.location}</span><span>📑 ${data.deadline}</span><span>🎯 ${data.area}</span>`;

  const summary = document.createElement('p');
  summary.className = 'muted';
  summary.textContent = data.summary;

  const tagsRow = document.createElement('div');
  tagsRow.className = 'tags';
  data.tags.forEach((tag) => {
    const badge = document.createElement('span');
    badge.className = 'tag';
    badge.textContent = tag;
    tagsRow.appendChild(badge);
  });

  const link = document.createElement('a');
  link.href = data.link;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Ver edital';

  card.append(header, meta, summary, tagsRow, link);
  return card;
}

function filterCompetitions(event) {
  if (event) event.preventDefault();
  const keyword = keywordInput.value.trim().toLowerCase();
  const statusValue = statusSelect.value;

  const filtered = competitions.filter((item) => {
    const keywordMatch = keyword === '' ||
      item.title.toLowerCase().includes(keyword) ||
      item.summary.toLowerCase().includes(keyword) ||
      item.tags.some((tag) => tag.toLowerCase().includes(keyword));

    const statusMatch = statusValue === 'all' || item.status === statusValue;

    const areaMatch = selectedAreas.size === 0 || selectedAreas.has(item.area);

    return keywordMatch && statusMatch && areaMatch;
  });

  renderResults(filtered);
}

function renderResults(list) {
  resultsGrid.innerHTML = '';

  if (list.length === 0) {
    resultsCount.textContent = 'Nenhum concurso atende aos filtros atuais.';
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  resultsCount.textContent = `${list.length} concurso${list.length > 1 ? 's' : ''} encontrado${list.length > 1 ? 's' : ''}`;

  list.forEach((item) => {
    const card = makeCard(item);
    resultsGrid.appendChild(card);
  });
}

renderChips();
form.addEventListener('submit', filterCompetitions);
keywordInput.addEventListener('input', () => filterCompetitions());
statusSelect.addEventListener('change', filterCompetitions);
clearAreasButton.addEventListener('click', clearAreas);

filterCompetitions();
