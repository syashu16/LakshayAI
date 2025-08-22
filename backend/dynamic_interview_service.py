"""
Dynamic Interview Preparation Service
Uses free APIs to provide comprehensive interview content
"""

import requests
import json
import random
import time
from typing import Dict, List, Any
from datetime import datetime

class DynamicInterviewService:
    def __init__(self):
        """Initialize dynamic interview service with free APIs"""
        print("🎯 Initializing Dynamic Interview Service...")
        
        # GitHub API for coding questions
        self.github_api_base = "https://api.github.com"
        
        # JSONPlaceholder for practice data
        self.jsonplaceholder_base = "https://jsonplaceholder.typicode.com"
        
        # Free Quote API for motivational content
        self.quotes_api = "https://api.quotable.io"
        
        # OpenAPI for job market data (free tier)
        self.jobs_api = "https://jobs.github.com/positions.json"
        
        # Company information from free API
        self.company_api = "https://api.github.com/search/repositories"
        
        print("✅ Dynamic Interview Service initialized!")
        
    def get_dynamic_questions(self, job_role: str, experience_level: str, interview_type: str, company_context: str = "") -> List[Dict]:
        """Generate dynamic interview questions using free APIs"""
        print(f"🔍 Generating dynamic questions for {job_role} ({experience_level}) - {interview_type}")
        
        questions = []
        
        if interview_type == "technical":
            questions = self._get_technical_questions(job_role, experience_level)
        elif interview_type == "behavioral":
            questions = self._get_behavioral_questions(experience_level)
        elif interview_type == "system-design":
            questions = self._get_system_design_questions(experience_level)
        elif interview_type == "hr-round":
            questions = self._get_hr_questions(company_context)
        elif interview_type == "coding-challenge":
            questions = self._get_coding_questions(job_role, experience_level)
        else:
            questions = self._get_mixed_questions(job_role, experience_level)
            
        # Add company-specific context if provided
        if company_context:
            questions = self._add_company_context(questions, company_context)
            
        return questions[:10]  # Return top 10 questions
    
    def _get_technical_questions(self, job_role: str, experience_level: str) -> List[Dict]:
        """Get technical questions from GitHub repositories and API data"""
        questions = []
        
        try:
            # Search for relevant repositories for technical questions
            search_terms = self._get_role_keywords(job_role)
            
            for term in search_terms[:3]:  # Limit API calls
                try:
                    url = f"{self.github_api_base}/search/repositories"
                    params = {
                        'q': f"{term} interview questions",
                        'sort': 'stars',
                        'order': 'desc',
                        'per_page': 5
                    }
                    
                    response = requests.get(url, params=params, timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        
                        for repo in data.get('items', [])[:2]:
                            question = self._create_technical_question(repo, job_role, experience_level)
                            if question:
                                questions.append(question)
                                
                except Exception as e:
                    print(f"⚠️ GitHub API error for {term}: {e}")
                    continue
                    
        except Exception as e:
            print(f"⚠️ Technical questions error: {e}")
            
        # Add fallback technical questions if API fails
        if len(questions) < 5:
            questions.extend(self._get_fallback_technical_questions(job_role, experience_level))
            
        return questions
    
    def _get_behavioral_questions(self, experience_level: str) -> List[Dict]:
        """Generate behavioral questions with motivational quotes"""
        questions = []
        
        try:
            # Get inspirational quotes for behavioral context
            response = requests.get(f"{self.quotes_api}/quotes?tags=leadership,success&limit=5", timeout=10)
            
            if response.status_code == 200:
                quotes_data = response.json()
                
                base_behavioral_questions = [
                    "Tell me about a time when you had to lead a difficult project.",
                    "Describe a situation where you had to work with a challenging team member.",
                    "How do you handle conflicts in the workplace?",
                    "Tell me about a time you failed and what you learned from it.",
                    "Describe your greatest professional achievement.",
                    "How do you prioritize tasks when everything seems urgent?",
                    "Tell me about a time you had to learn something new quickly.",
                    "Describe a situation where you disagreed with your manager.",
                    "How do you handle stress and pressure at work?",
                    "Tell me about a time you went above and beyond for a project."
                ]
                
                for i, base_q in enumerate(base_behavioral_questions[:8]):
                    quote_context = ""
                    if i < len(quotes_data.get('results', [])):
                        quote = quotes_data['results'][i]
                        quote_context = f"\n\nRemember: \"{quote.get('content', '')}\" - {quote.get('author', 'Unknown')}"
                    
                    questions.append({
                        'id': f'behavioral_{i+1}',
                        'question': base_q + quote_context,
                        'type': 'behavioral',
                        'difficulty': 'medium',
                        'expected_time': '3-5 minutes',
                        'tips': [
                            'Use the STAR method (Situation, Task, Action, Result)',
                            'Be specific with examples',
                            'Focus on your role and impact',
                            'Show what you learned'
                        ]
                    })
                    
        except Exception as e:
            print(f"⚠️ Behavioral questions error: {e}")
            questions = self._get_fallback_behavioral_questions(experience_level)
            
        return questions
    
    def _get_system_design_questions(self, experience_level: str) -> List[Dict]:
        """Generate system design questions with real-world examples"""
        questions = []
        
        try:
            # Get popular repositories for system design inspiration
            url = f"{self.github_api_base}/search/repositories"
            params = {
                'q': 'system design interview awesome',
                'sort': 'stars',
                'order': 'desc',
                'per_page': 5
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            base_designs = [
                "Design a URL shortening service like bit.ly",
                "Design a chat application like WhatsApp",
                "Design a social media feed like Twitter",
                "Design a video streaming service like YouTube",
                "Design a ride-sharing service like Uber",
                "Design a food delivery service like DoorDash",
                "Design a distributed cache system",
                "Design a search engine like Google",
                "Design a notification system",
                "Design a recommendation system"
            ]
            
            for i, design in enumerate(base_designs[:8]):
                complexity = "medium"
                if experience_level == "senior" or experience_level == "lead":
                    complexity = "high"
                elif experience_level == "entry":
                    complexity = "low"
                
                questions.append({
                    'id': f'system_design_{i+1}',
                    'question': design,
                    'type': 'system-design',
                    'difficulty': complexity,
                    'expected_time': '30-45 minutes',
                    'key_areas': [
                        'Scalability requirements',
                        'Database design',
                        'API design',
                        'Caching strategy',
                        'Load balancing',
                        'Security considerations'
                    ],
                    'tips': [
                        'Start with requirements gathering',
                        'Estimate scale and capacity',
                        'Design high-level architecture first',
                        'Deep dive into specific components',
                        'Discuss trade-offs'
                    ]
                })
                
        except Exception as e:
            print(f"⚠️ System design questions error: {e}")
            questions = self._get_fallback_system_design_questions(experience_level)
            
        return questions
    
    def _get_hr_questions(self, company_context: str = "") -> List[Dict]:
        """Generate HR questions with company research"""
        questions = []
        
        try:
            company_info = ""
            if company_context:
                # Try to get company information from GitHub (if it's a tech company)
                try:
                    url = f"{self.github_api_base}/search/repositories"
                    params = {
                        'q': f"org:{company_context.lower()}",
                        'sort': 'stars',
                        'order': 'desc',
                        'per_page': 3
                    }
                    
                    response = requests.get(url, params=params, timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('items'):
                            company_info = f" at {company_context}"
                            
                except:
                    pass
            
            base_hr_questions = [
                f"Why do you want to work{company_info}?",
                "Tell me about yourself and your career journey.",
                "What are your salary expectations?",
                "Where do you see yourself in 5 years?",
                "What motivates you at work?",
                "Why are you leaving your current job?",
                "What are your strengths and weaknesses?",
                "How do you handle work-life balance?",
                f"What do you know about{company_info or ' our company'}?",
                "Do you have any questions for us?"
            ]
            
            for i, question in enumerate(base_hr_questions):
                questions.append({
                    'id': f'hr_{i+1}',
                    'question': question,
                    'type': 'hr-round',
                    'difficulty': 'medium',
                    'expected_time': '2-4 minutes',
                    'tips': [
                        'Be authentic and honest',
                        'Research the company beforehand',
                        'Prepare specific examples',
                        'Show enthusiasm and interest',
                        'Ask thoughtful questions'
                    ]
                })
                
        except Exception as e:
            print(f"⚠️ HR questions error: {e}")
            questions = self._get_fallback_hr_questions()
            
        return questions
    
    def _get_coding_questions(self, job_role: str, experience_level: str) -> List[Dict]:
        """Get coding challenges from GitHub and create problems"""
        questions = []
        
        try:
            # Search for algorithm and coding repositories
            search_terms = ['algorithms', 'leetcode', 'coding-interview', 'data-structures']
            
            for term in search_terms[:2]:
                try:
                    url = f"{self.github_api_base}/search/repositories"
                    params = {
                        'q': f"{term} {job_role.replace('-', ' ')}",
                        'sort': 'stars',
                        'order': 'desc',
                        'per_page': 3
                    }
                    
                    response = requests.get(url, params=params, timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        
                        for repo in data.get('items', [])[:2]:
                            question = self._create_coding_question(repo, experience_level)
                            if question:
                                questions.append(question)
                                
                except Exception as e:
                    print(f"⚠️ Coding questions error for {term}: {e}")
                    continue
                    
        except Exception as e:
            print(f"⚠️ Coding questions error: {e}")
            
        # Add fallback coding questions
        if len(questions) < 5:
            questions.extend(self._get_fallback_coding_questions(experience_level))
            
        return questions
    
    def _get_mixed_questions(self, job_role: str, experience_level: str) -> List[Dict]:
        """Get a mix of different question types"""
        questions = []
        
        # Get 3 technical, 3 behavioral, 2 system design, 2 HR
        questions.extend(self._get_technical_questions(job_role, experience_level)[:3])
        questions.extend(self._get_behavioral_questions(experience_level)[:3])
        questions.extend(self._get_system_design_questions(experience_level)[:2])
        questions.extend(self._get_hr_questions()[:2])
        
        return questions
    
    def _get_role_keywords(self, job_role: str) -> List[str]:
        """Get relevant keywords for job role"""
        role_map = {
            'full-stack-developer': ['javascript', 'react', 'node', 'python', 'mongodb'],
            'frontend-developer': ['react', 'vue', 'angular', 'javascript', 'css'],
            'backend-developer': ['python', 'java', 'nodejs', 'database', 'api'],
            'data-scientist': ['python', 'machine-learning', 'pandas', 'tensorflow', 'sql'],
            'product-manager': ['product', 'strategy', 'agile', 'analytics', 'roadmap'],
            'ui-ux-designer': ['design', 'figma', 'user-experience', 'prototyping', 'wireframe'],
            'devops-engineer': ['docker', 'kubernetes', 'aws', 'terraform', 'ci-cd'],
            'mobile-developer': ['react-native', 'flutter', 'ios', 'android', 'mobile']
        }
        
        return role_map.get(job_role, ['programming', 'software', 'development'])
    
    def _create_technical_question(self, repo: Dict, job_role: str, experience_level: str) -> Dict:
        """Create technical question from repository data"""
        try:
            return {
                'id': f'tech_{repo.get("id", random.randint(1000, 9999))}',
                'question': f"Based on the {repo.get('name', 'project')} repository concept: {repo.get('description', 'Explain your approach to building this type of system.')}",
                'type': 'technical',
                'difficulty': 'medium' if experience_level == 'mid' else 'high' if experience_level == 'senior' else 'low',
                'expected_time': '10-15 minutes',
                'repo_reference': repo.get('html_url', ''),
                'stars': repo.get('stargazers_count', 0),
                'tips': [
                    'Explain your thought process',
                    'Consider scalability and performance',
                    'Discuss alternative approaches',
                    'Mention testing strategies'
                ]
            }
        except:
            return None
    
    def _create_coding_question(self, repo: Dict, experience_level: str) -> Dict:
        """Create coding question from repository data"""
        try:
            difficulties = {
                'entry': ['easy', 'basic'],
                'mid': ['medium', 'intermediate'],
                'senior': ['hard', 'advanced'],
                'lead': ['expert', 'complex']
            }
            
            difficulty_options = difficulties.get(experience_level, ['medium'])
            
            return {
                'id': f'code_{repo.get("id", random.randint(1000, 9999))}',
                'question': f"Implement a solution inspired by {repo.get('name', 'this problem')}: {repo.get('description', 'Create an efficient algorithm.')[:100]}...",
                'type': 'coding-challenge',
                'difficulty': random.choice(difficulty_options),
                'expected_time': '20-30 minutes',
                'repo_reference': repo.get('html_url', ''),
                'language_options': ['Python', 'JavaScript', 'Java', 'C++'],
                'tips': [
                    'Think about edge cases',
                    'Optimize for time and space complexity',
                    'Write clean, readable code',
                    'Test your solution with examples'
                ]
            }
        except:
            return None
    
    def _add_company_context(self, questions: List[Dict], company_context: str) -> List[Dict]:
        """Add company-specific context to questions"""
        try:
            for question in questions:
                if question['type'] in ['behavioral', 'hr-round']:
                    if company_context.lower() in ['google', 'microsoft', 'amazon', 'meta', 'apple']:
                        question['question'] += f"\n\nContext: Consider {company_context}'s culture and values in your answer."
                    elif company_context.lower() in ['startup', 'fintech', 'healthcare']:
                        question['question'] += f"\n\nContext: Consider the {company_context} industry dynamics in your answer."
                        
        except Exception as e:
            print(f"⚠️ Company context error: {e}")
            
        return questions
    
    def get_interview_tips(self) -> Dict:
        """Get dynamic interview tips from quotes API"""
        # Default tips structure
        tips = {
            'before_interview': [
                "Research the company and role thoroughly",
                "Practice common questions out loud",
                "Prepare specific STAR method examples",
                "Review your resume and be ready to discuss each point",
                "Plan your outfit and route in advance"
            ],
            'during_interview': [
                "Listen carefully and ask clarifying questions",
                "Use the STAR method for behavioral questions",
                "Show enthusiasm and genuine interest",
                "Ask thoughtful questions about the role and company",
                "Maintain good eye contact and body language"
            ],
            'after_interview': [
                "Send a personalized thank-you email within 24 hours",
                "Reflect on your performance and areas for improvement",
                "Follow up appropriately based on timeline given",
                "Continue practicing for future opportunities",
                "Stay positive regardless of the outcome"
            ]
        }
        
        try:
            response = requests.get(f"{self.quotes_api}/quotes?tags=success,motivation&limit=10", timeout=10)
            
            if response.status_code == 200:
                quotes_data = response.json()
                motivational_quotes = []
                
                for quote in quotes_data.get('results', [])[:5]:
                    motivational_quotes.append({
                        'text': quote.get('content', ''),
                        'author': quote.get('author', 'Unknown')
                    })
                
                tips['motivational_quotes'] = motivational_quotes
                
        except Exception as e:
            print(f"⚠️ Tips API error: {e}")
            
        return tips
    
    # Fallback methods for when APIs fail
    def _get_fallback_technical_questions(self, job_role: str, experience_level: str) -> List[Dict]:
        """Fallback technical questions when APIs fail"""
        base_questions = [
            "Explain the difference between REST and GraphQL APIs",
            "How would you optimize a slow database query?",
            "Describe your approach to handling errors in production",
            "What are the principles of clean code?",
            "How do you ensure code quality in your projects?"
        ]
        
        return [
            {
                'id': f'tech_fallback_{i+1}',
                'question': q,
                'type': 'technical',
                'difficulty': 'medium',
                'expected_time': '10-15 minutes',
                'tips': ['Be specific', 'Use examples', 'Explain trade-offs']
            } for i, q in enumerate(base_questions)
        ]
    
    def _get_fallback_behavioral_questions(self, experience_level: str) -> List[Dict]:
        """Fallback behavioral questions"""
        questions = [
            "Tell me about a challenging project you worked on",
            "Describe a time you had to learn something new quickly",
            "How do you handle competing priorities?",
            "Tell me about a time you disagreed with a team member",
            "Describe your greatest professional achievement"
        ]
        
        return [
            {
                'id': f'behavioral_fallback_{i+1}',
                'question': q,
                'type': 'behavioral',
                'difficulty': 'medium',
                'expected_time': '3-5 minutes',
                'tips': ['Use STAR method', 'Be specific', 'Show impact']
            } for i, q in enumerate(questions)
        ]
    
    def _get_fallback_system_design_questions(self, experience_level: str) -> List[Dict]:
        """Fallback system design questions"""
        questions = [
            "Design a URL shortening service",
            "Design a chat application",
            "Design a social media feed",
            "Design a notification system",
            "Design a distributed cache"
        ]
        
        return [
            {
                'id': f'system_fallback_{i+1}',
                'question': q,
                'type': 'system-design',
                'difficulty': 'medium',
                'expected_time': '30-45 minutes',
                'tips': ['Start with requirements', 'Consider scale', 'Discuss trade-offs']
            } for i, q in enumerate(questions)
        ]
    
    def _get_fallback_hr_questions(self) -> List[Dict]:
        """Fallback HR questions"""
        questions = [
            "Why do you want this role?",
            "Tell me about yourself",
            "What are your salary expectations?",
            "Where do you see yourself in 5 years?",
            "What motivates you at work?"
        ]
        
        return [
            {
                'id': f'hr_fallback_{i+1}',
                'question': q,
                'type': 'hr-round',
                'difficulty': 'medium',
                'expected_time': '2-4 minutes',
                'tips': ['Be authentic', 'Show enthusiasm', 'Research company']
            } for i, q in enumerate(questions)
        ]
    
    def _get_fallback_coding_questions(self, experience_level: str) -> List[Dict]:
        """Fallback coding questions"""
        questions = [
            "Implement a function to reverse a string",
            "Find the maximum element in an array",
            "Check if a string is a palindrome",
            "Implement binary search algorithm",
            "Find the intersection of two arrays"
        ]
        
        return [
            {
                'id': f'coding_fallback_{i+1}',
                'question': q,
                'type': 'coding-challenge',
                'difficulty': 'medium',
                'expected_time': '15-20 minutes',
                'tips': ['Consider edge cases', 'Optimize complexity', 'Write clean code']
            } for i, q in enumerate(questions)
        ]

# Initialize the service
dynamic_interview_service = DynamicInterviewService()
