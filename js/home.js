// home.js — hero slider, featured games, reviews

// Global variables
let currentSlide = 0;
let slideInterval;

// Global functions for HTML onclick
window.changeSlide = function (direction) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  if (slides.length === 0) return;

  console.log(
    "changeSlide called with direction:",
    direction,
    "from slide:",
    currentSlide
  );

  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");

  currentSlide = (currentSlide + direction + slides.length) % slides.length;

  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");

  console.log("Changed to slide:", currentSlide);
};

window.currentSlide = function (n) {
  console.log("currentSlide called with:", n);
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  if (slides.length === 0) return;

  const index = n - 1;
  if (index < 0 || index >= slides.length) return;

  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");

  currentSlide = index;

  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");

  console.log("Went to slide:", currentSlide);
};

// Test function to manually trigger slide change
window.testSlideChange = function () {
  console.log("Manual test - changing slide");
  window.changeSlide(1);
};

// Test function to check interval
window.checkInterval = function () {
  console.log("Current interval ID:", slideInterval);
  console.log("Current slide:", currentSlide);
  console.log("Interval is active:", slideInterval !== null);
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing slider...");
  initHeroSlider();
  loadFeaturedGames();
  loadReviews();
  setupNewsletterForm();

  // Add visibility change listener
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      console.log("Page hidden, pausing interval");
      stopAutoAdvance();
    } else {
      console.log("Page visible, resuming interval");
      startAutoAdvance();
    }
  });
});

function startAutoAdvance() {
  if (slideInterval) {
    clearInterval(slideInterval);
  }

  slideInterval = setInterval(() => {
    console.log("Auto-advancing slide from", currentSlide);
    window.changeSlide(1);
  }, 5000);

  console.log("Auto-advance started with interval ID:", slideInterval);
}

function stopAutoAdvance() {
  if (slideInterval) {
    console.log("Stopping auto-advance, clearing interval:", slideInterval);
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

function initHeroSlider() {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  console.log("Found slides:", slides.length);
  console.log("Found dots:", dots.length);

  if (slides.length === 0) {
    console.error("No slides found");
    return;
  }

  // Find current active slide
  const activeSlide = document.querySelector(".slide.active");
  if (activeSlide) {
    currentSlide = Array.from(slides).indexOf(activeSlide);
    console.log("Active slide found at index:", currentSlide);
  } else {
    // Set first slide as active if none is active
    slides[0].classList.add("active");
    dots[0].classList.add("active");
    currentSlide = 0;
    console.log("Set first slide as active");
  }

  // Start auto-advance
  startAutoAdvance();

  // Pause auto-advance on hover
  const heroSlider = document.querySelector(".hero-slider");
  if (heroSlider) {
    heroSlider.addEventListener("mouseenter", () => {
      console.log("Mouse entered, pausing auto-advance");
      stopAutoAdvance();
    });

    heroSlider.addEventListener("mouseleave", () => {
      console.log("Mouse left, resuming auto-advance");
      startAutoAdvance();
    });
  }

  // Add click events to dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Dot clicked, going to slide:", index);
      window.currentSlide(index + 1);
    });
  });

  console.log("Hero slider initialized successfully");
  console.log(
    "Global functions available:",
    typeof window.changeSlide,
    typeof window.currentSlide
  );

  // Test interval after 1 second
  setTimeout(() => {
    console.log("Interval test - current interval ID:", slideInterval);
    console.log("Current slide:", currentSlide);
  }, 1000);
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

    const email = form.querySelector('input[type="email"]').value;

    if (validateEmail(email)) {
      showToast("Thank you for subscribing to our newsletter!", "success");
      form.reset();
    } else {
      showToast("Please enter a valid email address.", "error");
    }
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
    month: "long",
    day: "numeric",
  });
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Cart Functions
function addToCart(gameId) {
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  } catch {}

  const existingItem = cart.find((item) => item.id === gameId);

  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    cart.push({ id: gameId, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  // Update cart badge
  const badge = document.getElementById("cart-badge");
  if (badge) {
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    badge.textContent = count;
  }

  showToast("Game added to cart!", "success");
}

// Smooth scrolling for anchor links
document.addEventListener("DOMContentLoaded", () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate-in");
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animateElements = document.querySelectorAll(
    ".game-card, .review-card, .feature-card, .category-card"
  );
  animateElements.forEach((el) => observer.observe(el));
});
