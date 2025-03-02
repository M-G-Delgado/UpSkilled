const UserInteractions = {
    authModal: null,
  
    init() {
      console.log('Initializing UserInteractions...');
      this.initializeAuthModal();
      this.setupEventListeners();
      this.setupFormSubmissions();
      this.setupBackToTop();
    },
  
    initializeAuthModal() {
      console.log('Initializing authModal...');
      const modalElement = document.getElementById("authModalTopRight");
      if (modalElement) {
        try {
          this.authModal = new bootstrap.Modal(modalElement);
          console.log('authModal initialized successfully');
          this.setupAuthModalEventListeners();
        } catch (error) {
          console.error('Error initializing authModal:', error);
          this.authModal = null;
          this.showNotification('Login modal failed to load. Please refresh the page or try again later.', 'error');
        }
      } else {
        console.warn('authModalTopRight not found, skipping initialization');
        this.authModal = null;
      }
    },
  
    setupAuthModalEventListeners() {
      console.log('Setting up authModal event listeners...');
      const profileIcon = document.getElementById("profileIcon");
      const loginButton = document.getElementById("loginButton");
      const signupButton = document.getElementById("signupButton");
      const navbarCollapse = document.getElementById("customNavbarNav");
  
      if (profileIcon) {
        profileIcon.addEventListener("click", (e) => {
          console.log('Profile icon clicked');
          e.preventDefault(); // Prevent default image click behavior
          if (this.authModal) {
            if (navbarCollapse && window.innerWidth <= 768) { // Check for mobile (Bootstrap's lg breakpoint is 992px, but 768px is safer)
              const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse, { toggle: false });
              if (bsCollapse && navbarCollapse.classList.contains("show")) {
                bsCollapse.hide(); // Collapse the navbar
                console.log('Navbar collapsed on mobile');
                // Use setTimeout to ensure the collapse animation completes before showing the modal
                setTimeout(() => this.authModal.show(), 300); // Match Bootstrap's collapse animation duration
              } else {
                this.authModal.show(); // Show modal on desktop or if navbar isn’t expanded
              }
            } else {
              this.authModal.show(); // Show modal directly on desktop
            }
          } else {
            console.error('authModal is not initialized. Attempting to reinitialize...');
            this.initializeAuthModal(); // Retry initialization if modal isn’t ready
            this.showNotification('Login modal failed to load. Please try again.', 'error');
          }
        });
      } else {
        console.warn('Profile icon not found, profile click handler not set');
      }
  
      if (loginButton && this.authModal) {
        loginButton.addEventListener("click", (e) => {
          console.log('Login button clicked');
          e.preventDefault();
          alert("Login functionality coming soon!");
          this.authModal.hide();
        });
      } else if (loginButton) {
        console.warn('authModal not found, login handler not set for login button');
      }
  
      if (signupButton && this.authModal) {
        signupButton.addEventListener("click", (e) => {
          console.log('Signup button clicked');
          e.preventDefault();
          alert("Signup functionality coming soon!");
          this.authModal.hide();
        });
      } else if (signupButton) {
        console.warn('authModal not found, signup handler not set for signup button');
      }
      console.log('AuthModal event listeners setup completed');
    },
  
    setupFormSubmissions() {
      console.log('Setting up form submissions...');
  
      // Contact Form Submission (contact.html)
      const contactForm = document.getElementById("contactForm");
      if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (contactForm.checkValidity() === false) {
            contactForm.classList.add("was-validated");
            return;
          }
  
          const formData = new FormData(contactForm);
          fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            body: formData,
          })
            .then((response) => {
              if (response.ok) {
                document.getElementById("formFeedback").innerHTML =
                  '<div class="alert alert-success text-muted">Your message has been sent successfully!</div>';
                contactForm.reset();
                contactForm.classList.remove("was-validated");
              } else {
                throw new Error("Network response was not ok.");
              }
            })
            .catch((error) => {
              document.getElementById("formFeedback").innerHTML =
                '<div class="alert alert-danger text-muted">There was an error sending your message. Please try again later.</div>';
              console.error("Form submission error:", error);
            });
        });
      }
  
      // Partner Signup Form Submission (become_a_partner.html)
      const partnerForm = document.querySelector(".partner-signup form");
      if (partnerForm) {
        partnerForm.addEventListener("submit", (e) => {
          console.log("Partner form submitted");
          e.preventDefault();
          const data = {
            businessCategory: document.getElementById("businessCategory").value,
            contactNumber: document.getElementById("contactNumber").value,
            email: document.getElementById("email").value,
            courseDescription: document.getElementById("courseDescription").value,
          };
          console.log("Form data:", data);
  
          // Client-side validation
          if (
            !data.businessCategory ||
            !data.contactNumber ||
            !data.email ||
            !data.courseDescription
          ) {
            this.showNotification("Error: All fields are required.", "error");
            return;
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(data.email)) {
            this.showNotification("Error: Invalid email format.", "error");
            return;
          }
          if (!/^\d+$/.test(data.contactNumber)) {
            this.showNotification("Error: Contact number must be numeric.", "error");
            return;
          }
  
          // Simulate AJAX submission (replace with actual API endpoint)
          fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            mode: "cors",
          })
            .then((response) => {
              if (response.ok) {
                this.showNotification(
                  `Success: Partner registered! We'll contact you at ${data.email}.`,
                  "success"
                );
                partnerForm.reset();
              } else {
                throw new Error("Network response was not ok.");
              }
            })
            .catch((error) => {
              console.error("Partner submission error:", error);
              this.showNotification(
                `Error submitting form: ${
                  error.message || "Server or network issue. Please try again later."
                }`,
                "error"
              );
            });
        });
      }
      console.log("Form submissions setup completed");
    },
  
    setupBackToTop() {
      console.log('Setting up back-to-top button...');
      const backToTopButton = document.querySelector(".custom-back-to-top");
      if (backToTopButton) {
        window.addEventListener("scroll", () => {
          console.log('Scroll event triggered, Y position:', window.scrollY);
          if (window.scrollY > 300) backToTopButton.classList.add("visible");
          else backToTopButton.classList.remove("visible");
        });
      } else {
        console.warn('Back-to-top button not found, skipping setup');
      }
    },
  
    // Notification system for form feedback
    showNotification(message, type = "info") {
      console.log(`Showing notification: ${message} (Type: ${type})`);
      const notification = document.createElement("div");
      notification.className = `notification ${type}`;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background-color: ${
          type === "success"
            ? "#d4edda"
            : type === "error"
            ? "#f8d7da"
            : "#cce5ff"
        };
        color: ${
          type === "success"
            ? "#155724"
            : type === "error"
            ? "#721c24"
            : "#004085"
        };
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        animation: slideIn 0.5s ease-out, fadeOut 3s ease-out 2s;
      `;
      document.body.appendChild(notification);
  
      // CSS animations
      const styles = document.createElement("style");
      styles.textContent = `
        @keyframes slideIn {
          from { right: -300px; opacity: 0; }
          to { right: 20px; opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .notification {
          transition: opacity 0.5s;
        }
      `;
      document.head.appendChild(styles);
  
      // Remove notification after animation
      setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 500);
      }, 5000);
    },
  };
  
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Document loaded, initializing UserInteractions");
    UserInteractions.init();
  });