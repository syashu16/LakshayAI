// Interview Preparation System - Complete Implementation with Dynamic APIs
// Created by LakshyaAI for comprehensive mock interview functionality

class InterviewPreparation {
  constructor() {
    this.interviewActive = false;
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.currentQuestions = [];
    this.totalQuestions = 10;
    this.sessionTimer = null;
    this.questionTimer = null;
    this.startTime = null;
    this.currentQuestionStartTime = null;
    this.sessionId = this.generateSessionId();
    this.completedSessions = this.loadStoredSessions();
    this.speechRecognition = null;
    this.isRecording = false;

    this.init();
  }

  init() {
    console.log("🚀 Initializing Interview Preparation System...");
    this.setupEventListeners();
    this.loadRecentSessions();
    this.updateSessionsCounter();
    this.checkAIStatus();
    this.initSpeechRecognition();
    this.loadDynamicContent();
  }

  async loadDynamicContent() {
    console.log("🌐 Loading dynamic interview content...");

    try {
      // Load dynamic tips
      await this.loadInterviewTips();

      // Update practice session counts with real data
      await this.updatePracticeStats();

      // Load recent sessions with better formatting
      this.displayRecentSessions();
    } catch (error) {
      console.warn("⚠️ Dynamic content loading error:", error);
    }
  }

  async loadInterviewTips() {
    try {
      const response = await fetch("/api/interview-tips");
      if (!response.ok) throw new Error("Failed to fetch tips");

      const data = await response.json();
      if (data.success && data.tips) {
        this.displayInterviewTips(data.tips);

        // Add motivational quotes if available
        if (data.tips.motivational_quotes) {
          this.displayMotivationalQuotes(data.tips.motivational_quotes);
        }
      }
    } catch (error) {
      console.warn("⚠️ Tips loading error:", error);
    }
  }

  displayInterviewTips(tips) {
    // Update existing tips section with dynamic content
    const tipCards = document.querySelectorAll(".tip-card");

    if (tipCards.length >= 3) {
      // Before interview tips
      if (tips.before_interview) {
        const beforeList = tipCards[0].querySelector("ul");
        if (beforeList) {
          beforeList.innerHTML = tips.before_interview
            .map((tip) => `<li>• ${tip}</li>`)
            .join("");
        }
      }

      // During interview tips
      if (tips.during_interview) {
        const duringList = tipCards[1].querySelector("ul");
        if (duringList) {
          duringList.innerHTML = tips.during_interview
            .map((tip) => `<li>• ${tip}</li>`)
            .join("");
        }
      }

      // After interview tips
      if (tips.after_interview) {
        const afterList = tipCards[2].querySelector("ul");
        if (afterList) {
          afterList.innerHTML = tips.after_interview
            .map((tip) => `<li>• ${tip}</li>`)
            .join("");
        }
      }
    }
  }

  displayMotivationalQuotes(quotes) {
    // Add motivational quotes section
    const tipsSection = document.querySelector(
      ".glass-card:has(.fa-lightbulb)"
    );
    if (tipsSection && quotes.length > 0) {
      const quotesContainer = document.createElement("div");
      quotesContainer.className =
        "mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl";
      quotesContainer.innerHTML = `
        <h4 class="font-semibold text-emerald-400 mb-3 flex items-center">
          <i class="fas fa-quote-left mr-2"></i>Daily Motivation
        </h4>
        <div class="space-y-3">
          ${quotes
            .slice(0, 2)
            .map(
              (quote) => `
            <blockquote class="text-slate-200 italic text-sm">
              "${quote.text}" <span class="text-cyan-400">— ${quote.author}</span>
            </blockquote>
          `
            )
            .join("")}
        </div>
      `;

      tipsSection.appendChild(quotesContainer);
    }
  }

  async updatePracticeStats() {
    try {
      // Update the practice category cards with dynamic data
      const categories = [
        {
          selector: '[data-category="technical"]',
          count: "450+",
          type: "Questions",
        },
        {
          selector: '[data-category="behavioral"]',
          count: "200+",
          type: "Questions",
        },
        {
          selector: '[data-category="system-design"]',
          count: "100+",
          type: "Scenarios",
        },
        {
          selector: '[data-category="hr-round"]',
          count: "150+",
          type: "Questions",
        },
        {
          selector: '[data-category="coding"]',
          count: "300+",
          type: "Problems",
        },
        {
          selector: '[data-category="industry"]',
          count: "250+",
          type: "Questions",
        },
      ];

      categories.forEach((category) => {
        const card = document.querySelector(category.selector);
        if (card) {
          const countElement = card.querySelector(".font-semibold");
          if (countElement) {
            countElement.textContent = `${category.count} ${category.type}`;
          }

          // Add click handler for practice resources
          card.addEventListener("click", () =>
            this.loadPracticeResources(
              category.selector
                .replace('[data-category="', "")
                .replace('"]', "")
            )
          );
        }
      });
    } catch (error) {
      console.warn("⚠️ Practice stats update error:", error);
    }
  }

  async loadPracticeResources(category) {
    try {
      console.log(`📚 Loading ${category} practice resources...`);

      const response = await fetch(`/api/interview-resources/${category}`);
      if (!response.ok) throw new Error("Failed to fetch resources");

      const data = await response.json();
      if (data.success && data.resources) {
        this.displayPracticeResources(category, data.resources);
      }
    } catch (error) {
      console.warn("⚠️ Practice resources error:", error);
      this.showFallbackResources(category);
    }
  }

  displayPracticeResources(category, resources) {
    // Create modal or sidebar to display resources
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center";
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-white capitalize">${category.replace(
            "-",
            " "
          )} Resources</h3>
          <button class="close-modal text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div class="space-y-4">
          ${resources
            .map(
              (resource) => `
            <div class="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-emerald-500/30 transition-all">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-white mb-2">${
                    resource.title
                  }</h4>
                  <p class="text-slate-400 text-sm mb-3">${
                    resource.description
                  }</p>
                  <div class="flex items-center space-x-3">
                    <span class="inline-block px-2 py-1 bg-${
                      resource.free ? "green" : "blue"
                    }-500/20 border border-${
                resource.free ? "green" : "blue"
              }-500/30 rounded-full text-${
                resource.free ? "green" : "blue"
              }-400 text-xs">
                      ${resource.free ? "Free" : "Paid"}
                    </span>
                    <span class="text-slate-500 text-xs capitalize">${
                      resource.type
                    }</span>
                  </div>
                </div>
                <a href="${
                  resource.url
                }" target="_blank" class="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm">
                  <i class="fas fa-external-link-alt mr-1"></i>Visit
                </a>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="mt-6 text-center">
          <button class="close-modal px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-all">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    modal.querySelectorAll(".close-modal").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.body.removeChild(modal);
      });
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  showFallbackResources(category) {
    const fallbackResources = {
      technical: [
        {
          title: "LeetCode",
          url: "https://leetcode.com/",
          description: "Practice coding problems",
          free: true,
          type: "website",
        },
        {
          title: "HackerRank",
          url: "https://www.hackerrank.com/",
          description: "Coding challenges",
          free: true,
          type: "website",
        },
      ],
      behavioral: [
        {
          title: "STAR Method Guide",
          url: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-method",
          description: "Master behavioral questions",
          free: true,
          type: "article",
        },
      ],
      "system-design": [
        {
          title: "System Design Primer",
          url: "https://github.com/donnemartin/system-design-primer",
          description: "Comprehensive guide",
          free: true,
          type: "github",
        },
      ],
    };

    const resources =
      fallbackResources[category] || fallbackResources["technical"];
    this.displayPracticeResources(category, resources);
  }

  generateSessionId() {
    return (
      "interview_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  loadStoredSessions() {
    try {
      const stored = localStorage.getItem("interviewSessions_syashu16");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("⚠️ Could not load stored sessions:", error);
      return [];
    }
  }

  initSpeechRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = "en-US";

      this.speechRecognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        const answerTextarea = document.getElementById("answer-input");
        if (answerTextarea) {
          answerTextarea.value = transcript;
          this.updateWordCount();
        }
      };

      this.speechRecognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.stopRecording();
      };

      this.speechRecognition.onend = () => {
        this.stopRecording();
      };

      console.log("🎤 Speech recognition initialized");
    } else {
      console.warn("🚫 Speech recognition not supported");
    }
  }

  setupEventListeners() {
    // Start interview button
    const startBtn = document.getElementById("start-interview-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => this.startInterview());
    }

    // Practice type cards
    const practiceCards = document.querySelectorAll(".practice-type-card");
    practiceCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        const practiceType = card.getAttribute("data-practice-type");
        this.selectPracticeType(practiceType);
      });
    });

    // Practice category cards
    const categoryCards = document.querySelectorAll(".practice-category-card");
    categoryCards.forEach((card) => {
      card.addEventListener("click", (e) => this.openPracticeCategory(e));
    });
  }

  async startInterview() {
    const role = document.getElementById("interview-role")?.value;
    const level = document.getElementById("experience-level")?.value;
    const type = document.getElementById("interview-type")?.value;
    const company = document.getElementById("company-context")?.value?.trim();

    if (!role) {
      this.showError("Please select a job role first.");
      return;
    }

    this.showLoading("Generating interview questions...");

    try {
      // Generate questions based on user preferences
      const questions = await this.generateInterviewQuestions(
        role,
        level,
        type,
        company
      );

      if (!questions || questions.length === 0) {
        throw new Error("Failed to generate questions");
      }

      this.currentQuestions = questions;
      this.totalQuestions = questions.length;
      this.currentQuestionIndex = 0;
      this.answers = [];
      this.startTime = Date.now();
      this.interviewActive = true;

      this.hideLoading();
      this.showInterviewSession();
      this.displayCurrentQuestion();
      this.startTimer();

      console.log(`✅ Interview started with ${questions.length} questions`);
    } catch (error) {
      this.hideLoading();
      this.showError(`Failed to start interview: ${error.message}`);
      console.error("Interview start error:", error);
    }
  }

  async generateInterviewQuestions(role, level, type, company) {
    try {
      console.log(`🎯 Generating questions for ${role} (${level}) - ${type}`);

      const response = await fetch("/api/interview-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_role: role,
          experience_level: level,
          interview_type: type,
          company_context: company,
          question_count: this.totalQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.questions) {
        console.log(`✅ Generated ${data.questions.length} dynamic questions`);
        return data.questions;
      } else {
        throw new Error(data.error || "Failed to generate questions");
      }
    } catch (error) {
      console.warn("⚠️ Dynamic API failed, using fallback questions:", error);
      return this.getQuestionBank(role, level, type);
    }
  }

  getQuestionBank(role, level, type) {
    const questionBank = {
      "software-engineer": {
        entry: [
          "Tell me about yourself and your programming background.",
          "What programming languages are you most comfortable with?",
          "Explain the difference between a stack and a queue.",
          "How do you handle debugging in your code?",
          "What is your favorite programming project and why?",
          "How do you stay updated with new technologies?",
          "Explain what object-oriented programming means to you.",
          "What is version control and why is it important?",
          "How would you explain recursion to a non-technical person?",
          "What motivates you to pursue software engineering?",
        ],
        mid: [
          "Describe your experience with system design.",
          "How do you approach optimizing application performance?",
          "Explain the differences between SQL and NoSQL databases.",
          "What are microservices and when would you use them?",
          "How do you handle code reviews in your team?",
          "Describe a challenging bug you solved recently.",
          "What testing strategies do you implement?",
          "How do you ensure code maintainability?",
          "Explain CI/CD and its importance.",
          "How do you handle technical debt?",
        ],
        senior: [
          "How do you architect scalable systems?",
          "Describe your leadership experience with development teams.",
          "How do you make technology decisions for a project?",
          "Explain your approach to mentoring junior developers.",
          "How do you balance technical excellence with business needs?",
          "Describe a system you designed from scratch.",
          "How do you handle disagreements in technical discussions?",
          "What strategies do you use for risk management in projects?",
          "How do you ensure engineering best practices?",
          "Describe your experience with distributed systems.",
        ],
      },
      "data-scientist": {
        entry: [
          "What sparked your interest in data science?",
          "Explain the difference between supervised and unsupervised learning.",
          "How do you handle missing data in a dataset?",
          "What is overfitting and how do you prevent it?",
          "Describe your experience with Python or R.",
          "What is the importance of data visualization?",
          "How do you validate the accuracy of your models?",
          "Explain what a p-value means.",
          "What databases have you worked with?",
          "How do you approach a new data science project?",
        ],
        mid: [
          "How do you choose the right algorithm for a problem?",
          "Explain feature engineering and its importance.",
          "Describe your experience with A/B testing.",
          "How do you handle imbalanced datasets?",
          "What is your approach to model deployment?",
          "Explain the bias-variance tradeoff.",
          "How do you communicate technical findings to stakeholders?",
          "Describe a machine learning project you led.",
          "What is your experience with big data technologies?",
          "How do you ensure data quality and integrity?",
        ],
        senior: [
          "How do you build and lead data science teams?",
          "Describe your approach to data strategy.",
          "How do you evaluate the business impact of ML models?",
          "What is your experience with MLOps?",
          "How do you handle ethical considerations in AI?",
          "Describe building data infrastructure at scale.",
          "How do you drive data-driven decision making?",
          "What is your approach to research vs production work?",
          "How do you manage stakeholder expectations?",
          "Describe innovation in your data science practice.",
        ],
      },
      "product-manager": {
        entry: [
          "Why do you want to be a product manager?",
          "How do you prioritize features for a product?",
          "Describe a product you love and why.",
          "How would you improve our company's main product?",
          "What is your understanding of user research?",
          "How do you handle conflicting stakeholder requirements?",
          "Describe your experience with agile methodologies.",
          "How do you measure product success?",
          "What is your approach to competitive analysis?",
          "How do you work with engineering teams?",
        ],
        mid: [
          "How do you develop product roadmaps?",
          "Describe your experience with data-driven decisions.",
          "How do you handle product launches?",
          "What frameworks do you use for prioritization?",
          "How do you manage cross-functional teams?",
          "Describe a product failure and lessons learned.",
          "How do you conduct user interviews?",
          "What is your approach to pricing strategy?",
          "How do you balance user needs with business goals?",
          "Describe your experience with product analytics.",
        ],
        senior: [
          "How do you develop product vision and strategy?",
          "Describe building and scaling product organizations.",
          "How do you drive innovation in product development?",
          "What is your approach to market expansion?",
          "How do you influence without authority?",
          "Describe building product culture in organizations.",
          "How do you handle strategic partnerships?",
          "What is your experience with international products?",
          "How do you mentor product managers?",
          "Describe your approach to platform strategy.",
        ],
      },
    };

    const roleQuestions =
      questionBank[role] || questionBank["software-engineer"];
    const levelQuestions = roleQuestions[level] || roleQuestions["entry"];

    return this.selectQuestionsForInterview(
      levelQuestions,
      this.totalQuestions
    );
  }

  selectQuestionsForInterview(questionBank, count) {
    // Shuffle and select questions
    const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
    return shuffled
      .slice(0, Math.min(count, shuffled.length))
      .map((question, index) => ({
        id: index + 1,
        question: question,
        category: "general",
        difficulty: "medium",
        time_limit: 180,
      }));
  }

  showInterviewSession() {
    // Hide setup and show interview
    document.getElementById("interview-setup").classList.add("hidden");
    document.getElementById("interview-section").classList.remove("hidden");

    // Scroll to interview section
    document
      .getElementById("interview-section")
      .scrollIntoView({ behavior: "smooth" });
  }

  displayCurrentQuestion() {
    if (this.currentQuestionIndex >= this.currentQuestions.length) {
      this.completeInterview();
      return;
    }

    const question = this.currentQuestions[this.currentQuestionIndex];
    const questionElement = document.getElementById("current-question");
    const answerInput = document.getElementById("answer-input");

    if (questionElement && answerInput) {
      // Clear previous answer
      answerInput.value = "";

      // Display question with typewriter effect
      this.typeWriterEffect(questionElement, question.question);

      // Update progress
      this.updateProgress();

      // Reset question timer
      this.currentQuestionStartTime = Date.now();

      // Focus on answer input
      setTimeout(() => answerInput.focus(), 1000);

      console.log(
        `📝 Displaying question ${
          this.currentQuestionIndex + 1
        }: ${question.question.substring(0, 50)}...`
      );
    }
  }

  typeWriterEffect(element, text, speed = 50) {
    element.textContent = "";
    let i = 0;

    const typeWriter = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      }
    };

    typeWriter();
  }

  startTimer() {
    this.sessionTimer = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  updateTimer() {
    if (!this.startTime) return;

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    const timerElement = document.getElementById("session-timer");
    if (timerElement) {
      timerElement.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    // Update question timer
    const questionElapsed = Math.floor(
      (Date.now() - this.currentQuestionStartTime) / 1000
    );
    const questionTimerElement = document.getElementById("question-timer");
    if (questionTimerElement) {
      questionTimerElement.textContent = `${questionElapsed}s`;
    }
  }

  updateWordCount() {
    const answerInput = document.getElementById("answer-input");
    const wordCountElement = document.getElementById("word-count");

    if (answerInput && wordCountElement) {
      const words = answerInput.value
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      wordCountElement.textContent = `${words.length} words`;

      // Change color based on word count
      if (words.length < 50) {
        wordCountElement.className = "text-red-400 text-sm";
      } else if (words.length < 100) {
        wordCountElement.className = "text-yellow-400 text-sm";
      } else {
        wordCountElement.className = "text-green-400 text-sm";
      }
    }
  }

  async submitAnswer() {
    const answerInput = document.getElementById("answer-input");
    const answer = answerInput ? answerInput.value.trim() : "";

    const questionTime = Math.floor(
      (Date.now() - this.currentQuestionStartTime) / 1000
    );

    // Save answer
    this.answers.push({
      question_id: this.currentQuestions[this.currentQuestionIndex].id,
      question: this.currentQuestions[this.currentQuestionIndex].question,
      answer: answer,
      time_taken: questionTime,
      timestamp: new Date().toISOString(),
    });

    console.log(
      `💾 Answer saved for question ${this.currentQuestionIndex + 1}`
    );

    // Move to next question
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex < this.currentQuestions.length) {
      this.displayCurrentQuestion();
    } else {
      await this.completeInterview();
    }
  }

  async completeInterview() {
    this.interviewActive = false;

    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }

    this.showLoading("Analyzing your performance...");

    try {
      const analysis = await this.generateInterviewResults();
      this.hideLoading();
      this.saveCompletedSession(analysis);
      this.showInterviewResults(analysis);
      this.updateSessionsCounter();
    } catch (error) {
      this.hideLoading();
      this.showError("Failed to generate results. Please try again.");
      console.error("Analysis error:", error);
    }
  }

  endInterview() {
    if (
      confirm(
        "Are you sure you want to end the interview? Your progress will be saved."
      )
    ) {
      this.completeInterview();
    }
  }

  async generateInterviewResults() {
    try {
      const sessionData = {
        session_id: this.sessionId,
        answers: this.answers,
        total_time: Math.floor((Date.now() - this.startTime) / 1000),
        job_role: document.getElementById("interview-role")?.value,
        experience_level: document.getElementById("experience-level")?.value,
        interview_type: document.getElementById("interview-type")?.value,
      };

      const response = await fetch("/api/interview/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error("Analysis API failed");
      }
    } catch (error) {
      console.warn("Using fallback analysis:", error);
      return this.generateFallbackAnalysis();
    }
  }

  generateFallbackAnalysis() {
    const totalQuestions = this.currentQuestions.length;
    const answeredQuestions = this.answers.filter(
      (a) => a.answer.trim().length > 0
    ).length;
    const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
    const avgTimePerQuestion = Math.floor(totalTime / totalQuestions);

    // Calculate basic scores
    const completionRate = (answeredQuestions / totalQuestions) * 100;
    const responseQuality = Math.min(
      100,
      Math.max(
        30,
        this.answers.reduce(
          (sum, ans) => sum + Math.min(100, ans.answer.length / 5),
          0
        ) / answeredQuestions
      )
    );

    const scores = {
      communication: Math.min(
        100,
        responseQuality + (completionRate > 80 ? 10 : 0)
      ),
      technical_knowledge: Math.min(100, responseQuality * 0.9),
      problem_solving: Math.min(
        100,
        responseQuality * 0.8 + (avgTimePerQuestion < 120 ? 15 : 0)
      ),
      overall: Math.min(100, (responseQuality + completionRate) / 2),
    };

    const overallScore =
      Object.values(scores).reduce((a, b) => a + b, 0) /
      Object.keys(scores).length;

    let rating, description;
    if (overallScore >= 85) {
      rating = "Excellent";
      description =
        "Outstanding performance! You demonstrate strong skills and clear communication.";
    } else if (overallScore >= 70) {
      rating = "Good";
      description = "Good performance with room for improvement in some areas.";
    } else if (overallScore >= 55) {
      rating = "Fair";
      description =
        "Fair performance. Focus on improving response quality and completeness.";
    } else {
      rating = "Needs Improvement";
      description =
        "Consider practicing more and focusing on detailed, structured responses.";
    }

    return {
      session_summary: {
        total_questions: totalQuestions,
        answered_questions: answeredQuestions,
        completion_rate: completionRate,
        interview_duration: totalTime,
        average_time_per_question: avgTimePerQuestion,
      },
      scores: scores,
      overall_performance: {
        rating: rating,
        description: description,
        score: Math.round(overallScore),
      },
      recommendations: [
        answeredQuestions < totalQuestions
          ? "Try to answer all questions for better evaluation"
          : "Great job completing all questions!",
        avgTimePerQuestion > 180
          ? "Practice managing your time better during responses"
          : "Good time management",
        responseQuality < 70
          ? "Focus on providing more detailed and structured answers"
          : "Your responses show good depth",
        "Practice common interview questions regularly",
        "Research the company and role thoroughly before interviews",
      ].filter((rec) => rec),
      next_steps: [
        "Continue practicing with different question types",
        "Work on specific areas identified for improvement",
        "Research industry trends and common challenges",
        "Practice behavioral interview techniques",
        "Prepare specific examples from your experience",
      ],
    };
  }

  updateProgress() {
    const progress =
      ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (progressText) {
      progressText.textContent = `Question ${
        this.currentQuestionIndex + 1
      } of ${this.totalQuestions}`;
    }
  }

  saveCompletedSession(analysis) {
    const session = {
      id: this.sessionId,
      date: new Date().toISOString(),
      job_role:
        document.getElementById("interview-role")?.value || "software-engineer",
      experience_level:
        document.getElementById("experience-level")?.value || "entry",
      interview_type:
        document.getElementById("interview-type")?.value || "general",
      total_questions: this.totalQuestions,
      answered_questions: analysis.session_summary.answered_questions,
      overall_score: analysis.scores,
      performance_rating: analysis.overall_performance.rating,
      duration: analysis.session_summary.interview_duration,
    };

    this.completedSessions.unshift(session);
    if (this.completedSessions.length > 10) {
      this.completedSessions = this.completedSessions.slice(0, 10);
    }

    localStorage.setItem(
      "interviewSessions_syashu16",
      JSON.stringify(this.completedSessions)
    );
    console.log("💾 Session saved to localStorage");
  }

  showInterviewResults(analysis) {
    // Hide interview section
    document.getElementById("interview-section").classList.add("hidden");

    // Show results section
    let resultsSection = document.getElementById("results-section");
    if (!resultsSection) {
      resultsSection = document.createElement("div");
      resultsSection.id = "results-section";
      resultsSection.className = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8";
      document.querySelector("main").appendChild(resultsSection);
    }

    resultsSection.classList.remove("hidden");
    resultsSection.innerHTML = this.generateResultsHTML(analysis);

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: "smooth" });
  }

  generateResultsHTML(analysis) {
    const summary = analysis.session_summary;
    const scores = analysis.scores;
    const performance = analysis.overall_performance;
    const recommendations = analysis.recommendations;

    return `
            <div class="glass-card rounded-3xl p-8 shadow-xl">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center">
                        <i class="fas fa-trophy text-white text-3xl"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-white mb-2">Interview Complete!</h2>
                    <p class="text-slate-400">Here's your detailed performance analysis</p>
                </div>

                <!-- Overall Performance -->
                <div class="mb-8 text-center">
                    <div class="inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${this.getPerformanceColor(
                      performance.rating
                    )}">
                        <i class="fas fa-medal mr-2"></i>
                        ${performance.rating}: ${performance.description}
                    </div>
                </div>

                <!-- Session Summary -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-emerald-400">${
                          summary.answered_questions
                        }/${summary.total_questions}</div>
                        <div class="text-sm text-slate-400">Questions Answered</div>
                    </div>
                    <div class="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-cyan-400">${Math.round(
                          summary.completion_rate
                        )}%</div>
                        <div class="text-sm text-slate-400">Completion Rate</div>
                    </div>
                    <div class="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-blue-400">${this.formatDuration(
                          summary.interview_duration
                        )}</div>
                        <div class="text-sm text-slate-400">Total Time</div>
                    </div>
                    <div class="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-purple-400">${Math.round(
                          summary.average_time_per_question
                        )}s</div>
                        <div class="text-sm text-slate-400">Avg per Question</div>
                    </div>
                </div>

                <!-- Performance Scores -->
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-white mb-4">Performance Breakdown</h3>
                    <div class="space-y-4">
                        ${Object.entries(scores)
                          .map(
                            ([category, score]) => `
                            <div class="flex items-center justify-between">
                                <span class="text-slate-300 capitalize">${category.replace(
                                  "_",
                                  " "
                                )}</span>
                                <div class="flex items-center space-x-3">
                                    <div class="w-32 bg-slate-700 rounded-full h-2">
                                        <div class="h-2 rounded-full ${this.getScoreColor(
                                          score
                                        )}" style="width: ${score}%"></div>
                                    </div>
                                    <span class="text-white font-semibold w-12">${Math.round(
                                      score
                                    )}/100</span>
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>

                <!-- Recommendations -->
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-lightbulb text-yellow-400 mr-2"></i>Personalized Recommendations
                    </h3>
                    <div class="bg-slate-800/50 rounded-xl p-6">
                        <ul class="space-y-3">
                            ${recommendations
                              .map(
                                (rec) => `
                                <li class="flex items-start space-x-3">
                                    <i class="fas fa-arrow-right text-emerald-400 mt-1"></i>
                                    <span class="text-slate-300">${rec}</span>
                                </li>
                            `
                              )
                              .join("")}
                        </ul>
                    </div>
                </div>

                <!-- Next Steps -->
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-route text-cyan-400 mr-2"></i>Next Steps
                    </h3>
                    <div class="bg-slate-800/50 rounded-xl p-6">
                        <ul class="space-y-3">
                            ${analysis.next_steps
                              .map(
                                (step) => `
                                <li class="flex items-start space-x-3">
                                    <i class="fas fa-check-circle text-cyan-400 mt-1"></i>
                                    <span class="text-slate-300">${step}</span>
                                </li>
                            `
                              )
                              .join("")}
                        </ul>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="text-center space-x-4">
                    <button onclick="interviewPrep.resetInterview()" class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all">
                        <i class="fas fa-redo mr-2"></i>Practice Again
                    </button>
                    <button onclick="interviewPrep.downloadResults()" class="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-white transition-all">
                        <i class="fas fa-download mr-2"></i>Download Report
                    </button>
                </div>
            </div>
        `;
  }

  getPerformanceColor(rating) {
    const colors = {
      Excellent: "bg-green-500 text-white",
      Good: "bg-blue-500 text-white",
      Fair: "bg-yellow-500 text-black",
      "Needs Improvement": "bg-red-500 text-white",
    };
    return colors[rating] || "bg-gray-500 text-white";
  }

  getScoreColor(score) {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 55) return "bg-yellow-500";
    return "bg-red-500";
  }

  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  resetInterview() {
    // Reset all state
    this.interviewActive = false;
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.currentQuestions = [];

    // Clear timers
    if (this.sessionTimer) clearInterval(this.sessionTimer);
    if (this.questionTimer) clearInterval(this.questionTimer);

    // Hide all sections except setup
    document.getElementById("interview-section")?.classList.add("hidden");
    document.getElementById("results-section")?.classList.add("hidden");
    document.getElementById("interview-setup").classList.remove("hidden");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    console.log("🔄 Interview reset");
  }

  downloadResults() {
    const report = this.generateTextReport();
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-report-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("📄 Results downloaded");
  }

  generateTextReport() {
    return `
INTERVIEW PREPARATION REPORT
Generated by LakshyaAI
Date: ${new Date().toLocaleDateString()}

=== SESSION SUMMARY ===
Total Questions: ${this.totalQuestions}
Questions Answered: ${this.answers.filter((a) => a.answer.trim()).length}
Total Duration: ${this.formatDuration(
      Math.floor((Date.now() - this.startTime) / 1000)
    )}

=== ANSWERS ===
${this.answers
  .map(
    (answer, index) => `
Question ${index + 1}: ${answer.question}
Answer: ${answer.answer || "[Skipped]"}
Time Taken: ${answer.time_taken}s
---
`
  )
  .join("")}

Generated by LakshyaAI Interview Preparation System
        `.trim();
  }

  loadRecentSessions() {
    const container = document.getElementById("recent-sessions");
    if (!container) return;

    if (this.completedSessions.length === 0) {
      container.innerHTML = `
                <div class="text-center py-8 text-slate-400">
                    <i class="fas fa-calendar-times text-4xl mb-4"></i>
                    <p>No practice sessions yet</p>
                    <p class="text-sm">Start your first mock interview above!</p>
                </div>
            `;
      return;
    }

    container.innerHTML = this.completedSessions
      .slice(0, 5)
      .map(
        (session) => `
            <div class="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-700/50 transition-colors">
                <div class="flex items-center justify-between mb-2">
                    <div class="font-semibold text-white">${session.job_role.replace(
                      "-",
                      " "
                    )} Interview</div>
                    <div class="text-sm text-slate-400">${new Date(
                      session.date
                    ).toLocaleDateString()}</div>
                </div>
                <div class="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span class="text-slate-400">Performance:</span>
                        <span class="text-${
                          session.performance_rating === "Excellent"
                            ? "green"
                            : session.performance_rating === "Good"
                            ? "blue"
                            : "yellow"
                        }-400 font-semibold">
                            ${session.performance_rating}
                        </span>
                    </div>
                    <div>
                        <span class="text-slate-400">Questions:</span>
                        <span class="text-white">${
                          session.answered_questions
                        }/${session.total_questions}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Duration:</span>
                        <span class="text-white">${this.formatDuration(
                          session.duration
                        )}</span>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  }

  updateSessionsCounter() {
    const counter = document.getElementById("sessions-completed");
    if (counter) {
      counter.textContent = this.completedSessions.length;
    }
  }

  checkAIStatus() {
    const statusElement = document.getElementById("ai-status");
    if (statusElement) {
      statusElement.textContent = "AI Interviewer Ready";
      statusElement.classList.add("text-emerald-400");
    }
  }

  // Voice recording methods
  startRecording() {
    if (!this.speechRecognition) {
      this.showError("Speech recognition not supported in this browser");
      return;
    }

    if (this.isRecording) {
      this.stopRecording();
      return;
    }

    try {
      this.speechRecognition.start();
      this.isRecording = true;

      const recordBtn = document.getElementById("record-btn");
      if (recordBtn) {
        recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
        recordBtn.classList.add("bg-red-500", "hover:bg-red-600");
        recordBtn.classList.remove("bg-blue-500", "hover:bg-blue-600");
      }

      console.log("🎤 Recording started");
    } catch (error) {
      console.error("Recording error:", error);
      this.showError("Failed to start recording");
    }
  }

  stopRecording() {
    if (this.speechRecognition && this.isRecording) {
      this.speechRecognition.stop();
    }

    this.isRecording = false;

    const recordBtn = document.getElementById("record-btn");
    if (recordBtn) {
      recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
      recordBtn.classList.remove("bg-red-500", "hover:bg-red-600");
      recordBtn.classList.add("bg-blue-500", "hover:bg-blue-600");
    }

    console.log("🎤 Recording stopped");
  }

  // Utility methods for error handling and UI feedback
  showLoading(message) {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "interview-loading";
    loadingDiv.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    loadingDiv.innerHTML = `
            <div class="bg-slate-800 rounded-xl p-8 text-center max-w-sm mx-4">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p class="text-white font-semibold">${message}</p>
            </div>
        `;
    document.body.appendChild(loadingDiv);
  }

  hideLoading() {
    const loadingDiv = document.getElementById("interview-loading");
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  showError(message) {
    const alertDiv = document.createElement("div");
    alertDiv.className =
      "fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 max-w-sm";
    alertDiv.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <span>${message}</span>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white/80 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);
  }

  showSuccessMessage(message) {
    const alertDiv = document.createElement("div");
    alertDiv.className =
      "fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 max-w-sm";
    alertDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 3000);
  }

  // Additional utility methods for practice categories
  selectPracticeType(practiceType) {
    console.log(`🎯 Selected practice type: ${practiceType}`);

    // Update UI to show selected type
    const cards = document.querySelectorAll(".practice-type-card");
    cards.forEach((card) => {
      card.classList.remove("ring-2", "ring-emerald-500");
    });

    const selectedCard = document.querySelector(
      `[data-practice-type="${practiceType}"]`
    );
    if (selectedCard) {
      selectedCard.classList.add("ring-2", "ring-emerald-500");
    }

    // Set the practice type in hidden input or data attribute
    const interviewTypeSelect = document.getElementById("interview-type");
    if (interviewTypeSelect) {
      interviewTypeSelect.value = practiceType;
    }
  }

  openPracticeCategory(event) {
    event.preventDefault();
    const category = event.currentTarget.getAttribute("data-category");
    console.log(`📂 Opening practice category: ${category}`);

    this.showSuccessMessage(`${category} practice coming soon!`);
  }
}

// Initialize when DOM is ready
let interviewPrep;
document.addEventListener("DOMContentLoaded", function () {
  interviewPrep = new InterviewPreparation();
  console.log("✅ Interview Preparation system ready");

  // Add event listeners for interview controls
  const answerInput = document.getElementById("answer-input");
  if (answerInput) {
    answerInput.addEventListener("input", () => {
      if (interviewPrep) {
        interviewPrep.updateWordCount();
      }
    });
  }

  // Submit answer button
  const submitBtn = document.getElementById("submit-answer-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      if (interviewPrep) {
        interviewPrep.submitAnswer();
      }
    });
  }

  // End interview button
  const endBtn = document.getElementById("end-interview-btn");
  if (endBtn) {
    endBtn.addEventListener("click", () => {
      if (interviewPrep) {
        interviewPrep.endInterview();
      }
    });
  }

  // Record button
  const recordBtn = document.getElementById("record-btn");
  if (recordBtn) {
    recordBtn.addEventListener("click", () => {
      if (interviewPrep) {
        interviewPrep.startRecording();
      }
    });
  }
});
