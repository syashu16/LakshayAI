#!/usr/bin/env python3
"""
Quick test to verify advanced ML setup
"""

import pandas as pd
import numpy as np
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_advanced_setup():
    """Test if all advanced packages are working"""
    
    try:
        # Test sentence-transformers
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("✅ SentenceTransformer working")
        
        # Test spaCy
        import spacy
        nlp = spacy.load("en_core_web_sm")
        logger.info("✅ spaCy working")
        
        # Test FAISS
        import faiss
        logger.info("✅ FAISS working")
        
        # Test sklearn advanced
        from sklearn.ensemble import StackingClassifier
        logger.info("✅ Advanced scikit-learn working")
        
        # Test basic data loading
        try:
            df = pd.read_csv("resume_dataset.csv")
            logger.info(f"✅ Data loaded: {len(df)} samples")
            
            # Simple test training
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.ensemble import RandomForestClassifier
            from sklearn.model_selection import train_test_split
            from sklearn.metrics import accuracy_score
            
            # Basic preprocessing
            df['Resume'] = df['Resume'].fillna('')
            df['Category'] = df['Category'].fillna('Unknown')
            
            # Simple feature extraction
            vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
            X = vectorizer.fit_transform(df['Resume'])
            y = df['Category']
            
            # Split and train
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            clf = RandomForestClassifier(n_estimators=100, random_state=42)
            clf.fit(X_train, y_train)
            
            # Predict and evaluate
            y_pred = clf.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            logger.info(f"✅ Simple model accuracy: {accuracy:.3f}")
            
            print("\n🎯 ADVANCED ML SETUP TEST RESULTS")
            print("=" * 50)
            print("✅ All packages installed correctly")
            print("✅ Models can be loaded")
            print("✅ Data can be processed")
            print(f"✅ Basic model accuracy: {accuracy:.3f}")
            print("\n🚀 Ready for advanced training!")
            
        except FileNotFoundError:
            logger.error("❌ resume_dataset.csv not found")
            
    except Exception as e:
        logger.error(f"❌ Setup test failed: {e}")

if __name__ == "__main__":
    test_advanced_setup()
