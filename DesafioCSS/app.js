'use strict';

const storageKey = 'flashlearn-cards';
const defaultColor = '#2563eb';

const form = document.querySelector('[data-card-form]');
const list = document.querySelector('[data-card-list]');
const emptyState = document.querySelector('[data-empty-state]');
const counter = document.querySelector('[data-card-count]');

const createId = () => (
  window.crypto && typeof window.crypto.randomUUID === 'function'
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
);

const sampleCards = [
  {
    id: createId(),
    front: 'Defina o conceito de fotossíntese.',
    back: 'Processo em que plantas transformam energia luminosa em química, produzindo glicose e oxigênio.',
    category: 'Ciências',
    color: '#16a34a'
  },
  {
    id: createId(),
    front: 'Como dizer "prazer em conhecê-lo" em inglês?',
    back: 'Say: Nice to meet you.',
    category: 'Línguas',
    color: '#7c3aed'
  }
];

function readStorage() {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Não foi possível ler os flashcards salvos', error);
    return [];
  }
}

function saveStorage(cards) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cards));
  } catch (error) {
    console.error('Não foi possível salvar os flashcards', error);
  }
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  return element;
}

function createCardElement(card) {
  const article = document.createElement('article');
  article.className = 'flashcard';
  article.dataset.id = card.id;
  article.style.setProperty('--card-color', card.color);
  article.tabIndex = 0;

  const inner = document.createElement('div');
  inner.className = 'flashcard__inner';

  const front = document.createElement('div');
  front.className = 'flashcard__face flashcard__face--front';

  front.append(
    createTextElement('span', 'flashcard__category', card.category),
    createTextElement('p', '', card.front),
    createTextElement('span', 'flashcard__hint', 'Clique para virar')
  );

  const back = document.createElement('div');
  back.className = 'flashcard__face flashcard__face--back';

  const backText = createTextElement('p', '', card.back);
  const deleteButton = createTextElement('button', 'flashcard__delete', 'Remover card');
  deleteButton.type = 'button';
  deleteButton.dataset.action = 'delete';

  back.append(backText, deleteButton);

  inner.append(front, back);
  article.append(inner);

  const toggleFlip = () => {
    article.classList.toggle('is-flipped');
  };

  article.addEventListener('click', toggleFlip);
  article.addEventListener('keydown', (event) => {
    const { key } = event;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      toggleFlip();
    }
  });

  deleteButton.addEventListener('click', (event) => {
    event.stopPropagation();
    deleteCard(card.id);
  });

  return article;
}

function renderCards(cards) {
  list.innerHTML = '';

  if (!cards.length) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    const fragment = document.createDocumentFragment();
    cards.forEach((card) => {
      fragment.appendChild(createCardElement(card));
    });
    list.appendChild(fragment);
  }

  counter.textContent = cards.length;
}

function deleteCard(id) {
  cards = cards.filter((card) => card.id !== id);
  saveStorage(cards);
  renderCards(cards);
}

let cards = readStorage();
if (!cards.length) {
  cards = sampleCards;
  saveStorage(cards);
}
renderCards(cards);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const card = {
    id: createId(),
    front: data.get('frente').trim(),
    back: data.get('verso').trim(),
    category: data.get('categoria'),
    color: data.get('cor') || defaultColor
  };

  if (!card.front || !card.back) {
    return;
  }

  cards = [card, ...cards];
  saveStorage(cards);
  renderCards(cards);
  form.reset();
  form.querySelector('#cor').value = defaultColor;
  form.querySelector('#frente').focus();
});
