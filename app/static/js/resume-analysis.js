// Resume Analysis Page JavaScript with ML Integration
// LakshyaAI - User: syashu16 - Updated with ML Backend Integration

class ResumeAnalyzer {
    constructor() {
        this.currentFile = null;
        this.analysisResults = null;
        this.mlService = new MLResumeService();
        this.init();
    }

    init() {
        console.log('🚀 Resume Analyzer initialized for user: syashu16');
        this.setupEventListeners();
        this.checkAIStatus();
        this.checkMLServiceStatus();
    }

    setupEventListeners() {
        // File input change
        const fileInput = document.getElementById('resume-file');
        const uploadForm = document.getElementById('resume-upload-form');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Export buttons
        const exportPdfBtn = document.getElementById('export-pdf');
        const exportJsonBtn = document.getElementById('export-json');
        
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.exportResults('pdf'));
        }
        
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => this.exportResults('json'));
        }

        // Text analysis button for direct text input
        const textAnalysisBtn = document.getElementById('analyze-text-btn');
        if (textAnalysisBtn) {
            textAnalysisBtn.addEventListener('click', () => this.handleTextAnalysis());
        }
    }

    async checkMLServiceStatus() {
        try {
            const response = await fetch('/api/resume/ml-status');
            const data = await response.json();
            
            if (data.success) {
                const status = data.status;
                const aiStatusElement = document.getElementById('ai-status');
                
                if (status.is_loaded && status.models_available.length > 0) {
                    if (aiStatusElement) {
                        aiStatusElement.textContent = `ML Models Online (${status.models_available.length})`;
                        aiStatusElement.className = 'text-green-400 text-sm font-semibold';
                    }
                    console.log('✅ ML Service Status:', status);
                } else {
                    if (aiStatusElement) {
                        aiStatusElement.textContent = 'ML Models Loading...';
                        aiStatusElement.className = 'text-yellow-400 text-sm font-semibold';
                    }
                    console.warn('⚠️ ML Models not loaded');
                }
            }
        } catch (error) {
            console.error('❌ Error checking ML status:', error);
            const aiStatusElement = document.getElementById('ai-status');
            if (aiStatusElement) {
                aiStatusElement.textContent = 'ML Service Offline';
                aiStatusElement.className = 'text-red-400 text-sm font-semibold';
            }
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (!this.validateFile(file)) {
            return;
        }

        this.currentFile = file;
        this.displayFileInfo(file);
        
        console.log(`📄 File selected: ${file.name} (${this.formatFileSize(file.size)})`);
    }

    validateFile(file) {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        
        const maxSize = 10 * 1024 * 1024; // 10MB (increased for better support)

        if (!allowedTypes.includes(file.type)) {
            this.showStatus('Please upload a PDF, DOC, DOCX, or TXT file.', 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showStatus('File size must be less than 10MB.', 'error');
            return false;
        }

        return true;
    }

    displayFileInfo(file) {
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = `(${this.formatFileSize(file.size)})`;
        if (fileInfo) fileInfo.classList.remove('hidden');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (!this.currentFile) {
            this.showStatus('Please select a resume file first.', 'error');
            return;
        }

        await this.analyzeResume();
    }

    async handleTextAnalysis() {
        const textContent = document.getElementById('resume-text-input');
        if (!textContent || !textContent.value.trim()) {
            this.showStatus('Please enter resume text to analyze.', 'error');
            return;
        }

        await this.analyzeResumeText(textContent.value.trim());
    }

    async analyzeResume() {
        const analyzeBtn = document.getElementById('analyze-btn');
        const analyzeText = document.getElementById('analyze-text');
        const originalText = analyzeText.textContent;

        try {
            // Update UI to show loading
            this.showStatus('Uploading and analyzing your resume with ML models...', 'info');
            analyzeText.innerHTML = '<i class="fas fa-brain animate-spin mr-2"></i> Analyzing with AI...';
            analyzeBtn.disabled = true;

            // Get additional inputs
            const skills = document.getElementById('skills-input')?.value || '';
            const keywords = document.getElementById('keywords-input')?.value || '';
            const targetRole = document.getElementById('target-role')?.value || '';

            // Create form data
            const formData = new FormData();
            formData.append('file', this.currentFile);
            formData.append('skills', skills);
            formData.append('keywords', keywords);
            formData.append('target_role', targetRole);

            // Make API call to Flask backend
            const response = await fetch('/api/resume/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                this.analysisResults = data.analysis;
                this.displayMLResults(data.analysis);
                this.showStatus('🎉 Analysis completed successfully!', 'success');
                console.log('📊 Analysis Results:', data.analysis);
            } else {
                throw new Error(data.error || 'Analysis failed');
            }

        } catch (error) {
            console.error('❌ Analysis error:', error);
            this.showStatus(`Analysis failed: ${error.message}`, 'error');
            
            // Show demo results as fallback
            this.showDemoResults();
            
        } finally {
            // Reset button
            analyzeText.textContent = originalText;
            analyzeBtn.disabled = false;
        }
    }

    async analyzeResumeText(resumeText) {
        const analyzeBtn = document.getElementById('analyze-text-btn');
        const originalText = analyzeBtn?.textContent || 'Analyze Text';

        try {
            // Update UI to show loading
            this.showStatus('Analyzing resume text with ML models...', 'info');
            if (analyzeBtn) {
                analyzeBtn.innerHTML = '<i class="fas fa-brain animate-spin mr-2"></i> Analyzing...';
                analyzeBtn.disabled = true;
            }

            // Get additional inputs
            const skills = document.getElementById('skills-input')?.value || '';
            const keywords = document.getElementById('keywords-input')?.value || '';

            // Make API call to Flask backend
            const response = await fetch('/api/resume/analyze-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: resumeText,
                    skills: skills,
                    keywords: keywords
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.analysisResults = {
                    ml_analysis: data,
                    basic_analysis: this.generateBasicAnalysis(resumeText),
                    file_info: { filename: 'Text Input', file_size: resumeText.length }
                };
                this.displayMLResults(this.analysisResults);
                this.showStatus('🎉 Text analysis completed successfully!', 'success');
                console.log('📊 Text Analysis Results:', data);
            } else {
                throw new Error(data.error || 'Text analysis failed');
            }

        } catch (error) {
            console.error('❌ Text analysis error:', error);
            this.showStatus(`Text analysis failed: ${error.message}`, 'error');
            
        } finally {
            // Reset button
            if (analyzeBtn) {
                analyzeBtn.textContent = originalText;
                analyzeBtn.disabled = false;
            }
        }
    }

    generateBasicAnalysis(text) {
        const words = text.split(/\s+/).length;
        const chars = text.length;
        const lines = text.split('\n').length;
        
        // Extract emails and phones with regex
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        
        const emails = text.match(emailRegex) || [];
        const phones = text.match(phoneRegex) || [];
        
        // Enhanced keyword detection with comprehensive tech stack
        const techKeywords = [
            // Programming Languages
            'python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'go', 'rust', 'typescript',
            // Web Technologies
            'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'bootstrap',
            // Databases
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'cassandra', 'nosql',
            // Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'ci/cd', 'terraform',
            // Data Science & AI
            'machine learning', 'ai', 'data science', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
            // Other Technologies
            'linux', 'windows', 'agile', 'scrum', 'api', 'rest', 'graphql', 'microservices', 'html', 'css'
        ];
        
        const foundKeywords = [];
        const textLower = text.toLowerCase();
        
        for (const keyword of techKeywords) {
            if (textLower.includes(keyword)) {
                // Capitalize first letter for display
                foundKeywords.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
            }
        }

        // Calculate missing keywords for suggestions
        const missingKeywords = techKeywords.filter(keyword => 
            !textLower.includes(keyword)
        ).map(keyword => keyword.charAt(0).toUpperCase() + keyword.slice(1));

        // Display missing keywords in the keywords container
        const keywordsContainer = document.getElementById('keywords-container');
        if (keywordsContainer && missingKeywords.length > 0) {
            const topMissingKeywords = missingKeywords.slice(0, 12); // Show top 12
            keywordsContainer.innerHTML = `
                <div class="keywords-grid">
                    ${topMissingKeywords.map(keyword => `
                        <span class="keyword-tag missing" title="Consider adding this keyword">
                            ${keyword}
                        </span>
                    `).join('')}
                </div>
                <p class="keywords-note">
                    <i class="fas fa-info-circle"></i>
                    These are relevant technical keywords that could enhance your resume's visibility.
                </p>
            `;
        } else if (keywordsContainer) {
            keywordsContainer.innerHTML = `
                <div class="no-keywords">
                    <i class="fas fa-check-circle text-success"></i>
                    <p>Your resume contains a comprehensive set of technical keywords!</p>
                </div>
            `;
        }

        return {
            word_count: words,
            character_count: chars,
            line_count: lines,
            emails_found: emails,
            phones_found: phones,
            technical_keywords_found: foundKeywords,
            keyword_count: foundKeywords.length,
            missing_keywords: missingKeywords,
            readability_score: Math.min(100, Math.max(0, 100 - (words / lines * 2)))
        };
    }

    displayMLResults(analysisData) {
        console.log('🎯 Displaying ML Results:', analysisData);
        
        // Show results section
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Display ML analysis results
        if (analysisData.ml_analysis && analysisData.ml_analysis.success) {
            const mlData = analysisData.ml_analysis.analysis;
            
            // Overall Score
            const overallScore = mlData.overall_score || 0;
            this.updateScoreDisplay(overallScore);
            
            // AI Feedback
            this.updateAIFeedback(mlData);
            
            // Predictions
            this.updatePredictions(mlData.predictions || {});
            
            // Recommendations
            this.updateRecommendations(mlData.recommendations || []);
            
            // Input Statistics
            this.updateInputStats(mlData.input_stats || {});
        }

        // Display basic analysis
        if (analysisData.basic_analysis) {
            this.updateBasicStats(analysisData.basic_analysis);
        }

        // File information
        if (analysisData.file_info) {
            this.updateFileStats(analysisData.file_info);
        }
    }

    updateScoreDisplay(score) {
        const atsScore = document.getElementById('ats-score');
        const scoreBar = document.getElementById('score-bar');
        
        if (atsScore) {
            atsScore.textContent = Math.round(score);
            
            // Color based on score
            if (score >= 80) {
                atsScore.className = 'text-4xl font-bold text-green-400';
            } else if (score >= 60) {
                atsScore.className = 'text-4xl font-bold text-yellow-400';
            } else {
                atsScore.className = 'text-4xl font-bold text-red-400';
            }
        }
        
        if (scoreBar) {
            scoreBar.style.width = `${score}%`;
        }
    }

    updateAIFeedback(mlData) {
        const aiFeedback = document.getElementById('ai-feedback');
        if (!aiFeedback) return;

        let feedback = 'Your resume has been analyzed using advanced ML models. ';
        
        // Add prediction insights
        const predictions = mlData.predictions || {};
        if (predictions.job_category) {
            feedback += `Our AI predicts this resume is best suited for ${predictions.job_category} positions. `;
        }
        
        if (predictions.experience_level) {
            feedback += `Experience level detected: ${predictions.experience_level}. `;
        }
        
        // Add recommendations summary
        const recommendations = mlData.recommendations || [];
        if (recommendations.length > 0) {
            feedback += `We've identified ${recommendations.length} key areas for improvement. `;
        }
        
        // Add confidence information
        const confidenceScores = mlData.confidence_scores || {};
        const avgConfidence = Object.values(confidenceScores).reduce((a, b) => a + b, 0) / Object.keys(confidenceScores).length;
        if (avgConfidence) {
            feedback += `Analysis confidence: ${(avgConfidence * 100).toFixed(1)}%.`;
        }

        aiFeedback.textContent = feedback;
    }

    updatePredictions(predictions) {
        // Update job category prediction
        const categoryElement = document.getElementById('predicted-category');
        if (categoryElement && predictions.job_category) {
            categoryElement.textContent = predictions.job_category;
        }

        // Update experience level
        const experienceElement = document.getElementById('predicted-experience');
        if (experienceElement && predictions.experience_level) {
            experienceElement.textContent = predictions.experience_level;
        }

        // Update skill domain
        const domainElement = document.getElementById('predicted-domain');
        if (domainElement && predictions.skill_domain) {
            domainElement.textContent = predictions.skill_domain;
        }

        // Update top categories if available
        if (predictions.top_categories) {
            this.updateTopCategories(predictions.top_categories);
        }
    }

    updateTopCategories(topCategories) {
        const container = document.getElementById('top-categories');
        if (!container) return;

        container.innerHTML = '';
        topCategories.slice(0, 3).forEach((category, index) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'flex justify-between items-center p-3 bg-slate-800/30 rounded-lg';
            categoryDiv.innerHTML = `
                <span class="font-medium">${category.category}</span>
                <span class="text-green-400 font-semibold">${(category.probability * 100).toFixed(1)}%</span>
            `;
            container.appendChild(categoryDiv);
        });
    }

    updateRecommendations(recommendations) {
        const container = document.getElementById('suggestions-container');
        if (!container) return;

        container.innerHTML = '';
        
        if (recommendations.length === 0) {
            container.innerHTML = '<p class="text-slate-400 italic">No specific recommendations at this time. Your resume looks good!</p>';
            return;
        }

        recommendations.forEach((recommendation, index) => {
            const recDiv = document.createElement('div');
            recDiv.className = 'flex items-start space-x-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50';
            recDiv.innerHTML = `
                <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1 flex-shrink-0">
                    ${index + 1}
                </div>
                <div class="flex-1">
                    <p class="text-slate-200 leading-relaxed">${recommendation}</p>
                </div>
                <div class="text-green-400 mt-1">
                    <i class="fas fa-lightbulb text-sm"></i>
                </div>
            `;
            container.appendChild(recDiv);
        });
    }

    updateInputStats(inputStats) {
        // Update word count
        const wordCountElement = document.getElementById('word-count');
        if (wordCountElement && inputStats.resume_length) {
            wordCountElement.textContent = `${Math.round(inputStats.resume_length / 5)} words`; // Rough estimate
        }

        // Update skills count
        const skillsCountElement = document.getElementById('skills-count');
        if (skillsCountElement && inputStats.skills_count) {
            skillsCountElement.textContent = `${inputStats.skills_count} skills`;
        }

        // Update keywords count
        const keywordsCountElement = document.getElementById('keywords-count');
        if (keywordsCountElement && inputStats.keywords_count) {
            keywordsCountElement.textContent = `${inputStats.keywords_count} keywords`;
        }
    }

    updateBasicStats(basicAnalysis) {
        // Update technical keywords found (this will show as detected skills)
        const skillsContainer = document.getElementById('skills-container');
        if (skillsContainer && basicAnalysis.technical_keywords_found) {
            if (basicAnalysis.technical_keywords_found.length > 0) {
                skillsContainer.innerHTML = basicAnalysis.technical_keywords_found
                    .map(keyword => `<span class="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm mr-2 mb-2">${keyword}</span>`)
                    .join('');
            } else {
                skillsContainer.innerHTML = '<p class="text-slate-400 text-sm">No technical skills detected in resume</p>';
            }
        }

        // Update contact information for additional insights
        const emailsElement = document.getElementById('emails-found');
        if (emailsElement && basicAnalysis.emails_found) {
            emailsElement.textContent = basicAnalysis.emails_found.length > 0 ? 
                basicAnalysis.emails_found.join(', ') : 'No emails detected';
        }

        const phonesElement = document.getElementById('phones-found');
        if (phonesElement && basicAnalysis.phones_found) {
            phonesElement.textContent = basicAnalysis.phones_found.length > 0 ? 
                basicAnalysis.phones_found.join(', ') : 'No phone numbers detected';
        }

        // Update missing keywords section with suggestions
        this.updateMissingKeywords(basicAnalysis);
    }

    updateMissingKeywords(basicAnalysis) {
        const keywordsContainer = document.getElementById('keywords-container');
        if (!keywordsContainer) return;

        // Common industry keywords that might be missing
        const allImportantKeywords = [
            'Leadership', 'Team Management', 'Project Management', 'Agile', 'Scrum',
            'Cloud Computing', 'AWS', 'Azure', 'Docker', 'Kubernetes', 
            'DevOps', 'CI/CD', 'Git', 'API Development', 'Database',
            'Machine Learning', 'Data Analysis', 'Problem Solving',
            'Communication', 'Collaboration', 'Innovation'
        ];

        const foundKeywords = basicAnalysis.technical_keywords_found || [];
        const foundLower = foundKeywords.map(k => k.toLowerCase());
        
        const missingKeywords = allImportantKeywords.filter(keyword => 
            !foundLower.includes(keyword.toLowerCase())
        ).slice(0, 8); // Show top 8 missing keywords

        if (missingKeywords.length > 0) {
            keywordsContainer.innerHTML = missingKeywords
                .map(keyword => `<span class="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm mr-2 mb-2">${keyword}</span>`)
                .join('');
        } else {
            keywordsContainer.innerHTML = '<p class="text-slate-400 text-sm">Great! Your resume contains most important keywords.</p>';
        }
    }

    updateFileStats(fileInfo) {
        const fileStatsElement = document.getElementById('file-stats');
        if (fileStatsElement) {
            fileStatsElement.innerHTML = `
                <div class="text-sm text-slate-400">
                    <p><strong>File:</strong> ${fileInfo.filename}</p>
                    <p><strong>Size:</strong> ${this.formatFileSize(fileInfo.file_size)}</p>
                    ${fileInfo.upload_time ? `<p><strong>Uploaded:</strong> ${new Date(fileInfo.upload_time).toLocaleString()}</p>` : ''}
                </div>
            `;
        }
    }

    // Legacy methods for backward compatibility
    showDemoResults() {
        // Fallback demo results for development
        const demoData = {
            ml_analysis: {
                success: true,
                analysis: {
                    overall_score: 78,
                    predictions: {
                        job_category: 'Software Engineering',
                        experience_level: 'Mid',
                        skill_domain: 'Technology',
                        top_categories: [
                            { category: 'Software Engineering', probability: 0.85 },
                            { category: 'Full Stack Development', probability: 0.72 },
                            { category: 'Web Development', probability: 0.68 }
                        ]
                    },
                    recommendations: [
                        'Add more quantified achievements to showcase your impact (e.g., "Improved system performance by 40%")',
                        'Include cloud computing skills like AWS or Azure to stay competitive',
                        'Consider adding leadership experience examples and team management skills',
                        'Optimize for ATS by using standard section headings like "Work Experience" and "Education"',
                        'Add more industry-specific keywords to improve searchability'
                    ],
                    confidence_scores: {
                        job_category: 0.85,
                        experience_level: 0.78,
                        skill_domain: 0.92
                    },
                    input_stats: {
                        resume_length: 1450,
                        skills_count: 12,
                        keywords_count: 18
                    }
                }
            },
            basic_analysis: {
                word_count: 290,
                character_count: 1450,
                technical_keywords_found: [
                    'Python', 'JavaScript', 'React', 'Node.js', 'MongoDB', 
                    'Git', 'API', 'Docker', 'AWS', 'Machine Learning'
                ],
                emails_found: ['user@example.com'],
                phones_found: ['(555) 123-4567'],
                keyword_count: 10
            },
            file_info: {
                filename: 'demo-resume.pdf',
                file_size: 245000
            }
        };
        
        this.displayMLResults(demoData);
        this.showStatus('Demo analysis displayed (upload a real resume for ML-powered analysis)', 'warning');
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('upload-status');
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.className = `text-center text-sm status-${type}`;
        
        // Add status styling
        const colors = {
            'info': 'text-blue-400',
            'success': 'text-green-400',
            'error': 'text-red-400',
            'warning': 'text-yellow-400'
        };
        
        statusElement.className = `text-center text-sm ${colors[type] || colors.info}`;
        
        console.log(`📢 Status: ${message} (${type})`);
    }

    async checkAIStatus() {
        try {
            const response = await fetch('/api/resume/health-check');
            const data = await response.json();
            
            const statusElement = document.getElementById('ai-status');
            if (statusElement) {
                if (data.success && data.health.status === 'healthy') {
                    statusElement.textContent = 'AI Online';
                    statusElement.className = 'text-green-400 text-sm font-semibold';
                } else {
                    statusElement.textContent = 'AI Offline';
                    statusElement.className = 'text-yellow-400 text-sm font-semibold';
                }
            }
        } catch (error) {
            console.log('⚠️ Could not check AI status');
            const statusElement = document.getElementById('ai-status');
            if (statusElement) {
                statusElement.textContent = 'AI Status Unknown';
                statusElement.className = 'text-gray-400 text-sm font-semibold';
            }
        }
    }

    exportResults(format) {
        if (!this.analysisResults) {
            this.showStatus('No analysis results to export. Please analyze a resume first.', 'warning');
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `resume-analysis-${timestamp}`;

        if (format === 'json') {
            this.downloadJSON(this.analysisResults, `${filename}.json`);
        } else if (format === 'pdf') {
            this.showStatus('PDF export coming soon!', 'info');
            // TODO: Implement PDF export
        }
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showStatus('Analysis exported as JSON file!', 'success');
    }
}

// ML Resume Service helper class
class MLResumeService {
    constructor() {
        this.baseUrl = '/api/resume';
    }

    async getStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/ml-status`);
            return await response.json();
        } catch (error) {
            console.error('Error getting ML service status:', error);
            return { success: false, error: error.message };
        }
    }

    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health-check`);
            return await response.json();
        } catch (error) {
            console.error('Error performing health check:', error);
            return { success: false, error: error.message };
        }
    }

    async analyzeText(resumeData) {
        try {
            const response = await fetch(`${this.baseUrl}/analyze-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resumeData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error analyzing text:', error);
            return { success: false, error: error.message };
        }
    }

    async predictCategory(resumeData) {
        try {
            const response = await fetch(`${this.baseUrl}/predict-category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resumeData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error predicting category:', error);
            return { success: false, error: error.message };
        }
    }

    async getRecommendations(resumeData) {
        try {
            const response = await fetch(`${this.baseUrl}/get-recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resumeData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize Resume Analyzer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 LakshyaAI Resume Analysis with ML Integration loaded - User: syashu16');
    new ResumeAnalyzer();
});