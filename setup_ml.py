#!/usr/bin/env python3
"""
ML Resume Analysis Setup Script
Sets up the ML-powered resume analysis system for LakshyaAI
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def print_header():
    """Print a nice header for the setup script"""
    print("="*70)
    print("🤖 ML RESUME ANALYSIS SETUP")
    print("   LakshyaAI - Machine Learning Integration")
    print("="*70)

def check_python_version():
    """Check if Python version is compatible"""
    print("🐍 Checking Python version...")
    
    version = sys.version_info
    
    if version.major == 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - Compatible")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} - Requires Python 3.8+")
        return False

def install_dependencies():
    """Install required Python packages"""
    print("\n📦 Installing ML dependencies...")
    
    requirements = [
        "scikit-learn==1.3.2",
        "pandas==2.1.4", 
        "numpy==1.24.3",
        "nltk==3.8.1",
        "PyPDF2==3.0.1",
        "python-docx==1.1.0",
        "joblib==1.3.2",
        "flask",
        "werkzeug"
    ]
    
    for package in requirements:
        try:
            print(f"  Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package], 
                                stdout=subprocess.DEVNULL, 
                                stderr=subprocess.DEVNULL)
            print(f"  ✅ {package}")
        except subprocess.CalledProcessError:
            print(f"  ❌ Failed to install {package}")
            return False
    
    print("✅ All dependencies installed successfully!")
    return True

def setup_directories():
    """Create necessary directories"""
    print("\n📁 Setting up directories...")
    
    directories = [
        "trained_models",
        "app/static/uploads",
        "logs"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created: {directory}")
    
    return True

def check_models():
    """Check if ML models are trained and available"""
    print("\n🧠 Checking ML models...")
    
    model_files = [
        "trained_models/category_classifier.pkl",
        "trained_models/category_tfidf.pkl",
        "trained_models/experience_predictor.pkl",
        "trained_models/experience_tfidf.pkl",
        "trained_models/match_score_predictor.pkl",
        "trained_models/match_score_tfidf.pkl",
        "trained_models/skill_domain_classifier.pkl",
        "trained_models/skill_domain_tfidf.pkl",
        "trained_models/training_stats.json"
    ]
    
    missing_models = []
    
    for model_file in model_files:
        if os.path.exists(model_file):
            print(f"✅ {model_file}")
        else:
            print(f"❌ {model_file} - Missing")
            missing_models.append(model_file)
    
    if missing_models:
        print(f"\n⚠️ {len(missing_models)} model files are missing!")
        print("📝 Please run the Jupyter notebook 'model.ipynb' to train the models.")
        return False
    else:
        print("✅ All ML models are available!")
        return True

def test_ml_service():
    """Test the ML service"""
    print("\n🧪 Testing ML service...")
    
    try:
        # Add the app directory to Python path
        sys.path.insert(0, os.path.join(os.getcwd(), 'app'))
        
        from services.ml_resume_service import get_ml_service
        
        ml_service = get_ml_service()
        
        # Test health check
        health = ml_service.health_check()
        
        if health['status'] == 'healthy':
            print("✅ ML service is healthy and ready!")
            return True
        else:
            print(f"❌ ML service health check failed: {health}")
            return False
            
    except Exception as e:
        print(f"❌ ML service test failed: {e}")
        return False

def create_config_file():
    """Create a configuration file"""
    print("\n⚙️ Creating configuration...")
    
    config = {
        "ml_models_path": "trained_models",
        "upload_folder": "app/static/uploads",
        "max_file_size_mb": 10,
        "allowed_extensions": ["pdf", "doc", "docx", "txt"],
        "debug": True,
        "secret_key": "ml-resume-analysis-secret-key",
        "setup_completed": True,
        "setup_date": str(Path().resolve()),
        "version": "1.0.0"
    }
    
    with open("ml_config.json", "w") as f:
        json.dump(config, f, indent=2)
    
    print("✅ Configuration file created: ml_config.json")
    return True

def print_next_steps():
    """Print next steps for the user"""
    print("\n🎯 SETUP COMPLETE!")
    print("="*50)
    print("✅ ML Resume Analysis system is ready to use!")
    print("\n📝 Next Steps:")
    print("1. Start the Flask application:")
    print("   cd app && python app.py")
    print("\n2. Open your browser and visit:")
    print("   http://localhost:5000/resume-analysis")
    print("\n3. Upload a resume file and test the ML analysis!")
    print("\n4. API Endpoints available:")
    print("   • POST /api/resume/upload - Upload and analyze resume file")
    print("   • POST /api/resume/analyze-text - Analyze resume text directly") 
    print("   • GET /api/resume/ml-status - Check ML service status")
    print("   • GET /api/resume/health-check - Health check")
    print("\n🔧 Troubleshooting:")
    print("   • Run: python test_ml_integration.py")
    print("   • Check logs in the 'logs' directory")
    print("   • Verify models are trained in Jupyter notebook")
    print("="*50)

def main():
    """Main setup function"""
    print_header()
    
    # Check Python version
    if not check_python_version():
        print("\n❌ Setup failed: Incompatible Python version")
        return False
    
    # Install dependencies
    if not install_dependencies():
        print("\n❌ Setup failed: Could not install dependencies")
        return False
    
    # Setup directories
    if not setup_directories():
        print("\n❌ Setup failed: Could not create directories")
        return False
    
    # Check models
    models_available = check_models()
    
    # Test ML service (only if models are available)
    if models_available:
        ml_service_ok = test_ml_service()
    else:
        ml_service_ok = False
        print("⚠️ Skipping ML service test - models not available")
    
    # Create config
    if not create_config_file():
        print("\n❌ Setup failed: Could not create configuration")
        return False
    
    # Print results
    if models_available and ml_service_ok:
        print_next_steps()
        return True
    else:
        print("\n⚠️ PARTIAL SETUP COMPLETE")
        print("="*40)
        print("✅ Dependencies and directories are ready")
        print("❌ ML models need to be trained")
        print("\n📝 To complete setup:")
        print("1. Open and run the Jupyter notebook: model.ipynb")
        print("2. Run this setup script again after training models")
        print("3. Or run: python test_ml_integration.py")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
