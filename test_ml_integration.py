#!/usr/bin/env python3
"""
Test Script for ML-Powered Resume Analysis Integration
Tests the ML models and Flask routes to ensure everything works correctly.
"""

import sys
import os
import requests
import json

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_ml_service():
    """Test the ML service directly"""
    print("🧪 Testing ML Service...")
    
    try:
        from services.ml_resume_service import get_ml_service
        
        ml_service = get_ml_service()
        
        # Test service status
        status = ml_service.get_model_status()
        print(f"📊 ML Service Status: {status['is_loaded']}")
        print(f"🎯 Models Available: {len(status['models_available'])}")
        
        # Test health check
        health = ml_service.health_check()
        print(f"❤️ Health Status: {health['status']}")
        
        # Test analysis
        sample_resume = {
            'content': 'Senior Software Engineer with 5 years of experience in Python, JavaScript, React, Django, machine learning, and cloud computing on AWS.',
            'skills': 'Python, JavaScript, React, Django, Machine Learning, AWS, Docker',
            'keywords': 'software engineer, full stack, machine learning, cloud computing'
        }
        
        result = ml_service.analyze_resume(sample_resume)
        
        if result['success']:
            analysis = result['analysis']
            print(f"✅ Analysis Success!")
            print(f"📈 Overall Score: {analysis.get('overall_score', 0)}")
            print(f"🎯 Predictions: {len(analysis.get('predictions', {}))}")
            print(f"💡 Recommendations: {len(analysis.get('recommendations', []))}")
            
            # Display key predictions
            predictions = analysis.get('predictions', {})
            if 'job_category' in predictions:
                print(f"📋 Job Category: {predictions['job_category']}")
            if 'experience_level' in predictions:
                print(f"⏰ Experience Level: {predictions['experience_level']}")
            
        else:
            print(f"❌ Analysis Failed: {result.get('error')}")
            
        return result['success']
        
    except Exception as e:
        print(f"❌ ML Service Test Failed: {e}")
        return False

def test_flask_routes():
    """Test Flask routes (requires Flask app to be running)"""
    print("\n🌐 Testing Flask Routes...")
    
    base_url = "http://localhost:5000"
    
    # Test ML status endpoint
    try:
        response = requests.get(f"{base_url}/api/resume/ml-status", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ ML Status Endpoint: {data['success']}")
        else:
            print(f"⚠️ ML Status Endpoint returned: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Flask app not running or unreachable: {e}")
        return False
    
    # Test health check endpoint
    try:
        response = requests.get(f"{base_url}/api/resume/health-check", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check Endpoint: {data['success']}")
        else:
            print(f"⚠️ Health Check Endpoint returned: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Health Check Failed: {e}")
    
    # Test text analysis endpoint
    try:
        test_data = {
            'content': 'Software Engineer with Python and machine learning experience',
            'skills': 'Python, Machine Learning, JavaScript',
            'keywords': 'software engineer, python, ml'
        }
        
        response = requests.post(
            f"{base_url}/api/resume/analyze-text",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Text Analysis Endpoint: {data['success']}")
            if data['success']:
                print(f"📊 Analysis Score: {data['analysis'].get('overall_score', 0)}")
        else:
            print(f"⚠️ Text Analysis Endpoint returned: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Text Analysis Test Failed: {e}")
    
    return True

def test_file_structure():
    """Test that all required files are in place"""
    print("\n📁 Testing File Structure...")
    
    required_files = [
        'trained_models/category_classifier.pkl',
        'trained_models/category_tfidf.pkl',
        'trained_models/experience_predictor.pkl',
        'trained_models/experience_tfidf.pkl',
        'trained_models/match_score_predictor.pkl',
        'trained_models/match_score_tfidf.pkl',
        'trained_models/skill_domain_classifier.pkl',
        'trained_models/skill_domain_tfidf.pkl',
        'trained_models/training_stats.json',
        'app/services/ml_resume_service.py',
        'app/services/resume_service.py'
    ]
    
    missing_files = []
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - MISSING")
            missing_files.append(file_path)
    
    if missing_files:
        print(f"\n⚠️ Missing {len(missing_files)} required files!")
        return False
    else:
        print(f"\n✅ All {len(required_files)} required files present!")
        return True

def generate_test_report():
    """Generate a comprehensive test report"""
    print("\n" + "="*60)
    print("🎯 ML RESUME ANALYSIS INTEGRATION TEST REPORT")
    print("="*60)
    
    # Test file structure
    file_test = test_file_structure()
    
    # Test ML service
    ml_test = test_ml_service()
    
    # Test Flask routes (optional - only if app is running)
    flask_test = test_flask_routes()
    
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    print(f"📁 File Structure: {'✅ PASS' if file_test else '❌ FAIL'}")
    print(f"🧠 ML Service: {'✅ PASS' if ml_test else '❌ FAIL'}")
    print(f"🌐 Flask Routes: {'✅ PASS' if flask_test else '⚠️ SKIP (App not running)'}")
    
    if file_test and ml_test:
        print("\n🎉 INTEGRATION TEST PASSED!")
        print("✅ Your ML-powered resume analysis is ready to use!")
        print("\n📝 Next Steps:")
        print("1. Run the Flask app: python app/app.py")
        print("2. Visit: http://localhost:5000/resume-analysis")
        print("3. Upload a resume and test the ML analysis!")
    else:
        print("\n❌ INTEGRATION TEST FAILED!")
        print("⚠️ Please check the error messages above and fix any issues.")
    
    print("="*60)

if __name__ == "__main__":
    generate_test_report()
