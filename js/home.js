// home.js — hero slider, featured games, reviews, cookie banner

// Global variables
let currentSlide = 0;
let slideInterval;

// Global functions for HTML onclick
window.changeSlide = function (direction) {
  const slides = document.querySelectorAll(".slide");

  if (slides.length === 0) return;

  slides[currentSlide].classList.remove("active");

  currentSlide = (currentSlide + direction + slides.length) % slides.length;

  slides[currentSlide].classList.add("active");
};

window.currentSlide = function (n) {
  const slides = document.querySelectorAll(".slide");

  if (slides.length === 0) return;

  const index = n - 1;
  if (index < 0 || index >= slides.length) return;

  slides[currentSlide].classList.remove("active");

  currentSlide = index;

  slides[currentSlide].classList.add("active");
};

// Test function to manually trigger slide change
window.testSlideChange = function () {
  window.changeSlide(1);
};

// Test function to check interval
window.checkInterval = function () {
  // Function kept for debugging if needed
};

document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();
  loadFeaturedGames();
  loadReviews();
  setupNewsletterForm();
  setupCookieBanner();

  // Add visibility change listener
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoAdvance();
    } else {
      startAutoAdvance();
    }
  });
});

function startAutoAdvance() {
  if (slideInterval) {
    clearInterval(slideInterval);
  }

  slideInterval = setInterval(() => {
    window.changeSlide(1);
  }, 5000);
}

function stopAutoAdvance() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

function initHeroSlider() {
  const slides = document.querySelectorAll(".slide");

  if (slides.length === 0) {
    console.error("No slides found");
    return;
  }

  // Find current active slide
  const activeSlide = document.querySelector(".slide.active");
  if (activeSlide) {
    currentSlide = Array.from(slides).indexOf(activeSlide);
  } else {
    // Set first slide as active if none is active
    slides[0].classList.add("active");
    currentSlide = 0;
  }

  // Start auto-advance
  startAutoAdvance();

  // Pause auto-advance on hover
  const heroSlider = document.querySelector(".hero-slider");
  if (heroSlider) {
    heroSlider.addEventListener("mouseenter", () => {
      stopAutoAdvance();
    });

    heroSlider.addEventListener("mouseleave", () => {
      startAutoAdvance();
    });
  }
}

// Cookie Banner
function setupCookieBanner() {
  const cookieBanner = document.getElementById("cookie-banner");
  const acceptButton = document.getElementById("accept-cookies");

  if (!cookieBanner || !acceptButton) return;

  // Check if cookies were already accepted
  const cookiesAccepted = localStorage.getItem("cookiesAccepted");

  if (!cookiesAccepted) {
    // Show cookie banner after a short delay
    setTimeout(() => {
      cookieBanner.classList.add("show");
    }, 1000);
  }

  // Handle accept button click
  acceptButton.addEventListener("click", () => {
    localStorage.setItem("cookiesAccepted", "true");
    cookieBanner.classList.remove("show");
    showToast("Cookie preferences saved!");
  });
}

// Featured Games
async function loadFeaturedGames() {
  try {
    const response = await fetch("data/games.json");
    const games = await response.json();

    const featuredGames = games.filter((game) => game.featured).slice(0, 6);
    const grid = document.getElementById("featured-games-grid");

    if (!grid) return;

    grid.innerHTML = featuredGames
      .map(
        (game) => `
      <div class="game-card">
        <div class="game-image">
          <img src="${game.cover}" alt="${game.title}" />
          <span class="game-platform">${game.platform[0].toUpperCase()}</span>
        </div>
        <div class="game-content">
          <h3 class="game-title">${game.title}</h3>
          <p class="game-genre">${game.genre.join(", ")}</p>
          <div class="game-rating">
            <span class="stars">${"★".repeat(
              Math.floor(game.rating)
            )}${"☆".repeat(5 - Math.floor(game.rating))}</span>
            <span class="rating-text">${game.rating}/5</span>
          </div>
          <div class="game-price">$${game.price}</div>
          <div class="game-actions">
            <button class="add-to-cart-btn" onclick="addToCart('${game.id}')">
              Add to Cart
            </button>
            <a href="game.html?id=${
              game.id
            }" class="btn btn-outline">Details</a>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading featured games:", error);
  }
}

// Reviews
async function loadReviews() {
  try {
    const response = await fetch("data/reviews.json");
    const reviewsData = await response.json();

    // Get random reviews from different games
    const allReviews = reviewsData.flatMap(
      (gameReviews) => gameReviews.reviews
    );
    const randomReviews = getRandomItems(allReviews, 3);

    const grid = document.getElementById("reviews-grid");

    if (!grid) return;

    grid.innerHTML = randomReviews
      .map(
        (review) => `
      <div class="review-card">
        <div class="review-header">
          <span class="review-author">${review.author}</span>
          <span class="review-date">${formatDate(review.date)}</span>
        </div>
        <div class="review-rating">
          ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}
        </div>
        <h4 class="review-title">${review.title}</h4>
        <p class="review-text">${review.text}</p>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading reviews:", error);
  }
}

// Newsletter Form
function setupNewsletterForm() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.email.value.trim();

    if (!validateEmail(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    showToast("Thank you for subscribing to our newsletter!");
    form.reset();
  });
}

// Utility Functions
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
