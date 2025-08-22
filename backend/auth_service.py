"""
Authentication Service for LakshyaAI
Handles user registration, login, sessions, and security
"""

import secrets
import hashlib
from datetime import datetime, timedelta
from database_config import DatabaseManager
from flask import session, request
import json

class AuthService:
    def __init__(self):
        """Initialize authentication service"""
        self.db = DatabaseManager()
        self.session_duration = timedelta(hours=24)  # 24-hour sessions
        
    def register_user(self, user_data):
        """Register a new user"""
        try:
            # Validate required fields
            required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
            for field in required_fields:
                if not user_data.get(field):
                    return {
                        'success': False,
                        'error': f'{field.replace("_", " ").title()} is required'
                    }
            
            # Validate email format
            if '@' not in user_data['email'] or '.' not in user_data['email']:
                return {
                    'success': False,
                    'error': 'Invalid email format'
                }
            
            # Validate username (alphanumeric + underscore)
            username = user_data['username'].strip()
            if len(username) < 3 or not username.replace('_', '').isalnum():
                return {
                    'success': False,
                    'error': 'Username must be at least 3 characters and contain only letters, numbers, and underscores'
                }
            
            # Validate password strength
            password = user_data['password']
            if len(password) < 6:
                return {
                    'success': False,
                    'error': 'Password must be at least 6 characters long'
                }
            
            # Connect to database
            if not self.db.connect():
                return {
                    'success': False,
                    'error': 'Database connection failed'
                }
            
            # Create user
            success, message = self.db.create_user(
                username=username.lower(),
                email=user_data['email'].lower().strip(),
                password=password,
                first_name=user_data['first_name'].strip().title(),
                last_name=user_data['last_name'].strip().title()
            )
            
            self.db.close()
            
            if success:
                return {
                    'success': True,
                    'message': 'Registration successful! You can now login.'
                }
            else:
                return {
                    'success': False,
                    'error': message
                }
                
        except Exception as e:
            if hasattr(self, 'db') and self.db.connection:
                self.db.close()
            return {
                'success': False,
                'error': f'Registration failed: {str(e)}'
            }
    
    def login_user(self, login_data):
        """Login user and create session"""
        try:
            username_or_email = login_data.get('username_or_email', '').strip()
            password = login_data.get('password', '')
            
            if not username_or_email or not password:
                return {
                    'success': False,
                    'error': 'Username/email and password are required'
                }
            
            # Connect to database
            if not self.db.connect():
                return {
                    'success': False,
                    'error': 'Database connection failed'
                }
            
            # Authenticate user
            success, user_data, message = self.db.authenticate_user(username_or_email.lower(), password)
            
            if success and user_data:
                # Create session
                session_token = self.create_session_token()
                
                # Store session in database
                self.store_session(user_data['id'], session_token)
                
                # Store session data
                session['user_id'] = user_data['id']
                session['username'] = user_data['username']
                session['full_name'] = user_data['full_name']
                session['session_token'] = session_token
                session['logged_in'] = True
                
                self.db.close()
                
                return {
                    'success': True,
                    'message': 'Login successful!',
                    'user': user_data,
                    'redirect': '/dashboard'
                }
            else:
                self.db.close()
                return {
                    'success': False,
                    'error': message
                }
                
        except Exception as e:
            if hasattr(self, 'db') and self.db.connection:
                self.db.close()
            return {
                'success': False,
                'error': f'Login failed: {str(e)}'
            }
    
    def create_session_token(self):
        """Create a secure session token"""
        random_bytes = secrets.token_bytes(32)
        timestamp = str(datetime.now().timestamp())
        combined = random_bytes + timestamp.encode()
        return hashlib.sha256(combined).hexdigest()
    
    def store_session(self, user_id, session_token):
        """Store session in database"""
        try:
            expires_at = datetime.now() + self.session_duration
            ip_address = request.environ.get('REMOTE_ADDR', 'unknown')
            user_agent = request.environ.get('HTTP_USER_AGENT', 'unknown')
            
            query = """
            INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
            VALUES (%s, %s, %s, %s, %s)
            """
            self.db.cursor.execute(query, (user_id, session_token, ip_address, user_agent, expires_at))
            self.db.connection.commit()
            
        except Exception as e:
            print(f"Session storage error: {e}")
    
    def logout_user(self):
        """Logout user and clear session"""
        try:
            # Deactivate session in database
            if 'session_token' in session:
                if self.db.connect():
                    query = "UPDATE user_sessions SET is_active = FALSE WHERE session_token = %s"
                    self.db.cursor.execute(query, (session['session_token'],))
                    self.db.connection.commit()
                    self.db.close()
            
            # Clear Flask session
            session.clear()
            
            return {
                'success': True,
                'message': 'Logged out successfully',
                'redirect': '/auth'
            }
            
        except Exception as e:
            session.clear()  # Clear session anyway
            return {
                'success': True,
                'message': 'Logged out successfully',
                'redirect': '/auth'
            }
    
    def is_logged_in(self):
        """Check if user is logged in"""
        return session.get('logged_in', False) and session.get('user_id') is not None
    
    def get_current_user(self):
        """Get current logged-in user"""
        if not self.is_logged_in():
            return None
        
        try:
            if self.db.connect():
                user = self.db.get_user_by_id(session.get('user_id'))
                self.db.close()
                return user
            return None
        except Exception as e:
            print(f"Get current user error: {e}")
            return None
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        if not user_id:
            return None
        
        try:
            if self.db.connect():
                user = self.db.get_user_by_id(user_id)
                self.db.close()
                return user
            return None
        except Exception as e:
            print(f"Get user by ID error: {e}")
            return None
    
    def require_login(self, f):
        """Decorator to require login for routes"""
        def decorated_function(*args, **kwargs):
            if not self.is_logged_in():
                if request.is_json:
                    return {
                        'success': False,
                        'error': 'Authentication required',
                        'redirect': '/auth'
                    }, 401
                else:
                    from flask import redirect, url_for
                    return redirect('/auth')
            return f(*args, **kwargs)
        decorated_function.__name__ = f.__name__
        return decorated_function
    
    def validate_session(self):
        """Validate current session"""
        if not self.is_logged_in():
            return False
        
        try:
            session_token = session.get('session_token')
            if not session_token:
                return False
            
            if self.db.connect():
                query = """
                SELECT user_id, expires_at FROM user_sessions 
                WHERE session_token = %s AND is_active = TRUE
                """
                self.db.cursor.execute(query, (session_token,))
                result = self.db.cursor.fetchone()
                self.db.close()
                
                if result and result[1] > datetime.now():
                    return True
                else:
                    # Session expired or invalid
                    session.clear()
                    return False
            
            return False
            
        except Exception as e:
            print(f"Session validation error: {e}")
            return False

# Global auth service instance
auth_service = AuthService()

def init_auth():
    """Initialize authentication service"""
    print("🔐 Authentication service initialized")
    return auth_service
