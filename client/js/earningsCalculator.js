const EarningsCalculator = {
    init() {
      this.updateEarnings(); // Initialize with default values
      this.addEventListeners();
      this.addTooltips();
      this.adjustSliderWidth(); // Set slider widths to a narrower size
    },
  
    addEventListeners() {
      const sliders = document.querySelectorAll('.form-range');
      sliders.forEach(slider => {
        slider.addEventListener('input', () => this.updateEarnings());
      });
    },
  
    addTooltips() {
      const sliders = document.querySelectorAll('.form-range');
      sliders.forEach(slider => {
        slider.addEventListener('mouseover', function() {
          const value = this.value;
          const label = this.previousElementSibling.textContent.split(':')[0];
          this.title = `${label}: ${value}`;
        });
      });
    },
  
    // Adjust slider width to make them narrower
    adjustSliderWidth() {
      const sliders = document.querySelectorAll('.form-range');
      sliders.forEach(slider => {
        slider.style.width = '80%'; // Adjust this value as needed
      });
    },
  
    updateEarnings() {
      // Get input values from sliders
      const level = parseInt(document.getElementById("courseLevel").value); // 0-3 (Beginner to Multi-Day)
      const participants = parseInt(document.getElementById("participants").value); // 4-15
      const coursesPerMonth = parseInt(document.getElementById("coursesPerMonth").value); // 2-10
  
      // Map level to price and duration (based on your business plan)
      let coursePrice, courseDurationHours, levelName;
      switch (level) {
        case 0: // Beginner (Discovery/Foundation)
          levelName = 'Beginner';
          coursePrice = 55; // Avg. of €45-65 (excl. VAT)
          courseDurationHours = 1.5; // Avg. of 1-2 hours
          break;
        case 1: // Intermediate (Proficiency)
          levelName = 'Intermediate';
          coursePrice = 80; // Avg. of €75-85 (excl. VAT)
          courseDurationHours = 2.5; // Avg. of 2-3 hours
          break;
        case 2: // Advanced (Expertise)
          levelName = 'Advanced';
          coursePrice = 100; // Avg. of €95-105 (excl. VAT)
          courseDurationHours = 3.5; // Avg. of 3-4 hours
          break;
        case 3: // Multi-Day Workshop
          levelName = 'Multi-Day';
          coursePrice = 375; // Avg. of €300-450 (excl. VAT)
          courseDurationHours = 18; // Avg. of 2-5 days at 6 hours/day
          break;
        default:
          levelName = 'Beginner';
          coursePrice = 55;
          courseDurationHours = 1.5;
      }
  
      // Commission rate adjustments based on courses per month (performance-based)
      let commissionRate = 0.25; // Default 25% commission (75% retention)
      if (coursesPerMonth >= 6) {
        commissionRate = 0.15; // 15% commission (85% retention)
      }
      if (coursesPerMonth >= 9) {
        commissionRate = 0.10; // 10% commission (90% retention)
      }
  
      // Calculate revenue
      const revenuePerCourse = coursePrice * participants * (1 - commissionRate);
      const monthlyRevenue = revenuePerCourse * coursesPerMonth;
      const yearlyRevenue = monthlyRevenue * 12;
  
      // Calculate total hours spent holding courses
      const totalHours = courseDurationHours * coursesPerMonth * 12;
  
      // Estimate time savings via UpSkilled (hours per month)
      const adminTimeSaved = 2 * coursesPerMonth; // 2 hours saved per course on admin tasks
      const marketingTimeSaved = 1 * coursesPerMonth; // 1 hour saved per course on marketing
      const totalTimeSavedPerMonth = adminTimeSaved + marketingTimeSaved;
      const totalTimeSavedPerYear = totalTimeSavedPerMonth * 12;
  
      // Estimate cost savings via UpSkilled (€ per month)
      // Increased admin and marketing costs to reflect real-world expenses.
      const adminCostSaved = 40 * coursesPerMonth; // €40 saved per course on admin tasks
      const softwareCostSaved = 10 * coursesPerMonth; // €10 saved per course on software tools
      const marketingCostSaved = 30 * coursesPerMonth; // €30 saved per course on marketing expenses
      const totalCostSavedPerMonth = adminCostSaved + softwareCostSaved + marketingCostSaved;
      const totalCostSavedPerYear = totalCostSavedPerMonth * 12;
  
      // Update slider displays (inline with labels)
      document.getElementById("courseLevelDisplay").textContent = `${levelName} (€${coursePrice})`;
      document.getElementById("participantsDisplay").textContent = `${participants}`;
      document.getElementById("coursesPerMonthDisplay").textContent = `${coursesPerMonth}`;
  
      // Update earnings and detailed projections with a highlight only on the numeric portion
      document.getElementById("yearlyEarnings").innerHTML = `
        <p class="mb-1"><strong>Potential Yearly Earnings:</strong>
          <span class="highlight-earnings">${yearlyRevenue.toFixed(2)} €</span>
        </p>
        <small>
          This is your estimated annual income if you run ${coursesPerMonth} ${levelName.toLowerCase()} course(s) per month with ${participants} participant(s) each, paying €${coursePrice} per seat. 
          As you expand, UpSkilled reduces our commission so you keep more of your earnings.
        </small>
      `;
  
      document.getElementById("totalHours").innerHTML = `
        <span>${totalHours.toFixed(1)}</span> hours/year<br>
        <small>
          Total teaching time is ${courseDurationHours} hours per course × ${coursesPerMonth} course(s)/month × 12 months.
        </small>
      `;
      document.getElementById("timeSaved").innerHTML = `
        <span>${totalTimeSavedPerYear.toFixed(1)}</span> hours/year<br>
        <small>
          We handle booking, payment, and scheduling, saving you around ${totalTimeSavedPerMonth} hours every month.
        </small>
      `;
      document.getElementById("costSaved").innerHTML = `
        <span>${totalCostSavedPerYear.toFixed(2)} €</span>/year<br>
        <small>
          Save about €${adminCostSaved} on admin, €${softwareCostSaved} on software, and €${marketingCostSaved} on marketing monthly by letting UpSkilled do the heavy lifting.
        </small>
      `;
    }
  };
  
  // Initialize the calculator when the DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    EarningsCalculator.init();
  });
  