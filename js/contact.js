// contact.js — отправка формы, валидация email

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("contact-form")
    .addEventListener("submit", handleContact);
});

function handleContact(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value.trim();
  if (!validateEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    form.email.focus();
    return;
  }
  showToast("Message sent! Our team will reply soon.");
  form.reset();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
