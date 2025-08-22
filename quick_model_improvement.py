#!/usr/bin/env python3
"""
🚀 Ultra-Advanced Resume ML Training Pipeline
============================================

This script implements an ultra-advanced ML pipeline for resume/job recommendation using all the advanced techniques and libraries:
- Deep learning embeddings (SBERT)
- FAISS for efficient similarity search
- Advanced ensemble methods
- Detailed logging and performance tracking

Author: LakshyaAI Team
Date: August 2025
"""

import os
import pandas as pd
import numpy as np
import joblib
import logging
from pathlib import Path
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# NLP & Text Extraction
import docx2txt
from pdfminer.high_level import extract_text as extract_pdf_text
import spacy
from spacy.matcher import PhraseMatcher
import re

# ML & Deep Learning
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier, ExtraTreesClassifier, AdaBoostClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, f1_score, classification_report
from sentence_transformers import SentenceTransformer
import torch
import faiss

# Date & Experience
from dateutil.relativedelta import relativedelta
from datetime import datetime as dt

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class UltraAdvancedResumeML:
    def __init__(self, data_path="resume_dataset.csv"):
        self.data_path = data_path
        self.models_dir = Path("trained_models_ultra")
        self.models_dir.mkdir(exist_ok=True)
        self.nlp = spacy.load("en_core_web_sm")
        self.sbert = SentenceTransformer('all-MiniLM-L6-v2')
        self.performance = {}
        logger.info("Ultra-Advanced Resume ML Trainer Initialized")

    def extract_text(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            return extract_pdf_text(file_path)
        elif ext == '.docx':
            return docx2txt.process(file_path)
        else:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()

    def preprocess_text(self, text):
        text = re.sub(r'[^\w\s\+\#\-\.]', ' ', text.lower())
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def advanced_section_extraction(self, text):
        # Use regex and spaCy NER to extract sections
        doc = self.nlp(text)
        sections = {}
        # Extract name
        for ent in doc.ents:
            if ent.label_ == 'PERSON':
                sections['name'] = ent.text
                break
        # Extract emails, phones
        email = re.findall(r"[\w\.-]+@[\w\.-]+", text)
        phone = re.findall(r"\+?\d[\d\s\-]{8,}\d", text)
        sections['email'] = email[0] if email else ''
        sections['phone'] = phone[0] if phone else ''
        # Section headers
        headers = re.findall(r"(?i)(education|experience|skills|projects|certifications|summary|objective)", text)
        for header in set(headers):
            pattern = rf"{header}(.+?)(?=education|experience|skills|projects|certifications|summary|objective|$)"
            match = re.search(pattern, text, re.I|re.S)
            if match:
                sections[header.lower()] = match.group(1).strip()
        return sections

    def extract_skills(self, text, skill_list):
        matcher = PhraseMatcher(self.nlp.vocab, attr="LOWER")
        patterns = [self.nlp.make_doc(skill) for skill in skill_list]
        matcher.add("SKILLS", patterns)
        doc = self.nlp(text)
        matches = matcher(doc)
        found = set([doc[start:end].text for _, start, end in matches])
        return list(found)

    def get_experience_years(self, text):
        # Find date ranges and sum durations
        date_ranges = re.findall(r"(\w+ \d{4})\s*[-–]\s*(\w+ \d{4}|present)", text, re.I)
        total_months = 0
        for start, end in date_ranges:
            try:
                start_dt = dt.strptime(start, "%b %Y")
                end_dt = dt.today() if 'present' in end.lower() else dt.strptime(end, "%b %Y")
                delta = relativedelta(end_dt, start_dt)
                total_months += delta.years * 12 + delta.months
            except:
                continue
        return round(total_months / 12, 2)

    def embed_texts(self, texts):
        return self.sbert.encode(texts, convert_to_tensor=True, show_progress_bar=True)

    def build_faiss_index(self, embeddings):
        emb_np = embeddings.cpu().detach().numpy().astype('float32')
        index = faiss.IndexFlatL2(emb_np.shape[1])
        index.add(emb_np)
        return index

    def train(self):
        logger.info("Loading data...")
        df = pd.read_csv(self.data_path)
        df['cleaned'] = df['Resume'].fillna('').apply(self.preprocess_text)
        logger.info("Embedding resumes with SBERT...")
        df['embedding'] = list(self.embed_texts(df['cleaned'].tolist()))
        logger.info("Building FAISS index...")
        faiss_index = self.build_faiss_index(torch.stack(df['embedding'].tolist()))
        joblib.dump(faiss_index, self.models_dir / 'resume_faiss_index.pkl')
        logger.info("Extracting advanced features...")
        df['experience_years'] = df['Resume'].fillna('').apply(self.get_experience_years)
        # Skill ontology (expand as needed)
        skill_list = ['python', 'java', 'sql', 'aws', 'docker', 'react', 'machine learning', 'data science', 'project management', 'excel', 'c++', 'javascript', 'linux', 'git', 'tensorflow', 'pytorch']
        df['skills_found'] = df['Resume'].fillna('').apply(lambda x: self.extract_skills(x, skill_list))
        df['skills_count'] = df['skills_found'].apply(len)
        # TF-IDF features
        tfidf = TfidfVectorizer(max_features=8000, ngram_range=(1,3), stop_words='english')
        X_tfidf = tfidf.fit_transform(df['cleaned'])
        # Labels
        y_cat = df['Category']
        y_exp = pd.cut(df['experience_years'], bins=[-1,1,4,8,100], labels=['Entry','Junior','Mid','Senior'])
        # Advanced ensemble for job category
        logger.info("Training advanced ensemble for job category...")
        rf = RandomForestClassifier(n_estimators=200, max_depth=20, n_jobs=-1)
        gb = GradientBoostingClassifier(n_estimators=150, max_depth=10)
        et = ExtraTreesClassifier(n_estimators=150, max_depth=10)
        svm = SVC(kernel='linear', probability=True)
        ensemble = VotingClassifier(estimators=[('rf',rf),('gb',gb),('et',et),('svm',svm)], voting='soft')
        ensemble.fit(X_tfidf, y_cat)
        joblib.dump(ensemble, self.models_dir / 'category_classifier_ultra.pkl')
        joblib.dump(tfidf, self.models_dir / 'category_tfidf_ultra.pkl')
        logger.info("Training advanced ensemble for experience level...")
        exp_ensemble = VotingClassifier(estimators=[('rf',rf),('gb',gb),('et',et),('svm',svm)], voting='soft')
        exp_ensemble.fit(X_tfidf, y_exp)
        joblib.dump(exp_ensemble, self.models_dir / 'experience_classifier_ultra.pkl')
        # Save performance
        y_pred = ensemble.predict(X_tfidf)
        acc = accuracy_score(y_cat, y_pred)
        f1 = f1_score(y_cat, y_pred, average='weighted')
        self.performance['job_category'] = {'accuracy': acc, 'f1': f1}
        logger.info(f"Job Category Classifier - Accuracy: {acc:.3f}, F1: {f1:.3f}")
        y_pred_exp = exp_ensemble.predict(X_tfidf)
        acc_exp = accuracy_score(y_exp, y_pred_exp)
        f1_exp = f1_score(y_exp, y_pred_exp, average='weighted')
        self.performance['experience'] = {'accuracy': acc_exp, 'f1': f1_exp}
        logger.info(f"Experience Classifier - Accuracy: {acc_exp:.3f}, F1: {f1_exp:.3f}")
        # Save performance report
        with open(self.models_dir / 'performance_report_ultra.txt', 'w') as f:
            for k,v in self.performance.items():
                f.write(f"{k}: {v}\n")
        logger.info("Ultra-Advanced Training Complete!")

if __name__ == "__main__":
    UltraAdvancedResumeML().train()
