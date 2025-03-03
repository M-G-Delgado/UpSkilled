const Main = {
    init() {
      console.log('Main: Initializing... [Timestamp:', new Date().toISOString(), ']');
      this.loadTemplates()
        .then(() => {
          console.log('Main: Templates loaded successfully [Timestamp:', new Date().toISOString(), ']');
          this.initializeModules();
          this.showNewsletterModalOnFirstVisit(); // Show newsletter modal only on first visit
        })
        .catch(error => {
          console.error('Main: Error initializing templates [Timestamp:', new Date().toISOString(), ']:', error);
          this.showNotification('Failed to load page components. Please check your connection or refresh the page.', 'error');
          this.showFallbackContent();
        });
    },

    loadTemplates() {
      console.log('Main: Loading templates (navbar, footer)... [Timestamp:', new Date().toISOString(), ']');
      const templates = [
        { url: '/client/navbar.html', elementId: 'navbar' }, // Absolute path from server root
        { url: '/client/footer.html', elementId: 'footer' }   // Absolute path from server root
      ];

      return Promise.all(templates.map(template => {
        console.log(`Main: Attempting to fetch ${template.url} [Timestamp:', new Date().toISOString(), ']`);
        return fetch(template.url, {
          mode: 'cors', // Explicitly set CORS mode for cross-origin requests
          credentials: 'include', // Include cookies, authorization headers, etc., if needed
          headers: {
            'Accept': 'text/html' // Specify we expect HTML content
          }
        })
        .then(response => {
          console.log(`Main: Fetch response for ${template.url}: Status ${response.status} - ${response.statusText} [Timestamp:', new Date().toISOString(), ']`);
          if (!response.ok) {
            console.error(`Main: Fetch failed for ${template.url} with status ${response.status} [Timestamp:', new Date().toISOString(), ']`);
            throw new Error(`Failed to load ${template.url}: ${response.status} - ${response.statusText}`);
          }
          return response.text();
        })
        .then(data => {
          console.log(`Main: Received data for ${template.url}:`, data.substring(0, 100) + '... [Timestamp:', new Date().toISOString(), ']');
          const element = document.getElementById(template.elementId);
          if (element) {
            try {
              console.log(`Main: Parsing HTML for ${template.url} [Timestamp:', new Date().toISOString(), ']`);
              const parser = new DOMParser();
              const parsedDoc = parser.parseFromString(data, 'text/html');
              // IMPORTANT CHANGE: Use outerHTML instead of innerHTML so <nav>/<footer> is preserved
              const content = parsedDoc.body.firstChild ? parsedDoc.body.firstChild.outerHTML : data;
              element.innerHTML = content;
              console.log(`Main: Successfully loaded ${template.url} into #${template.elementId} [Timestamp:', new Date().toISOString(), ']`);
            } catch (parseError) {
              console.error(`Main: Error parsing ${template.url}:`, parseError, '[Timestamp:', new Date().toISOString(), ']');
              this.showNotification(`Failed to parse ${template.url}. Showing fallback content.`, 'warning');
              this.showFallbackContent(); // Show fallback if parsing fails
              throw parseError;
            }
          } else {
            console.warn(`Main: Element #${template.elementId} not found for ${template.url} [Timestamp:', new Date().toISOString(), ']`);
            this.showNotification(`Element for ${template.url} not found. Showing fallback content.`, 'warning');
            this.showFallbackContent();
            throw new Error(`Element #${template.elementId} not found for ${template.url}`);
          }
        })
        .catch(error => {
          console.error(`Main: Error loading ${template.url}:`, error, '[Timestamp:', new Date().toISOString(), ']');
          this.showNotification(`Failed to load ${template.url}. Showing fallback content.`, 'error');
          this.showFallbackContent();
          throw error;
        });
      }));
    },

    initializeModules() {
      console.log('Main: Initializing dependent modules (UserInteractions)... [Timestamp:', new Date().toISOString(), ']');
      UserInteractions.init(); // Removed Dashboard.init() since it’s undefined
    },

    showNewsletterModalOnFirstVisit() {
      console.log('Main: Checking if newsletter modal should be shown on first visit... [Timestamp:', new Date().toISOString(), ']');
      const hasSeenNewsletter = localStorage.getItem('newsletterSeen');
      console.log('Main: Newsletter seen status:', hasSeenNewsletter, '[Timestamp:', new Date().toISOString(), ']');

      if (hasSeenNewsletter !== 'true') {
        const observer = new MutationObserver(() => {
          const newsletterModal = document.getElementById('newsletterModal');
          if (newsletterModal) {
            let attempts = 0;
            const maxAttempts = 3;
            const showModal = () => {
              if (attempts >= maxAttempts) {
                console.error('Main: Max attempts reached, showing fallback newsletter notice [Timestamp:', new Date().toISOString(), ']');
                this.showNewsletterFallback();
                return;
              }
              attempts++;
              console.log(`Main: Attempt ${attempts} to show newsletter modal... [Timestamp:', new Date().toISOString(), ']`);
              setTimeout(() => {
                try {
                  const bsModal = new bootstrap.Modal(newsletterModal, {
                    backdrop: 'static',
                    keyboard: false
                  });
                  console.log('Main: Showing newsletter modal [Timestamp:', new Date().toISOString(), ']');
                  bsModal.show();
                  newsletterModal.addEventListener('hidden.bs.modal', () => {
                    console.log('Main: Newsletter modal hidden, marking as seen in localStorage [Timestamp:', new Date().toISOString(), ']');
                    localStorage.setItem('newsletterSeen', 'true');
                  });
                  const newsletterForm = document.getElementById('newsletterForm');
                  if (newsletterForm) {
                    newsletterForm.addEventListener('submit', (e) => {
                      e.preventDefault();
                      const city = document.querySelector('input[name="city"]').value;
                      const email = document.querySelector('input[name="email"]').value;
                      if (!city || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        console.log('Main: Invalid newsletter form input detected [Timestamp:', new Date().toISOString(), ']');
                        this.showNotification('Please enter a valid city and email address.', 'error');
                        return;
                      }
                      fetch('https://jsonplaceholder.typicode.com/posts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        mode: 'cors', // Ensure CORS for newsletter submission
                        credentials: 'include' // Include credentials if needed
                      })
                      .then(response => {
                        if (response.ok) {
                          console.log('Main: Newsletter subscription successful [Timestamp:', new Date().toISOString(), ']');
                          this.showNotification('Thank you for subscribing to our newsletter!', 'success');
                          bsModal.hide();
                          localStorage.setItem('newsletterSeen', 'true');
                        } else {
                          throw new Error('Subscription failed.');
                        }
                      })
                      .catch(error => {
                        console.error('Newsletter subscription error:', error, '[Timestamp:', new Date().toISOString(), ']');
                        this.showNotification('Failed to subscribe. Please try again later.', 'error');
                      });
                    });
                  } else {
                    console.error('Main: Newsletter form not found in modal content [Timestamp:', new Date().toISOString(), ']');
                    this.showNotification('Newsletter form failed to load. Please check your connection or refresh the page.', 'error');
                    showModal();
                  }
                } catch (error) {
                  console.error('Main: Error showing newsletter modal on attempt', attempts, ':', error, '[Timestamp:', new Date().toISOString(), ']');
                  this.showNotification(`Error loading newsletter modal (Attempt ${attempts}). Retrying...`, 'warning');
                  showModal();
                }
              }, 5000);
            };
            showModal();
            observer.disconnect();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        console.log('Main: User has already seen the newsletter modal, skipping display [Timestamp:', new Date().toISOString(), ']');
      }
    },

    showNewsletterFallback() {
      console.log('Main: Showing fallback newsletter notice... [Timestamp:', new Date().toISOString(), ']');
      const newsletterFallback = document.getElementById('newsletterFallback');
      if (newsletterFallback) {
        newsletterFallback.style.display = 'block';
        const fallbackSubscribe = document.getElementById('fallbackSubscribe');
        const fallbackDismiss = document.getElementById('fallbackDismiss');
        if (fallbackSubscribe) {
          fallbackSubscribe.addEventListener('click', () => {
            const city = document.getElementById('fallbackCity').value;
            const email = document.getElementById('fallbackEmail').value;
            if (!city || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              console.log('Main: Invalid fallback newsletter input detected [Timestamp:', new Date().toISOString(), ']');
              this.showNotification('Please enter a valid city and email address.', 'error');
              return;
            }
            fetch('https://jsonplaceholder.typicode.com/posts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              mode: 'cors', // Ensure CORS for fallback subscription
              credentials: 'include' // Include credentials if needed
            })
            .then(response => {
              if (response.ok) {
                console.log('Main: Fallback newsletter subscription successful [Timestamp:', new Date().toISOString(), ']');
                this.showNotification('Thank you for subscribing to our newsletter!', 'success');
                newsletterFallback.style.display = 'none';
                localStorage.setItem('newsletterSeen', 'true');
              } else {
                throw new Error('Subscription failed.');
              }
            })
            .catch(error => {
              console.error('Newsletter fallback subscription error:', error, '[Timestamp:', new Date().toISOString(), ']');
              this.showNotification('Failed to subscribe. Please try again later.', 'error');
            });
          });
        }
        if (fallbackDismiss) {
          fallbackDismiss.addEventListener('click', () => {
            console.log('Main: Newsletter fallback dismissed, marking as seen in localStorage [Timestamp:', new Date().toISOString(), ']');
            localStorage.setItem('newsletterSeen', 'true');
            newsletterFallback.style.display = 'none';
          });
        }
      } else {
        console.error('Main: Newsletter fallback element (#newsletterFallback) not found in DOM [Timestamp:', new Date().toISOString(), ']');
        this.showNotification('Newsletter fallback failed to load. Please check your connection or refresh the page.', 'error');
      }
    },

    showFallbackContent() {
      console.log('Main: Showing fallback content for navbar and footer... [Timestamp:', new Date().toISOString(), ']');
      const navbar = document.getElementById('navbar');
      const footer = document.getElementById('footer');
      if (navbar) {
        navbar.innerHTML = `
          <nav class="navbar navbar-expand-lg navbar-light fixed-top custom-navbar">
            <div class="container-fluid">
              <a class="navbar-brand custom-navbar-brand text-white fw-bold" href="/client/index.html">UpSkilled</a>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#customNavbarNav" aria-controls="customNavbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="customNavbarNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                  <li class="nav-item"><a class="nav-link text-white" href="/client/index.html#selection-heading">Browse Courses</a></li>
                  <li class="nav-item"><a class="nav-link text-white" href="/client/become_a_partner.html">Become a Partner</a></li>
                  <li class="nav-item"><a class="nav-link text-white" href="/client/our_mission.html">Our Mission</a></li>
                </ul>
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                  <li class="nav-item"><a class="nav-link text-white" href="/client/contact.html">Get Help</a></li>
                  <li class="nav-item"><a class="nav-link text-white" href="#">English</a></li>
                  <li class="nav-item"><img src="https://placehold.co/40x40?text=User" class="profile-icon" alt="User Profile" role="button" data-bs-toggle="modal" data-bs-target="#authModalTopRight" /></li>
                </ul>
              </div>
            </div>
          </nav>
        `;
        console.log('Main: Fallback navbar injected into DOM [Timestamp:', new Date().toISOString(), ']');
      }
      if (footer) {
        footer.innerHTML = `
          <footer class="custom-footer">
            <div class="container">
              <div class="custom-social-icons mb-3">
                <a href="#"><i class="fas fa-instagram"></i></a>
                <a href="#"><i class="fas fa-twitter"></i></a>
                <a href="#"><i class="fas fa-facebook-f"></i></a>
              </div>
              <div class="quick-links mb-3">
                <a href="/client/privacy.html">Privacy Policy</a> |
                <a href="/client/terms.html">Terms & Conditions</a> |
                <a href="/client/become_a_partner.html">Become a Partner</a> |
                <a href="/client/contact.html">Get Help</a>
              </div>
              <p>Training 5,000 underserved learners by 2030. Join the movement!</p>
              <p>© 2025 UpSkilled. All rights reserved.</p>
            </div>
          </footer>
        `;
        console.log('Main: Fallback footer injected into DOM [Timestamp:', new Date().toISOString(), ']');
      }
    },

    showNotification(message, type = 'info') {
      console.log(`Main: Showing notification: ${message} (Type: ${type}) [Timestamp:', new Date().toISOString(), ']`);
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background-color: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#cce5ff'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#004085'};
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        animation: slideIn 0.5s ease-out, fadeOut 3s ease-out 2s;
      `;
      document.body.appendChild(notification);

      const styles = document.createElement('style');
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

      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
      }, 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('Main: Document loaded, current URL:', window.location.href, '[Timestamp:', new Date().toISOString(), ']');
  console.log('Main: Initializing Main [Timestamp:', new Date().toISOString(), ']');
  Main.init();
});
