// contact.js — отправка формы, валидация email

document.addEventListener("DOMContentLoaded", () => {
  setupContactForm();
});

function setupContactForm() {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  contactForm.addEventListener("submit", handleContact);
}

function handleContact(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Get form values
  const name = formData.get("name").trim();
  const email = formData.get("email").trim();
  const subject = formData.get("subject");
  const message = formData.get("message").trim();

  // Validate form
  if (!name || !email || !subject || !message) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  if (!validateEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    form.email.focus();
    return;
  }

  // Replace form with success message
  const formContainer = document.querySelector(".contact-form-container");
  formContainer.innerHTML = `
    <div class="contact-success">
      <h3>Thank you for your message!</h3>
      <p>We have received your inquiry and will get back to you within 24 hours.</p>
    </div>
  `;

  // Show toast notification
  showToast("Message sent successfully! We'll reply soon.");

  // Reset form (in case user wants to send another message)
  form.reset();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
