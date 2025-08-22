"""
Advanced ML Resume Analysis Service
Integrates trained ML models with the Flask application for intelligent resume analysis
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import re
import ast
from datetime import datetime
from typing import Dict, Any, Optional, List
from sklearn.feature_extraction.text import TfidfVectorizer
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MLResumeAnalysisService:
    """
    Production-ready ML service for resume analysis using trained models
    """
    
    def __init__(self, models_path: str = "trained_models"):
        """
        Initialize the ML service with trained models
        
        Args:
            models_path (str): Path to the directory containing trained models
        """
        self.models_path = models_path
        self.models = {}
        self.vectorizers = {}
        self.training_stats = {}
        self.is_loaded = False
        
        # Load models on initialization
        self.load_models()
    
    def load_models(self) -> bool:
        """
        Load all trained models and components
        
        Returns:
            bool: True if models loaded successfully, False otherwise
        """
        try:
            if not os.path.exists(self.models_path):
                logger.error(f"Models directory not found: {self.models_path}")
                return False
            
            logger.info(f"Loading ML models from {self.models_path}...")
            
            # Load models
            model_files = {
                'category_classifier': 'category_classifier.pkl',
                'match_score_predictor': 'match_score_predictor.pkl',
                'experience_predictor': 'experience_predictor.pkl',
                'skill_domain_classifier': 'skill_domain_classifier.pkl'
            }
            
            for model_name, filename in model_files.items():
                file_path = os.path.join(self.models_path, filename)
                if os.path.exists(file_path):
                    self.models[model_name] = joblib.load(file_path)
                    logger.info(f"✅ Loaded {model_name}")
                else:
                    logger.warning(f"⚠️ Model file not found: {filename}")
            
            # Load vectorizers
            vectorizer_files = {
                'category_tfidf': 'category_tfidf.pkl',
                'match_score_tfidf': 'match_score_tfidf.pkl',
                'experience_tfidf': 'experience_tfidf.pkl',
                'skill_domain_tfidf': 'skill_domain_tfidf.pkl'
            }
            
            for vectorizer_name, filename in vectorizer_files.items():
                file_path = os.path.join(self.models_path, filename)
                if os.path.exists(file_path):
                    self.vectorizers[vectorizer_name] = joblib.load(file_path)
                    logger.info(f"✅ Loaded {vectorizer_name}")
                else:
                    logger.warning(f"⚠️ Vectorizer file not found: {filename}")
            
            # Load training statistics
            stats_path = os.path.join(self.models_path, "training_stats.json")
            if os.path.exists(stats_path):
                with open(stats_path, 'r') as f:
                    self.training_stats = json.load(f)
                logger.info("✅ Loaded training statistics")
            
            self.is_loaded = len(self.models) > 0
            logger.info(f"🎯 ML Service loaded with {len(self.models)} models")
            
            return self.is_loaded
            
        except Exception as e:
            logger.error(f"❌ Error loading models: {str(e)}")
            return False
    
    def _clean_text(self, text: str) -> str:
        """
        Clean and preprocess text for ML models
        
        Args:
            text (str): Raw text to clean
            
        Returns:
            str: Cleaned text
        """
        if not text or pd.isna(text):
            return ""
        
        # Convert to string and lowercase
        text = str(text).lower()
        
        # Remove special characters and normalize whitespace
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    def _extract_skills_from_text(self, skills_input: Any) -> str:
        """
        Extract and clean skills from various input formats
        
        Args:
            skills_input: Skills in various formats (list, string, etc.)
            
        Returns:
            str: Cleaned skills text
        """
        try:
            if not skills_input or pd.isna(skills_input):
                return ""
            
            # If it's already a string
            if isinstance(skills_input, str):
                # Try to parse as list if it looks like one
                if skills_input.startswith('[') and skills_input.endswith(']'):
                    try:
                        skills_list = ast.literal_eval(skills_input)
                        if isinstance(skills_list, list):
                            return ' '.join(str(skill) for skill in skills_list)
                    except:
                        pass
                return str(skills_input)
            
            # If it's a list
            elif isinstance(skills_input, list):
                return ' '.join(str(skill) for skill in skills_input)
            
            # Default case
            return str(skills_input)
            
        except Exception as e:
            logger.warning(f"Error extracting skills: {e}")
            return ""
    
    def analyze_resume(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform comprehensive ML analysis on resume data
        
        Args:
            resume_data (dict): Dictionary containing resume information
                Expected keys: 'content', 'skills', 'keywords', etc.
                
        Returns:
            dict: Comprehensive analysis results
        """
        if not self.is_loaded:
            return {
                'success': False,
                'error': 'ML models not loaded',
                'analysis': {}
            }
        
        try:
            # Extract and clean data
            resume_text = resume_data.get('content', '')
            skills_text = resume_data.get('skills', '')
            keywords_text = resume_data.get('keywords', '')
            
            # Clean text inputs
            resume_clean = self._clean_text(resume_text)
            skills_clean = self._extract_skills_from_text(skills_text)
            keywords_clean = self._clean_text(keywords_text)
            
            # Combine all text
            combined_text = f"{resume_clean} {skills_clean} {keywords_clean}"
            
            # Initialize analysis results
            analysis = {
                'timestamp': datetime.now().isoformat(),
                'input_stats': {
                    'resume_length': len(resume_text),
                    'skills_count': len(skills_clean.split()) if skills_clean else 0,
                    'keywords_count': len(keywords_clean.split()) if keywords_clean else 0
                },
                'predictions': {},
                'confidence_scores': {},
                'recommendations': []
            }
            
            # Predict job category
            if 'category_classifier' in self.models and 'category_tfidf' in self.vectorizers:
                try:
                    category_features = self.vectorizers['category_tfidf'].transform([combined_text])
                    category_pred = self.models['category_classifier'].predict(category_features)[0]
                    category_proba = self.models['category_classifier'].predict_proba(category_features)[0]
                    
                    analysis['predictions']['job_category'] = category_pred
                    analysis['confidence_scores']['job_category'] = float(max(category_proba))
                    
                    # Get top 3 categories with probabilities
                    classes = self.models['category_classifier'].classes_
                    top_categories = []
                    for i, prob in enumerate(category_proba):
                        top_categories.append({'category': classes[i], 'probability': float(prob)})
                    top_categories.sort(key=lambda x: x['probability'], reverse=True)
                    analysis['predictions']['top_categories'] = top_categories[:3]
                    
                except Exception as e:
                    logger.error(f"Error in category prediction: {e}")
            
            # Predict experience level
            if 'experience_predictor' in self.models and 'experience_tfidf' in self.vectorizers:
                try:
                    exp_features = self.vectorizers['experience_tfidf'].transform([combined_text])
                    exp_pred = self.models['experience_predictor'].predict(exp_features)[0]
                    exp_proba = self.models['experience_predictor'].predict_proba(exp_features)[0]
                    
                    analysis['predictions']['experience_level'] = exp_pred
                    analysis['confidence_scores']['experience_level'] = float(max(exp_proba))
                    
                    # Get all experience levels with probabilities
                    exp_classes = self.models['experience_predictor'].classes_
                    exp_probabilities = {}
                    for i, prob in enumerate(exp_proba):
                        exp_probabilities[exp_classes[i]] = float(prob)
                    analysis['predictions']['experience_probabilities'] = exp_probabilities
                    
                except Exception as e:
                    logger.error(f"Error in experience prediction: {e}")
            
            # Predict skill domain
            if 'skill_domain_classifier' in self.models and 'skill_domain_tfidf' in self.vectorizers:
                try:
                    domain_features = self.vectorizers['skill_domain_tfidf'].transform([skills_clean])
                    domain_pred = self.models['skill_domain_classifier'].predict(domain_features)[0]
                    domain_proba = self.models['skill_domain_classifier'].predict_proba(domain_features)[0]
                    
                    analysis['predictions']['skill_domain'] = domain_pred
                    analysis['confidence_scores']['skill_domain'] = float(max(domain_proba))
                    
                except Exception as e:
                    logger.error(f"Error in skill domain prediction: {e}")
            
            # Generate recommendations based on predictions
            analysis['recommendations'] = self._generate_recommendations(analysis)
            
            # Calculate overall analysis score
            analysis['overall_score'] = self._calculate_overall_score(analysis)
            
            return {
                'success': True,
                'analysis': analysis,
                'model_info': {
                    'models_used': list(self.models.keys()),
                    'training_stats': self.training_stats
                }
            }
            
        except Exception as e:
            logger.error(f"Error in resume analysis: {e}")
            return {
                'success': False,
                'error': str(e),
                'analysis': {}
            }
    
    def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """
        Generate personalized recommendations based on analysis results
        
        Args:
            analysis (dict): Analysis results
            
        Returns:
            list: List of recommendation strings
        """
        recommendations = []
        predictions = analysis.get('predictions', {})
        confidence_scores = analysis.get('confidence_scores', {})
        
        # Category-based recommendations
        if 'job_category' in predictions:
            category = predictions['job_category']
            confidence = confidence_scores.get('job_category', 0)
            
            if confidence < 0.7:
                recommendations.append(
                    f"Consider adding more {category}-specific keywords and skills to improve category match"
                )
        
        # Experience-level recommendations
        if 'experience_level' in predictions:
            exp_level = predictions['experience_level']
            
            if exp_level == 'Entry':
                recommendations.append(
                    "Focus on highlighting projects, internships, and relevant coursework"
                )
            elif exp_level == 'Junior':
                recommendations.append(
                    "Emphasize learning achievements and early career accomplishments"
                )
            elif exp_level in ['Mid', 'Senior', 'Expert']:
                recommendations.append(
                    "Highlight leadership experience and complex project management"
                )
        
        # Skill domain recommendations
        if 'skill_domain' in predictions:
            domain = predictions['skill_domain']
            domain_confidence = confidence_scores.get('skill_domain', 0)
            
            if domain_confidence < 0.6:
                recommendations.append(
                    f"Consider adding more domain-specific skills for {domain}"
                )
        
        # General recommendations
        input_stats = analysis.get('input_stats', {})
        
        if input_stats.get('resume_length', 0) < 500:
            recommendations.append(
                "Consider expanding your resume with more detailed descriptions"
            )
        
        if input_stats.get('skills_count', 0) < 5:
            recommendations.append(
                "Add more relevant technical and soft skills to strengthen your profile"
            )
        
        return recommendations
    
    def _calculate_overall_score(self, analysis: Dict[str, Any]) -> float:
        """
        Calculate an overall analysis score based on various factors
        
        Args:
            analysis (dict): Analysis results
            
        Returns:
            float: Overall score between 0 and 100
        """
        try:
            score = 0.0
            factors = 0
            
            # Confidence scores contribution (40% weight)
            confidence_scores = analysis.get('confidence_scores', {})
            if confidence_scores:
                avg_confidence = sum(confidence_scores.values()) / len(confidence_scores)
                score += avg_confidence * 40
                factors += 40
            
            # Content quality contribution (30% weight)
            input_stats = analysis.get('input_stats', {})
            content_score = 0
            
            # Resume length factor
            resume_length = input_stats.get('resume_length', 0)
            if resume_length > 1000:
                content_score += 10
            elif resume_length > 500:
                content_score += 7
            elif resume_length > 200:
                content_score += 5
            
            # Skills count factor
            skills_count = input_stats.get('skills_count', 0)
            if skills_count > 15:
                content_score += 10
            elif skills_count > 10:
                content_score += 7
            elif skills_count > 5:
                content_score += 5
            
            # Keywords count factor
            keywords_count = input_stats.get('keywords_count', 0)
            if keywords_count > 10:
                content_score += 10
            elif keywords_count > 5:
                content_score += 7
            elif keywords_count > 2:
                content_score += 5
            
            score += content_score
            factors += 30
            
            # Prediction diversity contribution (30% weight)
            predictions = analysis.get('predictions', {})
            prediction_score = len(predictions) * 7.5  # Max 30 for 4 predictions
            score += min(prediction_score, 30)
            factors += 30
            
            # Normalize score to 0-100 range
            if factors > 0:
                final_score = (score / factors) * 100
                return round(min(max(final_score, 0), 100), 2)
            
            return 0.0
            
        except Exception as e:
            logger.error(f"Error calculating overall score: {e}")
            return 0.0
    
    def get_model_status(self) -> Dict[str, Any]:
        """
        Get the current status of loaded ML models
        
        Returns:
            dict: Model status information
        """
        return {
            'is_loaded': self.is_loaded,
            'models_available': list(self.models.keys()),
            'vectorizers_available': list(self.vectorizers.keys()),
            'models_path': self.models_path,
            'training_stats': self.training_stats
        }
    
    def health_check(self) -> Dict[str, Any]:
        """
        Perform a health check on the ML service
        
        Returns:
            dict: Health check results
        """
        try:
            # Test with dummy data
            test_data = {
                'content': 'Test software engineer with Python experience',
                'skills': 'Python, JavaScript',
                'keywords': 'software engineer'
            }
            
            result = self.analyze_resume(test_data)
            
            return {
                'status': 'healthy' if result['success'] else 'unhealthy',
                'models_loaded': len(self.models),
                'vectorizers_loaded': len(self.vectorizers),
                'test_analysis_success': result['success'],
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

# Create global instance
ml_service = None

def get_ml_service() -> MLResumeAnalysisService:
    """
    Get or create the global ML service instance
    
    Returns:
        MLResumeAnalysisService: The ML service instance
    """
    global ml_service
    if ml_service is None:
        # Try to find models in common locations
        possible_paths = [
            'trained_models',
            'backend/trained_models',
            os.path.join(os.path.dirname(__file__), '..', '..', 'trained_models'),
            os.path.join(os.path.dirname(__file__), 'trained_models')
        ]
        
        models_path = None
        for path in possible_paths:
            if os.path.exists(path):
                models_path = path
                break
        
        if models_path:
            ml_service = MLResumeAnalysisService(models_path)
        else:
            logger.warning("⚠️ No trained models found. Please train models first using the Jupyter notebook.")
            ml_service = MLResumeAnalysisService("trained_models")  # Will fail gracefully
    
    return ml_service

# For backward compatibility
def analyze_resume_with_ml(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Wrapper function for backward compatibility
    
    Args:
        resume_data (dict): Resume data to analyze
        
    Returns:
        dict: Analysis results
    """
    service = get_ml_service()
    return service.analyze_resume(resume_data)
