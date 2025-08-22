// Skill Gap Analysis Page JavaScript
// LakshyaAI - User: syashu16 - Updated: 2025-08-05 13:42:11

class SkillGapAnalyzer {
    constructor() {
        this.userSkills = [];
        this.targetRole = '';
        this.experienceLevel = '';
        this.analysisResults = null;
        this.completedSkills = JSON.parse(localStorage.getItem('completedSkills_syashu16') || '[]');
        this.init();
    }

    init() {
        console.log('🚀 Skill Gap Analyzer initialized for user: syashu16 - 2025-08-05 13:42:11');
        this.setupEventListeners();
        this.checkAIStatus();
        this.loadProgress();
    }

    setupEventListeners() {
        // Analysis form submission
        const analysisForm = document.getElementById('role-analysis-form');
        if (analysisForm) {
            analysisForm.addEventListener('submit', (e) => this.handleAnalysis(e));
        }

        // Mark skill as complete
        const markCompleteBtn = document.getElementById('mark-complete-btn');
        if (markCompleteBtn) {
            markCompleteBtn.addEventListener('click', () => this.markSkillComplete());
        }

        // Export buttons
        const exportPdfBtn = document.getElementById('export-pdf');
        const exportCalendarBtn = document.getElementById('export-calendar');
        const shareProgressBtn = document.getElementById('share-progress');

        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.exportAnalysis('pdf'));
        }
        if (exportCalendarBtn) {
            exportCalendarBtn.addEventListener('click', () => this.exportToCalendar());
        }
        if (shareProgressBtn) {
            shareProgressBtn.addEventListener('click', () => this.shareProgress());
        }

        // Enter key for skill completion
        const completedSkillInput = document.getElementById('completed-skill');
        if (completedSkillInput) {
            completedSkillInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.markSkillComplete();
                }
            });
        }
    }

    async handleAnalysis(event) {
        event.preventDefault();

        const targetRole = document.getElementById('target-role').value.trim();
        const experienceLevel = document.getElementById('experience-level').value;
        const currentSkills = document.getElementById('current-skills').value.trim();

        if (!targetRole || !currentSkills) {
            this.showStatus('Please fill in all required fields.', 'error');
            return;
        }

        this.targetRole = targetRole;
        this.experienceLevel = experienceLevel;
        this.userSkills = currentSkills.split(',').map(skill => skill.trim()).filter(skill => skill);

        await this.performAnalysis();
    }

    async performAnalysis() {
        const analyzeBtn = document.getElementById('analyze-btn');
        const analyzeText = document.getElementById('analyze-text');
        const originalText = analyzeText.textContent;

        try {
            // Update UI to show loading
            this.showStatus('Analyzing your skills against job market requirements...', 'info');
            analyzeText.innerHTML = '<div class="loading-spinner"></div> AI Analyzing...';
            analyzeBtn.disabled = true;

            // Make API call (replace with actual endpoint)
            const response = await this.makeAnalysisAPI();

            if (response.success) {
                this.analysisResults = response.data;
                this.displayResults(response.data);
                this.showStatus('Analysis completed successfully!', 'success');
            } else {
                throw new Error(response.error || 'Analysis failed');
            }

        } catch (error) {
            console.error('❌ Analysis error:', error);
            this.showStatus('Analysis failed. Showing demo results.', 'warning');
            this.showDemoResults();
        } finally {
            // Reset button
            analyzeText.textContent = originalText;
            analyzeBtn.disabled = false;
        }
    }

    async makeAnalysisAPI() {
        // TODO: Replace with actual Flask API endpoint
        console.log('🔍 Analyzing skills for role:', this.targetRole, 'Level:', this.experienceLevel);
        console.log('🎯 User skills:', this.userSkills);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: this.generateAnalysisResults()
                });
            }, 3000); // Simulate 3 second analysis time
        });
    }

    generateAnalysisResults() {
        // Demo analysis results based on user input
        const requiredSkills = this.getRequiredSkillsForRole(this.targetRole, this.experienceLevel);
        const matchedSkills = this.userSkills.filter(skill => 
            requiredSkills.some(req => req.name.toLowerCase() === skill.toLowerCase())
        );
        const missingSkills = requiredSkills.filter(req => 
            !this.userSkills.some(skill => skill.toLowerCase() === req.name.toLowerCase())
        );

        const readinessScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
        
        return {
            targetRole: this.targetRole,
            experienceLevel: this.experienceLevel,
            readinessScore,
            skillsMatched: matchedSkills.length,
            skillsTotal: requiredSkills.length,
            skillsMissing: missingSkills.length,
            matchedSkills: matchedSkills.map(skill => ({
                name: skill,
                level: Math.floor(Math.random() * 3) + 3, // 3-5 level
                importance: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
            })),
            missingSkills: missingSkills.map(skill => ({
                ...skill,
                timeToLearn: this.getTimeToLearn(skill.difficulty),
                resources: this.getResourcesForSkill(skill.name)
            })),
            learningPath: this.generateLearningPath(missingSkills),
            aiInsight: this.generateAIInsight(readinessScore, matchedSkills.length, missingSkills.length)
        };
    }

    getRequiredSkillsForRole(role, level) {
        // Demo skill requirements based on role and level
        const skillSets = {
            'full stack developer': {
                junior: [
                    { name: 'HTML', difficulty: 'beginner', priority: 'high' },
                    { name: 'CSS', difficulty: 'beginner', priority: 'high' },
                    { name: 'JavaScript', difficulty: 'intermediate', priority: 'high' },
                    { name: 'React', difficulty: 'intermediate', priority: 'high' },
                    { name: 'Node.js', difficulty: 'intermediate', priority: 'medium' },
                    { name: 'Git', difficulty: 'beginner', priority: 'high' },
                    { name: 'MongoDB', difficulty: 'intermediate', priority: 'medium' },
                    { name: 'Express.js', difficulty: 'intermediate', priority: 'medium' },
                    { name: 'REST APIs', difficulty: 'intermediate', priority: 'high' },
                    { name: 'Responsive Design', difficulty: 'beginner', priority: 'high' }
                ],
                mid: [
                    { name: 'HTML', difficulty: 'beginner', priority: 'high' },
                    { name: 'CSS', difficulty: 'intermediate', priority: 'high' },
                    { name: 'JavaScript', difficulty: 'advanced', priority: 'high' },
                    { name: 'React', difficulty: 'advanced', priority: 'high' },
                    { name: 'Node.js', difficulty: 'advanced', priority: 'high' },
                    { name: 'Git', difficulty: 'intermediate', priority: 'high' },
                    { name: 'MongoDB', difficulty: 'intermediate', priority: 'medium' },
                    { name: 'PostgreSQL', difficulty: 'intermediate', priority: 'medium' },
                    { name: 'Docker', difficulty: 'intermediate', priority: 'medium' },
                    { name: 'AWS', difficulty: 'intermediate', priority: 'medium' },
                    { name: 'TypeScript', difficulty: 'intermediate', priority: 'low' },
                    { name: 'Testing', difficulty: 'intermediate', priority: 'high' }
                ]
            },
            'data scientist': {
                junior: [
                    { name: 'Python', difficulty: 'intermediate', priority: 'high' },
                    { name: 'Pandas', difficulty: 'intermediate', priority: 'high' },
                    { name: 'NumPy', difficulty: 'intermediate', priority: 'high' },
                    { name: 'Matplotlib', difficulty: 'beginner', priority: 'medium' },
                    { name: 'SQL', difficulty: 'intermediate', priority: 'high' },
                    { name: 'Statistics', difficulty: 'intermediate', priority: 'high' },
                    { name: 'Machine Learning', difficulty: 'intermediate', priority: 'high' },
                    { name: 'Jupyter', difficulty: 'beginner', priority: 'medium' }
                ]
            }
        };

        const normalizedRole = role.toLowerCase();
        const roleSkills = skillSets[normalizedRole] || skillSets['full stack developer'];
        return roleSkills[level] || roleSkills['mid'] || roleSkills['junior'];
    }

    getTimeToLearn(difficulty) {
        const timeMap = {
            'beginner': '2-4 weeks',
            'intermediate': '4-8 weeks',
            'advanced': '8-12 weeks'
        };
        return timeMap[difficulty] || '4-6 weeks';
    }

    getResourcesForSkill(skillName) {
        // Demo resources for skills
        const resourceMap = {
            'React': [
                { type: 'course', name: 'React Official Tutorial', url: 'https://react.dev/tutorial', rating: 4.8 },
                { type: 'practice', name: 'React Challenges', url: '#', rating: 4.5 }
            ],
            'Docker': [
                { type: 'course', name: 'Docker Mastery', url: '#', rating: 4.7 },
                { type: 'certification', name: 'Docker Certified Associate', url: '#', rating: 4.6 }
            ],
            'AWS': [
                { type: 'course', name: 'AWS Solutions Architect', url: '#', rating: 4.9 },
                { type: 'practice', name: 'AWS Free Tier', url: '#', rating: 4.8 }
            ]
        };
        
        return resourceMap[skillName] || [
            { type: 'tutorial', name: `${skillName} Tutorial`, url: '#', rating: 4.5 },
            { type: 'practice', name: `${skillName} Practice`, url: '#', rating: 4.3 }
        ];
    }

    generateLearningPath(missingSkills) {
        const highPriority = missingSkills.filter(skill => skill.priority === 'high');
        const mediumPriority = missingSkills.filter(skill => skill.priority === 'medium');
        const lowPriority = missingSkills.filter(skill => skill.priority === 'low');

        return {
            high: highPriority,
            medium: mediumPriority,
            low: lowPriority
        };
    }

    generateAIInsight(readinessScore, matched, missing) {
        const insights = [
            `You have a ${readinessScore >= 80 ? 'strong' : readinessScore >= 60 ? 'good' : 'developing'} foundation with ${matched} key skills already mastered.`,
            `Focus on the ${missing} missing skills to increase your job readiness by ${Math.round(missing * 8)}%.`,
            readinessScore >= 75 ? 
                'You\'re close to being job-ready! Focus on high-priority skills for the best impact.' :
                'Build your foundation with core technologies first, then advance to specialized skills.'
        ];

        return insights.join(' ');
    }

    displayResults(data) {
        // Show results section
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Update progress dashboard
        this.updateProgressDashboard(data);
        
        // Update skills breakdown
        this.updateSkillsBreakdown(data);
        
        // Update learning roadmap
        this.updateLearningRoadmap(data);
        
        // Update learning resources
        this.updateLearningResources(data);

        console.log('✅ Analysis results displayed successfully');
    }

    updateProgressDashboard(data) {
        // Update readiness score
        const readinessScore = document.getElementById('readiness-score');
        const readinessCircle = document.getElementById('readiness-circle');
        const skillsMatched = document.getElementById('skills-matched');
        const skillsMissing = document.getElementById('skills-missing');
        const aiInsight = document.getElementById('ai-insight');
        const overallProgress = document.getElementById('overall-progress');

        if (readinessScore) {
            readinessScore.textContent = `${data.readinessScore}%`;
            readinessScore.classList.add('fade-in');
        }

        if (readinessCircle) {
            const circumference = 2 * Math.PI * 40; // radius = 40
            const offset = circumference - (data.readinessScore / 100) * circumference;
            readinessCircle.style.strokeDashoffset = offset;
        }

        if (skillsMatched) {
            skillsMatched.textContent = `${data.skillsMatched}/${data.skillsTotal}`;
        }

        if (skillsMissing) {
            skillsMissing.textContent = data.skillsMissing;
        }

        if (aiInsight) {
            aiInsight.textContent = data.aiInsight;
        }

        if (overallProgress) {
            overallProgress.textContent = `${data.readinessScore}% Complete`;
        }
    }

    updateSkillsBreakdown(data) {
        const skillsHaveContainer = document.getElementById('skills-have-container');
        const skillsNeedContainer = document.getElementById('skills-need-container');

        if (skillsHaveContainer) {
            skillsHaveContainer.innerHTML = data.matchedSkills.map((skill, index) => `
                <div class="skill-card have slide-in" style="animation-delay: ${index * 0.1}s">
                    <div class="flex justify-between items-center">
                        <h5 class="font-semibold text-green-400">${skill.name}</h5>
                        <span class="text-xs text-slate-400">${skill.importance} Priority</span>
                    </div>
                    <div class="skill-level">
                        <span class="text-xs text-slate-400">Proficiency:</span>
                        <div class="skill-dots">
                            ${Array.from({length: 5}, (_, i) => 
                                `<div class="skill-dot ${i < skill.level ? 'active' : ''}"></div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        if (skillsNeedContainer) {
            skillsNeedContainer.innerHTML = data.missingSkills.map((skill, index) => `
                <div class="skill-card need slide-in" style="animation-delay: ${index * 0.1}s">
                    <div class="flex justify-between items-center mb-2">
                        <h5 class="font-semibold text-red-400">${skill.name}</h5>
                        <span class="difficulty-tag ${skill.difficulty}">${skill.difficulty}</span>
                    </div>
                    <p class="text-slate-400 text-sm mb-2">Time to learn: ${skill.timeToLearn}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-slate-500">${skill.priority} Priority</span>
                        <button class="text-orange-400 hover:text-orange-300 text-sm" onclick="window.skillAnalyzer.startLearning('${skill.name}')">
                            <i class="fas fa-play mr-1"></i>Start Learning
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    updateLearningRoadmap(data) {
        const highPriorityContainer = document.getElementById('high-priority-skills');
        const mediumPriorityContainer = document.getElementById('medium-priority-skills');
        const lowPriorityContainer = document.getElementById('low-priority-skills');

        const createLearningItem = (skill) => `
            <div class="learning-item" onclick="window.skillAnalyzer.showSkillDetails('${skill.name}')">
                <h5>${skill.name}</h5>
                <p>Essential skill for ${this.targetRole} role</p>
                <div class="learning-meta">
                    <span class="difficulty-tag ${skill.difficulty}">${skill.difficulty}</span>
                    <span class="text-slate-400">${skill.timeToLearn}</span>
                </div>
            </div>
        `;

        if (highPriorityContainer) {
            highPriorityContainer.innerHTML = data.learningPath.high.map(createLearningItem).join('');
        }

        if (mediumPriorityContainer) {
            mediumPriorityContainer.innerHTML = data.learningPath.medium.map(createLearningItem).join('');
        }

        if (lowPriorityContainer) {
            lowPriorityContainer.innerHTML = data.learningPath.low.map(createLearningItem).join('');
        }
    }

    updateLearningResources(data) {
        const resourcesContainer = document.getElementById('learning-resources');
        if (!resourcesContainer) return;

        const allResources = [];
        data.missingSkills.forEach(skill => {
            skill.resources.forEach(resource => {
                allResources.push({
                    ...resource,
                    skill: skill.name
                });
            });
        });

        // Take top 6 resources
        const topResources = allResources.slice(0, 6);

        resourcesContainer.innerHTML = topResources.map(resource => `
            <div class="resource-card" onclick="window.open('${resource.url}', '_blank')">
                <div class="resource-icon ${resource.type}">
                    <i class="fas fa-${this.getResourceIcon(resource.type)}"></i>
                </div>
                <h4 class="font-semibold text-white mb-2">${resource.name}</h4>
                <p class="text-slate-400 text-sm mb-3">For ${resource.skill}</p>
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-1">
                        <i class="fas fa-star text-yellow-400"></i>
                        <span class="text-sm text-slate-300">${resource.rating}</span>
                    </div>
                    <span class="text-xs text-slate-500 uppercase">${resource.type}</span>
                </div>
            </div>
        `).join('');
    }

    getResourceIcon(type) {
        const iconMap = {
            'course': 'graduation-cap',
            'tutorial': 'book',
            'practice': 'code',
            'certification': 'certificate'
        };
        return iconMap[type] || 'link';
    }

    markSkillComplete() {
        const skillInput = document.getElementById('completed-skill');
        const skillName = skillInput.value.trim();

        if (!skillName) {
            this.showStatus('Please enter a skill name.', 'error');
            return;
        }

        if (this.completedSkills.includes(skillName)) {
            this.showStatus('Skill already marked as completed.', 'warning');
            return;
        }

        this.completedSkills.push(skillName);
        localStorage.setItem('completedSkills_syashu16', JSON.stringify(this.completedSkills));
        
        skillInput.value = '';
        this.updateProgressHistory();
        this.showStatus(`Great! ${skillName} marked as completed! 🎉`, 'success');

        console.log(`🎯 Skill completed: ${skillName}`);
    }

    updateProgressHistory() {
        const progressHistory = document.getElementById('progress-history');
        if (!progressHistory) return;

        if (this.completedSkills.length === 0) {
            progressHistory.innerHTML = `
                <h4 class="font-semibold text-indigo-400 mb-3">Recent Progress</h4>
                <div class="text-slate-400 text-sm">No progress tracked yet. Start learning and mark skills as completed!</div>
            `;
            return;
        }

        const recentSkills = this.completedSkills.slice(-5).reverse();
        progressHistory.innerHTML = `
            <h4 class="font-semibold text-indigo-400 mb-3">Recent Progress</h4>
            ${recentSkills.map(skill => `
                <div class="progress-item">
                    <div>
                        <div class="skill-name">${skill}</div>
                        <div class="completion-date">Completed recently</div>
                    </div>
                    <i class="fas fa-check-circle text-green-400"></i>
                </div>
            `).join('')}
        `;
    }

    loadProgress() {
        this.updateProgressHistory();
    }

    startLearning(skillName) {
        console.log(`🚀 Starting to learn: ${skillName}`);
        this.showStatus(`Starting learning path for ${skillName}! Check the resources section.`, 'info');
        // TODO: Implement learning path navigation
    }

    showSkillDetails(skillName) {
        console.log(`📋 Showing details for: ${skillName}`);
        // TODO: Implement skill details modal/page
        this.showStatus(`Skill details for ${skillName} - Feature coming soon!`, 'info');
    }

    exportAnalysis(format) {
        if (!this.analysisResults) {
            this.showStatus('No analysis to export. Please run an analysis first.', 'warning');
            return;
        }

        if (format === 'pdf') {
            // TODO: Implement PDF export
            this.showStatus('PDF export feature coming soon!', 'info');
            console.log('📄 Exporting analysis as PDF');
        }
    }

    exportToCalendar() {
        if (!this.analysisResults) {
            this.showStatus('No learning plan to export. Please run an analysis first.', 'warning');
            return;
        }

        this.showStatus('Calendar export feature coming soon!', 'info');
        console.log('📅 Exporting learning plan to calendar');
    }

    shareProgress() {
        if (!this.analysisResults) {
            this.showStatus('No progress to share. Please run an analysis first.', 'warning');
            return;
        }

        // Create shareable text
        const shareText = `🎯 My LakshyaAI Skill Analysis Results:
• Target Role: ${this.analysisResults.targetRole}
• Job Readiness: ${this.analysisResults.readinessScore}%
• Skills Matched: ${this.analysisResults.skillsMatched}/${this.analysisResults.skillsTotal}
• Skills to Learn: ${this.analysisResults.skillsMissing}

Powered by LakshyaAI Career Platform 🚀`;

        if (navigator.share) {
            navigator.share({
                title: 'My Skill Gap Analysis Results',
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText);
            this.showStatus('Results copied to clipboard!', 'success');
        }

        console.log('📤 Sharing progress results');
    }

    showDemoResults() {
        // Fallback demo results
        const demoData = this.generateAnalysisResults();
        this.analysisResults = demoData;
        this.displayResults(demoData);
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('analysis-status');
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.className = `text-center text-sm status-${type}`;

        console.log(`📢 Status: ${message} (${type})`);
    }

    async checkAIStatus() {
        try {
            const response = await fetch('/api/ai-status');
            const data = await response.json();

            const statusElement = document.getElementById('ai-status');
            if (statusElement) {
                if (data.status === 'online') {
                    statusElement.textContent = 'AI Analyzing';
                    statusElement.className = 'text-orange-400 text-sm font-semibold';
                } else {
                    statusElement.textContent = 'AI Offline';
                    statusElement.className = 'text-yellow-400 text-sm font-semibold';
                }
            }
        } catch (error) {
            console.log('⚠️ Could not check AI status');
        }
    }
}

// Initialize Skill Gap Analyzer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 LakshyaAI Skill Gap Analysis loaded - User: syashu16 - 2025-08-05 13:42:11');
    window.skillAnalyzer = new SkillGapAnalyzer();
});