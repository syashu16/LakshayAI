"""
Database Configuration for LakshyaAI
MySQL Database Setup and Management
"""

import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime
import bcrypt

class DatabaseManager:
    def __init__(self):
        """Initialize database connection"""
        self.connection = None
        self.cursor = None
        
        # Database configuration
        self.config = {
            'host': 'localhost',
            'port': 3306,
            'user': 'root',
            'password': 'yashu1601',  # User's MySQL password
            'database': 'lakshayai',
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci'
        }
        
    def connect(self):
        """Create database connection"""
        try:
            # First connect without database to create it if needed
            temp_config = self.config.copy()
            temp_config.pop('database')
            
            self.connection = mysql.connector.connect(**temp_config)
            self.cursor = self.connection.cursor()
            
            # Create database if it doesn't exist
            self.cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.config['database']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            self.cursor.execute(f"USE {self.config['database']}")
            
            print("✅ Database connection established successfully!")
            return True
            
        except Error as e:
            print(f"❌ Database connection error: {e}")
            return False
    
    def create_tables(self):
        """Create all necessary tables"""
        try:
            # Users table
            users_table = """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                profile_picture VARCHAR(255) DEFAULT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL DEFAULT NULL,
                login_count INT DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
            
            # User profiles table for additional information
            profiles_table = """
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                phone_number VARCHAR(20) DEFAULT NULL,
                date_of_birth DATE DEFAULT NULL,
                gender ENUM('male', 'female', 'other', 'prefer_not_to_say') DEFAULT NULL,
                location VARCHAR(100) DEFAULT NULL,
                bio TEXT DEFAULT NULL,
                current_job_title VARCHAR(100) DEFAULT NULL,
                experience_years INT DEFAULT 0,
                skills JSON DEFAULT NULL,
                education JSON DEFAULT NULL,
                preferences JSON DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
            
            # User sessions table
            sessions_table = """
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                session_token VARCHAR(255) UNIQUE NOT NULL,
                ip_address VARCHAR(45) DEFAULT NULL,
                user_agent TEXT DEFAULT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
            
            # Resume analysis history
            resume_analysis_table = """
            CREATE TABLE IF NOT EXISTS resume_analysis (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                filename VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) DEFAULT NULL,
                analysis_results JSON DEFAULT NULL,
                predicted_category VARCHAR(100) DEFAULT NULL,
                predicted_experience INT DEFAULT NULL,
                match_score DECIMAL(5,2) DEFAULT NULL,
                extracted_skills JSON DEFAULT NULL,
                recommendations JSON DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
            
            # Interview sessions
            interview_sessions_table = """
            CREATE TABLE IF NOT EXISTS interview_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                session_id VARCHAR(100) UNIQUE NOT NULL,
                job_role VARCHAR(100) NOT NULL,
                experience_level VARCHAR(50) DEFAULT NULL,
                interview_type VARCHAR(50) DEFAULT NULL,
                company_context VARCHAR(100) DEFAULT NULL,
                questions JSON DEFAULT NULL,
                answers JSON DEFAULT NULL,
                score DECIMAL(5,2) DEFAULT NULL,
                feedback JSON DEFAULT NULL,
                duration_minutes INT DEFAULT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP NULL DEFAULT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
            
            # Job searches and matches
            job_searches_table = """
            CREATE TABLE IF NOT EXISTS job_searches (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                search_query VARCHAR(255) NOT NULL,
                location VARCHAR(100) DEFAULT NULL,
                job_results JSON DEFAULT NULL,
                filters JSON DEFAULT NULL,
                results_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
            
            # Create all tables
            tables = [
                ('users', users_table),
                ('user_profiles', profiles_table),
                ('user_sessions', sessions_table),
                ('resume_analysis', resume_analysis_table),
                ('interview_sessions', interview_sessions_table),
                ('job_searches', job_searches_table)
            ]
            
            for table_name, table_sql in tables:
                self.cursor.execute(table_sql)
                print(f"✅ Table '{table_name}' created successfully!")
            
            self.connection.commit()
            print("🎉 All database tables created successfully!")
            return True
            
        except Error as e:
            print(f"❌ Table creation error: {e}")
            return False
    
    def hash_password(self, password):
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password, hashed_password):
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def create_user(self, username, email, password, first_name, last_name):
        """Create a new user"""
        try:
            # Check if user already exists
            check_query = "SELECT id FROM users WHERE username = %s OR email = %s"
            self.cursor.execute(check_query, (username, email))
            if self.cursor.fetchone():
                return False, "Username or email already exists"
            
            # Hash password
            password_hash = self.hash_password(password)
            
            # Insert new user
            insert_query = """
            INSERT INTO users (username, email, password_hash, first_name, last_name)
            VALUES (%s, %s, %s, %s, %s)
            """
            self.cursor.execute(insert_query, (username, email, password_hash, first_name, last_name))
            user_id = self.cursor.lastrowid
            
            # Create user profile
            profile_query = "INSERT INTO user_profiles (user_id) VALUES (%s)"
            self.cursor.execute(profile_query, (user_id,))
            
            self.connection.commit()
            print(f"✅ User '{username}' created successfully!")
            return True, "User created successfully"
            
        except Error as e:
            print(f"❌ User creation error: {e}")
            return False, str(e)
    
    def authenticate_user(self, username_or_email, password):
        """Authenticate user login"""
        try:
            # Find user by username or email
            query = """
            SELECT id, username, email, password_hash, first_name, last_name, is_active
            FROM users 
            WHERE (username = %s OR email = %s) AND is_active = TRUE
            """
            self.cursor.execute(query, (username_or_email, username_or_email))
            user = self.cursor.fetchone()
            
            if not user:
                return False, None, "User not found"
            
            # Verify password
            if not self.verify_password(password, user[3]):  # password_hash is at index 3
                return False, None, "Invalid password"
            
            # Update login count and last login
            update_query = """
            UPDATE users 
            SET login_count = login_count + 1, last_login = CURRENT_TIMESTAMP 
            WHERE id = %s
            """
            self.cursor.execute(update_query, (user[0],))
            self.connection.commit()
            
            # Return user data
            user_data = {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'first_name': user[4],
                'last_name': user[5],
                'full_name': f"{user[4]} {user[5]}"
            }
            
            print(f"✅ User '{user[1]}' authenticated successfully!")
            return True, user_data, "Login successful"
            
        except Error as e:
            print(f"❌ Authentication error: {e}")
            return False, None, str(e)
    
    def get_user_by_id(self, user_id):
        """Get user information by ID"""
        try:
            query = """
            SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
                   u.profile_picture, u.created_at, u.last_login, u.login_count,
                   p.phone_number, p.current_job_title, p.experience_years, p.location
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = %s AND u.is_active = TRUE
            """
            self.cursor.execute(query, (user_id,))
            user = self.cursor.fetchone()
            
            if user:
                return {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'first_name': user[3],
                    'last_name': user[4],
                    'full_name': f"{user[3]} {user[4]}",
                    'profile_picture': user[5],
                    'created_at': user[6],
                    'last_login': user[7],
                    'login_count': user[8],
                    'phone_number': user[9],
                    'current_job_title': user[10],
                    'experience_years': user[11],
                    'location': user[12]
                }
            return None
            
        except Error as e:
            print(f"❌ Get user error: {e}")
            return None
    
    def close(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        print("🔌 Database connection closed")

# Initialize database
def init_database():
    """Initialize database with tables"""
    db = DatabaseManager()
    if db.connect():
        if db.create_tables():
            print("🎉 Database initialization completed successfully!")
            
            # Create a test admin user
            success, message = db.create_user(
                username="admin",
                email="admin@lakshyai.com",
                password="admin123",
                first_name="Admin",
                last_name="User"
            )
            
            if success:
                print("✅ Admin user created: admin/admin123")
            else:
                print(f"ℹ️ Admin user: {message}")
                
        db.close()
        return True
    return False

if __name__ == "__main__":
    init_database()
