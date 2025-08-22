import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Union

class AdzunaJobService:
    def __init__(self):
        """Initialize Adzuna Job Search Service"""
        self.app_id = "a0aa8b12"
        self.app_key = "29d27ecb48ba167f904cabd142397f45"
        self.base_url = "https://api.adzuna.com/v1/api"
        self.country = "us"  # Default to US, can be changed
        self.user = "syashu16"
        
        print(f"🔍 Adzuna Job Service initialized for user: {self.user}")
        
    def search_jobs(self, 
                   what: str = "", 
                   where: str = "", 
                   results_per_page: int = 20,
                   page: int = 1,
                   sort_by: str = "relevance",
                   salary_min: Optional[int] = None,
                   salary_max: Optional[int] = None,
                   contract_type: Optional[str] = None,
                   category: Optional[str] = None) -> Dict:
        """
        Search for jobs using Adzuna API
        
        Args:
            what: Job title or keywords
            where: Location (city, state, etc.)
            results_per_page: Number of results per page (max 50)
            page: Page number
            sort_by: Sort by relevance, date, salary_min, salary_max
            salary_min: Minimum salary
            salary_max: Maximum salary
            contract_type: full_time, part_time, contract, permanent
            category: Job category ID
        """
        
        try:
            print(f"🔍 Searching jobs: '{what}' in '{where}'")
            
            # Build API endpoint
            endpoint = f"{self.base_url}/jobs/{self.country}/search/{page}"
            
            # Build parameters
            params = {
                'app_id': self.app_id,
                'app_key': self.app_key,
                'results_per_page': min(results_per_page, 50),  # Max 50
                'what': what,
                'where': where,
                'sort_by': sort_by
            }
            
            # Add optional parameters
            if salary_min:
                params['salary_min'] = salary_min
            if salary_max:
                params['salary_max'] = salary_max
            if contract_type:
                params['contract_type'] = contract_type
            if category:
                params['category'] = category
                
            print(f"📡 Making API request to: {endpoint}")
            print(f"📋 Parameters: {json.dumps({k: v for k, v in params.items() if k != 'app_key'}, indent=2)}")
            
            # Make API request
            response = requests.get(endpoint, params=params, timeout=10)
            
            print(f"📊 Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                jobs = self.process_job_results(data)
                
                print(f"✅ Found {len(jobs.get('results', []))} jobs")
                return {
                    'success': True,
                    'jobs': jobs['results'],
                    'count': jobs['count'],
                    'total_pages': jobs.get('total_pages', 1),
                    'current_page': page,
                    'search_params': {
                        'what': what,
                        'where': where,
                        'sort_by': sort_by
                    },
                    'timestamp': time.time()
                }
            else:
                error_msg = f"Adzuna API error: {response.status_code}"
                print(f"❌ {error_msg}")
                return {
                    'success': False,
                    'error': error_msg,
                    'jobs': [],
                    'count': 0
                }
                
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error: {str(e)}"
            print(f"🔌 {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'jobs': [],
                'count': 0
            }
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            print(f"💥 {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'jobs': [],
                'count': 0
            }
    
    def process_job_results(self, data: Dict) -> Dict:
        """Process and clean job results from Adzuna API"""
        
        processed_jobs = []
        results = data.get('results', [])
        
        for job in results:
            try:
                processed_job = {
                    'id': job.get('id'),
                    'title': job.get('title', 'No title'),
                    'company': job.get('company', {}).get('display_name', 'Company not specified'),
                    'location': self.format_location(job.get('location', {})),
                    'description': self.clean_description(job.get('description', '')),
                    'salary': self.format_salary(job.get('salary_min'), job.get('salary_max')),
                    'contract_type': job.get('contract_type', 'Not specified'),
                    'category': job.get('category', {}).get('label', 'Not specified'),
                    'created': job.get('created'),
                    'redirect_url': job.get('redirect_url'),
                    'adzuna_url': f"https://www.adzuna.com/details/{job.get('id', '')}",
                    'match_score': self.calculate_match_score(job)
                }
                processed_jobs.append(processed_job)
                
            except Exception as e:
                print(f"⚠️ Error processing job: {e}")
                continue
        
        return {
            'results': processed_jobs,
            'count': data.get('count', len(processed_jobs)),
            'total_pages': data.get('total_pages', 1)
        }
    
    def format_location(self, location: Dict) -> str:
        """Format location from Adzuna location object"""
        if not location:
            return "Location not specified"
            
        parts = []
        if location.get('display_name'):
            return location['display_name']
        
        if location.get('area'):
            parts.extend(location['area'])
        
        return ", ".join(parts) if parts else "Location not specified"
    
    def clean_description(self, description: str) -> str:
        """Clean and truncate job description"""
        if not description:
            return "No description available"
        
        # Remove HTML tags (basic cleaning)
        import re
        clean_desc = re.sub(r'<[^>]+>', '', description)
        clean_desc = clean_desc.replace('&nbsp;', ' ').replace('&amp;', '&')
        
        # Truncate if too long
        if len(clean_desc) > 500:
            clean_desc = clean_desc[:500] + "..."
        
        return clean_desc.strip()
    
    def format_salary(self, min_salary: Optional[float], max_salary: Optional[float]) -> str:
        """Format salary range"""
        if not min_salary and not max_salary:
            return "Salary not specified"
        
        if min_salary and max_salary:
            return f"${int(min_salary):,} - ${int(max_salary):,}"
        elif min_salary:
            return f"${int(min_salary):,}+"
        elif max_salary:
            return f"Up to ${int(max_salary):,}"
        
        return "Salary not specified"
    
    def calculate_match_score(self, job: Dict) -> int:
        """Calculate a basic match score for the job (0-100)"""
        score = 50  # Base score
        
        # Add points for complete information
        if job.get('salary_min') or job.get('salary_max'):
            score += 10
        if job.get('company', {}).get('display_name'):
            score += 10
        if job.get('description') and len(job.get('description', '')) > 100:
            score += 15
        if job.get('contract_type'):
            score += 5
            
        # Add points for tech-related keywords (since user is syashu16, likely tech-focused)
        tech_keywords = ['python', 'javascript', 'react', 'node', 'developer', 'software', 'engineer', 'ai', 'ml', 'data']
        title_lower = job.get('title', '').lower()
        desc_lower = job.get('description', '').lower()
        
        for keyword in tech_keywords:
            if keyword in title_lower:
                score += 3
            if keyword in desc_lower:
                score += 1
        
        return min(score, 100)
    
    def get_job_categories(self) -> Dict:
        """Get available job categories from Adzuna"""
        try:
            endpoint = f"{self.base_url}/jobs/{self.country}/categories"
            params = {
                'app_id': self.app_id,
                'app_key': self.app_key
            }
            
            response = requests.get(endpoint, params=params, timeout=5)
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'categories': response.json().get('results', [])
                }
            else:
                return {
                    'success': False,
                    'error': f"API error: {response.status_code}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_location_suggestions(self, query: str) -> List[str]:
        """Get location suggestions (simplified)"""
        # Common US locations for demo
        locations = [
            "New York, NY", "San Francisco, CA", "Los Angeles, CA", "Chicago, IL",
            "Seattle, WA", "Boston, MA", "Austin, TX", "Denver, CO", "Atlanta, GA",
            "Remote", "Remote - US", "Hybrid"
        ]
        
        if query:
            query_lower = query.lower()
            return [loc for loc in locations if query_lower in loc.lower()]
        
        return locations[:5]
    
    def get_ai_enhanced_jobs(self, user_skills: List[str], preferences: Dict) -> Dict:
        """Get AI-enhanced job recommendations based on user profile"""
        
        # Build search query based on user skills
        what = " OR ".join(user_skills[:3]) if user_skills else "software developer"
        where = preferences.get('location', 'Remote')
        
        # Search with enhanced parameters
        results = self.search_jobs(
            what=what,
            where=where,
            results_per_page=10,
            salary_min=preferences.get('min_salary'),
            contract_type=preferences.get('contract_type', 'full_time')
        )
        
        if results['success']:
            # Add AI scoring based on user profile
            for job in results['jobs']:
                job['ai_match_reason'] = self.generate_match_reason(job, user_skills)
                job['recommendation_score'] = self.calculate_ai_score(job, user_skills, preferences)
            
            # Sort by AI recommendation score
            results['jobs'].sort(key=lambda x: x.get('recommendation_score', 0), reverse=True)
        
        return results
    
    def generate_match_reason(self, job: Dict, user_skills: List[str]) -> str:
        """Generate AI explanation for why this job matches"""
        reasons = []
        
        title = job.get('title', '').lower()
        description = job.get('description', '').lower()
        
        # Check skill matches
        matching_skills = [skill for skill in user_skills if skill.lower() in title or skill.lower() in description]
        if matching_skills:
            reasons.append(f"Matches your skills: {', '.join(matching_skills[:3])}")
        
        # Check salary
        if job.get('salary') and 'not specified' not in job['salary'].lower():
            reasons.append("Competitive salary offered")
        
        # Check company
        if job.get('company') and job['company'] != 'Company not specified':
            reasons.append(f"Great opportunity at {job['company']}")
        
        return ". ".join(reasons) if reasons else "Good match based on your profile"
    
    def calculate_ai_score(self, job: Dict, user_skills: List[str], preferences: Dict) -> int:
        """Calculate AI-enhanced recommendation score"""
        score = job.get('match_score', 50)
        
        # Boost score for skill matches
        title = job.get('title', '').lower()
        description = job.get('description', '').lower()
        
        skill_matches = sum(1 for skill in user_skills if skill.lower() in title or skill.lower() in description)
        score += skill_matches * 5
        
        # Boost for location preference
        if preferences.get('location', '').lower() in job.get('location', '').lower():
            score += 10
        
        # Boost for remote if preferred
        if 'remote' in preferences.get('work_style', '').lower() and 'remote' in job.get('location', '').lower():
            score += 15
        
        return min(score, 100)

    def get_salary_insights(self, job_title: str, location: str = "") -> Dict:
        """Get salary statistics for a specific job title and location"""
        try:
            # First try histogram API
            endpoint = f"{self.base_url}/jobs/{self.country}/histogram"
            params = {
                'app_id': self.app_id,
                'app_key': self.app_key,
                'what': job_title,
                'where': location
            }
            
            response = requests.get(endpoint, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                histogram = data.get('histogram', {})
                
                # Process salary data
                salary_stats = self.process_salary_histogram(histogram)
                
                # If histogram has data, return it
                if salary_stats['total_jobs'] > 0:
                    return {
                        'success': True,
                        'job_title': job_title,
                        'location': location or 'All locations',
                        'salary_stats': salary_stats,
                        'market_insights': self.generate_market_insights(salary_stats, job_title)
                    }
            
            # If histogram API fails or has no data, fall back to direct API search for salary estimates
            print(f"📊 Histogram API returned no data, falling back to direct job search for salary estimates...")
            
            # Make direct API call to get raw job data with salary information
            endpoint = f"{self.base_url}/jobs/{self.country}/search/1"
            params = {
                'app_id': self.app_id,
                'app_key': self.app_key,
                'what': job_title,
                'where': location,
                'results_per_page': 50
            }
            
            response = requests.get(endpoint, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                jobs = data.get('results', [])
                salary_data = []
                
                print(f"📊 Processing {len(jobs)} jobs for salary data...")
                
                for job in jobs:
                    salary_min = job.get('salary_min')
                    salary_max = job.get('salary_max')
                    
                    if salary_min and salary_max:
                        # Use the midpoint of the salary range
                        mid_salary = (salary_min + salary_max) / 2
                        salary_data.append(mid_salary)
                        print(f"💰 Found salary: £{salary_min:,.0f} - £{salary_max:,.0f} (mid: £{mid_salary:,.0f})")
                    elif salary_min:
                        salary_data.append(salary_min)
                        print(f"💰 Found min salary: £{salary_min:,.0f}")
                    elif salary_max:
                        salary_data.append(salary_max)
                        print(f"💰 Found max salary: £{salary_max:,.0f}")
                
                print(f"📊 Total salary data points collected: {len(salary_data)}")
                
                if salary_data:
                    salary_data.sort()
                    n = len(salary_data)
                    
                    salary_stats = {
                        'median': salary_data[n // 2] if n > 0 else None,
                        'min': min(salary_data) if salary_data else None,
                        'max': max(salary_data) if salary_data else None,
                        'average': sum(salary_data) / len(salary_data) if salary_data else None,
                        'percentile_25': salary_data[n // 4] if n > 3 else None,
                        'percentile_75': salary_data[3 * n // 4] if n > 3 else None,
                        'total_jobs': len(jobs)
                    }
                    
                    insights = [
                        f"Based on {len(salary_data)} jobs with salary information out of {len(jobs)} total results",
                        f"Salary data derived from current job listings in {location or 'all locations'}",
                    ]
                    
                    if salary_stats['average']:
                        insights.append(f"Average salary: £{int(salary_stats['average']):,}")
                    
                    print(f"✅ Salary stats calculated: min=£{salary_stats['min']:,.0f}, max=£{salary_stats['max']:,.0f}, avg=£{salary_stats['average']:,.0f}")
                    
                    return {
                        'success': True,
                        'job_title': job_title,
                        'location': location or 'All locations',
                        'salary_stats': salary_stats,
                        'market_insights': insights
                    }
            
            print(f"❌ No salary data found in job search results")
            
            # If all methods fail, return empty data
            return {
                'success': True,
                'job_title': job_title,
                'location': location or 'All locations',
                'salary_stats': {
                    'median': None,
                    'min': None,
                    'max': None,
                    'percentile_25': None,
                    'percentile_75': None,
                    'total_jobs': 0
                },
                'market_insights': ["Limited salary data available for this role."]
            }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def process_salary_histogram(self, histogram: Dict) -> Dict:
        """Process salary histogram data into meaningful statistics"""
        if not histogram:
            return {
                'median': None,
                'min': None,
                'max': None,
                'percentile_25': None,
                'percentile_75': None,
                'total_jobs': 0
            }
        
        # Extract salary ranges and counts
        salary_data = []
        total_jobs = 0
        
        for salary_range, count in histogram.items():
            if salary_range != 'missing':  # Skip missing salary data
                try:
                    # Parse salary range (e.g., "40000-50000")
                    min_sal, max_sal = map(int, salary_range.split('-'))
                    mid_salary = (min_sal + max_sal) / 2
                    
                    # Add data points based on count
                    salary_data.extend([mid_salary] * count)
                    total_jobs += count
                except:
                    continue
        
        if not salary_data:
            return {
                'median': None,
                'min': None,
                'max': None,
                'percentile_25': None,
                'percentile_75': None,
                'total_jobs': 0
            }
        
        salary_data.sort()
        n = len(salary_data)
        
        return {
            'median': salary_data[n // 2],
            'min': min(salary_data),
            'max': max(salary_data),
            'percentile_25': salary_data[n // 4],
            'percentile_75': salary_data[3 * n // 4],
            'total_jobs': total_jobs,
            'average': sum(salary_data) / n
        }

    def generate_market_insights(self, salary_stats: Dict, job_title: str) -> List[str]:
        """Generate market insights based on salary data"""
        insights = []
        
        if salary_stats['total_jobs'] == 0:
            insights.append("Limited salary data available for this role.")
            return insights
        
        median = salary_stats.get('median', 0)
        if median:
            insights.append(f"Median salary for {job_title}: ${int(median):,}")
            
            if median > 100000:
                insights.append("This is a high-paying role with strong market demand.")
            elif median > 70000:
                insights.append("Competitive salary range for this position.")
            else:
                insights.append("Entry to mid-level salary range.")
        
        total_jobs = salary_stats.get('total_jobs', 0)
        if total_jobs > 1000:
            insights.append("High market demand - many opportunities available.")
        elif total_jobs > 100:
            insights.append("Moderate market demand - decent opportunity pool.")
        else:
            insights.append("Niche market - fewer but potentially specialized opportunities.")
        
        return insights

    def get_trending_skills(self, job_category: str = "") -> Dict:
        """Get trending skills based on job postings"""
        try:
            # Search for recent jobs to analyze trending skills
            search_results = self.search_jobs(
                what=job_category,
                results_per_page=50,
                sort_by="date"
            )
            
            if not search_results['success']:
                return {'success': False, 'error': 'Failed to fetch job data'}
            
            # Analyze job descriptions for skill mentions
            skills_count = {}
            tech_skills = [
                'Python', 'JavaScript', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
                'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'C++', 'C#', 'Swift', 'Kotlin',
                'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD',
                'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQL', 'NoSQL', 'GraphQL',
                'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas',
                'DevOps', 'Microservices', 'API', 'REST', 'GraphQL', 'Agile', 'Scrum'
            ]
            
            for job in search_results['jobs']:
                description = job.get('description', '').lower()
                title = job.get('title', '').lower()
                
                for skill in tech_skills:
                    if skill.lower() in description or skill.lower() in title:
                        skills_count[skill] = skills_count.get(skill, 0) + 1
            
            # Sort skills by frequency
            trending_skills = sorted(skills_count.items(), key=lambda x: x[1], reverse=True)[:10]
            
            return {
                'success': True,
                'trending_skills': [{'skill': skill, 'mentions': count} for skill, count in trending_skills],
                'analysis_date': datetime.now().isoformat(),
                'jobs_analyzed': len(search_results['jobs'])
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_location_insights(self, job_title: str) -> Dict:
        """Get insights about job opportunities across different locations"""
        try:
            major_cities = [
                'New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 'Chicago, IL',
                'Seattle, WA', 'Boston, MA', 'Austin, TX', 'Denver, CO', 'Atlanta, GA',
                'Remote'
            ]
            
            location_data = []
            
            for city in major_cities:
                search_results = self.search_jobs(
                    what=job_title,
                    where=city,
                    results_per_page=10
                )
                
                if search_results['success'] and search_results['jobs']:
                    # Calculate average salary for this location
                    salaries = []
                    for job in search_results['jobs']:
                        salary_str = job.get('salary', '')
                        if salary_str and 'not specified' not in salary_str.lower():
                            # Extract salary numbers (basic parsing)
                            import re
                            salary_numbers = re.findall(r'\$?(\d{1,3}(?:,\d{3})*)', salary_str)
                            if salary_numbers:
                                try:
                                    avg_salary = sum(int(s.replace(',', '')) for s in salary_numbers) / len(salary_numbers)
                                    salaries.append(avg_salary)
                                except:
                                    continue
                    
                    avg_salary = sum(salaries) / len(salaries) if salaries else None
                    
                    location_data.append({
                        'location': city,
                        'job_count': search_results['count'],
                        'average_salary': avg_salary,
                        'sample_jobs': len(search_results['jobs'])
                    })
                
                time.sleep(0.5)  # Rate limiting
            
            # Sort by job count
            location_data.sort(key=lambda x: x['job_count'], reverse=True)
            
            return {
                'success': True,
                'job_title': job_title,
                'location_insights': location_data,
                'top_markets': location_data[:5],
                'analysis_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_career_progression_insights(self, current_role: str) -> Dict:
        """Get insights about career progression paths"""
        try:
            # Define career progression mappings
            progression_paths = {
                'junior developer': ['software developer', 'senior developer', 'lead developer', 'engineering manager'],
                'software developer': ['senior developer', 'lead developer', 'principal engineer', 'engineering manager'],
                'senior developer': ['lead developer', 'principal engineer', 'engineering manager', 'director of engineering'],
                'data analyst': ['senior data analyst', 'data scientist', 'analytics manager', 'director of analytics'],
                'data scientist': ['senior data scientist', 'lead data scientist', 'principal data scientist', 'head of data science']
            }
            
            current_role_lower = current_role.lower()
            career_path = None
            
            for role_key, path in progression_paths.items():
                if role_key in current_role_lower:
                    career_path = path
                    break
            
            if not career_path:
                # Generic tech progression
                career_path = ['senior ' + current_role, 'lead ' + current_role, 'principal ' + current_role, 'manager']
            
            # Get job counts and salary data for each role in the path
            progression_data = []
            
            for next_role in career_path:
                search_results = self.search_jobs(what=next_role, results_per_page=10)
                
                if search_results['success']:
                    # Calculate average salary
                    salaries = []
                    for job in search_results['jobs'][:10]:  # Sample first 10 jobs
                        salary_str = job.get('salary', '')
                        if salary_str and 'not specified' not in salary_str.lower():
                            import re
                            salary_numbers = re.findall(r'\$?(\d{1,3}(?:,\d{3})*)', salary_str)
                            if salary_numbers:
                                try:
                                    avg_salary = sum(int(s.replace(',', '')) for s in salary_numbers) / len(salary_numbers)
                                    salaries.append(avg_salary)
                                except:
                                    continue
                    
                    avg_salary = sum(salaries) / len(salaries) if salaries else None
                    
                    progression_data.append({
                        'role': next_role,
                        'job_count': search_results['count'],
                        'average_salary': avg_salary,
                        'difficulty': self.calculate_career_difficulty(current_role, next_role)
                    })
                
                time.sleep(0.3)  # Rate limiting
            
            return {
                'success': True,
                'current_role': current_role,
                'career_path': progression_data,
                'recommendations': self.generate_career_recommendations(progression_data),
                'analysis_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def calculate_career_difficulty(self, current_role: str, target_role: str) -> str:
        """Calculate the difficulty of transitioning to a target role"""
        difficulty_indicators = {
            'manager': 'High - Requires leadership experience',
            'director': 'Very High - Requires extensive management experience',
            'principal': 'High - Requires deep technical expertise',
            'lead': 'Medium - Requires team leadership skills',
            'senior': 'Medium - Requires 3-5 years experience'
        }
        
        target_lower = target_role.lower()
        
        for indicator, difficulty in difficulty_indicators.items():
            if indicator in target_lower:
                return difficulty
        
        return 'Low - Natural progression'

    def generate_career_recommendations(self, progression_data: List[Dict]) -> List[str]:
        """Generate career advancement recommendations"""
        recommendations = []
        
        if not progression_data:
            return ["Focus on developing your current skills and gaining more experience."]
        
        # Find the most promising next step
        best_opportunity = max(progression_data, key=lambda x: x['job_count'])
        
        recommendations.append(f"Consider targeting: {best_opportunity['role']} ({best_opportunity['job_count']} openings)")
        
        if best_opportunity['average_salary']:
            recommendations.append(f"Potential salary range: ${int(best_opportunity['average_salary']):,}")
        
        # Add skill development recommendations
        recommendations.append("Focus on developing leadership and mentoring skills for career advancement")
        recommendations.append("Build a portfolio showcasing your best projects and achievements")
        recommendations.append("Network within your industry and consider getting relevant certifications")
        
        return recommendations

# Create global instance
print("🚀 Initializing Adzuna Job Service...")
adzuna_service = AdzunaJobService()
print("✅ Adzuna Job Service initialized!")
