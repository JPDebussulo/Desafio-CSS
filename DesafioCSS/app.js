const STORAGE_KEY = "flashcards-deck";
const form = document.querySelector("#flashcard-form");
const feedback = form.querySelector(".form-feedback");
const grid = document.querySelector("#flashcard-grid");
const emptyState = document.querySelector(".empty-state");
const template = document.querySelector("#flashcard-template");
const filterSelect = document.querySelector("#filter");
const exportButton = document.querySelector("#export");
const importInput = document.querySelector("#import");

const generateId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

let cards = [];

const defaultCards = [
  {
    id: generateId(),
    question: "O que é CSS?",
    answer:
      "Cascading Style Sheets é a linguagem responsável por definir cores, layouts, tipografia e aparência de documentos HTML.",
    category: "Front-end",
  },
  {
    id: generateId(),
    question: "Qual a vantagem de usar flashcards?",
    answer:
      "Eles estimulam a memorização ativa e o espaçamento de revisões, tornando o estudo mais eficiente em pouco tempo.",
    category: "Métodos de estudo",
  },
  {
    id: generateId(),
    question: "Como deixar o estudo disponível em qualquer lugar?",
    answer:
      "Basta acessar esta página do seu navegador, adicionar novos cards e sincronizar/exportar o arquivo JSON para importar em outro dispositivo.",
    category: "Dicas",
  },
];

function loadCards() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      cards = [...defaultCards];
      saveCards();
      return;
    }

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      cards = parsed;
    } else {
      throw new Error("Formato inválido");
    }
  } catch (error) {
    console.warn("Não foi possível carregar os flashcards salvos, iniciando com exemplos.", error);
    cards = [...defaultCards];
    saveCards();
  }
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  updateFilterOptions();
}

function renderCards(filter = "") {
  grid.innerHTML = "";
  const filteredCards = filter ? cards.filter((card) => card.category === filter) : cards;

  if (!filteredCards.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  filteredCards.forEach((card) => {
    const instance = template.content.firstElementChild.cloneNode(true);
    instance.dataset.id = card.id;
    instance.querySelectorAll(".card-category").forEach((el) => {
      el.textContent = card.category || "Sem categoria";
    });
    instance.querySelector(".card-question").textContent = card.question;
    instance.querySelector(".card-answer").textContent = card.answer;

    instance.addEventListener("click", () => toggleCard(instance));
    instance.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleCard(instance);
      }
    });

    const deleteButton = instance.querySelector(".delete-btn");
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteCard(card.id);
    });

    grid.appendChild(instance);
  });
}

function toggleCard(card) {
  card.classList.toggle("is-flipped");
}

function deleteCard(id) {
  cards = cards.filter((card) => card.id !== id);
  saveCards();
  renderCards(filterSelect.value);
}

function updateFilterOptions() {
  const currentValue = filterSelect.value;
  const uniqueCategories = ["", ...new Set(cards.map((card) => card.category).filter(Boolean))];

  filterSelect.innerHTML = "";
  uniqueCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category || "Todas as categorias";
    filterSelect.appendChild(option);
  });

  filterSelect.value = uniqueCategories.includes(currentValue) ? currentValue : "";
}

function showFeedback(message, isError = false) {
  feedback.textContent = message;
  feedback.style.color = isError ? "var(--danger)" : "var(--primary)";
  if (!message) return;
  setTimeout(() => {
    feedback.textContent = "";
  }, 4000);
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(form);
  const question = formData.get("question").trim();
  const answer = formData.get("answer").trim();
  const category = formData.get("category").trim();

  if (!question || !answer) {
    showFeedback("Preencha pergunta e resposta para criar um flashcard.", true);
    return;
  }

  const newCard = {
    id: generateId(),
    question,
    answer,
    category,
  };

  cards.unshift(newCard);
  saveCards();
  renderCards(filterSelect.value);
  form.reset();
  showFeedback("Flashcard adicionado ao seu deck!");
}

function exportDeck() {
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "meus-flashcards.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function importDeck(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (!Array.isArray(imported)) {
        throw new Error("Formato inválido");
      }
      const formatted = imported
        .filter((item) => item.question && item.answer)
        .map((item) => ({
          id: generateId(),
          question: String(item.question),
          answer: String(item.answer),
          category: item.category ? String(item.category) : "",
        }));

      cards = formatted.length ? formatted : [...defaultCards];
      saveCards();
      renderCards();
      showFeedback("Deck importado com sucesso!");
    } catch (error) {
      console.error("Erro ao importar deck", error);
      showFeedback("Não foi possível importar o arquivo selecionado.", true);
    }
  };

  reader.readAsText(file);
}

function init() {
  loadCards();
  updateFilterOptions();
  renderCards();

  form.addEventListener("submit", handleSubmit);
  filterSelect.addEventListener("change", (event) => {
    renderCards(event.target.value);
  });
  exportButton.addEventListener("click", exportDeck);
  importInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) {
      importDeck(file);
      importInput.value = "";
    }
  });
}

window.addEventListener("DOMContentLoaded", init);
