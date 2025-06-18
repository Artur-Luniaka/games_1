// common.js — header/footer injection, burger menu, toast

document.addEventListener("DOMContentLoaded", () => {
  injectHeader();
  injectFooter();
  setupSmoothScrollLinks();
  // Если есть hash — скроллим после полной загрузки
  if (window.location.hash) {
    scrollToHashSection(true);
  }
});

function injectHeader() {
  const headerHTML = `
    <header class="header">
      <div class="container header-content">
        <a href="./" class="logo">🎮 VirtuPlayMartZone</a>
        <nav>
          <ul class="nav-menu">
            <li><a href="catalog.html" class="nav-link">Catalog</a></li>
            <li><a href="./#featured" class="nav-link">Featured</a></li>
            <li><a href="./#categories" class="nav-link">Categories</a></li>
            <li><a href="./#community" class="nav-link">Community</a></li>
            <li><a href="contact.html" class="nav-link">Contact</a></li>
          </ul>
        </nav>
        <div class="header-actions">
          <a href="cart.html" class="cart-icon" aria-label="Cart">
            🛒<span class="cart-badge" id="cart-badge">0</span>
          </a>
          <div class="burger-menu" id="burger-menu" tabindex="0" aria-label="Open menu">
            <span class="burger-line"></span>
            <span class="burger-line"></span>
            <span class="burger-line"></span>
          </div>
        </div>
      </div>
      <div class="mobile-menu" id="mobile-menu">
        <div class="mobile-menu-header">
          <span class="logo">🎮 VirtuPlayMartZone</span>
          <button class="mobile-menu-close" id="mobile-menu-close" aria-label="Close menu">×</button>
        </div>
        <nav class="mobile-nav">
          <a href="./" class="mobile-nav-link">🏠 Home</a>
          <a href="catalog.html" class="mobile-nav-link">📚 Catalog</a>
          <a href="./#featured" class="mobile-nav-link">⭐ Featured</a>
          <a href="./#categories" class="mobile-nav-link">🎯 Categories</a>
          <a href="./#community" class="mobile-nav-link">👥 Community</a>
          <a href="contact.html" class="mobile-nav-link">📞 Contact</a>
        </nav>
      </div>
    </header>
  `;
  document.getElementById("header-placeholder").innerHTML = headerHTML;
  setupBurgerMenu();
  updateCartBadge();
}

function injectFooter() {
  const year = new Date().getFullYear();
  const footerHTML = `
    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-grid">
          <div class="footer-section">
            <h3>🎮 VirtuPlayMartZone</h3>
            <p>Australia's premium online store for Xbox & PC games. Fast delivery, secure shopping, and expert support.</p>
          </div>
          <div class="footer-section footer-section-right">
            <h3>Customer Service</h3>
            <a href="contact.html">Contact Us</a><br />
            <a href="privacy.html">Privacy Policy</a><br />
            <a href="terms.html">Terms of Service</a>
          </div>
        </div>
        <div class="footer-bottom">&copy; ${year} VirtuPlayMartZone | All rights reserved.</div>
      </div>
    </footer>
  `;
  document.getElementById("footer-placeholder").innerHTML = footerHTML;
}

function setupBurgerMenu() {
  const burger = document.getElementById("burger-menu");
  const mobileMenu = document.getElementById("mobile-menu");
  const closeBtn = document.getElementById("mobile-menu-close");

  if (!burger || !mobileMenu || !closeBtn) {
    console.error("Burger menu elements not found");
    return;
  }

  burger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    mobileMenu.classList.add("active");
  });

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    mobileMenu.classList.remove("active");
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (
      mobileMenu.classList.contains("active") &&
      !mobileMenu.contains(e.target) &&
      e.target !== burger
    ) {
      mobileMenu.classList.remove("active");
    }
  });

  // Close on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
      mobileMenu.classList.remove("active");
    }
  });
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  } catch {}
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  badge.textContent = count;
}

// Toast notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

// Update cart badge on storage change
window.addEventListener("storage", (e) => {
  if (e.key === "cart") updateCartBadge();
});

function scrollToHashSection(force) {
  const hash = window.location.hash;
  if (hash && document.querySelector(hash)) {
    // Если force=true — всегда скроллим (например, после перехода с другой страницы)
    // Если force=false — только если уже на ./
    setTimeout(() => {
      document
        .querySelector(hash)
        .scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
}

function setupSmoothScrollLinks() {
  // Для всех ссылок меню (десктоп и моб)
  document.querySelectorAll(".nav-link, .mobile-nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("./#")) {
      link.addEventListener("click", function (e) {
        const hash = href.substring(href.indexOf("#"));
        if (
          window.location.pathname.endsWith("index.html") ||
          window.location.pathname === "/" ||
          window.location.pathname === ""
        ) {
          // Уже на главной — плавный скролл
          if (document.querySelector(hash)) {
            e.preventDefault();
            history.replaceState(null, "", hash);
            document
              .querySelector(hash)
              .scrollIntoView({ behavior: "smooth", block: "start" });
            // Закрыть мобильное меню, если оно открыто
            const mobileMenu = document.getElementById("mobile-menu");
            if (mobileMenu && mobileMenu.classList.contains("active")) {
              mobileMenu.classList.remove("active");
            }
          }
        } else {
          // Не на главной — переход на ./#section
          // (скролл произойдет после загрузки)
        }
      });
    }
  });
}
