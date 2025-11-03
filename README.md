# 🤖 LakshayAI - ML-Powered Resume Analysis & Job Recommendation System

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)](https://flask.palletsprojects.com/)
[![Machine Learning](https://img.shields.io/badge/ML-Scikit--Learn-orange.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A sophisticated AI-powered platform that analyzes resumes using machine learning models and provides intelligent job recommendations through advanced NLP techniques and external API integration.

## 🎯 Overview

LakshayAI is a comprehensive resume analysis and job recommendation system that combines multiple machine learning models with natural language processing to provide:

- **Intelligent Resume Analysis**: Extract and categorize skills, experience, and qualifications
- **Job Category Prediction**: Predict suitable job categories using trained ML models
- **Experience Level Assessment**: Determine career level and experience classification
- **Personalized Job Recommendations**: Find matching opportunities through Adzuna API integration
- **Skills Gap Analysis**: Identify missing skills for targeted career growth

## 🚀 Key Features

### 📊 ML-Powered Analysis
- **Four Trained ML Models**: Random Forest, SVM, Gradient Boosting, and Logistic Regression
- **Multi-format Support**: PDF, DOCX, and TXT file processing
- **Real-time Inference**: Fast analysis with confidence scoring
- **Comprehensive Scoring**: Overall resume quality assessment

### 🎯 Smart Recommendations
- **Job Matching**: Semantic similarity-based job recommendations
- **Skills Classification**: Automated skill extraction and categorization
- **Experience Calculation**: Intelligent work history analysis
- **Career Insights**: Personalized improvement suggestions

### 🔧 Technical Capabilities
- **NLP Processing**: Advanced text extraction and preprocessing
- **Vector Embeddings**: Sentence transformers for semantic analysis
- **API Integration**: Adzuna job search API for live job data
- **RESTful API**: Complete backend with Flask framework

## 🏗️ Architecture

```
LakshayAI/
├── 📓 model.ipynb                    # ML training pipeline
├── 📓 model training.ipynb           # Model development notebook
├── 🤖 improved_ml_training.py        # Advanced ML pipeline
├── 🔧 run.py                         # Main Flask application
├── 🔧 ai_service.py                  # AI service layer
├── 🔧 adzuna_service.py             # Job API integration
├── 📁 app/                          # Frontend application
├── 📁 backend/                      # Backend services
├── 📁 trained_models/               # Saved ML models
├── 📊 resume_dataset.csv            # Training dataset
└── 📋 requirements.txt              # Dependencies
```

## 🧠 Machine Learning Models

### 1. Job Category Classifier
- **Algorithm**: Random Forest
- **Accuracy**: 100% (training), 100% (testing)
- **Purpose**: Predicts optimal job categories

### 2. Experience Level Predictor
- **Algorithm**: Support Vector Machine (SVM)
- **Accuracy**: 98.4% (training), 85.1% (testing)
- **Purpose**: Determines career level (Entry/Junior/Mid/Senior/Expert)

### 3. Match Score Predictor
- **Algorithm**: Gradient Boosting Regressor
- **Performance**: R² = 0.621 (training), R² = 0.567 (testing)
- **Purpose**: Calculates resume-job compatibility score

### 4. Skill Domain Classifier
- **Algorithm**: Logistic Regression
- **Purpose**: Identifies primary technical domain

## 🛠️ Technology Stack

- **Backend**: Python, Flask
- **ML/AI**: scikit-learn, spaCy, sentence-transformers
- **Data Processing**: pandas, numpy
- **Document Processing**: pdfminer, docx2txt
- **Vector Search**: FAISS
- **API Integration**: Adzuna Jobs API
- **Frontend**: HTML, CSS, JavaScript

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/syashu16/LakshayAI.git
cd LakshayAI
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
pip install -r ml_requirements.txt
```

3. **Download spaCy model**
```bash
python -m spacy download en_core_web_sm
```

4. **Set up ML models**
```bash
python setup_ml.py
```

## 🚀 Quick Start

1. **Start the application**
```bash
python run.py
```

2. **Access the web interface**
```
http://localhost:5000
```

3. **API Endpoints**
```
POST /api/resume/upload          # Upload and analyze resume
POST /api/resume/analyze-text    # Analyze resume text
GET  /api/resume/ml-status       # Check ML model status
GET  /api/resume/health-check    # System health check
```

## 📈 Usage Example

```python
# Example API request for resume analysis
import requests

# Upload resume file
files = {'file': open('resume.pdf', 'rb')}
response = requests.post('http://localhost:5000/api/resume/upload', files=files)

# Get analysis results
result = response.json()
print(f"Job Category: {result['analysis']['predictions']['job_category']}")
print(f"Experience Level: {result['analysis']['predictions']['experience_level']}")
print(f"Overall Score: {result['analysis']['overall_score']}")
```

## 📊 Sample Output

```json
{
  "success": true,
  "analysis": {
    "overall_score": 75.5,
    "predictions": {
      "job_category": "Full Stack Development",
      "experience_level": "Mid-Level",
      "skill_domain": "Technology"
    },
    "confidence_scores": {
      "job_category": 0.87,
      "experience_level": 0.73
    },
    "recommendations": [
      "Add cloud computing skills like AWS or Azure",
      "Include more quantified achievements",
      "Consider adding leadership experience."
    ]
  }
}
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
python test_ml_integration.py
python test_advanced_setup.py
```

## 📖 API Documentation

### Resume Analysis Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/resume/upload` | POST | Upload and analyze resume files |
| `/api/resume/analyze-text` | POST | Analyze resume from raw text |
| `/api/resume/predict-category` | POST | Get job category predictions |
| `/api/resume/get-recommendations` | POST | Get improvement recommendations |
| `/api/resume/ml-status` | GET | Check ML model status |
| `/api/resume/health-check` | GET | System health monitoring |

## 🔮 Future Enhancements

- **Advanced Analytics**: Resume comparison and market trend analysis
- **Multi-language Support**: International resume processing
- **ATS Compatibility**: Resume formatting optimization
- **Salary Prediction**: Compensation range estimation
- **Career Path Mapping**: Long-term career planning insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Adzuna API for job data integration
- spaCy for natural language processing
- scikit-learn for machine learning capabilities
- Sentence Transformers for semantic analysis

---

**⭐ Star this repository if you find it helpful!**
