// client/js/main.js

const Main = {
    init() {
      console.log('Main.init()');
      this.loadTemplates()
        .then(() => {
          this.initializeModules();
          // Only show the newsletter on relevant pages
          if (this.shouldShowNewsletter()) {
            // Set a random delay between 15 and 75 seconds
            const delay = Math.floor(Math.random() * (65000 - 10000 + 1)) + 15000;
            console.log(`Newsletter will show in ${delay} ms.`);
            setTimeout(() => {
              this.showNewsletterOnEveryLoad();
            }, delay);
          }
        })
        .catch(error => {
          console.error('Error loading templates:', error);
          this.showFallbackContent();
        });
    },
  
    loadTemplates() {
      console.log('Main.loadTemplates()');
      const origin = window.location.origin;
      const templates = [
        { url: `${origin}/client/partials/navbar.html`, elementId: 'navbar' },
        { url: `${origin}/client/partials/footer.html`, elementId: 'footer' },
        { url: `${origin}/client/partials/newsletter.html`, append: true },
        { url: `${origin}/client/partials/loginSignupModal.html`, append: true }
      ];
  
      return Promise.all(templates.map(template => {
        console.log(`Fetching: ${template.url}`);
        return fetch(template.url)
          .then(res => {
            if (!res.ok) throw new Error(`Failed to load ${template.url}: ${res.status}`);
            return res.text();
          })
          .then(html => {
            if (template.append) {
              document.body.insertAdjacentHTML('beforeend', html);
              console.log(`Appended: ${template.url}`);
            } else {
              const el = document.getElementById(template.elementId);
              if (!el) {
                console.warn(`No element #${template.elementId} found. Fallback invoked.`);
                this.showFallbackContent();
                throw new Error(`Missing #${template.elementId}`);
              }
              el.innerHTML = html;
              console.log(`Injected: ${template.url} into #${template.elementId}`);
            }
          })
          .catch(error => {
            console.error(`Error loading ${template.url}:`, error);
            throw error;
          });
      }));
    },
  
    initializeModules() {
      console.log('Main.initializeModules()');
      if (typeof UserInteractions !== 'undefined') {
        UserInteractions.init();
      }
    },
  
    // Return true if the current page is one where the newsletter should be shown
    shouldShowNewsletter() {
      // List the paths where the newsletter should appear
      const allowedPaths = ["/client/index.html", "/", "/"];
      const currentPath = window.location.pathname;
      console.log(`Current page path: ${currentPath}`);
      return allowedPaths.includes(currentPath);
    },
  
    // Show the newsletter modal using Bootstrap's modal API
    showNewsletterOnEveryLoad() {
      console.log('Main.showNewsletterOnEveryLoad()');
      const newsletterSection = document.getElementById('newsletterSection');
      if (newsletterSection) {
        if (typeof bootstrap === 'undefined' || typeof bootstrap.Modal !== 'function') {
          console.error('Bootstrap Modal not available.');
          return;
        }
        try {
          const newsletterModal = new bootstrap.Modal(newsletterSection, {
            backdrop: 'static',
            keyboard: true
          });
          newsletterModal.show();
          console.log('Newsletter modal displayed.');
        } catch (err) {
          console.error('Error creating/showing newsletter modal:', err);
        }
      } else {
        console.warn('Newsletter section not found in DOM.');
      }
    },
  
    showFallbackContent() {
      console.warn('Showing fallback content.');
      const navbar = document.getElementById('navbar');
      const footer = document.getElementById('footer');
      if (navbar) {
        navbar.innerHTML = `<nav class="navbar navbar-light bg-light"><div class="container">Fallback Navbar</div></nav>`;
      }
      if (footer) {
        footer.innerHTML = `<footer class="footer bg-light"><div class="container text-center">Fallback Footer</div></footer>`;
      }
    }
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded -> Main.init()');
    Main.init();
  });
  