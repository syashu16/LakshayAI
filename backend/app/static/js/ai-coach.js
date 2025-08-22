// LakshyaAI AI Career Coach JavaScript
class AICareerCoach {
  constructor() {
    this.currentUser = "syashu16";
    this.currentLanguage = "en";
    this.isVoiceRecording = false;
    this.chatHistory = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadChatHistory();
    this.initializeWelcome();
    console.log("🤖 AI Career Coach initialized for user:", this.currentUser);
  }

  setupEventListeners() {
    // Language selector
    const languageSelector = document.getElementById("language-selector");
    if (languageSelector) {
      languageSelector.addEventListener("change", (e) => {
        this.changeLanguage(e.target.value);
      });
    }

    // Quick actions
    document.querySelectorAll(".quick-action-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.handleQuickAction(btn);
      });
    });

    // Conversation topics
    document.querySelectorAll(".conversation-topic").forEach((topic) => {
      topic.addEventListener("click", () => {
        this.handleTopicClick(topic.textContent.trim());
      });
    });

    // File upload
    const fileInput = document.getElementById("hidden-file-input");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        this.handleFileUpload(e.target.files[0]);
      });
    }

    // Export chat
    const exportBtn = document.getElementById("export-chat");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        this.exportChat();
      });
    }

    // Chat input functionality
    const chatInput = document.getElementById("chat-input");
    if (chatInput) {
      // Auto-resize textarea
      chatInput.addEventListener("input", (e) => {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
        this.updateCharacterCount(e.target.value.length);
      });

      // Send message on Enter (but not Shift+Enter)
      chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // Send button
    const sendBtn = document.getElementById("send-message");
    if (sendBtn) {
      sendBtn.addEventListener("click", () => {
        this.sendMessage();
      });
    }

    // Suggestion chips
    document.querySelectorAll(".suggestion-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const text = chip.textContent
          .replace(/[🎯🚀📈💼🌟]/g, "")
          .trim()
          .replace(/"/g, "");
        const input = document.getElementById("chat-input");
        if (input) {
          input.value = text;
          input.focus();
          this.sendMessage();
        }
      });
    });

    // Voice input
    const voiceBtn = document.getElementById("voice-input");
    if (voiceBtn) {
      voiceBtn.addEventListener("click", () => {
        this.toggleVoiceInput();
      });
    }

    // File upload button
    const fileUploadBtn = document.getElementById("file-upload");
    if (fileUploadBtn) {
      fileUploadBtn.addEventListener("click", () => {
        const hiddenInput = document.getElementById("hidden-file-input");
        if (hiddenInput) {
          hiddenInput.click();
        }
      });
    }

    // Clear chat
    const clearBtn = document.getElementById("clear-chat");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear the chat history?")) {
          this.clearChat();
        }
      });
    }
  }

  changeLanguage(lang) {
    this.currentLanguage = lang;
    this.updateUILanguage(lang);
    this.addSystemMessage(this.getLanguageMessage(lang));
  }

  getLanguageMessage(lang) {
    const messages = {
      en: "Language switched to English! How can I help you today? 🇺🇸",
      hi: "भाषा हिंदी में बदल दी गई! आज मैं आपकी कैसे मदद कर सकता हूं? 🇮🇳",
      hinglish:
        "Language Hinglish mein switch ho gayi! Aaj main aapki kaise help kar sakta hun? 🇮🇳",
      es: "¡Idioma cambiado al español! ¿Cómo puedo ayudarte hoy? 🇪🇸",
      fr: "Langue changée en français! Comment puis-je vous aider aujourd'hui? 🇫🇷",
    };
    return messages[lang] || messages["en"];
  }

  updateUILanguage(lang) {
    const placeholders = {
      en: "Ask me anything about your career... (Support: English, हिंदी, Hinglish)",
      hi: "अपने करियर के बारे में कुछ भी पूछें... (समर्थन: English, हिंदी, Hinglish)",
      hinglish:
        "Apne career ke bare mein kuch bhi puche... (Support: English, हिंदी, Hinglish)",
      es: "Pregúntame cualquier cosa sobre tu carrera... (Soporte: English, Español)",
      fr: "Demandez-moi tout sur votre carrière... (Support: English, Français)",
    };

    document.getElementById("chat-input").placeholder =
      placeholders[lang] || placeholders["en"];
  }

  handleQuickAction(btn) {
    const text = btn.querySelector("p").textContent;
    const actions = {
      "Analyze My Resume": "I want to analyze my resume and get feedback",
      "Find Perfect Jobs":
        "Help me find jobs that match my skills and preferences",
      "Skill Gap Analysis":
        "Can you analyze my skill gaps and suggest improvements?",
      "Interview Practice":
        "I need help with interview preparation and practice",
    };

    const message = actions[text] || text;
    document.getElementById("chat-input").value = message;
    this.sendMessage();
  }

  handleTopicClick(topic) {
    const cleanTopic = topic.replace(/[💼📈🎯🚀🌟]/g, "").trim();
    document.getElementById("chat-input").value = `Tell me about ${cleanTopic}`;
    this.sendMessage();
  }

  handleFileUpload(file) {
    if (!file) return;

    this.addSystemMessage(
      `📄 File uploaded: ${file.name}<br>Analyzing document... This may take a few moments.`
    );

    // Simulate file processing
    setTimeout(() => {
      const responses = [
        `✅ Resume analysis complete!<br><br>📊 **Analysis Results:**<br>• ATS Score: 87/100<br>• Skills Extracted: 15<br>• Experience Level: Senior<br>• Recommendations: 5<br><br>Would you like detailed feedback on any specific section?`,
        `📋 Document processed successfully!<br><br>**Key Insights:**<br>• Strong technical background<br>• Good project diversity<br>• Missing: Leadership examples<br>• Suggestion: Add quantified achievements<br><br>Shall I provide specific improvement recommendations?`,
      ];

      this.addAIMessage(
        responses[Math.floor(Math.random() * responses.length)]
      );
    }, 3000);
  }

  exportChat() {
    const chatData = {
      user: this.currentUser,
      timestamp: new Date().toISOString(),
      messages: this.chatHistory,
      language: this.currentLanguage,
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lakshyaai-chat-${this.currentUser}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification("Chat exported successfully! 📤", "success");
  }

  addSystemMessage(message) {
    const chatMessages = document.getElementById("chat-messages");
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const messageElement = document.createElement("div");
    messageElement.className = "flex justify-center animate-fade-in";
    messageElement.innerHTML = `
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 max-w-md">
                <p class="text-slate-300 text-sm text-center">${message}</p>
                <p class="text-slate-500 text-xs text-center mt-1">${timestamp}</p>
            </div>
        `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  addAIMessage(message) {
    const chatMessages = document.getElementById("chat-messages");
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const messageElement = document.createElement("div");
    messageElement.className = "flex items-start space-x-4 animate-bounce-in";
    messageElement.innerHTML = `
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <i class="fas fa-robot text-white"></i>
            </div>
            <div class="ai-message message-bubble rounded-2xl rounded-tl-lg p-4 max-w-md">
                <div class="mb-2">
                    <span class="text-green-400 font-semibold text-sm">ARIA</span>
                    <span class="text-slate-500 text-xs ml-2">${timestamp}</span>
                </div>
                <p class="text-slate-200 leading-relaxed">${message}</p>
            </div>
        `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Add to history
    this.chatHistory.push({
      type: "ai",
      message: message,
      timestamp: new Date().toISOString(),
    });
  }

  loadChatHistory() {
    // Load previous chat history from localStorage
    const saved = localStorage.getItem(`lakshyaai-chat-${this.currentUser}`);
    if (saved) {
      this.chatHistory = JSON.parse(saved);
    }
  }

  saveChatHistory() {
    // Save chat history to localStorage
    localStorage.setItem(
      `lakshyaai-chat-${this.currentUser}`,
      JSON.stringify(this.chatHistory)
    );
  }

  initializeWelcome() {
    // Add welcome message to history
    this.chatHistory.push({
      type: "ai",
      message: "Welcome to LakshyaAI Career Coach!",
      timestamp: new Date().toISOString(),
    });
  }

  async sendMessage() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    this.addUserMessage(message);

    // Clear input
    input.value = "";
    input.style.height = "auto";
    this.updateCharacterCount(0);

    // Show AI typing indicator
    this.showTypingIndicator();

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message }),
      });

      const data = await response.json();

      this.hideTypingIndicator();

      if (data.success) {
        this.addAIMessage(data.response);
        this.updateAIStatus(data.model_info);
        console.log(
          "✅ AI Response received:",
          data.response.substring(0, 100) + "..."
        );
      } else {
        this.addAIMessage(
          data.fallback || "I'm having trouble right now. Please try again! 🤖"
        );
        console.warn("⚠️ AI Service unavailable, using fallback");
      }
    } catch (error) {
      this.hideTypingIndicator();
      console.error("❌ Chat error:", error);
      this.addAIMessage("Connection issue detected. I'll be back shortly! 🔌");
    }

    // Save chat history
    this.saveChatHistory();
  }

  addUserMessage(message) {
    const chatMessages = document.getElementById("chat-messages");
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const messageElement = document.createElement("div");
    messageElement.className =
      "flex items-start space-x-4 justify-end animate-slide-in";
    messageElement.innerHTML = `
            <div class="user-message message-bubble rounded-2xl rounded-tr-lg p-4 max-w-md bg-gradient-to-br from-blue-500 to-purple-600">
                <div class="mb-2">
                    <span class="text-blue-100 font-semibold text-sm">${this.currentUser}</span>
                    <span class="text-blue-200 text-xs ml-2">${timestamp}</span>
                </div>
                <p class="text-white leading-relaxed">${message}</p>
            </div>
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <i class="fas fa-user text-white"></i>
            </div>
        `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Add to history
    this.chatHistory.push({
      type: "user",
      message: message,
      timestamp: new Date().toISOString(),
    });
  }

  updateCharacterCount(count) {
    const counterElement = document.getElementById("character-count");
    const statusElement = document.getElementById("input-status");

    if (counterElement) {
      counterElement.textContent = `${count}/2000`;
    }

    if (statusElement) {
      if (count > 1800) {
        statusElement.textContent = "Character limit approaching ⚠️";
      } else if (count > 0) {
        statusElement.textContent = "Typing... ⌨️";
      } else {
        statusElement.textContent = "Ready to help you! 🚀";
      }
    }
  }

  updateAIStatus(modelInfo) {
    const indicator = document.querySelector(
      ".text-green-400.text-sm.font-semibold"
    );
    if (indicator && modelInfo) {
      if (modelInfo.status === "online") {
        indicator.textContent = "🤖 AI Online";
        indicator.className = "text-green-400 text-sm font-semibold";
      } else {
        indicator.textContent = "🔄 AI Starting";
        indicator.className = "text-yellow-400 text-sm font-semibold";
      }
    }
  }

  showTypingIndicator() {
    const typingElement = document.getElementById("typing-indicator");
    if (typingElement) {
      typingElement.classList.remove("hidden");
      const chatMessages = document.getElementById("chat-messages");
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  hideTypingIndicator() {
    const typingElement = document.getElementById("typing-indicator");
    if (typingElement) {
      typingElement.classList.add("hidden");
    }
  }

  toggleVoiceInput() {
    const button = document.getElementById("voice-input");
    const icon = button?.querySelector("i");

    if (!button || !icon) return;

    if (button.classList.contains("recording")) {
      // Stop recording
      button.classList.remove("recording");
      icon.className = "fas fa-microphone text-white text-sm";
      this.updateCharacterCount(0);
      this.showNotification("Voice recording stopped 🎤", "info");
    } else {
      // Start recording
      button.classList.add("recording");
      icon.className = "fas fa-stop text-white text-sm";
      this.showNotification("Recording... Speak now! 🎙️", "info");

      // Simulate voice input (replace with actual implementation)
      setTimeout(() => {
        button.classList.remove("recording");
        icon.className = "fas fa-microphone text-white text-sm";
        this.showNotification("Voice input feature coming soon! 🚀", "info");
      }, 3000);
    }
  }

  clearChat() {
    const chatMessages = document.getElementById("chat-messages");
    if (!chatMessages) return;

    // Clear chat history
    this.chatHistory = [];
    this.saveChatHistory();

    // Reset chat display
    chatMessages.innerHTML = `
            <div class="flex items-start space-x-4 animate-slide-in">
                <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <i class="fas fa-robot text-white"></i>
                </div>
                <div class="ai-message message-bubble rounded-2xl rounded-tl-lg p-4 max-w-md">
                    <div class="mb-2">
                        <span class="text-green-400 font-semibold text-sm">ARIA - AI Career Advisor</span>
                        <span class="text-slate-500 text-xs ml-2">Just now</span>
                    </div>
                    <p class="text-slate-200 leading-relaxed">
                        Chat cleared! I'm ready to help you with fresh career guidance. What would you like to discuss? 🚀
                    </p>
                </div>
            </div>
        `;

    this.showNotification("Chat cleared successfully! 🧹", "success");
  }

  showNotification(message, type = "info", duration = 3000) {
    const notification = document.createElement("div");
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-xl text-white max-w-sm transform transition-all duration-300 ${
      type === "success"
        ? "bg-green-500/90"
        : type === "error"
        ? "bg-red-500/90"
        : "bg-blue-500/90"
    } backdrop-blur-sm border border-white/20 shadow-lg`;

    notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white/80 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, duration);
  }

  // Voice recognition setup (placeholder)
  setupVoiceRecognition() {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = this.currentLanguage === "hi" ? "hi-IN" : "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById("chat-input").value = transcript;
        this.sendMessage();
      };

      recognition.onerror = (event) => {
        this.showNotification(
          "Voice recognition error. Please try again.",
          "error"
        );
      };

      return recognition;
    }
    return null;
  }

  // Real-time features
  setupRealTimeFeatures() {
    // Simulate real-time updates
    setInterval(() => {
      this.checkForUpdates();
    }, 30000);
  }

  checkForUpdates() {
    // Check for new job matches, messages, etc.
    const randomUpdates = [
      "🎯 3 new job matches found based on your profile!",
      "📈 Your profile views increased by 25% this week!",
      "🚀 New skill recommendation: DevOps fundamentals",
      "💼 A recruiter viewed your profile from Google!",
    ];

    if (Math.random() < 0.1) {
      // 10% chance
      const update =
        randomUpdates[Math.floor(Math.random() * randomUpdates.length)];
      this.showNotification(update, "info", 5000);
    }
  }

  // AI Response Intelligence
  getContextualResponse(userMessage, context = {}) {
    // Enhanced AI response logic with context awareness
    const responses = this.generateSmartResponse(userMessage, context);
    return responses;
  }

  generateSmartResponse(message, context) {
    // Advanced response generation based on user profile and context
    const userProfile = {
      experience: "senior",
      skills: ["Python", "JavaScript", "AI/ML"],
      industry: "Technology",
      goals: ["career_growth", "skill_development"],
    };

    // Generate personalized response based on profile
    return this.personalizeResponse(message, userProfile);
  }

  personalizeResponse(message, profile) {
    // Return personalized response based on user profile
    return (
      "I understand your question and will provide personalized advice based on your background in " +
      profile.industry +
      ". Let me help you with that!"
    );
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.aiCareerCoach = new AICareerCoach();
});

// Handle visibility change
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("🤖 AI Coach tab hidden");
  } else {
    console.log("🤖 AI Coach tab visible - checking for updates");
    if (window.aiCareerCoach) {
      window.aiCareerCoach.checkForUpdates();
    }
  }
});
