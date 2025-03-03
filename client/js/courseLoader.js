const CourseLoader = {
  coursesData: null,
  originalPrice: null,
  currentPrice: null,
  currentCourse: null,
  courseDetailsModal: null, // Initialize dynamically for course details modal

  init() {
    console.log('Initializing CourseLoader...');
    // Check if this is a course-related page (e.g., has #city or #course-container)
    const isCoursePage = document.getElementById('city') || document.getElementById('course-container');
    if (isCoursePage) {
      this.setupEventListeners();
      console.log('Event listeners set up for course page');
      this.setupHeroFallback();
      console.log('Hero fallback set up');
      this.initializeCourseDetailsModal();
      console.log('Course details modal setup completed');
      this.loadCoursesFromLocalOrFetch();
      console.log('Courses loading initiated');
    } else {
      console.log('Not a course page, skipping course-related initialization');
    }
  },

  loadCoursesFromLocalOrFetch() {
    console.log('Loading courses from localStorage or fetching...');
    const cachedData = localStorage.getItem("coursesData");
    if (cachedData) {
      console.log('Found cached courses data, parsing...');
      this.coursesData = JSON.parse(cachedData);
      console.log('Courses data loaded from localStorage:', this.coursesData);
      this.loadCities();
      console.log('Calling loadCities with cached data...');
    } else {
      console.log('No cached data, fetching from API...');
      this.fetchCourses();
    }
  },

  fetchCourses() {
    console.log('Fetching courses from API...');
    // Try multiple ports starting from 3000 with detailed logging
    const tryFetchCourses = (port) => {
      console.log(`Attempting to fetch courses from port ${port}...`);
      return fetch(`http://localhost:${port}/api/courses`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors', // CORS mode explicitly enabled
        credentials: 'include' // If authentication is required
      })
      .then(response => {
        console.log(`Fetch response from port ${port}: Status ${response.status} - ${response.statusText}`);
        if (!response.ok) {
          if (response.status === 404 && port < 3005) {
            console.log(`Port ${port} failed (404), trying next port ${port + 1}...`);
            return tryFetchCourses(port + 1); // Try next port
          } else if (response.status === 0) {
            console.error(`CORS or connection issue on port ${port}:`, response.statusText);
            throw new Error(`CORS or connection issue on port ${port}: ${response.status} - ${response.statusText}`);
          } else if (response.status === 500) {
            console.error(`Server error on port ${port}:`, response.statusText);
            throw new Error(`Server error on port ${port}: ${response.status} - ${response.statusText}`);
          }
          throw new Error(`HTTP error on port ${port}! Status: ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error(`Fetch error on port ${port}:`, error);
        if (port < 3005) {
          console.log(`Retrying on port ${port + 1}...`);
          return tryFetchCourses(port + 1); // Try next port
        }
        throw error;
      });
    };

    tryFetchCourses(3000)
      .then(data => {
        console.log('Fetch successful, received data:', data);
        if (!data || data.length === 0) throw new Error("No courses found in response");
        console.log('Processing course data into nested structure...');
        this.coursesData = data.reduce((acc, course) => {
          acc[course.city] = acc[course.city] || {};
          acc[course.city][course.category] = acc[course.city][course.category] || [];
          acc[course.city][course.category].push(course);
          return acc;
        }, {});
        console.log('Courses data structured:', this.coursesData);
        localStorage.setItem("coursesData", JSON.stringify(this.coursesData));
        console.log('Courses data saved to localStorage');
        this.loadCities();
        console.log('Calling loadCities...');
      })
      .catch(error => {
        console.error("Fetch error:", error);
        this.showNotification('Unable to load courses. Please check your connection or try again later.', 'error');
      });
  },

  initializeCourseDetailsModal() {
    console.log('Initializing courseDetailsModal...');
    const modalElement = document.getElementById("courseDetailsModal");
    if (modalElement) {
      try {
        this.courseDetailsModal = new bootstrap.Modal(modalElement);
        console.log('courseDetailsModal initialized successfully');
      } catch (error) {
        console.error('Error initializing courseDetailsModal:', error);
        this.courseDetailsModal = null; // Set to null if initialization fails
        this.showNotification('Course details modal failed to load. Some features may not work.', 'warning');
      }
    } else {
      console.warn('courseDetailsModal not found in DOM, skipping initialization');
      this.courseDetailsModal = null; // Ensure it’s null if the element doesn’t exist
    }
  },

  setupEventListeners() {
    console.log('Setting up event listeners...');
    const citySelect = document.getElementById("city");
    const categorySelect = document.getElementById("category");
    const sortSelect = document.getElementById("sortCourses");
    const searchInput = document.getElementById("courseSearch");
    const attendeesSelect = document.getElementById("attendees");
    const reserveSpotButton = document.getElementById("reserveSpotButton");

    // Add event listeners only if elements exist
    if (citySelect) {
      citySelect.addEventListener("change", () => {
        console.log('City selection changed to:', citySelect.value);
        this.loadCategories(citySelect.value);
      });
    }
    if (categorySelect) {
      categorySelect.addEventListener("change", () => {
        console.log('Category selection changed to:', categorySelect.value);
        this.updateIntroText();
        this.loadCourses(citySelect?.value, categorySelect.value, searchInput?.value || "");
      });
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        console.log('Sort selection changed to:', sortSelect.value);
        this.loadCourses(citySelect?.value, categorySelect?.value, searchInput?.value || "");
      });
    }
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        console.log('Search input changed to:', searchInput.value);
        this.loadCourses(citySelect?.value, categorySelect?.value, searchInput.value);
      });
    }
    if (reserveSpotButton) {
      reserveSpotButton.addEventListener("click", () => {
        console.log('Reserve spot button clicked');
        alert("Your spot has been reserved!");
        this.awardSkillPoints();
      });
    }
    if (attendeesSelect) {
      attendeesSelect.addEventListener("change", this.updateTotalPrice.bind(this));
      attendeesSelect.addEventListener("input", this.updateTotalPrice.bind(this));
    }

    console.log('Event listeners set up');
  },

  setupHeroFallback() {
    console.log('Setting up hero fallback...');
    const heroVideo = document.getElementById("heroVideo");
    const fallback = document.querySelector(".hero-fallback-carousel");
    if (heroVideo && fallback) { // Only proceed if both elements exist
      heroVideo.addEventListener("error", () => {
        console.log('Hero video error, switching to fallback carousel');
        heroVideo.style.display = "none";
        fallback.style.display = "block";
        new bootstrap.Carousel(fallback, { interval: 3000 });
      });
    } else {
      console.warn('Hero video or fallback carousel not found, skipping hero fallback setup');
    }
    console.log('Hero fallback setup completed');
  },

  loadCities() {
    console.log('Loading cities...');
    const citySelect = document.getElementById("city");
    if (!citySelect) {
      console.log('City select not found, skipping loadCities');
      return;
    }
    citySelect.innerHTML = "";
    if (!this.coursesData || typeof this.coursesData !== "object") {
      console.log('No courses data available, setting default option');
      citySelect.innerHTML = "<option value=''>No cities available</option>";
      return;
    }
    console.log('Available cities:', Object.keys(this.coursesData));
    Object.keys(this.coursesData).forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
    if (citySelect.options.length) {
      console.log('Setting default city:', citySelect.options[0].value);
      citySelect.value = citySelect.options[0].value;
      this.loadCategories(citySelect.value);
    } else {
      console.log('No cities found, setting empty option');
      citySelect.innerHTML = "<option value=''>No cities available</option>";
    }
    console.log('Cities loaded');
  },

  loadCategories(selectedCity) {
    console.log(`Loading categories for city: ${selectedCity}`);
    const categorySelect = document.getElementById("category");
    if (!categorySelect) {
      console.log('Category select not found, skipping loadCategories');
      return;
    }
    categorySelect.innerHTML = "";
    if (!this.coursesData[selectedCity]) {
      console.log('No categories available for this city');
      categorySelect.innerHTML = "<option value=''>No categories available</option>";
      const container = document.getElementById("course-container");
      if (container) container.innerHTML = "<p>No categories available.</p>";
      return;
    }
    console.log('Available categories:', Object.keys(this.coursesData[selectedCity]));
    Object.keys(this.coursesData[selectedCity]).forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
    if (categorySelect.options.length) {
      console.log('Setting default category:', categorySelect.options[0].value);
      categorySelect.value = categorySelect.options[0].value;
      this.updateIntroText();
      this.loadCourses(selectedCity, categorySelect.value);
    } else {
      console.log('No categories found, setting empty option');
      categorySelect.innerHTML = "<option value=''>No categories available</option>";
      const container = document.getElementById("course-container");
      if (container) container.innerHTML = "<p>No categories available.</p>";
    }
    console.log('Categories loaded for', selectedCity);
  },

  updateIntroText() {
    console.log('Updating intro text...');
    const categorySelect = document.getElementById("category");
    if (!categorySelect) {
      console.log('Category select not found, skipping updateIntroText');
      return;
    }
    const selectedCategory = categorySelect.options[categorySelect.selectedIndex]?.text;
    const intros = {
      "Car Maintenance": "Learn simple ways to care for your car.",
      "Baking & Pastry": "Discover the art of baking and pastry-making.",
      "Space Engineering": "Explore the fundamentals of spacecraft design.",
      "Martian Agriculture": "Learn innovative techniques for extraterrestrial farming."
    };
    const introElement = document.getElementById("categoryIntro");
    if (introElement) {
      console.log('Setting intro text for category:', selectedCategory);
      introElement.textContent = intros[selectedCategory] || "Pick a course category to see more details.";
    }
    console.log('Intro text updated');
  },

  loadCourses(city, category, query = "") {
    console.log(`Loading courses for city: ${city}, category: ${category}, query: ${query}`);
    const container = document.getElementById("course-container");
    if (!container) {
      console.log('Course container not found, skipping loadCourses');
      return;
    }
    let courses = [];
    if (this.coursesData && this.coursesData[city] && this.coursesData[city][category]) {
      console.log('Filtering courses with query:', query);
      courses = this.coursesData[city][category].filter(course =>
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      console.log('No courses available for this city/category');
      container.innerHTML = '<p style="color: #fff; text-align: center; font-size: 1.2rem;">No courses found. Try another city or category!</p>';
      return;
    }

    courses.forEach(course => {
      let totalReviews = (course.reviews && Array.isArray(course.reviews)) ? course.reviews.length : 0;
      course.computedReviewCount = totalReviews;
      if (totalReviews > 0) {
        let sum = course.reviews.reduce((acc, r) => acc + r.rating, 0);
        course.computedRating = sum / totalReviews;
      } else {
        course.computedRating = 0;
      }
    });

    const sortValue = document.getElementById("sortCourses")?.value || "mostReviews";
    console.log('Sorting courses by:', sortValue);
    if (sortValue === "mostReviews") {
      courses.sort((a, b) => b.computedReviewCount - a.computedReviewCount);
    } else if (sortValue === "leastReviews") {
      courses.sort((a, b) => a.computedReviewCount - b.computedReviewCount);
    }
    container.innerHTML = "";
    if (!courses.length) {
      console.log('No courses found after filtering/sorting');
      container.innerHTML = '<p style="color: #fff; text-align: center; font-size: 1.2rem;">No courses found. Try another city or category!</p>';
      return;
    }

    console.log(`Rendering ${courses.length} courses...`);
    courses.forEach(course => {
      const card = document.createElement("div");
      card.className = "course-item";
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `View details for ${course.title}`);
      card.style.boxShadow = "0 2px 4px rgba(231,158,79,0.3)";

      const img = document.createElement("img");
      img.src = course.images[0]?.url;
      img.alt = course.images[0]?.alt;
      img.loading = "lazy";

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "70% Hands-On";

      const levelBadge = document.createElement("span");
      levelBadge.className = "level-badge";
      levelBadge.textContent = course.level;
      levelBadge.style.backgroundColor = (course.level === "Beginner") ? "#28a745" :
                                        (course.level === "Intermediate") ? "#ffc107" : "#dc3545";

      const title = document.createElement("h2");
      title.className = "course-title";
      title.textContent = course.title;

      const info = document.createElement("p");
      info.className = "course-info";
      info.textContent = course.description;

      const reviewInfo = document.createElement("p");
      reviewInfo.className = "course-review-info";
      reviewInfo.textContent = `Rating: ${course.computedRating.toFixed(1)} / 5 (${course.computedReviewCount} reviews)`;

      const topicsDiv = document.createElement("div");
      topicsDiv.className = "topics";
      topicsDiv.innerHTML = course.topics.map(topic => `
        <div class="topic">
          <img src="${topic.icon}" alt="${topic.alt}">
          <span>${topic.text}</span>
        </div>
      `).join("");

      card.append(img, badge, levelBadge, title, info, reviewInfo, topicsDiv);
      if (container) { // Ensure container exists before adding card
        card.addEventListener("click", () => {
          console.log(`Course card clicked for: ${course.title}`);
          if (this.courseDetailsModal) {
            this.showCourseDetails(course);
          } else {
            console.error('courseDetailsModal is not initialized. Some features may not work.');
            this.showNotification('Course details modal failed to load. Please try again.', 'error');
          }
        });
        card.addEventListener("mouseenter", () => {
          console.log(`Hovering over course: ${course.title}`);
          this.addFocusBlur(card);
        });
        card.addEventListener("mouseleave", () => {
          console.log(`Left hover on course: ${course.title}`);
          this.removeFocusBlur();
        });
        container.appendChild(card);
      }
    });
    console.log('Courses rendered successfully');
  },

  loadAttendees(dateData) {
    console.log('Loading attendees for date:', dateData);
    const attendeesSelect = document.getElementById("attendees");
    if (!attendeesSelect) {
      console.log('Attendees select not found, skipping loadAttendees');
      return;
    }
    attendeesSelect.innerHTML = "";
    if (dateData.spotsAvailable === 0) {
      const opt = document.createElement("option");
      opt.value = "0";
      opt.textContent = "Booked Out";
      attendeesSelect.appendChild(opt);
      this.currentPrice = null;
    } else {
      this.currentPrice = this.originalPrice;
      for (let i = 1; i <= dateData.spotsAvailable; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = i;
        attendeesSelect.appendChild(opt);
      }
    }
    console.log('Attendees options updated');
  },

  updateTotalPrice() {
    console.log('Updating total price...');
    const attendeesSelect = document.getElementById("attendees");
    if (!attendeesSelect) {
      console.log('Attendees select not found, skipping updateTotalPrice');
      return;
    }
    const attendeesValue = attendeesSelect.value;
    const attendees = parseInt(attendeesValue) || 1;
    if (this.currentPrice === null) {
      document.getElementById("totalPrice").textContent = "Select an available date";
      document.getElementById("basePrice").textContent = "0.00";
      document.getElementById("taxAmount").textContent = "0.00";
      console.log('No price set, displaying "Select an available date"');
      return;
    }
    const base = this.currentPrice * attendees;
    const tax = base * 0.19;
    const total = base + tax;
    if (document.getElementById("totalPrice")) document.getElementById("totalPrice").textContent = "€" + total.toFixed(2);
    if (document.getElementById("basePrice")) document.getElementById("basePrice").textContent = base.toFixed(2);
    if (document.getElementById("taxAmount")) document.getElementById("taxAmount").textContent = tax.toFixed(2);
    console.log(`Total price updated: €${total.toFixed(2)} (Base: €${base.toFixed(2)}, Tax: €${tax.toFixed(2)} for ${attendees} attendees)`);
  },

  sortAndDisplayReviews(reviews, sortOption) {
    console.log(`Sorting and displaying reviews with option: ${sortOption}`);
    let sorted = reviews.slice();
    if (sortOption === "latest") {
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOption === "highest") {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === "lowest") {
      sorted.sort((a, b) => a.rating - b.rating);
    }
    const reviewsContainer = document.getElementById("modalReviews");
    if (!reviewsContainer) {
      console.log('Reviews container not found, skipping sortAndDisplayReviews');
      return;
    }
    reviewsContainer.innerHTML = "";
    sorted.forEach(r => {
      console.log(`Rendering review from ${r.name} - Rating: ${r.rating}/5`);
      const item = document.createElement("div");
      item.className = "review-item mb-3";
      item.style.textAlign = "left";
      item.style.borderBottom = "1px solid #ddd";
      item.style.paddingBottom = "1rem";
      item.style.marginBottom = "1rem";
      const header = document.createElement("div");
      header.className = "review-header fw-bold";
      header.textContent = `${r.name} - ${r.rating}/5`;
      const body = document.createElement("div");
      body.className = "review-body mt-1";
      body.innerHTML = `<p style="margin-bottom: 0.5rem;">${r.text}</p><small>${r.date}</small>`;
      item.appendChild(header);
      item.appendChild(body);
      reviewsContainer.appendChild(item);
    });
    console.log('Reviews rendered successfully');
  },

  getSkillPoints(course) {
    console.log(`Calculating skill points for course: ${course.title}, Level: ${course.level}`);
    const levelPoints = { "Beginner": 40, "Intermediate": 60, "Advanced": 80 };
    return levelPoints[course.level] || 40;
  },

  getLevel(points) {
    console.log(`Determining level for points: ${points}`);
    const levels = [
      "Explorer", "Apprentice", "Journeyman", "Craftsman", "Specialist",
      "Expert", "Master", "Champion", "Grandmaster", "Legend"
    ];
    const levelIndex = Math.min(Math.floor(points / 100), levels.length - 1);
    return { name: levels[levelIndex], progress: (points % 100) / 100 * 100 };
  },

  awardSkillPoints() {
    console.log('Awarding skill points...');
    if (this.currentCourse) {
      const points = this.getSkillPoints(this.currentCourse);
      console.log(`Awarding ${points} skill points for course: ${this.currentCourse.title}`);
      // Note: User data (points, levels) would typically be managed by userInteractions.js
      // For now, this logs the action but doesn’t persist state
      if (this.courseDetailsModal) {
        this.showCourseDetails(this.currentCourse);
      } else {
        console.error('courseDetailsModal is not initialized. Skill points not updated in modal.');
        this.showNotification('Course details modal failed to load. Some features may not work.', 'warning');
      }
    }
  },

  showCourseDetails(course) {
    console.log(`Showing details for course: ${course.title}`);
    if (!Array.isArray(course.reviews)) {
      console.log('Initializing empty reviews array for course');
      course.reviews = [];
    }
    this.currentCourse = course;
    const now = new Date();
    const modalCourseTitle = document.getElementById("modalCourseTitle");
    const modalCourseDescription = document.getElementById("modalCourseDescription");
    const modalCourseBullets = document.getElementById("modalCourseBullets");
    const modalRating = document.getElementById("modalRating");
    const modalReviewCount = document.getElementById("modalReviewCount");
    const courseLength = document.getElementById("courseLength");
    const modalCourseLevel = document.getElementById("modalCourseLevel");
    const courseMaxClassSize = document.getElementById("courseMaxClassSize");
    const modalInstructorImage = document.getElementById("modalInstructorImage");
    const modalInstructorName = document.getElementById("modalInstructorName");
    const modalInstructorExp = document.getElementById("modalInstructorExp");
    const modalBusinessImage = document.getElementById("modalBusinessImage");
    const modalBusinessName = document.getElementById("modalBusinessName");
    const modalBusinessBadge = document.getElementById("modalBusinessBadge");
    const skillPoints = document.getElementById("skillPoints");
    const userLevel = document.getElementById("userLevel");
    const levelProgressBar = document.getElementById("levelProgressBar");
    const dateOptions = document.getElementById("dateOptions");

    if (!modalCourseTitle || !modalCourseDescription || !modalCourseBullets || !modalRating || !modalReviewCount || !courseLength || !modalCourseLevel || !courseMaxClassSize || !modalInstructorImage || !modalInstructorName || !modalInstructorExp || !modalBusinessImage || !modalBusinessName || !modalBusinessBadge || !skillPoints || !userLevel || !levelProgressBar || !dateOptions) {
      console.error('One or more modal elements not found, skipping showCourseDetails');
      this.showNotification('Course details modal elements not found. Please try again.', 'error');
      return;
    }

    modalCourseTitle.textContent = course.title;
    modalCourseDescription.textContent = course.description;
    modalCourseBullets.innerHTML = course.details.map(d => `<li>${d}</li>`).join("");
    this.originalPrice = parseFloat(course.price.replace("€", ""));
    let totalReviews = (course.reviews && Array.isArray(course.reviews)) ? course.reviews.length : 0;
    let avgRating = totalReviews > 0 ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
    console.log(`Course reviews count: ${totalReviews}, Average rating: ${avgRating.toFixed(1)}/5`);
    modalRating.textContent = `${avgRating.toFixed(1)}/5`;
    modalReviewCount.textContent = `${totalReviews} reviews`;
    courseLength.textContent = `Course Length: ${course.duration}`;
    modalCourseLevel.textContent = course.level;
    courseMaxClassSize.textContent = course.maxClassSize;
    modalInstructorImage.src = course.instructor.image || "";
    modalInstructorName.textContent = course.instructor.name;
    modalInstructorExp.textContent = course.instructor.experience;
    modalBusinessImage.src = course.business.image || "";
    modalBusinessName.textContent = course.business.name;
    modalBusinessBadge.textContent = course.business.badge || "";

    const skillPointsValue = this.getSkillPoints(course);
    console.log(`Skill points for course: ${skillPointsValue}`);
    skillPoints.textContent = `Earn ${skillPointsValue} Skill Points`;
    const level = this.getLevel(0); // Default to 0 points for now
    console.log(`User level: ${level.name}, Progress: ${level.progress}%`);
    userLevel.textContent = `Level: ${level.name}`;
    levelProgressBar.style.width = `${level.progress}%`;

    const validDates = course.dates.filter(d => new Date(d.date.split("(")[0]) > now);
    console.log(`Valid dates for course:`, validDates);
    const availableDates = validDates.filter(d => d.spotsAvailable > 0);
    let defaultDate = availableDates[0] || validDates[0];
    dateOptions.innerHTML = validDates.map((d, i) => {
      const checked = (d === defaultDate) ? "checked" : "";
      return `
        <div style="width: 100%; text-align: center;">
          <input type="radio" name="bookingDate" value="${d.date}" id="bookingDate_${i}" ${checked}>
          <label for="bookingDate_${i}" style="${d.spotsAvailable === 0 ? 'color: red;' : ''}">${d.date} (${d.status})</label>
        </div>
      `;
    }).join("");
    const radios = dateOptions.querySelectorAll('input[name="bookingDate"]');
    radios.forEach((radio, i) => {
      radio.addEventListener("click", () => {
        console.log(`Date selected: ${validDates[i].date}`);
        const selected = validDates[i];
        this.loadAttendees(selected);
        this.updateTotalPrice();
      });
      radio.addEventListener("change", () => {
        console.log(`Date changed to: ${validDates[i].date}`);
        const selected = validDates[i];
        this.loadAttendees(selected);
        this.updateTotalPrice();
      });
    });
    if (defaultDate) {
      console.log('Setting default date:', defaultDate.date);
      this.loadAttendees(defaultDate);
    }
    this.updateTotalPrice();

    const detailsTabEl = document.getElementById("details-tab");
    if (detailsTabEl) {
      console.log('Showing details tab');
      new bootstrap.Tab(detailsTabEl).show();
    }

    if (totalReviews > 0) {
      console.log('Loading reviews for course');
      const sortSelect = document.getElementById("reviewsSortSelect");
      const initialSort = sortSelect ? sortSelect.value : "latest";
      this.sortAndDisplayReviews(course.reviews, initialSort);
      if (sortSelect) {
        sortSelect.onchange = () => {
          console.log('Reviews sort changed to:', sortSelect.value);
          this.sortAndDisplayReviews(course.reviews, sortSelect.value);
        };
      }
    } else {
      console.log('No reviews available for course');
      const modalReviews = document.getElementById("modalReviews");
      if (modalReviews) modalReviews.innerHTML = "<p>No reviews available.</p>";
    }
    if (this.courseDetailsModal) {
      this.courseDetailsModal.show();
    } else {
      console.error('courseDetailsModal is not initialized. Course details cannot be shown.');
      this.showNotification('Course details modal failed to load. Please try again.', 'error');
    }
    console.log('Course details modal shown or attempted');
  },

  addFocusBlur(elem) {
    console.log('Adding focus blur effect to course card');
    if (!document.getElementById("blurOverlay")) {
      const overlay = document.createElement("div");
      overlay.id = "blurOverlay";
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px);
        z-index: 100; pointer-events: none;
      `;
      document.body.appendChild(overlay);
    }
    elem.style.position = "relative";
    elem.style.zIndex = "200";
  },

  removeFocusBlur() {
    console.log('Removing focus blur effect from course card');
    const overlay = document.getElementById("blurOverlay");
    if (overlay) {
      document.body.removeChild(overlay);
      console.log('Blur overlay removed');
    } else {
      console.warn('Blur overlay not found, may already be removed');
    }
    // Reset zIndex on the card if needed
    const card = document.querySelector('.course-item:hover');
    if (card) {
      card.style.zIndex = "";
    }
  },

  // Notification system for course-related feedback
  showNotification(message, type = 'info') {
    console.log(`Showing notification: ${message} (Type: ${type})`);
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

document.addEventListener("DOMContentLoaded", () => {
  console.log('Document loaded, initializing CourseLoader');
  CourseLoader.init();
});