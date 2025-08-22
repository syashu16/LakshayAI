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
    const totalJobs = salaryStats.total_jobs || 0;

    // Check if we have meaningful salary data
    const hasRealData =
      salaryStats.median ||
      salaryStats.average ||
      salaryStats.min ||
      salaryStats.max ||
      totalJobs > 0;

    if (!hasRealData) {
      // Show helpful suggestions when no data is available
      content.innerHTML = `
                <div class="space-y-8">
                    <div class="text-center">
                        <h3 class="text-3xl font-bold mb-2">
                            <i class="fas fa-dollar-sign text-green-400 mr-3"></i>Salary Insights
                        </h3>
                        <p class="text-slate-400">For <span class="text-blue-400 font-semibold">${jobTitle}</span> in <span class="text-purple-400 font-semibold">${location}</span></p>
                    </div>

                    <div class="bg-amber-900/20 border border-amber-500/30 rounded-xl p-8">
                        <div class="text-center py-8">
                            <i class="fas fa-exclamation-circle text-6xl text-amber-500 mb-6"></i>
                            <h3 class="text-2xl font-bold text-amber-400 mb-4">Limited Salary Data Available</h3>
                            <p class="text-slate-400 mb-6">Salary information for "${jobTitle}" in "${location}" is not available in our current dataset.</p>
                            
                            <div class="bg-slate-800/50 rounded-xl p-6 text-left mb-6">
                                <h4 class="text-lg font-bold text-white mb-4">💡 Try these alternatives:</h4>
                                <div class="space-y-3">
                                    <div class="flex items-center space-x-3">
                                        <i class="fas fa-arrow-right text-blue-400"></i>
                                        <span class="text-slate-300">Use more specific job titles like "Frontend Developer", "Backend Developer"</span>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <i class="fas fa-arrow-right text-blue-400"></i>
                                        <span class="text-slate-300">Try major tech cities like "San Francisco", "New York", "Seattle"</span>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <i class="fas fa-arrow-right text-blue-400"></i>
                                        <span class="text-slate-300">Check other analytics like Trending Skills and Location Insights</span>
                                    </div>
                                </div>
                            </div>

                            <div class="space-x-4">
                                <button onclick="document.getElementById('jobTitle').value='Frontend Developer'; document.getElementById('location').value='San Francisco'; window.analyticsApp.loadSalaryInsights();" 
                                        class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all">
                                    <i class="fas fa-search mr-2"></i>Try Frontend Developer
                                </button>
                                <button onclick="window.analyticsApp.loadTrendingSkills();" 
                                        class="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all">
                                    <i class="fas fa-chart-line mr-2"></i>View Trending Skills
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
      return;
    }

    // Format salary information for available data
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

    content.innerHTML = `
            <div class="space-y-8">
                <div class="text-center">
                    <h3 class="text-3xl font-bold mb-2">
                        <i class="fas fa-dollar-sign text-green-400 mr-3"></i>Salary Insights
                    </h3>
                    <p class="text-slate-400">For <span class="text-blue-400 font-semibold">${jobTitle}</span> in <span class="text-purple-400 font-semibold">${location}</span></p>
                </div>

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
    const jobsAnalyzed = data.jobs_analyzed || 0;

    content.innerHTML = `
            <div class="space-y-8">
                <div class="text-center">
                    <h3 class="text-3xl font-bold mb-2">
                        <i class="fas fa-chart-line text-blue-400 mr-3"></i>Trending Skills
                    </h3>
                    <p class="text-slate-400">Most in-demand skills for <span class="text-blue-400 font-semibold">${jobTitle}</span></p>
                    ${
                      jobsAnalyzed > 0
                        ? `<p class="text-slate-500 text-sm">Based on ${jobsAnalyzed} job listings</p>`
                        : ""
                    }
                </div>

                ${
                  skills.length > 0
                    ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${skills
                          .map((skill, index) => {
                            const demandPercentage =
                              jobsAnalyzed > 0
                                ? Math.round(
                                    (skill.mentions / jobsAnalyzed) * 100
                                  )
                                : 0;
                            return `
                                <div class="bg-slate-800/30 rounded-xl p-6 hover:bg-slate-700/50 transition-all">
                                    <div class="flex items-center justify-between mb-4">
                                        <h4 class="text-lg font-bold text-white">${
                                          skill.skill
                                        }</h4>
                                        <span class="text-2xl font-bold text-blue-400">#${
                                          index + 1
                                        }</span>
                                    </div>
                                    <div class="space-y-2">
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Mentions:</span>
                                            <span class="text-green-400 font-semibold">${
                                              skill.mentions
                                            }</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Frequency:</span>
                                            <span class="text-purple-400 font-semibold">${demandPercentage}%</span>
                                        </div>
                                    </div>
                                    <div class="w-full bg-slate-700 rounded-full h-2 mt-4">
                                        <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style="width: ${Math.max(
                                          demandPercentage,
                                          5
                                        )}%"></div>
                                    </div>
                                </div>
                            `;
                          })
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
            </div>
        `;
  }

  // Location Insights
  async loadLocationInsights() {
    try {
      this.currentView = "locationInsights";
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
    const locations = data.top_markets || data.location_insights || [];

    content.innerHTML = `
            <div class="space-y-8">
                <div class="text-center">
                    <h3 class="text-3xl font-bold mb-2">
                        <i class="fas fa-map-marker-alt text-blue-400 mr-3"></i>Location Insights
                    </h3>
                    <p class="text-slate-400">Top job markets for <span class="text-blue-400 font-semibold">${jobTitle}</span></p>
                </div>

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
                                      location.location ||
                                      location.name ||
                                      location
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
                                      location.average_salary ||
                                      location.avg_salary
                                        ? `
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Avg Salary:</span>
                                            <span class="text-purple-400 font-semibold">$${Math.round(
                                              location.average_salary ||
                                                location.avg_salary
                                            ).toLocaleString()}</span>
                                        </div>
                                    `
                                        : ""
                                    }
                                    ${
                                      location.sample_jobs
                                        ? `
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Sample Jobs:</span>
                                            <span class="text-orange-400 font-semibold">${location.sample_jobs}</span>
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
        body: JSON.stringify({ current_role: jobTitle }),
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
    const pathways = data.career_path || [];
    const recommendations = data.recommendations || [];

    content.innerHTML = `
            <div class="space-y-8">
                <div class="text-center">
                    <h3 class="text-3xl font-bold mb-2">
                        <i class="fas fa-rocket text-purple-400 mr-3"></i>Career Progression
                    </h3>
                    <p class="text-slate-400">Growth opportunities for <span class="text-blue-400 font-semibold">${jobTitle}</span></p>
                </div>

                ${
                  pathways.length > 0
                    ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        ${pathways
                          .map(
                            (step, index) => `
                            <div class="bg-slate-800/30 rounded-xl p-6 text-center hover:bg-slate-700/50 transition-all">
                                <div class="text-2xl font-bold text-purple-400 mb-2">${
                                  step.role
                                }</div>
                                <div class="text-lg font-semibold text-green-400 mb-2">$${Math.round(
                                  step.average_salary
                                ).toLocaleString()}</div>
                                <div class="text-sm text-slate-400 mb-3">${step.job_count.toLocaleString()} jobs</div>
                                <div class="text-xs text-slate-500">${
                                  step.difficulty
                                }</div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }

                ${
                  recommendations.length > 0
                    ? `
                    <div class="bg-slate-800/30 rounded-xl p-6">
                        <h4 class="text-xl font-bold mb-4 flex items-center">
                            <i class="fas fa-lightbulb text-yellow-400 mr-2"></i>Career Recommendations
                        </h4>
                        <div class="space-y-3">
                            ${recommendations
                              .map(
                                (recommendation) => `
                                <div class="flex items-start space-x-3">
                                    <i class="fas fa-arrow-right text-blue-400 mt-1"></i>
                                    <p class="text-slate-300">${recommendation}</p>
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
  console.log("🔥 loadSalaryInsights called");
  if (window.analyticsApp) {
    window.analyticsApp.loadSalaryInsights();
  } else {
    console.error("Analytics app not initialized");
  }
}

function loadTrendingSkills() {
  console.log("🔥 loadTrendingSkills called");
  if (window.analyticsApp) {
    window.analyticsApp.loadTrendingSkills();
  } else {
    console.error("Analytics app not initialized");
  }
}

function loadLocationInsights() {
  console.log("🔥 loadLocationInsights called");
  if (window.analyticsApp) {
    window.analyticsApp.loadLocationInsights();
  } else {
    console.error("Analytics app not initialized");
  }
}

function loadCareerProgression() {
  console.log("🔥 loadCareerProgression called");
  if (window.analyticsApp) {
    window.analyticsApp.loadCareerProgression();
  } else {
    console.error("Analytics app not initialized");
  }
}

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 DOM Content Loaded");
  window.analyticsApp = new AnalyticsDashboard();
  console.log("✅ Analytics Dashboard ready");

  // Load trending skills by default since they have good data
  setTimeout(() => {
    console.log("🎯 Auto-loading trending skills");
    window.analyticsApp.loadTrendingSkills();
  }, 1000);
});
