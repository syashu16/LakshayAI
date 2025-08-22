# Simple BERT-Enhanced ML Service
# Uses traditional ML with optional basic semantic analysis
import os
import pickle
import re
import numpy as np
from datetime import datetime
import PyPDF2
import docx
import fitz  # PyMuPDF

# Traditional ML imports
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics.pairwise import cosine_similarity

# Try to import basic embeddings (without transformers dependency)
try:
    # Simple TF-IDF only
    from sklearn.feature_extraction.text import TfidfVectorizer
    EMBEDDINGS_AVAILABLE = True
    print("✅ TF-IDF vectorization available")
except ImportError:
    EMBEDDINGS_AVAILABLE = False
    print("⚠️ TF-IDF not available")

class SimpleBERTEnhancedMLService:
    def __init__(self):
        """Initialize the enhanced ML service"""
        self.models_path = "trained_models"
        self.use_embeddings = EMBEDDINGS_AVAILABLE
        
        # Job categories for classification
        self.job_categories = [
            "Software Engineering", "Data Science", "Machine Learning", "Frontend Development",
            "Backend Development", "Full Stack Development", "DevOps Engineering", 
            "Cloud Engineering", "Mobile Development", "Product Management",
            "UI/UX Design", "Quality Assurance", "Database Administration",
            "Network Engineering", "Cybersecurity", "Business Analysis",
            "Project Management", "Technical Writing", "Sales Engineering"
        ]
        
        # Common skills database
        self.all_skills = [
            'python', 'javascript', 'java', 'react', 'node.js', 'sql', 'git',
            'docker', 'kubernetes', 'aws', 'azure', 'machine learning', 'tensorflow',
            'pytorch', 'pandas', 'numpy', 'html', 'css', 'angular', 'vue.js',
            'express.js', 'mongodb', 'postgresql', 'redis', 'elasticsearch',
            'jenkins', 'github', 'linux', 'bash', 'rest api', 'graphql',
            'microservices', 'agile', 'scrum', 'project management'
        ]
        
        # Initialize status attributes
        self.is_loaded = False
        self.models_loaded = False
        
        # Initialize models
        self.init_models()
        
    def init_models(self):
        """Initialize ML models"""
        try:
            self.load_traditional_models()
            if self.use_embeddings:
                self.init_embedding_models()
            print("✅ ML Service initialized successfully")
            self.is_loaded = True
        except Exception as e:
            print(f"⚠️ ML initialization error: {e}")
            self.use_fallback = True
            self.is_loaded = False
    
    def init_embedding_models(self):
        """Initialize word embedding models"""
        try:
            # You could load pre-trained embeddings here
            # For now, we'll use TF-IDF as the main method
            self.tfidf_vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
            print("✅ TF-IDF vectorizer initialized")
        except Exception as e:
            print(f"⚠️ Embedding initialization failed: {e}")
            self.use_embeddings = False
    
    def load_traditional_models(self):
        """Load traditional ML models"""
        try:
            print(f"🔧 Loading traditional models from: {self.models_path}")
            
            # Load category classifier
            with open(os.path.join(self.models_path, 'category_classifier.pkl'), 'rb') as f:
                self.category_classifier = pickle.load(f)
            with open(os.path.join(self.models_path, 'category_tfidf.pkl'), 'rb') as f:
                self.category_tfidf = pickle.load(f)
            
            # Load experience predictor
            with open(os.path.join(self.models_path, 'experience_predictor.pkl'), 'rb') as f:
                self.experience_predictor = pickle.load(f)
            with open(os.path.join(self.models_path, 'experience_tfidf.pkl'), 'rb') as f:
                self.experience_tfidf = pickle.load(f)
            
            # Load match score predictor
            with open(os.path.join(self.models_path, 'match_score_predictor.pkl'), 'rb') as f:
                self.match_score_predictor = pickle.load(f)
            with open(os.path.join(self.models_path, 'match_score_tfidf.pkl'), 'rb') as f:
                self.match_score_tfidf = pickle.load(f)
            
            print("✅ Traditional models loaded successfully")
            self.models_loaded = True
            
        except Exception as e:
            print(f"⚠️ Failed to load traditional models: {e}")
            self.models_loaded = False
    
    def extract_text_from_pdf(self, file_path):
        """Extract text from PDF file"""
        try:
            # Try PyMuPDF first (better OCR support)
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except:
            # Fallback to PyPDF2
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text()
                return text
            except Exception as e:
                print(f"⚠️ PDF extraction error: {e}")
                return ""
    
    def extract_text_from_docx(self, file_path):
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            return '\n'.join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            print(f"⚠️ DOCX extraction error: {e}")
            return ""
    
    def parse_document(self, file_content, filename):
        """Parse document content from bytes and filename"""
        try:
            import tempfile
            import os
            
            print(f"📄 Parsing document: {filename} ({len(file_content)} bytes)")
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as temp_file:
                temp_file.write(file_content)
                temp_file.flush()
                
                # Extract text based on file type
                file_ext = os.path.splitext(filename)[1].lower()
                print(f"📄 File extension: {file_ext}")
                
                if file_ext == '.pdf':
                    print("📄 Processing PDF file...")
                    text = self.extract_text_from_pdf(temp_file.name)
                elif file_ext in ['.docx', '.doc']:
                    print("📄 Processing DOCX file...")
                    text = self.extract_text_from_docx(temp_file.name)
                elif file_ext == '.txt':
                    print("📄 Processing TXT file...")
                    try:
                        text = file_content.decode('utf-8', errors='ignore')
                        print(f"📄 Extracted {len(text)} characters from TXT")
                    except Exception as txt_error:
                        print(f"❌ TXT extraction error: {txt_error}")
                        text = ""
                else:
                    print(f"❌ Unsupported file type: {file_ext}")
                    text = ""
                
                # Clean up temp file
                try:
                    os.unlink(temp_file.name)
                except:
                    pass
                
                final_text = text.strip() if text else ""
                print(f"📄 Final extracted text length: {len(final_text)}")
                
                return final_text
                
        except Exception as e:
            print(f"❌ Document parsing error: {e}")
            import traceback
            traceback.print_exc()
            return ""
    
    def extract_skills_traditional(self, resume_text):
        """Extract skills using traditional pattern matching"""
        skills_found = []
        resume_lower = resume_text.lower()
        
        for skill in self.all_skills:
            if skill.lower() in resume_lower:
                skills_found.append(skill)
        
        return list(set(skills_found))  # Remove duplicates
    
    def extract_skills_enhanced(self, resume_text):
        """Extract skills using enhanced methods"""
        # Start with traditional extraction
        skills = self.extract_skills_traditional(resume_text)
        
        if self.use_embeddings and hasattr(self, 'tfidf_vectorizer'):
            try:
                # Use TF-IDF to find related terms
                resume_vector = self.tfidf_vectorizer.fit_transform([resume_text])
                feature_names = self.tfidf_vectorizer.get_feature_names_out()
                scores = resume_vector.toarray()[0]
                
                # Get top terms
                top_indices = scores.argsort()[-20:][::-1]  # Top 20 terms
                top_terms = [feature_names[i] for i in top_indices if scores[i] > 0.1]
                
                # Filter for potential skills
                for term in top_terms:
                    if len(term) > 2 and term not in skills:
                        # Simple heuristic for technical terms
                        if any(keyword in term for keyword in ['tech', 'dev', 'soft', 'prog', 'data', 'web', 'api']):
                            skills.append(term)
                
            except Exception as e:
                print(f"⚠️ Enhanced skill extraction error: {e}")
        
        return skills[:15]  # Limit to top 15 skills
    
    def predict_experience_traditional(self, resume_text):
        """Predict experience level using traditional ML"""
        if not hasattr(self, 'experience_predictor') or not self.models_loaded:
            # Simple heuristic
            years_matches = re.findall(r'(\d+)\s*(?:years?|yrs?)', resume_text.lower())
            if years_matches:
                max_years = max([int(year) for year in years_matches])
                return min(max_years, 10)  # Cap at 10 years
            return 2  # Default
        
        try:
            resume_vector = self.experience_tfidf.transform([resume_text])
            predicted_experience = self.experience_predictor.predict(resume_vector)[0]
            return max(0, min(10, int(predicted_experience)))  # Ensure 0-10 range
        except Exception as e:
            print(f"⚠️ Experience prediction error: {e}")
            return 2
    
    def classify_job_category_traditional(self, resume_text):
        """Classify job category using traditional ML"""
        if not hasattr(self, 'category_classifier') or not self.models_loaded:
            # Simple keyword-based classification
            resume_lower = resume_text.lower()
            
            if any(term in resume_lower for term in ['data scientist', 'machine learning', 'ai', 'analytics']):
                return "Data Science"
            elif any(term in resume_lower for term in ['frontend', 'react', 'vue', 'angular', 'ui']):
                return "Frontend Development"
            elif any(term in resume_lower for term in ['backend', 'api', 'server', 'database']):
                return "Backend Development"
            elif any(term in resume_lower for term in ['devops', 'kubernetes', 'docker', 'ci/cd']):
                return "DevOps Engineering"
            else:
                return "Software Engineering"
        
        try:
            resume_vector = self.category_tfidf.transform([resume_text])
            predicted_category = self.category_classifier.predict(resume_vector)[0]
            
            # Get confidence scores
            probabilities = self.category_classifier.predict_proba(resume_vector)[0]
            confidence = max(probabilities)
            
            return predicted_category, confidence
        except Exception as e:
            print(f"⚠️ Category classification error: {e}")
            return "Software Engineering", 0.5
    
    def calculate_match_score(self, resume_text, job_description=""):
        """Calculate match score"""
        if not hasattr(self, 'match_score_predictor') or not self.models_loaded:
            # Simple heuristic based on skill overlap
            resume_skills = self.extract_skills_traditional(resume_text)
            if job_description:
                job_skills = self.extract_skills_traditional(job_description)
                common_skills = set(resume_skills) & set(job_skills)
                if job_skills:
                    score = len(common_skills) / len(job_skills) * 100
                    return min(95, max(50, score))  # 50-95 range
            return 75.0  # Default score
        
        try:
            combined_text = f"{resume_text} {job_description}"
            text_vector = self.match_score_tfidf.transform([combined_text])
            match_score = self.match_score_predictor.predict(text_vector)[0]
            return max(0, min(100, float(match_score)))
        except Exception as e:
            print(f"⚠️ Match score calculation error: {e}")
            return 75.0
    
    def analyze_resume(self, resume_text):
        """Main resume analysis method"""
        return self.analyze_resume_enhanced(resume_text)
    
    def analyze_resume_enhanced(self, resume_text):
        """Enhanced resume analysis with improved accuracy"""
        try:
            print("🔍 Starting enhanced resume analysis...")
            
            # Extract skills using enhanced method
            skills = self.extract_skills_enhanced(resume_text)
            
            # Predict experience
            experience = self.predict_experience_traditional(resume_text)
            
            # Classify category
            category_result = self.classify_job_category_traditional(resume_text)
            if isinstance(category_result, tuple):
                category, confidence = category_result
            else:
                category = category_result
                confidence = 0.75
            
            # Calculate match score
            match_score = self.calculate_match_score(resume_text)
            
            # Generate insights
            insights = self.generate_insights(skills, experience, category)
            
            result = {
                'predicted_category': category,
                'predicted_experience': experience,
                'extracted_skills': skills,
                'match_score': match_score,
                'model_confidence': confidence,
                'analysis_method': 'enhanced_traditional',
                'insights': insights,
                'bert_enhanced': False,  # This version doesn't use BERT
                'timestamp': datetime.now().isoformat()
            }
            
            print(f"✅ Analysis completed: {category} ({experience} years)")
            return result
            
        except Exception as e:
            print(f"❌ Analysis error: {e}")
            return self.get_fallback_analysis(resume_text)
    
    def generate_insights(self, skills, experience, category):
        """Generate insights based on analysis"""
        insights = []
        
        # Experience insights
        if experience < 2:
            insights.append("Entry-level position - focus on building foundational skills")
        elif experience < 5:
            insights.append("Mid-level experience - good time to specialize in specific technologies")
        else:
            insights.append("Senior-level experience - consider leadership and mentoring opportunities")
        
        # Skills insights
        if len(skills) < 5:
            insights.append("Consider expanding your technical skill set")
        elif len(skills) > 12:
            insights.append("Strong technical skill set - highlight the most relevant ones")
        
        # Category-specific insights
        if category == "Data Science":
            if not any(skill in ['python', 'machine learning', 'pandas'] for skill in skills):
                insights.append("Consider adding core data science skills like Python, ML, or Pandas")
        elif category == "Frontend Development":
            if not any(skill in ['react', 'angular', 'vue.js'] for skill in skills):
                insights.append("Modern frontend frameworks would strengthen your profile")
        
        return insights
    
    def get_fallback_analysis(self, resume_text):
        """Fallback analysis when models are not available"""
        skills = self.extract_skills_traditional(resume_text)
        experience = self.predict_experience_traditional(resume_text)
        
        return {
            'predicted_category': "Software Engineering",
            'predicted_experience': experience,
            'extracted_skills': skills,
            'match_score': 70.0,
            'analysis_method': 'fallback',
            'model_confidence': 0.5,
            'bert_enhanced': False,
            'insights': ["Basic analysis completed - enhanced features temporarily unavailable"]
        }
    
    def get_job_recommendations(self, analysis_result, top_k=5):
        """Get job recommendations based on analysis"""
        try:
            category = analysis_result.get('predicted_category', 'Software Engineering')
            skills = analysis_result.get('extracted_skills', [])
            experience = analysis_result.get('predicted_experience', 3)
            
            recommendations = []
            
            # Generate recommendations based on category and skills
            if 'Data Science' in category or any(skill in ['python', 'machine learning', 'pandas'] for skill in skills):
                recommendations.extend([
                    {
                        'title': 'Data Scientist',
                        'company': 'Tech Corp',
                        'location': 'Remote',
                        'match_score': 85,
                        'required_skills': ['Python', 'Machine Learning', 'SQL'],
                        'salary_range': '$80k - $120k'
                    },
                    {
                        'title': 'ML Engineer',
                        'company': 'AI Startup',
                        'location': 'San Francisco',
                        'match_score': 82,
                        'required_skills': ['Python', 'TensorFlow', 'AWS'],
                        'salary_range': '$90k - $140k'
                    }
                ])
            
            if 'Frontend' in category or any(skill in ['react', 'javascript', 'html'] for skill in skills):
                recommendations.extend([
                    {
                        'title': 'Frontend Developer',
                        'company': 'Web Solutions',
                        'location': 'New York',
                        'match_score': 88,
                        'required_skills': ['React', 'JavaScript', 'CSS'],
                        'salary_range': '$70k - $110k'
                    }
                ])
            
            if 'Backend' in category or any(skill in ['python', 'java', 'node.js'] for skill in skills):
                recommendations.extend([
                    {
                        'title': 'Backend Developer',
                        'company': 'Enterprise Solutions',
                        'location': 'Austin',
                        'match_score': 86,
                        'required_skills': ['Python', 'Django', 'PostgreSQL'],
                        'salary_range': '$75k - $115k'
                    }
                ])
            
            # Add default if no matches
            if not recommendations:
                recommendations = [
                    {
                        'title': 'Software Engineer',
                        'company': 'Generic Tech',
                        'location': 'Remote',
                        'match_score': 75,
                        'required_skills': ['Programming', 'Problem Solving'],
                        'salary_range': '$65k - $100k'
                    }
                ]
            
            return {
                'recommendations': recommendations[:top_k],
                'total_found': len(recommendations),
                'search_criteria': {
                    'category': category,
                    'skills': skills[:5],
                    'experience_level': experience
                }
            }
            
        except Exception as e:
            print(f"⚠️ Job recommendations error: {e}")
            return {
                'recommendations': [],
                'total_found': 0,
                'error': str(e)
            }
    
    def skill_gap_analysis(self, resume_text, job_description):
        """Analyze skill gaps between resume and job requirements"""
        try:
            print("🔍 Starting skill gap analysis...")
            
            resume_skills = self.extract_skills_enhanced(resume_text)
            job_skills = self.extract_skills_enhanced(job_description)
            
            # Simple overlap analysis
            matching_skills = list(set(resume_skills) & set(job_skills))
            missing_skills = list(set(job_skills) - set(resume_skills))
            
            match_percentage = (len(matching_skills) / len(job_skills) * 100) if job_skills else 0
            
            # Generate recommendations
            recommendations = []
            for skill in missing_skills[:5]:  # Top 5 missing skills
                recommendations.append({
                    'type': 'skill_development',
                    'skill': skill,
                    'priority': 'high' if skill in ['python', 'javascript', 'sql'] else 'medium',
                    'estimated_learning_time': self._estimate_learning_time(skill),
                    'resources': self._get_learning_resources(skill)
                })
            
            return {
                'analysis_method': 'enhanced_traditional',
                'match_percentage': round(match_percentage, 1),
                'matching_skills': [{'skill': skill, 'similarity': 1.0} for skill in matching_skills],
                'missing_skills': [{'skill': skill, 'priority': 'medium'} for skill in missing_skills],
                'recommendations': recommendations,
                'total_job_skills': len(job_skills),
                'total_resume_skills': len(resume_skills),
                'bert_enhanced': False
            }
            
        except Exception as e:
            print(f"❌ Skill gap analysis error: {e}")
            return {
                'analysis_method': 'error',
                'match_percentage': 0,
                'matching_skills': [],
                'missing_skills': [],
                'recommendations': [],
                'error': str(e),
                'bert_enhanced': False
            }
    
    def _estimate_learning_time(self, skill):
        """Estimate learning time for a skill"""
        time_estimates = {
            'python': '2-3 months',
            'javascript': '2-3 months',
            'react': '1-2 months',
            'node.js': '1-2 months',
            'sql': '1 month',
            'git': '2 weeks',
            'docker': '3-4 weeks',
            'kubernetes': '2-3 months',
            'aws': '2-4 months',
            'machine learning': '3-6 months',
            'tensorflow': '2-3 months',
            'pytorch': '2-3 months'
        }
        return time_estimates.get(skill.lower(), '1-2 months')
    
    def _get_learning_resources(self, skill):
        """Get learning resources for a skill"""
        resources = {
            'python': [
                {'type': 'course', 'name': 'Python for Everybody (Coursera)', 'url': 'https://coursera.org'},
                {'type': 'practice', 'name': 'LeetCode Python', 'url': 'https://leetcode.com'},
                {'type': 'documentation', 'name': 'Python Official Docs', 'url': 'https://docs.python.org'}
            ],
            'javascript': [
                {'type': 'course', 'name': 'JavaScript MDN Guide', 'url': 'https://developer.mozilla.org'},
                {'type': 'practice', 'name': 'freeCodeCamp', 'url': 'https://freecodecamp.org'},
                {'type': 'course', 'name': 'JavaScript.info', 'url': 'https://javascript.info'}
            ],
            'react': [
                {'type': 'course', 'name': 'React Official Tutorial', 'url': 'https://reactjs.org'},
                {'type': 'practice', 'name': 'React Challenges', 'url': 'https://codepen.io'},
                {'type': 'course', 'name': 'Scrimba React Course', 'url': 'https://scrimba.com'}
            ]
        }
        
        default_resources = [
            {'type': 'search', 'name': f'{skill} tutorials on YouTube', 'url': 'https://youtube.com'},
            {'type': 'practice', 'name': f'{skill} projects on GitHub', 'url': 'https://github.com'},
            {'type': 'course', 'name': f'{skill} courses on Udemy', 'url': 'https://udemy.com'}
        ]
        
        return resources.get(skill.lower(), default_resources)

# Global service instance
_simple_bert_service = None

def get_simple_bert_ml_service():
    """Get or create the ML service instance"""
    global _simple_bert_service
    if _simple_bert_service is None:
        _simple_bert_service = SimpleBERTEnhancedMLService()
    return _simple_bert_service

if __name__ == "__main__":
    # Test the service
    service = get_simple_bert_ml_service()
    test_text = "Experienced Python developer with machine learning and data science background. Worked with pandas, numpy, scikit-learn for 5 years."
    result = service.analyze_resume(test_text)
    print("Test result:", result)
