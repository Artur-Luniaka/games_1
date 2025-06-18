// catalog.js — фильтрация, поиск, сортировка, пагинация

let allGames = [];
let filteredGames = [];
let genres = new Set();
let currentPage = 1;
const pageSize = 9;

// DOM
const grid = document.getElementById("catalog-games-grid");
const resultsCount = document.getElementById("results-count");
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-input");
const priceSlider = document.getElementById("price-slider");
const priceValue = document.getElementById("price-value");
const genreFilters = document.getElementById("genre-filters");
const pagination = document.getElementById("pagination");

// Init
window.addEventListener("DOMContentLoaded", async () => {
  await loadGames();
  setupFilters();
  render();
});

async function loadGames() {
  const res = await fetch("data/games.json");
  allGames = await res.json();
  allGames.forEach((g) => g.genre.forEach((gn) => genres.add(gn)));
}

function setupFilters() {
  // Genres
  genreFilters.innerHTML = Array.from(genres)
    .map(
      (genre) => `
    <label class="filter-option">
      <input type="checkbox" value="${genre}" checked />
      <span class="checkmark"></span>
      ${genre}
    </label>
  `
    )
    .join("");
  // Events
  document
    .querySelectorAll(".filters-sidebar input, .filters-sidebar select")
    .forEach((el) => {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });
  searchInput.addEventListener("input", render);
  priceSlider.addEventListener("input", () => {
    priceValue.textContent = `$${priceSlider.value}`;
    render();
  });
  document
    .getElementById("clear-filters")
    .addEventListener("click", clearFilters);
  sortSelect.addEventListener("change", render);
}

function getFilters() {
  const platforms = Array.from(
    document.querySelectorAll(
      '.filters-sidebar input[value="xbox"]:checked, .filters-sidebar input[value="pc"]:checked'
    )
  ).map((i) => i.value);
  const selectedGenres = Array.from(
    document.querySelectorAll("#genre-filters input:checked")
  ).map((i) => i.value);
  const ratings = Array.from(
    document.querySelectorAll(
      '.filters-sidebar input[type="checkbox"][value^="4"], .filters-sidebar input[type="checkbox"][value^="3"]:checked'
    )
  ).map((i) => parseFloat(i.value));
  return {
    search: searchInput.value.trim().toLowerCase(),
    platforms,
    genres: selectedGenres,
    price: parseFloat(priceSlider.value),
    ratings,
  };
}

function render() {
  const { search, platforms, genres, price, ratings } = getFilters();
  filteredGames = allGames.filter((g) => {
    const matchesPlatform = platforms.some((p) => g.platform.includes(p));
    const matchesGenre = genres.some((gn) => g.genre.includes(gn));
    const matchesPrice = g.price <= price;
    const matchesRating = !ratings.length || ratings.some((r) => g.rating >= r);
    const matchesSearch = g.title.toLowerCase().includes(search);
    return (
      matchesPlatform &&
      matchesGenre &&
      matchesPrice &&
      matchesRating &&
      matchesSearch
    );
  });
  sortGames();
  resultsCount.textContent = filteredGames.length;
  renderPage(1);
  renderPagination();
}

function sortGames() {
  const val = sortSelect.value;
  if (val === "price") filteredGames.sort((a, b) => a.price - b.price);
  else if (val === "price-desc")
    filteredGames.sort((a, b) => b.price - a.price);
  else if (val === "rating") filteredGames.sort((a, b) => b.rating - a.rating);
  else if (val === "name-desc")
    filteredGames.sort((a, b) => b.title.localeCompare(a.title));
  else if (val === "newest")
    filteredGames.sort(
      (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
    );
  else filteredGames.sort((a, b) => a.title.localeCompare(b.title));
}

function renderPage(page) {
  currentPage = page;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  grid.innerHTML = filteredGames.slice(start, end).map(gameCardHTML).join("");
}

function renderPagination() {
  const total = Math.ceil(filteredGames.length / pageSize);
  if (total <= 1) return (pagination.innerHTML = "");

  let html = "";

  // Информация о страницах
  html += `<div class="pagination-info">Page ${currentPage} of ${total}</div>`;

  // Кнопка "Предыдущая"
  if (currentPage > 1) {
    html += `<button class="pagination-btn" onclick="goToPage(${
      currentPage - 1
    })">‹</button>`;
  } else {
    html += `<button class="pagination-btn" disabled>‹</button>`;
  }

  // Номера страниц
  for (let i = 1; i <= total; i++) {
    html += `<button class="pagination-btn${
      i === currentPage ? " active" : ""
    }" onclick="goToPage(${i})">${i}</button>`;
  }

  // Кнопка "Следующая"
  if (currentPage < total) {
    html += `<button class="pagination-btn" onclick="goToPage(${
      currentPage + 1
    })">›</button>`;
  } else {
    html += `<button class="pagination-btn" disabled>›</button>`;
  }

  pagination.innerHTML = html;
}

window.goToPage = function (page) {
  renderPage(page);
  renderPagination();
  // Скролл вверх при нажатии на кнопку пагинации
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

function clearFilters() {
  document
    .querySelectorAll('.filters-sidebar input[type="checkbox"]')
    .forEach((i) => (i.checked = true));
  searchInput.value = "";
  priceSlider.value = priceSlider.max;
  priceValue.textContent = `$${priceSlider.max}`;
  sortSelect.value = "name";
  render();
}

function gameCardHTML(game) {
  return `
    <div class="game-card">
      <div class="game-image">
        <img src="${game.cover}" alt="${game.title}" />
        <span class="game-platform">${game.platform
          .map((p) => p.toUpperCase())
          .join(" / ")}</span>
      </div>
      <div class="game-content">
        <div class="game-title">${game.title}</div>
        <div class="game-genre">${game.genre.join(", ")}</div>
        <div class="game-rating">
          <span class="stars">${"★".repeat(Math.round(game.rating))}</span>
          <span class="rating-text">${game.rating.toFixed(1)}</span>
        </div>
        <div class="game-price">$${game.price.toFixed(2)}</div>
        <div class="game-actions">
          <button class="add-to-cart-btn" onclick="addToCart('${
            game.id
          }')">Add to cart</button>
          <a href="game.html?id=${
            game.id
          }" class="btn btn-secondary">Details</a>
        </div>
      </div>
    </div>
  `;
}

function addToCart(gameId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const idx = cart.findIndex((item) => item.id === gameId);
  if (idx > -1) {
    cart[idx].quantity = (cart[idx].quantity || 1) + 1;
  } else {
    cart.push({ id: gameId, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  showToast("Game added to cart!");
  if (window.updateCartBadge) window.updateCartBadge();
}
