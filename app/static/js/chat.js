// Enhanced Chat JavaScript for AI Coach
class AICoachChat {
  constructor() {
    this.messages = [];
    this.isTyping = false;
    this.conversationId = this.generateConversationId();
    this.messageHistory = this.loadMessageHistory();
    this.quickActions = [];
    this.currentTopic = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadConversationHistory();
    this.setupQuickActions();
    this.displayWelcomeMessage();
    console.log("🤖 AI Coach Chat initialized");
  }

  generateConversationId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setupEventListeners() {
    // Message form submission
    const messageForm = document.getElementById("message-form");
    if (messageForm) {
      messageForm.addEventListener("submit", (e) =>
        this.handleMessageSubmit(e)
      );
    }

    // Input field events
    const messageInput = document.getElementById("message-input");
    if (messageInput) {
      messageInput.addEventListener("keydown", (e) =>
        this.handleInputKeydown(e)
      );
      messageInput.addEventListener("input", (e) => this.handleInputChange(e));
      messageInput.addEventListener("paste", (e) => this.handlePaste(e));
    }

    // Quick action buttons
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("quick-action-btn")) {
        this.handleQuickAction(e.target.dataset.action);
      }

      if (e.target.classList.contains("copy-message-btn")) {
        this.copyMessage(e.target.dataset.messageId);
      }

      if (e.target.classList.contains("regenerate-btn")) {
        this.regenerateResponse(e.target.dataset.messageId);
      }
    });

    // Voice input (if supported)
    const voiceBtn = document.getElementById("voice-input-btn");
    if (
      (voiceBtn && "speechRecognition" in window) ||
      "webkitSpeechRecognition" in window
    ) {
      voiceBtn.addEventListener("click", () => this.toggleVoiceInput());
      this.setupSpeechRecognition();
    }

    // Clear conversation
    const clearBtn = document.getElementById("clear-conversation");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearConversation());
    }

    // Export conversation
    const exportBtn = document.getElementById("export-conversation");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportConversation());
    }

    // Conversation history
    const historyBtn = document.getElementById("conversation-history");
    if (historyBtn) {
      historyBtn.addEventListener("click", () =>
        this.showConversationHistory()
      );
    }
  }

  setupQuickActions() {
    this.quickActions = [
      {
        id: "career-advice",
        label: "Career Advice",
        icon: "fas fa-compass",
        message:
          "I need career guidance and advice for my professional development.",
      },
      {
        id: "resume-tips",
        label: "Resume Tips",
        icon: "fas fa-file-alt",
        message:
          "Can you help me improve my resume and make it more effective?",
      },
      {
        id: "interview-prep",
        label: "Interview Prep",
        icon: "fas fa-comments",
        message:
          "I want to prepare for job interviews. What should I focus on?",
      },
      {
        id: "skill-development",
        label: "Skill Development",
        icon: "fas fa-graduation-cap",
        message: "What skills should I develop to advance in my career?",
      },
      {
        id: "job-search",
        label: "Job Search",
        icon: "fas fa-search",
        message:
          "I need help with my job search strategy and finding opportunities.",
      },
      {
        id: "salary-negotiation",
        label: "Salary Negotiation",
        icon: "fas fa-handshake",
        message: "How can I effectively negotiate my salary and benefits?",
      },
    ];

    this.renderQuickActions();
  }

  renderQuickActions() {
    const container = document.getElementById("quick-actions");
    if (!container) return;

    container.innerHTML = `
            <div class="flex flex-wrap gap-2 mb-4">
                ${this.quickActions
                  .map(
                    (action) => `
                    <button class="quick-action-btn flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            data-action="${action.id}">
                        <i class="${action.icon}"></i>
                        <span>${action.label}</span>
                    </button>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  displayWelcomeMessage() {
    if (this.messages.length === 0) {
      const welcomeMessage = {
        id: this.generateMessageId(),
        type: "ai",
        content: `Hello! I'm your AI Career Coach. I'm here to help you with:

• Career planning and development
• Resume and cover letter optimization
• Interview preparation and practice
• Skill development recommendations
• Job search strategies
• Salary negotiation tips
• Professional networking advice

What would you like to discuss today?`,
        timestamp: new Date().toISOString(),
        isWelcome: true,
      };

      this.addMessage(welcomeMessage);
    }
  }

  async handleMessageSubmit(e) {
    e.preventDefault();

    const messageInput = document.getElementById("message-input");
    if (!messageInput) return;

    const message = messageInput.value.trim();
    if (!message || this.isTyping) return;

    // Clear input
    messageInput.value = "";
    this.updateInputHeight(messageInput);

    // Add user message
    const userMessage = {
      id: this.generateMessageId(),
      type: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    this.addMessage(userMessage);
    this.showTypingIndicator();

    try {
      const response = await this.sendMessageToAI(message);
      this.hideTypingIndicator();

      const aiMessage = {
        id: this.generateMessageId(),
        type: "ai",
        content: response.response,
        timestamp: new Date().toISOString(),
        metadata: response.model_info,
      };

      this.addMessage(aiMessage);
      this.detectTopicFromMessage(message, response.response);
    } catch (error) {
      this.hideTypingIndicator();
      this.handleError(error);
    }

    // Save conversation
    this.saveConversation();
  }

  async sendMessageToAI(message) {
    const response = await fetch("/api/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        conversation_id: this.conversationId,
        history: this.messages.slice(-10), // Send last 10 messages for context
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to get AI response");
    }

    return result;
  }

  addMessage(message) {
    this.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();

    // Update conversation in localStorage
    this.updateConversationHistory();
  }

  renderMessage(message) {
    const messagesContainer = document.getElementById("messages-container");
    if (!messagesContainer) return;

    const messageElement = this.createMessageElement(message);
    messagesContainer.appendChild(messageElement);

    // Animate message appearance
    requestAnimationFrame(() => {
      messageElement.classList.add("message-appear");
    });
  }

  createMessageElement(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${message.type}-message opacity-0 transform translate-y-4 transition-all duration-300`;
    messageDiv.dataset.messageId = message.id;

    const time = new Date(message.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (message.type === "user") {
      messageDiv.innerHTML = `
                <div class="flex justify-end mb-4">
                    <div class="max-w-xs lg:max-w-md px-4 py-2 bg-blue-600 text-white rounded-lg shadow">
                        <div class="whitespace-pre-wrap">${this.formatMessageContent(
                          message.content
                        )}</div>
                        <div class="text-xs text-blue-100 mt-2">${time}</div>
                    </div>
                </div>
            `;
    } else {
      messageDiv.innerHTML = `
                <div class="flex justify-start mb-4">
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-robot text-white text-sm"></i>
                        </div>
                        <div class="max-w-xs lg:max-w-md px-4 py-2 bg-gray-100 text-gray-800 rounded-lg shadow">
                            <div class="whitespace-pre-wrap">${this.formatMessageContent(
                              message.content
                            )}</div>
                            <div class="flex items-center justify-between mt-2">
                                <div class="text-xs text-gray-500">${time}</div>
                                <div class="flex space-x-2">
                                    <button class="copy-message-btn text-gray-400 hover:text-gray-600 text-xs" 
                                            data-message-id="${message.id}" 
                                            title="Copy message">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                    <button class="regenerate-btn text-gray-400 hover:text-gray-600 text-xs" 
                                            data-message-id="${message.id}" 
                                            title="Regenerate response">
                                        <i class="fas fa-redo"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    return messageDiv;
  }

  formatMessageContent(content) {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    content = content.replace(
      urlRegex,
      '<a href="$1" target="_blank" rel="noopener" class="text-blue-600 underline">$1</a>'
    );

    // Convert markdown-style bold
    content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convert markdown-style italic
    content = content.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Convert bullet points
    content = content.replace(
      /^• (.+)$/gm,
      '<div class="flex items-start"><span class="text-blue-600 mr-2">•</span><span>$1</span></div>'
    );

    return content;
  }

  showTypingIndicator() {
    this.isTyping = true;

    const messagesContainer = document.getElementById("messages-container");
    if (!messagesContainer) return;

    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.className = "flex justify-start mb-4";
    typingDiv.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-white text-sm"></i>
                </div>
                <div class="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg shadow">
                    <div class="flex space-x-1">
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                </div>
            </div>
        `;

    messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isTyping = false;

    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  handleQuickAction(actionId) {
    const action = this.quickActions.find((a) => a.id === actionId);
    if (!action) return;

    const messageInput = document.getElementById("message-input");
    if (messageInput) {
      messageInput.value = action.message;
      messageInput.focus();
      this.updateInputHeight(messageInput);

      // Auto-submit after a short delay
      setTimeout(() => {
        document
          .getElementById("message-form")
          .dispatchEvent(new Event("submit"));
      }, 500);
    }
  }

  handleInputKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      document
        .getElementById("message-form")
        .dispatchEvent(new Event("submit"));
    }
  }

  handleInputChange(e) {
    this.updateInputHeight(e.target);
  }

  updateInputHeight(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  }

  handlePaste(e) {
    // Handle large text pastes
    setTimeout(() => {
      this.updateInputHeight(e.target);
    }, 0);
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  copyMessage(messageId) {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message) return;

    navigator.clipboard
      .writeText(message.content)
      .then(() => {
        this.showAlert("Message copied to clipboard!", "success");
      })
      .catch(() => {
        this.showAlert("Failed to copy message", "error");
      });
  }

  async regenerateResponse(messageId) {
    const messageIndex = this.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    const previousUserMessage = this.messages[messageIndex - 1];
    if (previousUserMessage.type !== "user") return;

    // Remove the AI message we're regenerating
    this.messages.splice(messageIndex, 1);

    // Remove from DOM
    const messageElement = document.querySelector(
      `[data-message-id="${messageId}"]`
    );
    if (messageElement) messageElement.remove();

    // Regenerate response
    this.showTypingIndicator();

    try {
      const response = await this.sendMessageToAI(previousUserMessage.content);
      this.hideTypingIndicator();

      const newAiMessage = {
        id: this.generateMessageId(),
        type: "ai",
        content: response.response,
        timestamp: new Date().toISOString(),
        metadata: response.model_info,
      };

      this.addMessage(newAiMessage);
    } catch (error) {
      this.hideTypingIndicator();
      this.handleError(error);
    }
  }

  clearConversation() {
    if (this.messages.length === 0) return;

    if (
      confirm(
        "Are you sure you want to clear this conversation? This action cannot be undone."
      )
    ) {
      this.messages = [];

      const messagesContainer = document.getElementById("messages-container");
      if (messagesContainer) {
        messagesContainer.innerHTML = "";
      }

      this.conversationId = this.generateConversationId();
      this.displayWelcomeMessage();
      this.deleteConversationHistory();

      this.showAlert("Conversation cleared", "info");
    }
  }

  exportConversation() {
    if (this.messages.length === 0) {
      this.showAlert("No conversation to export", "warning");
      return;
    }

    const conversationData = {
      id: this.conversationId,
      title: this.generateConversationTitle(),
      created_at: this.messages[0]?.timestamp,
      updated_at: this.messages[this.messages.length - 1]?.timestamp,
      messages: this.messages.map((msg) => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lakshya_conversation_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showAlert("Conversation exported successfully!", "success");
  }

  generateConversationTitle() {
    const firstUserMessage = this.messages.find((m) => m.type === "user");
    if (firstUserMessage) {
      return (
        firstUserMessage.content.substring(0, 50) +
        (firstUserMessage.content.length > 50 ? "..." : "")
      );
    }
    return `Conversation ${new Date().toLocaleDateString()}`;
  }

  detectTopicFromMessage(userMessage, aiResponse) {
    const topics = {
      resume: ["resume", "cv", "curriculum vitae"],
      interview: ["interview", "interviewing", "job interview"],
      career: ["career", "profession", "job path"],
      skills: ["skills", "skill development", "learning"],
      salary: ["salary", "compensation", "pay", "wage"],
      networking: ["networking", "professional network", "connections"],
    };

    const combinedText = (userMessage + " " + aiResponse).toLowerCase();

    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some((keyword) => combinedText.includes(keyword))) {
        this.currentTopic = topic;
        break;
      }
    }
  }

  // Conversation persistence
  saveConversation() {
    const conversation = {
      id: this.conversationId,
      messages: this.messages,
      topic: this.currentTopic,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(
      `conversation_${this.conversationId}`,
      JSON.stringify(conversation)
    );
  }

  loadConversationHistory() {
    const conversations = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("conversation_")) {
        try {
          const conversation = JSON.parse(localStorage.getItem(key));
          conversations.push(conversation);
        } catch (error) {
          console.error("Error loading conversation:", error);
        }
      }
    }

    return conversations.sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
    );
  }

  updateConversationHistory() {
    this.messageHistory = this.loadConversationHistory();
  }

  deleteConversationHistory() {
    localStorage.removeItem(`conversation_${this.conversationId}`);
    this.updateConversationHistory();
  }

  loadMessageHistory() {
    // Load recent conversations for context
    return this.loadConversationHistory().slice(0, 5);
  }

  // Speech recognition setup
  setupSpeechRecognition() {
    if (
      !("speechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const messageInput = document.getElementById("message-input");
      if (messageInput) {
        messageInput.value = transcript;
        this.updateInputHeight(messageInput);
      }
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      this.showAlert(
        "Speech recognition failed. Please try typing instead.",
        "error"
      );
    };
  }

  toggleVoiceInput() {
    if (!this.recognition) return;

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.updateVoiceButton(false);
    } else {
      this.recognition.start();
      this.isListening = true;
      this.updateVoiceButton(true);
    }
  }

  updateVoiceButton(isListening) {
    const voiceBtn = document.getElementById("voice-input-btn");
    if (!voiceBtn) return;

    if (isListening) {
      voiceBtn.innerHTML = '<i class="fas fa-stop text-red-500"></i>';
      voiceBtn.title = "Stop listening";
    } else {
      voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      voiceBtn.title = "Start voice input";
    }
  }

  // Error handling
  handleError(error) {
    console.error("Chat error:", error);

    const errorMessage = {
      id: this.generateMessageId(),
      type: "ai",
      content: `I apologize, but I encountered an error while processing your message. Please try again in a moment.

If the problem persists, you can:
• Check your internet connection
• Refresh the page
• Contact support for assistance

Error details: ${error.message}`,
      timestamp: new Date().toISOString(),
      isError: true,
    };

    this.addMessage(errorMessage);
  }

  // Utility methods
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  showAlert(message, type = "info", duration = 3000) {
    const alertId = `alert-${Date.now()}`;
    const colors = {
      success: "bg-green-500",
      error: "bg-red-500",
      warning: "bg-yellow-500",
      info: "bg-blue-500",
    };

    const alert = document.createElement("div");
    alert.id = alertId;
    alert.className = `fixed top-4 right-4 z-50 p-3 rounded-lg text-white text-sm ${colors[type]} transform translate-x-full transition-transform duration-300 shadow-lg`;
    alert.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="document.getElementById('${alertId}').remove()" class="ml-2 text-white/80 hover:text-white">
                    <i class="fas fa-times text-xs"></i>
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
    }, duration);
  }
}

// CSS animation classes
const style = document.createElement("style");
style.textContent = `
    .message-appear {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .typing-dots {
        display: inline-block;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: #999;
        animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dots:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typing {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Initialize chat when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.aiCoachChat = new AICoachChat();
});
