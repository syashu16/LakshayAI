#!/usr/bin/env python3
"""
🚀 Ultra-Advanced ML Pipeline for Resume Analysis
===============================================

This implements the most sophisticated ML techniques for resume parsing and job recommendation:
- Sentence transformers for semantic embeddings
- FAISS for efficient similarity search
- Advanced NLP with spaCy and BERT
- Multi-modal feature engineering
- Ensemble methods with deep learning
- Real-time job matching with Adzuna API
- Skills gap analysis with semantic inference

Author: LakshyaAI Team
Date: August 2025
"""

import os
import re
import json
import pandas as pd
import numpy as np
import joblib
import logging
from pathlib import Path
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import warnings
warnings.filterwarnings('ignore')

# Advanced ML and NLP Libraries
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from sentence_transformers import SentenceTransformer, util
import faiss
import spacy
from spacy.matcher import PhraseMatcher
import transformers
from transformers import AutoTokenizer, AutoModel, BertTokenizer, BertModel

# Document Processing
import docx2txt
from pdfminer.high_level import extract_text

# Traditional ML with Advanced Techniques
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler
from sklearn.ensemble import (
    RandomForestClassifier, GradientBoostingClassifier, 
    ExtraTreesClassifier, AdaBoostClassifier, VotingClassifier,
    RandomForestRegressor, GradientBoostingRegressor, VotingRegressor
)
from sklearn.linear_model import LogisticRegression, Ridge, ElasticNet
from sklearn.svm import SVC, SVR
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    f1_score, precision_score, recall_score, r2_score, mean_absolute_error
)
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import PCA, TruncatedSVD

# API and Web Requests
import requests
from urllib.parse import urlencode

# Advanced Text Processing
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.chunk import ne_chunk
from nltk.tag import pos_tag

# Setup logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ml_training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class UltraAdvancedResumeMLPipeline:
    """
    Ultra-sophisticated ML pipeline implementing all advanced techniques:
    - Semantic embeddings with sentence transformers
    - FAISS vector similarity search
    - Advanced NLP with spaCy NER
    - Multi-modal feature engineering
    - Deep learning ensemble models
    - Real-time job matching
    - Skills gap analysis
    """
    
    def __init__(self, data_path="resume_dataset.csv"):
        self.data_path = data_path
        self.models_dir = Path("ultra_advanced_models")
        self.models_dir.mkdir(exist_ok=True)
        
        # Initialize advanced components
        self.sentence_model = None
        self.nlp = None
        self.phrase_matcher = None
        self.faiss_index = None
        self.skill_ontology = None
        
        # Performance tracking
        self.performance_metrics = {}
        self.embeddings_cache = {}
        
        # API configuration
        self.adzuna_app_id = os.getenv('ADZUNA_APP_ID', 'your_app_id')
        self.adzuna_api_key = os.getenv('ADZUNA_API_KEY', 'your_api_key')
        
        logger.info("🚀 Ultra-Advanced ML Pipeline initialized")
    
    def setup_advanced_nlp_components(self):
        """Initialize all advanced NLP components"""
        logger.info("🔧 Setting up advanced NLP components...")
        
        try:
            # Download required NLTK data
            nltk_downloads = ['punkt', 'stopwords', 'wordnet', 'averaged_perceptron_tagger', 'maxent_ne_chunker', 'words']
            for item in nltk_downloads:
                nltk.download(item, quiet=True)
            
            # Initialize sentence transformer for semantic embeddings
            logger.info("📥 Loading sentence transformer model...")
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Initialize spaCy with NER capabilities
            logger.info("📥 Loading spaCy NLP model...")
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("spaCy model not found. Installing...")
                os.system("python -m spacy download en_core_web_sm")
                self.nlp = spacy.load("en_core_web_sm")
            
            # Initialize BERT for advanced text understanding
            logger.info("📥 Loading BERT model...")
            self.bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
            self.bert_model = BertModel.from_pretrained('bert-base-uncased')
            
            # Load comprehensive skill ontology
            self.load_skill_ontology()
            
            # Setup phrase matcher for skill extraction
            self.setup_phrase_matcher()
            
            logger.info("✅ Advanced NLP components ready")
            
        except Exception as e:
            logger.error(f"❌ Error setting up NLP components: {e}")
            raise
    
    def load_skill_ontology(self):
        """Load comprehensive skill ontology for better skill extraction"""
        self.skill_ontology = {
            'programming_languages': [
                'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust', 
                'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Haskell'
            ],
            'web_technologies': [
                'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 
                'Spring Boot', 'Laravel', 'Ruby on Rails', 'ASP.NET', 'Next.js', 'Nuxt.js'
            ],
            'databases': [
                'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'Neo4j', 
                'Oracle', 'SQL Server', 'SQLite', 'DynamoDB', 'CouchDB', 'InfluxDB'
            ],
            'cloud_platforms': [
                'AWS', 'Azure', 'Google Cloud', 'IBM Cloud', 'DigitalOcean', 
                'Heroku', 'Vercel', 'Netlify', 'Firebase'
            ],
            'devops_tools': [
                'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions', 
                'Terraform', 'Ansible', 'Chef', 'Puppet', 'Vagrant'
            ],
            'data_science': [
                'Machine Learning', 'Deep Learning', 'Data Science', 'AI', 'NLP', 
                'Computer Vision', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn',
                'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Plotly', 'Jupyter'
            ],
            'soft_skills': [
                'Leadership', 'Communication', 'Problem Solving', 'Team Work', 
                'Project Management', 'Agile', 'Scrum', 'Critical Thinking'
            ]
        }
        
        # Flatten all skills for easy access
        self.all_skills = []
        for category, skills in self.skill_ontology.items():
            self.all_skills.extend(skills)
        
        logger.info(f"📚 Loaded {len(self.all_skills)} skills across {len(self.skill_ontology)} categories")
    
    def setup_phrase_matcher(self):
        """Setup spaCy phrase matcher for efficient skill extraction"""
        self.phrase_matcher = PhraseMatcher(self.nlp.vocab, attr="LOWER")
        
        # Add skill patterns
        skill_patterns = [self.nlp(skill) for skill in self.all_skills]
        self.phrase_matcher.add("SKILLS", skill_patterns)
        
        logger.info("🎯 Phrase matcher configured for skill extraction")
    
    def extract_text_from_document(self, file_path):
        """Extract text from PDF or DOCX documents using advanced methods"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Resume file not found: {file_path}")
        
        file_extension = Path(file_path).suffix.lower()
        
        try:
            if file_extension == '.pdf':
                # Use pdfminer for robust PDF text extraction
                text = extract_text(file_path)
            elif file_extension in ['.docx', '.doc']:
                # Use docx2txt for Word documents
                text = docx2txt.process(file_path)
            else:
                # Fallback for plain text
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"❌ Error extracting text from {file_path}: {e}")
            return ""
    
    def extract_candidate_info_with_ner(self, text):
        """Extract candidate information using advanced NER"""
        doc = self.nlp(text)
        
        candidate_info = {
            'name': None,
            'emails': [],
            'phones': [],
            'organizations': [],
            'locations': []
        }
        
        # Extract named entities
        for ent in doc.ents:
            if ent.label_ == "PERSON" and not candidate_info['name']:
                candidate_info['name'] = ent.text
            elif ent.label_ == "ORG":
                candidate_info['organizations'].append(ent.text)
            elif ent.label_ in ["GPE", "LOC"]:
                candidate_info['locations'].append(ent.text)
        
        # Extract emails and phones using regex
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        
        candidate_info['emails'] = re.findall(email_pattern, text)
        candidate_info['phones'] = re.findall(phone_pattern, text)
        
        return candidate_info
    
    def extract_skills_with_semantic_matching(self, text):
        """Extract skills using phrase matcher and semantic similarity"""
        doc = self.nlp(text)
        
        # Use phrase matcher for exact matches
        matches = self.phrase_matcher(doc)
        found_skills = set()
        
        for match_id, start, end in matches:
            skill = doc[start:end].text
            found_skills.add(skill)
        
        # Use semantic similarity for implicit skills
        text_embedding = self.sentence_model.encode([text])
        skill_embeddings = self.sentence_model.encode(self.all_skills)
        
        # Calculate similarities
        similarities = util.cos_sim(text_embedding, skill_embeddings)[0]
        
        # Add skills with high semantic similarity (threshold: 0.3)
        for i, similarity in enumerate(similarities):
            if similarity > 0.3:
                found_skills.add(self.all_skills[i])
        
        # Categorize skills
        categorized_skills = {}
        for category, skills in self.skill_ontology.items():
            categorized_skills[category] = [skill for skill in found_skills if skill in skills]
        
        return {
            'all_skills': list(found_skills),
            'categorized_skills': categorized_skills,
            'skill_count': len(found_skills)
        }
    
    def extract_experience_with_date_parsing(self, text):
        """Extract work experience using advanced date parsing"""
        experience_data = {
            'total_years': 0,
            'positions': [],
            'companies': []
        }
        
        # Find date ranges in text
        date_patterns = [
            r'(\w{3,9}\s+\d{4})\s*[-–]\s*(\w{3,9}\s+\d{4}|Present|Current)',
            r'(\d{1,2}/\d{4})\s*[-–]\s*(\d{1,2}/\d{4}|Present|Current)',
            r'(\d{4})\s*[-–]\s*(\d{4}|Present|Current)'
        ]
        
        total_months = 0
        
        for pattern in date_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            
            for match in matches:
                start_date_str = match.group(1)
                end_date_str = match.group(2)
                
                try:
                    # Parse start date
                    start_date = self.parse_date_string(start_date_str)
                    
                    # Parse end date
                    if end_date_str.lower() in ['present', 'current']:
                        end_date = datetime.now()
                    else:
                        end_date = self.parse_date_string(end_date_str)
                    
                    # Calculate duration
                    if start_date and end_date:
                        duration = relativedelta(end_date, start_date)
                        months = duration.years * 12 + duration.months
                        total_months += months
                        
                        experience_data['positions'].append({
                            'start_date': start_date.strftime('%Y-%m'),
                            'end_date': end_date.strftime('%Y-%m'),
                            'duration_months': months
                        })
                
                except Exception as e:
                    logger.debug(f"Date parsing error: {e}")
                    continue
        
        experience_data['total_years'] = round(total_months / 12, 1)
        return experience_data
    
    def parse_date_string(self, date_str):
        """Parse various date string formats"""
        date_formats = [
            '%B %Y', '%b %Y', '%m/%Y', '%Y', '%m-%Y'
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        return None
    
    def create_advanced_features(self, df):
        """Create advanced feature engineering including embeddings"""
        logger.info("🔧 Creating advanced features...")
        
        # Text statistics
        df['text_length'] = df['Resume'].fillna('').str.len()
        df['word_count'] = df['Resume'].fillna('').str.split().str.len()
        df['sentence_count'] = df['Resume'].fillna('').apply(lambda x: len(sent_tokenize(str(x))))
        df['avg_word_length'] = df['Resume'].fillna('').apply(
            lambda x: np.mean([len(word) for word in str(x).split()]) if str(x).split() else 0
        )
        
        # Advanced text features using BERT embeddings
        logger.info("🧠 Generating BERT embeddings...")
        resume_embeddings = []
        
        for text in df['Resume'].fillna(''):
            try:
                # Tokenize and encode with BERT
                inputs = self.bert_tokenizer(
                    str(text)[:512],  # BERT max length
                    return_tensors='pt',
                    truncation=True,
                    padding=True
                )
                
                with torch.no_grad():
                    outputs = self.bert_model(**inputs)
                    # Use [CLS] token embedding
                    embedding = outputs.last_hidden_state[:, 0, :].numpy().flatten()
                    resume_embeddings.append(embedding)
            
            except Exception as e:
                logger.debug(f"BERT embedding error: {e}")
                resume_embeddings.append(np.zeros(768))  # BERT base dimension
        
        # Add BERT embeddings as features
        bert_features = pd.DataFrame(
            resume_embeddings, 
            columns=[f'bert_dim_{i}' for i in range(768)]
        )
        df = pd.concat([df, bert_features], axis=1)
        
        # Sentence transformer embeddings
        logger.info("🔍 Generating sentence transformer embeddings...")
        sentence_embeddings = self.sentence_model.encode(
            df['Resume'].fillna('').tolist(),
            show_progress_bar=True
        )
        
        # Add sentence embeddings
        sent_features = pd.DataFrame(
            sentence_embeddings,
            columns=[f'sent_dim_{i}' for i in range(sentence_embeddings.shape[1])]
        )
        df = pd.concat([df, sent_features], axis=1)
        
        # Skills-based features
        skill_features = []
        for text in df['Resume'].fillna(''):
            skills_data = self.extract_skills_with_semantic_matching(str(text))
            
            feature_vector = {
                'total_skills': skills_data['skill_count'],
                'prog_lang_count': len(skills_data['categorized_skills'].get('programming_languages', [])),
                'web_tech_count': len(skills_data['categorized_skills'].get('web_technologies', [])),
                'database_count': len(skills_data['categorized_skills'].get('databases', [])),
                'cloud_count': len(skills_data['categorized_skills'].get('cloud_platforms', [])),
                'devops_count': len(skills_data['categorized_skills'].get('devops_tools', [])),
                'data_science_count': len(skills_data['categorized_skills'].get('data_science', [])),
                'soft_skills_count': len(skills_data['categorized_skills'].get('soft_skills', []))
            }
            skill_features.append(feature_vector)
        
        skill_df = pd.DataFrame(skill_features)
        df = pd.concat([df, skill_df], axis=1)
        
        logger.info(f"✅ Created {df.shape[1]} advanced features")
        return df
    
    def build_faiss_similarity_index(self, embeddings):
        """Build FAISS index for efficient similarity search"""
        logger.info("🔍 Building FAISS similarity index...")
        
        # Normalize embeddings for cosine similarity
        embeddings = embeddings.astype('float32')
        faiss.normalize_L2(embeddings)
        
        # Create FAISS index
        dimension = embeddings.shape[1]
        self.faiss_index = faiss.IndexFlatIP(dimension)  # Inner product for cosine similarity
        self.faiss_index.add(embeddings)
        
        logger.info(f"✅ FAISS index built with {embeddings.shape[0]} vectors")
        return self.faiss_index
    
    def train_deep_ensemble_classifier(self, X_train, X_test, y_train, y_test, model_name):
        """Train deep ensemble classifier with neural networks"""
        logger.info(f"🧠 Training deep ensemble for {model_name}...")
        
        # Neural network classifiers
        mlp_clf = MLPClassifier(
            hidden_layer_sizes=(512, 256, 128),
            activation='relu',
            solver='adam',
            alpha=0.001,
            batch_size=32,
            learning_rate='adaptive',
            max_iter=500,
            early_stopping=True,
            validation_fraction=0.1,
            random_state=42
        )
        
        # Traditional ensemble
        rf_clf = RandomForestClassifier(
            n_estimators=300,
            max_depth=25,
            min_samples_split=3,
            random_state=42,
            n_jobs=-1
        )
        
        gb_clf = GradientBoostingClassifier(
            n_estimators=200,
            max_depth=12,
            learning_rate=0.1,
            random_state=42
        )
        
        # SVM with RBF kernel
        svm_clf = SVC(
            kernel='rbf',
            C=10,
            gamma='scale',
            probability=True,
            random_state=42
        )
        
        # Voting ensemble
        ensemble = VotingClassifier(
            estimators=[
                ('mlp', mlp_clf),
                ('rf', rf_clf),
                ('gb', gb_clf),
                ('svm', svm_clf)
            ],
            voting='soft'
        )
        
        # Train ensemble
        ensemble.fit(X_train, y_train)
        
        # Predictions
        y_pred = ensemble.predict(X_test)
        y_train_pred = ensemble.predict(X_train)
        
        # Calculate metrics
        train_acc = accuracy_score(y_train, y_train_pred)
        test_acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')
        precision = precision_score(y_test, y_pred, average='weighted')
        recall = recall_score(y_test, y_pred, average='weighted')
        
        # Store metrics
        self.performance_metrics[model_name] = {
            'train_accuracy': train_acc,
            'test_accuracy': test_acc,
            'f1_score': f1,
            'precision': precision,
            'recall': recall,
            'model_type': 'Deep Ensemble (MLP + RF + GB + SVM)'
        }
        
        logger.info(f"✅ {model_name} - Test Acc: {test_acc:.4f}, F1: {f1:.4f}")
        return ensemble
    
    def fetch_jobs_from_adzuna(self, search_query, location="US", max_results=50):
        """Fetch job listings from Adzuna API"""
        logger.info(f"🔍 Fetching jobs for: {search_query}")
        
        url = f"https://api.adzuna.com/v1/api/jobs/us/search/1"
        
        params = {
            'app_id': self.adzuna_app_id,
            'app_key': self.adzuna_api_key,
            'what': search_query,
            'where': location,
            'results_per_page': min(max_results, 50),
            'sort_by': 'relevance'
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            jobs = data.get('results', [])
            
            processed_jobs = []
            for job in jobs:
                processed_job = {
                    'title': job.get('title', ''),
                    'company': job.get('company', {}).get('display_name', ''),
                    'description': job.get('description', ''),
                    'location': job.get('location', {}).get('display_name', ''),
                    'salary_min': job.get('salary_min'),
                    'salary_max': job.get('salary_max'),
                    'url': job.get('redirect_url', ''),
                    'created': job.get('created', '')
                }
                processed_jobs.append(processed_job)
            
            logger.info(f"✅ Retrieved {len(processed_jobs)} jobs")
            return processed_jobs
            
        except Exception as e:
            logger.error(f"❌ Error fetching jobs: {e}")
            return []
    
    def analyze_skills_gap(self, user_skills, job_description):
        """Analyze skills gap using semantic similarity"""
        # Extract skills from job description
        job_skills = self.extract_skills_with_semantic_matching(job_description)
        
        # Calculate semantic similarity between user profile and job
        user_text = " ".join(user_skills)
        similarity_score = util.cos_sim(
            self.sentence_model.encode([user_text]),
            self.sentence_model.encode([job_description])
        )[0][0].item()
        
        # Find missing skills
        user_skills_set = set([skill.lower() for skill in user_skills])
        job_skills_set = set([skill.lower() for skill in job_skills['all_skills']])
        missing_skills = job_skills_set - user_skills_set
        
        return {
            'similarity_score': similarity_score,
            'missing_skills': list(missing_skills),
            'matching_skills': list(user_skills_set & job_skills_set),
            'job_skills': job_skills['all_skills'],
            'recommendations': self.generate_skill_recommendations(missing_skills)
        }
    
    def generate_skill_recommendations(self, missing_skills):
        """Generate learning recommendations for missing skills"""
        recommendations = []
        
        skill_resources = {
            'python': 'Consider Python courses on Coursera or edX',
            'react': 'Build projects with React.js and deploy them',
            'aws': 'Get AWS Cloud Practitioner certification',
            'docker': 'Practice containerization with Docker tutorials',
            'machine learning': 'Take Andrew Ng\'s ML course on Coursera'
        }
        
        for skill in missing_skills:
            skill_lower = skill.lower()
            if skill_lower in skill_resources:
                recommendations.append({
                    'skill': skill,
                    'recommendation': skill_resources[skill_lower]
                })
            else:
                recommendations.append({
                    'skill': skill,
                    'recommendation': f'Learn {skill} through online courses and hands-on projects'
                })
        
        return recommendations[:5]  # Top 5 recommendations
    
    def load_and_preprocess_data(self):
        """Load and preprocess dataset with all advanced techniques"""
        logger.info("📂 Loading and preprocessing data with advanced techniques...")
        
        # Setup NLP components
        self.setup_advanced_nlp_components()
        
        # Load dataset
        df = pd.read_csv(self.data_path)
        logger.info(f"📊 Loaded {len(df)} samples")
        
        # Clean data
        df['Resume'] = df['Resume'].fillna('')
        df['Category'] = df['Category'].fillna('Unknown')
        
        # Remove very short resumes
        df = df[df['Resume'].str.len() >= 100]
        
        # Create advanced features
        df = self.create_advanced_features(df)
        
        logger.info(f"✅ Preprocessed data: {len(df)} samples with advanced features")
        return df
    
    def train_all_ultra_advanced_models(self):
        """Train all models using ultra-advanced techniques"""
        logger.info("🚀 Starting Ultra-Advanced ML Training Pipeline...")
        
        # Load and preprocess data
        df = self.load_and_preprocess_data()
        
        # Prepare features for traditional ML models
        text_features = ['Resume']
        numeric_features = [col for col in df.columns if col.startswith(('bert_dim_', 'sent_dim_', 'total_skills', 'prog_lang', 'web_tech', 'database', 'cloud', 'devops', 'data_science', 'soft_skills', 'text_length', 'word_count'))]
        
        # Build FAISS index for similarity search
        sentence_embeddings = df[[col for col in df.columns if col.startswith('sent_dim_')]].values
        self.build_faiss_similarity_index(sentence_embeddings)
        
        # Train job category classifier
        self.train_job_category_classifier_advanced(df, numeric_features)
        
        # Train experience predictor
        self.train_experience_predictor_advanced(df, numeric_features)
        
        # Train skill domain classifier
        self.train_skill_domain_classifier_advanced(df, numeric_features)
        
        # Train match score predictor
        self.train_match_score_predictor_advanced(df, numeric_features)
        
        # Save all models and components
        self.save_all_components()
        
        # Generate comprehensive report
        self.save_performance_report()
        
        logger.info("🎉 Ultra-Advanced ML Training Complete!")
        self.print_performance_summary()
    
    def train_job_category_classifier_advanced(self, df, numeric_features):
        """Train advanced job category classifier"""
        logger.info("🎯 Training Ultra-Advanced Job Category Classifier...")
        
        X = df[numeric_features]
        y = df['Category']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train deep ensemble
        model = self.train_deep_ensemble_classifier(
            X_train_scaled, X_test_scaled, y_train, y_test, 
            'job_category_classifier'
        )
        
        # Save model and scaler
        joblib.dump(model, self.models_dir / 'job_category_classifier_ultra.pkl')
        joblib.dump(scaler, self.models_dir / 'job_category_scaler_ultra.pkl')
        
        return model, scaler
    
    def train_experience_predictor_advanced(self, df, numeric_features):
        """Train advanced experience predictor"""
        logger.info("📈 Training Ultra-Advanced Experience Predictor...")
        
        # Create experience levels from resume text analysis
        df['experience_level'] = df['Resume'].apply(self.classify_experience_level)
        
        X = df[numeric_features]
        y = df['experience_level']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train deep ensemble
        model = self.train_deep_ensemble_classifier(
            X_train_scaled, X_test_scaled, y_train, y_test, 
            'experience_predictor'
        )
        
        # Save model and scaler
        joblib.dump(model, self.models_dir / 'experience_predictor_ultra.pkl')
        joblib.dump(scaler, self.models_dir / 'experience_scaler_ultra.pkl')
        
        return model, scaler
    
    def classify_experience_level(self, resume_text):
        """Classify experience level using NLP analysis"""
        text = str(resume_text).lower()
        
        # Extract years of experience
        experience_data = self.extract_experience_with_date_parsing(text)
        years = experience_data['total_years']
        
        # Keywords for different levels
        senior_keywords = ['senior', 'lead', 'manager', 'director', 'architect', 'principal', 'head of']
        mid_keywords = ['specialist', 'developer', 'engineer', 'analyst']
        junior_keywords = ['junior', 'associate', 'assistant', 'trainee', 'intern']
        
        # Determine level based on years and keywords
        if years >= 8 or any(keyword in text for keyword in senior_keywords):
            return 'Senior'
        elif years >= 4 or any(keyword in text for keyword in mid_keywords):
            return 'Mid'
        elif years >= 1 or any(keyword in text for keyword in junior_keywords):
            return 'Junior'
        else:
            return 'Entry'
    
    def train_skill_domain_classifier_advanced(self, df, numeric_features):
        """Train advanced skill domain classifier"""
        logger.info("🎯 Training Ultra-Advanced Skill Domain Classifier...")
        
        # Create skill domains using semantic analysis
        df['skill_domain'] = df.apply(
            lambda row: self.classify_skill_domain(row['Resume'], row['Category']), 
            axis=1
        )
        
        X = df[numeric_features]
        y = df['skill_domain']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train deep ensemble
        model = self.train_deep_ensemble_classifier(
            X_train_scaled, X_test_scaled, y_train, y_test, 
            'skill_domain_classifier'
        )
        
        # Save model and scaler
        joblib.dump(model, self.models_dir / 'skill_domain_classifier_ultra.pkl')
        joblib.dump(scaler, self.models_dir / 'skill_domain_scaler_ultra.pkl')
        
        return model, scaler
    
    def classify_skill_domain(self, resume_text, category):
        """Classify skill domain using semantic analysis"""
        skills_data = self.extract_skills_with_semantic_matching(str(resume_text))
        categorized_skills = skills_data['categorized_skills']
        
        # Count skills in each domain
        domain_scores = {
            'Technology': (
                len(categorized_skills.get('programming_languages', [])) +
                len(categorized_skills.get('web_technologies', [])) +
                len(categorized_skills.get('devops_tools', []))
            ),
            'Data Science': len(categorized_skills.get('data_science', [])),
            'Cloud Computing': len(categorized_skills.get('cloud_platforms', [])),
            'Database Management': len(categorized_skills.get('databases', [])),
            'Business': len(categorized_skills.get('soft_skills', []))
        }
        
        # Use category as additional signal
        category_lower = str(category).lower()
        if 'data' in category_lower:
            domain_scores['Data Science'] += 3
        elif 'web' in category_lower or 'software' in category_lower:
            domain_scores['Technology'] += 3
        elif 'cloud' in category_lower:
            domain_scores['Cloud Computing'] += 3
        
        # Return domain with highest score
        return max(domain_scores, key=domain_scores.get)
    
    def train_match_score_predictor_advanced(self, df, numeric_features):
        """Train advanced match score predictor"""
        logger.info("📊 Training Ultra-Advanced Match Score Predictor...")
        
        # Generate sophisticated match scores
        df['match_score'] = df.apply(self.calculate_advanced_match_score, axis=1)
        
        X = df[numeric_features]
        y = df['match_score']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Advanced regression ensemble
        mlp_reg = MLPRegressor(
            hidden_layer_sizes=(256, 128, 64),
            activation='relu',
            solver='adam',
            alpha=0.001,
            max_iter=500,
            random_state=42
        )
        
        rf_reg = RandomForestRegressor(
            n_estimators=300,
            max_depth=20,
            random_state=42,
            n_jobs=-1
        )
        
        gb_reg = GradientBoostingRegressor(
            n_estimators=200,
            max_depth=10,
            learning_rate=0.1,
            random_state=42
        )
        
        ensemble_reg = VotingRegressor([
            ('mlp', mlp_reg),
            ('rf', rf_reg),
            ('gb', gb_reg)
        ])
        
        # Train ensemble
        ensemble_reg.fit(X_train_scaled, y_train)
        
        # Predictions
        y_pred = ensemble_reg.predict(X_test_scaled)
        y_train_pred = ensemble_reg.predict(X_train_scaled)
        
        # Calculate metrics
        train_r2 = r2_score(y_train, y_train_pred)
        test_r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        
        self.performance_metrics['match_score_predictor'] = {
            'train_r2': train_r2,
            'test_r2': test_r2,
            'mae': mae,
            'model_type': 'Deep Regression Ensemble (MLP + RF + GB)'
        }
        
        # Save model and scaler
        joblib.dump(ensemble_reg, self.models_dir / 'match_score_predictor_ultra.pkl')
        joblib.dump(scaler, self.models_dir / 'match_score_scaler_ultra.pkl')
        
        logger.info(f"✅ Match Score Predictor - Test R²: {test_r2:.4f}, MAE: {mae:.2f}")
        return ensemble_reg, scaler
    
    def calculate_advanced_match_score(self, row):
        """Calculate sophisticated match score using multiple factors"""
        score = 50  # Base score
        
        # Skill-based scoring
        score += min(row.get('total_skills', 0) * 2, 20)
        score += min(row.get('prog_lang_count', 0) * 3, 15)
        score += min(row.get('data_science_count', 0) * 4, 20)
        score += min(row.get('cloud_count', 0) * 3, 15)
        
        # Text quality scoring
        if row.get('word_count', 0) > 300:
            score += 10
        elif row.get('word_count', 0) < 100:
            score -= 15
        
        # Balance score
        return min(max(score, 0), 100)
    
    def save_all_components(self):
        """Save all trained components"""
        logger.info("💾 Saving all trained components...")
        
        # Save sentence transformer model
        self.sentence_model.save(str(self.models_dir / 'sentence_transformer'))
        
        # Save FAISS index
        if self.faiss_index:
            faiss.write_index(self.faiss_index, str(self.models_dir / 'faiss_index.bin'))
        
        # Save skill ontology
        with open(self.models_dir / 'skill_ontology.json', 'w') as f:
            json.dump(self.skill_ontology, f, indent=2)
        
        # Save configuration
        config = {
            'models_dir': str(self.models_dir),
            'sentence_model_name': 'all-MiniLM-L6-v2',
            'bert_model_name': 'bert-base-uncased',
            'created_at': datetime.now().isoformat()
        }
        
        with open(self.models_dir / 'config.json', 'w') as f:
            json.dump(config, f, indent=2)
        
        logger.info("✅ All components saved successfully")
    
    def save_performance_report(self):
        """Save comprehensive performance report"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = self.models_dir / f"ultra_advanced_performance_report_{timestamp}.txt"
        
        with open(report_path, 'w') as f:
            f.write("🚀 ULTRA-ADVANCED ML MODELS PERFORMANCE REPORT\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"Training completed: {datetime.now()}\n")
            f.write("Advanced techniques used:\n")
            f.write("- Sentence Transformers for semantic embeddings\n")
            f.write("- BERT for advanced text understanding\n")
            f.write("- FAISS for efficient similarity search\n")
            f.write("- spaCy NER for entity extraction\n")
            f.write("- Deep ensemble models (MLP + RF + GB + SVM)\n")
            f.write("- Advanced feature engineering\n")
            f.write("- Semantic skill extraction\n\n")
            
            for model_name, metrics in self.performance_metrics.items():
                f.write(f"📊 {model_name.upper()}\n")
                f.write("-" * 40 + "\n")
                for metric, value in metrics.items():
                    if isinstance(value, float):
                        f.write(f"{metric}: {value:.4f}\n")
                    else:
                        f.write(f"{metric}: {value}\n")
                f.write("\n")
        
        logger.info(f"📄 Ultra-advanced performance report saved: {report_path}")
    
    def print_performance_summary(self):
        """Print performance summary"""
        print("\n" + "="*70)
        print("🎯 ULTRA-ADVANCED MODELS PERFORMANCE SUMMARY")
        print("="*70)
        print("Advanced Techniques Applied:")
        print("• Sentence Transformers (all-MiniLM-L6-v2)")
        print("• BERT embeddings for text understanding")
        print("• FAISS similarity search")
        print("• spaCy NER for entity extraction")
        print("• Deep ensemble models")
        print("• Semantic skill extraction")
        print("• Advanced feature engineering")
        print("-" * 70)
        
        for model_name, metrics in self.performance_metrics.items():
            print(f"\n📊 {model_name.upper()}")
            print("-" * 50)
            for metric, value in metrics.items():
                if isinstance(value, float):
                    print(f"  {metric}: {value:.4f}")
                else:
                    print(f"  {metric}: {value}")

def main():
    """Main function to run ultra-advanced training"""
    pipeline = UltraAdvancedResumeMLPipeline()
    pipeline.train_all_ultra_advanced_models()

if __name__ == "__main__":
    main()
