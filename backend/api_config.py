"""
Free APIs Configuration for Dynamic Skill Gap Analysis
Add your API keys to environment variables or this config file
"""

import os

# =============================================================================
# FREE APIs FOR JOB DATA AND SKILL REQUIREMENTS
# =============================================================================

# 1. ADZUNA JOBS API (Free tier: 1000 calls/month)
# Sign up: https://developer.adzuna.com/
ADZUNA_CONFIG = {
    'app_id': os.getenv('ADZUNA_APP_ID', 'your_app_id_here'),
    'app_key': os.getenv('ADZUNA_APP_KEY', 'your_app_key_here'),
    'base_url': 'https://api.adzuna.com/v1/api/jobs',
    'countries': ['us', 'gb', 'au', 'ca'],  # Supported countries
    'free_limit': 1000  # calls per month
}

# 2. JSEARCH API (RapidAPI - Free tier: 150 requests/month)
# Sign up: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
JSEARCH_CONFIG = {
    'api_key': os.getenv('RAPIDAPI_KEY', 'your_rapidapi_key_here'),
    'host': 'jsearch.p.rapidapi.com',
    'base_url': 'https://jsearch.p.rapidapi.com',
    'free_limit': 150  # requests per month
}

# 3. REMOTIVE JOBS API (Completely Free - No API key needed)
# Documentation: https://remotive.io/api
REMOTIVE_CONFIG = {
    'base_url': 'https://remotive.io/api/remote-jobs',
    'categories': ['software-dev', 'data', 'devops', 'design', 'marketing'],
    'free_limit': 'unlimited'
}

# 4. GITHUB JOBS ALTERNATIVE - GitHub Search API (Free: 60 requests/hour)
# Uses GitHub repository data to identify trending skills
GITHUB_CONFIG = {
    'base_url': 'https://api.github.com',
    'token': os.getenv('GITHUB_TOKEN', ''),  # Optional - increases rate limit
    'free_limit': 60  # per hour without token, 5000 with token
}

# =============================================================================
# FREE APIs FOR LEARNING RESOURCES
# =============================================================================

# 1. YOUTUBE DATA API v3 (Free: 10,000 units/day)
# Sign up: https://console.developers.google.com/
YOUTUBE_CONFIG = {
    'api_key': os.getenv('YOUTUBE_API_KEY', 'your_youtube_api_key_here'),
    'base_url': 'https://www.googleapis.com/youtube/v3',
    'free_limit': 10000  # units per day
}

# 2. COURSERA API (Limited free access)
# Documentation: https://tech.coursera.org/app-platform/catalog/
COURSERA_CONFIG = {
    'base_url': 'https://api.coursera.org/api',
    'free_courses_url': 'https://www.coursera.org/courses?query=free',
    'note': 'Limited API access, recommend web scraping or curated list'
}

# 3. EDAMAM RECIPE API - Can be adapted for course recommendations
# Sign up: https://developer.edamam.com/
EDAMAM_CONFIG = {
    'app_id': os.getenv('EDAMAM_APP_ID', 'your_edamam_app_id'),
    'app_key': os.getenv('EDAMAM_APP_KEY', 'your_edamam_app_key'),
    'base_url': 'https://api.edamam.com/search',
    'free_limit': 5  # calls per minute
}

# =============================================================================
# COMPLETELY FREE RESOURCES (No API Key Required)
# =============================================================================

FREE_LEARNING_PLATFORMS = {
    'freecodecamp': {
        'name': 'FreeCodeCamp',
        'base_url': 'https://www.freecodecamp.org/learn',
        'categories': {
            'web': 'responsive-web-design',
            'javascript': 'javascript-algorithms-and-data-structures',
            'frontend': 'front-end-development-libraries',
            'data': 'data-visualization',
            'api': 'back-end-development-and-apis',
            'python': 'scientific-computing-with-python',
            'ml': 'machine-learning-with-python'
        }
    },
    'mdn': {
        'name': 'MDN Web Docs',
        'base_url': 'https://developer.mozilla.org/en-US/docs/Learn',
        'categories': {
            'html': 'HTML',
            'css': 'CSS', 
            'javascript': 'JavaScript',
            'web': 'Web'
        }
    },
    'w3schools': {
        'name': 'W3Schools',
        'base_url': 'https://www.w3schools.com',
        'categories': {
            'html': 'html',
            'css': 'css',
            'javascript': 'js',
            'python': 'python',
            'sql': 'sql',
            'react': 'react'
        }
    },
    'codecademy_free': {
        'name': 'Codecademy (Free Courses)',
        'base_url': 'https://www.codecademy.com/catalog/subject/all',
        'note': 'Has free tier courses'
    }
}

# =============================================================================
# SKILL MAPPING AND MARKET DATA
# =============================================================================

SKILL_CATEGORIES = {
    'frontend': ['HTML', 'CSS', 'JavaScript', 'React', 'Vue.js', 'Angular', 'TypeScript'],
    'backend': ['Node.js', 'Python', 'Java', 'Express.js', 'Django', 'Flask', 'Spring'],
    'database': ['SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch'],
    'cloud': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform'],
    'data_science': ['Python', 'R', 'Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn'],
    'ml_ai': ['TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP'],
    'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic'],
    'devops': ['Git', 'Jenkins', 'CI/CD', 'Linux', 'Bash', 'Docker', 'Kubernetes']
}

TRENDING_SKILLS_2024 = [
    'Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
    'Machine Learning', 'TensorFlow', 'Git', 'SQL', 'MongoDB', 'TypeScript',
    'Vue.js', 'Django', 'Flask', 'PostgreSQL', 'Redis', 'GraphQL', 'REST API'
]

# =============================================================================
# SETUP INSTRUCTIONS
# =============================================================================

SETUP_INSTRUCTIONS = """
🚀 HOW TO SET UP FREE APIs FOR DYNAMIC SKILL GAP ANALYSIS

1. ADZUNA JOBS API (Recommended - Best free job data):
   - Visit: https://developer.adzuna.com/
   - Create free account
   - Get App ID and App Key
   - Add to environment: ADZUNA_APP_ID, ADZUNA_APP_KEY
   - Free tier: 1000 API calls/month

2. YOUTUBE DATA API (For learning resources):
   - Visit: https://console.developers.google.com/
   - Create project → Enable YouTube Data API v3
   - Create credentials → API Key
   - Add to environment: YOUTUBE_API_KEY
   - Free tier: 10,000 units/day

3. RAPIDAPI JSEARCH (Optional - Additional job data):
   - Visit: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
   - Subscribe to free plan
   - Get RapidAPI key
   - Add to environment: RAPIDAPI_KEY
   - Free tier: 150 requests/month

4. GITHUB TOKEN (Optional - Increases rate limits):
   - Visit: https://github.com/settings/tokens
   - Generate personal access token
   - Add to environment: GITHUB_TOKEN
   - Increases rate limit from 60 to 5000 requests/hour

5. NO API KEY NEEDED:
   - Remotive Jobs API (unlimited)
   - FreeCodeCamp curriculum data
   - MDN Web Docs
   - W3Schools tutorials

📝 ENVIRONMENT VARIABLES:
Create a .env file in your backend directory:

ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
YOUTUBE_API_KEY=your_youtube_api_key
RAPIDAPI_KEY=your_rapidapi_key
GITHUB_TOKEN=your_github_token

🔄 FALLBACK STRATEGY:
The system works even without API keys by using:
- Curated skill databases
- Static learning resource mappings
- Generic job requirement patterns
- Free educational platform links
"""

if __name__ == "__main__":
    print(SETUP_INSTRUCTIONS)
