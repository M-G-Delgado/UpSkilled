const Main = {
    init() {
      console.log('Main: Initializing...');
      this.loadTemplates()
        .then(() => {
          console.log('Main: Templates loaded successfully, initializing other modules');
          this.initializeModules();
          this.showNewsletterModalOnFirstVisit(); // Show newsletter modal only on first visit
        })
        .catch(error => {
          console.error('Main: Error initializing templates:', error);
          this.showNotification('Failed to load page components. Please check your connection or refresh the page.', 'error');
          this.showFallbackContent();
        });
    },
  
    loadTemplates() {
      console.log('Main: Loading templates (navbar, footer)...');
      const templates = [
        { url: '/client/navbar.html', elementId: 'navbar' }, // Updated to absolute path
        { url: '/client/footer.html', elementId: 'footer' } // Updated to absolute path, removed newsletter.html
      ];
  
      return Promise.all(templates.map(template => {
        return fetch(template.url, { mode: 'same-origin' }) // Use same-origin to avoid CORS issues locally
          .then(response => {
            console.log(`Main: Fetch response for ${template.url}: Status ${response.status} - ${response.statusText}`);
            if (!response.ok) {
              throw new Error(`Failed to load ${template.url}: ${response.status} - ${response.statusText}`);
            }
            return response.text();
          })
          .then(data => {
            console.log(`Main: Received data for ${template.url}:`, data.substring(0, 100) + '...'); // Log first 100 chars
            const element = document.getElementById(template.elementId);
            if (element) {
              try {
                // Ensure the HTML is parsed correctly
                const parser = new DOMParser();
                const parsedDoc = parser.parseFromString(data, 'text/html');
                const content = parsedDoc.body.firstChild ? parsedDoc.body.firstChild.innerHTML : data;
                element.innerHTML = content;
                console.log(`Main: Successfully loaded ${template.url} into #${template.elementId}`);
              } catch (parseError) {
                console.error(`Main: Error parsing ${template.url}:`, parseError);
                throw new Error(`Failed to parse ${template.url}: ${parseError.message}`);
              }
            } else {
              console.warn(`Main: Element #${template.elementId} not found for ${template.url}`);
              throw new Error(`Element #${template.elementId} not found for ${template.url}`);
            }
          })
          .catch(error => {
            console.error(`Main: Error loading ${template.url}:`, error);
            throw error;
          });
      }));
    },
  
    initializeModules() {
      console.log('Main: Initializing dependent modules (UserInteractions, CourseLoader, Dashboard)...');
      // Initialize modules that depend on DOM being ready and templates loaded
      UserInteractions.init();
      CourseLoader.init();
      Dashboard.init(); // Ensure Dashboard is initialized after templates
    },
  
    showNewsletterModalOnFirstVisit() {
      console.log('Main: Checking if newsletter modal should be shown on first visit...');
      const hasSeenNewsletter = localStorage.getItem('newsletterSeen');
      console.log('Main: Newsletter seen status:', hasSeenNewsletter);
  
      // Ensure localStorage value is explicitly checked as a string
      if (hasSeenNewsletter !== 'true') {
        // Use MutationObserver to ensure the modal is in the DOM before showing
        const observer = new MutationObserver(() => {
          const newsletterModal = document.getElementById('newsletterModal');
          if (newsletterModal) {
            // Retry showing the modal with an extended delay and multiple attempts
            let attempts = 0;
            const maxAttempts = 3;
            const showModal = () => {
              if (attempts >= maxAttempts) {
                console.error('Main: Max attempts reached, showing fallback newsletter notice');
                this.showNewsletterFallback();
                return;
              }
              attempts++;
              console.log(`Main: Attempt ${attempts} to show newsletter modal...`);
              setTimeout(() => {
                try {
                  const bsModal = new bootstrap.Modal(newsletterModal, {
                    backdrop: 'static', // Prevent closing by clicking outside
                    keyboard: false // Prevent closing with ESC key
                  });
                  bsModal.show();
  
                  // Handle modal dismissal (close button or form submission) to mark as seen
                  newsletterModal.addEventListener('hidden.bs.modal', () => {
                    console.log('Main: Newsletter modal hidden, marking as seen in localStorage');
                    localStorage.setItem('newsletterSeen', 'true');
                  });
  
                  // Handle form submission in the newsletter modal
                  const newsletterForm = document.getElementById('newsletterForm');
                  if (newsletterForm) {
                    newsletterForm.addEventListener('submit', (e) => {
                      e.preventDefault();
                      const city = document.querySelector('input[name="city"]').value;
                      const email = document.querySelector('input[name="email"]').value;
                      if (!city || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        this.showNotification('Please enter a valid city and email address.', 'error');
                        return;
                      }
                      // Simulate successful subscription (replace with actual API call)
                      fetch('https://jsonplaceholder.typicode.com/posts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ city, email })
                      })
                      .then(response => {
                        if (response.ok) {
                          this.showNotification('Thank you for subscribing to our newsletter!', 'success');
                          bsModal.hide();
                          localStorage.setItem('newsletterSeen', 'true'); // Mark as seen after successful submission
                        } else {
                          throw new Error('Subscription failed.');
                        }
                      })
                      .catch(error => {
                        console.error('Newsletter subscription error:', error);
                        this.showNotification('Failed to subscribe. Please try again later.', 'error');
                      });
                    });
                  } else {
                    console.error('Main: Newsletter form not found in modal content');
                    this.showNotification('Newsletter form failed to load. Please check your connection or refresh the page.', 'error');
                    showModal(); // Retry if form isn’t found
                  }
                } catch (error) {
                  console.error('Main: Error showing newsletter modal on attempt', attempts, ':', error);
                  this.showNotification(`Error loading newsletter modal (Attempt ${attempts}). Retrying...`, 'warning');
                  showModal(); // Retry on error
                }
              }, 5000); // Extended delay to 5 seconds
            };
            showModal();
            observer.disconnect(); // Stop observing after finding the modal
          }
        });
  
        // Start observing the body for DOM changes
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        console.log('Main: User has already seen the newsletter modal, skipping display');
      }
    },
  
    showNewsletterFallback() {
      console.log('Main: Showing fallback newsletter notice...');
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
              this.showNotification('Please enter a valid city and email address.', 'error');
              return;
            }
            // Simulate successful subscription (replace with actual API call)
            fetch('https://jsonplaceholder.typicode.com/posts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ city, email })
            })
            .then(response => {
              if (response.ok) {
                this.showNotification('Thank you for subscribing to our newsletter!', 'success');
                newsletterFallback.style.display = 'none';
                localStorage.setItem('newsletterSeen', 'true'); // Mark as seen after successful submission
              } else {
                throw new Error('Subscription failed.');
              }
            })
            .catch(error => {
              console.error('Newsletter fallback subscription error:', error);
              this.showNotification('Failed to subscribe. Please try again later.', 'error');
            });
          });
        }
  
        if (fallbackDismiss) {
          fallbackDismiss.addEventListener('click', () => {
            console.log('Main: Newsletter fallback dismissed, marking as seen in localStorage');
            localStorage.setItem('newsletterSeen', 'true');
            newsletterFallback.style.display = 'none';
          });
        }
      } else {
        console.error('Main: Newsletter fallback element (#newsletterFallback) not found in DOM');
        this.showNotification('Newsletter fallback failed to load. Please check your connection or refresh the page.', 'error');
      }
    },
  
    showFallbackContent() {
      console.log('Main: Showing fallback content for navbar and footer...');
      const navbar = document.getElementById('navbar');
      const footer = document.getElementById('footer');
      if (navbar) {
        navbar.innerHTML = '<nav class="navbar navbar-expand-lg navbar-light fixed-top custom-navbar"><div class="container-fluid"><a class="navbar-brand custom-navbar-brand text-white fw-bold" href="index.html">UpSkilled</a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#customNavbarNav" aria-controls="customNavbarNav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="customNavbarNav"><ul class="navbar-nav me-auto mb-2 mb-lg-0"><li class="nav-item"><a class="nav-link text-white" href="index.html#selection-heading">Browse Courses</a></li><li class="nav-item"><a class="nav-link text-white" href="become_a_partner.html">Become a Partner</a></li><li class="nav-item"><a class="nav-link text-white" href="our_mission.html">Our Mission</a></li></ul><ul class="navbar-nav ms-auto mb-2 mb-lg-0"><li class="nav-item"><a class="nav-link text-white" href="contact.html">Get Help</a></li><li class="nav-item"><a class="nav-link text-white" href="#">English</a></li><li class="nav-item"><img src="https://placehold.co/40x40?text=User" class="profile-icon" alt="User Profile" role="button" data-bs-toggle="modal" data-bs-target="#authModalTopRight" /></li></ul></div></div></nav>'; // Updated with user icon
      }
      if (footer) {
        footer.innerHTML = '<footer class="custom-footer"><div class="container"><div class="custom-social-icons mb-3"><a href="#"><i class="fas fa-instagram"></i></a><a href="#"><i class="fas fa-twitter"></i></a><a href="#"><i class="fas fa-facebook-f"></i></a></div><div class="quick-links mb-3"><a href="privacy.html">Privacy Policy</a> |<a href="terms.html">Terms & Conditions</a> |<a href="become_a_partner.html">Become a Partner</a> |<a href="contact.html">Get Help</a></div><p>Training 5,000 underserved learners by 2030. Join the movement!</p><p>© 2025 UpSkilled. All rights reserved.</p></div></footer>';
      }
    },
  
    // Notification system (reuse or integrate with UserInteractions or CourseLoader)
    showNotification(message, type = 'info') {
      console.log(`Main: Showing notification: ${message} (Type: ${type})`);
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
    console.log('Main: Document loaded, initializing Main');
    Main.init();
  });