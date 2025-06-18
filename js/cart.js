// cart.js — корзина: отображение, изменение количества, удаление, переход к чекауту

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  document.getElementById("checkout-btn").addEventListener("click", () => {
    window.location.href = "checkout.html";
  });
});

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemsEl = document.getElementById("cart-items");
  const summaryEl = document.getElementById("cart-summary");
  const emptyEl = document.getElementById("empty-cart");
  if (!cart.length) {
    itemsEl.style.display = "none";
    summaryEl.style.display = "none";
    emptyEl.style.display = "block";
    return;
  }
  itemsEl.style.display = "";
  summaryEl.style.display = "";
  emptyEl.style.display = "none";
  fetch("data/games.json")
    .then((r) => r.json())
    .then((games) => {
      let subtotal = 0;
      itemsEl.innerHTML = cart
        .map((item) => {
          const game = games.find((g) => g.id === item.id);
          if (!game) return "";
          const total = game.price * (item.quantity || 1);
          subtotal += total;
          return `
        <div class="cart-item">
          <div class="cart-item-image"><img src="${game.cover}" alt="${
            game.title
          }" /></div>
          <div class="cart-item-details">
            <a href="game.html?id=${game.id}" class="cart-item-title">${
            game.title
          }</a>
            <div class="cart-item-meta">
              <span class="cart-item-platform">${game.platform
                .map((p) => p.toUpperCase())
                .join(" / ")}</span>
            </div>
            <div class="cart-item-price">$${game.price.toFixed(2)}</div>
          </div>
          <div class="cart-item-actions">
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="changeQty('${
                game.id
              }', -1)">-</button>
              <span class="quantity-display">${item.quantity || 1}</span>
              <button class="quantity-btn" onclick="changeQty('${
                game.id
              }', 1)">+</button>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart('${
              game.id
            }')">Remove</button>
          </div>
        </div>
      `;
        })
        .join("");
      // Summary
      const shipping = subtotal > 50 ? 0 : 7.99;
      const total = subtotal + shipping;
      document.getElementById("subtotal").textContent = `$${subtotal.toFixed(
        2
      )}`;
      document.getElementById("shipping").textContent = shipping
        ? `$${shipping.toFixed(2)}`
        : "Free";
      document.getElementById("total").textContent = `$${total.toFixed(2)}`;
      document.getElementById("checkout-btn").disabled = !cart.length;
    });
}

window.changeQty = function (gameId, delta) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const idx = cart.findIndex((item) => item.id === gameId);
  if (idx > -1) {
    cart[idx].quantity = Math.max(1, (cart[idx].quantity || 1) + delta);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    if (window.updateCartBadge) window.updateCartBadge();
  }
};

window.removeFromCart = function (gameId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id !== gameId);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  if (window.updateCartBadge) window.updateCartBadge();
};
