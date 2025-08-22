"""
Database Setup Helper for LakshyaAI
Tries different MySQL configurations to connect
"""

import mysql.connector
from mysql.connector import Error

def try_mysql_connection():
    """Try different MySQL configurations"""
    
    # Common MySQL configurations to try
    configs = [
        {'host': 'localhost', 'user': 'root', 'password': ''},
        {'host': 'localhost', 'user': 'root', 'password': 'root'},
        {'host': 'localhost', 'user': 'root', 'password': 'admin'},
        {'host': 'localhost', 'user': 'root', 'password': 'password'},
        {'host': '127.0.0.1', 'user': 'root', 'password': ''},
        {'host': '127.0.0.1', 'user': 'root', 'password': 'root'},
    ]
    
    print("🔍 Trying to connect to MySQL...")
    
    for i, config in enumerate(configs, 1):
        try:
            print(f"   Attempt {i}: {config['user']}@{config['host']} with password: {'YES' if config['password'] else 'NO'}")
            connection = mysql.connector.connect(**config, timeout=5)
            
            if connection.is_connected():
                print(f"✅ Success! Connected with configuration:")
                print(f"   Host: {config['host']}")
                print(f"   User: {config['user']}")
                print(f"   Password: {'***' if config['password'] else '(empty)'}")
                
                # Test creating database
                cursor = connection.cursor()
                cursor.execute("CREATE DATABASE IF NOT EXISTS lakshyai_db")
                cursor.execute("SHOW DATABASES LIKE 'lakshyai_db'")
                result = cursor.fetchone()
                
                if result:
                    print("✅ Database 'lakshyai_db' created/exists")
                    
                    # Update the config file
                    update_config_file(config)
                    
                    cursor.close()
                    connection.close()
                    return True
                
        except Error as e:
            print(f"   ❌ Failed: {e}")
            continue
        except Exception as e:
            print(f"   ❌ Error: {e}")
            continue
    
    print("\n❌ Could not connect to MySQL with any common configuration.")
    print("\n📋 Manual Setup Instructions:")
    print("1. Make sure MySQL is installed and running")
    print("2. Check MySQL service: Services → MySQL → Start")
    print("3. Try MySQL Workbench or command line to test connection")
    print("4. Common MySQL root passwords: '', 'root', 'admin', 'password'")
    print("5. If using XAMPP: Start MySQL from XAMPP Control Panel")
    print("6. If using WAMP: Start MySQL from WAMP menu")
    
    return False

def update_config_file(working_config):
    """Update database_config.py with working configuration"""
    try:
        # Read current file
        with open('database_config.py', 'r') as f:
            content = f.read()
        
        # Replace the config section
        old_config = """        self.config = {
            'host': 'localhost',
            'port': 3306,
            'user': 'root',
            'password': 'root',  # Update with your MySQL password - common defaults: '', 'root', 'admin'
            'database': 'lakshyai_db',
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci'
        }"""
        
        new_config = f"""        self.config = {{
            'host': '{working_config['host']}',
            'port': 3306,
            'user': '{working_config['user']}',
            'password': '{working_config['password']}',  # Working configuration found
            'database': 'lakshyai_db',
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci'
        }}"""
        
        updated_content = content.replace(old_config, new_config)
        
        # Write updated file
        with open('database_config.py', 'w') as f:
            f.write(updated_content)
            
        print("✅ Updated database_config.py with working configuration")
        
    except Exception as e:
        print(f"⚠️ Could not update config file: {e}")

if __name__ == "__main__":
    if try_mysql_connection():
        print("\n🎉 MySQL connection successful! You can now run:")
        print("   python database_config.py")
        print("   to create the database tables.")
    else:
        print("\n💡 Please set up MySQL and try again.")
