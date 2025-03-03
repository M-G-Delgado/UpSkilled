const Dashboard = {
    init() {
      console.log('Initializing Customer Dashboard...');
      this.setupEventListeners();
      this.loadDashboardData();
      this.updateUserProfile(); // Load user data for the modal
    },
  
    setupEventListeners() {
      console.log('Setting up dashboard event listeners...');
      const upgradeButton = document.getElementById('upgradeMembership');
      if (upgradeButton) {
        upgradeButton.addEventListener('click', (e) => {
          e.preventDefault();
          alert('Upgrade functionality coming soon! Please contact customer service for assistance.');
        });
      }
  
      const signOutButton = document.getElementById('signOutButton');
      if (signOutButton) {
        signOutButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.signOut();
        });
      }
    },
  
    loadDashboardData() {
      console.log('Loading dashboard data...');
      // Placeholder for API calls to fetch:
      // - Course history (course name, date, price, invoice)
      // - Skill points (current level, total points, points to next level)
      // - Membership status (free or premium)
      // Replace with actual fetch calls or database queries, e.g.:
      /*
      fetch('/api/customer/dashboard', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      })
      .then(response => response.json())
      .then(data => {
        this.updateCourseHistory(data.courses);
        this.updateSkillPoints(data.skillPoints);
        this.updateMembership(data.membership);
      })
      .catch(error => console.error('Dashboard data load error:', error));
      */
    },
  
    updateCourseHistory(courses) {
      const table = document.getElementById('courseHistoryTable');
      if (table) {
        table.innerHTML = '';
        courses.forEach(course => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${course.name}</td>
            <td>${course.date}</td>
            <td>${course.price} €</td>
            <td><a href="${course.invoiceUrl}" class="text-primary">View Invoice</a></td>
          `;
          table.appendChild(row);
        });
      }
    },
  
    updateSkillPoints(points) {
      document.getElementById('currentLevel')?.textContent = points.level || 'Explorer (Level 3)';
      document.getElementById('totalSkillPoints')?.textContent = `${points.total || 150} points`;
      document.getElementById('pointsToNextLevel')?.textContent = `${points.toNext || 50} points to ${points.nextLevel || 'Level 4 (Adventurer)'}`;
      const progressBar = document.querySelector('.progress-bar');
      if (progressBar) {
        const progress = points.progress || 75;
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        progressBar.textContent = `${progress}% to Next Level`;
      }
      // Update user level in modal
      document.getElementById('userLevel')?.textContent = points.level || 'Explorer (Level 3)';
    },
  
    updateMembership(membership) {
      document.getElementById('currentMembership')?.textContent = membership.status || 'Free Membership';
      // Update benefits or other membership details as needed
    },
  
    updateUserProfile() {
      console.log('Updating user profile in modal...');
      // Placeholder for fetching user data (name, level) from API or localStorage
      const userName = localStorage.getItem('userName') || 'John Doe';
      const currentDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
      const userLevel = localStorage.getItem('userLevel') || 'Explorer (Level 3)';
  
      const userNameElement = document.getElementById('userName');
      const userDateElement = document.getElementById('userDate');
      const userLevelElement = document.getElementById('userLevel');
  
      if (userNameElement) userNameElement.textContent = userName;
      if (userDateElement) userDateElement.textContent = currentDate;
      if (userLevelElement) userLevelElement.textContent = userLevel;
    },
  
    signOut() {
      console.log('Signing out...');
      // Clear authentication data (e.g., token, user info) from localStorage or session
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userLevel');
      // Redirect to index.html or login page
      window.location.href = 'index.html';
    },
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard: Document loaded, initializing Dashboard');
    Dashboard.init();
  });