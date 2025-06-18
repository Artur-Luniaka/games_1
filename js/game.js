// game.js — загрузка игры, отзывы, табы, добавление в корзину

document.addEventListener("DOMContentLoaded", () => {
  loadGameDetails();
  setupTabs();
  setupReviewForm();
});

async function loadGameDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;
  const [gamesRes, reviewsRes] = await Promise.all([
    fetch("data/games.json"),
    fetch("data/reviews.json"),
  ]);
  const games = await gamesRes.json();
  const game = games.find((g) => g.id === id);
  if (!game) return;
  renderGame(game);
  renderSpecs(game);
  renderDescription(game);
  renderReviews(id, reviewsRes);
}

function renderGame(game) {
  const el = document.getElementById("game-details");
  el.innerHTML = `
    <div class="game-gallery">
      <div class="game-main-image"><img src="${game.cover}" alt="${
    game.title
  }" /></div>
    </div>
    <div class="game-info">
      <div class="game-header">
        <div class="game-title">${game.title}</div>
        <div class="game-meta">
          <span class="game-platform-badge">${game.platform
            .map((p) => p.toUpperCase())
            .join(" / ")}</span>
          <span class="game-genre-badge">${game.genre.join(", ")}</span>
        </div>
        <div class="game-rating-large">
          <span class="stars-large">${"★".repeat(
            Math.round(game.rating)
          )}</span>
          <span class="rating-text-large">${game.rating.toFixed(1)}</span>
        </div>
        <div class="game-price-large">$${game.price.toFixed(2)}</div>
      </div>
      <div class="game-actions-large">
        <button class="add-to-cart-btn-large" onclick="addToCart('${
          game.id
        }')">Add to cart</button>
      </div>
      <div class="game-description-short">${game.description}</div>
    </div>
  `;
  document.getElementById("game-title").textContent = game.title;
}

function renderSpecs(game) {
  const el = document.getElementById("game-specifications");
  el.innerHTML = `<div class="spec-group">${Object.entries(game.specs)
    .map(
      ([k, v]) =>
        `<div class="spec-item"><span class="spec-label">${k}</span><span class="spec-value">${v}</span></div>`
    )
    .join("")}</div>`;
}

function renderDescription(game) {
  document.getElementById(
    "game-description"
  ).innerHTML = `<p>${game.description}</p>`;
}

async function renderReviews(gameId, reviewsRes) {
  const reviewsData = await reviewsRes.json();
  const gameReviews = (
    reviewsData.find((r) => r.gameId === gameId) || { reviews: [] }
  ).reviews;
  const summary = document.getElementById("reviews-summary");
  const list = document.getElementById("reviews-list");
  if (!summary || !list) return;
  if (gameReviews.length) {
    const avg = (
      gameReviews.reduce((s, r) => s + r.rating, 0) / gameReviews.length
    ).toFixed(1);
    summary.innerHTML = `<div class="overall-rating"><div class="rating-number">${avg}</div><div class="rating-stars">${"★".repeat(
      Math.round(avg)
    )}</div><div class="rating-count">${
      gameReviews.length
    } reviews</div></div>`;
  } else {
    summary.innerHTML = '<div class="rating-count">No reviews yet</div>';
  }
  list.innerHTML = gameReviews.map(reviewCardHTML).join("");
}

function reviewCardHTML(r) {
  return `<div class="review-card"><div class="review-header"><span class="review-author">${
    r.author
  }</span><span class="review-date">${
    r.date
  }</span></div><div class="review-rating">${"★".repeat(
    r.rating
  )}</div><div class="review-title">${r.title}</div><div class="review-text">${
    r.text
  }</div></div>`;
}

function setupTabs() {
  const btns = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");
  btns.forEach((btn) =>
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab + "-tab").classList.add("active");
    })
  );
}

function setupReviewForm() {
  const reviewForm = document.getElementById("review-form");
  if (!reviewForm) return;

  reviewForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const rating = formData.get("rating");
    const title = formData.get("title");
    const text = formData.get("text");

    // Validate form
    if (!rating || !title || !text) {
      showToast("Please fill in all fields", "error");
      return;
    }

    // Replace form with success message
    const reviewFormContainer = document.querySelector(".review-form");
    reviewFormContainer.innerHTML = `
      <div class="review-success">
        <h4>Thank you for your review!</h4>
        <p>Your comment is under review by the administrator and will be published soon.</p>
      </div>
    `;

    // Show toast notification
    showToast("Review submitted successfully!");

    // Reset form (in case user wants to submit another review)
    this.reset();
  });
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
