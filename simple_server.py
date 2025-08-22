#!/usr/bin/env python3
"""
Simple Flask starter for LakshyaAI job matching functionality
"""

from flask import Flask, render_template, request, jsonify
import os
import json
from datetime import datetime

# Get the directory where this script is located
basedir = os.path.abspath(os.path.dirname(__file__))

# Create Flask app with correct paths
app = Flask(__name__,
           template_folder=os.path.join(basedir, 'app/templates'),
           static_folder=os.path.join(basedir, 'app/static'))

app.secret_key = 'lakshyaai-simple-key'

print(f"📁 Template folder: {app.template_folder}")
print(f"📁 Static folder: {app.static_folder}")

@app.route('/')
def index():
    """Homepage"""
    return "<h1>LakshyaAI Backend Running!</h1><p><a href='/dashboard/jobs'>Go to Job Search</a></p>"

@app.route('/dashboard/jobs')
def jobs():
    """Job search page"""
    try:
        return render_template('dashboard/jobs.html')
    except Exception as e:
        return f"<h1>Error loading jobs template</h1><p>{str(e)}</p><p>Template folder: {app.template_folder}</p>"

@app.route('/api/job-search', methods=['POST'])
def job_search():
    """Job search API endpoint with demo data"""
    try:
        data = request.get_json() or {}
        
        # Extract search parameters
        what = data.get('what', '')
        where = data.get('where', '')
        page = data.get('page', 1)
        
        print(f"🔍 Job search: '{what}' in '{where}' (page {page})")
        
        # Demo job data
        demo_jobs = [
            {
                "id": "job_001",
                "title": "Senior Software Engineer",
                "company": {"display_name": "TechCorp Inc"},
                "location": {"display_name": "San Francisco, CA"},
                "description": "We are looking for a skilled Senior Software Engineer to join our dynamic team. You will work on cutting-edge projects using modern technologies including Python, JavaScript, React, and cloud platforms like AWS. Experience with microservices architecture and agile development practices preferred.",
                "salary_min": 120000,
                "salary_max": 160000,
                "contract_type": "permanent",
                "created": "2024-01-15T10:30:00Z",
                "redirect_url": "https://example.com/job/001",
                "category": {"label": "IT & Software"},
                "tags": ["Python", "JavaScript", "React", "AWS"]
            },
            {
                "id": "job_002",
                "title": "Frontend Developer",
                "company": {"display_name": "Design Studio"},
                "location": {"display_name": "New York, NY"},
                "description": "Join our creative team as a Frontend Developer. You'll be responsible for creating beautiful, responsive user interfaces using React, Vue.js, and modern CSS frameworks. Experience with TypeScript and testing frameworks is a plus.",
                "salary_min": 85000,
                "salary_max": 115000,
                "contract_type": "permanent",
                "created": "2024-01-14T14:20:00Z",
                "redirect_url": "https://example.com/job/002",
                "category": {"label": "IT & Software"},
                "tags": ["React", "Vue.js", "CSS", "TypeScript"]
            },
            {
                "id": "job_003",
                "title": "Data Scientist",
                "company": {"display_name": "Analytics Pro"},
                "location": {"display_name": "Austin, TX"},
                "description": "We're seeking a Data Scientist to help us unlock insights from complex datasets. Experience with Python, R, machine learning, and statistical analysis required. Knowledge of big data tools like Spark and Hadoop is preferred.",
                "salary_min": 95000,
                "salary_max": 140000,
                "contract_type": "permanent",
                "created": "2024-01-13T09:15:00Z",
                "redirect_url": "https://example.com/job/003",
                "category": {"label": "Data & Analytics"},
                "tags": ["Python", "R", "Machine Learning", "Statistics"]
            },
            {
                "id": "job_004",
                "title": "DevOps Engineer",
                "company": {"display_name": "CloudTech Solutions"},
                "location": {"display_name": "Remote"},
                "description": "Looking for a DevOps Engineer to help automate and streamline our deployment processes. Experience with Docker, Kubernetes, AWS, and CI/CD pipelines required. Strong background in Linux system administration preferred.",
                "salary_min": 100000,
                "salary_max": 135000,
                "contract_type": "permanent",
                "created": "2024-01-12T16:45:00Z",
                "redirect_url": "https://example.com/job/004",
                "category": {"label": "IT & Software"},
                "tags": ["Docker", "Kubernetes", "AWS", "CI/CD"]
            },
            {
                "id": "job_005",
                "title": "Product Manager",
                "company": {"display_name": "Innovation Labs"},
                "location": {"display_name": "Seattle, WA"},
                "description": "Drive product strategy and execution as a Product Manager. You'll work closely with engineering, design, and business teams to deliver exceptional products. Experience with agile methodologies and user research preferred.",
                "salary_min": 110000,
                "salary_max": 150000,
                "contract_type": "permanent",
                "created": "2024-01-11T11:30:00Z",
                "redirect_url": "https://example.com/job/005",
                "category": {"label": "Product Management"},
                "tags": ["Product Strategy", "Agile", "User Research"]
            }
        ]
        
        # Simple filtering
        filtered_jobs = []
        for job in demo_jobs:
            if what and what.lower() not in job['title'].lower() and what.lower() not in job['description'].lower():
                continue
            if where and where.lower() not in job['location']['display_name'].lower():
                continue
            filtered_jobs.append(job)
        
        response = {
            'success': True,
            'jobs': filtered_jobs,
            'count': len(filtered_jobs),
            'current_page': page,
            'total_pages': 1,
            'message': f'Found {len(filtered_jobs)} jobs'
        }
        
        print(f"✅ Returning {len(filtered_jobs)} jobs")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Job search error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'jobs': [],
            'count': 0
        }), 500

@app.route('/api/job-categories', methods=['GET'])
def job_categories():
    """Get job categories"""
    categories = [
        {"id": "it-software", "name": "IT & Software", "count": 1250},
        {"id": "marketing", "name": "Marketing", "count": 890},
        {"id": "sales", "name": "Sales", "count": 756},
        {"id": "finance", "name": "Finance", "count": 634},
        {"id": "healthcare", "name": "Healthcare", "count": 523},
        {"id": "education", "name": "Education", "count": 445}
    ]
    
    return jsonify({
        'success': True,
        'categories': categories
    })

if __name__ == '__main__':
    print("🚀 Starting LakshyaAI Job Matching Server...")
    print("📍 Job Search: http://localhost:5000/dashboard/jobs")
    print("🔗 API Endpoint: http://localhost:5000/api/job-search")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
