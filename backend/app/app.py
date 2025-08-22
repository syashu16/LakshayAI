from flask import Flask, render_template, request, jsonify
import requests
import os
from datetime import datetime
from werkzeug.utils import secure_filename

# Import our services
from services.resume_service import get_resume_service
from services.ml_resume_service import get_ml_service
from services.skill_gap_service import get_skill_gap_service

app = Flask(__name__)

# Configure for development
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Adzuna API configuration (demo data for now)
ADZUNA_APP_ID = "your_app_id"
ADZUNA_API_KEY = "your_api_key"
ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs"

@app.route('/')
def index():
    """Homepage"""
    return render_template('index.html')

@app.route('/auth')
def auth():
    """Authentication page"""
    return render_template('auth/auth.html')

@app.route('/dashboard')
def dashboard():
    """Main dashboard"""
    return render_template('dashboard/dashboard.html')

@app.route('/dashboard/jobs')
def jobs():
    """Job search page"""
    return render_template('dashboard/jobs.html')

@app.route('/dashboard/chat')
def chat():
    """AI chat page"""
    return render_template('dashboard/chat.html')

@app.route('/dashboard/profile')
def profile():
    """User profile page"""
    return render_template('dashboard/profile.html')

@app.route('/pages/about')
def about():
    """About page"""
    return render_template('pages/about.html')

@app.route('/pages/contact')
def contact():
    """Contact page"""
    return render_template('pages/contact.html')

@app.route('/pages/privacy')
def privacy():
    """Privacy policy page"""
    return render_template('pages/privacy.html')

@app.route('/api/job-search', methods=['POST'])
def job_search():
    """Job search API endpoint"""
    try:
        data = request.get_json()
        
        # Extract search parameters
        what = data.get('what', '')
        where = data.get('where', '')
        salary_min = data.get('salary_min')
        salary_max = data.get('salary_max')
        contract_type = data.get('contract_type')
        sort_by = data.get('sort_by', 'relevance')
        page = data.get('page', 1)
        
        # For now, return demo data
        # In production, you would integrate with Adzuna API or other job APIs
        demo_jobs = [
            {
                "id": "job_001",
                "title": "Software Engineer",
                "company": {"display_name": "Tech Corp"},
                "location": {"display_name": "San Francisco, CA"},
                "description": "We are looking for a skilled Software Engineer to join our dynamic team. You will work on cutting-edge projects using modern technologies including Python, JavaScript, and cloud platforms.",
                "salary_min": 80000,
                "salary_max": 120000,
                "contract_type": "permanent",
                "created": datetime.now().isoformat(),
                "redirect_url": "https://example.com/job/001",
                "category": {"label": "IT & Software"}
            },
            {
                "id": "job_002", 
                "title": "Frontend Developer",
                "company": {"display_name": "Design Studio"},
                "location": {"display_name": "New York, NY"},
                "description": "Join our creative team as a Frontend Developer. You'll be responsible for creating beautiful, responsive user interfaces using React, Vue.js, and modern CSS frameworks.",
                "salary_min": 70000,
                "salary_max": 100000,
                "contract_type": "permanent",
                "created": datetime.now().isoformat(),
                "redirect_url": "https://example.com/job/002",
                "category": {"label": "IT & Software"}
            },
            {
                "id": "job_003",
                "title": "Data Scientist",
                "company": {"display_name": "Analytics Inc"},
                "location": {"display_name": "Austin, TX"},
                "description": "We're seeking a Data Scientist to help us unlock insights from complex datasets. Experience with Python, R, machine learning, and statistical analysis required.",
                "salary_min": 90000,
                "salary_max": 140000,
                "contract_type": "permanent",
                "created": datetime.now().isoformat(),
                "redirect_url": "https://example.com/job/003",
                "category": {"label": "Data & Analytics"}
            },
            {
                "id": "job_004",
                "title": "Marketing Manager",
                "company": {"display_name": "Growth Co"},
                "location": {"display_name": "Remote"},
                "description": "Lead our marketing efforts as a Marketing Manager. You'll develop strategies, manage campaigns, and work with cross-functional teams to drive growth.",
                "salary_min": 65000,
                "salary_max": 95000,
                "contract_type": "permanent",
                "created": datetime.now().isoformat(),
                "redirect_url": "https://example.com/job/004",
                "category": {"label": "Marketing"}
            },
            {
                "id": "job_005",
                "title": "Product Manager",
                "company": {"display_name": "Innovation Labs"},
                "location": {"display_name": "Seattle, WA"},
                "description": "Drive product strategy and execution as a Product Manager. You'll work closely with engineering, design, and business teams to deliver exceptional products.",
                "salary_min": 100000,
                "salary_max": 150000,
                "contract_type": "permanent",
                "created": datetime.now().isoformat(),
                "redirect_url": "https://example.com/job/005",
                "category": {"label": "Product"}
            }
        ]
        
        # Filter jobs based on search criteria
        filtered_jobs = []
        for job in demo_jobs:
            # Simple text matching
            if what and what.lower() not in job['title'].lower() and what.lower() not in job['description'].lower():
                continue
            if where and where.lower() not in job['location']['display_name'].lower():
                continue
            if salary_min and job.get('salary_min', 0) < int(salary_min):
                continue
            if salary_max and job.get('salary_max', 0) > int(salary_max):
                continue
            if contract_type and job.get('contract_type') != contract_type:
                continue
                
            filtered_jobs.append(job)
        
        # Sort results
        if sort_by == 'salary':
            filtered_jobs.sort(key=lambda x: x.get('salary_max', 0), reverse=True)
        elif sort_by == 'date':
            filtered_jobs.sort(key=lambda x: x.get('created', ''), reverse=True)
        
        # Pagination
        per_page = 10
        start = (page - 1) * per_page
        end = start + per_page
        paginated_jobs = filtered_jobs[start:end]
        
        return jsonify({
            'success': True,
            'jobs': paginated_jobs,
            'count': len(filtered_jobs),
            'current_page': page,
            'total_pages': (len(filtered_jobs) + per_page - 1) // per_page,
            'message': f'Found {len(filtered_jobs)} jobs matching your criteria'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'An error occurred while searching for jobs'
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
        {"id": "education", "name": "Education", "count": 445},
        {"id": "engineering", "name": "Engineering", "count": 387},
        {"id": "design", "name": "Design", "count": 298}
    ]
    
    return jsonify({
        'success': True,
        'categories': categories
    })

@app.route('/api/ai-job-match', methods=['POST'])
def ai_job_match():
    """AI-powered job matching"""
    try:
        data = request.get_json()
        skills = data.get('skills', [])
        experience = data.get('experience', '')
        
        # Demo AI matching response
        return jsonify({
            'success': True,
            'recommendations': [
                {
                    'title': 'Senior Software Engineer',
                    'company': 'TechCorp',
                    'match_score': 92,
                    'reasons': ['Python expertise', 'Cloud experience', 'Leadership skills']
                },
                {
                    'title': 'Full Stack Developer', 
                    'company': 'StartupX',
                    'match_score': 87,
                    'reasons': ['JavaScript skills', 'React experience', 'API development']
                }
            ],
            'insights': {
                'top_skills': ['Python', 'JavaScript', 'React', 'AWS'],
                'skill_gaps': ['Kubernetes', 'Machine Learning'],
                'market_demand': 'High demand for your skill set'
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/salary-insights', methods=['POST'])
def salary_insights():
    """Get salary insights"""
    try:
        data = request.get_json()
        location = data.get('location', '')
        role = data.get('role', '')
        
        # Demo salary data
        return jsonify({
            'success': True,
            'insights': {
                'average_salary': 95000,
                'salary_range': {'min': 70000, 'max': 130000},
                'location_factor': 1.15,
                'growth_trend': '+8% year over year',
                'top_paying_companies': ['Google', 'Apple', 'Microsoft'],
                'benefits_average': ['Health Insurance', '401k', 'Remote Work']
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ====================
# RESUME ANALYSIS ROUTES
# ====================

@app.route('/dashboard/resume')
def resume_analysis():
    """Resume analysis page"""
    return render_template('dashboard/resume.html')

@app.route('/resume-analysis')
def resume_analysis_standalone():
    """Standalone resume analysis page"""
    return render_template('resume-analysis.html')

@app.route('/ai-coach')
def ai_coach():
    """AI coach page"""
    return render_template('ai-coach.html')

@app.route('/api/resume/upload', methods=['POST'])
def upload_resume():
    """Upload and analyze resume"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file uploaded'
            }), 400
        
        file = request.files['file']
        
        # Get additional data
        skills = request.form.get('skills', '')
        keywords = request.form.get('keywords', '')
        
        # Get resume service
        resume_service = get_resume_service()
        
        # Save uploaded file
        file_info = resume_service.save_uploaded_file(file)
        
        # Prepare additional data
        additional_data = {
            'skills': skills,
            'keywords': keywords
        }
        
        # Perform analysis
        analysis_result = resume_service.analyze_resume(file_info, additional_data)
        
        if analysis_result['success']:
            return jsonify({
                'success': True,
                'message': 'Resume analyzed successfully',
                'analysis': analysis_result
            })
        else:
            return jsonify({
                'success': False,
                'error': analysis_result.get('error', 'Analysis failed')
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resume/analyze-text', methods=['POST'])
def analyze_resume_text():
    """Analyze resume from raw text input"""
    try:
        data = request.get_json()
        
        if not data or 'content' not in data:
            return jsonify({
                'success': False,
                'error': 'No resume content provided'
            }), 400
        
        # Get ML service
        ml_service = get_ml_service()
        
        # Prepare resume data
        resume_data = {
            'content': data.get('content', ''),
            'skills': data.get('skills', ''),
            'keywords': data.get('keywords', ''),
        }
        
        # Perform ML analysis
        analysis_result = ml_service.analyze_resume(resume_data)
        
        if analysis_result['success']:
            return jsonify({
                'success': True,
                'message': 'Resume analyzed successfully',
                'analysis': analysis_result['analysis'],
                'model_info': analysis_result.get('model_info', {})
            })
        else:
            return jsonify({
                'success': False,
                'error': analysis_result.get('error', 'Analysis failed')
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resume/predict-category', methods=['POST'])
def predict_job_category():
    """Predict job category from resume content"""
    try:
        data = request.get_json()
        
        if not data or 'content' not in data:
            return jsonify({
                'success': False,
                'error': 'No content provided'
            }), 400
        
        # Get ML service
        ml_service = get_ml_service()
        
        # Perform analysis
        analysis_result = ml_service.analyze_resume({
            'content': data['content'],
            'skills': data.get('skills', ''),
            'keywords': data.get('keywords', '')
        })
        
        if analysis_result['success']:
            predictions = analysis_result['analysis'].get('predictions', {})
            
            return jsonify({
                'success': True,
                'predicted_category': predictions.get('job_category', 'Unknown'),
                'confidence': analysis_result['analysis'].get('confidence_scores', {}).get('job_category', 0),
                'top_categories': predictions.get('top_categories', []),
                'experience_level': predictions.get('experience_level', 'Unknown'),
                'skill_domain': predictions.get('skill_domain', 'Unknown')
            })
        else:
            return jsonify({
                'success': False,
                'error': analysis_result.get('error', 'Prediction failed')
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resume/get-recommendations', methods=['POST'])
def get_resume_recommendations():
    """Get personalized resume improvement recommendations"""
    try:
        data = request.get_json()
        
        if not data or 'content' not in data:
            return jsonify({
                'success': False,
                'error': 'No content provided'
            }), 400
        
        # Get ML service
        ml_service = get_ml_service()
        
        # Perform analysis
        analysis_result = ml_service.analyze_resume({
            'content': data['content'],
            'skills': data.get('skills', ''),
            'keywords': data.get('keywords', '')
        })
        
        if analysis_result['success']:
            analysis_data = analysis_result['analysis']
            
            return jsonify({
                'success': True,
                'recommendations': analysis_data.get('recommendations', []),
                'overall_score': analysis_data.get('overall_score', 0),
                'predictions': analysis_data.get('predictions', {}),
                'input_stats': analysis_data.get('input_stats', {})
            })
        else:
            return jsonify({
                'success': False,
                'error': analysis_result.get('error', 'Analysis failed')
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resume/ml-status', methods=['GET'])
def get_ml_status():
    """Get ML service status"""
    try:
        ml_service = get_ml_service()
        status = ml_service.get_model_status()
        
        return jsonify({
            'success': True,
            'status': status
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resume/health-check', methods=['GET'])
def resume_health_check():
    """Health check for resume analysis service"""
    try:
        ml_service = get_ml_service()
        health = ml_service.health_check()
        
        return jsonify({
            'success': True,
            'health': health
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/skill-gap-analysis', methods=['POST'])
def analyze_skill_gap():
    """Dynamic skill gap analysis with real-time job market data"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        current_skills = data.get('current_skills', [])
        target_role = data.get('target_role', '')
        experience_level = data.get('experience_level', 'junior')
        
        if not current_skills or not target_role:
            return jsonify({
                'success': False,
                'error': 'Current skills and target role are required'
            }), 400
        
        # Get skill gap service
        skill_gap_service = get_skill_gap_service()
        
        # Perform dynamic analysis
        analysis_result = skill_gap_service.analyze_skill_gap(
            current_skills=current_skills,
            target_role=target_role,
            experience_level=experience_level
        )
        
        return jsonify(analysis_result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'An error occurred during skill gap analysis'
        }), 500

@app.route('/api/learning-resources/<skill_name>', methods=['GET'])
def get_learning_resources(skill_name):
    """Get learning resources for a specific skill"""
    try:
        skill_gap_service = get_skill_gap_service()
        
        # Get resources for the skill
        resources = skill_gap_service.get_learning_resources([{'name': skill_name}])
        
        return jsonify({
            'success': True,
            'skill': skill_name,
            'resources': resources.get(skill_name, []),
            'total_resources': len(resources.get(skill_name, []))
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
