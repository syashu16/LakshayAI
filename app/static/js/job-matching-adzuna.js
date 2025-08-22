// Job Matching with Adzuna API Integration
class JobMatchingApp {
  constructor() {
    this.jobs = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.isLoading = false;
    this.searchHistory = [];
    this.savedJobs = [];
    this.init();
  }

  init() {
    this.loadSavedData();
    this.setupEventListeners();
    this.loadJobCategories();
    console.log("🔍 Job Matching App with Adzuna API initialized");
  }

  loadSavedData() {
    // Load search history
    const history = localStorage.getItem("job_search_history");
    if (history) {
      this.searchHistory = JSON.parse(history);
      this.renderSearchHistory();
    }

    // Load saved jobs
    const saved = localStorage.getItem("saved_jobs");
    if (saved) {
      this.savedJobs = JSON.parse(saved);
      this.updateSavedJobsCount();
    }
  }

  setupEventListeners() {
    // Search form
    const searchForm = document.getElementById("job-search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => this.handleSearch(e));
    }

    // Advanced search toggle
    const advancedToggle = document.getElementById("advanced-search-toggle");
    if (advancedToggle) {
      advancedToggle.addEventListener("click", () =>
        this.toggleAdvancedSearch()
      );
    }

    // AI job matching
    const aiMatchBtn = document.getElementById("ai-job-match");
    if (aiMatchBtn) {
      aiMatchBtn.addEventListener("click", () => this.getAIJobMatches());
    }

    // Salary insights
    const salaryBtn = document.getElementById("salary-insights");
    if (salaryBtn) {
      salaryBtn.addEventListener("click", () => this.getSalaryInsights());
    }

    // Location filter
    const locationSelect = document.getElementById("location-filter");
    if (locationSelect) {
      locationSelect.addEventListener("change", () =>
        this.handleLocationChange()
      );
    }

    // Sort options
    const sortSelect = document.getElementById("sort-by");
    if (sortSelect) {
      sortSelect.addEventListener("change", () => this.handleSortChange());
    }

    // Pagination
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("page-btn")) {
        const page = parseInt(e.target.dataset.page);
        this.loadPage(page);
      }

      if (e.target.classList.contains("save-job-btn")) {
        const jobId = e.target.dataset.jobId;
        this.toggleSaveJob(jobId);
      }

      if (e.target.classList.contains("apply-job-btn")) {
        const jobUrl = e.target.dataset.jobUrl;
        this.applyToJob(jobUrl);
      }
    });

    // Skills input for AI matching
    const skillsInput = document.getElementById("ai-skills-input");
    if (skillsInput) {
      skillsInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.addSkill();
        }
      });
    }

    // Quick search buttons
    document.querySelectorAll(".quick-search-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const query = e.target.dataset.query;
        const location = e.target.dataset.location || "";
        this.performQuickSearch(query, location);
      });
    });
  }

  async loadJobCategories() {
    try {
      const response = await fetch("/api/job-categories");
      const result = await response.json();

      if (result.success && result.categories) {
        this.renderJobCategories(result.categories);
      }
    } catch (error) {
      console.error("Error loading job categories:", error);
    }
  }

  renderJobCategories(categories) {
    const container = document.getElementById("job-categories");
    if (!container) return;

    container.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                ${categories
                  .slice(0, 12)
                  .map(
                    (category) => `
                    <button class="quick-search-btn p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm font-medium text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300"
                            data-query="${category.tag}" 
                            data-location="">
                        ${category.label}
                    </button>
                `
                  )
                  .join("")}
            </div>
        `;

    // Re-attach event listeners
    container.querySelectorAll(".quick-search-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const query = e.target.dataset.query;
        const location = e.target.dataset.location || "";
        this.performQuickSearch(query, location);
      });
    });
  }

  async handleSearch(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const searchParams = {
      what: formData.get("what") || "",
      where: formData.get("where") || "",
      salary_min: formData.get("salary_min") || null,
      salary_max: formData.get("salary_max") || null,
      contract_type: formData.get("contract_type") || null,
      sort_by: formData.get("sort_by") || "relevance",
      page: 1,
    };

    await this.performSearch(searchParams);
  }

  async performQuickSearch(query, location = "") {
    const searchParams = {
      what: query,
      where: location,
      page: 1,
      sort_by: "relevance",
    };

    // Update form fields
    const whatInput = document.getElementById("what");
    const whereInput = document.getElementById("where");

    if (whatInput) whatInput.value = query;
    if (whereInput) whereInput.value = location;

    await this.performSearch(searchParams);
  }

  async performSearch(searchParams) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading("Searching for jobs...");

    try {
      const response = await fetch("/api/job-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      const result = await response.json();

      if (result.success) {
        this.jobs = result.jobs;
        this.currentPage = result.current_page;
        this.totalPages = result.total_pages || 1;

        this.renderJobs();
        this.renderPagination();
        this.saveSearchToHistory(searchParams, result.count);

        this.showSuccessAlert(`Found ${result.count} jobs!`);

        // Scroll to results
        const resultsSection = document.getElementById("search-results");
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        this.showErrorAlert("Search failed: " + result.error);
        this.renderNoResults();
      }
    } catch (error) {
      console.error("Search error:", error);
      this.showErrorAlert("Network error. Please try again.");
      this.renderNoResults();
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  renderJobs() {
    const container = document.getElementById("jobs-container");
    if (!container) return;

    if (this.jobs.length === 0) {
      this.renderNoResults();
      return;
    }

    container.innerHTML = `
            <div class="grid gap-6">
                ${this.jobs.map((job) => this.renderJobCard(job)).join("")}
            </div>
        `;
  }

  renderJobCard(job) {
    const isJobSaved = this.savedJobs.some((saved) => saved.id === job.id);
    // Handle different data structures - API returns different format than expected
    const salary =
      job.salary || this.formatSalary(job.salary_min, job.salary_max);
    const postedDate = this.formatDate(job.created);
    const company =
      job.company?.display_name || job.company || "Company not specified";
    const location =
      job.location?.display_name || job.location || "Location not specified";

    return `
            <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <!-- Job Header -->
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer" 
                            onclick="window.open('${
                              job.redirect_url
                            }', '_blank')">
                            ${job.title}
                        </h3>
                        <div class="flex items-center space-x-4 text-sm text-gray-600">
                            <span class="flex items-center">
                                <i class="fas fa-building mr-1"></i>
                                ${company}
                            </span>
                            <span class="flex items-center">
                                <i class="fas fa-map-marker-alt mr-1"></i>
                                ${location}
                            </span>
                            <span class="flex items-center">
                                <i class="fas fa-clock mr-1"></i>
                                ${postedDate}
                            </span>
                        </div>
                    </div>
                    <button class="save-job-btn p-2 rounded-full hover:bg-gray-100 transition-colors ${
                      isJobSaved ? "text-red-500" : "text-gray-400"
                    }"
                            data-job-id="${job.id}"
                            title="${
                              isJobSaved ? "Remove from saved jobs" : "Save job"
                            }">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>

                <!-- Salary and Contract -->
                <div class="flex items-center space-x-4 mb-4">
                    ${
                      salary
                        ? `
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <i class="fas fa-dollar-sign mr-1"></i>
                            ${salary}
                        </span>
                    `
                        : ""
                    }
                    ${
                      job.contract_type
                        ? `
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            ${job.contract_type}
                        </span>
                    `
                        : ""
                    }
                    ${
                      job.contract_time
                        ? `
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            ${job.contract_time}
                        </span>
                    `
                        : ""
                    }
                </div>

                <!-- Job Description -->
                <div class="text-gray-700 mb-4">
                    <p class="line-clamp-3">${
                      job.description || "No description available."
                    }</p>
                </div>

                <!-- Job Actions -->
                <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div class="flex space-x-2">
                        <button class="apply-job-btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                data-job-url="${job.redirect_url}">
                            Apply Now
                        </button>
                        <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                onclick="this.nextElementSibling.classList.toggle('hidden')">
                            More Details
                        </button>
                        <!-- Job Details Modal Trigger -->
                        <div class="hidden fixed inset-0 bg-black bg-opacity-50 z-50" onclick="this.classList.add('hidden')">
                            <div class="flex items-center justify-center min-h-screen p-4">
                                <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto" onclick="event.stopPropagation()">
                                    <div class="flex justify-between items-center mb-4">
                                        <h3 class="text-lg font-bold">${
                                          job.title
                                        }</h3>
                                        <button onclick="this.closest('.fixed').classList.add('hidden')" class="text-gray-500 hover:text-gray-700">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <div class="space-y-4">
                                        <div>
                                            <h4 class="font-semibold mb-2">Company</h4>
                                            <p>${company}</p>
                                        </div>
                                        <div>
                                            <h4 class="font-semibold mb-2">Location</h4>
                                            <p>${location}</p>
                                        </div>
                                        <div>
                                            <h4 class="font-semibold mb-2">Description</h4>
                                            <div class="prose max-w-none">${
                                              job.description ||
                                              "No description available."
                                            }</div>
                                        </div>
                                        <div class="pt-4 border-t">
                                            <button class="apply-job-btn w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    data-job-url="${
                                                      job.redirect_url
                                                    }">
                                                Apply on ${
                                                  job.source || "Job Site"
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-sm text-gray-500">
                        via ${job.source || "Adzuna"}
                    </div>
                </div>
            </div>
        `;
  }

  renderNoResults() {
    const container = document.getElementById("jobs-container");
    if (!container) return;

    container.innerHTML = `
            <div class="text-center py-12">
                <div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-search text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">No jobs found</h3>
                <p class="text-gray-600 mb-6">Try adjusting your search criteria or exploring different keywords.</p>
                <div class="space-x-3">
                    <button onclick="document.getElementById('what').value = 'software developer'; document.getElementById('job-search-form').dispatchEvent(new Event('submit'))" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Search Software Jobs
                    </button>
                    <button onclick="document.getElementById('what').value = 'marketing'; document.getElementById('job-search-form').dispatchEvent(new Event('submit'))" 
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Search Marketing Jobs
                    </button>
                </div>
            </div>
        `;
  }

  renderPagination() {
    const container = document.getElementById("pagination-container");
    if (!container || this.totalPages <= 1) {
      if (container) container.innerHTML = "";
      return;
    }

    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    let paginationHTML = `
            <div class="flex justify-center items-center space-x-2 mt-8">
                <button class="page-btn px-3 py-2 rounded-lg ${
                  this.currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border"
                }"
                        data-page="${this.currentPage - 1}" 
                        ${this.currentPage === 1 ? "disabled" : ""}>
                    <i class="fas fa-chevron-left"></i>
                </button>
        `;

    if (startPage > 1) {
      paginationHTML += `
                <button class="page-btn px-3 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border" data-page="1">1</button>
                ${
                  startPage > 2
                    ? '<span class="px-2 text-gray-500">...</span>'
                    : ""
                }
            `;
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
                <button class="page-btn px-3 py-2 rounded-lg ${
                  i === this.currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border"
                }"
                        data-page="${i}">
                    ${i}
                </button>
            `;
    }

    if (endPage < this.totalPages) {
      paginationHTML += `
                ${
                  endPage < this.totalPages - 1
                    ? '<span class="px-2 text-gray-500">...</span>'
                    : ""
                }
                <button class="page-btn px-3 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border" data-page="${
                  this.totalPages
                }">${this.totalPages}</button>
            `;
    }

    paginationHTML += `
                <button class="page-btn px-3 py-2 rounded-lg ${
                  this.currentPage === this.totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border"
                }"
                        data-page="${this.currentPage + 1}"
                        ${
                          this.currentPage === this.totalPages ? "disabled" : ""
                        }>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;

    container.innerHTML = paginationHTML;
  }

  async loadPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    const formData = new FormData(document.getElementById("job-search-form"));
    const searchParams = {
      what: formData.get("what") || "",
      where: formData.get("where") || "",
      salary_min: formData.get("salary_min") || null,
      salary_max: formData.get("salary_max") || null,
      contract_type: formData.get("contract_type") || null,
      sort_by: formData.get("sort_by") || "relevance",
      page: page,
    };

    await this.performSearch(searchParams);

    // Scroll to top of results
    const resultsSection = document.getElementById("search-results");
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  async getAIJobMatches() {
    const skillsInput = document.getElementById("ai-skills-input");
    const locationInput = document.getElementById("ai-location-input");
    const salaryInput = document.getElementById("ai-salary-input");

    const skills = skillsInput
      ? skillsInput.value
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [];
    const location = locationInput ? locationInput.value.trim() : "";
    const minSalary = salaryInput ? salaryInput.value : null;

    if (skills.length === 0) {
      this.showWarningAlert("Please enter your skills to get AI job matches.");
      return;
    }

    this.showLoading("Getting AI-powered job recommendations...");

    try {
      const response = await fetch("/api/ai-job-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: skills,
          location: location,
          min_salary: minSalary,
          contract_type: "full_time",
          work_style: "remote",
        }),
      });

      const result = await response.json();

      if (result.success) {
        this.jobs = result.jobs;
        this.renderJobs();
        this.renderAIMatchHeader(result.user_profile, result.count);
        this.showSuccessAlert(
          `Found ${result.count} AI-matched jobs for your skills!`
        );
      } else {
        this.showErrorAlert("AI job matching failed: " + result.error);
      }
    } catch (error) {
      console.error("AI job matching error:", error);
      this.showErrorAlert("Network error. Please try again.");
    } finally {
      this.hideLoading();
    }
  }

  renderAIMatchHeader(userProfile, jobCount) {
    const container = document.getElementById("ai-match-header");
    if (!container) return;

    container.innerHTML = `
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
                <h3 class="text-xl font-bold mb-2">🤖 AI-Powered Job Matches</h3>
                <p class="mb-3">Based on your skills: ${userProfile.skills.join(
                  ", "
                )}</p>
                <div class="flex items-center justify-between">
                    <div class="text-sm opacity-90">
                        Location: ${
                          userProfile.preferences.location || "Any"
                        } • 
                        Found: ${jobCount} personalized matches
                    </div>
                    <button onclick="this.parentElement.parentElement.parentElement.style.display='none'" 
                            class="text-white/80 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
  }

  async getSalaryInsights() {
    const jobTitle = document.getElementById("what").value.trim();
    const location = document.getElementById("where").value.trim();

    if (!jobTitle) {
      this.showWarningAlert("Please enter a job title to get salary insights.");
      return;
    }

    this.showLoading("Getting salary insights...");

    try {
      const response = await fetch("/api/salary-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: jobTitle,
          location: location,
        }),
      });

      const result = await response.json();

      if (result.success) {
        this.displaySalaryInsights(result);
      } else {
        this.showErrorAlert("Failed to get salary insights: " + result.error);
      }
    } catch (error) {
      console.error("Salary insights error:", error);
      this.showErrorAlert("Network error. Please try again.");
    } finally {
      this.hideLoading();
    }
  }

  displaySalaryInsights(insights) {
    const modal = this.createModal(
      "Salary Insights",
      `
            <div class="space-y-4">
                <div class="text-center">
                    <h4 class="text-lg font-semibold mb-2">${
                      insights.job_title
                    }</h4>
                    <p class="text-gray-600">${
                      insights.location || "All locations"
                    }</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-blue-600">£${
                          insights.average_salary?.toLocaleString() || "N/A"
                        }</div>
                        <div class="text-sm text-blue-800">Average Salary</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-green-600">£${
                          insights.min_salary?.toLocaleString() || "N/A"
                        }</div>
                        <div class="text-sm text-green-800">Minimum</div>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-purple-600">£${
                          insights.max_salary?.toLocaleString() || "N/A"
                        }</div>
                        <div class="text-sm text-purple-800">Maximum</div>
                    </div>
                </div>

                ${
                  insights.trends
                    ? `
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <h5 class="font-semibold mb-2">Market Trends</h5>
                        <p class="text-sm text-gray-700">${insights.trends}</p>
                    </div>
                `
                    : ""
                }

                <div class="text-xs text-gray-500 text-center">
                    Data provided by Adzuna API • Updated regularly
                </div>
            </div>
        `
    );

    document.body.appendChild(modal);
  }

  toggleSaveJob(jobId) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return;

    const savedIndex = this.savedJobs.findIndex((saved) => saved.id === jobId);

    if (savedIndex >= 0) {
      // Remove from saved jobs
      this.savedJobs.splice(savedIndex, 1);
      this.showSuccessAlert("Job removed from saved jobs");
    } else {
      // Add to saved jobs
      this.savedJobs.push({
        id: job.id,
        title: job.title,
        company: job.company?.display_name || "Unknown Company",
        location: job.location?.display_name || "Unknown Location",
        url: job.redirect_url,
        saved_at: new Date().toISOString(),
      });
      this.showSuccessAlert("Job saved successfully!");
    }

    // Save to localStorage
    localStorage.setItem("saved_jobs", JSON.stringify(this.savedJobs));

    // Update UI
    this.updateSavedJobsCount();
    this.renderJobs(); // Re-render to update heart icons
  }

  updateSavedJobsCount() {
    const counter = document.getElementById("saved-jobs-count");
    if (counter) {
      counter.textContent = this.savedJobs.length;
      counter.style.display = this.savedJobs.length > 0 ? "block" : "none";
    }
  }

  applyToJob(jobUrl) {
    if (jobUrl) {
      // Track application
      this.trackJobApplication(jobUrl);

      // Open job URL in new tab
      window.open(jobUrl, "_blank", "noopener,noreferrer");

      this.showSuccessAlert("Opening job application page...");
    } else {
      this.showErrorAlert("Job application link not available.");
    }
  }

  trackJobApplication(jobUrl) {
    // Track job application for analytics
    const applications = JSON.parse(
      localStorage.getItem("job_applications") || "[]"
    );
    applications.push({
      url: jobUrl,
      applied_at: new Date().toISOString(),
    });
    localStorage.setItem("job_applications", JSON.stringify(applications));
  }

  saveSearchToHistory(searchParams, resultCount) {
    const search = {
      ...searchParams,
      result_count: resultCount,
      searched_at: new Date().toISOString(),
    };

    // Add to beginning of history
    this.searchHistory.unshift(search);

    // Keep only last 10 searches
    this.searchHistory = this.searchHistory.slice(0, 10);

    // Save to localStorage
    localStorage.setItem(
      "job_search_history",
      JSON.stringify(this.searchHistory)
    );

    this.renderSearchHistory();
  }

  renderSearchHistory() {
    const container = document.getElementById("search-history");
    if (!container || this.searchHistory.length === 0) return;

    container.innerHTML = `
            <div class="mb-4">
                <h4 class="font-semibold text-gray-800 mb-2">Recent Searches</h4>
                <div class="space-y-2">
                    ${this.searchHistory
                      .slice(0, 5)
                      .map(
                        (search) => `
                        <button class="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                onclick="this.dispatchEvent(new CustomEvent('repeat-search', {detail: ${JSON.stringify(
                                  search
                                ).replace(/"/g, "&quot;")}}))">
                            <div class="flex justify-between items-center">
                                <div class="text-sm">
                                    <span class="font-medium">${
                                      search.what || "Any job"
                                    }</span>
                                    ${
                                      search.where
                                        ? `<span class="text-gray-500"> in ${search.where}</span>`
                                        : ""
                                    }
                                </div>
                                <div class="text-xs text-gray-500">
                                    ${search.result_count} jobs
                                </div>
                            </div>
                        </button>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `;

    // Add repeat search functionality
    container.addEventListener("repeat-search", (e) => {
      const search = e.detail;

      // Update form fields
      const whatInput = document.getElementById("what");
      const whereInput = document.getElementById("where");

      if (whatInput) whatInput.value = search.what || "";
      if (whereInput) whereInput.value = search.where || "";

      // Perform search
      this.performSearch({
        what: search.what || "",
        where: search.where || "",
        page: 1,
        sort_by: "relevance",
      });
    });
  }

  toggleAdvancedSearch() {
    const advancedSection = document.getElementById("advanced-search");
    const toggleBtn = document.getElementById("advanced-search-toggle");

    if (advancedSection && toggleBtn) {
      advancedSection.classList.toggle("hidden");
      const isHidden = advancedSection.classList.contains("hidden");
      toggleBtn.innerHTML = isHidden
        ? '<i class="fas fa-chevron-down mr-2"></i>Advanced Search'
        : '<i class="fas fa-chevron-up mr-2"></i>Hide Advanced';
    }
  }

  handleLocationChange() {
    const locationSelect = document.getElementById("location-filter");
    const whereInput = document.getElementById("where");

    if (locationSelect && whereInput && locationSelect.value) {
      whereInput.value = locationSelect.value;
    }
  }

  handleSortChange() {
    // Re-search with new sort order
    const form = document.getElementById("job-search-form");
    if (form) {
      form.dispatchEvent(new Event("submit"));
    }
  }

  // Utility methods
  formatSalary(min, max) {
    if (!min && !max) return null;

    if (min && max) {
      return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
    } else if (min) {
      return `From £${min.toLocaleString()}`;
    } else {
      return `Up to £${max.toLocaleString()}`;
    }
  }

  formatDate(dateString) {
    if (!dateString) return "Recently posted";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  createModal(title, content) {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4";
    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">${title}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                ${content}
            </div>
        `;

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    return modal;
  }

  showLoading(message = "Loading...") {
    const loader =
      document.getElementById("loading-overlay") || this.createLoader();
    loader.querySelector(".loading-text").textContent = message;
    loader.classList.remove("hidden");
  }

  hideLoading() {
    const loader = document.getElementById("loading-overlay");
    if (loader) loader.classList.add("hidden");
  }

  createLoader() {
    const loader = document.createElement("div");
    loader.id = "loading-overlay";
    loader.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden";
    loader.innerHTML = `
            <div class="bg-white rounded-lg p-6 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="loading-text text-gray-700">Loading...</p>
            </div>
        `;
    document.body.appendChild(loader);
    return loader;
  }

  showSuccessAlert(message) {
    this.showAlert(message, "success");
  }
  showErrorAlert(message) {
    this.showAlert(message, "error");
  }
  showWarningAlert(message) {
    this.showAlert(message, "warning");
  }
  showInfoAlert(message) {
    this.showAlert(message, "info");
  }

  showAlert(message, type = "info") {
    const colors = {
      success: "bg-green-500",
      error: "bg-red-500",
      warning: "bg-yellow-500",
      info: "bg-blue-500",
    };

    const alert = document.createElement("div");
    alert.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white max-w-sm ${colors[type]} transform translate-x-full transition-transform duration-300`;
    alert.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white/80 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

    document.body.appendChild(alert);
    setTimeout(() => alert.classList.remove("translate-x-full"), 100);
    setTimeout(() => {
      if (alert.parentNode) {
        alert.classList.add("translate-x-full");
        setTimeout(() => alert.remove(), 300);
      }
    }, 5000);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.jobMatching = new JobMatchingApp();
});
