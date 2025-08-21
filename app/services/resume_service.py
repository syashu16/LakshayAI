"""
Resume Analysis Service
Handles resume processing, analysis, and ML-powered insights
"""

import os
import json
import PyPDF2
import docx
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
from werkzeug.utils import secure_filename

# Import the ML service
from .ml_resume_service import get_ml_service

logger = logging.getLogger(__name__)

class ResumeService:
    """
    Service class for handling resume analysis and processing
    """
    
    def __init__(self, upload_folder: str = "app/static/uploads"):
        """
        Initialize the resume service
        
        Args:
            upload_folder (str): Directory for storing uploaded files
        """
        self.upload_folder = upload_folder
        self.allowed_extensions = {'pdf', 'doc', 'docx', 'txt'}
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        
        # Ensure upload directory exists
        os.makedirs(self.upload_folder, exist_ok=True)
        
        # Get ML service instance
        self.ml_service = get_ml_service()
    
    def is_allowed_file(self, filename: str) -> bool:
        """
        Check if the file extension is allowed
        
        Args:
            filename (str): Name of the file
            
        Returns:
            bool: True if file is allowed, False otherwise
        """
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def extract_text_from_file(self, file_path: str) -> str:
        """
        Extract text content from various file formats
        
        Args:
            file_path (str): Path to the file
            
        Returns:
            str: Extracted text content
        """
        try:
            file_extension = file_path.rsplit('.', 1)[1].lower()
            
            if file_extension == 'pdf':
                return self._extract_from_pdf(file_path)
            elif file_extension in ['doc', 'docx']:
                return self._extract_from_docx(file_path)
            elif file_extension == 'txt':
                return self._extract_from_txt(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
                
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            raise
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
            raise
        
        return text.strip()
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error reading DOCX: {e}")
            raise
    
    def _extract_from_txt(self, file_path: str) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read().strip()
        except Exception as e:
            logger.error(f"Error reading TXT: {e}")
            raise
    
    def save_uploaded_file(self, file) -> Dict[str, Any]:
        """
        Save uploaded file and return file information
        
        Args:
            file: Uploaded file object
            
        Returns:
            dict: File information including path and metadata
        """
        try:
            if not file or file.filename == '':
                raise ValueError("No file provided")
            
            if not self.is_allowed_file(file.filename):
                raise ValueError(f"File type not allowed. Supported formats: {', '.join(self.allowed_extensions)}")
            
            # Generate secure filename
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{filename}"
            
            file_path = os.path.join(self.upload_folder, filename)
            
            # Save file
            file.save(file_path)
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            if file_size > self.max_file_size:
                os.remove(file_path)
                raise ValueError(f"File too large. Maximum size: {self.max_file_size // (1024*1024)}MB")
            
            return {
                'filename': filename,
                'original_filename': file.filename,
                'file_path': file_path,
                'file_size': file_size,
                'upload_time': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error saving uploaded file: {e}")
            raise
    
    def analyze_resume(self, file_info: Dict[str, Any], additional_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Perform comprehensive resume analysis
        
        Args:
            file_info (dict): Information about the uploaded file
            additional_data (dict, optional): Additional data like skills, keywords
            
        Returns:
            dict: Comprehensive analysis results
        """
        try:
            # Extract text from file
            resume_text = self.extract_text_from_file(file_info['file_path'])
            
            if not resume_text.strip():
                raise ValueError("No text content found in the resume")
            
            # Prepare data for ML analysis
            resume_data = {
                'content': resume_text,
                'skills': additional_data.get('skills', '') if additional_data else '',
                'keywords': additional_data.get('keywords', '') if additional_data else '',
                'filename': file_info['filename'],
                'file_size': file_info['file_size']
            }
            
            # Perform basic analysis
            basic_analysis = self._perform_basic_analysis(resume_text)
            
            # Perform ML analysis
            ml_analysis = self.ml_service.analyze_resume(resume_data)
            
            # Combine results
            analysis_result = {
                'file_info': file_info,
                'basic_analysis': basic_analysis,
                'ml_analysis': ml_analysis,
                'timestamp': datetime.now().isoformat(),
                'success': True
            }
            
            # Add summary
            analysis_result['summary'] = self._generate_analysis_summary(analysis_result)
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error in resume analysis: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _perform_basic_analysis(self, resume_text: str) -> Dict[str, Any]:
        """
        Perform basic text analysis on resume
        
        Args:
            resume_text (str): Resume text content
            
        Returns:
            dict: Basic analysis results
        """
        try:
            # Basic statistics
            word_count = len(resume_text.split())
            char_count = len(resume_text)
            line_count = len(resume_text.split('\n'))
            
            # Common patterns
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
            
            import re
            emails = re.findall(email_pattern, resume_text)
            phones = re.findall(phone_pattern, resume_text)
            
            # Common keywords
            technical_keywords = [
                'python', 'javascript', 'java', 'c++', 'react', 'angular', 'vue',
                'node.js', 'django', 'flask', 'spring', 'docker', 'kubernetes',
                'aws', 'azure', 'gcp', 'machine learning', 'ai', 'data science',
                'sql', 'mongodb', 'postgresql', 'git', 'agile', 'scrum'
            ]
            
            found_keywords = []
            resume_lower = resume_text.lower()
            for keyword in technical_keywords:
                if keyword in resume_lower:
                    found_keywords.append(keyword)
            
            return {
                'word_count': word_count,
                'character_count': char_count,
                'line_count': line_count,
                'emails_found': emails,
                'phones_found': phones,
                'technical_keywords_found': found_keywords,
                'keyword_count': len(found_keywords),
                'readability_score': self._calculate_readability_score(resume_text)
            }
            
        except Exception as e:
            logger.error(f"Error in basic analysis: {e}")
            return {'error': str(e)}
    
    def _calculate_readability_score(self, text: str) -> float:
        """
        Calculate a simple readability score
        
        Args:
            text (str): Text to analyze
            
        Returns:
            float: Readability score (0-100)
        """
        try:
            sentences = text.split('.')
            words = text.split()
            
            if len(sentences) == 0 or len(words) == 0:
                return 0.0
            
            avg_words_per_sentence = len(words) / len(sentences)
            avg_chars_per_word = sum(len(word) for word in words) / len(words)
            
            # Simple readability formula (higher is better)
            score = 100 - (avg_words_per_sentence * 2) - (avg_chars_per_word * 3)
            return max(0, min(100, score))
            
        except Exception:
            return 50.0  # Default score
    
    def _generate_analysis_summary(self, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a summary of the analysis results
        
        Args:
            analysis_result (dict): Complete analysis results
            
        Returns:
            dict: Analysis summary
        """
        try:
            summary = {
                'overall_assessment': 'Good',
                'strengths': [],
                'areas_for_improvement': [],
                'key_insights': []
            }
            
            basic = analysis_result.get('basic_analysis', {})
            ml = analysis_result.get('ml_analysis', {})
            
            # Basic analysis insights
            if basic.get('word_count', 0) > 500:
                summary['strengths'].append("Well-detailed resume with comprehensive content")
            elif basic.get('word_count', 0) < 200:
                summary['areas_for_improvement'].append("Resume could be more detailed")
            
            if basic.get('keyword_count', 0) > 5:
                summary['strengths'].append("Rich in technical keywords")
            else:
                summary['areas_for_improvement'].append("Could include more relevant technical keywords")
            
            # ML analysis insights
            if ml.get('success') and 'analysis' in ml:
                ml_analysis = ml['analysis']
                
                overall_score = ml_analysis.get('overall_score', 0)
                
                if overall_score >= 80:
                    summary['overall_assessment'] = 'Excellent'
                elif overall_score >= 60:
                    summary['overall_assessment'] = 'Good'
                elif overall_score >= 40:
                    summary['overall_assessment'] = 'Fair'
                else:
                    summary['overall_assessment'] = 'Needs Improvement'
                
                # Add ML recommendations
                ml_recommendations = ml_analysis.get('recommendations', [])
                summary['areas_for_improvement'].extend(ml_recommendations)
                
                # Add prediction insights
                predictions = ml_analysis.get('predictions', {})
                if 'job_category' in predictions:
                    summary['key_insights'].append(
                        f"Best fit for: {predictions['job_category']}"
                    )
                
                if 'experience_level' in predictions:
                    summary['key_insights'].append(
                        f"Experience level: {predictions['experience_level']}"
                    )
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return {
                'overall_assessment': 'Unknown',
                'strengths': [],
                'areas_for_improvement': [],
                'key_insights': []
            }
    
    def get_analysis_history(self, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get analysis history for a user (placeholder for database integration)
        
        Args:
            user_id (int, optional): User ID
            
        Returns:
            list: List of previous analyses
        """
        # Placeholder - would integrate with database
        return []
    
    def delete_uploaded_file(self, file_path: str) -> bool:
        """
        Delete an uploaded file
        
        Args:
            file_path (str): Path to file to delete
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")
            return False
    
    def get_ml_service_status(self) -> Dict[str, Any]:
        """
        Get the status of the ML service
        
        Returns:
            dict: ML service status
        """
        return self.ml_service.get_model_status()

# Create global instance
resume_service = ResumeService()

def get_resume_service() -> ResumeService:
    """
    Get the global resume service instance
    
    Returns:
        ResumeService: The resume service instance
    """
    return resume_service
