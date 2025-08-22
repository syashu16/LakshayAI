// Resume Analysis Page JavaScript with ML Integration
// LakshyaAI - User: syashu16 - Updated with ML Backend Integration

class ResumeAnalyzer {
  constructor() {
    this.currentFile = null;
    this.analysisResults = null;
    this.mlService = new MLResumeService();
    this.init();
  }

  init() {
    console.log("🚀 Resume Analyzer initialized for user: syashu16");
    this.setupEventListeners();
    this.checkAIStatus();
    this.checkMLServiceStatus();
  }

  setupEventListeners() {
    // File input change
    const fileInput = document.getElementById("resume-file");
    const uploadForm = document.getElementById("resume-upload-form");

    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
    }

    if (uploadForm) {
      uploadForm.addEventListener("submit", (e) => this.handleFormSubmit(e));
    }

    // Export buttons
    const exportPdfBtn = document.getElementById("export-pdf");
    const exportJsonBtn = document.getElementById("export-json");

    if (exportPdfBtn) {
      exportPdfBtn.addEventListener("click", () => this.exportResults("pdf"));
    }

    if (exportJsonBtn) {
      exportJsonBtn.addEventListener("click", () => this.exportResults("json"));
    }

    // Text analysis button for direct text input
    const textAnalysisBtn = document.getElementById("analyze-text-btn");
    if (textAnalysisBtn) {
      textAnalysisBtn.addEventListener("click", () =>
        this.handleTextAnalysis()
      );
    }
  }

  async checkMLServiceStatus() {
    try {
      const response = await fetch("/api/resume/ml-status");
      const data = await response.json();

      if (data.success) {
        const status = data.status;
        const aiStatusElement = document.getElementById("ai-status");
        const statusContainer = aiStatusElement?.parentElement;

        if (status.is_loaded && status.models_available.length > 0) {
          if (aiStatusElement) {
            aiStatusElement.textContent = `ML Models Online (${status.models_available.length})`;
            aiStatusElement.className = "text-green-400 text-sm font-semibold";
          }
          if (statusContainer) {
            statusContainer.className =
              "flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30";
            const dot = statusContainer.querySelector(".w-2");
            if (dot)
              dot.className = "w-2 h-2 bg-green-400 rounded-full animate-pulse";
          }
          console.log("✅ ML Service Status:", status);
        } else {
          if (aiStatusElement) {
            aiStatusElement.textContent = "ML Models Loading...";
            aiStatusElement.className = "text-yellow-400 text-sm font-semibold";
          }
          if (statusContainer) {
            statusContainer.className =
              "flex items-center space-x-2 px-3 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/30";
            const dot = statusContainer.querySelector(".w-2");
            if (dot)
              dot.className =
                "w-2 h-2 bg-yellow-400 rounded-full animate-pulse";
          }
          console.warn("⚠️ ML Models not loaded");
        }
      }
    } catch (error) {
      console.error("❌ Error checking ML status:", error);
      const aiStatusElement = document.getElementById("ai-status");
      const statusContainer = aiStatusElement?.parentElement;
      if (aiStatusElement) {
        aiStatusElement.textContent = "ML Service Offline";
        aiStatusElement.className = "text-red-400 text-sm font-semibold";
      }
      if (statusContainer) {
        statusContainer.className =
          "flex items-center space-x-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30";
        const dot = statusContainer.querySelector(".w-2");
        if (dot)
          dot.className = "w-2 h-2 bg-red-400 rounded-full animate-pulse";
      }
    }
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!this.validateFile(file)) {
      return;
    }

    this.currentFile = file;
    this.displayFileInfo(file);

    console.log(
      `📄 File selected: ${file.name} (${this.formatFileSize(file.size)})`
    );
  }

  validateFile(file) {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB (increased for better support)

    if (!allowedTypes.includes(file.type)) {
      this.showStatus("Please upload a PDF, DOC, DOCX, or TXT file.", "error");
      return false;
    }

    if (file.size > maxSize) {
      this.showStatus("File size must be less than 10MB.", "error");
      return false;
    }

    return true;
  }

  displayFileInfo(file) {
    const fileInfo = document.getElementById("file-info");
    const fileName = document.getElementById("file-name");
    const fileSize = document.getElementById("file-size");

    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = `(${this.formatFileSize(file.size)})`;
    if (fileInfo) fileInfo.classList.remove("hidden");
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    if (!this.currentFile) {
      this.showStatus("Please select a resume file first.", "error");
      return;
    }

    await this.analyzeResume();
  }

  async handleTextAnalysis() {
    const textContent = document.getElementById("resume-text-input");
    if (!textContent || !textContent.value.trim()) {
      this.showStatus("Please enter resume text to analyze.", "error");
      return;
    }

    await this.analyzeResumeText(textContent.value.trim());
  }

  async analyzeResume() {
    const analyzeBtn = document.getElementById("analyze-btn");
    const analyzeText = document.getElementById("analyze-text");
    const originalText = analyzeText.textContent;

    try {
      // Update UI to show loading
      this.showStatus(
        "Uploading and analyzing your resume with ML models...",
        "info"
      );
      analyzeText.innerHTML =
        '<i class="fas fa-brain animate-spin mr-2"></i> Analyzing with AI...';
      analyzeBtn.disabled = true;

      // Get additional inputs
      const skills = document.getElementById("skills-input")?.value || "";
      const keywords = document.getElementById("keywords-input")?.value || "";
      const targetRole = document.getElementById("target-role")?.value || "";

      // Create form data
      const formData = new FormData();
      formData.append("file", this.currentFile);
      formData.append("skills", skills);
      formData.append("keywords", keywords);
      formData.append("target_role", targetRole);

      // Make API call to Flask backend
      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        this.analysisResults = data.analysis;
        this.displayMLResults(data.analysis);
        this.showStatus("🎉 Analysis completed successfully!", "success");
        console.log("📊 Analysis Results:", data.analysis);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (error) {
      console.error("❌ Analysis error:", error);
      this.showStatus(`Analysis failed: ${error.message}`, "error");

      // Show demo results as fallback
      this.showDemoResults();
    } finally {
      // Reset button
      analyzeText.textContent = originalText;
      analyzeBtn.disabled = false;
    }
  }

  async analyzeResumeText(resumeText) {
    const analyzeBtn = document.getElementById("analyze-text-btn");
    const originalText = analyzeBtn?.textContent || "Analyze Text";

    try {
      // Update UI to show loading
      this.showStatus("Analyzing resume text with ML models...", "info");
      if (analyzeBtn) {
        analyzeBtn.innerHTML =
          '<i class="fas fa-brain animate-spin mr-2"></i> Analyzing...';
        analyzeBtn.disabled = true;
      }

      // Get additional inputs
      const skills = document.getElementById("skills-input")?.value || "";
      const keywords = document.getElementById("keywords-input")?.value || "";

      // Make API call to Flask backend
      const response = await fetch("/api/resume/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: resumeText,
          skills: skills,
          keywords: keywords,
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.analysisResults = {
          ml_analysis: data,
          basic_analysis: this.generateBasicAnalysis(resumeText),
          file_info: { filename: "Text Input", file_size: resumeText.length },
        };
        this.displayMLResults(this.analysisResults);
        this.showStatus("🎉 Text analysis completed successfully!", "success");
        console.log("📊 Text Analysis Results:", data);
      } else {
        throw new Error(data.error || "Text analysis failed");
      }
    } catch (error) {
      console.error("❌ Text analysis error:", error);
      this.showStatus(`Text analysis failed: ${error.message}`, "error");
    } finally {
      // Reset button
      if (analyzeBtn) {
        analyzeBtn.textContent = originalText;
        analyzeBtn.disabled = false;
      }
    }
  }

  generateBasicAnalysis(text) {
    const words = text.split(/\s+/).length;
    const chars = text.length;
    const lines = text.split("\n").length;

    // Extract emails and phones with regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex =
      /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];

    // Enhanced keyword detection with comprehensive tech stack
    const techKeywords = [
      // Programming Languages
      "python",
      "javascript",
      "java",
      "c++",
      "c#",
      "php",
      "ruby",
      "swift",
      "kotlin",
      "go",
      "rust",
      "typescript",
      // Web Technologies
      "react",
      "angular",
      "vue",
      "next.js",
      "node.js",
      "express",
      "django",
      "flask",
      "spring",
      "laravel",
      "bootstrap",
      // Databases
      "sql",
      "mysql",
      "postgresql",
      "mongodb",
      "redis",
      "sqlite",
      "oracle",
      "cassandra",
      "nosql",
      // Cloud & DevOps
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "jenkins",
      "git",
      "github",
      "gitlab",
      "ci/cd",
      "terraform",
      // Data Science & AI
      "machine learning",
      "ai",
      "data science",
      "tensorflow",
      "pytorch",
      "pandas",
      "numpy",
      "scikit-learn",
      // Other Technologies
      "linux",
      "windows",
      "agile",
      "scrum",
      "api",
      "rest",
      "graphql",
      "microservices",
      "html",
      "css",
    ];

    const foundKeywords = [];
    const textLower = text.toLowerCase();

    for (const keyword of techKeywords) {
      if (textLower.includes(keyword)) {
        // Capitalize first letter for display
        foundKeywords.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }

    // Calculate missing keywords for suggestions
    const missingKeywords = techKeywords
      .filter((keyword) => !textLower.includes(keyword))
      .map((keyword) => keyword.charAt(0).toUpperCase() + keyword.slice(1));

    // Display missing keywords in the keywords container
    const keywordsContainer = document.getElementById("keywords-container");
    if (keywordsContainer && missingKeywords.length > 0) {
      const topMissingKeywords = missingKeywords.slice(0, 12); // Show top 12
      keywordsContainer.innerHTML = `
                <div class="keywords-grid">
                    ${topMissingKeywords
                      .map(
                        (keyword) => `
                        <span class="keyword-tag missing" title="Consider adding this keyword">
                            ${keyword}
                        </span>
                    `
                      )
                      .join("")}
                </div>
                <p class="keywords-note">
                    <i class="fas fa-info-circle"></i>
                    These are relevant technical keywords that could enhance your resume's visibility.
                </p>
            `;
    } else if (keywordsContainer) {
      keywordsContainer.innerHTML = `
                <div class="no-keywords">
                    <i class="fas fa-check-circle text-success"></i>
                    <p>Your resume contains a comprehensive set of technical keywords!</p>
                </div>
            `;
    }

    return {
      word_count: words,
      character_count: chars,
      line_count: lines,
      emails_found: emails,
      phones_found: phones,
      technical_keywords_found: foundKeywords,
      keyword_count: foundKeywords.length,
      missing_keywords: missingKeywords,
      readability_score: Math.min(100, Math.max(0, 100 - (words / lines) * 2)),
    };
  }

  displayMLResults(analysisData) {
    console.log("🎯 Displaying ML Results:", analysisData);

    // Show results section
    const resultsSection = document.getElementById("results-section");
    if (resultsSection) {
      resultsSection.classList.remove("hidden");
      resultsSection.scrollIntoView({ behavior: "smooth" });
    }

    // Display ML analysis results - Use correct API response structure
    if (analysisData && (analysisData.category || analysisData.match_score)) {
      const mlData = analysisData; // Backend returns data directly

      // Overall Score - use match_score from backend
      const overallScore = mlData.match_score || mlData.overall_score || 0;
      this.updateScoreDisplay(overallScore);

      // AI Feedback
      this.updateAIFeedback(mlData);

      // Predictions - adapt to backend structure
      const predictions = {
        job_category: mlData.category,
        experience_level: mlData.predicted_experience
          ? `${mlData.predicted_experience} years`
          : "Unknown",
        match_score: mlData.match_score,
      };
      this.updatePredictions(predictions);

      // Recommendations - create from backend data
      const recommendations = mlData.recommendations || [
        `Your resume is best suited for ${
          mlData.category || "your target"
        } positions`,
        `Experience level detected: ${
          mlData.predicted_experience || "Unknown"
        } years`,
        `Match score: ${mlData.match_score || 0}% - ${
          mlData.match_score >= 80
            ? "Excellent!"
            : mlData.match_score >= 60
            ? "Good"
            : "Needs improvement"
        }`,
      ];
      this.updateRecommendations(recommendations);

      // Input Statistics - use correct field names
      const inputStats = {
        skills_found: mlData.total_skills_count || 0,
        total_words: mlData.text_stats?.word_count || 0,
        sections: Object.keys(mlData.skills || {}).length || 0,
        experience_years: mlData.predicted_experience || 0,
      };
      this.updateInputStats(inputStats);

      // Extract and display skills - use correct structure
      this.updateSkillsDisplay(mlData);

      // Show integration section with stats
      this.showIntegrationSection(mlData);
    }

    // Display file information
    if (analysisData.filename) {
      const fileInfo = {
        filename: analysisData.filename,
        size: analysisData.file_size,
      };
      this.updateFileStats(fileInfo);
    }
  }

  updateScoreDisplay(score) {
    const atsScore = document.getElementById("ats-score");
    const scoreBar = document.getElementById("score-bar");

    if (atsScore) {
      atsScore.textContent = Math.round(score);

      // Color based on score
      if (score >= 80) {
        atsScore.className = "text-4xl font-bold text-green-400";
      } else if (score >= 60) {
        atsScore.className = "text-4xl font-bold text-yellow-400";
      } else {
        atsScore.className = "text-4xl font-bold text-red-400";
      }
    }

    if (scoreBar) {
      scoreBar.style.width = `${score}%`;
    }
  }

  updateAIFeedback(mlData) {
    const aiFeedback = document.getElementById("ai-feedback");
    if (!aiFeedback) return;

    let feedback =
      "🤖 Your resume has been analyzed using advanced ML models. ";

    // Add prediction insights - adapted to backend structure
    if (mlData.category) {
      feedback += `Our AI predicts this resume is best suited for ${mlData.category} positions. `;
    }

    if (mlData.predicted_experience) {
      feedback += `Experience level detected: ${mlData.predicted_experience} years. `;
    }

    if (mlData.match_score) {
      const score = mlData.match_score;
      if (score >= 90) {
        feedback += `🎉 Excellent match score of ${score.toFixed(
          1
        )}%! Your resume is highly optimized. `;
      } else if (score >= 70) {
        feedback += `👍 Good match score of ${score.toFixed(
          1
        )}%. There's room for improvement. `;
      } else {
        feedback += `⚠️ Match score of ${score.toFixed(
          1
        )}%. Consider significant improvements. `;
      }
    }

    if (mlData.total_skills_count) {
      feedback += `We found ${mlData.total_skills_count} relevant skills in your resume. `;
    }

    // Add category confidence if available
    if (mlData.category_confidence) {
      const confidence = (mlData.category_confidence * 100).toFixed(1);
      feedback += `Category prediction confidence: ${confidence}%. `;
    }

    // Add improvement suggestions
    if (mlData.match_score < 80) {
      feedback += `💡 Tips: Add more relevant keywords, quantify achievements, and ensure proper formatting. `;
    }

    aiFeedback.textContent = feedback;
  }

  updateSkillsDisplay(mlData) {
    const skillsContainer = document.getElementById("skills-container");
    if (!skillsContainer) return;

    // Extract skills from API response structure
    let allSkills = [];

    // Use the skills object from API response
    if (mlData.skills && typeof mlData.skills === "object") {
      // Flatten all skill categories
      Object.keys(mlData.skills).forEach((category) => {
        if (Array.isArray(mlData.skills[category])) {
          allSkills = allSkills.concat(mlData.skills[category]);
        }
      });
    }

    // Also include additional skills from form input
    if (mlData.additional_skills) {
      const additionalSkills = mlData.additional_skills
        .split(",")
        .map((s) => s.trim().toLowerCase());
      allSkills = allSkills.concat(additionalSkills);
    }

    // Remove duplicates and capitalize
    allSkills = [...new Set(allSkills)].map(
      (skill) => skill.charAt(0).toUpperCase() + skill.slice(1)
    );

    if (allSkills && allSkills.length > 0) {
      skillsContainer.innerHTML = `
                <div class="space-y-3">
                    <p class="text-slate-300 text-sm mb-3">✨ Found ${
                      allSkills.length
                    } skills in your resume:</p>
                    <div class="flex flex-wrap gap-2">
                        ${allSkills
                          .map(
                            (skill) =>
                              `<span class="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">${skill}</span>`
                          )
                          .join("")}
                    </div>
                </div>
            `;
    } else {
      skillsContainer.innerHTML = `
                <div class="space-y-2">
                    <p class="text-slate-400 text-sm mb-3">Skills detected based on ${
                      mlData.category || "analysis"
                    }:</p>
                    <div class="flex flex-wrap gap-2">
                        ${this.extractSkillsFromCategory(
                          mlData.category || "Software"
                        )
                          .map(
                            (skill) =>
                              `<span class="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">${skill}</span>`
                          )
                          .join("")}
                    </div>
                </div>
            `;
    }

    // Update keywords/missing skills
    this.updateKeywordsDisplay(mlData);
  }

  extractSkillsFromCategory(category) {
    const skillMap = {
      "Software Engineering": [
        "Python",
        "JavaScript",
        "React",
        "Node.js",
        "SQL",
        "Git",
        "REST APIs",
      ],
      "Data Science": [
        "Python",
        "R",
        "Machine Learning",
        "SQL",
        "Pandas",
        "NumPy",
        "Scikit-learn",
      ],
      DevOps: [
        "Docker",
        "Kubernetes",
        "AWS",
        "CI/CD",
        "Linux",
        "Terraform",
        "Jenkins",
      ],
      Frontend: [
        "JavaScript",
        "React",
        "Vue.js",
        "HTML",
        "CSS",
        "TypeScript",
        "Redux",
      ],
      Backend: [
        "Python",
        "Java",
        "Node.js",
        "SQL",
        "MongoDB",
        "REST APIs",
        "Microservices",
      ],
      Mobile: [
        "React Native",
        "Flutter",
        "iOS",
        "Android",
        "Swift",
        "Kotlin",
        "Mobile UI",
      ],
      "AI/ML": [
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch",
        "NLP",
        "Computer Vision",
      ],
    };

    return (
      skillMap[category] || [
        "Technical Skills",
        "Problem Solving",
        "Communication",
        "Teamwork",
      ]
    );
  }

  updateKeywordsDisplay(mlData) {
    const keywordsContainer = document.getElementById("keywords-container");
    if (!keywordsContainer) return;

    const category = mlData.category || "Software Engineering";
    const score = mlData.match_score || 0;

    let missingKeywords = [];
    if (score < 90) {
      missingKeywords = [
        "Leadership",
        "Project Management",
        "Agile",
        "Team Collaboration",
        "Problem Solving",
        "Innovation",
        "Communication Skills",
      ];
    }

    if (missingKeywords.length > 0) {
      keywordsContainer.innerHTML = `
                <div class="space-y-2">
                    <p class="text-slate-400 text-sm mb-3">Consider adding these keywords to improve your score:</p>
                    <div class="flex flex-wrap gap-2">
                        ${missingKeywords
                          .map(
                            (keyword) =>
                              `<span class="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">${keyword}</span>`
                          )
                          .join("")}
                    </div>
                </div>
            `;
    } else {
      keywordsContainer.innerHTML =
        '<p class="text-green-400 text-sm">🎉 Great keyword coverage! Your resume has excellent keyword optimization.</p>';
    }
  }

  addIntegrationButtons(mlData) {
    // Check if integration buttons already exist
    if (document.getElementById("integration-buttons")) return;

    // Find the recommendations section to add buttons after it
    const recommendationsSection =
      document.querySelector(
        '.glass-card h3:contains("AI Improvement Suggestions")'
      ) ||
      document.querySelector('[id*="recommendation"]') ||
      document.querySelector(".glass-card:last-of-type");

    if (recommendationsSection) {
      const parentCard =
        recommendationsSection.closest(".glass-card") ||
        recommendationsSection.parentElement;

      // Create integration buttons container
      const integrationHTML = `
                <div id="integration-buttons" class="glass-card rounded-3xl p-8 shadow-xl mt-6">
                    <h3 class="text-xl font-bold text-green-400 mb-6">
                        <i class="fas fa-link mr-2"></i>Next Steps - Advanced Analysis
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Skill Gap Analysis -->
                        <div class="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
                            <div class="flex items-center mb-4">
                                <i class="fas fa-chart-gap text-purple-400 text-2xl mr-3"></i>
                                <h4 class="text-lg font-bold text-white">Skill Gap Analysis</h4>
                            </div>
                            <p class="text-slate-300 text-sm mb-4">Compare your skills against specific job requirements and identify areas for improvement.</p>
                            <button onclick="resumeAnalyzer.goToSkillGapAnalysis()" class="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center">
                                <i class="fas fa-arrow-right mr-2"></i>
                                Analyze Skill Gaps
                            </button>
                        </div>

                        <!-- Job Matching -->
                        <div class="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
                            <div class="flex items-center mb-4">
                                <i class="fas fa-briefcase text-blue-400 text-2xl mr-3"></i>
                                <h4 class="text-lg font-bold text-white">AI Job Matching</h4>
                            </div>
                            <p class="text-slate-300 text-sm mb-4">Find jobs that match your ${
                              mlData.category || "profile"
                            } skills and get personalized recommendations.</p>
                            <button onclick="resumeAnalyzer.goToJobMatching()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center">
                                <i class="fas fa-search mr-2"></i>
                                Find Matching Jobs
                            </button>
                        </div>
                    </div>
                    
                    <!-- Quick Stats -->
                    <div class="mt-6 p-4 bg-slate-800/50 rounded-xl">
                        <div class="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div class="text-2xl font-bold text-green-400">${
                                  mlData.match_score || 0
                                }%</div>
                                <div class="text-xs text-slate-400">Match Score</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-blue-400">${
                                  mlData.skills_found || 0
                                }</div>
                                <div class="text-xs text-slate-400">Skills Found</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-purple-400">${
                                  mlData.category || "Tech"
                                }</div>
                                <div class="text-xs text-slate-400">Category</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

      // Insert the integration buttons after the parent card
      parentCard.insertAdjacentHTML("afterend", integrationHTML);
    }
  }

  goToSkillGapAnalysis() {
    // Store current analysis data for use in skill gap analysis
    if (this.analysisResults) {
      localStorage.setItem(
        "resumeAnalysisData",
        JSON.stringify(this.analysisResults)
      );
    }

    // Navigate to skill gap analysis page
    window.location.href = "/skill-gap-analysis";
  }

  goToJobMatching() {
    // Store current analysis data for use in job matching
    if (this.analysisResults) {
      localStorage.setItem(
        "resumeAnalysisData",
        JSON.stringify(this.analysisResults)
      );
    }

    // Navigate to job matching page
    window.location.href = "/job-matching";
  }

  showIntegrationSection(mlData) {
    // Show the integration section
    const integrationSection = document.getElementById("integration-section");
    if (integrationSection) {
      integrationSection.style.display = "block";

      // Update the quick stats
      const statsScore = document.getElementById("stats-score");
      const statsSkills = document.getElementById("stats-skills");
      const statsCategory = document.getElementById("stats-category");

      if (statsScore) {
        statsScore.textContent = `${Math.round(mlData.match_score || 0)}%`;
      }
      if (statsSkills) {
        statsSkills.textContent = mlData.total_skills_count || 0;
      }
      if (statsCategory) {
        const category = mlData.category || "Tech";
        statsCategory.textContent =
          category.length > 8 ? category.substring(0, 8) + "..." : category;
      }

      // Store analysis data for other pages
      if (this.analysisResults) {
        localStorage.setItem(
          "resumeAnalysisData",
          JSON.stringify(this.analysisResults)
        );
      }
    }
  }

  updatePredictions(predictions) {
    // Update job category prediction
    const categoryElement = document.getElementById("predicted-category");
    if (categoryElement && predictions.job_category) {
      categoryElement.textContent = predictions.job_category;
    }

    // Update experience level
    const experienceElement = document.getElementById("predicted-experience");
    if (experienceElement && predictions.experience_level) {
      experienceElement.textContent = predictions.experience_level;
    }

    // Update skill domain
    const domainElement = document.getElementById("predicted-domain");
    if (domainElement && predictions.skill_domain) {
      domainElement.textContent = predictions.skill_domain;
    }

    // Update top categories if available
    if (predictions.top_categories) {
      this.updateTopCategories(predictions.top_categories);
    }
  }

  updateTopCategories(topCategories) {
    const container = document.getElementById("top-categories");
    if (!container) return;

    container.innerHTML = "";
    topCategories.slice(0, 3).forEach((category, index) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.className =
        "flex justify-between items-center p-3 bg-slate-800/30 rounded-lg";
      categoryDiv.innerHTML = `
                <span class="font-medium">${category.category}</span>
                <span class="text-green-400 font-semibold">${(
                  category.probability * 100
                ).toFixed(1)}%</span>
            `;
      container.appendChild(categoryDiv);
    });
  }

  updateRecommendations(recommendations) {
    const container = document.getElementById("suggestions-container");
    if (!container) return;

    container.innerHTML = "";

    if (recommendations.length === 0) {
      container.innerHTML =
        '<p class="text-slate-400 italic">No specific recommendations at this time. Your resume looks good!</p>';
      return;
    }

    recommendations.forEach((recommendation, index) => {
      const recDiv = document.createElement("div");
      recDiv.className =
        "flex items-start space-x-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50";
      recDiv.innerHTML = `
                <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1 flex-shrink-0">
                    ${index + 1}
                </div>
                <div class="flex-1">
                    <p class="text-slate-200 leading-relaxed">${recommendation}</p>
                </div>
                <div class="text-green-400 mt-1">
                    <i class="fas fa-lightbulb text-sm"></i>
                </div>
            `;
      container.appendChild(recDiv);
    });
  }

  updateInputStats(inputStats) {
    // Update word count
    const wordCountElement = document.getElementById("word-count");
    if (wordCountElement && inputStats.resume_length) {
      wordCountElement.textContent = `${Math.round(
        inputStats.resume_length / 5
      )} words`; // Rough estimate
    }

    // Update skills count
    const skillsCountElement = document.getElementById("skills-count");
    if (skillsCountElement && inputStats.skills_count) {
      skillsCountElement.textContent = `${inputStats.skills_count} skills`;
    }

    // Update keywords count
    const keywordsCountElement = document.getElementById("keywords-count");
    if (keywordsCountElement && inputStats.keywords_count) {
      keywordsCountElement.textContent = `${inputStats.keywords_count} keywords`;
    }
  }

  updateBasicStats(basicAnalysis) {
    // Update technical keywords found (this will show as detected skills)
    const skillsContainer = document.getElementById("skills-container");
    if (skillsContainer && basicAnalysis.technical_keywords_found) {
      if (basicAnalysis.technical_keywords_found.length > 0) {
        skillsContainer.innerHTML = basicAnalysis.technical_keywords_found
          .map(
            (keyword) =>
              `<span class="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm mr-2 mb-2">${keyword}</span>`
          )
          .join("");
      } else {
        skillsContainer.innerHTML =
          '<p class="text-slate-400 text-sm">No technical skills detected in resume</p>';
      }
    }

    // Update contact information for additional insights
    const emailsElement = document.getElementById("emails-found");
    if (emailsElement && basicAnalysis.emails_found) {
      emailsElement.textContent =
        basicAnalysis.emails_found.length > 0
          ? basicAnalysis.emails_found.join(", ")
          : "No emails detected";
    }

    const phonesElement = document.getElementById("phones-found");
    if (phonesElement && basicAnalysis.phones_found) {
      phonesElement.textContent =
        basicAnalysis.phones_found.length > 0
          ? basicAnalysis.phones_found.join(", ")
          : "No phone numbers detected";
    }

    // Update missing keywords section with suggestions
    this.updateMissingKeywords(basicAnalysis);
  }

  updateMissingKeywords(basicAnalysis) {
    const keywordsContainer = document.getElementById("keywords-container");
    if (!keywordsContainer) return;

    // Common industry keywords that might be missing
    const allImportantKeywords = [
      "Leadership",
      "Team Management",
      "Project Management",
      "Agile",
      "Scrum",
      "Cloud Computing",
      "AWS",
      "Azure",
      "Docker",
      "Kubernetes",
      "DevOps",
      "CI/CD",
      "Git",
      "API Development",
      "Database",
      "Machine Learning",
      "Data Analysis",
      "Problem Solving",
      "Communication",
      "Collaboration",
      "Innovation",
    ];

    const foundKeywords = basicAnalysis.technical_keywords_found || [];
    const foundLower = foundKeywords.map((k) => k.toLowerCase());

    const missingKeywords = allImportantKeywords
      .filter((keyword) => !foundLower.includes(keyword.toLowerCase()))
      .slice(0, 8); // Show top 8 missing keywords

    if (missingKeywords.length > 0) {
      keywordsContainer.innerHTML = missingKeywords
        .map(
          (keyword) =>
            `<span class="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm mr-2 mb-2">${keyword}</span>`
        )
        .join("");
    } else {
      keywordsContainer.innerHTML =
        '<p class="text-slate-400 text-sm">Great! Your resume contains most important keywords.</p>';
    }
  }

  updateFileStats(fileInfo) {
    const fileStatsElement = document.getElementById("file-stats");
    if (fileStatsElement) {
      fileStatsElement.innerHTML = `
                <div class="text-sm text-slate-400">
                    <p><strong>File:</strong> ${fileInfo.filename}</p>
                    <p><strong>Size:</strong> ${this.formatFileSize(
                      fileInfo.file_size
                    )}</p>
                    ${
                      fileInfo.upload_time
                        ? `<p><strong>Uploaded:</strong> ${new Date(
                            fileInfo.upload_time
                          ).toLocaleString()}</p>`
                        : ""
                    }
                </div>
            `;
    }
  }

  // Legacy methods for backward compatibility
  showDemoResults() {
    // Fallback demo results for development
    const demoData = {
      ml_analysis: {
        success: true,
        analysis: {
          overall_score: 78,
          predictions: {
            job_category: "Software Engineering",
            experience_level: "Mid",
            skill_domain: "Technology",
            top_categories: [
              { category: "Software Engineering", probability: 0.85 },
              { category: "Full Stack Development", probability: 0.72 },
              { category: "Web Development", probability: 0.68 },
            ],
          },
          recommendations: [
            'Add more quantified achievements to showcase your impact (e.g., "Improved system performance by 40%")',
            "Include cloud computing skills like AWS or Azure to stay competitive",
            "Consider adding leadership experience examples and team management skills",
            'Optimize for ATS by using standard section headings like "Work Experience" and "Education"',
            "Add more industry-specific keywords to improve searchability",
          ],
          confidence_scores: {
            job_category: 0.85,
            experience_level: 0.78,
            skill_domain: 0.92,
          },
          input_stats: {
            resume_length: 1450,
            skills_count: 12,
            keywords_count: 18,
          },
        },
      },
      basic_analysis: {
        word_count: 290,
        character_count: 1450,
        technical_keywords_found: [
          "Python",
          "JavaScript",
          "React",
          "Node.js",
          "MongoDB",
          "Git",
          "API",
          "Docker",
          "AWS",
          "Machine Learning",
        ],
        emails_found: ["user@example.com"],
        phones_found: ["(555) 123-4567"],
        keyword_count: 10,
      },
      file_info: {
        filename: "demo-resume.pdf",
        file_size: 245000,
      },
    };

    this.displayMLResults(demoData);
    this.showStatus(
      "Demo analysis displayed (upload a real resume for ML-powered analysis)",
      "warning"
    );
  }

  showStatus(message, type = "info") {
    const statusElement = document.getElementById("upload-status");
    if (!statusElement) return;

    statusElement.textContent = message;
    statusElement.className = `text-center text-sm status-${type}`;

    // Add status styling
    const colors = {
      info: "text-blue-400",
      success: "text-green-400",
      error: "text-red-400",
      warning: "text-yellow-400",
    };

    statusElement.className = `text-center text-sm ${
      colors[type] || colors.info
    }`;

    console.log(`📢 Status: ${message} (${type})`);
  }

  async checkAIStatus() {
    try {
      const response = await fetch("/api/resume/health-check");
      const data = await response.json();

      const statusElement = document.getElementById("ai-status");
      if (statusElement) {
        if (data.success && data.health.status === "healthy") {
          statusElement.textContent = "AI Online";
          statusElement.className = "text-green-400 text-sm font-semibold";
        } else {
          statusElement.textContent = "AI Offline";
          statusElement.className = "text-yellow-400 text-sm font-semibold";
        }
      }
    } catch (error) {
      console.log("⚠️ Could not check AI status");
      const statusElement = document.getElementById("ai-status");
      if (statusElement) {
        statusElement.textContent = "AI Status Unknown";
        statusElement.className = "text-gray-400 text-sm font-semibold";
      }
    }
  }

  exportResults(format) {
    if (!this.analysisResults) {
      this.showStatus(
        "No analysis results to export. Please analyze a resume first.",
        "warning"
      );
      return;
    }

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `resume-analysis-${timestamp}`;

    if (format === "json") {
      this.downloadJSON(this.analysisResults, `${filename}.json`);
    } else if (format === "pdf") {
      this.showStatus("PDF export coming soon!", "info");
      // TODO: Implement PDF export
    }
  }

  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showStatus("Analysis exported as JSON file!", "success");
  }
}

// ML Resume Service helper class
class MLResumeService {
  constructor() {
    this.baseUrl = "/api/resume";
  }

  async getStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/ml-status`);
      return await response.json();
    } catch (error) {
      console.error("Error getting ML service status:", error);
      return { success: false, error: error.message };
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health-check`);
      return await response.json();
    } catch (error) {
      console.error("Error performing health check:", error);
      return { success: false, error: error.message };
    }
  }

  async analyzeText(resumeData) {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      });
      return await response.json();
    } catch (error) {
      console.error("Error analyzing text:", error);
      return { success: false, error: error.message };
    }
  }

  async predictCategory(resumeData) {
    try {
      const response = await fetch(`${this.baseUrl}/predict-category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      });
      return await response.json();
    } catch (error) {
      console.error("Error predicting category:", error);
      return { success: false, error: error.message };
    }
  }

  async getRecommendations(resumeData) {
    try {
      const response = await fetch(`${this.baseUrl}/get-recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      });
      return await response.json();
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return { success: false, error: error.message };
    }
  }
}

// Initialize Resume Analyzer when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log(
    "🎯 LakshyaAI Resume Analysis with ML Integration loaded - User: syashu16"
  );
  new ResumeAnalyzer();
});
