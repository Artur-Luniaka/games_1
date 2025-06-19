// checkout.js — оформление заказа, валидация, отображение заказа

document.addEventListener("DOMContentLoaded", () => {
  renderOrderSummary();
  document
    .getElementById("checkout-form")
    .addEventListener("submit", handleCheckout);
});

function renderOrderSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  fetch("data/games.json")
    .then((r) => r.json())
    .then((games) => {
      const itemsEl = document.getElementById("order-items");
      let subtotal = 0;
      itemsEl.innerHTML = cart
        .map((item) => {
          const game = games.find((g) => g.id === item.id);
          if (!game) return "";
          const total = game.price * (item.quantity || 1);
          subtotal += total;
          return `
        <div class="order-item">
          <div class="order-item-details">
            <div class="order-item-image"><img src="${game.cover}" alt="${
            game.title
          }" /></div>
            <div class="order-item-info">
              <div class="order-item-title">${game.title}</div>
              <div class="order-item-platform">${game.platform
                .map((p) => p.toUpperCase())
                .join(" / ")}</div>
              <div class="order-item-quantity">Qty: ${item.quantity || 1}</div>
            </div>
          </div>
          <div class="order-item-price">$${game.price.toFixed(2)}</div>
        </div>
      `;
        })
        .join("");
      const shipping = subtotal > 50 ? 0 : 7.99;
      const total = subtotal + shipping;
      document.getElementById(
        "order-subtotal"
      ).textContent = `$${subtotal.toFixed(2)}`;
      document.getElementById("order-shipping").textContent = shipping
        ? `$${shipping.toFixed(2)}`
        : "Free";
      document.getElementById("order-total").textContent = `$${total.toFixed(
        2
      )}`;
    });
}

function handleCheckout(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value.trim();
  if (!validateEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    form.email.focus();
    return;
  }

  // Save order to localStorage (simulate)
  localStorage.setItem(
    "order",
    JSON.stringify(Object.fromEntries(new FormData(form)))
  );
  localStorage.removeItem("cart");

  // Scroll to top of the page
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Show success notification with countdown
  showSuccessNotification();
}

function showSuccessNotification() {
  // Replace the entire checkout content with success notification
  const checkoutContent = document.querySelector(".checkout-content");

  // Create success notification
  const successHTML = `
    <div class="success-notification">
      <div class="success-content">
        <div class="success-icon">✅</div>
        <h2>Thank You for Your Order!</h2>
        <p>We have received your order and will contact you shortly to complete the payment process.</p>
        <p>You will be redirected to the homepage in <span id="countdown">10</span> seconds.</p>
        <div class="countdown-bar">
          <div class="countdown-progress" id="countdown-progress"></div>
        </div>
        <a href="./" class="btn btn-primary">Go to Homepage Now</a>
      </div>
    </div>
  `;

  // Replace the entire checkout content
  checkoutContent.innerHTML = successHTML;

  // Start countdown
  let countdown = 10;
  const countdownElement = document.getElementById("countdown");
  const progressElement = document.getElementById("countdown-progress");

  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdownElement) countdownElement.textContent = countdown;
    if (progressElement) {
      const progress = ((10 - countdown) / 10) * 100;
      progressElement.style.width = progress + "%";
    }

    if (countdown <= 0) {
      clearInterval(countdownInterval);
      window.location.href = "./";
    }
  }, 1000);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
