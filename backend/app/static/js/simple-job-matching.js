// Simplified Job Matching JavaScript - Debug Version
console.log("🚀 Loading simplified job matcher...");

class SimpleJobMatcher {
  constructor() {
    this.currentJobs = [];
    this.isLoading = false;
    console.log("✅ SimpleJobMatcher created");
    this.init();
  }

  init() {
    console.log("🔄 Initializing job matcher...");
    this.setupEventListeners();
    this.loadDefaultJobs();
  }

  setupEventListeners() {
    console.log("🔗 Setting up event listeners...");
    const searchForm = document.getElementById("job-search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => this.handleSearch(e));
      console.log("✅ Search form listener added");
    } else {
      console.error("❌ Search form not found");
    }
  }

  async handleSearch(event) {
    event.preventDefault();
    console.log("🔍 Search triggered");

    const what = document.getElementById("what")?.value || "Software Engineer";
    const where = document.getElementById("where")?.value || "Remote";

    console.log("Search params:", { what, where });

    await this.searchJobs(what, where);
  }

  async searchJobs(what = "Software Engineer", where = "Remote") {
    console.log("🌐 Starting job search...", { what, where });
    this.showLoading(true);

    try {
      const searchData = {
        what: what,
        where: where,
        page: 1,
        results_per_page: 12,
      };

      console.log("📤 Sending request to API...", searchData);

      const response = await fetch("/api/job-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchData),
      });

      console.log("📡 API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ API Success:", data.success);
        console.log("📊 Jobs received:", data.jobs?.length || 0);

        if (data.success && data.jobs) {
          this.currentJobs = data.jobs;
          this.displayJobs(data.jobs);
          this.updateStats(data.count, data.jobs.length);
          console.log("✅ Jobs displayed successfully");
        } else {
          console.error("❌ API returned no jobs");
          this.showError("No jobs found");
        }
      } else {
        console.error("❌ API request failed:", response.status);
        this.showError("Failed to fetch jobs");
      }
    } catch (error) {
      console.error("🚨 Search error:", error);
      this.showError("Connection error: " + error.message);
    }

    this.showLoading(false);
  }

  displayJobs(jobs) {
    console.log("🎨 Displaying jobs...", jobs.length);

    const container = document.getElementById("jobs-container");
    if (!container) {
      console.error("❌ jobs-container not found");
      return;
    }

    // Clear loading message
    container.innerHTML = "";

    if (jobs.length === 0) {
      container.innerHTML =
        '<div class="text-center py-8 text-slate-400">No jobs found</div>';
      return;
    }

    // Create simple job cards
    jobs.forEach((job, index) => {
      const jobCard = this.createSimpleJobCard(job, index);
      container.appendChild(jobCard);
    });

    console.log("✅ Job cards created:", jobs.length);
  }

  createSimpleJobCard(job, index) {
    const card = document.createElement("div");
    card.className =
      "bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all";

    const salary =
      job.salary_min && job.salary_max
        ? `₹${Math.round(job.salary_min / 100000)}-${Math.round(
            job.salary_max / 100000
          )} LPA`
        : job.salary_min
        ? `₹${Math.round(job.salary_min / 100000)}+ LPA`
        : "Salary not specified";

    card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-bold text-white mb-2">${
                      job.title || "Job Title"
                    }</h3>
                    <p class="text-purple-400 font-medium">${
                      job.company?.display_name || "Company"
                    }</p>
                    <p class="text-slate-400 text-sm">${
                      job.location?.display_name || "Location"
                    }</p>
                </div>
                <div class="text-right">
                    <div class="text-green-400 font-bold">${salary}</div>
                    <div class="text-sm text-slate-400">${
                      job.contract_type || "Full-time"
                    }</div>
                </div>
            </div>
            <div class="text-slate-300 text-sm mb-4 line-clamp-3">
                ${job.description?.substring(0, 200)}...
            </div>
            <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">
                    Posted: ${job.created || "Recently"}
                </span>
                <a href="${job.redirect_url || "#"}" target="_blank" 
                   class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all">
                    Apply Now
                </a>
            </div>
        `;

    return card;
  }

  showLoading(show) {
    console.log("⏳ Loading state:", show);
    const loadingElement = document.getElementById("loading-jobs");
    const container = document.getElementById("jobs-container");

    if (show) {
      if (loadingElement) loadingElement.style.display = "block";
      if (container)
        container.innerHTML =
          '<div class="text-center py-8 text-slate-400">Loading jobs...</div>';
    } else {
      if (loadingElement) loadingElement.style.display = "none";
    }
  }

  updateStats(total, showing) {
    const statsElement = document.getElementById("results-count");
    if (statsElement) {
      statsElement.textContent = `Showing ${showing} of ${total} jobs`;
    }
  }

  showError(message) {
    console.error("💥 Error:", message);
    const container = document.getElementById("jobs-container");
    if (container) {
      container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-red-400 mb-2">⚠️ ${message}</div>
                    <button onclick="window.jobMatcher.loadDefaultJobs()" 
                            class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                        Try Again
                    </button>
                </div>
            `;
    }
  }

  async loadDefaultJobs() {
    console.log("🏠 Loading default jobs...");
    await this.searchJobs("Software Engineer", "Remote");
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 DOM loaded, creating job matcher...");
  try {
    window.jobMatcher = new SimpleJobMatcher();
    console.log("✅ Job matcher initialized successfully");
  } catch (error) {
    console.error("🚨 Failed to initialize job matcher:", error);
  }
});

console.log("📜 Simplified job matching script loaded");
