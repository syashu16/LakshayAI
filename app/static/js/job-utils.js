// Common Job Utilities - Shared across all job pages
window.JobUtils = {
  // Format salary display
  formatSalary: function (job) {
    if (job.salary) {
      return job.salary;
    }
    if (job.salary_min && job.salary_max) {
      return `$${this.formatNumber(job.salary_min)} - $${this.formatNumber(
        job.salary_max
      )}`;
    }
    if (job.salary_min) {
      return `$${this.formatNumber(job.salary_min)}+`;
    }
    return "Salary not specified";
  },

  // Format numbers with commas
  formatNumber: function (num) {
    return new Intl.NumberFormat().format(num);
  },

  // Format date display
  formatDate: function (dateString) {
    if (!dateString) return "Recently posted";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  },

  // Get company name (handles different API structures)
  getCompany: function (job) {
    return job.company?.display_name || job.company || "Company not specified";
  },

  // Get location (handles different API structures)
  getLocation: function (job) {
    return (
      job.location?.display_name || job.location || "Location not specified"
    );
  },

  // Get job category
  getCategory: function (job) {
    if (job.category) {
      return job.category.label || job.category;
    }
    return null;
  },

  // Common job search API call
  searchJobs: async function (params) {
    try {
      const response = await fetch("/api/job-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Job search error:", error);
      throw error;
    }
  },

  // Show loading state
  showLoading: function (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
                <div class="loading-state text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p class="text-gray-600">Searching for jobs...</p>
                </div>
            `;
    }
  },

  // Show error state
  showError: function (containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
                <div class="error-state text-center py-12">
                    <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
                    <p class="text-gray-600 mb-4">${message}</p>
                    <button onclick="window.location.reload()" class="btn-primary">
                        Try Again
                    </button>
                </div>
            `;
    }
  },

  // Show no results state
  showNoResults: function (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
                <div class="no-results text-center py-12">
                    <i class="fas fa-search text-gray-300 text-4xl mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
                    <p class="text-gray-600 mb-4">Try adjusting your search criteria or keywords</p>
                    <div class="space-x-3">
                        <button onclick="document.getElementById('what').value = 'software engineer'; document.getElementById('job-search-form').dispatchEvent(new Event('submit'))" 
                                class="btn-primary">
                            Search Software Engineer
                        </button>
                        <button onclick="document.getElementById('what').value = 'marketing'; document.getElementById('job-search-form').dispatchEvent(new Event('submit'))" 
                                class="btn-secondary">
                            Search Marketing
                        </button>
                    </div>
                </div>
            `;
    }
  },

  // Open job application
  applyToJob: function (jobUrl) {
    if (jobUrl) {
      window.open(jobUrl, "_blank");
    } else {
      alert("Job application link not available");
    }
  },

  // Save/unsave job functionality
  toggleSaveJob: function (jobId) {
    let savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    const index = savedJobs.findIndex((job) => job.id === jobId);

    if (index > -1) {
      savedJobs.splice(index, 1);
      console.log("Job removed from saved jobs");
    } else {
      // In a real app, you'd store more job details
      savedJobs.push({ id: jobId, savedAt: new Date().toISOString() });
      console.log("Job saved");
    }

    localStorage.setItem("savedJobs", JSON.stringify(savedJobs));

    // Update UI indicators
    this.updateSavedJobsUI();

    return index === -1; // Return true if job was saved, false if unsaved
  },

  // Update saved jobs UI indicators
  updateSavedJobsUI: function () {
    const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");

    // Update save buttons
    document.querySelectorAll("[data-job-id]").forEach((button) => {
      const jobId = button.dataset.jobId;
      const isSaved = savedJobs.some((job) => job.id === jobId);

      if (
        button.classList.contains("save-job-btn") ||
        button.classList.contains("btn-save")
      ) {
        if (isSaved) {
          button.classList.add("saved");
          button.innerHTML = '<i class="fas fa-heart mr-1"></i>Saved';
        } else {
          button.classList.remove("saved");
          button.innerHTML = '<i class="far fa-heart mr-1"></i>Save';
        }
      }
    });

    // Update saved count if element exists
    const savedCountElement = document.getElementById("saved-count");
    if (savedCountElement) {
      savedCountElement.textContent = `${savedJobs.length} Saved`;
    }
  },

  // Initialize common job page functionality
  init: function () {
    console.log("JobUtils initialized");

    // Set up event delegation for job actions
    document.addEventListener("click", (e) => {
      // Handle apply buttons
      if (
        e.target.closest(".apply-job-btn") ||
        e.target.closest(".btn-apply")
      ) {
        e.preventDefault();
        const jobUrl = e.target.closest("[data-job-url]")?.dataset.jobUrl;
        this.applyToJob(jobUrl);
      }

      // Handle save buttons
      if (e.target.closest(".save-job-btn") || e.target.closest(".btn-save")) {
        e.preventDefault();
        const jobId = e.target.closest("[data-job-id]")?.dataset.jobId;
        if (jobId) {
          this.toggleSaveJob(jobId);
        }
      }
    });

    // Initialize saved jobs UI
    this.updateSavedJobsUI();
  },
};

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.JobUtils.init();
});
