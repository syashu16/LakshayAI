#!/usr/bin/env python3
"""
🚀 Advanced Resume Analysis ML Pipeline with State-of-the-Art Techniques
======================================================================

This script implements cutting-edge ML techniques for resume analysis:
- NLP with spaCy and transformers
- Semantic embeddings with sentence-transformers
- Advanced feature engineering with FAISS
- Multi-modal learning
- Deep learning ensemble methods
- Named Entity Recognition
- Skill extraction and classification
- Experience analysis with dateutil

Technologies Used:
- spaCy for NER and text processing
- sentence-transformers for semantic embeddings
- FAISS for similarity search
- pdfminer for PDF extraction
- docx2txt for DOCX processing
- Advanced ensemble methods

Author: LakshyaAI Team
Date: August 2025
"""

import pandas as pd
import numpy as np
import joblib
import logging
from pathlib import Path
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Advanced ML Libraries
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler
from sklearn.ensemble import (
    RandomForestClassifier, 
    GradientBoostingClassifier, 
    VotingClassifier,
    ExtraTreesClassifier,
    AdaBoostClassifier,
    BaggingClassifier
)
from sklearn.linear_model import LogisticRegression, Ridge, ElasticNet
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score, 
    classification_report, 
    confusion_matrix, 
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score
)
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import TruncatedSVD, PCA

# Advanced NLP and Deep Learning
import spacy
from spacy.matcher import PhraseMatcher
import torch
import faiss
from sentence_transformers import SentenceTransformer

# Document processing
import docx2txt
from pdfminer.high_level import extract_text
from dateutil.relativedelta import relativedelta

# Text processing
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.tag import pos_tag
from nltk.chunk import ne_chunk

# Additional libraries
import json
import os
from collections import Counter
from scipy.sparse import hstack, vstack
from sklearn.feature_selection import SelectKBest, chi2, mutual_info_classif

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AdvancedResumeMLTrainer:
    """State-of-the-art ML trainer with NLP, deep learning, and semantic analysis"""
    
    def __init__(self, data_path="resume_dataset.csv"):
        self.data_path = data_path
        self.models_dir = Path("trained_models_v3_advanced")
        self.models_dir.mkdir(exist_ok=True)
        
        # Initialize advanced components
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
        # Load advanced NLP models
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("✅ spaCy model loaded")
        except OSError:
            logger.warning("⚠️ spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
        
        # Load sentence transformer for semantic embeddings
        try:
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("✅ SentenceTransformer model loaded")
        except Exception as e:
            logger.warning(f"⚠️ SentenceTransformer error: {e}")
            self.sentence_model = None
        
        # Skills ontology for advanced skill extraction
        self.skills_ontology = self._load_skills_ontology()
        
        # Performance tracking
        self.performance_metrics = {}
        
        logger.info("🚀 Advanced ML Trainer initialized with NLP and Deep Learning")
    
    def _load_skills_ontology(self):
        """Load comprehensive skills ontology"""
        return {
            'programming_languages': [
                'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 
                'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'dart'
            ],
            'web_technologies': [
                'react', 'angular', 'vue.js', 'node.js', 'express.js', 'next.js', 'nuxt.js',
                'django', 'flask', 'fastapi', 'spring boot', 'laravel', 'ruby on rails',
                'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'jquery'
            ],
            'databases': [
                'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server',
                'cassandra', 'elasticsearch', 'dynamodb', 'neo4j', 'influxdb'
            ],
            'cloud_devops': [
                'aws', 'azure', 'google cloud', 'gcp', 'docker', 'kubernetes', 'jenkins',
                'terraform', 'ansible', 'chef', 'puppet', 'gitlab ci', 'github actions',
                'circleci', 'travis ci', 'helm', 'istio'
            ],
            'data_science': [
                'machine learning', 'deep learning', 'ai', 'artificial intelligence',
                'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy',
                'matplotlib', 'seaborn', 'plotly', 'jupyter', 'spark', 'hadoop',
                'tableau', 'power bi', 'excel', 'sql', 'nosql', 'big data'
            ],
            'mobile_development': [
                'react native', 'flutter', 'swift', 'kotlin', 'xamarin', 'ionic',
                'android', 'ios', 'cordova', 'phonegap'
            ],
            'design_tools': [
                'figma', 'sketch', 'adobe photoshop', 'adobe illustrator', 'adobe xd',
                'invision', 'zeplin', 'principle', 'framer', 'canva'
            ],
            'project_management': [
                'agile', 'scrum', 'kanban', 'jira', 'trello', 'asana', 'monday.com',
                'project management', 'team leadership', 'stakeholder management'
            ]
        }
    
    def download_required_models(self):
        """Download all required NLP models and data"""
        try:
            # NLTK data
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
            nltk.download('averaged_perceptron_tagger', quiet=True)
            nltk.download('maxent_ne_chunker', quiet=True)
            nltk.download('words', quiet=True)
            
            # spaCy model
            os.system("python -m spacy download en_core_web_sm")
            
            logger.info("✅ All NLP models downloaded")
        except Exception as e:
            logger.warning(f"Model download issue: {e}")
    
    def extract_named_entities(self, text):
        """Extract named entities using spaCy NER"""
        if not self.nlp:
            return {}
        
        doc = self.nlp(text)
        entities = {
            'persons': [ent.text for ent in doc.ents if ent.label_ == "PERSON"],
            'organizations': [ent.text for ent in doc.ents if ent.label_ == "ORG"],
            'locations': [ent.text for ent in doc.ents if ent.label_ in ["GPE", "LOC"]],
            'dates': [ent.text for ent in doc.ents if ent.label_ == "DATE"],
            'money': [ent.text for ent in doc.ents if ent.label_ == "MONEY"]
        }
        return entities
    
    def extract_advanced_skills(self, text):
        """Advanced skill extraction using spaCy PhraseMatcher and ontology"""
        if not self.nlp:
            return []
        
        text_lower = text.lower()
        extracted_skills = []
        
        # Create PhraseMatcher
        matcher = PhraseMatcher(self.nlp.vocab, attr="LOWER")
        
        # Add patterns from skills ontology
        for category, skills in self.skills_ontology.items():
            patterns = [self.nlp(skill) for skill in skills]
            matcher.add(category, patterns)
        
        # Process text
        doc = self.nlp(text)
        matches = matcher(doc)
        
        for match_id, start, end in matches:
            skill = doc[start:end].text
            extracted_skills.append(skill)
        
        # Additional regex-based extraction for structured skills
        skill_patterns = [
            r'Skills?[:\-]\s*([^\\n]+)',
            r'Technical Skills?[:\-]\s*([^\\n]+)',
            r'Programming Languages?[:\-]\s*([^\\n]+)',
            r'Technologies?[:\-]\s*([^\\n]+)'
        ]
        
        for pattern in skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Split by common delimiters
                skills = re.split(r'[,;|•·]', match)
                extracted_skills.extend([skill.strip() for skill in skills if skill.strip()])
        
        return list(set(extracted_skills))
    
    def calculate_experience_years(self, text):
        """Calculate total years of experience using dateutil"""
        total_months = 0
        
        # Pattern for date ranges
        date_patterns = [
            r'(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|present|current)',
            r'(\d{1,2}/\d{4})\s*[-–—]\s*(\d{1,2}/\d{4}|present|current)',
            r'(\d{4})\s*[-–—]\s*(\d{4}|present|current)'
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for start_date, end_date in matches:
                try:
                    # Parse start date
                    if '/' in start_date:
                        start = datetime.strptime(start_date, '%m/%Y')
                    elif len(start_date) == 4:
                        start = datetime.strptime(start_date, '%Y')
                    else:
                        start = datetime.strptime(start_date, '%B %Y')
                    
                    # Parse end date
                    if end_date.lower() in ['present', 'current']:
                        end = datetime.now()
                    elif '/' in end_date:
                        end = datetime.strptime(end_date, '%m/%Y')
                    elif len(end_date) == 4:
                        end = datetime.strptime(end_date, '%Y')
                    else:
                        end = datetime.strptime(end_date, '%B %Y')
                    
                    # Calculate difference
                    diff = relativedelta(end, start)
                    total_months += diff.years * 12 + diff.months
                    
                except ValueError:
                    continue
        
        return round(total_months / 12, 1)
    
    def generate_semantic_embeddings(self, texts):
        """Generate semantic embeddings using sentence-transformers"""
        if not self.sentence_model:
            logger.warning("SentenceTransformer not available, using TF-IDF fallback")
            vectorizer = TfidfVectorizer(max_features=1000)
            return vectorizer.fit_transform(texts).toarray()
        
        embeddings = self.sentence_model.encode(texts, show_progress_bar=True)
        return embeddings
    
    def create_faiss_index(self, embeddings):
        """Create FAISS index for efficient similarity search"""
        try:
            import faiss
            dimension = embeddings.shape[1]
            index = faiss.IndexFlatL2(dimension)
            index.add(embeddings.astype('float32'))
            return index
        except ImportError:
            logger.warning("FAISS not available, skipping similarity indexing")
            return None
    
    def advanced_text_preprocessing(self, text):
        """Ultra-advanced text preprocessing with NLP techniques"""
        if pd.isna(text) or not isinstance(text, str):
            return ""
        
        # Basic cleaning
        text = text.lower()
        text = re.sub(r'[^\w\s\+\#\-\.]', ' ', text)
        
        # Advanced preprocessing with spaCy if available
        if self.nlp:
            doc = self.nlp(text)
            
            # Lemmatization with POS tagging
            tokens = []
            for token in doc:
                if (not token.is_stop and 
                    not token.is_punct and 
                    not token.is_space and 
                    len(token.text) > 2 and
                    token.pos_ in ['NOUN', 'ADJ', 'VERB', 'PROPN']):
                    tokens.append(token.lemma_)
            
            return ' '.join(tokens)
        else:
            # Fallback processing
            try:
                tokens = word_tokenize(text)
                tokens = [self.lemmatizer.lemmatize(token) for token in tokens 
                         if token not in self.stop_words and len(token) > 2]
                return ' '.join(tokens)
            except:
                words = text.split()
                words = [word for word in words if len(word) > 2]
                return ' '.join(words)
    
    def extract_ultra_advanced_features(self, df):
        """Extract cutting-edge features using NLP and semantic analysis"""
        logger.info("🔧 Extracting ultra-advanced features...")
        
        # Basic features
        df['resume_length'] = df['Resume'].fillna('').str.len()
        df['word_count'] = df['Resume'].fillna('').str.split().str.len()
        df['sentence_count'] = df['Resume'].fillna('').str.count(r'\.')
        df['paragraph_count'] = df['Resume'].fillna('').str.count('\n\n')
        df['uppercase_ratio'] = df['Resume'].fillna('').str.count(r'[A-Z]') / (df['resume_length'] + 1)
        df['digit_ratio'] = df['Resume'].fillna('').str.count(r'\d') / (df['resume_length'] + 1)
        
        # Advanced skill extraction
        logger.info("🎯 Extracting advanced skills...")
        df['extracted_skills'] = df['Resume'].apply(self.extract_advanced_skills)
        df['skill_count'] = df['extracted_skills'].apply(len)
        
        # Skills by category
        for category in self.skills_ontology.keys():
            df[f'{category}_count'] = df['extracted_skills'].apply(
                lambda skills: len([s for s in skills if any(
                    skill_ont in s.lower() for skill_ont in self.skills_ontology[category]
                )])
            )
        
        # Named entity features
        logger.info("🏷️ Extracting named entities...")
        if self.nlp:
            entities_data = df['Resume'].apply(self.extract_named_entities)
            df['person_count'] = entities_data.apply(lambda x: len(x.get('persons', [])))
            df['org_count'] = entities_data.apply(lambda x: len(x.get('organizations', [])))
            df['location_count'] = entities_data.apply(lambda x: len(x.get('locations', [])))
            df['date_count'] = entities_data.apply(lambda x: len(x.get('dates', [])))
        
        # Experience calculation
        logger.info("📅 Calculating experience years...")
        df['experience_years'] = df['Resume'].apply(self.calculate_experience_years)
        
        # Text complexity features
        df['avg_word_length'] = df['Resume'].fillna('').apply(
            lambda x: np.mean([len(word) for word in x.split()]) if x.split() else 0
        )
        df['unique_word_ratio'] = df['Resume'].fillna('').apply(
            lambda x: len(set(x.split())) / len(x.split()) if x.split() else 0
        )
        
        # Education level detection
        education_patterns = {
            'phd': r'\b(phd|ph\.d|doctorate|doctoral)\b',
            'masters': r'\b(master|msc|ms|ma|mba)\b',
            'bachelors': r'\b(bachelor|bsc|bs|ba|be|btech|btec)\b',
            'diploma': r'\b(diploma|certificate)\b'
        }
        
        for edu_level, pattern in education_patterns.items():
            df[f'has_{edu_level}'] = df['Resume'].fillna('').str.lower().str.contains(pattern).astype(int)
        
        # Industry-specific keywords
        industry_keywords = {
            'software': ['software', 'programming', 'development', 'coding', 'algorithm'],
            'data_science': ['data science', 'machine learning', 'analytics', 'statistics'],
            'finance': ['finance', 'banking', 'investment', 'trading', 'accounting'],
            'marketing': ['marketing', 'advertising', 'brand', 'campaign', 'social media'],
            'healthcare': ['healthcare', 'medical', 'clinical', 'patient', 'diagnosis']
        }
        
        for industry, keywords in industry_keywords.items():
            df[f'{industry}_keywords'] = df['Resume'].fillna('').apply(
                lambda x: sum(1 for keyword in keywords if keyword in x.lower())
            )
        
        # Semantic embeddings (if sentence transformer available)
        if self.sentence_model:
            logger.info("🧠 Generating semantic embeddings...")
            embeddings = self.generate_semantic_embeddings(df['cleaned_resume'].tolist())
            
            # Add first 50 embedding dimensions as features
            for i in range(min(50, embeddings.shape[1])):
                df[f'embedding_{i}'] = embeddings[:, i]
        
        return df
    
    def load_and_preprocess_data(self):
        """Load and preprocess data with advanced NLP techniques"""
        logger.info("📂 Loading and preprocessing data with advanced NLP...")
        
        # Download required models
        self.download_required_models()
        
        # Load data
        df = pd.read_csv(self.data_path)
        logger.info(f"📊 Loaded {len(df)} samples")
        
        # Handle missing values
        df['Resume'] = df['Resume'].fillna('')
        df['Category'] = df['Category'].fillna('Unknown')
        
        # Advanced text preprocessing
        logger.info("🔧 Applying ultra-advanced text preprocessing...")
        df['cleaned_resume'] = df['Resume'].apply(self.advanced_text_preprocessing)
        
        # Extract ultra-advanced features
        df = self.extract_ultra_advanced_features(df)
        
        # Remove samples with very short resumes
        df = df[df['word_count'] >= 10]
        
        logger.info(f"✅ Preprocessed data: {len(df)} samples remain")
        return df
    
    def train_state_of_art_job_category_classifier(self, df):
        """Train state-of-the-art job category classifier with deep learning ensemble"""
        logger.info("🎯 Training State-of-the-Art Job Category Classifier...")
        
        X_text = df['cleaned_resume']
        y = df['Category']
        
        # Multiple vectorization strategies
        tfidf_word = TfidfVectorizer(
            max_features=15000,
            ngram_range=(1, 3),
            stop_words='english',
            min_df=2,
            max_df=0.9,
            sublinear_tf=True,
            analyzer='word'
        )
        
        tfidf_char = TfidfVectorizer(
            max_features=8000,
            ngram_range=(2, 5),
            analyzer='char',
            min_df=2,
            max_df=0.9
        )
        
        count_vec = CountVectorizer(
            max_features=10000,
            ngram_range=(1, 2),
            stop_words='english',
            min_df=2
        )
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_text, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Feature extraction
        X_train_tfidf_word = tfidf_word.fit_transform(X_train)
        X_test_tfidf_word = tfidf_word.transform(X_test)
        
        X_train_tfidf_char = tfidf_char.fit_transform(X_train)
        X_test_tfidf_char = tfidf_char.transform(X_test)
        
        X_train_count = count_vec.fit_transform(X_train)
        X_test_count = count_vec.transform(X_test)
        
        # Combine features
        X_train_combined = hstack([X_train_tfidf_word, X_train_tfidf_char, X_train_count])
        X_test_combined = hstack([X_test_tfidf_word, X_test_tfidf_char, X_test_count])
        
        # Dimensionality reduction
        svd = TruncatedSVD(n_components=1000, random_state=42)
        X_train_reduced = svd.fit_transform(X_train_combined)
        X_test_reduced = svd.transform(X_test_combined)
        
        # Create ultra-advanced ensemble
        models = [
            ('rf', RandomForestClassifier(
                n_estimators=500, 
                max_depth=30, 
                min_samples_split=2,
                min_samples_leaf=1,
                max_features='sqrt',
                random_state=42,
                n_jobs=-1
            )),
            ('gb', GradientBoostingClassifier(
                n_estimators=300,
                max_depth=15,
                learning_rate=0.05,
                subsample=0.8,
                random_state=42
            )),
            ('et', ExtraTreesClassifier(
                n_estimators=400,
                max_depth=25,
                min_samples_split=2,
                random_state=42,
                n_jobs=-1
            )),
            ('ada', AdaBoostClassifier(
                n_estimators=200,
                learning_rate=0.8,
                random_state=42
            )),
            ('svm', SVC(
                kernel='rbf',
                C=10,
                gamma='scale',
                probability=True,
                random_state=42
            ))
        ]
        
        # Stacking ensemble
        from sklearn.ensemble import StackingClassifier
        meta_learner = LogisticRegression(max_iter=1000, random_state=42)
        
        stacking_clf = StackingClassifier(
            estimators=models,
            final_estimator=meta_learner,
            cv=5,
            stack_method='predict_proba',
            n_jobs=-1
        )
        
        # Train stacking ensemble
        stacking_clf.fit(X_train_reduced, y_train)
        
        # Predictions
        y_pred = stacking_clf.predict(X_test_reduced)
        y_train_pred = stacking_clf.predict(X_train_reduced)
        y_pred_proba = stacking_clf.predict_proba(X_test_reduced)
        
        # Calculate metrics
        train_acc = accuracy_score(y_train, y_train_pred)
        test_acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        # Multi-class AUC
        try:
            auc = roc_auc_score(y_test, y_pred_proba, multi_class='ovr', average='weighted')
        except:
            auc = 0.0
        
        # Store performance
        self.performance_metrics['job_category'] = {
            'train_accuracy': train_acc,
            'test_accuracy': test_acc,
            'f1_score': f1,
            'auc_score': auc,
            'model_type': 'Stacking Ensemble (RF + GB + ET + ADA + SVM)'
        }
        
        # Save models
        joblib.dump(stacking_clf, self.models_dir / 'category_classifier_v3.pkl')
        joblib.dump(tfidf_word, self.models_dir / 'category_tfidf_word_v3.pkl')
        joblib.dump(tfidf_char, self.models_dir / 'category_tfidf_char_v3.pkl')
        joblib.dump(count_vec, self.models_dir / 'category_count_v3.pkl')
        joblib.dump(svd, self.models_dir / 'category_svd_v3.pkl')
        
        logger.info(f"✅ Job Category Classifier - Train: {train_acc:.3f}, Test: {test_acc:.3f}, F1: {f1:.3f}, AUC: {auc:.3f}")
        return stacking_clf, [tfidf_word, tfidf_char, count_vec], svd
    
    def train_advanced_job_category_classifier(self, df):
        """Train advanced job category classifier with ensemble methods"""
        logger.info("🎯 Training Advanced Job Category Classifier...")
        
        X = df['cleaned_resume']
        y = df['Category']
        
        # Create advanced pipeline with multiple feature extractors
        tfidf_features = TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 3),
            stop_words='english',
            min_df=2,
            max_df=0.95,
            sublinear_tf=True
        )
        
        count_features = CountVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words='english',
            min_df=2,
            max_df=0.95
        )
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Feature extraction
        X_train_tfidf = tfidf_features.fit_transform(X_train)
        X_test_tfidf = tfidf_features.transform(X_test)
        
        # Create ensemble of multiple strong classifiers
        rf_clf = RandomForestClassifier(
            n_estimators=200, 
            max_depth=20, 
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        gb_clf = GradientBoostingClassifier(
            n_estimators=150,
            max_depth=10,
            learning_rate=0.1,
            random_state=42
        )
        
        svm_clf = SVC(
            kernel='linear',
            C=1.0,
            probability=True,
            random_state=42
        )
        
        # Voting ensemble
        ensemble_clf = VotingClassifier(
            estimators=[
                ('rf', rf_clf),
                ('gb', gb_clf),
                ('svm', svm_clf)
            ],
            voting='soft'
        )
        
        # Train ensemble
        ensemble_clf.fit(X_train_tfidf, y_train)
        
        # Predictions
        y_pred = ensemble_clf.predict(X_test_tfidf)
        y_train_pred = ensemble_clf.predict(X_train_tfidf)
        
        # Calculate metrics
        train_acc = accuracy_score(y_train, y_train_pred)
        test_acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        # Store performance
        self.performance_metrics['job_category'] = {
            'train_accuracy': train_acc,
            'test_accuracy': test_acc,
            'f1_score': f1,
            'model_type': 'Ensemble (RF + GB + SVM)'
        }
        
        # Save models
        joblib.dump(ensemble_clf, self.models_dir / 'category_classifier_v2.pkl')
        joblib.dump(tfidf_features, self.models_dir / 'category_tfidf_v2.pkl')
        
        logger.info(f"✅ Job Category Classifier - Train: {train_acc:.3f}, Test: {test_acc:.3f}, F1: {f1:.3f}")
        return ensemble_clf, tfidf_features
    
    def train_advanced_experience_predictor(self, df):
        """Train advanced experience level predictor"""
        logger.info("📈 Training Advanced Experience Level Predictor...")
        
        # Create experience levels from resume content
        def extract_experience_level(resume_text):
            text = str(resume_text).lower()
            
            # Look for explicit experience mentions
            if re.search(r'(\d+)\s*(years?|yrs?)', text):
                years_match = re.findall(r'(\d+)\s*(?:years?|yrs?)', text)
                if years_match:
                    max_years = max([int(y) for y in years_match])
                    if max_years >= 8:
                        return 'Senior'
                    elif max_years >= 4:
                        return 'Mid'
                    elif max_years >= 1:
                        return 'Junior'
                    else:
                        return 'Entry'
            
            # Keywords-based classification
            senior_keywords = ['senior', 'lead', 'manager', 'director', 'architect', 'principal']
            mid_keywords = ['experienced', 'specialist', 'developer', 'engineer']
            junior_keywords = ['junior', 'associate', 'assistant', 'trainee']
            
            if any(keyword in text for keyword in senior_keywords):
                return 'Senior'
            elif any(keyword in text for keyword in mid_keywords):
                return 'Mid'
            elif any(keyword in text for keyword in junior_keywords):
                return 'Junior'
            else:
                return 'Entry'
        
        # Apply experience extraction
        df['experience_level'] = df['Resume'].apply(extract_experience_level)
        
        X = df['cleaned_resume']
        y = df['experience_level']
        
        # Advanced feature extraction
        vectorizer = TfidfVectorizer(
            max_features=8000,
            ngram_range=(1, 3),
            stop_words='english',
            min_df=3,
            max_df=0.9
        )
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Feature extraction
        X_train_vec = vectorizer.fit_transform(X_train)
        X_test_vec = vectorizer.transform(X_test)
        
        # Hyperparameter tuning for SVM
        param_grid = {
            'C': [0.1, 1, 10],
            'kernel': ['linear', 'rbf'],
            'gamma': ['scale', 'auto']
        }
        
        svm_clf = SVC(probability=True, random_state=42)
        grid_search = GridSearchCV(
            svm_clf, param_grid, cv=5, scoring='accuracy', n_jobs=-1
        )
        grid_search.fit(X_train_vec, y_train)
        
        best_svm = grid_search.best_estimator_
        
        # Create ensemble with best SVM
        ensemble_exp = VotingClassifier(
            estimators=[
                ('svm', best_svm),
                ('rf', RandomForestClassifier(n_estimators=150, max_depth=15, random_state=42)),
                ('gb', GradientBoostingClassifier(n_estimators=100, max_depth=8, random_state=42))
            ],
            voting='soft'
        )
        
        ensemble_exp.fit(X_train_vec, y_train)
        
        # Predictions
        y_pred = ensemble_exp.predict(X_test_vec)
        y_train_pred = ensemble_exp.predict(X_train_vec)
        
        # Metrics
        train_acc = accuracy_score(y_train, y_train_pred)
        test_acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        self.performance_metrics['experience_level'] = {
            'train_accuracy': train_acc,
            'test_accuracy': test_acc,
            'f1_score': f1,
            'model_type': 'Ensemble (Tuned SVM + RF + GB)'
        }
        
        # Save models
        joblib.dump(ensemble_exp, self.models_dir / 'experience_predictor_v2.pkl')
        joblib.dump(vectorizer, self.models_dir / 'experience_tfidf_v2.pkl')
        
        logger.info(f"✅ Experience Predictor - Train: {train_acc:.3f}, Test: {test_acc:.3f}, F1: {f1:.3f}")
        return ensemble_exp, vectorizer
    
    def train_advanced_skill_domain_classifier(self, df):
        """Train significantly improved skill domain classifier"""
        logger.info("🎯 Training Advanced Skill Domain Classifier...")
        
        # Define comprehensive skill domains with better mapping
        def extract_skill_domain(resume_text, category):
            text = str(resume_text).lower()
            
            # Technology skills
            tech_keywords = [
                'python', 'java', 'javascript', 'programming', 'software', 'development',
                'coding', 'algorithm', 'data structure', 'web', 'mobile', 'app',
                'database', 'sql', 'nosql', 'api', 'framework', 'library'
            ]
            
            # Data science skills
            data_keywords = [
                'data science', 'machine learning', 'ai', 'artificial intelligence',
                'analytics', 'statistics', 'pandas', 'numpy', 'tensorflow', 'pytorch',
                'visualization', 'big data', 'data mining', 'predictive modeling'
            ]
            
            # Business skills
            business_keywords = [
                'management', 'business', 'strategy', 'marketing', 'sales', 'finance',
                'operations', 'project management', 'leadership', 'communication',
                'consulting', 'analysis', 'planning', 'coordination'
            ]
            
            # Design skills
            design_keywords = [
                'design', 'ui', 'ux', 'graphics', 'visual', 'creative', 'adobe',
                'photoshop', 'illustrator', 'figma', 'sketch', 'prototype',
                'wireframe', 'user experience', 'user interface'
            ]
            
            # Calculate scores for each domain
            tech_score = sum(1 for keyword in tech_keywords if keyword in text)
            data_score = sum(1 for keyword in data_keywords if keyword in text)
            business_score = sum(1 for keyword in business_keywords if keyword in text)
            design_score = sum(1 for keyword in design_keywords if keyword in text)
            
            # Use category as additional signal
            category_lower = str(category).lower()
            if 'data' in category_lower or 'analytics' in category_lower:
                data_score += 5
            elif 'web' in category_lower or 'software' in category_lower:
                tech_score += 5
            elif 'business' in category_lower or 'management' in category_lower:
                business_score += 5
            elif 'design' in category_lower:
                design_score += 5
            
            # Determine domain based on highest score
            scores = {
                'Technology': tech_score,
                'Data Science': data_score,
                'Business': business_score,
                'Design': design_score
            }
            
            return max(scores, key=scores.get)
        
        # Apply skill domain extraction
        df['skill_domain'] = df.apply(lambda row: extract_skill_domain(row['Resume'], row['Category']), axis=1)
        
        # Get feature columns (including engineered features)
        feature_cols = [col for col in df.columns if col.startswith('has_')]
        
        X_text = df['cleaned_resume']
        X_features = df[feature_cols]
        y = df['skill_domain']
        
        # Text vectorization
        text_vectorizer = TfidfVectorizer(
            max_features=6000,
            ngram_range=(1, 2),
            stop_words='english',
            min_df=2,
            max_df=0.95
        )
        
        # Split data
        X_train_text, X_test_text, X_train_feat, X_test_feat, y_train, y_test = train_test_split(
            X_text, X_features, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Vectorize text
        X_train_text_vec = text_vectorizer.fit_transform(X_train_text)
        X_test_text_vec = text_vectorizer.transform(X_test_text)
        
        # Combine text and engineered features
        from scipy.sparse import hstack
        X_train_combined = hstack([X_train_text_vec, X_train_feat.values])
        X_test_combined = hstack([X_test_text_vec, X_test_feat.values])
        
        # Advanced ensemble with multiple algorithms
        rf_clf = RandomForestClassifier(
            n_estimators=300,
            max_depth=25,
            min_samples_split=3,
            min_samples_leaf=1,
            random_state=42
        )
        
        gb_clf = GradientBoostingClassifier(
            n_estimators=200,
            max_depth=12,
            learning_rate=0.1,
            random_state=42
        )
        
        et_clf = ExtraTreesClassifier(
            n_estimators=250,
            max_depth=20,
            random_state=42
        )
        
        # Ensemble classifier
        ensemble_skill = VotingClassifier(
            estimators=[
                ('rf', rf_clf),
                ('gb', gb_clf),
                ('et', et_clf)
            ],
            voting='soft'
        )
        
        # Train ensemble
        ensemble_skill.fit(X_train_combined, y_train)
        
        # Predictions
        y_pred = ensemble_skill.predict(X_test_combined)
        y_train_pred = ensemble_skill.predict(X_train_combined)
        
        # Metrics
        train_acc = accuracy_score(y_train, y_train_pred)
        test_acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        self.performance_metrics['skill_domain'] = {
            'train_accuracy': train_acc,
            'test_accuracy': test_acc,
            'f1_score': f1,
            'model_type': 'Advanced Ensemble (RF + GB + ET) with Feature Engineering'
        }
        
        # Save models
        joblib.dump(ensemble_skill, self.models_dir / 'skill_domain_classifier_v2.pkl')
        joblib.dump(text_vectorizer, self.models_dir / 'skill_domain_tfidf_v2.pkl')
        joblib.dump(feature_cols, self.models_dir / 'feature_columns_v2.pkl')
        
        logger.info(f"✅ Skill Domain Classifier - Train: {train_acc:.3f}, Test: {test_acc:.3f}, F1: {f1:.3f}")
        return ensemble_skill, text_vectorizer, feature_cols
    
    def train_advanced_match_score_predictor(self, df):
        """Train advanced match score predictor with regression ensemble"""
        logger.info("📊 Training Advanced Match Score Predictor...")
        
        # Create match scores based on multiple factors
        def calculate_match_score(row):
            score = 50  # Base score
            
            text = str(row['Resume']).lower()
            category = str(row['Category']).lower()
            
            # Technical skills bonus
            tech_skills = ['python', 'java', 'javascript', 'sql', 'aws', 'docker']
            skill_count = sum(1 for skill in tech_skills if skill in text)
            score += min(skill_count * 8, 30)
            
            # Experience indicators
            if 'years' in text or 'experience' in text:
                score += 15
            
            # Education bonus
            if any(edu in text for edu in ['degree', 'university', 'bachelor', 'master']):
                score += 10
            
            # Length bonus (comprehensive resume)
            if row['word_count'] > 200:
                score += 10
            elif row['word_count'] < 50:
                score -= 20
            
            # Category-specific adjustments
            if 'software' in category and any(skill in text for skill in ['programming', 'development', 'coding']):
                score += 15
            
            return min(max(score, 0), 100)  # Clamp between 0-100
        
        df['match_score'] = df.apply(calculate_match_score, axis=1)
        
        # Features
        feature_cols = [col for col in df.columns if col.startswith('has_')] + ['word_count', 'resume_length']
        X = df[feature_cols + ['cleaned_resume']]
        y = df['match_score']
        
        # Text features
        text_vectorizer = TfidfVectorizer(
            max_features=4000,
            ngram_range=(1, 2),
            stop_words='english',
            min_df=2
        )
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Process features
        X_train_text = text_vectorizer.fit_transform(X_train['cleaned_resume'])
        X_test_text = text_vectorizer.transform(X_test['cleaned_resume'])
        
        X_train_feat = X_train[feature_cols]
        X_test_feat = X_test[feature_cols]
        
        # Scale numerical features
        scaler = StandardScaler()
        X_train_feat_scaled = scaler.fit_transform(X_train_feat)
        X_test_feat_scaled = scaler.transform(X_test_feat)
        
        # Combine features
        from scipy.sparse import hstack
        X_train_combined = hstack([X_train_text, X_train_feat_scaled])
        X_test_combined = hstack([X_test_text, X_test_feat_scaled])
        
        # Regression ensemble
        from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
        from sklearn.linear_model import Ridge
        from sklearn.ensemble import VotingRegressor
        
        rf_reg = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
        gb_reg = GradientBoostingRegressor(n_estimators=150, max_depth=10, random_state=42)
        ridge_reg = Ridge(alpha=1.0)
        
        ensemble_reg = VotingRegressor([
            ('rf', rf_reg),
            ('gb', gb_reg),
            ('ridge', ridge_reg)
        ])
        
        # Train
        ensemble_reg.fit(X_train_combined, y_train)
        
        # Predictions
        y_pred = ensemble_reg.predict(X_test_combined)
        y_train_pred = ensemble_reg.predict(X_train_combined)
        
        # Metrics
        from sklearn.metrics import r2_score, mean_absolute_error
        train_r2 = r2_score(y_train, y_train_pred)
        test_r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        
        self.performance_metrics['match_score'] = {
            'train_r2': train_r2,
            'test_r2': test_r2,
            'mae': mae,
            'model_type': 'Regression Ensemble (RF + GB + Ridge)'
        }
        
        # Save models
        joblib.dump(ensemble_reg, self.models_dir / 'match_score_predictor_v2.pkl')
        joblib.dump(text_vectorizer, self.models_dir / 'match_score_tfidf_v2.pkl')
        joblib.dump(scaler, self.models_dir / 'match_score_scaler_v2.pkl')
        
        logger.info(f"✅ Match Score Predictor - Train R²: {train_r2:.3f}, Test R²: {test_r2:.3f}, MAE: {mae:.2f}")
        return ensemble_reg, text_vectorizer, scaler
    
    def save_performance_report(self):
        """Save comprehensive performance report"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = self.models_dir / f"performance_report_v2_{timestamp}.txt"
        
        with open(report_path, 'w') as f:
            f.write("🚀 IMPROVED ML MODELS PERFORMANCE REPORT\n")
            f.write("=" * 50 + "\n\n")
            f.write(f"Training completed: {datetime.now()}\n\n")
            
            for model_name, metrics in self.performance_metrics.items():
                f.write(f"📊 {model_name.upper()}\n")
                f.write("-" * 30 + "\n")
                for metric, value in metrics.items():
                    if isinstance(value, float):
                        f.write(f"{metric}: {value:.4f}\n")
                    else:
                        f.write(f"{metric}: {value}\n")
                f.write("\n")
        
        logger.info(f"📄 Performance report saved: {report_path}")
    
    def train_all_models(self):
        """Train all ultra-advanced ML models with state-of-the-art techniques"""
        logger.info("🚀 Starting Ultra-Advanced ML Training Pipeline...")
        
        # Load and preprocess data
        df = self.load_and_preprocess_data()
        
        # Train state-of-the-art job category classifier
        self.train_state_of_art_job_category_classifier(df)
        
        # Save performance report
        self.save_performance_report()
        
        logger.info("🎉 Ultra-Advanced ML Training Complete!")
        logger.info(f"📁 Models saved in: {self.models_dir}")
        
        # Print summary
        print("\n" + "="*70)
        print("🎯 ULTRA-ADVANCED MODELS PERFORMANCE SUMMARY")
        print("="*70)
        for model_name, metrics in self.performance_metrics.items():
            print(f"\n📊 {model_name.upper()}")
            print("-" * 50)
            for metric, value in metrics.items():
                if isinstance(value, float):
                    print(f"  {metric}: {value:.4f}")
                else:
                    print(f"  {metric}: {value}")

def main():
    """Main training function"""
    trainer = AdvancedResumeMLTrainer()
    trainer.train_all_models()

if __name__ == "__main__":
    main()
