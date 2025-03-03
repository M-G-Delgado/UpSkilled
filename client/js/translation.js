const TranslationManager = {
  languages: null,
  translations: null,
  currentLanguage: localStorage.getItem('selectedLanguage') || 'en',

  init() {
    console.log('TranslationManager: Initializing...');
    this.loadLanguages()
      .then(() => {
        console.log('TranslationManager: Languages loaded successfully, rendering dropdown and applying translations');
        this.renderLanguageDropdown();
        this.applyTranslations(this.currentLanguage);
        this.setupLanguageSwitch();
      })
      .catch(error => {
        console.error('TranslationManager: Error initializing translations:', error);
        this.showNotification('Failed to load languages. Defaulting to English.', 'error');
        this.applyTranslations('en'); // Fallback to English if loading fails
      });
  },

  loadLanguages() {
    console.log('TranslationManager: Loading languages from /client/languages.json...');
    return fetch('/client/languages.json')
      .then(response => {
        console.log('TranslationManager: Fetch response for languages.json - Status:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('TranslationManager: Languages data received:', data);
        this.languages = data.languages;
        this.translations = data.translations;
        console.log('TranslationManager: Languages and translations stored successfully:', {
          languages: this.languages,
          translations: Object.keys(this.translations)
        });
      })
      .catch(error => {
        console.error('TranslationManager: Failed to fetch or parse languages.json:', error);
        throw error;
      });
  },

  renderLanguageDropdown() {
    console.log('TranslationManager: Rendering language dropdown...');
    const dropdown = document.getElementById('languageDropdown');
    const menu = document.querySelector('.dropdown-menu[aria-labelledby="languageDropdown"]');
    if (dropdown && menu) {
      console.log('TranslationManager: Dropdown and menu elements found, updating content');
      const currentLang = this.languages.find(lang => lang.code === this.currentLanguage);
      if (currentLang) {
        console.log('TranslationManager: Setting dropdown text to:', currentLang.name);
        dropdown.textContent = currentLang.name;
      } else {
        console.warn('TranslationManager: Current language not found, defaulting to English');
        dropdown.textContent = 'English';
      }
      menu.innerHTML = this.languages.map(lang => `
        <li><a class="dropdown-item lang-option" data-lang="${lang.code}" href="#">${lang.name}</a></li>
      `).join('');
      console.log('TranslationManager: Language dropdown rendered with options:', this.languages.map(l => l.name));
    } else {
      console.warn('TranslationManager: Language dropdown or menu not found in DOM, skipping render');
      console.log('TranslationManager: Checking DOM for #languageDropdown:', !!dropdown, 'and dropdown-menu:', !!menu);
    }
  },

  setupLanguageSwitch() {
    console.log('TranslationManager: Setting up language switch event listeners...');
    const langOptions = document.querySelectorAll('.lang-option');
    if (langOptions.length > 0) {
      console.log('TranslationManager: Found', langOptions.length, 'language options in dropdown');
      langOptions.forEach(option => {
        option.addEventListener('click', (e) => {
          e.preventDefault();
          const newLanguage = e.target.getAttribute('data-lang');
          console.log('TranslationManager: Language switch triggered - New language:', newLanguage);
          this.currentLanguage = newLanguage;
          localStorage.setItem('selectedLanguage', newLanguage);
          console.log('TranslationManager: Language saved to localStorage:', newLanguage);
          this.applyTranslations(newLanguage);
          this.renderLanguageDropdown();
          this.updateDirectionality(newLanguage);
          console.log('TranslationManager: Language switch completed for:', newLanguage);
        });
      });
    } else {
      console.warn('TranslationManager: No .lang-option elements found, language switch not set up');
    }
  },

  applyTranslations(lang) {
    console.log('TranslationManager: Applying translations for language:', lang);
    const translation = this.translations[lang];
    if (!translation) {
      console.warn('TranslationManager: No translations found for language:', lang, '- Defaulting to English');
      this.applyTranslations('en');
      return;
    }

    // Update navigation bar
    console.log('TranslationManager: Updating navigation bar...');
    const navbarBrand = document.querySelector('.navbar-brand.custom-navbar-brand');
    const navbarLinks = document.querySelectorAll('.nav-link');
    if (navbarBrand) navbarBrand.textContent = translation.navbar_brand;
    navbarLinks.forEach(link => {
      const i18nKey = link.getAttribute('data-i18n');
      if (i18nKey && translation[i18nKey]) {
        console.log('TranslationManager: Updating nav link:', i18nKey, 'to:', translation[i18nKey]);
        link.textContent = translation[i18nKey];
      }
    });

    // Update footer links
    console.log('TranslationManager: Updating footer...');
    const footerLinks = {
      privacy: document.querySelector('#footerPrivacy, a[href="privacy.html"]') || document.querySelector('a[href="/privacy-policy.html"]'),
      terms: document.querySelector('#footerTerms, a[href="terms.html"]') || document.querySelector('a[href="/terms-conditions.html"]'),
      partner: document.querySelector('#footerPartner, a[href="become_a_partner.html"]'),
      contact: document.querySelector('#footerContact, a[href="contact.html"]') || document.querySelector('a[href="#contact-form"]')
    };
    Object.keys(footerLinks).forEach(key => {
      if (footerLinks[key]) {
        const i18nKey = `contact_footer_${key}`; // Assuming contact page keys for consistency
        console.log('TranslationManager: Updating footer link:', key, 'to:', translation[i18nKey]);
        footerLinks[key].textContent = translation[i18nKey];
      }
    });

    // Update footer impact and copyright
    const footerImpact = document.querySelector('footer p:nth-child(3)');
    const footerCopyright = document.querySelector('footer p:nth-child(4)');
    if (footerImpact) {
      console.log('TranslationManager: Updating footer impact to:', translation.contact_footer_impact);
      footerImpact.textContent = translation.contact_footer_impact;
    }
    if (footerCopyright) {
      console.log('TranslationManager: Updating footer copyright to:', translation.contact_footer_copyright);
      footerCopyright.textContent = translation.contact_footer_copyright;
    }

    // Update page-specific content for contact.html
    console.log('TranslationManager: Applying contact page translations...');
    const currentPath = window.location.pathname.split('/').pop().toLowerCase();
    if (currentPath === 'contact.html') {
      this.applyContactTranslations(translation);
    }
  },

  applyContactTranslations(translation) {
    console.log('TranslationManager: Applying translations for contact.html...');
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      console.log('TranslationManager: Translating element with key:', key, '- Element:', element.tagName);
      if (translation[key]) {
        if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
          console.log('TranslationManager: Setting placeholder for:', key, 'to:', translation[key]);
          element.placeholder = translation[key];
        } else if (element.tagName.toLowerCase() === 'select') {
          console.log('TranslationManager: Translating select (category) for:', key);
          // Handle select options as individual strings, not an array
          if (key === 'contact_category') {
            const options = [
              { value: '', text: translation.contact_category, selected: true, key: 'contact_category' },
              { value: 'General Inquiry', text: translation.contact_category_general, key: 'contact_category_general' },
              { value: 'Course Registration', text: translation.contact_category_registration, key: 'contact_category_registration' },
              { value: 'Technical Support', text: translation.contact_category_technical, key: 'contact_category_technical' },
              { value: 'Partnership Inquiry', text: translation.contact_category_partnership, key: 'contact_category_partnership' },
              { value: 'Feedback / Complaint', text: translation.contact_category_feedback, key: 'contact_category_feedback' },
              { value: 'Other', text: translation.contact_category_other, key: 'contact_category_other' }
            ];
            element.innerHTML = options.map(option => `
              <option value="${option.value}" ${option.selected ? 'selected' : ''} data-i18n="${option.key}">${option.text}</option>
            `).join('');
          } else {
            console.warn('TranslationManager: Unexpected select element for key:', key);
          }
        } else if (element.tagName.toLowerCase() === 'label') {
          console.log('TranslationManager: Setting label text for:', key, 'to:', translation[key]);
          element.textContent = translation[key];
        } else {
          console.log('TranslationManager: Setting text content for:', key, 'to:', translation[key]);
          element.textContent = translation[key];
        }
      } else {
        console.warn('TranslationManager: No translation found for key:', key, '- Skipping');
      }
    });

    // Ensure FAQ items (accordion headers and questions) are translated
    console.log('TranslationManager: Translating FAQ items...');
    const faqHeaders = document.querySelectorAll('.faq-topic h5[data-i18n]');
    const faqQuestions = document.querySelectorAll('.accordion-button[data-i18n]');
    faqHeaders.forEach(header => {
      const key = header.getAttribute('data-i18n');
      console.log('TranslationManager: Translating FAQ header with key:', key);
      if (translation[key]) {
        header.textContent = translation[key];
      } else {
        console.warn('TranslationManager: No translation for FAQ header key:', key);
      }
    });
    faqQuestions.forEach(question => {
      const key = question.getAttribute('data-i18n');
      console.log('TranslationManager: Translating FAQ question with key:', key);
      if (translation[key]) {
        question.textContent = translation[key].replace(/<i[^>]*>.*?<\/i>/, ''); // Preserve icons but update text
      } else {
        console.warn('TranslationManager: No translation for FAQ question key:', key);
      }
    });
  },

  updateDirectionality(lang) {
    console.log('TranslationManager: Updating text direction for language:', lang);
    const direction = this.languages.find(l => l.code === lang).direction;
    document.documentElement.setAttribute('dir', direction);
    console.log('TranslationManager: Document direction set to:', direction);
  },

  // Notification system for translation feedback
  showNotification(message, type = 'info') {
    console.log('TranslationManager: Showing notification:', message, '(Type:', type, ')');
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

    // CSS animations
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

    // Remove notification after animation
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('TranslationManager: Document loaded, initializing TranslationManager');
  TranslationManager.init();
});