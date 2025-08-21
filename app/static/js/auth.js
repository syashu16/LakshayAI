// Enhanced Auth JavaScript
class AuthSystem {
  constructor() {
    this.currentMode = "login";
    this.isLoading = false;
    this.passwordVisible = false;
    this.validationRules = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      password:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      name: /^[a-zA-Z\s]{2,50}$/,
    };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupFormValidation();
    this.loadRememberedUser();
    this.setupSocialAuth();
    console.log("🔐 Auth System initialized");
  }

  setupEventListeners() {
    // Tab switching
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");

    if (loginTab)
      loginTab.addEventListener("click", () => this.switchToLogin());
    if (registerTab)
      registerTab.addEventListener("click", () => this.switchToRegister());

    // Form submissions
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm)
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    if (registerForm)
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));

    // Password visibility toggles
    document.querySelectorAll(".password-toggle").forEach((toggle) => {
      toggle.addEventListener("click", (e) => this.togglePasswordVisibility(e));
    });

    // Social login buttons
    document.querySelectorAll(".social-login-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleSocialLogin(e));
    });

    // Forgot password
    const forgotPasswordLink = document.getElementById("forgot-password");
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener("click", (e) =>
        this.handleForgotPassword(e)
      );
    }

    // Real-time validation
    document
      .querySelectorAll(
        'input[type="email"], input[type="password"], input[type="text"]'
      )
      .forEach((input) => {
        input.addEventListener("blur", (e) => this.validateField(e.target));
        input.addEventListener("input", (e) => this.clearFieldError(e.target));
      });

    // Remember me functionality
    const rememberCheckbox = document.getElementById("remember-me");
    if (rememberCheckbox) {
      rememberCheckbox.addEventListener("change", (e) =>
        this.handleRememberMe(e)
      );
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName === "INPUT") {
        e.preventDefault();
        this.handleEnterKey(e.target);
      }
    });
  }

  setupFormValidation() {
    // Add required indicators
    document.querySelectorAll("input[required]").forEach((input) => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label && !label.querySelector(".required-indicator")) {
        label.insertAdjacentHTML(
          "beforeend",
          '<span class="required-indicator text-red-500 ml-1">*</span>'
        );
      }
    });

    // Setup password strength indicator
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach((input) => {
      if (
        input.id.includes("register") ||
        input.placeholder.includes("Create")
      ) {
        this.addPasswordStrengthIndicator(input);
      }
    });
  }

  addPasswordStrengthIndicator(passwordInput) {
    const strengthIndicator = document.createElement("div");
    strengthIndicator.className = "password-strength mt-2 hidden";
    strengthIndicator.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div class="strength-bar h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <span class="strength-text text-sm text-gray-600">Weak</span>
            </div>
            <div class="strength-requirements text-xs text-gray-500 mt-1">
                <div class="requirement" data-requirement="length">• At least 8 characters</div>
                <div class="requirement" data-requirement="lowercase">• One lowercase letter</div>
                <div class="requirement" data-requirement="uppercase">• One uppercase letter</div>
                <div class="requirement" data-requirement="number">• One number</div>
                <div class="requirement" data-requirement="special">• One special character</div>
            </div>
        `;

    passwordInput.parentNode.appendChild(strengthIndicator);

    passwordInput.addEventListener("input", (e) => {
      this.updatePasswordStrength(e.target, strengthIndicator);
    });
  }

  updatePasswordStrength(passwordInput, indicator) {
    const password = passwordInput.value;
    indicator.classList.toggle("hidden", password.length === 0);

    if (password.length === 0) return;

    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const strengthPercentage = (metRequirements / 5) * 100;

    const strengthBar = indicator.querySelector(".strength-bar");
    const strengthText = indicator.querySelector(".strength-text");

    // Update bar
    strengthBar.style.width = `${strengthPercentage}%`;

    // Update color and text
    if (strengthPercentage < 40) {
      strengthBar.className =
        "strength-bar h-2 rounded-full transition-all duration-300 bg-red-500";
      strengthText.textContent = "Weak";
      strengthText.className = "strength-text text-sm text-red-600";
    } else if (strengthPercentage < 80) {
      strengthBar.className =
        "strength-bar h-2 rounded-full transition-all duration-300 bg-yellow-500";
      strengthText.textContent = "Medium";
      strengthText.className = "strength-text text-sm text-yellow-600";
    } else {
      strengthBar.className =
        "strength-bar h-2 rounded-full transition-all duration-300 bg-green-500";
      strengthText.textContent = "Strong";
      strengthText.className = "strength-text text-sm text-green-600";
    }

    // Update requirements
    Object.entries(requirements).forEach(([req, met]) => {
      const reqElement = indicator.querySelector(`[data-requirement="${req}"]`);
      if (reqElement) {
        reqElement.className = `requirement ${
          met ? "text-green-600" : "text-gray-500"
        }`;
        reqElement.innerHTML = `${
          met ? "✓" : "•"
        } ${reqElement.textContent.substring(1)}`;
      }
    });
  }

  switchToLogin() {
    if (this.currentMode === "login") return;

    this.currentMode = "login";
    this.updateTabAppearance();
    this.showLoginForm();
    this.updateHeaderText(
      "Welcome Back!",
      "Sign in to continue your career journey"
    );
  }

  switchToRegister() {
    if (this.currentMode === "register") return;

    this.currentMode = "register";
    this.updateTabAppearance();
    this.showRegisterForm();
    this.updateHeaderText(
      "Join LakshyaAI!",
      "Create account to start your career transformation"
    );
  }

  updateTabAppearance() {
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");

    if (!loginTab || !registerTab) return;

    const activeClasses =
      "flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg";
    const inactiveClasses =
      "flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-slate-300 hover:text-white";

    if (this.currentMode === "login") {
      loginTab.className = activeClasses;
      registerTab.className = inactiveClasses;
    } else {
      registerTab.className = activeClasses;
      loginTab.className = inactiveClasses;
    }
  }

  showLoginForm() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm) loginForm.classList.remove("hidden");
    if (registerForm) registerForm.classList.add("hidden");
  }

  showRegisterForm() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm) loginForm.classList.add("hidden");
    if (registerForm) registerForm.classList.remove("hidden");
  }

  updateHeaderText(title, subtitle) {
    const titleElement = document.getElementById("auth-title");
    const subtitleElement = document.getElementById("auth-subtitle");

    if (titleElement) titleElement.textContent = title;
    if (subtitleElement) subtitleElement.textContent = subtitle;
  }

  async handleLogin(e) {
    e.preventDefault();

    if (this.isLoading) return;

    const form = e.target;
    const formData = new FormData(form);
    const credentials = {
      email: formData.get("email")?.trim(),
      password: formData.get("password"),
      remember: formData.get("remember") === "on",
    };

    if (!this.validateLoginForm(credentials)) return;

    this.isLoading = true;
    this.showFormLoading(form, "Signing in...");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (response.ok) {
        this.handleLoginSuccess(result, credentials.remember);
      } else {
        this.handleLoginError(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      this.handleLoginError("Network error. Please check your connection.");
    } finally {
      this.isLoading = false;
      this.hideFormLoading(form);
    }
  }

  async handleRegister(e) {
    e.preventDefault();

    if (this.isLoading) return;

    const form = e.target;
    const formData = new FormData(form);
    const userData = {
      firstName: formData.get("firstName")?.trim(),
      lastName: formData.get("lastName")?.trim(),
      email: formData.get("email")?.trim(),
      password: formData.get("password"),
      terms: formData.get("terms") === "on",
    };

    if (!this.validateRegisterForm(userData)) return;

    this.isLoading = true;
    this.showFormLoading(form, "Creating account...");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        this.handleRegisterSuccess(result);
      } else {
        this.handleRegisterError(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      this.handleRegisterError("Network error. Please check your connection.");
    } finally {
      this.isLoading = false;
      this.hideFormLoading(form);
    }
  }

  validateLoginForm(credentials) {
    let isValid = true;

    // Email validation
    if (!credentials.email) {
      this.showFieldError("login-email", "Email is required");
      isValid = false;
    } else if (!this.validationRules.email.test(credentials.email)) {
      this.showFieldError("login-email", "Please enter a valid email address");
      isValid = false;
    }

    // Password validation
    if (!credentials.password) {
      this.showFieldError("login-password", "Password is required");
      isValid = false;
    }

    return isValid;
  }

  validateRegisterForm(userData) {
    let isValid = true;

    // Name validation
    if (!userData.firstName) {
      this.showFieldError("firstName", "First name is required");
      isValid = false;
    } else if (!this.validationRules.name.test(userData.firstName)) {
      this.showFieldError("firstName", "Please enter a valid first name");
      isValid = false;
    }

    if (!userData.lastName) {
      this.showFieldError("lastName", "Last name is required");
      isValid = false;
    } else if (!this.validationRules.name.test(userData.lastName)) {
      this.showFieldError("lastName", "Please enter a valid last name");
      isValid = false;
    }

    // Email validation
    if (!userData.email) {
      this.showFieldError("email", "Email is required");
      isValid = false;
    } else if (!this.validationRules.email.test(userData.email)) {
      this.showFieldError("email", "Please enter a valid email address");
      isValid = false;
    }

    // Password validation
    if (!userData.password) {
      this.showFieldError("password", "Password is required");
      isValid = false;
    } else if (!this.validationRules.password.test(userData.password)) {
      this.showFieldError("password", "Password must meet all requirements");
      isValid = false;
    }

    // Terms validation
    if (!userData.terms) {
      this.showAlert(
        "Please accept the Terms of Service and Privacy Policy",
        "error"
      );
      isValid = false;
    }

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name || field.id;

    this.clearFieldError(field);

    if (field.required && !value) {
      this.showFieldError(
        field.id,
        `${this.getFieldLabel(fieldName)} is required`
      );
      return false;
    }

    if (
      value &&
      fieldType === "email" &&
      !this.validationRules.email.test(value)
    ) {
      this.showFieldError(field.id, "Please enter a valid email address");
      return false;
    }

    if (
      value &&
      fieldType === "password" &&
      field.placeholder.includes("Create")
    ) {
      if (!this.validationRules.password.test(value)) {
        this.showFieldError(field.id, "Password must meet all requirements");
        return false;
      }
    }

    if (
      value &&
      fieldName.includes("Name") &&
      !this.validationRules.name.test(value)
    ) {
      this.showFieldError(field.id, "Please enter a valid name");
      return false;
    }

    return true;
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Add error styling to field
    field.classList.add(
      "border-red-500",
      "focus:border-red-500",
      "focus:ring-red-500"
    );
    field.classList.remove(
      "border-gray-300",
      "focus:border-blue-500",
      "focus:ring-blue-500"
    );

    // Remove existing error message
    const existingError = field.parentNode.querySelector(".field-error");
    if (existingError) existingError.remove();

    // Add error message
    const errorElement = document.createElement("div");
    errorElement.className = "field-error text-red-500 text-sm mt-1";
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
  }

  clearFieldError(field) {
    // Remove error styling
    field.classList.remove(
      "border-red-500",
      "focus:border-red-500",
      "focus:ring-red-500"
    );
    field.classList.add(
      "border-gray-300",
      "focus:border-blue-500",
      "focus:ring-blue-500"
    );

    // Remove error message
    const errorElement = field.parentNode.querySelector(".field-error");
    if (errorElement) errorElement.remove();
  }

  getFieldLabel(fieldName) {
    const labels = {
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      password: "Password",
      "login-email": "Email",
      "login-password": "Password",
    };
    return labels[fieldName] || fieldName;
  }

  togglePasswordVisibility(e) {
    e.preventDefault();

    const button = e.target.closest(".password-toggle");
    const input = button.previousElementSibling;
    const icon = button.querySelector("i");

    if (!input || !icon) return;

    if (input.type === "password") {
      input.type = "text";
      icon.className = "fas fa-eye-slash";
      button.title = "Hide password";
    } else {
      input.type = "password";
      icon.className = "fas fa-eye";
      button.title = "Show password";
    }
  }

  showFormLoading(form, message) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;

    submitButton.disabled = true;
    submitButton.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>${message}</span>
            </div>
        `;
  }

  hideFormLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;

    submitButton.disabled = false;

    if (this.currentMode === "login") {
      submitButton.innerHTML = `
                <span>Sign In</span>
                <i class="fas fa-arrow-right ml-2"></i>
            `;
    } else {
      submitButton.innerHTML = `
                <span>Create Account</span>
                <i class="fas fa-rocket ml-2"></i>
            `;
    }
  }

  handleLoginSuccess(result, remember) {
    // Store authentication data
    if (remember) {
      localStorage.setItem("auth_token", result.token);
      localStorage.setItem("user_data", JSON.stringify(result.user));
    } else {
      sessionStorage.setItem("auth_token", result.token);
      sessionStorage.setItem("user_data", JSON.stringify(result.user));
    }

    this.showAlert("Login successful! Redirecting to dashboard...", "success");

    // Redirect after a short delay
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
  }

  handleLoginError(message) {
    this.showAlert(message, "error");

    // Clear password field
    const passwordField = document.getElementById("login-password");
    if (passwordField) passwordField.value = "";
  }

  handleRegisterSuccess(result) {
    this.showAlert(
      "Account created successfully! Please check your email to verify your account.",
      "success"
    );

    // Switch to login mode after a delay
    setTimeout(() => {
      this.switchToLogin();

      // Pre-fill email if provided
      if (result.email) {
        const emailField = document.getElementById("login-email");
        if (emailField) emailField.value = result.email;
      }
    }, 2000);
  }

  handleRegisterError(message) {
    this.showAlert(message, "error");
  }

  handleSocialLogin(e) {
    const provider = e.target.closest(".social-login-btn").dataset.provider;

    this.showAlert(
      `${provider} login functionality will be implemented soon!`,
      "info"
    );

    // In a real implementation, you would redirect to the social provider
    // window.location.href = `/auth/${provider}`;
  }

  handleForgotPassword(e) {
    e.preventDefault();

    const email = document.getElementById("login-email")?.value.trim();

    if (!email) {
      this.showAlert("Please enter your email address first", "warning");
      return;
    }

    if (!this.validationRules.email.test(email)) {
      this.showAlert("Please enter a valid email address", "error");
      return;
    }

    this.showAlert(
      "Password reset instructions will be sent to your email shortly.",
      "info"
    );

    // In a real implementation, you would make an API call
    // fetch('/api/auth/forgot-password', { ... })
  }

  handleRememberMe(e) {
    const isChecked = e.target.checked;

    // Save preference
    localStorage.setItem("remember_preference", isChecked.toString());
  }

  loadRememberedUser() {
    const rememberedEmail = localStorage.getItem("remembered_email");
    const rememberPref = localStorage.getItem("remember_preference") === "true";

    if (rememberedEmail) {
      const emailField = document.getElementById("login-email");
      if (emailField) emailField.value = rememberedEmail;
    }

    const rememberCheckbox = document.getElementById("remember-me");
    if (rememberCheckbox) rememberCheckbox.checked = rememberPref;
  }

  handleEnterKey(currentField) {
    const form = currentField.closest("form");
    if (!form) return;

    const fields = Array.from(
      form.querySelectorAll('input:not([type="hidden"])')
    );
    const currentIndex = fields.indexOf(currentField);
    const nextField = fields[currentIndex + 1];

    if (nextField) {
      nextField.focus();
    } else {
      // Submit form if on last field
      form.dispatchEvent(new Event("submit"));
    }
  }

  setupSocialAuth() {
    // Setup social authentication providers
    const socialProviders = ["google", "linkedin", "github"];

    socialProviders.forEach((provider) => {
      const button = document.querySelector(`[data-provider="${provider}"]`);
      if (button) {
        button.dataset.provider = provider;
        button.classList.add("social-login-btn");
      }
    });
  }

  // Utility methods
  showAlert(message, type = "info", duration = 5000) {
    const alertId = `alert-${Date.now()}`;
    const colors = {
      success: "bg-green-500",
      error: "bg-red-500",
      warning: "bg-yellow-500",
      info: "bg-blue-500",
    };

    const icons = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    };

    const alert = document.createElement("div");
    alert.id = alertId;
    alert.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white max-w-sm ${colors[type]} transform translate-x-full transition-all duration-300 shadow-lg`;
    alert.innerHTML = `
            <div class="flex items-start">
                <i class="${icons[type]} text-lg mr-3 mt-0.5"></i>
                <div class="flex-1">
                    <div class="font-medium mb-1">${
                      type.charAt(0).toUpperCase() + type.slice(1)
                    }</div>
                    <div class="text-sm opacity-90">${message}</div>
                </div>
                <button onclick="document.getElementById('${alertId}').remove()" class="ml-3 text-white/80 hover:text-white focus:outline-none">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

    document.body.appendChild(alert);

    // Slide in
    setTimeout(() => alert.classList.remove("translate-x-full"), 100);

    // Auto remove
    setTimeout(() => {
      if (alert.parentNode) {
        alert.classList.add("translate-x-full");
        setTimeout(() => alert.remove(), 300);
      }
    }, duration);
  }

  // Public methods for external use
  logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");

    this.showAlert("Logged out successfully", "success");

    setTimeout(() => {
      window.location.href = "/auth";
    }, 1000);
  }

  isAuthenticated() {
    return !!(
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    );
  }

  getCurrentUser() {
    const userData =
      localStorage.getItem("user_data") || sessionStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  }
}

// Initialize auth system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.authSystem = new AuthSystem();
});

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthSystem;
}
