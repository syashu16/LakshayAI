class AnalyticsDashboard {
  constructor() {
    console.log("🚀 Initializing Analytics Dashboard");
    this.initializeEventListeners();
    this.currentView = null;
  }

  initializeEventListeners() {
    // Search form handling
    const searchForm = document.getElementById("analyticsSearchForm");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.performSearch();
      });
    }

    // Input field event listeners
    const jobTitleInput = document.getElementById("jobTitle");
    const locationInput = document.getElementById("location");

    if (jobTitleInput) {
      jobTitleInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.performSearch();
      });
    }

    if (locationInput) {
      locationInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.performSearch();
      });
    }
  }

  performSearch() {
    console.log("🔍 Performing analytics search");
    // Default to salary insights
    this.loadSalaryInsights();
  }

  // Loading and error handling
  showLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      overlay.classList.remove("hidden");
    }
  }

  hideLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      overlay.classList.add("hidden");
    }
  }

  showError(message) {
    const content = document.getElementById("resultsContent");
    content.innerHTML = `
            <div class="bg-red-900/20 border border-red-500/30 rounded-xl p-8">
                <div class="text-center py-16">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-6"></i>
                    <h3 class="text-2xl font-bold text-red-400 mb-4">Error Loading Data</h3>
                    <p class="text-slate-400 mb-6">${message}</p>
                    <button onclick="location.reload()" class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all">
                        <i class="fas fa-refresh mr-2"></i>Try Again
                    </button>
                </div>
            </div>
        `;
  }

  // Get search parameters
  getSearchParams() {
    const jobTitle =
      document.getElementById("jobTitle")?.value || "Software Developer";
    const location = document.getElementById("location")?.value || "London";
    return { jobTitle, location };
  }

  // Salary Insights
  async loadSalaryInsights() {
    try {
      this.currentView = "salaryInsights";
      this.showLoading();

      const { jobTitle, location } = this.getSearchParams();
      console.log(`💰 Loading salary insights for: ${jobTitle} in ${location}`);

      const response = await fetch("/api/salary-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: jobTitle,
          location: location,
        }),
      });

      const data = await response.json();
      this.hideLoading();

      if (data.success) {
        this.displaySalaryInsights(data, jobTitle, location);
      } else {
        this.showError(data.error || "Failed to load salary insights");
      }
    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
      console.error("Salary insights error:", error);
    }
  }

  displaySalaryInsights(data, jobTitle, location) {
    const content = document.getElementById("resultsContent");
    const salaryStats = data.salary_stats || {};
    const insights = data.market_insights || [];

    // Format salary information
    const salaryInfo = salaryStats.median
      ? `£${salaryStats.median.toLocaleString()}`
      : salaryStats.average
      ? `£${salaryStats.average.toLocaleString()}`
      : "N/A";

    const minSalary = salaryStats.min
      ? `£${salaryStats.min.toLocaleString()}`
      : "N/A";
    const maxSalary = salaryStats.max
      ? `£${salaryStats.max.toLocaleString()}`
      : "N/A";
    const totalJobs = salaryStats.total_jobs || 0;

    content.innerHTML = `
            <div class="space-y-8">
                <!-- Header -->
                <div class="text-center">
                    <h3 class="text-3xl font-bold mb-2">
                        <i class="fas fa-dollar-sign text-green-400 mr-3"></i>Salary Insights
                    </h3>
                    <p class="text-slate-400">For <span class="text-blue-400 font-semibold">${jobTitle}</span> in <span class="text-purple-400 font-semibold">${location}</span></p>
                </div>

                <!-- Salary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="bg-slate-800/30 rounded-xl p-6 text-center">
                        <div class="text-3xl font-bold text-green-400 mb-2">${salaryInfo}</div>
                        <div class="text-slate-400">Median Salary</div>
                    </div>
                    <div class="bg-slate-800/30 rounded-xl p-6 text-center">
                        <div class="text-2xl font-bold text-blue-400 mb-2">${minSalary}</div>
                        <div class="text-slate-400">Minimum</div>
                    </div>
                    <div class="bg-slate-800/30 rounded-xl p-6 text-center">
                        <div class="text-2xl font-bold text-purple-400 mb-2">${maxSalary}</div>
                        <div class="text-slate-400">Maximum</div>
                    </div>
                    <div class="bg-slate-800/30 rounded-xl p-6 text-center">
                        <div class="text-2xl font-bold text-orange-400 mb-2">${totalJobs.toLocaleString()}</div>
                        <div class="text-slate-400">Available Jobs</div>
                    </div>
                </div>

                <!-- Market Insights -->
                ${
                  insights.length > 0
                    ? `
                    <div class="bg-slate-800/30 rounded-xl p-6">
                        <h4 class="text-xl font-bold mb-4 flex items-center">
                            <i class="fas fa-lightbulb text-yellow-400 mr-2"></i>Market Insights
                        </h4>
                        <div class="space-y-3">
                            ${insights
                              .map(
                                (insight) => `
                                <div class="flex items-start space-x-3">
                                    <i class="fas fa-arrow-right text-blue-400 mt-1"></i>
                                    <p class="text-slate-300">${insight}</p>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }
            </div>
        `;
  }

  // Trending Skills
  async loadTrendingSkills() {
    try {
      this.currentView = "trendingSkills";
      this.showLoading();

      const { jobTitle } = this.getSearchParams();
      console.log(`📈 Loading trending skills for: ${jobTitle}`);

      const response = await fetch("/api/trending-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_title: jobTitle }),
      });

      const data = await response.json();
      this.hideLoading();

      if (data.success) {
        this.displayTrendingSkills(data, jobTitle);
      } else {
        this.showError(data.error || "Failed to load trending skills");
      }
    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
      console.error("Trending skills error:", error);
    }
  }

  displayTrendingSkills(data, jobTitle) {
    const content = document.getElementById("resultsContent");
    const skills = data.trending_skills || [];
    const categories = data.skill_categories || [];

    content.innerHTML = `
            <div class="space-y-8">
                <!-- Header -->
                <div class="text-center">
                    <h3 class="text-3xl font-bold mb-2">
                        <i class="fas fa-chart-line text-blue-400 mr-3"></i>Trending Skills
                    </h3>
                    <p class="text-slate-400">Most in-demand skills for <span class="text-blue-400 font-semibold">${jobTitle}</span></p>
                </div>

                <!-- Skills Grid -->
                ${
                  skills.length > 0
                    ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${skills
                          .map(
                            (skill, index) => `
                            <div class="bg-slate-800/30 rounded-xl p-6 hover:bg-slate-700/50 transition-all">
                                <div class="flex items-center justify-between mb-4">
                                    <h4 class="text-lg font-bold text-white">${
                                      skill.name
                                    }</h4>
                                    <span class="text-2xl font-bold text-blue-400">#${
                                      index + 1
                                    }</span>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-slate-400">Demand:</span>
                                        <span class="text-green-400 font-semibold">${
                                          skill.demand
                                        }%</span>
                                    </div>
                                    ${
                                      skill.growth
                                        ? `
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Growth:</span>
                                            <span class="text-purple-400 font-semibold">+${skill.growth}%</span>
                                        </div>
                                    `
                                        : ""
                                    }
                                    ${
                                      skill.jobs_requiring
                                        ? `
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Jobs:</span>
                                            <span class="text-orange-400 font-semibold">${skill.jobs_requiring.toLocaleString()}</span>
                                        </div>
                                    `
                                        : ""
                                    }
                                </div>
                                <div class="w-full bg-slate-700 rounded-full h-2 mt-4">
                                    <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style="width: ${
                                      skill.demand
                                    }%"></div>
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : `
                    <div class="text-center py-16">
                        <i class="fas fa-search text-6xl text-slate-600 mb-6"></i>
                        <h3 class="text-2xl font-bold text-slate-400 mb-4">No Skills Data Available</h3>
                        <p class="text-slate-500">Try searching for a different job title</p>
                    </div>
                `
                }

                <!-- Skill Categories -->
                ${
                  categories.length > 0
                    ? `
                    <div class="bg-slate-800/30 rounded-xl p-6">
                        <h4 class="text-xl font-bold mb-4 flex items-center">
                            <i class="fas fa-tags text-yellow-400 mr-2"></i>Skill Categories
                        </h4>
                        <div class="flex flex-wrap gap-3">
                            ${categories
                              .map(
                                (category) => `
                                <span class="px-4 py-2 bg-slate-700/50 rounded-full text-sm font-medium hover:bg-slate-600/50 transition-all cursor-pointer">
                                    ${category.name} (${category.count})
                                </span>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }
            </div>
        `;
  }

  // Location Insights
  async loadLocationInsights() {
    try {
      this.currentView = "loadLocationInsights";
      this.showLoading();

      const { jobTitle } = this.getSearchParams();
      console.log(`🌍 Loading location insights for: ${jobTitle}`);

      const response = await fetch("/api/location-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_title: jobTitle }),
      });

      const data = await response.json();
      this.hideLoading();

      if (data.success) {
        this.displayLocationInsights(data, jobTitle);
      } else {
        this.showError(data.error || "Failed to load location insights");
      }
    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
      console.error("Location insights error:", error);
    }
  }

  displayLocationInsights(data, jobTitle) {
    const content = document.getElementById("resultsContent");
    const locations = data.top_locations || [];
    const insights = data.insights || [];

    content.innerHTML = `
            <div class="space-y-8">
                <!-- Header -->
                <div class="text-center">
                    <h3 class="text-3xl font-bold mb-2">
                        <i class="fas fa-map-marker-alt text-blue-400 mr-3"></i>Location Insights
                    </h3>
                    <p class="text-slate-400">Top job markets for <span class="text-blue-400 font-semibold">${jobTitle}</span></p>
                </div>

                <!-- Top Locations -->
                ${
                  locations.length > 0
                    ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${locations
                          .map(
                            (location, index) => `
                            <div class="bg-slate-800/30 rounded-xl p-6 hover:bg-slate-700/50 transition-all">
                                <div class="flex items-center justify-between mb-4">
                                    <h4 class="text-xl font-bold text-white">${
                                      location.name || location
                                    }</h4>
                                    <div class="text-2xl font-bold text-blue-400">#${
                                      index + 1
                                    }</div>
                                </div>
                                <div class="space-y-2">
                                    ${
                                      location.job_count
                                        ? `
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Jobs:</span>
                                            <span class="text-green-400 font-semibold">${location.job_count.toLocaleString()}</span>
                                        </div>
                                    `
                                        : ""
                                    }
                                    ${
                                      location.avg_salary
                                        ? `
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Avg Salary:</span>
                                            <span class="text-purple-400 font-semibold">£${location.avg_salary.toLocaleString()}</span>
                                        </div>
                                    `
                                        : ""
                                    }
                                    ${
                                      location.growth_rate
                                        ? `
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Growth:</span>
                                            <span class="text-orange-400 font-semibold">+${location.growth_rate}%</span>
                                        </div>
                                    `
                                        : ""
                                    }
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : `
                    <div class="text-center py-16">
                        <i class="fas fa-map text-6xl text-slate-600 mb-6"></i>
                        <h3 class="text-2xl font-bold text-slate-400 mb-4">No Location Data Available</h3>
                        <p class="text-slate-500">Try searching for a different job title</p>
                    </div>
                `
                }

                <!-- Location Insights -->
                ${
                  insights.length > 0
                    ? `
                    <div class="bg-slate-800/30 rounded-xl p-6">
                        <h4 class="text-xl font-bold mb-4 flex items-center">
                            <i class="fas fa-lightbulb text-yellow-400 mr-2"></i>Market Insights
                        </h4>
                        <div class="space-y-3">
                            ${insights
                              .map(
                                (insight) => `
                                <div class="flex items-start space-x-3">
                                    <i class="fas fa-arrow-right text-blue-400 mt-1"></i>
                                    <p class="text-slate-300">${insight}</p>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }
            </div>
        `;
  }

  // Career Progression
  async loadCareerProgression() {
    try {
      this.currentView = "careerProgression";
      this.showLoading();

      const { jobTitle } = this.getSearchParams();
      console.log(`🚀 Loading career progression for: ${jobTitle}`);

      const response = await fetch("/api/career-progression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_title: jobTitle }),
      });

      const data = await response.json();
      this.hideLoading();

      if (data.success) {
        this.displayCareerProgression(data, jobTitle);
      } else {
        this.showError(data.error || "Failed to load career progression");
      }
    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
      console.error("Career progression error:", error);
    }
  }

  displayCareerProgression(data, jobTitle) {
    const content = document.getElementById("resultsContent");
    const pathways = data.career_pathways || [];
    const levels = data.experience_levels || [];

    content.innerHTML = `
            <div class="space-y-8">
                <!-- Header -->
                <div class="text-center">
                    <h3 class="text-3xl font-bold mb-2">
                        <i class="fas fa-rocket text-purple-400 mr-3"></i>Career Progression
                    </h3>
                    <p class="text-slate-400">Growth opportunities for <span class="text-blue-400 font-semibold">${jobTitle}</span></p>
                </div>

                <!-- Experience Levels -->
                ${
                  levels.length > 0
                    ? `
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${levels
                          .map(
                            (level, index) => `
                            <div class="bg-slate-800/30 rounded-xl p-6 text-center">
                                <div class="text-2xl font-bold text-purple-400 mb-2">${
                                  level.level
                                }</div>
                                <div class="text-slate-400 mb-4">${
                                  level.years
                                } years</div>
                                <div class="text-lg font-semibold text-green-400">£${level.avg_salary.toLocaleString()}</div>
                                <div class="text-sm text-slate-500">Average Salary</div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }

                <!-- Career Pathways -->
                ${
                  pathways.length > 0
                    ? `
                    <div class="space-y-6">
                        <h4 class="text-2xl font-bold text-center">
                            <i class="fas fa-route text-blue-400 mr-2"></i>Career Pathways
                        </h4>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            ${pathways
                              .map(
                                (pathway) => `
                                <div class="bg-slate-800/30 rounded-xl p-6">
                                    <h5 class="text-lg font-bold text-blue-400 mb-4">${
                                      pathway.title
                                    }</h5>
                                    <div class="space-y-3">
                                        ${pathway.steps
                                          .map(
                                            (step, index) => `
                                            <div class="flex items-center space-x-3">
                                                <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">${
                                                  index + 1
                                                }</div>
                                                <div>
                                                    <div class="font-semibold text-white">${
                                                      step.position
                                                    }</div>
                                                    <div class="text-sm text-slate-400">${
                                                      step.description ||
                                                      step.years +
                                                        " years experience"
                                                    }</div>
                                                </div>
                                            </div>
                                        `
                                          )
                                          .join("")}
                                    </div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }
            </div>
        `;
  }
}

// Global functions for onclick handlers
function loadSalaryInsights() {
  window.analyticsApp.loadSalaryInsights();
}

function loadTrendingSkills() {
  window.analyticsApp.loadTrendingSkills();
}

function loadLocationInsights() {
  window.analyticsApp.loadLocationInsights();
}

function loadCareerProgression() {
  window.analyticsApp.loadCareerProgression();
}

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", function () {
  window.analyticsApp = new AnalyticsDashboard();
  console.log("✅ Analytics Dashboard ready");
});
