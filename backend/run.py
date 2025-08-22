from flask import Flask, render_template, abort, request, jsonify, session, redirect, url_for, flash
import os
import sys
from datetime import datetime

# Import ML service (Traditional ML - Fallback from BERT)
try:
    from ml_service import get_ml_service
    ml_service = get_ml_service()
    print("✅ Traditional ML Service loaded successfully!")
except ImportError as e:
    print(f"⚠️ Traditional ML Service import failed: {e}")
    try:
        from services.ml_resume_service import AdvancedMLService
        ml_service = AdvancedMLService()
        print("✅ Advanced ML Service loaded successfully!")
    except ImportError as e2:
        print(f"⚠️ All ML Services failed: {e2}")
        ml_service = None

# Import Dynamic Learning Resources
try:
    from dynamic_learning_resources import DynamicLearningResourcesAPI
    learning_resources_api = DynamicLearningResourcesAPI()
    print("✅ Dynamic Learning Resources API loaded successfully!")
except ImportError as e:
    print(f"⚠️ Dynamic Learning Resources API import failed: {e}")
    learning_resources_api = None

# Import Dynamic Interview Service
try:
    from dynamic_interview_service import dynamic_interview_service
    print("✅ Dynamic Interview Service loaded successfully!")
except ImportError as e:
    print(f"⚠️ Dynamic Interview Service import failed: {e}")
    dynamic_interview_service = None

# Import Authentication Service
try:
    from auth_service import AuthService
    from database_config import DatabaseManager
    auth_service = AuthService()
    print("✅ Authentication Service loaded successfully!")
except ImportError as e:
    print(f"⚠️ Authentication Service import failed: {e}")
    auth_service = None

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__, 
           template_folder=os.path.join(basedir, 'app/templates'),
           static_folder=os.path.join(basedir, 'app/static'))

app.secret_key = 'lakshyaai-secret-key-2025-syashu16'

# MySQL configurations
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'yashu1601'
app.config['MYSQL_DB'] = 'lakshayai'

# Session configuration
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/auth')
@app.route('/login')
@app.route('/register')
def auth():
    # First try to find auth.html in the main templates folder
    auth_template_main = os.path.join(app.template_folder, 'auth.html')
    # Then try in auth subfolder
    auth_template_sub = os.path.join(app.template_folder, 'auth', 'auth.html')
    
    print(f"🔍 Looking for auth.html in:")
    print(f"   📁 Main: {auth_template_main} - Exists: {os.path.exists(auth_template_main)}")
    print(f"   📁 Sub:  {auth_template_sub} - Exists: {os.path.exists(auth_template_sub)}")
    
    # Check main templates folder first
    if os.path.exists(auth_template_main):
        print("✅ Found auth.html in main templates folder")
        return render_template('auth.html')
    
    # Check auth subfolder
    elif os.path.exists(auth_template_sub):
        print(" Found auth.html in auth subfolder")
        return render_template('auth/auth.html')
    
    # If neither exists, create a temporary auth page
    else:
        print("auth.html not found anywhere, creating temporary page")
        return jsonify({
            'error': 'Auth template not found',
            'message': 'Please create auth.html template',
            'template_folder': app.template_folder,
            'missing_files': [auth_template_main, auth_template_sub]
        }), 404

@app.route('/create-auth-file', methods=['POST'])
def create_auth_file():
    """Create the auth.html file automatically"""
    try:
        # Ensure the templates directory exists
        os.makedirs(app.template_folder, exist_ok=True)
        
        # Create auth.html in main templates folder
        auth_file_path = os.path.join(app.template_folder, 'auth.html')
        
        # Complete auth.html content
        auth_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Join LakshyaAI - Sign In or Create Account</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { 'inter': ['Inter', 'sans-serif'] }
                }
            }
        }
    </script>
    <style>
        .floating-orb { animation: float 8s ease-in-out infinite; }
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-30px) rotate(90deg); }
            50% { transform: translateY(-10px) rotate(180deg); }
            75% { transform: translateY(-20px) rotate(270deg); }
        }
        .form-input:focus { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2); }
        .auth-btn:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3); }
    </style>
</head>
<body class="font-inter bg-slate-950 text-white overflow-hidden">
    <!-- Background -->
    <div class="fixed inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"></div>
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="floating-orb absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div class="floating-orb absolute top-40 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
            <div class="floating-orb absolute bottom-20 left-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 4s;"></div>
        </div>
    </div>

    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="/" class="flex items-center space-x-3 group">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i class="fas fa-rocket text-white text-sm"></i>
                    </div>
                    <span class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">LakshyaAI</span>
                </a>
                <a href="/" class="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors group">
                    <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                    <span>Back to Home</span>
                </a>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
        <div class="max-w-md w-full">
            <!-- Auth Container -->
            <div class="auth-container bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <i class="fas fa-user-astronaut text-white text-2xl"></i>
                    </div>
                    <h1 id="auth-title" class="text-3xl font-bold mb-2">Welcome Back!</h1>
                    <p id="auth-subtitle" class="text-slate-300">Sign in to continue your career journey</p>
                </div>

                <!-- Tab Switcher -->
                <div class="flex bg-slate-800/50 rounded-2xl p-1 mb-8">
                    <button id="login-tab" class="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                        Sign In
                    </button>
                    <button id="register-tab" class="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-slate-300 hover:text-white">
                        Sign Up
                    </button>
                </div>

                <!-- Login Form -->
                <form id="login-form" class="space-y-6">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-slate-300 mb-2">
                            <i class="fas fa-envelope mr-2"></i>Email Address
                        </label>
                        <input type="email" id="login-email" required 
                               class="form-input w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                               placeholder="Enter your email">
                    </div>
                    
                    <div class="form-group">
                        <label class="block text-sm font-medium text-slate-300 mb-2">
                            <i class="fas fa-lock mr-2"></i>Password
                        </label>
                        <div class="relative">
                            <input type="password" id="login-password" required 
                                   class="form-input w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pr-12"
                                   placeholder="Enter your password">
                            <button type="button" class="password-toggle absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <label class="flex items-center">
                            <input type="checkbox" class="rounded border-slate-600 bg-slate-800 text-blue-500">
                            <span class="ml-2 text-sm text-slate-300">Remember me</span>
                        </label>
                        <a href="#" class="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                    </div>

                    <button type="submit" class="auth-btn w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center">
                        <span>Sign In</span>
                        <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </form>

                <!-- Register Form -->
                <form id="register-form" class="space-y-6 hidden">
                    <div class="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="First name" class="form-input px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 transition-all">
                        <input type="text" placeholder="Last name" class="form-input px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 transition-all">
                    </div>
                    <input type="email" placeholder="Email address" class="form-input w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 transition-all">
                    <input type="password" placeholder="Create password" class="form-input w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 transition-all">
                    <label class="flex items-start">
                        <input type="checkbox" class="mt-1 rounded border-slate-600 bg-slate-800 text-blue-500">
                        <span class="ml-3 text-sm text-slate-300">I agree to the Terms of Service and Privacy Policy</span>
                    </label>
                    <button type="submit" class="auth-btn w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center">
                        <span>Create Account</span>
                        <i class="fas fa-rocket ml-2"></i>
                    </button>
                </form>

                <!-- Social Login -->
                <div class="mt-8">
                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-slate-700"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-4 bg-slate-950 text-slate-400">Or continue with</span>
                        </div>
                    </div>
                    <div class="mt-6 grid grid-cols-3 gap-3">
                        <button class="flex justify-center items-center px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700/50 transition-all">
                            <i class="fab fa-google text-red-400 text-xl"></i>
                        </button>
                        <button class="flex justify-center items-center px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700/50 transition-all">
                            <i class="fab fa-linkedin text-blue-400 text-xl"></i>
                        </button>
                        <button class="flex justify-center items-center px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700/50 transition-all">
                            <i class="fab fa-github text-gray-400 text-xl"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- JavaScript -->
    <script>
        class AuthPage {
            constructor() {
                this.currentTab = 'login';
                this.init();
            }

            init() {
                this.setupTabSwitching();
                this.setupPasswordToggle();
                this.setupFormSubmission();
                console.log('✅ Auth page initialized');
            }

            setupTabSwitching() {
                document.getElementById('login-tab').addEventListener('click', () => this.switchToLogin());
                document.getElementById('register-tab').addEventListener('click', () => this.switchToRegister());
            }

            switchToLogin() {
                if (this.currentTab === 'login') return;
                this.currentTab = 'login';
                
                const loginTab = document.getElementById('login-tab');
                const registerTab = document.getElementById('register-tab');
                const loginForm = document.getElementById('login-form');
                const registerForm = document.getElementById('register-form');
                const authTitle = document.getElementById('auth-title');
                const authSubtitle = document.getElementById('auth-subtitle');

                loginTab.className = 'flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg';
                registerTab.className = 'flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-slate-300 hover:text-white';

                authTitle.textContent = 'Welcome Back!';
                authSubtitle.textContent = 'Sign in to continue your career journey';

                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
            }

            switchToRegister() {
                if (this.currentTab === 'register') return;
                this.currentTab = 'register';
                
                const loginTab = document.getElementById('login-tab');
                const registerTab = document.getElementById('register-tab');
                const loginForm = document.getElementById('login-form');
                const registerForm = document.getElementById('register-form');
                const authTitle = document.getElementById('auth-title');
                const authSubtitle = document.getElementById('auth-subtitle');

                registerTab.className = 'flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg';
                loginTab.className = 'flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-slate-300 hover:text-white';

                authTitle.textContent = 'Join LakshyaAI!';
                authSubtitle.textContent = 'Create account to start your career transformation';

                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            }

            setupPasswordToggle() {
                document.querySelectorAll('.password-toggle').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const input = btn.previousElementSibling;
                        const icon = btn.querySelector('i');
                        
                        if (input.type === 'password') {
                            input.type = 'text';
                            icon.className = 'fas fa-eye-slash';
                        } else {
                            input.type = 'password';
                            icon.className = 'fas fa-eye';
                        }
                    });
                });
            }

            setupFormSubmission() {
                document.getElementById('login-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.showAlert('🎉 Login functionality will be implemented soon!', 'info');
                });

                document.getElementById('register-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.showAlert('🚀 Registration functionality will be implemented soon!', 'info');
                });
            }

            showAlert(message, type = 'info') {
                const alert = document.createElement('div');
                alert.className = `fixed top-4 right-4 z-50 p-4 rounded-xl text-white max-w-sm ${
                    type === 'success' ? 'bg-green-500/90' : 
                    type === 'error' ? 'bg-red-500/90' : 
                    'bg-blue-500/90'
                } backdrop-blur-sm border border-white/20`;
                
                alert.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span>${message}</span>
                        <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white/80 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                document.body.appendChild(alert);
                setTimeout(() => { if (alert.parentNode) alert.remove(); }, 5000);
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            new AuthPage();
        });
    </script>
</body>
</html>'''
        
        # Write the content to the file
        with open(auth_file_path, 'w', encoding='utf-8') as f:
            f.write(auth_content)
        
        return {"success": True, "message": f"✅ auth.html created successfully at {auth_file_path}"}
    
    except Exception as e:
        return {"success": False, "message": f"❌ Error creating auth.html: {str(e)}"}

@app.route('/debug')
def debug():
    """Debug route to check files and folders"""
    info = {
        "template_folder": app.template_folder,
        "static_folder": app.static_folder,
        "template_exists": os.path.exists(app.template_folder),
        "static_exists": os.path.exists(app.static_folder),
        "files": {}
    }
    
    # List template files
    if os.path.exists(app.template_folder):
        info["files"]["templates"] = []
        for root, dirs, files in os.walk(app.template_folder):
            for file in files:
                rel_path = os.path.relpath(os.path.join(root, file), app.template_folder)
                info["files"]["templates"].append(rel_path)
    
    # List static files
    if os.path.exists(app.static_folder):
        info["files"]["static"] = []
        for root, dirs, files in os.walk(app.static_folder):
            for file in files:
                rel_path = os.path.relpath(os.path.join(root, file), app.static_folder)
                info["files"]["static"].append(rel_path)
    
    return f"""
    <h1>🐛 LakshyaAI Debug Info</h1>
    <h2>📁 Paths:</h2>
    <ul>
        <li>Template folder: <code>{info['template_folder']}</code> - Exists: {info['template_exists']}</li>
        <li>Static folder: <code>{info['static_folder']}</code> - Exists: {info['static_exists']}</li>
    </ul>
    
    <h2>📄 Template Files:</h2>
    <ul>
        {''.join(f'<li><code>{f}</code></li>' for f in info['files'].get('templates', []))}
    </ul>
    
    <h2>🎨 Static Files:</h2>
    <ul>
        {''.join(f'<li><code>{f}</code></li>' for f in info['files'].get('static', []))}
    </ul>
    
    <p><a href="/">← Back to Home</a> | <a href="/auth">Try Auth Page</a></p>
    """

@app.route('/features')
def features():
    return render_template('features.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/dashboard')
@auth_service.require_login
def dashboard():
    # Get current user
    user = auth_service.get_current_user()
    
    if not user:
        flash('Please log in to access dashboard', 'error')
        return redirect(url_for('auth'))
    
    # Check if dashboard_new.html exists before rendering
    dashboard_template = os.path.join(app.template_folder, 'dashboard.html')
    if os.path.exists(dashboard_template):
        return render_template('dashboard.html', user=user)
    else:
        # Fallback to old dashboard
        dashboard_template_old = os.path.join(app.template_folder, 'dashboard', 'dashboard.html')
        if os.path.exists(dashboard_template_old):
            return render_template('dashboard/dashboard.html', user=user)
        else:
            return "<h1>Dashboard template not found!</h1>", 404

@app.route('/dashboard/jobs')
def dashboard_jobs():
    """Dashboard jobs page"""
    return render_template('dashboard/jobs.html')

@app.route('/dashboard/chat')
def dashboard_chat():
    """Dashboard chat/AI coach page"""
    return render_template('dashboard/chat.html')

@app.route('/dashboard/profile')
def dashboard_profile():
    """Dashboard profile page"""
    return render_template('dashboard/profile.html')

@app.route('/api/auth/login', methods=['POST'])
def login_api():
    """Handle user login"""
    if not auth_service:
        return jsonify({'status': 'error', 'message': 'Authentication service not available'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'status': 'error', 'message': 'Email and password are required'}), 400
        
        # Attempt login
        login_data = {'username_or_email': email, 'password': password}
        result = auth_service.login_user(login_data)
        
        if result.get('success'):
            # Store user session info
            user_data = result.get('user', {})
            session['user_id'] = user_data.get('id')
            session['user_email'] = user_data.get('email')
            session['user_name'] = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}"
            
            return jsonify({
                'status': 'success',
                'message': result.get('message', 'Login successful'),
                'user': user_data,
                'redirect': '/dashboard'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': result.get('error', 'Login failed')
            }), 401
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({'status': 'error', 'message': 'Login failed due to server error'}), 500

@app.route('/api/auth/register', methods=['POST'])
def register_api():
    """Handle user registration"""
    if not auth_service:
        return jsonify({'status': 'error', 'message': 'Authentication service not available'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'No data provided'}), 400
        
        # Extract required fields
        required_fields = ['firstName', 'lastName', 'email', 'password', 'phone', 'currentStatus']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'status': 'error', 
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Prepare user data
        email_username = data['email'].split('@')[0].lower()  # Generate username from email
        user_data = {
            'username': email_username,
            'first_name': data['firstName'],
            'last_name': data['lastName'],
            'email': data['email'],
            'password': data['password'],
            'phone': data.get('phone'),
            'current_status': data.get('currentStatus'),
            'country_code': data.get('countryCode', '+91')
        }
        
        # Attempt registration
        result = auth_service.register_user(user_data)
        
        if result.get('success'):
            return jsonify({
                'status': 'success', 
                'message': result.get('message', 'Registration successful')
            }), 201
        else:
            return jsonify({
                'status': 'error', 
                'message': result.get('error', 'Registration failed')
            }), 400
            
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return jsonify({'status': 'error', 'message': 'Registration failed due to server error'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout_api():
    """Handle user logout"""
    try:
        session.clear()
        return jsonify({'status': 'success', 'message': 'Logged out successfully'}), 200
    except Exception as e:
        print(f"❌ Logout error: {e}")
        return jsonify({'status': 'error', 'message': 'Logout failed'}), 500

@app.route('/auth/logout')
def logout():
    """Handle user logout via GET request"""
    try:
        session.clear()
        flash('You have been logged out successfully', 'success')
        return redirect(url_for('auth'))
    except Exception as e:
        print(f"❌ Logout error: {e}")
        flash('Logout failed', 'error')
        return redirect(url_for('dashboard'))

@app.route('/ai-coach')
@app.route('/career-coach')
@app.route('/chat')
@auth_service.require_login
def ai_coach():
    user = auth_service.get_current_user()
    return render_template('ai-coach.html', user=user)

try:
    from ai_service import ai_coach
except ImportError:
    # Fallback if ai_service module is not found
    class MockAICoach:
        def get_career_response(self, message):
            return f"I understand you're asking about: '{message}'. This is a mock response while the AI service is being set up."
        
        def get_status(self):
            return {"status": "mock", "model": "fallback"}
        
        def get_fallback_response(self, message):
            return "AI service is currently unavailable. Please try again later."
    
    ai_coach = MockAICoach()

try:
    from adzuna_service import adzuna_service
    print("✅ Adzuna Job Service loaded successfully")
except ImportError as e:
    print(f"⚠️ Adzuna service not available: {e}")
    # Create a fallback service
    class FallbackJobService:
        def search_jobs(self, **kwargs):
            return {
                'success': False,
                'error': 'Job search service unavailable',
                'jobs': [],
                'count': 0
            }
        
        def get_job_categories(self):
            return {'success': False, 'error': 'Service unavailable'}
            
        def get_ai_enhanced_jobs(self, skills, preferences):
            return {'success': False, 'error': 'Service unavailable'}
    
    adzuna_service = FallbackJobService()

import time

@app.route('/api/ai-chat', methods=['POST'])
def ai_chat_endpoint():
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Message required'}), 400
        
        # Get AI response (no fine-tuning needed!)
        ai_response = ai_coach.get_career_response(user_message)
        
        return jsonify({
            'success': True,
            'response': ai_response,
            'timestamp': time.time(),
            'user': 'syashu16',
            'model_info': ai_coach.get_status()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'fallback': ai_coach.get_fallback_response(user_message or "help")
        }), 500

@app.route('/api/ai-status')
def ai_status_endpoint():
    return jsonify(ai_coach.get_status())

@app.route('/resume-analysis')
@auth_service.require_login
def resume_analysis():
    user = auth_service.get_current_user()
    return render_template('resume-analysis.html', user=user)

@app.route('/api/resume/ml-status')
def ml_status_endpoint():
    """Check ML service status for resume analysis"""
    try:
        if ml_service and ml_service.is_loaded:
            status = {
                'is_loaded': True,
                'models_available': [
                    'category_classifier',
                    'experience_predictor', 
                    'match_score_predictor',
                    'tfidf_vectorizers'
                ],
                'service_status': 'online',
                'model_count': 4
            }
        else:
            status = {
                'is_loaded': False,
                'models_available': [],
                'service_status': 'offline',
                'model_count': 0
            }
        
        return jsonify({
            'success': True,
            'status': status
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'status': {
                'is_loaded': False,
                'models_available': [],
                'service_status': 'error',
                'model_count': 0
            }
        }), 500

@app.route('/api/resume/health-check')
def resume_health_check():
    """Health check endpoint for resume analysis service"""
    try:
        return jsonify({
            'success': True,
            'status': 'healthy',
            'ml_service_available': ml_service is not None,
            'ml_service_loaded': ml_service.is_loaded if ml_service else False,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/resume/upload', methods=['POST'])
def resume_upload_api():
    """Resume upload endpoint that matches the frontend JavaScript"""
    try:
        print("🤖 Resume upload request received")
        
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file uploaded'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Get additional form data
        skills = request.form.get('skills', '')
        keywords = request.form.get('keywords', '')
        target_role = request.form.get('target_role', '')
        
        # Check file type
        allowed_extensions = {'.pdf', '.docx', '.doc', '.txt'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            return jsonify({
                'success': False,
                'error': f'File type {file_ext} not supported. Please upload PDF, DOCX, or TXT files.'
            }), 400
        
        # Read file content
        file_content = file.read()
        
        # Parse document if ML service is available
        if ml_service and ml_service.is_loaded:
            # Parse the document
            resume_text = ml_service.parse_document(file_content, file.filename)
            
            if not resume_text:
                return jsonify({
                    'success': False,
                    'error': 'Could not extract text from the document'
                }), 400
            
            # Analyze the resume
            analysis_result = ml_service.analyze_resume(resume_text)
            
            if 'error' in analysis_result:
                return jsonify({
                    'success': False,
                    'error': analysis_result['error'],
                    'message': analysis_result.get('message', '')
                }), 500
            
            # Add additional metadata
            analysis_result.update({
                'filename': file.filename,
                'file_size': len(file_content),
                'additional_skills': skills,
                'keywords': keywords,
                'target_role': target_role,
                'analysis_timestamp': datetime.now().isoformat()
            })
            
            return jsonify({
                'success': True,
                'analysis': analysis_result,
                'message': 'Resume analyzed successfully!'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'ML service not available',
                'message': 'Machine learning models are not loaded'
            }), 503
            
    except Exception as e:
        print(f"❌ Error in resume analysis: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'An error occurred during resume analysis'
        }), 500

@app.route('/api/analyze-resume', methods=['POST'])
def analyze_resume_api():
    try:
        print("🤖 Resume analysis request received")
        
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file uploaded'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Check file type
        allowed_extensions = {'.pdf', '.docx', '.doc', '.txt'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            return jsonify({
                'success': False,
                'error': f'File type {file_ext} not supported. Please upload PDF, DOCX, or TXT files.'
            }), 400
        
        # Read file content
        file_content = file.read()
        
        # Parse document if ML service is available
        if ml_service and ml_service.is_loaded:
            # Parse the document
            resume_text = ml_service.parse_document(file_content, file.filename)
            
            if not resume_text:
                return jsonify({
                    'success': False,
                    'error': 'Could not extract text from the document'
                }), 400
            
            # Use traditional analysis (reverted from BERT)
            if hasattr(ml_service, 'analyze_resume'):
                print("🔧 Using traditional ML analysis")
                analysis_result = ml_service.analyze_resume(resume_text)
            elif hasattr(ml_service, 'analyze_resume_enhanced'):
                print("🔧 Using enhanced analysis")
                analysis_result = ml_service.analyze_resume_enhanced(resume_text)
            else:
                print("⚠️ Using fallback analysis")
                analysis_result = {
                    'predicted_category': 'Software Engineering',
                    'predicted_experience': 3,
                    'extracted_skills': ['programming'],
                    'match_score': 75.0,
                    'analysis_method': 'fallback'
                }
            
            if 'error' in analysis_result:
                return jsonify({
                    'success': False,
                    'error': analysis_result['error'],
                    'message': analysis_result.get('message', '')
                }), 500
            
            # Get job recommendations
            job_recommendations = ml_service.get_job_recommendations(analysis_result)
            
            # Prepare response
            response_data = {
                'success': True,
                'filename': file.filename,
                'analysis': analysis_result,
                'job_recommendations': job_recommendations.get('recommendations', [])[:5],  # Top 5
                'message': 'Resume analyzed successfully!'
            }
            
            print(f"✅ Resume analysis completed for {file.filename}")
            print(f"   Category: {analysis_result.get('category', 'Unknown')}")
            print(f"   Experience: {analysis_result.get('predicted_experience', 0):.1f} years")
            print(f"   Skills: {analysis_result.get('total_skills_count', 0)} found")
            
            return jsonify(response_data)
        
        else:
            # Fallback response if ML service is not available
            return jsonify({
                'success': False,
                'error': 'ML service not available',
                'message': 'Please ensure the trained models are properly loaded'
            }), 500
            
    except Exception as e:
        print(f"❌ Resume analysis error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/job-matching')
@auth_service.require_login
def job_matching():
    user = auth_service.get_current_user()
    return render_template('job-matching.html', user=user)

@app.route('/api/job-search', methods=['POST'])
def job_search_api():
    try:
        data = request.json
        
        # Extract search parameters
        what = data.get('what', '').strip()
        where = data.get('where', '').strip()
        page = data.get('page', 1)
        results_per_page = data.get('results_per_page', 20)
        sort_by = data.get('sort_by', 'relevance')
        salary_min = data.get('salary_min')
        salary_max = data.get('salary_max')
        contract_type = data.get('contract_type')
        
        print(f"🔍 Job search request: '{what}' in '{where}' (page {page})")
        
        # Use Adzuna service to search for jobs
        search_results = adzuna_service.search_jobs(
            what=what,
            where=where,
            page=page,
            results_per_page=results_per_page,
            sort_by=sort_by,
            salary_min=salary_min,
            salary_max=salary_max,
            contract_type=contract_type
        )
        
        if search_results['success']:
            print(f"✅ Found {search_results['count']} jobs")
            return jsonify({
                'success': True,
                'jobs': search_results['jobs'],
                'count': search_results['count'],
                'total_pages': search_results.get('total_pages', 1),
                'current_page': page,
                'search_params': search_results.get('search_params', {}),
                'powered_by': 'Adzuna API',
                'timestamp': search_results.get('timestamp')
            })
        else:
            print(f"❌ Job search failed: {search_results.get('error')}")
            return jsonify({
                'success': False,
                'error': search_results.get('error', 'Job search failed'),
                'jobs': [],
                'count': 0
            }), 500
            
    except Exception as e:
        print(f"💥 Job search API error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'jobs': [],
            'count': 0
        }), 500

@app.route('/api/job-categories', methods=['GET'])
def job_categories_api():
    """Get available job categories"""
    try:
        categories = adzuna_service.get_job_categories()
        return jsonify(categories)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai-job-match', methods=['POST'])
def ai_job_match_api():
    """Get AI-enhanced job recommendations using ML service"""
    try:
        data = request.json
        user_skills = data.get('skills', ['python', 'javascript', 'react'])  # Default for developer
        preferences = {
            'location': data.get('location', 'Remote'),
            'min_salary': data.get('min_salary'),
            'contract_type': data.get('contract_type', 'full_time'),
            'work_style': data.get('work_style', 'remote')
        }
        
        print(f"🤖 AI job matching for skills: {user_skills}")
        
        # Use ML service for enhanced job matching
        if ml_service and ml_service.is_loaded:
            # Create a skills-based resume text for analysis
            skills_text = f"Professional with expertise in {', '.join(user_skills)}. "
            skills_text += f"Looking for {preferences.get('contract_type', 'full_time')} opportunities "
            skills_text += f"in {preferences.get('location', 'various locations')}."
            
            # Analyze the skills profile
            resume_analysis = ml_service.analyze_resume(skills_text)
            
            if 'error' not in resume_analysis:
                # Get AI-powered job recommendations
                ai_recommendations = ml_service.get_job_recommendations(resume_analysis, top_k=10)
                
                if ai_recommendations.get('success'):
                    jobs = ai_recommendations.get('recommendations', [])
                    
                    # Filter jobs based on preferences
                    filtered_jobs = []
                    for job in jobs:
                        # Apply salary filter
                        if preferences.get('min_salary'):
                            if job.get('salary_min', 0) < preferences['min_salary']:
                                continue
                        
                        # Apply location filter
                        if preferences.get('location') and preferences['location'].lower() != 'remote':
                            if preferences['location'].lower() not in job.get('location', '').lower():
                                continue
                        
                        # Enhance job with AI insights
                        job['ai_insights'] = {
                            'skill_match_score': job.get('match_score', 85),
                            'category_match': resume_analysis.get('category'),
                            'experience_level': resume_analysis.get('predicted_experience', 0),
                            'skills_alignment': f"{len(user_skills)} skills analyzed"
                        }
                        
                        filtered_jobs.append(job)
                    
                    return jsonify({
                        'success': True,
                        'jobs': filtered_jobs,
                        'count': len(filtered_jobs),
                        'ai_powered': True,
                        'user_profile': {
                            'skills': user_skills,
                            'preferences': preferences,
                            'predicted_category': resume_analysis.get('category'),
                            'experience_level': resume_analysis.get('predicted_experience', 0)
                        },
                        'timestamp': time.time()
                    })
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Failed to generate job recommendations',
                        'jobs': []
                    }), 500
            else:
                return jsonify({
                    'success': False,
                    'error': 'Failed to analyze skills profile',
                    'jobs': []
                }), 500
        else:
            # Fallback if ML service is not available
            return jsonify({
                'success': False,
                'error': 'ML service not available',
                'message': 'Please ensure the trained models are properly loaded',
                'jobs': []
            }), 500
        
    except Exception as e:
        print(f"❌ AI job match error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'jobs': []
        }), 500

@app.route('/skill-gap-analysis')
@auth_service.require_login
def skill_gap_analysis():
    user = auth_service.get_current_user()
    return render_template('skill-gap-analysis.html', user=user)

# New Advanced Analytics Routes
@app.route('/api/salary-insights', methods=['POST'])
def salary_insights_api():
    """Get salary insights for a specific job title and location"""
    try:
        data = request.json
        job_title = data.get('job_title', '')
        location = data.get('location', '')
        
        if not job_title:
            return jsonify({
                'success': False,
                'error': 'Job title is required'
            }), 400
        
        print(f"💰 Salary insights request: '{job_title}' in '{location}'")
        
        insights = adzuna_service.get_salary_insights(job_title, location)
        
        return jsonify(insights)
        
    except Exception as e:
        print(f"💥 Salary insights error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/trending-skills', methods=['POST'])
def trending_skills_api():
    """Get trending skills in the job market"""
    try:
        data = request.json or {}
        job_category = data.get('category', 'software developer')
        
        print(f"📈 Trending skills request for: '{job_category}'")
        
        trends = adzuna_service.get_trending_skills(job_category)
        
        return jsonify(trends)
        
    except Exception as e:
        print(f"💥 Trending skills error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/legacy-skill-gap-analysis', methods=['POST'])
def legacy_skill_gap_analysis_api():
    """Legacy analyze skill gaps between resume and job description"""
    try:
        print("🎯 Legacy skill gap analysis request received")
        
        data = request.json
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        resume_text = data.get('resume_text', '').strip()
        job_description = data.get('job_description', '').strip()
        
        if not resume_text:
            return jsonify({
                'success': False,
                'error': 'Resume text is required'
            }), 400
        
        if not job_description:
            return jsonify({
                'success': False,
                'error': 'Job description is required'
            }), 400
        
        # Perform skill gap analysis using ML service
        if ml_service and ml_service.is_loaded:
            analysis_result = ml_service.skill_gap_analysis(resume_text, job_description)
            
            if 'error' in analysis_result:
                return jsonify({
                    'success': False,
                    'error': analysis_result['error'],
                    'message': analysis_result.get('message', '')
                }), 500
            
            print(f"✅ Skill gap analysis completed")
            print(f"   Match percentage: {analysis_result.get('match_percentage', 0):.1f}%")
            print(f"   Missing skills: {len(analysis_result.get('missing_skills', []))}")
            
            return jsonify(analysis_result)
        
        else:
            return jsonify({
                'success': False,
                'error': 'ML service not available',
                'message': 'Please ensure the trained models are properly loaded'
            }), 500
            
    except Exception as e:
        print(f"❌ Skill gap analysis error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/location-insights', methods=['POST'])
def location_insights_api():
    """Get job market insights across different locations"""
    try:
        data = request.json
        job_title = data.get('job_title', '')
        
        if not job_title:
            return jsonify({
                'success': False,
                'error': 'Job title is required'
            }), 400
        
        print(f"🌍 Location insights request: '{job_title}'")
        
        insights = adzuna_service.get_location_insights(job_title)
        
        return jsonify(insights)
        
    except Exception as e:
        print(f"💥 Location insights error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/career-progression', methods=['POST'])
def career_progression_api():
    """Get career progression insights and recommendations"""
    try:
        data = request.json
        current_role = data.get('current_role', '')
        
        if not current_role:
            return jsonify({
                'success': False,
                'error': 'Current role is required'
            }), 400
        
        print(f"🚀 Career progression request: '{current_role}'")
        
        insights = adzuna_service.get_career_progression_insights(current_role)
        
        return jsonify(insights)
        
    except Exception as e:
        print(f"💥 Career progression error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Analytics Dashboard Route
@app.route('/analytics-dashboard')
@auth_service.require_login
def analytics_dashboard():
    user = auth_service.get_current_user()
    return render_template('analytics-dashboard-simple.html', user=user)

@app.route('/api/analyze-skills', methods=['POST'])
def analyze_skills_api():
    try:
        # Handle skill gap analysis with AI
        # TODO: Implement actual skill analysis with AI/ML models
        return jsonify({
            'success': True,
            'message': 'Skill analysis endpoint - implement with your AI service'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/interview-preparation')
@auth_service.require_login
def interview_preparation():
    user = auth_service.get_current_user()
    return render_template('interview-preparation.html', user=user)

@app.route('/interview-debug')
def interview_debug():
    """Debug page for testing interview functionality"""
    return app.send_static_file('../interview_debug.html')

@app.route('/api/interview-questions', methods=['POST'])
def interview_questions_api():
    try:
        data = request.json
        job_role = data.get('job_role', 'software-developer')
        experience_level = data.get('experience_level', 'mid')
        interview_type = data.get('interview_type', 'technical')
        company_context = data.get('company_context', '')
        
        print(f"🎯 Generating interview questions: {job_role} ({experience_level}) - {interview_type}")
        
        # Generate questions using dynamic service
        if dynamic_interview_service:
            questions = dynamic_interview_service.get_dynamic_questions(
                job_role, experience_level, interview_type, company_context
            )
        else:
            questions = generate_interview_questions(job_role, experience_level, interview_type, company_context)
        
        return jsonify({
            'success': True,
            'questions': questions,
            'session_id': f"interview_{int(time.time())}",
            'metadata': {
                'job_role': job_role,
                'experience_level': experience_level,
                'interview_type': interview_type,
                'company_context': company_context,
                'total_questions': len(questions)
            }
        })
        
    except Exception as e:
        print(f"💥 Interview questions error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analyze-interview', methods=['POST'])
def analyze_interview_api():
    try:
        data = request.json
        answers = data.get('answers', [])
        session_metadata = data.get('metadata', {})
        
        print(f"📊 Analyzing interview session with {len(answers)} answers")
        
        # Analyze the interview performance
        analysis = analyze_interview_performance(answers, session_metadata)
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'timestamp': time.time()
        })
        
    except Exception as e:
        print(f"💥 Interview analysis error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_interview_questions(job_role, experience_level, interview_type, company_context):
    """Generate interview questions based on parameters"""
    
    # Question templates based on role and type
    question_banks = {
        'software-developer': {
            'technical': [
                "Explain the concept of object-oriented programming and its key principles.",
                "What's the difference between SQL and NoSQL databases? When would you use each?",
                "How do you handle error handling and exceptions in your preferred programming language?",
                "Describe the software development lifecycle and your experience with different methodologies.",
                "What are design patterns? Can you explain a few that you've used?",
                "How do you optimize database queries for better performance?",
                "Explain the concept of RESTful APIs and how you would design one.",
                "What's your approach to code testing and quality assurance?",
                "How do you handle version control and collaboration in team projects?",
                "Describe a challenging technical problem you solved recently."
            ],
            'behavioral': [
                "Tell me about a time when you had to learn a new technology quickly.",
                "Describe a situation where you disagreed with a team member. How did you handle it?",
                "How do you prioritize tasks when working on multiple projects?",
                "Tell me about a project that didn't go as planned. What did you learn?",
                "Describe your ideal work environment and team dynamics.",
                "How do you stay updated with the latest technology trends?",
                "Tell me about a time when you had to meet a tight deadline.",
                "Describe a situation where you had to explain a complex technical concept to a non-technical person.",
                "How do you handle feedback and criticism?",
                "What motivates you to write clean, maintainable code?"
            ],
            'system-design': [
                "Design a URL shortening service like bit.ly. Consider scalability and performance.",
                "How would you design a chat application like WhatsApp?",
                "Design a file storage system like Google Drive or Dropbox.",
                "How would you architect a social media feed system?",
                "Design a ride-sharing service like Uber. Focus on matching drivers and riders.",
                "How would you design a search engine for a large e-commerce site?",
                "Design a video streaming service like YouTube or Netflix.",
                "How would you build a real-time notification system?",
                "Design a distributed cache system like Redis.",
                "How would you architect a microservices-based e-commerce platform?"
            ]
        },
        'data-scientist': {
            'technical': [
                "Explain the bias-variance tradeoff in machine learning.",
                "How do you handle missing data in your datasets?",
                "What's the difference between supervised and unsupervised learning?",
                "Describe your approach to feature engineering and selection.",
                "How do you evaluate the performance of a machine learning model?",
                "Explain overfitting and how to prevent it.",
                "What's your experience with A/B testing and statistical significance?",
                "How do you handle imbalanced datasets?",
                "Describe the process of building and deploying a machine learning model.",
                "What's your approach to data visualization and storytelling?"
            ],
            'behavioral': [
                "Tell me about a data science project that had significant business impact.",
                "How do you communicate complex analytical findings to stakeholders?",
                "Describe a time when your initial hypothesis was wrong. What did you do?",
                "How do you ensure data quality and integrity in your projects?",
                "Tell me about a time when you had to work with incomplete or messy data.",
                "How do you prioritize which metrics to focus on for a business problem?",
                "Describe your collaboration with engineering teams to deploy models.",
                "How do you stay current with new developments in data science?",
                "Tell me about a time when you had to present to senior executives.",
                "How do you handle ethical considerations in data science projects?"
            ]
        }
    }
    
    # Get appropriate questions
    role_questions = question_banks.get(job_role, question_banks['software-developer'])
    type_questions = role_questions.get(interview_type, role_questions['technical'])
    
    # Select questions based on experience level
    if experience_level == 'entry':
        selected_questions = type_questions[:6]  # Easier questions
    elif experience_level == 'senior':
        selected_questions = type_questions[4:]   # More advanced questions
    else:
        selected_questions = type_questions[2:8]  # Mid-level questions
    
    # Add company-specific context if provided
    if company_context:
        context_question = f"How would your skills and experience contribute to {company_context}'s goals and culture?"
        selected_questions.append(context_question)
    
    # Format questions with metadata
    formatted_questions = []
    for i, question in enumerate(selected_questions):
        formatted_questions.append({
            'id': i + 1,
            'question': question,
            'type': interview_type,
            'difficulty': get_question_difficulty(question, experience_level),
            'time_limit': get_time_limit(interview_type),
            'tips': get_question_tips(question, interview_type)
        })
    
    return formatted_questions

def get_question_difficulty(question, experience_level):
    """Determine question difficulty"""
    if experience_level == 'entry':
        return 'Easy'
    elif experience_level == 'senior':
        return 'Hard'
    else:
        return 'Medium'

def get_time_limit(interview_type):
    """Get recommended time limit for question type"""
    time_limits = {
        'technical': 300,      # 5 minutes
        'behavioral': 180,     # 3 minutes
        'system-design': 600,  # 10 minutes
        'hr-round': 120,       # 2 minutes
        'coding-challenge': 900 # 15 minutes
    }
    return time_limits.get(interview_type, 240)

def get_question_tips(question, interview_type):
    """Get tips for answering the question"""
    if interview_type == 'behavioral':
        return [
            "Use the STAR method (Situation, Task, Action, Result)",
            "Be specific with examples from your experience",
            "Focus on your role and contributions",
            "End with what you learned or would do differently"
        ]
    elif interview_type == 'technical':
        return [
            "Think out loud and explain your reasoning",
            "Start with high-level concepts, then dive into details",
            "Use examples or analogies to clarify complex topics",
            "Ask clarifying questions if needed"
        ]
    elif interview_type == 'system-design':
        return [
            "Start by clarifying requirements and constraints",
            "Think about scalability and performance from the beginning",
            "Draw diagrams to visualize your architecture",
            "Discuss trade-offs and alternative approaches"
        ]
    else:
        return [
            "Take a moment to think before answering",
            "Be honest and authentic in your responses",
            "Ask for clarification if the question is unclear",
            "Keep your answer structured and concise"
        ]

def analyze_interview_performance(answers, metadata):
    """Analyze interview performance and provide feedback"""
    
    job_role = metadata.get('job_role', 'software-developer')
    interview_type = metadata.get('interview_type', 'technical')
    
    # Calculate basic metrics
    total_questions = len(answers)
    answered_questions = len([a for a in answers if a.get('answer', '').strip()])
    average_time = sum([a.get('time_taken', 0) for a in answers]) / max(total_questions, 1)
    
    # Analyze answer quality using AI coach
    detailed_feedback = []
    overall_scores = {'communication': 0, 'technical_depth': 0, 'clarity': 0, 'confidence': 0}
    
    for i, answer_data in enumerate(answers):
        question = answer_data.get('question', '')
        answer = answer_data.get('answer', '')
        time_taken = answer_data.get('time_taken', 0)
        
        if answer.strip():
            # Use AI coach to analyze the answer
            ai_feedback = get_ai_answer_feedback(question, answer, interview_type)
            
            feedback_item = {
                'question_number': i + 1,
                'question': question,
                'answer_length': len(answer.split()),
                'time_taken': time_taken,
                'ai_feedback': ai_feedback,
                'score': calculate_answer_score(answer, question, interview_type),
                'suggestions': get_improvement_suggestions(answer, question, interview_type)
            }
            detailed_feedback.append(feedback_item)
            
            # Update overall scores
            overall_scores['communication'] += feedback_item['score']
        else:
            detailed_feedback.append({
                'question_number': i + 1,
                'question': question,
                'answer_length': 0,
                'time_taken': time_taken,
                'ai_feedback': "No answer provided",
                'score': 0,
                'suggestions': ["Provide a complete answer to demonstrate your knowledge"]
            })
    
    # Calculate final scores
    if answered_questions > 0:
        for key in overall_scores:
            overall_scores[key] = min(100, (overall_scores[key] / answered_questions))
    
    # Generate overall assessment
    overall_performance = calculate_overall_performance(overall_scores, answered_questions, total_questions)
    
    return {
        'session_summary': {
            'total_questions': total_questions,
            'answered_questions': answered_questions,
            'completion_rate': (answered_questions / total_questions) * 100,
            'average_time_per_question': average_time,
            'interview_duration': sum([a.get('time_taken', 0) for a in answers])
        },
        'scores': overall_scores,
        'overall_performance': overall_performance,
        'detailed_feedback': detailed_feedback,
        'recommendations': generate_recommendations(overall_scores, interview_type, job_role),
        'next_steps': generate_next_steps(overall_performance, interview_type)
    }

def get_ai_answer_feedback(question, answer, interview_type):
    """Get AI feedback on an answer"""
    try:
        prompt = f"""
        As an expert interviewer, analyze this interview answer:
        
        Question: {question}
        Answer: {answer}
        Interview Type: {interview_type}
        
        Provide brief feedback on the answer quality, covering:
        1. Relevance to the question
        2. Technical accuracy (if applicable)
        3. Communication clarity
        4. Areas for improvement
        
        Keep feedback constructive and specific.
        """
        
        ai_response = ai_coach.get_career_response(prompt)
        return ai_response
    except:
        return "Answer provided. Consider adding more specific examples and technical details."

def calculate_answer_score(answer, question, interview_type):
    """Calculate a score for an answer (0-100)"""
    if not answer.strip():
        return 0
    
    score = 50  # Base score
    
    # Length analysis
    word_count = len(answer.split())
    if word_count >= 50:
        score += 20
    elif word_count >= 20:
        score += 10
    
    # Technical depth indicators
    technical_keywords = ['implement', 'design', 'optimize', 'scale', 'architecture', 'algorithm', 'database', 'api', 'framework', 'pattern']
    keyword_matches = sum(1 for keyword in technical_keywords if keyword.lower() in answer.lower())
    score += min(20, keyword_matches * 3)
    
    # Structure indicators
    structure_words = ['first', 'second', 'however', 'additionally', 'therefore', 'for example', 'in conclusion']
    structure_score = sum(1 for word in structure_words if word.lower() in answer.lower())
    score += min(10, structure_score * 2)
    
    return min(100, score)

def get_improvement_suggestions(answer, question, interview_type):
    """Generate improvement suggestions for an answer"""
    suggestions = []
    
    if len(answer.split()) < 20:
        suggestions.append("Provide more detailed explanations with specific examples")
    
    if interview_type == 'behavioral' and 'example' not in answer.lower():
        suggestions.append("Include specific examples from your experience using the STAR method")
    
    if interview_type == 'technical' and not any(tech in answer.lower() for tech in ['implement', 'design', 'code', 'algorithm']):
        suggestions.append("Add more technical details and implementation considerations")
    
    if not any(word in answer.lower() for word in ['because', 'therefore', 'as a result', 'due to']):
        suggestions.append("Explain your reasoning and thought process more clearly")
    
    return suggestions if suggestions else ["Good answer! Consider adding more specific examples to strengthen your response."]

def calculate_overall_performance(scores, answered, total):
    """Calculate overall performance rating"""
    avg_score = sum(scores.values()) / len(scores)
    completion_rate = (answered / total) * 100
    
    # Weight average score and completion rate
    final_score = (avg_score * 0.7) + (completion_rate * 0.3)
    
    if final_score >= 85:
        return {'rating': 'Excellent', 'description': 'Outstanding interview performance', 'color': 'green'}
    elif final_score >= 70:
        return {'rating': 'Good', 'description': 'Solid interview performance with room for improvement', 'color': 'blue'}
    elif final_score >= 55:
        return {'rating': 'Fair', 'description': 'Average performance, focus on key areas for improvement', 'color': 'yellow'}
    else:
        return {'rating': 'Needs Improvement', 'description': 'Significant improvement needed', 'color': 'red'}

def generate_recommendations(scores, interview_type, job_role):
    """Generate personalized recommendations"""
    recommendations = []
    
    if scores['communication'] < 70:
        recommendations.append("Practice explaining complex concepts in simple terms")
        recommendations.append("Work on structuring your answers with clear beginning, middle, and end")
    
    if scores['technical_depth'] < 70 and interview_type == 'technical':
        recommendations.append("Study core technical concepts relevant to your role")
        recommendations.append("Practice coding problems and system design scenarios")
    
    if scores['clarity'] < 70:
        recommendations.append("Slow down when speaking and organize your thoughts before answering")
        recommendations.append("Use specific examples to illustrate your points")
    
    # Role-specific recommendations
    if job_role == 'software-developer':
        recommendations.append("Review fundamental programming concepts and design patterns")
        recommendations.append("Practice explaining your code and decision-making process")
    elif job_role == 'data-scientist':
        recommendations.append("Brush up on statistics and machine learning fundamentals")
        recommendations.append("Practice explaining data insights to non-technical audiences")
    
    return recommendations

def generate_next_steps(performance, interview_type):
    """Generate next steps based on performance"""
    rating = performance['rating']
    
    if rating == 'Excellent':
        return [
            "You're interview-ready! Consider practicing with company-specific scenarios",
            "Focus on researching your target companies and their interview processes",
            "Continue practicing to maintain your skills"
        ]
    elif rating == 'Good':
        return [
            "Practice with more challenging questions in your weak areas",
            "Record yourself answering questions to improve delivery",
            "Schedule a few more mock interviews before the real thing"
        ]
    else:
        return [
            "Focus on fundamental concepts and structured answering techniques",
            "Practice regularly with a variety of question types",
            "Consider working with a mentor or career coach",
            "Build confidence through repeated practice sessions"
        ]

@app.route('/api/interview-coach', methods=['POST'])
def interview_coach_api():
    """Interview coach endpoint for personalized guidance"""
    try:
        data = request.json or {}
        question = data.get('question', '')
        user_concern = data.get('concern', '')
        interview_type = data.get('interview_type', 'technical')
        
        print(f"🤖 Interview coach request: {interview_type} - {question[:50]}...")
        
        # Get AI coach response if available
        if ai_coach:
            try:
                response = ai_coach.get_interview_guidance(question, user_concern, interview_type)
                return jsonify({
                    'success': True,
                    'guidance': response,
                    'timestamp': time.time()
                })
            except Exception as e:
                print(f"⚠️ AI Coach error: {e}")
                
        # Fallback guidance
        fallback_guidance = {
            'advice': f"For {interview_type} interviews, focus on clear communication and specific examples.",
            'tips': [
                'Structure your answers using the STAR method',
                'Practice your response out loud',
                'Research the company and role thoroughly',
                'Prepare thoughtful questions to ask'
            ],
            'confidence_boost': "You've got this! Practice makes perfect.",
            'ai_available': False
        }
        
        return jsonify({
            'success': True,
            'guidance': fallback_guidance,
            'timestamp': time.time()
        })
        
    except Exception as e:
        print(f"💥 Interview coach error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/interview-tips', methods=['GET'])
def interview_tips_api():
    """Get dynamic interview tips from external APIs"""
    try:
        print("💡 Fetching dynamic interview tips...")
        
        # Default fallback tips
        tips = {
            'before_interview': [
                "Research the company thoroughly",
                "Practice common questions",
                "Prepare specific examples",
                "Review your resume"
            ],
            'during_interview': [
                "Listen carefully to questions",
                "Use the STAR method",
                "Ask thoughtful questions",
                "Show enthusiasm"
            ],
            'after_interview': [
                "Send a thank-you email",
                "Reflect on your performance",
                "Follow up appropriately",
                "Continue practicing"
            ]
        }
        
        # Try to get dynamic tips if service is available
        if dynamic_interview_service:
            try:
                dynamic_tips = dynamic_interview_service.get_interview_tips()
                if dynamic_tips:
                    tips = dynamic_tips
            except Exception as e:
                print(f"⚠️ Dynamic interview service error: {e}")
                # Will use fallback tips
        
        return jsonify({
            'success': True,
            'tips': tips,
            'timestamp': time.time()
        })
        
    except Exception as e:
        print(f"💥 Interview tips error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/interview-resources/<resource_type>', methods=['GET'])
def interview_resources_api(resource_type):
    """Get interview resources by type"""
    try:
        print(f"📚 Fetching {resource_type} interview resources...")
        
        resources = {
            'technical': [
                {
                    'title': 'Cracking the Coding Interview',
                    'type': 'book',
                    'url': 'https://www.crackingthecodinginterview.com/',
                    'description': 'Comprehensive guide for technical interviews',
                    'free': False
                },
                {
                    'title': 'LeetCode',
                    'type': 'website',
                    'url': 'https://leetcode.com/',
                    'description': 'Practice coding problems',
                    'free': True
                },
                {
                    'title': 'HackerRank',
                    'type': 'website',
                    'url': 'https://www.hackerrank.com/',
                    'description': 'Coding challenges and skill assessment',
                    'free': True
                },
                {
                    'title': 'GeeksforGeeks',
                    'type': 'website',
                    'url': 'https://www.geeksforgeeks.org/',
                    'description': 'Programming tutorials and interview prep',
                    'free': True
                }
            ],
            'behavioral': [
                {
                    'title': 'STAR Method Guide',
                    'type': 'article',
                    'url': 'https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-method',
                    'description': 'Master the STAR method for behavioral questions',
                    'free': True
                },
                {
                    'title': 'Behavioral Interview Questions',
                    'type': 'resource',
                    'url': 'https://www.themuse.com/advice/30-behavioral-interview-questions-you-should-be-ready-to-answer',
                    'description': 'Common behavioral interview questions and answers',
                    'free': True
                }
            ],
            'system-design': [
                {
                    'title': 'High Scalability',
                    'type': 'website',
                    'url': 'http://highscalability.com/',
                    'description': 'Real-world system design examples',
                    'free': True
                },
                {
                    'title': 'System Design Primer',
                    'type': 'github',
                    'url': 'https://github.com/donnemartin/system-design-primer',
                    'description': 'Comprehensive system design guide',
                    'free': True
                }
            ],
            'general': [
                {
                    'title': 'Glassdoor',
                    'type': 'website',
                    'url': 'https://www.glassdoor.com/',
                    'description': 'Company reviews and interview experiences',
                    'free': True
                },
                {
                    'title': 'LinkedIn Learning',
                    'type': 'course',
                    'url': 'https://www.linkedin.com/learning/',
                    'description': 'Interview preparation courses',
                    'free': False
                }
            ]
        }
        
        resource_list = resources.get(resource_type, resources['general'])
        
        return jsonify({
            'success': True,
            'resources': resource_list,
            'resource_type': resource_type,
            'count': len(resource_list)
        })
        
    except Exception as e:
        print(f"💥 Interview resources error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/career-path-planner')
@auth_service.require_login
def career_path_planner():
    user = auth_service.get_current_user()
    return render_template('career-path-planner.html', user=user)

@app.route('/api/career-milestones', methods=['GET', 'POST'])
def career_milestones_api():
    try:
        # Handle career milestone management
        # TODO: Implement actual milestone tracking with database
        return jsonify({
            'success': True,
            'message': 'Career milestones endpoint - implement with your database'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/generate-action-plan', methods=['POST'])
def generate_action_plan_api():
    try:
        # Handle AI-powered action plan generation
        # TODO: Implement actual AI action plan generation
        return jsonify({
            'success': True,
            'message': 'Action plan generation endpoint - implement with your AI service'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Dynamic Skill Gap Analysis Routes
@app.route('/api/dynamic-skill-gap-analysis', methods=['POST'])
def dynamic_skill_gap_analysis():
    """ADZUNA-Based Dynamic skill gap analysis using REAL job market data"""
    try:
        print("🎯 ADZUNA Dynamic skill gap analysis request received")
        
        data = request.json
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400

        # Extract request data
        current_skills = data.get('current_skills', [])
        target_role = data.get('target_role', '')
        experience_level = data.get('experience_level', 'junior')
        
        if not current_skills or not target_role:
            return jsonify({
                'success': False,
                'error': 'Current skills and target role are required'
            }), 400

        print(f"🔍 ADZUNA JOB SEARCH for: {target_role}")
        print(f"📊 Current skills: {current_skills}")

        # Use Adzuna-based skill analyzer
        try:
            from adzuna_skill_analyzer import AdzunaSkillAnalyzer
            
            analyzer = AdzunaSkillAnalyzer()
            
            # Get skills from REAL Adzuna job postings
            print(f"📡 Fetching real job data from Adzuna...")
            market_analysis = analyzer.analyze_role_skills(target_role, max_jobs=40)
            
            if not market_analysis['success']:
                return jsonify({
                    'success': False,
                    'error': f'Failed to analyze market data: {market_analysis["error"]}',
                    'message': 'Adzuna API unavailable or role not found',
                    'suggestion': 'Try a different role name or check internet connection'
                }), 503
            
            # Compare user skills against real market demand
            gap_analysis = analyzer.compare_user_skills_to_market(current_skills, market_analysis)
            
            if not gap_analysis['success']:
                return jsonify({
                    'success': False,
                    'error': 'Skill gap analysis failed',
                    'message': 'Could not compare skills against market data'
                }), 500
            
            # Format response for frontend compatibility
            formatted_analysis = {
                'target_role': target_role,
                'experience_level': experience_level,
                'current_skills': current_skills,
                'readiness_score': gap_analysis['readiness_score'],
                'skills_acquired': gap_analysis['skills_matched'],
                'total_skills_needed': len(market_analysis['top_skills']),
                'skill_gaps': gap_analysis['skill_gaps'],
                'matched_skills': gap_analysis['matched_skills'],
                'recommended_skills': gap_analysis['recommendations'],
                'market_skills': market_analysis['top_skills'],
                'job_market_insights': {
                    'data_source': 'adzuna_real_jobs',
                    'jobs_analyzed': market_analysis['jobs_analyzed'],
                    'skills_analyzed': market_analysis['analysis_summary']['total_skills_found'],
                    'analysis_date': datetime.now().isoformat(),
                    'api_provider': 'Adzuna Jobs API',
                    'note': f'Analysis based on {market_analysis["jobs_analyzed"]} real job postings from Adzuna'
                }
            }
            
            return jsonify({
                'success': True,
                'analysis': formatted_analysis,
                'timestamp': datetime.now().isoformat(),
                'message': f'Dynamic analysis completed using {market_analysis["jobs_analyzed"]} real job postings',
                'data_source': 'adzuna_real_job_market',
                'no_static_data': True,
                'api_used': 'Adzuna Jobs API'
            })
                
        except Exception as api_error:
            print(f"⚠️ Adzuna API error: {api_error}")
            import traceback
            traceback.print_exc()
            
            # Return error instead of fallback to maintain truly dynamic approach
            return jsonify({
                'success': False,
                'error': f'Adzuna API error: {str(api_error)}',
                'message': 'Cannot provide dynamic analysis without real job market data',
                'suggestion': 'Try again later when Adzuna API is available or check API credentials'
            }), 503
            
    except Exception as e:
        print(f"❌ Error in Adzuna dynamic skill gap analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Dynamic analysis failed'
        }), 500


@app.route('/api/learning-resources/<skill_name>', methods=['GET'])
def get_learning_resources_for_skill_endpoint(skill_name):
    """Get learning resources for a specific skill using dynamic APIs"""
    try:
        print(f"📚 Learning resources request for: {skill_name}")
        
        if learning_resources_api:
            # Use dynamic learning resources API
            resources = learning_resources_api.get_learning_resources_for_skill(skill_name)
            
            # Convert to frontend-friendly format
            frontend_resources = []
            
            # Add YouTube videos
            for video in resources.get('youtube_videos', []):
                frontend_resources.append({
                    'name': video.get('title', 'YouTube Video'),
                    'url': video.get('url', ''),
                    'type': 'video',
                    'free': True,
                    'rating': video.get('rating', 4.5),
                    'description': f"Duration: {video.get('duration', 'N/A')} | Views: {video.get('views', 'N/A')}",
                    'platform': 'YouTube'
                })
            
            # Add GitHub repositories
            for repo in resources.get('github_repos', []):
                frontend_resources.append({
                    'name': repo.get('name', 'GitHub Repository'),
                    'url': repo.get('url', ''),
                    'type': 'repository',
                    'free': True,
                    'rating': repo.get('stars', 0) / 1000 + 3.5 if repo.get('stars', 0) > 0 else 4.0,
                    'description': repo.get('description', 'Open source learning repository'),
                    'platform': 'GitHub'
                })
            
            # Add free courses
            for course in resources.get('free_courses', []):
                frontend_resources.append({
                    'name': course.get('title', 'Free Course'),
                    'url': course.get('url', ''),
                    'type': 'course',
                    'free': True,
                    'rating': course.get('rating', 4.5),
                    'description': course.get('description', 'Free online course'),
                    'platform': course.get('platform', 'Online')
                })
            
            # Add documentation
            for doc in resources.get('documentation', []):
                frontend_resources.append({
                    'name': doc.get('title', 'Documentation'),
                    'url': doc.get('url', ''),
                    'type': 'documentation',
                    'free': True,
                    'rating': 4.8,
                    'description': doc.get('description', 'Official documentation'),
                    'platform': 'Official Docs'
                })
            
            # Add tutorials
            for tutorial in resources.get('tutorials', []):
                frontend_resources.append({
                    'name': tutorial.get('title', 'Tutorial'),
                    'url': tutorial.get('url', ''),
                    'type': 'tutorial',
                    'free': True,
                    'rating': tutorial.get('rating', 4.5),
                    'description': tutorial.get('description', 'Online tutorial'),
                    'platform': tutorial.get('platform', 'Tutorial Site')
                })
            
            return jsonify({
                'success': True,
                'skill': skill_name,
                'resources': frontend_resources,
                'total_resources': len(frontend_resources),
                'last_updated': resources.get('last_updated', ''),
                'source': 'dynamic_apis'
            })
        else:
            # Fallback to static resources database
            resources_db = {
            'javascript': [
                {
                    'name': 'JavaScript.info Tutorial',
                    'url': 'https://javascript.info/',
                    'type': 'tutorial',
                    'free': True,
                    'rating': 4.9,
                    'description': 'Modern JavaScript tutorial covering all aspects of the language'
                },
                {
                    'name': 'MDN JavaScript Guide',
                    'url': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
                    'type': 'documentation',
                    'free': True,
                    'rating': 4.8,
                    'description': 'Comprehensive JavaScript documentation by Mozilla'
                },
                {
                    'name': 'FreeCodeCamp JavaScript',
                    'url': 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
                    'type': 'course',
                    'free': True,
                    'rating': 4.8,
                    'description': 'Interactive JavaScript challenges and projects'
                }
            ],
            'react': [
                {
                    'name': 'React Official Tutorial',
                    'url': 'https://react.dev/learn',
                    'type': 'tutorial',
                    'free': True,
                    'rating': 4.9,
                    'description': 'Official React tutorial with modern hooks'
                },
                {
                    'name': 'FreeCodeCamp React',
                    'url': 'https://www.freecodecamp.org/learn/front-end-development-libraries/',
                    'type': 'course',
                    'free': True,
                    'rating': 4.8,
                    'description': 'Complete React course with projects'
                }
            ],
            'python': [
                {
                    'name': 'Python.org Tutorial',
                    'url': 'https://docs.python.org/3/tutorial/',
                    'type': 'tutorial',
                    'free': True,
                    'rating': 4.8,
                    'description': 'Official Python tutorial'
                },
                {
                    'name': 'FreeCodeCamp Python',
                    'url': 'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
                    'type': 'course',
                    'free': True,
                    'rating': 4.9,
                    'description': 'Scientific computing with Python'
                }
            ],
            'html': [
                {
                    'name': 'MDN HTML Tutorial',
                    'url': 'https://developer.mozilla.org/en-US/docs/Learn/HTML',
                    'type': 'tutorial',
                    'free': True,
                    'rating': 4.8,
                    'description': 'Complete HTML learning guide'
                }
            ],
            'css': [
                {
                    'name': 'MDN CSS Tutorial',
                    'url': 'https://developer.mozilla.org/en-US/docs/Learn/CSS',
                    'type': 'tutorial',
                    'free': True,
                    'rating': 4.8,
                    'description': 'Complete CSS learning guide'
                }
            ]
        }
        
        # Get resources for the skill (case-insensitive)
        skill_lower = skill_name.lower()
        resources = resources_db.get(skill_lower, [])
        
        # If no specific resources found, provide generic learning platforms
        if not resources:
            resources = [
                {
                    'name': f'{skill_name} on FreeCodeCamp',
                    'url': f'https://www.freecodecamp.org/news/search/?query={skill_name}',
                    'type': 'search',
                    'free': True,
                    'rating': 4.5,
                    'description': f'Search results for {skill_name} on FreeCodeCamp'
                },
                {
                    'name': f'{skill_name} on MDN',
                    'url': f'https://developer.mozilla.org/en-US/search?q={skill_name}',
                    'type': 'search',
                    'free': True,
                    'rating': 4.5,
                    'description': f'Search results for {skill_name} on MDN'
                }
            ]

        return jsonify({
            'success': True,
            'skill': skill_name,
            'resources': resources,
            'total_resources': len(resources)
        })

    except Exception as e:
        print(f"❌ Error getting learning resources: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/comprehensive-learning-path/<skill_name>', methods=['GET'])
def get_comprehensive_learning_path_endpoint(skill_name):
    """Get comprehensive learning path for a specific skill"""
    try:
        print(f"🎯 Comprehensive learning path request for: {skill_name}")
        
        if learning_resources_api:
            # Use dynamic learning resources API
            learning_path = learning_resources_api.get_comprehensive_learning_path(skill_name)
            
            return jsonify({
                'success': True,
                'skill': skill_name,
                'learning_path': learning_path,
                'source': 'dynamic_apis'
            })
        else:
            # Fallback response
            return jsonify({
                'success': False,
                'error': 'Dynamic learning resources API not available',
                'skill': skill_name,
                'learning_path': {
                    'skill': skill_name,
                    'total_resources': 0,
                    'learning_stages': {
                        'beginner': {
                            'description': f'Start here if you\'re new to {skill_name}',
                            'resources': []
                        },
                        'intermediate': {
                            'description': f'For those with basic knowledge of {skill_name}',
                            'resources': []
                        },
                        'advanced': {
                            'description': 'Advanced topics and real-world projects',
                            'resources': []
                        }
                    }
                }
            })
            
    except Exception as e:
        print(f"❌ Error getting comprehensive learning path: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
if __name__ == '__main__':
    print(f"📍 Template folder: {app.template_folder}")
    print(f"📍 Static folder: {app.static_folder}")
    print("🚀 Starting LakshyaAI server...")
    print("🏠 Homepage: http://localhost:5000")
    print("🤖 AI Coach: http://localhost:5000/ai-coach")
    print("🔐 Auth page: http://localhost:5000/auth")
    print("🐛 Debug info: http://localhost:5000/debug")
    print("📅 Server started on: 2025-07-22 05:20:49 UTC")
    print("👨‍💻 Developer: syashu16")
    app.run(debug=True, host='0.0.0.0', port=5000)