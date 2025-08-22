// Skill Gap Analysis Page JavaScript
// LakshyaAI - User: syashu16 - Updated: 2025-08-05 13:42:11

class SkillGapAnalyzer {
  constructor() {
    this.userSkills = [];
    this.targetRole = "";
    this.experienceLevel = "";
    this.analysisResults = null;
    this.completedSkills = JSON.parse(
      localStorage.getItem("completedSkills_syashu16") || "[]"
    );
    this.init();
  }

  init() {
    console.log(
      "🚀 Skill Gap Analyzer initialized for user: syashu16 - 2025-08-05 13:42:11"
    );
    this.setupEventListeners();
    this.checkAIStatus();
    this.loadProgress();
    this.loadResumeData(); // Auto-load resume data if available
  }

  setupEventListeners() {
    // Analysis form submission
    const analysisForm = document.getElementById("role-analysis-form");
    if (analysisForm) {
      analysisForm.addEventListener("submit", (e) => this.handleAnalysis(e));
    }

    // Mark skill as complete
    const markCompleteBtn = document.getElementById("mark-complete-btn");
    if (markCompleteBtn) {
      markCompleteBtn.addEventListener("click", () => this.markSkillComplete());
    }

    // Export buttons
    const exportPdfBtn = document.getElementById("export-pdf");
    const exportCalendarBtn = document.getElementById("export-calendar");
    const shareProgressBtn = document.getElementById("share-progress");

    if (exportPdfBtn) {
      exportPdfBtn.addEventListener("click", () => this.exportAnalysis("pdf"));
    }
    if (exportCalendarBtn) {
      exportCalendarBtn.addEventListener("click", () =>
        this.exportToCalendar()
      );
    }
    if (shareProgressBtn) {
      shareProgressBtn.addEventListener("click", () => this.shareProgress());
    }

    // Enter key for skill completion
    const completedSkillInput = document.getElementById("completed-skill");
    if (completedSkillInput) {
      completedSkillInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.markSkillComplete();
        }
      });
    }
  }

  async handleAnalysis(event) {
    event.preventDefault();

    const targetRole = document.getElementById("target-role").value.trim();
    const experienceLevel = document.getElementById("experience-level").value;
    const currentSkills = document
      .getElementById("current-skills")
      .value.trim();

    if (!targetRole || !currentSkills) {
      this.showStatus("Please fill in all required fields.", "error");
      return;
    }

    this.targetRole = targetRole;
    this.experienceLevel = experienceLevel;
    this.userSkills = currentSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);

    await this.performAnalysis();
  }

  async performAnalysis() {
    const analyzeBtn = document.getElementById("analyze-btn");
    const analyzeText = document.getElementById("analyze-text");
    const originalText = analyzeText.textContent;

    try {
      // Update UI to show loading
      this.showStatus(
        "Analyzing your skills against job market requirements...",
        "info"
      );
      analyzeText.innerHTML =
        '<div class="loading-spinner"></div> AI Analyzing...';
      analyzeBtn.disabled = true;

      // Make API call (replace with actual endpoint)
      const response = await this.makeAnalysisAPI();

      if (response.success) {
        this.analysisResults = response.data;
        this.displayResults(response.data);
        this.showStatus("Analysis completed successfully!", "success");
      } else {
        throw new Error(response.error || "Analysis failed");
      }
    } catch (error) {
      console.error("❌ Analysis error:", error);
      this.showStatus("Analysis failed. Showing demo results.", "warning");
      this.showDemoResults();
    } finally {
      // Reset button
      analyzeText.textContent = originalText;
      analyzeBtn.disabled = false;
    }
  }

  async makeAnalysisAPI() {
    console.log(
      "🔍 DYNAMIC ANALYSIS for role:",
      this.targetRole,
      "Level:",
      this.experienceLevel
    );
    console.log("🎯 User skills:", this.userSkills);

    try {
      // Call the REAL dynamic Flask API - NO FALLBACKS!
      const response = await fetch("/api/dynamic-skill-gap-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_skills: this.userSkills,
          target_role: this.targetRole,
          experience_level: this.experienceLevel,
        }),
      });

      const result = await response.json();

      if (result.success && result.analysis) {
        console.log("✅ REAL DYNAMIC API SUCCESS:", result);
        return {
          success: true,
          data: this.formatDynamicAnalysisData(result.analysis),
        };
      } else {
        console.error("❌ Dynamic API Error:", result.error);
        throw new Error(result.error || "Dynamic analysis failed");
      }
    } catch (error) {
      console.error("❌ DYNAMIC API FAILED:", error);

      // NO FALLBACK - Show error instead
      this.showStatus(
        `Dynamic analysis failed: ${error.message}. Please check the server.`,
        "error"
      );

      return {
        success: false,
        error: `Dynamic skill analysis unavailable: ${error.message}`,
      };
    }
  }

  formatDynamicAnalysisData(analysis) {
    console.log("📊 Formatting REAL dynamic analysis data:", analysis);

    return {
      targetRole: analysis.target_role,
      experienceLevel: analysis.experience_level,
      readinessScore: analysis.readiness_score || 0,
      skillsMatched: analysis.skills_acquired || 0,
      skillsTotal: analysis.total_skills_needed || 0,
      skillsMissing: analysis.skill_gaps?.length || 0,

      // Format matched skills from dynamic analysis
      matchedSkills: (analysis.matched_skills || []).map((skill) => ({
        name: skill.user_skill || skill.skill,
        level: 4,
        importance: "High",
      })),

      // Format missing skills from REAL job market data
      missingSkills: (analysis.skill_gaps || []).map((skill) => ({
        name: skill.skill,
        difficulty: this.inferDifficulty(skill.skill),
        priority: skill.priority || "medium",
        timeToLearn: this.getTimeToLearn(this.inferDifficulty(skill.skill)),
        resources: [],
      })),

      learningPath: this.generateDynamicLearningPath(analysis.skill_gaps || []),
      aiInsight: this.generateDynamicAIInsight(analysis),
      jobMarketInsights: analysis.job_market_insights || {},
    };
  }

  inferDifficulty(skillName) {
    const skill = skillName.toLowerCase();

    if (
      skill.includes("machine learning") ||
      skill.includes("deep learning") ||
      skill.includes("tensorflow") ||
      skill.includes("pytorch") ||
      skill.includes("kubernetes") ||
      skill.includes("mlops")
    ) {
      return "advanced";
    }

    if (
      skill.includes("python") ||
      skill.includes("sql") ||
      skill.includes("tableau") ||
      skill.includes("power bi") ||
      skill.includes("analytics")
    ) {
      return "intermediate";
    }

    return "beginner";
  }

  generateDynamicLearningPath(skillGaps) {
    const highPriority = skillGaps
      .filter((s) => s.priority === "high")
      .slice(0, 4);
    const mediumPriority = skillGaps
      .filter((s) => s.priority === "medium")
      .slice(0, 3);

    return {
      highPriority: highPriority.map((skill) => ({
        skill: skill.skill,
        description: skill.description || `Essential for ${this.targetRole}`,
        difficulty: this.inferDifficulty(skill.skill),
        timeToLearn: this.getTimeToLearn(this.inferDifficulty(skill.skill)),
      })),
      mediumPriority: mediumPriority.map((skill) => ({
        skill: skill.skill,
        description: skill.description || `Important for ${this.targetRole}`,
        difficulty: this.inferDifficulty(skill.skill),
        timeToLearn: this.getTimeToLearn(this.inferDifficulty(skill.skill)),
      })),
      lowPriority: [],
    };
  }

  generateDynamicAIInsight(analysis) {
    const readiness = analysis.readiness_score || 0;
    const skillsAcquired = analysis.skills_acquired || 0;
    const skillsMissing = analysis.skill_gaps?.length || 0;

    let level =
      readiness >= 80
        ? "strong"
        : readiness >= 60
        ? "good"
        : readiness >= 40
        ? "developing"
        : "beginning";

    return `You have a ${level} foundation with ${skillsAcquired} key skills for ${analysis.target_role}. Focus on ${skillsMissing} missing skills from real job market data to improve your readiness.`;
  }

  formatAnalysisData(apiData) {
    // Format API response to match frontend expectations
    const jobMarketData = apiData.job_market_data || {};

    return {
      targetRole: this.targetRole,
      experienceLevel: this.experienceLevel,
      readinessScore: apiData.readiness_score || 0,
      skillsMatched: apiData.skills_matched || 0,
      skillsTotal: apiData.skills_total || 0,
      skillsMissing: apiData.skills_missing || 0,
      matchedSkills: apiData.matched_skills || [],
      missingSkills: apiData.missing_skills || [],
      learningPath: apiData.learning_roadmap || {},
      aiInsight: apiData.ai_insights || "Analysis completed successfully!",
      jobMarketData: {
        jobCount: jobMarketData.job_count || 0,
        salaryRange: jobMarketData.salary_range || {},
        trendingSkills: jobMarketData.trending_skills || [],
      },
      learningResources: apiData.learning_resources || {},
    };
  }

  generateAnalysisResults() {
    // Demo analysis results based on user input
    const requiredSkills = this.getRequiredSkillsForRole(
      this.targetRole,
      this.experienceLevel
    );
    const matchedSkills = this.userSkills.filter((skill) =>
      requiredSkills.some(
        (req) => req.name.toLowerCase() === skill.toLowerCase()
      )
    );
    const missingSkills = requiredSkills.filter(
      (req) =>
        !this.userSkills.some(
          (skill) => skill.toLowerCase() === req.name.toLowerCase()
        )
    );

    const readinessScore = Math.round(
      (matchedSkills.length / requiredSkills.length) * 100
    );

    return {
      targetRole: this.targetRole,
      experienceLevel: this.experienceLevel,
      readinessScore,
      skillsMatched: matchedSkills.length,
      skillsTotal: requiredSkills.length,
      skillsMissing: missingSkills.length,
      matchedSkills: matchedSkills.map((skill) => ({
        name: skill,
        level: Math.floor(Math.random() * 3) + 3, // 3-5 level
        importance: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
      })),
      missingSkills: missingSkills.map((skill) => ({
        ...skill,
        timeToLearn: this.getTimeToLearn(skill.difficulty),
        resources: this.getResourcesForSkill(skill.name),
      })),
      learningPath: this.generateLearningPath(missingSkills),
      aiInsight: this.generateAIInsight(
        readinessScore,
        matchedSkills.length,
        missingSkills.length
      ),
    };
  }

  getRequiredSkillsForRole(role, level) {
    // Comprehensive skill requirements based on role and level
    const skillSets = {
      "full stack developer": {
        junior: [
          { name: "HTML", difficulty: "beginner", priority: "high" },
          { name: "CSS", difficulty: "beginner", priority: "high" },
          { name: "JavaScript", difficulty: "intermediate", priority: "high" },
          { name: "React", difficulty: "intermediate", priority: "high" },
          { name: "Node.js", difficulty: "intermediate", priority: "medium" },
          { name: "Git", difficulty: "beginner", priority: "high" },
          { name: "MongoDB", difficulty: "intermediate", priority: "medium" },
          {
            name: "Express.js",
            difficulty: "intermediate",
            priority: "medium",
          },
          { name: "REST APIs", difficulty: "intermediate", priority: "high" },
          {
            name: "Responsive Design",
            difficulty: "beginner",
            priority: "high",
          },
        ],
        mid: [
          { name: "HTML", difficulty: "beginner", priority: "high" },
          { name: "CSS", difficulty: "intermediate", priority: "high" },
          { name: "JavaScript", difficulty: "advanced", priority: "high" },
          { name: "React", difficulty: "advanced", priority: "high" },
          { name: "Node.js", difficulty: "advanced", priority: "high" },
          { name: "Git", difficulty: "intermediate", priority: "high" },
          { name: "MongoDB", difficulty: "intermediate", priority: "medium" },
          {
            name: "PostgreSQL",
            difficulty: "intermediate",
            priority: "medium",
          },
          { name: "Docker", difficulty: "intermediate", priority: "medium" },
          { name: "AWS", difficulty: "intermediate", priority: "medium" },
          { name: "TypeScript", difficulty: "intermediate", priority: "low" },
          { name: "Testing", difficulty: "intermediate", priority: "high" },
        ],
      },
      "frontend developer": {
        junior: [
          { name: "HTML", difficulty: "beginner", priority: "high" },
          { name: "CSS", difficulty: "beginner", priority: "high" },
          { name: "JavaScript", difficulty: "intermediate", priority: "high" },
          { name: "React", difficulty: "intermediate", priority: "high" },
          { name: "Git", difficulty: "beginner", priority: "high" },
          {
            name: "Responsive Design",
            difficulty: "beginner",
            priority: "high",
          },
        ],
      },
      "backend developer": {
        junior: [
          { name: "Python", difficulty: "intermediate", priority: "high" },
          { name: "JavaScript", difficulty: "intermediate", priority: "high" },
          { name: "SQL", difficulty: "intermediate", priority: "high" },
          { name: "Git", difficulty: "beginner", priority: "high" },
          { name: "REST APIs", difficulty: "intermediate", priority: "high" },
        ],
      },
      "data scientist": {
        junior: [
          { name: "Python", difficulty: "intermediate", priority: "high" },
          { name: "Pandas", difficulty: "intermediate", priority: "high" },
          { name: "NumPy", difficulty: "intermediate", priority: "high" },
          { name: "Matplotlib", difficulty: "beginner", priority: "medium" },
          { name: "SQL", difficulty: "intermediate", priority: "high" },
          { name: "Statistics", difficulty: "intermediate", priority: "high" },
          {
            name: "Machine Learning",
            difficulty: "intermediate",
            priority: "high",
          },
          { name: "Jupyter", difficulty: "beginner", priority: "medium" },
        ],
        senior: [
          { name: "Python", difficulty: "advanced", priority: "high" },
          {
            name: "Machine Learning",
            difficulty: "advanced",
            priority: "high",
          },
          { name: "Deep Learning", difficulty: "advanced", priority: "high" },
          { name: "TensorFlow", difficulty: "advanced", priority: "high" },
          { name: "PyTorch", difficulty: "advanced", priority: "medium" },
          { name: "SQL", difficulty: "advanced", priority: "high" },
          { name: "Statistics", difficulty: "advanced", priority: "high" },
          { name: "MLOps", difficulty: "intermediate", priority: "medium" },
          {
            name: "Cloud Platforms",
            difficulty: "intermediate",
            priority: "medium",
          },
        ],
      },
      "business intelligence": {
        junior: [
          { name: "SQL", difficulty: "intermediate", priority: "high" },
          { name: "Excel", difficulty: "beginner", priority: "high" },
          { name: "Python", difficulty: "beginner", priority: "medium" },
          {
            name: "Data Analysis",
            difficulty: "intermediate",
            priority: "high",
          },
          { name: "Tableau", difficulty: "beginner", priority: "high" },
          { name: "Power BI", difficulty: "beginner", priority: "high" },
          { name: "Statistics", difficulty: "beginner", priority: "medium" },
        ],
        mid: [
          { name: "SQL", difficulty: "advanced", priority: "high" },
          { name: "Python", difficulty: "intermediate", priority: "high" },
          { name: "Tableau", difficulty: "intermediate", priority: "high" },
          { name: "Power BI", difficulty: "intermediate", priority: "high" },
          {
            name: "Data Warehousing",
            difficulty: "intermediate",
            priority: "high",
          },
          { name: "ETL", difficulty: "intermediate", priority: "high" },
          { name: "R", difficulty: "beginner", priority: "medium" },
          {
            name: "Advanced Analytics",
            difficulty: "intermediate",
            priority: "medium",
          },
        ],
        senior: [
          { name: "SQL", difficulty: "advanced", priority: "high" },
          { name: "Python", difficulty: "advanced", priority: "high" },
          { name: "Tableau", difficulty: "advanced", priority: "high" },
          { name: "Power BI", difficulty: "advanced", priority: "high" },
          {
            name: "Data Warehousing",
            difficulty: "advanced",
            priority: "high",
          },
          { name: "ETL", difficulty: "advanced", priority: "high" },
          { name: "R", difficulty: "intermediate", priority: "medium" },
          {
            name: "Advanced Analytics",
            difficulty: "advanced",
            priority: "high",
          },
          {
            name: "Machine Learning",
            difficulty: "intermediate",
            priority: "medium",
          },
          {
            name: "Cloud Platforms",
            difficulty: "intermediate",
            priority: "medium",
          },
          {
            name: "Leadership",
            difficulty: "intermediate",
            priority: "medium",
          },
          { name: "Snowflake", difficulty: "intermediate", priority: "medium" },
          { name: "Azure", difficulty: "intermediate", priority: "medium" },
          { name: "AWS", difficulty: "intermediate", priority: "medium" },
        ],
      },
      "senior business intelligence": {
        junior: [
          { name: "SQL", difficulty: "intermediate", priority: "high" },
          { name: "Excel", difficulty: "beginner", priority: "high" },
          { name: "Python", difficulty: "beginner", priority: "medium" },
          {
            name: "Data Analysis",
            difficulty: "intermediate",
            priority: "high",
          },
          { name: "Tableau", difficulty: "beginner", priority: "high" },
          { name: "Power BI", difficulty: "beginner", priority: "high" },
          { name: "Statistics", difficulty: "beginner", priority: "medium" },
        ],
        mid: [
          { name: "SQL", difficulty: "advanced", priority: "high" },
          { name: "Python", difficulty: "intermediate", priority: "high" },
          { name: "Tableau", difficulty: "intermediate", priority: "high" },
          { name: "Power BI", difficulty: "intermediate", priority: "high" },
          {
            name: "Data Warehousing",
            difficulty: "intermediate",
            priority: "high",
          },
          { name: "ETL", difficulty: "intermediate", priority: "high" },
          { name: "R", difficulty: "beginner", priority: "medium" },
          {
            name: "Advanced Analytics",
            difficulty: "intermediate",
            priority: "medium",
          },
        ],
        senior: [
          { name: "SQL", difficulty: "advanced", priority: "high" },
          { name: "Python", difficulty: "advanced", priority: "high" },
          { name: "Tableau", difficulty: "advanced", priority: "high" },
          { name: "Power BI", difficulty: "advanced", priority: "high" },
          {
            name: "Data Warehousing",
            difficulty: "advanced",
            priority: "high",
          },
          { name: "ETL", difficulty: "advanced", priority: "high" },
          { name: "R", difficulty: "intermediate", priority: "medium" },
          {
            name: "Advanced Analytics",
            difficulty: "advanced",
            priority: "high",
          },
          {
            name: "Machine Learning",
            difficulty: "intermediate",
            priority: "medium",
          },
          {
            name: "Cloud Platforms",
            difficulty: "intermediate",
            priority: "medium",
          },
          {
            name: "Leadership",
            difficulty: "intermediate",
            priority: "medium",
          },
          { name: "Snowflake", difficulty: "intermediate", priority: "medium" },
          { name: "Azure", difficulty: "intermediate", priority: "medium" },
          { name: "AWS", difficulty: "intermediate", priority: "medium" },
        ],
      },
    };

    const normalizedRole = role.toLowerCase();
    const roleSkills = skillSets[normalizedRole];

    if (!roleSkills) {
      console.warn(
        `No skill set found for role: ${role}. Available roles:`,
        Object.keys(skillSets)
      );
      // Default to data scientist if no role found
      return (
        skillSets["data scientist"][level] ||
        skillSets["data scientist"]["junior"]
      );
    }

    return (
      roleSkills[level] ||
      roleSkills["senior"] ||
      roleSkills["mid"] ||
      roleSkills["junior"]
    );
  }

  getTimeToLearn(difficulty) {
    const timeMap = {
      beginner: "2-4 weeks",
      intermediate: "4-8 weeks",
      advanced: "8-12 weeks",
    };
    return timeMap[difficulty] || "4-6 weeks";
  }

  async getResourcesForSkill(skillName) {
    try {
      // Fetch real learning resources from API
      const response = await fetch(
        `/api/learning-resources/${encodeURIComponent(skillName)}`
      );
      const result = await response.json();

      if (result.success && result.resources.length > 0) {
        return result.resources;
      } else {
        console.warn("No API resources found for", skillName, "using fallback");
        return this.getFallbackResources(skillName);
      }
    } catch (error) {
      console.error("Error fetching resources for", skillName, ":", error);
      return this.getFallbackResources(skillName);
    }
  }

  getFallbackResources(skillName) {
    // Enhanced fallback resources with real URLs
    const resourceMap = {
      JavaScript: [
        {
          type: "course",
          name: "JavaScript.info Tutorial",
          url: "https://javascript.info/",
          rating: 4.9,
          provider: "JavaScript.info",
          level: "beginner",
          free: true,
          description:
            "Modern JavaScript tutorial covering all aspects of the language",
        },
        {
          type: "practice",
          name: "FreeCodeCamp JavaScript",
          url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
          rating: 4.8,
          provider: "FreeCodeCamp",
          level: "beginner",
          free: true,
          description: "Interactive JavaScript challenges and projects",
        },
      ],
      React: [
        {
          type: "course",
          name: "React Official Tutorial",
          url: "https://react.dev/tutorial",
          rating: 4.8,
          provider: "React Team",
          level: "beginner",
          free: true,
          description: "Official React tutorial by the React team",
        },
        {
          type: "course",
          name: "React on FreeCodeCamp",
          url: "https://www.freecodecamp.org/learn/front-end-development-libraries/#react",
          rating: 4.7,
          provider: "FreeCodeCamp",
          level: "intermediate",
          free: true,
          description: "Complete React course with hands-on projects",
        },
      ],
      Python: [
        {
          type: "course",
          name: "Python.org Tutorial",
          url: "https://docs.python.org/3/tutorial/",
          rating: 4.8,
          provider: "Python.org",
          level: "beginner",
          free: true,
          description: "Official Python tutorial covering fundamentals",
        },
        {
          type: "practice",
          name: "Python on Codecademy",
          url: "https://www.codecademy.com/learn/learn-python-3",
          rating: 4.6,
          provider: "Codecademy",
          level: "beginner",
          free: false,
          description: "Interactive Python programming course",
        },
      ],
      "Node.js": [
        {
          type: "course",
          name: "Node.js Official Guides",
          url: "https://nodejs.org/en/learn/",
          rating: 4.7,
          provider: "Node.js",
          level: "intermediate",
          free: true,
          description: "Official Node.js learning resources and guides",
        },
        {
          type: "tutorial",
          name: "Node.js Tutorial on W3Schools",
          url: "https://www.w3schools.com/nodejs/",
          rating: 4.5,
          provider: "W3Schools",
          level: "beginner",
          free: true,
          description: "Step-by-step Node.js tutorial with examples",
        },
      ],
      HTML: [
        {
          type: "course",
          name: "HTML on MDN Web Docs",
          url: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
          rating: 4.9,
          provider: "MDN",
          level: "beginner",
          free: true,
          description: "Comprehensive HTML learning path by Mozilla",
        },
        {
          type: "practice",
          name: "HTML Course on FreeCodeCamp",
          url: "https://www.freecodecamp.org/learn/responsive-web-design/",
          rating: 4.8,
          provider: "FreeCodeCamp",
          level: "beginner",
          free: true,
          description: "Interactive HTML and CSS certification course",
        },
      ],
      CSS: [
        {
          type: "course",
          name: "CSS on MDN Web Docs",
          url: "https://developer.mozilla.org/en-US/docs/Learn/CSS",
          rating: 4.9,
          provider: "MDN",
          level: "beginner",
          free: true,
          description: "Complete CSS learning guide with practical examples",
        },
        {
          type: "practice",
          name: "CSS Grid Garden",
          url: "https://cssgridgarden.com/",
          rating: 4.7,
          provider: "Codepip",
          level: "intermediate",
          free: true,
          description: "Fun game to learn CSS Grid layout",
        },
      ],
    };

    // Return specific resources if available, otherwise generate generic ones
    return (
      resourceMap[skillName] || [
        {
          type: "tutorial",
          name: `Learn ${skillName} - YouTube`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
            skillName
          )}+tutorial`,
          rating: 4.5,
          provider: "YouTube",
          level: "beginner",
          free: true,
          description: `Video tutorials for learning ${skillName}`,
        },
        {
          type: "documentation",
          name: `${skillName} Documentation`,
          url: `https://www.google.com/search?q=${encodeURIComponent(
            skillName
          )}+official+documentation`,
          rating: 4.6,
          provider: "Official",
          level: "all",
          free: true,
          description: `Official documentation and guides for ${skillName}`,
        },
      ]
    );
  }

  generateLearningPath(missingSkills) {
    const highPriority = missingSkills.filter(
      (skill) => skill.priority === "high"
    );
    const mediumPriority = missingSkills.filter(
      (skill) => skill.priority === "medium"
    );
    const lowPriority = missingSkills.filter(
      (skill) => skill.priority === "low"
    );

    return {
      high: highPriority,
      medium: mediumPriority,
      low: lowPriority,
    };
  }

  generateAIInsight(readinessScore, matched, missing) {
    const insights = [
      `You have a ${
        readinessScore >= 80
          ? "strong"
          : readinessScore >= 60
          ? "good"
          : "developing"
      } foundation with ${matched} key skills already mastered.`,
      `Focus on the ${missing} missing skills to increase your job readiness by ${Math.round(
        missing * 8
      )}%.`,
      readinessScore >= 75
        ? "You're close to being job-ready! Focus on high-priority skills for the best impact."
        : "Build your foundation with core technologies first, then advance to specialized skills.",
    ];

    return insights.join(" ");
  }

  displayResults(data) {
    // Show results section
    const resultsSection = document.getElementById("results-section");
    if (resultsSection) {
      resultsSection.classList.remove("hidden");
      resultsSection.scrollIntoView({ behavior: "smooth" });
    }

    // Update progress dashboard
    this.updateProgressDashboard(data);

    // Update skills breakdown
    this.updateSkillsBreakdown(data);

    // Update learning roadmap
    this.updateLearningRoadmap(data);

    // Update learning resources
    this.updateLearningResources(data);

    console.log("✅ Analysis results displayed successfully");
  }

  updateProgressDashboard(data) {
    // Update readiness score
    const readinessScore = document.getElementById("readiness-score");
    const readinessCircle = document.getElementById("readiness-circle");
    const skillsMatched = document.getElementById("skills-matched");
    const skillsMissing = document.getElementById("skills-missing");
    const aiInsight = document.getElementById("ai-insight");
    const overallProgress = document.getElementById("overall-progress");

    if (readinessScore) {
      readinessScore.textContent = `${data.readinessScore}%`;
      readinessScore.classList.add("fade-in");
    }

    if (readinessCircle) {
      const circumference = 2 * Math.PI * 40; // radius = 40
      const offset =
        circumference - (data.readinessScore / 100) * circumference;
      readinessCircle.style.strokeDashoffset = offset;
    }

    if (skillsMatched) {
      skillsMatched.textContent = `${data.skillsMatched}/${data.skillsTotal}`;
    }

    if (skillsMissing) {
      skillsMissing.textContent = data.skillsMissing;
    }

    if (aiInsight) {
      aiInsight.textContent = data.aiInsight;
    }

    if (overallProgress) {
      overallProgress.textContent = `${data.readinessScore}% Complete`;
    }
  }

  updateSkillsBreakdown(data) {
    const skillsHaveContainer = document.getElementById(
      "skills-have-container"
    );
    const skillsNeedContainer = document.getElementById(
      "skills-need-container"
    );

    if (skillsHaveContainer) {
      skillsHaveContainer.innerHTML = data.matchedSkills
        .map(
          (skill, index) => `
                <div class="skill-card have slide-in" style="animation-delay: ${
                  index * 0.1
                }s">
                    <div class="flex justify-between items-center">
                        <h5 class="font-semibold text-green-400">${
                          skill.name
                        }</h5>
                        <span class="text-xs text-slate-400">${
                          skill.importance
                        } Priority</span>
                    </div>
                    <div class="skill-level">
                        <span class="text-xs text-slate-400">Proficiency:</span>
                        <div class="skill-dots">
                            ${Array.from(
                              { length: 5 },
                              (_, i) =>
                                `<div class="skill-dot ${
                                  i < skill.level ? "active" : ""
                                }"></div>`
                            ).join("")}
                        </div>
                    </div>
                </div>
            `
        )
        .join("");
    }

    if (skillsNeedContainer) {
      skillsNeedContainer.innerHTML = data.missingSkills
        .map(
          (skill, index) => `
                <div class="skill-card need slide-in" style="animation-delay: ${
                  index * 0.1
                }s">
                    <div class="flex justify-between items-center mb-2">
                        <h5 class="font-semibold text-red-400">${
                          skill.name
                        }</h5>
                        <span class="difficulty-tag ${skill.difficulty}">${
            skill.difficulty
          }</span>
                    </div>
                    <p class="text-slate-400 text-sm mb-2">Time to learn: ${
                      skill.timeToLearn
                    }</p>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-slate-500">${
                          skill.priority
                        } Priority</span>
                        <button class="text-orange-400 hover:text-orange-300 text-sm" onclick="window.skillAnalyzer.startLearning('${
                          skill.name
                        }')">
                            <i class="fas fa-play mr-1"></i>Start Learning
                        </button>
                    </div>
                </div>
            `
        )
        .join("");
    }
  }

  updateLearningRoadmap(data) {
    const highPriorityContainer = document.getElementById(
      "high-priority-skills"
    );
    const mediumPriorityContainer = document.getElementById(
      "medium-priority-skills"
    );
    const lowPriorityContainer = document.getElementById("low-priority-skills");

    const createLearningItem = (skill) => `
            <div class="learning-item" onclick="window.skillAnalyzer.showSkillDetails('${skill.name}')">
                <h5>${skill.name}</h5>
                <p>Essential skill for ${this.targetRole} role</p>
                <div class="learning-meta">
                    <span class="difficulty-tag ${skill.difficulty}">${skill.difficulty}</span>
                    <span class="text-slate-400">${skill.timeToLearn}</span>
                </div>
            </div>
        `;

    if (highPriorityContainer) {
      highPriorityContainer.innerHTML = data.learningPath.high
        .map(createLearningItem)
        .join("");
    }

    if (mediumPriorityContainer) {
      mediumPriorityContainer.innerHTML = data.learningPath.medium
        .map(createLearningItem)
        .join("");
    }

    if (lowPriorityContainer) {
      lowPriorityContainer.innerHTML = data.learningPath.low
        .map(createLearningItem)
        .join("");
    }
  }

  updateLearningResources(data) {
    const resourcesContainer = document.getElementById("learning-resources");
    if (!resourcesContainer) return;

    const allResources = [];
    data.missingSkills.forEach((skill) => {
      skill.resources.forEach((resource) => {
        allResources.push({
          ...resource,
          skill: skill.name,
        });
      });
    });

    // Take top 6 resources
    const topResources = allResources.slice(0, 6);

    resourcesContainer.innerHTML = topResources
      .map(
        (resource) => `
            <div class="resource-card" onclick="window.open('${
              resource.url
            }', '_blank')">
                <div class="resource-icon ${resource.type}">
                    <i class="fas fa-${this.getResourceIcon(
                      resource.type
                    )}"></i>
                </div>
                <h4 class="font-semibold text-white mb-2">${resource.name}</h4>
                <p class="text-slate-400 text-sm mb-3">For ${resource.skill}</p>
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-1">
                        <i class="fas fa-star text-yellow-400"></i>
                        <span class="text-sm text-slate-300">${
                          resource.rating
                        }</span>
                    </div>
                    <span class="text-xs text-slate-500 uppercase">${
                      resource.type
                    }</span>
                </div>
            </div>
        `
      )
      .join("");
  }

  getResourceIcon(type) {
    const iconMap = {
      course: "graduation-cap",
      tutorial: "book",
      practice: "code",
      certification: "certificate",
      video: "play-circle",
      documentation: "file-alt",
      repository: "code-branch",
      exercise: "dumbbell",
    };
    return iconMap[type] || "link";
  }

  markSkillComplete() {
    const skillInput = document.getElementById("completed-skill");
    const skillName = skillInput.value.trim();

    if (!skillName) {
      this.showStatus("Please enter a skill name.", "error");
      return;
    }

    if (this.completedSkills.includes(skillName)) {
      this.showStatus("Skill already marked as completed.", "warning");
      return;
    }

    this.completedSkills.push(skillName);
    localStorage.setItem(
      "completedSkills_syashu16",
      JSON.stringify(this.completedSkills)
    );

    skillInput.value = "";
    this.updateProgressHistory();
    this.showStatus(`Great! ${skillName} marked as completed! 🎉`, "success");

    console.log(`🎯 Skill completed: ${skillName}`);
  }

  updateProgressHistory() {
    const progressHistory = document.getElementById("progress-history");
    if (!progressHistory) return;

    if (this.completedSkills.length === 0) {
      progressHistory.innerHTML = `
                <h4 class="font-semibold text-indigo-400 mb-3">Recent Progress</h4>
                <div class="text-slate-400 text-sm">No progress tracked yet. Start learning and mark skills as completed!</div>
            `;
      return;
    }

    const recentSkills = this.completedSkills.slice(-5).reverse();
    progressHistory.innerHTML = `
            <h4 class="font-semibold text-indigo-400 mb-3">Recent Progress</h4>
            ${recentSkills
              .map(
                (skill) => `
                <div class="progress-item">
                    <div>
                        <div class="skill-name">${skill}</div>
                        <div class="completion-date">Completed recently</div>
                    </div>
                    <i class="fas fa-check-circle text-green-400"></i>
                </div>
            `
              )
              .join("")}
        `;
  }

  loadProgress() {
    this.updateProgressHistory();
  }

  async startLearning(skillName) {
    console.log(`🚀 Starting to learn: ${skillName}`);
    this.showStatus(`Loading learning resources for ${skillName}...`, "info");

    try {
      // Fetch learning resources for the specific skill
      const resources = await this.getResourcesForSkill(skillName);

      if (resources && resources.length > 0) {
        // Show the learning resources section
        this.displayLearningResourcesForSkill(skillName, resources);
        this.showStatus(
          `Found ${resources.length} learning resources for ${skillName}! Scroll down to view them.`,
          "success"
        );

        // Scroll to learning resources section
        const resourcesSection = document.getElementById("learning-resources");
        if (resourcesSection) {
          resourcesSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } else {
        this.showStatus(
          `No learning resources found for ${skillName}. Try a different skill name.`,
          "warning"
        );
      }
    } catch (error) {
      console.error("Error loading learning resources:", error);
      this.showStatus(
        `Error loading resources for ${skillName}. Please try again.`,
        "error"
      );
    }
  }

  displayLearningResourcesForSkill(skillName, resources) {
    const resourcesContainer = document.getElementById("learning-resources");
    if (!resourcesContainer) return;

    // Clear existing resources and show new ones
    resourcesContainer.innerHTML = `
            <div class="text-center mb-6">
                <h3 class="text-xl font-bold text-white mb-2">Learning Resources for ${skillName}</h3>
                <p class="text-slate-400">Click any resource to start learning</p>
            </div>
            ${resources
              .map(
                (resource) => `
                <div class="resource-card hover:scale-105 transition-transform" onclick="window.open('${
                  resource.url
                }', '_blank')">
                    <div class="resource-icon ${resource.type}">
                        <i class="fas fa-${this.getResourceIcon(
                          resource.type
                        )}"></i>
                    </div>
                    <h4 class="font-semibold text-white mb-2">${
                      resource.name
                    }</h4>
                    <p class="text-slate-400 text-sm mb-3">${
                      resource.description || "Learn " + skillName
                    }</p>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-1">
                            <i class="fas fa-star text-yellow-400"></i>
                            <span class="text-sm text-slate-300">${
                              resource.rating || "4.5"
                            }</span>
                        </div>
                        <div class="flex items-center gap-2">
                            ${
                              resource.free
                                ? '<span class="text-xs bg-green-600 px-2 py-1 rounded">FREE</span>'
                                : ""
                            }
                            <span class="text-xs text-slate-500 uppercase">${
                              resource.type
                            }</span>
                        </div>
                    </div>
                    <div class="mt-2">
                        <span class="text-xs bg-blue-600 px-2 py-1 rounded">${
                          resource.platform || "Online"
                        }</span>
                    </div>
                </div>
            `
              )
              .join("")}
        `;
  }

  showSkillDetails(skillName) {
    console.log(`📋 Showing details for: ${skillName}`);
    // TODO: Implement skill details modal/page
    this.showStatus(
      `Skill details for ${skillName} - Feature coming soon!`,
      "info"
    );
  }

  exportAnalysis(format) {
    if (!this.analysisResults) {
      this.showStatus(
        "No analysis to export. Please run an analysis first.",
        "warning"
      );
      return;
    }

    if (format === "pdf") {
      // TODO: Implement PDF export
      this.showStatus("PDF export feature coming soon!", "info");
      console.log("📄 Exporting analysis as PDF");
    }
  }

  exportToCalendar() {
    if (!this.analysisResults) {
      this.showStatus(
        "No learning plan to export. Please run an analysis first.",
        "warning"
      );
      return;
    }

    this.showStatus("Calendar export feature coming soon!", "info");
    console.log("📅 Exporting learning plan to calendar");
  }

  shareProgress() {
    if (!this.analysisResults) {
      this.showStatus(
        "No progress to share. Please run an analysis first.",
        "warning"
      );
      return;
    }

    // Create shareable text
    const shareText = `🎯 My LakshyaAI Skill Analysis Results:
• Target Role: ${this.analysisResults.targetRole}
• Job Readiness: ${this.analysisResults.readinessScore}%
• Skills Matched: ${this.analysisResults.skillsMatched}/${this.analysisResults.skillsTotal}
• Skills to Learn: ${this.analysisResults.skillsMissing}

Powered by LakshyaAI Career Platform 🚀`;

    if (navigator.share) {
      navigator.share({
        title: "My Skill Gap Analysis Results",
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      this.showStatus("Results copied to clipboard!", "success");
    }

    console.log("📤 Sharing progress results");
  }

  showDemoResults() {
    // Fallback demo results
    const demoData = this.generateAnalysisResults();
    this.analysisResults = demoData;
    this.displayResults(demoData);
  }

  showStatus(message, type = "info") {
    const statusElement = document.getElementById("analysis-status");
    if (!statusElement) return;

    statusElement.textContent = message;
    statusElement.className = `text-center text-sm status-${type}`;

    console.log(`📢 Status: ${message} (${type})`);
  }

  async checkAIStatus() {
    try {
      const response = await fetch("/api/ai-status");
      const data = await response.json();

      const statusElement = document.getElementById("ai-status");
      if (statusElement) {
        if (data.status === "online") {
          statusElement.textContent = "AI Analyzing";
          statusElement.className = "text-orange-400 text-sm font-semibold";
        } else {
          statusElement.textContent = "AI Offline";
          statusElement.className = "text-yellow-400 text-sm font-semibold";
        }
      }
    } catch (error) {
      console.log("⚠️ Could not check AI status");
    }
  }

  loadResumeData() {
    // Check if resume analysis data is available from localStorage
    try {
      const resumeData = localStorage.getItem("resumeAnalysisData");
      if (resumeData) {
        const analysisData = JSON.parse(resumeData);
        console.log("📋 Found resume analysis data:", analysisData);

        // Auto-populate form fields
        this.populateFormWithResumeData(analysisData);

        // Show notification
        this.showStatus(
          '📋 Resume data loaded! Click "Analyze Gap" to get personalized recommendations.',
          "info"
        );
      }
    } catch (error) {
      console.log("⚠️ Could not load resume data:", error);
    }
  }

  populateFormWithResumeData(analysisData) {
    // Extract skills from analysis data
    let skillsArray = [];
    if (analysisData.skills && typeof analysisData.skills === "object") {
      // Flatten all skill categories
      Object.keys(analysisData.skills).forEach((category) => {
        if (Array.isArray(analysisData.skills[category])) {
          skillsArray = skillsArray.concat(analysisData.skills[category]);
        }
      });
    }

    // Add additional skills
    if (analysisData.additional_skills) {
      const additionalSkills = analysisData.additional_skills
        .split(",")
        .map((s) => s.trim());
      skillsArray = skillsArray.concat(additionalSkills);
    }

    // Remove duplicates and capitalize
    skillsArray = [...new Set(skillsArray)].map(
      (skill) => skill.charAt(0).toUpperCase() + skill.slice(1)
    );

    // Populate current skills field
    const currentSkillsField = document.getElementById("current-skills");
    if (currentSkillsField && skillsArray.length > 0) {
      currentSkillsField.value = skillsArray.join(", ");
      this.userSkills = skillsArray;
    }

    // Populate target role if available
    const targetRoleField = document.getElementById("target-role");
    if (targetRoleField && analysisData.target_role) {
      targetRoleField.value = analysisData.target_role;
      this.targetRole = analysisData.target_role;
    } else if (targetRoleField && analysisData.category) {
      // Use detected category as target role
      targetRoleField.value = `Senior ${analysisData.category}`;
      this.targetRole = `Senior ${analysisData.category}`;
    }

    // Set experience level based on analysis
    const experienceField = document.getElementById("experience-level");
    if (experienceField && analysisData.predicted_experience) {
      const experience = analysisData.predicted_experience;
      if (experience < 1) {
        experienceField.value = "entry";
      } else if (experience < 3) {
        experienceField.value = "junior";
      } else if (experience < 7) {
        experienceField.value = "mid";
      } else {
        experienceField.value = "senior";
      }
      this.experienceLevel = experienceField.value;
    }

    // Show resume analysis summary
    this.showResumeAnalysisSummary(analysisData);
  }

  showResumeAnalysisSummary(analysisData) {
    // Create summary card showing resume analysis results
    const summaryHTML = `
            <div class="glass-card rounded-2xl p-6 mb-6 border border-green-500/30 bg-green-500/10">
                <h3 class="text-lg font-bold text-green-400 mb-3">
                    <i class="fas fa-file-alt mr-2"></i>Resume Analysis Summary
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-400">${Math.round(
                          analysisData.match_score || 0
                        )}%</div>
                        <div class="text-xs text-slate-400">Match Score</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-400">${
                          analysisData.total_skills_count || 0
                        }</div>
                        <div class="text-xs text-slate-400">Skills Found</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-400">${
                          analysisData.category || "Tech"
                        }</div>
                        <div class="text-xs text-slate-400">Category</div>
                    </div>
                </div>
                <p class="text-slate-300 text-sm">
                    <i class="fas fa-info-circle mr-2"></i>
                    Your resume has been pre-analyzed. The form below is populated with your skills and experience. 
                    Modify the target role if needed, then click "Analyze Gap" for personalized recommendations.
                </p>
            </div>
        `;

    // Insert summary before the analysis form
    const formContainer =
      document.querySelector(".role-analysis-form") ||
      document.querySelector("form");
    if (formContainer) {
      formContainer.insertAdjacentHTML("beforebegin", summaryHTML);
    }
  }

  showStatus(message, type = "info") {
    // Create or update status message
    let statusDiv = document.getElementById("resume-status");
    if (!statusDiv) {
      statusDiv = document.createElement("div");
      statusDiv.id = "resume-status";
      statusDiv.className = "fixed top-4 right-4 z-50 max-w-md";
      document.body.appendChild(statusDiv);
    }

    const colorClasses = {
      info: "bg-blue-500/20 border-blue-500/30 text-blue-300",
      success: "bg-green-500/20 border-green-500/30 text-green-300",
      error: "bg-red-500/20 border-red-500/30 text-red-300",
    };

    statusDiv.innerHTML = `
            <div class="glass-card rounded-xl p-4 border ${
              colorClasses[type] || colorClasses.info
            }">
                <p class="text-sm font-medium">${message}</p>
            </div>
        `;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusDiv.style.opacity = "0";
      setTimeout(() => statusDiv.remove(), 300);
    }, 5000);
  }
}

// Initialize Skill Gap Analyzer when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log(
    "🎯 LakshyaAI Skill Gap Analysis loaded - User: syashu16 - 2025-08-05 13:42:11"
  );
  window.skillAnalyzer = new SkillGapAnalyzer();
});
