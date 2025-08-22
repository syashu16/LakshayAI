"""
Adzuna-Based Dynamic Skill Gap Analysis
Fetches real job descriptions from Adzuna API and extracts skills dynamically
"""

import re
import requests
from collections import Counter
from datetime import datetime
from typing import List, Dict, Set
import json

class AdzunaSkillAnalyzer:
    def __init__(self):
        """Initialize with Adzuna API credentials"""
        # Using existing Adzuna credentials from the service
        self.app_id = "a0aa8b12"
        self.app_key = "29d27ecb48ba167f904cabd142397f45"
        self.base_url = "https://api.adzuna.com/v1/api"
        self.country = "in"
        
        print("🎯 Adzuna Skill Analyzer initialized")
    
    def analyze_role_skills(self, target_role: str, max_jobs: int = 50) -> Dict:
        """
        Analyze skills for a role by fetching real job descriptions from Adzuna
        
        Args:
            target_role: The job role to analyze (e.g., "Senior Business Intelligence")
            max_jobs: Maximum number of job postings to analyze
            
        Returns:
            Dictionary with extracted skills and analysis
        """
        print(f"🔍 Analyzing skills for role: {target_role}")
        
        # Fetch real job postings
        jobs_data = self.fetch_adzuna_jobs(target_role, max_jobs)
        
        if not jobs_data['success']:
            return {
                'success': False,
                'error': jobs_data['error'],
                'message': f'Failed to fetch jobs for {target_role}'
            }
        
        jobs = jobs_data['jobs']
        print(f"📊 Analyzing {len(jobs)} job postings...")
        
        # Extract skills from job descriptions
        all_skills = []
        job_count = 0
        
        for job in jobs:
            job_skills = self.extract_skills_from_job(job)
            all_skills.extend(job_skills)
            job_count += 1
            
        # Count skill frequencies
        skill_counter = Counter(all_skills)
        
        # Get top skills (those mentioned in multiple jobs)
        min_mentions = max(1, job_count // 20)  # Skill must appear in at least 5% of jobs (reduced from 10%)
        
        frequent_skills = [
            {
                'skill': skill,
                'frequency': count,
                'percentage': round((count / job_count) * 100, 1),
                'priority': self.get_skill_priority(skill, count, job_count)
            }
            for skill, count in skill_counter.most_common(50)  # Increased from 30
            if count >= min_mentions
        ]
        
        print(f"✅ Extracted {len(frequent_skills)} skills from {job_count} real job postings")
        
        return {
            'success': True,
            'target_role': target_role,
            'jobs_analyzed': job_count,
            'skills_extracted': frequent_skills,
            'top_skills': [skill['skill'] for skill in frequent_skills[:15]],
            'skill_categories': self.categorize_skills(frequent_skills),
            'data_source': 'adzuna_real_jobs',
            'timestamp': datetime.now().isoformat(),
            'analysis_summary': {
                'total_skills_found': len(frequent_skills),
                'core_skills': len([s for s in frequent_skills if s['priority'] == 'high']),
                'recommended_skills': len([s for s in frequent_skills if s['priority'] == 'medium']),
                'jobs_analyzed': job_count
            }
        }
    
    def fetch_adzuna_jobs(self, role: str, max_jobs: int = 50) -> Dict:
        """Fetch job postings from Adzuna API"""
        try:
            # Search for jobs with the role
            endpoint = f"{self.base_url}/jobs/{self.country}/search/1"
            
            params = {
                'app_id': self.app_id,
                'app_key': self.app_key,
                'what': role,
                'results_per_page': min(max_jobs, 50),  # Adzuna max is 50 per page
                'sort_by': 'relevance'
            }
            
            print(f"📡 Fetching jobs from Adzuna: {role}")
            
            response = requests.get(endpoint, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                jobs = data.get('results', [])
                
                print(f"✅ Fetched {len(jobs)} jobs from Adzuna")
                
                return {
                    'success': True,
                    'jobs': jobs,
                    'count': len(jobs)
                }
            else:
                error_msg = f"Adzuna API error: {response.status_code}"
                print(f"❌ {error_msg}")
                return {
                    'success': False,
                    'error': error_msg,
                    'jobs': []
                }
                
        except Exception as e:
            print(f"❌ Error fetching Adzuna jobs: {e}")
            return {
                'success': False,
                'error': str(e),
                'jobs': []
            }
    
    def extract_skills_from_job(self, job: Dict) -> List[str]:
        """Extract skills from a single job posting with enhanced pattern matching"""
        
        # Get job text (title + description)
        title = job.get('title', '').lower()
        description = job.get('description', '').lower()
        
        # Combine all text
        job_text = f"{title} {description}"
        
        # Remove HTML tags and clean text
        job_text = re.sub(r'<[^>]+>', ' ', job_text)
        job_text = re.sub(r'[^\w\s\.\+\#]', ' ', job_text)  # Keep alphanumeric, spaces, dots, +, #
        
        print(f"🔍 Analyzing job: {title[:50]}...")
        
        # Extract skills using multiple methods
        skills = set()
        
        # Method 1: Enhanced pattern matching with word boundaries
        skills.update(self.extract_skills_with_patterns(job_text))
        
        # Method 2: Context-aware skill extraction
        skills.update(self.extract_contextual_skills(job_text))
        
        # Method 3: Multi-word skill extraction
        skills.update(self.extract_multiword_skills(job_text))
        
        extracted_skills = list(skills)
        if extracted_skills:
            print(f"  ✅ Found skills: {extracted_skills[:5]}")
        else:
            print(f"  ⚠️ No skills found")
            
        return extracted_skills
    
    def extract_skills_with_patterns(self, text: str) -> Set[str]:
        """Extract skills using enhanced regex patterns with word boundaries"""
        
        skills_patterns = {
            # BI Tools (case insensitive with word boundaries)
            r'\btableau\b': 'Tableau',
            r'\bpower\s*bi\b': 'Power BI',
            r'\bqlik\w*\b': 'Qlik',
            r'\blooker\b': 'Looker',
            r'\bmicrostrategy\b': 'MicroStrategy',
            r'\bcognos\b': 'Cognos',
            r'\bbusiness\s*objects\b': 'Business Objects',
            
            # Programming & Query Languages
            r'\bsql\b': 'SQL',
            r'\bpython\b': 'Python',
            r'\br\b(?!\w)': 'R',  # R but not part of other words
            r'\bjava\b(?!script)': 'Java',
            r'\bjavascript\b': 'JavaScript',
            r'\bscala\b': 'Scala',
            r'\bsas\b': 'SAS',
            
            # Databases
            r'\bmysql\b': 'MySQL',
            r'\bpostgresql\b': 'PostgreSQL',
            r'\bsql\s*server\b': 'SQL Server',
            r'\boracle\b': 'Oracle',
            r'\bmongodb\b': 'MongoDB',
            r'\bsnowflake\b': 'Snowflake',
            r'\bredshift\b': 'Redshift',
            r'\bbigquery\b': 'BigQuery',
            
            # Cloud Platforms
            r'\baws\b': 'AWS',
            r'\bazure\b': 'Azure',
            r'\bgcp\b': 'GCP',
            r'\bgoogle\s*cloud\b': 'Google Cloud',
            
            # Data Concepts
            r'\betl\b': 'ETL',
            r'\bolt(?:a|p)\b': 'OLAP',
            r'\bdata\s*warehouse\b': 'Data Warehousing',
            r'\bdata\s*modeling\b': 'Data Modeling',
            r'\bdata\s*pipeline\b': 'Data Pipeline',
            r'\bdata\s*visualization\b': 'Data Visualization',
            r'\bdata\s*analysis\b': 'Data Analysis',
            r'\banalytics\b': 'Analytics',
            r'\breporting\b': 'Reporting',
            r'\bdashboard\b': 'Dashboard',
            r'\bkpi\b': 'KPI',
            r'\bmetrics\b': 'Metrics',
            
            # Statistics
            r'\bstatistics\b': 'Statistics',
            r'\bregression\b': 'Regression',
            r'\bforecasting\b': 'Forecasting',
            r'\bpredictive\s*analytics\b': 'Predictive Analytics',
            
            # Spreadsheets
            r'\bexcel\b': 'Excel',
            r'\bpivot\s*table\b': 'Pivot Tables',
            r'\bvlookup\b': 'VLOOKUP',
            
            # Version Control & Tools
            r'\bgit\b': 'Git',
            r'\bjira\b': 'Jira',
            r'\bdocker\b': 'Docker',
            r'\blinux\b': 'Linux',
            r'\bunix\b': 'Unix'
        }
        
        found_skills = set()
        
        for pattern, skill_name in skills_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                found_skills.add(skill_name)
        
        return found_skills
    
    def extract_contextual_skills(self, text: str) -> Set[str]:
        """Extract skills based on context (skills mentioned near certain keywords)"""
        
        # Look for skills mentioned in context
        context_patterns = [
            r'experience\s+(?:with|in|using)\s+([^,.]+)',
            r'proficient\s+(?:with|in|using)\s+([^,.]+)',
            r'knowledge\s+(?:of|in)\s+([^,.]+)',
            r'skilled\s+(?:with|in|using)\s+([^,.]+)',
            r'familiar\s+(?:with|in|using)\s+([^,.]+)',
            r'expertise\s+(?:with|in|using)\s+([^,.]+)',
            r'working\s+(?:with|knowledge|experience)\s+(?:of\s+)?([^,.]+)',
            r'background\s+(?:with|in|using)\s+([^,.]+)',
            r'hands[- ]on\s+(?:with|experience)\s+([^,.]+)',
            r'strong\s+(?:knowledge|skills|experience)\s+(?:of|in|with)\s+([^,.]+)'
        ]
        
        found_skills = set()
        
        for pattern in context_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                skill_text = match.group(1).strip()
                # Extract recognizable skills from the context
                contextual_skills = self.parse_skill_text(skill_text)
                found_skills.update(contextual_skills)
        
        return found_skills
    
    def extract_multiword_skills(self, text: str) -> Set[str]:
        """Extract multi-word skills and phrases"""
        
        multiword_skills = [
            'machine learning', 'artificial intelligence', 'data science',
            'business intelligence', 'data warehousing', 'data modeling',
            'data visualization', 'data analysis', 'statistical analysis',
            'predictive analytics', 'descriptive analytics', 'advanced analytics',
            'data mining', 'big data', 'real time analytics',
            'cloud computing', 'data engineering', 'data architecture',
            'database design', 'database administration', 'data governance',
            'data quality', 'master data management', 'dimensional modeling',
            'star schema', 'snowflake schema', 'data mart',
            'business analysis', 'requirements gathering', 'stakeholder management',
            'project management', 'agile methodology', 'scrum master',
            'change management', 'process improvement', 'quality assurance'
        ]
        
        found_skills = set()
        
        for skill in multiword_skills:
            if skill in text.lower():
                found_skills.add(skill.title())
        
        return found_skills
    
    def parse_skill_text(self, skill_text: str) -> Set[str]:
        """Parse skill text to extract individual skills"""
        
        # Known skills that might appear in context
        known_skills = {
            'tableau', 'power bi', 'sql', 'python', 'r', 'excel', 'sas',
            'snowflake', 'aws', 'azure', 'mysql', 'postgresql', 'oracle',
            'mongodb', 'git', 'jira', 'linux', 'docker', 'kubernetes',
            'hadoop', 'spark', 'kafka', 'elasticsearch', 'redis'
        }
        
        found_skills = set()
        
        # Split by common separators and check each part
        parts = re.split(r'[,;&/\s]+', skill_text.lower())
        
        for part in parts:
            part = part.strip()
            if part in known_skills:
                found_skills.add(part.title())
        
        return found_skills
    
    def extract_technical_skills(self, text: str) -> Set[str]:
        """Extract technical skills from job text"""
        
        technical_skills = {
            # Programming languages
            'python', 'java', 'javascript', 'sql', 'r', 'scala', 'c++', 'c#', 'php',
            'go', 'rust', 'kotlin', 'swift', 'typescript', 'matlab',
            
            # Databases
            'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra', 'oracle',
            'sql server', 'sqlite', 'dynamodb', 'elasticsearch',
            
            # Cloud platforms
            'aws', 'azure', 'gcp', 'google cloud', 'cloud computing',
            
            # Data tools
            'hadoop', 'spark', 'kafka', 'airflow', 'docker', 'kubernetes',
            'jenkins', 'git', 'linux', 'unix'
        }
        
        found_skills = set()
        for skill in technical_skills:
            if skill in text:
                found_skills.add(skill.title())
                
        return found_skills
    
    def extract_bi_skills(self, text: str) -> Set[str]:
        """Extract Business Intelligence specific skills"""
        
        bi_skills = {
            # BI Tools
            'tableau', 'power bi', 'qlik', 'qlikview', 'qliksense', 'looker',
            'microstrategy', 'cognos', 'business objects', 'sas',
            
            # Data concepts
            'sql', 'data warehousing', 'data modeling', 'etl', 'data pipeline',
            'data visualization', 'data analysis', 'analytics', 'reporting',
            'dashboard', 'kpi', 'metrics', 'olap', 'oltp',
            
            # Statistical concepts
            'statistics', 'statistical analysis', 'regression', 'forecasting',
            'predictive analytics', 'descriptive analytics',
            
            # Spreadsheets
            'excel', 'google sheets', 'pivot tables', 'vlookup',
            
            # Data platforms
            'snowflake', 'redshift', 'bigquery', 'databricks', 'synapse'
        }
        
        found_skills = set()
        for skill in bi_skills:
            if skill in text:
                found_skills.add(skill.title())
                
        return found_skills
    
    def extract_professional_skills(self, text: str) -> Set[str]:
        """Extract professional/soft skills"""
        
        professional_skills = {
            'communication', 'leadership', 'teamwork', 'collaboration',
            'problem solving', 'analytical thinking', 'critical thinking',
            'project management', 'agile', 'scrum', 'stakeholder management',
            'presentation', 'documentation', 'requirements gathering'
        }
        
        found_skills = set()
        for skill in professional_skills:
            if skill in text:
                found_skills.add(skill.title())
                
        return found_skills
    
    def extract_tools_and_software(self, text: str) -> Set[str]:
        """Extract tools and software mentioned in job"""
        
        tools = {
            # Development tools
            'visual studio', 'vscode', 'intellij', 'eclipse', 'jupyter',
            'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
            
            # Operating systems
            'windows', 'macos', 'linux', 'ubuntu', 'centos', 'redhat',
            
            # Data tools
            'excel', 'google analytics', 'mixpanel', 'amplitude',
            'salesforce', 'hubspot', 'marketo'
        }
        
        found_tools = set()
        for tool in tools:
            if tool in text:
                found_tools.add(tool.title())
                
        return found_tools
    
    def get_skill_priority(self, skill: str, frequency: int, total_jobs: int) -> str:
        """Determine skill priority based on frequency"""
        
        percentage = (frequency / total_jobs) * 100
        
        if percentage >= 50:
            return 'critical'
        elif percentage >= 30:
            return 'high'
        elif percentage >= 15:
            return 'medium'
        else:
            return 'low'
    
    def categorize_skills(self, skills: List[Dict]) -> Dict:
        """Categorize skills into different types"""
        
        categories = {
            'technical': [],
            'tools': [],
            'soft_skills': [],
            'data_analysis': [],
            'business': []
        }
        
        # Keywords for each category
        technical_keywords = ['python', 'sql', 'java', 'javascript', 'r', 'scala', 'programming']
        tools_keywords = ['tableau', 'power bi', 'excel', 'snowflake', 'aws', 'azure']
        soft_keywords = ['communication', 'leadership', 'teamwork', 'presentation']
        data_keywords = ['analytics', 'data', 'statistics', 'modeling', 'etl', 'reporting']
        business_keywords = ['strategy', 'stakeholder', 'requirements', 'project management']
        
        for skill_data in skills:
            skill = skill_data['skill'].lower()
            
            if any(keyword in skill for keyword in technical_keywords):
                categories['technical'].append(skill_data)
            elif any(keyword in skill for keyword in tools_keywords):
                categories['tools'].append(skill_data)
            elif any(keyword in skill for keyword in soft_keywords):
                categories['soft_skills'].append(skill_data)
            elif any(keyword in skill for keyword in data_keywords):
                categories['data_analysis'].append(skill_data)
            elif any(keyword in skill for keyword in business_keywords):
                categories['business'].append(skill_data)
            else:
                # Default to technical if unclear
                categories['technical'].append(skill_data)
        
        return categories
    
    def compare_user_skills_to_market(self, user_skills: List[str], market_analysis: Dict) -> Dict:
        """Compare user skills against market demand from real job data"""
        
        if not market_analysis['success']:
            return {
                'success': False,
                'error': 'Market analysis failed'
            }
        
        market_skills = market_analysis['skills_extracted']
        market_skill_names = [skill['skill'].lower() for skill in market_skills]
        user_skills_lower = [skill.lower() for skill in user_skills]
        
        # Find matches and gaps
        matched_skills = []
        missing_skills = []
        
        for market_skill in market_skills:
            skill_name = market_skill['skill'].lower()
            
            # Check if user has this skill
            user_has_skill = any(
                user_skill in skill_name or skill_name in user_skill
                for user_skill in user_skills_lower
            )
            
            if user_has_skill:
                matched_skills.append({
                    'skill': market_skill['skill'],
                    'market_demand': market_skill['percentage'],
                    'priority': market_skill['priority'],
                    'frequency': market_skill['frequency']
                })
            else:
                missing_skills.append({
                    'skill': market_skill['skill'],
                    'market_demand': market_skill['percentage'],
                    'priority': market_skill['priority'],
                    'gap_severity': self.calculate_gap_severity(market_skill),
                    'description': f"This skill appears in {market_skill['percentage']}% of {market_analysis['target_role']} job postings"
                })
        
        # Calculate readiness score
        total_market_weight = sum(skill['percentage'] for skill in market_skills)
        matched_weight = sum(skill['market_demand'] for skill in matched_skills)
        readiness_score = (matched_weight / total_market_weight) * 100 if total_market_weight > 0 else 0
        
        return {
            'success': True,
            'target_role': market_analysis['target_role'],
            'jobs_analyzed': market_analysis['jobs_analyzed'],
            'readiness_score': round(readiness_score, 1),
            'skills_matched': len(matched_skills),
            'skills_missing': len(missing_skills),
            'matched_skills': matched_skills[:10],  # Top 10 matches
            'skill_gaps': missing_skills[:10],  # Top 10 gaps
            'recommendations': self.generate_recommendations(missing_skills[:5]),
            'market_insights': {
                'data_source': 'adzuna_real_jobs',
                'total_skills_in_market': len(market_skills),
                'analysis_date': datetime.now().isoformat(),
                'market_coverage': f"{market_analysis['jobs_analyzed']} real job postings analyzed"
            }
        }
    
    def calculate_gap_severity(self, skill_data: Dict) -> str:
        """Calculate how severe a skill gap is"""
        
        percentage = skill_data['percentage']
        priority = skill_data['priority']
        
        if priority == 'critical' or percentage >= 70:
            return 'critical'
        elif priority == 'high' or percentage >= 40:
            return 'high'
        elif priority == 'medium' or percentage >= 20:
            return 'medium'
        else:
            return 'low'
    
    def generate_recommendations(self, missing_skills: List[Dict]) -> List[Dict]:
        """Generate learning recommendations for missing skills"""
        
        recommendations = []
        
        for skill in missing_skills:
            skill_name = skill['skill'].lower()
            
            # Generate learning path based on skill type
            if any(keyword in skill_name for keyword in ['sql', 'database', 'query']):
                learning_path = {
                    'skill': skill['skill'],
                    'learning_resources': [
                        'SQL Tutorial on W3Schools',
                        'SQLBolt interactive lessons',
                        'Coursera SQL courses'
                    ],
                    'estimated_time': '2-4 weeks',
                    'difficulty': 'beginner to intermediate'
                }
            elif any(keyword in skill_name for keyword in ['tableau', 'power bi', 'visualization']):
                learning_path = {
                    'skill': skill['skill'],
                    'learning_resources': [
                        'Official Tableau/Power BI training',
                        'YouTube tutorials',
                        'Udemy visualization courses'
                    ],
                    'estimated_time': '3-6 weeks',
                    'difficulty': 'intermediate'
                }
            elif any(keyword in skill_name for keyword in ['python', 'programming']):
                learning_path = {
                    'skill': skill['skill'],
                    'learning_resources': [
                        'Python.org tutorial',
                        'Codecademy Python course',
                        'Real Python articles'
                    ],
                    'estimated_time': '4-8 weeks',
                    'difficulty': 'beginner to advanced'
                }
            else:
                learning_path = {
                    'skill': skill['skill'],
                    'learning_resources': [
                        f'{skill["skill"]} documentation',
                        f'Online {skill["skill"]} courses',
                        f'{skill["skill"]} community tutorials'
                    ],
                    'estimated_time': '2-6 weeks',
                    'difficulty': 'varies'
                }
            
            learning_path['priority'] = skill['priority']
            learning_path['market_demand'] = skill['market_demand']
            recommendations.append(learning_path)
        
        return recommendations


# Test function
def test_adzuna_analysis():
    """Test the Adzuna skill analyzer"""
    
    analyzer = AdzunaSkillAnalyzer()
    
    # Test with Business Intelligence role
    print("\n🧪 Testing Adzuna-based skill analysis...")
    print("=" * 50)
    
    market_analysis = analyzer.analyze_role_skills("Senior Business Intelligence", max_jobs=30)
    
    if market_analysis['success']:
        print(f"✅ SUCCESS: Analyzed {market_analysis['jobs_analyzed']} real job postings")
        print(f"📊 Top skills found: {market_analysis['top_skills'][:5]}")
        print(f"📈 Total skills extracted: {market_analysis['analysis_summary']['total_skills_found']}")
        
        # Test skill gap analysis
        user_skills = ["Excel", "Basic SQL", "Data Analysis", "Python"]
        
        gap_analysis = analyzer.compare_user_skills_to_market(user_skills, market_analysis)
        
        if gap_analysis['success']:
            print(f"\n🎯 Skill Gap Analysis:")
            print(f"Readiness Score: {gap_analysis['readiness_score']}%")
            print(f"Skills Matched: {gap_analysis['skills_matched']}")
            print(f"Skills Missing: {gap_analysis['skills_missing']}")
            print(f"Top Gaps: {[gap['skill'] for gap in gap_analysis['skill_gaps'][:3]]}")
        
        return True
    else:
        print(f"❌ FAILED: {market_analysis['error']}")
        return False


if __name__ == "__main__":
    test_adzuna_analysis()
