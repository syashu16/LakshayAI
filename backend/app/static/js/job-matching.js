// Job Matching Page JavaScript
// LakshyaAI - User: syashu16 - Updated: 2025-08-05 12:09:40

class JobMatcher {
    constructor() {
        this.currentJobs = [];
        this.savedJobs = JSON.parse(localStorage.getItem('savedJobs_syashu16') || '[]');
        this.currentFilters = {};
        this.currentPage = 1;
        this.jobsPerPage = 12;
        this.isLoading = false;
        this.viewMode = 'grid'; // 'grid' or 'list'
        this.init();
    }

    init() {
        console.log('🚀 Job Matcher initialized for user: syashu16 - 2025-08-05 12:09:40');
        this.setupEventListeners();
        this.updateSavedCounter();
        this.loadResumeData(); // Auto-load resume data and search jobs
        this.checkAIStatus();
    }

    setupEventListeners() {
        // Search form
        const searchForm = document.getElementById('job-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => this.handleSearch(e));
        }

        // Quick filters
        const quickFilters = document.querySelectorAll('.quick-filter');
        quickFilters.forEach(filter => {
            filter.addEventListener('click', (e) => this.handleQuickFilter(e));
        });

        // Sort options
        const sortSelect = document.getElementById('sort-options');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.handleSort(e));
        }

        // View toggle
        const gridView = document.getElementById('grid-view');
        const listView = document.getElementById('list-view');
        
        if (gridView) {
            gridView.addEventListener('click', () => this.toggleView('grid'));
        }
        if (listView) {
            listView.addEventListener('click', () => this.toggleView('list'));
        }

        // Load more button
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreJobs());
        }

        // Filter changes
        const filters = ['experience-filter', 'job-type-filter', 'salary-filter', 'work-mode-filter'];
        filters.forEach(filterId => {
            const filterElement = document.getElementById(filterId);
            if (filterElement) {
                filterElement.addEventListener('change', () => this.applyFilters());
            }
        });
    }

    async handleSearch(event) {
        event.preventDefault();
        
        const jobQuery = document.getElementById('what').value.trim();
        const locationQuery = document.getElementById('where').value.trim();
        
        this.currentFilters = {
            query: jobQuery,
            location: locationQuery,
            experience: document.getElementById('experience-filter').value,
            jobType: document.getElementById('job-type-filter').value,
            salary: document.getElementById('salary-filter').value,
            workMode: document.getElementById('work-mode-filter').value
        };

        this.currentPage = 1;
        await this.searchJobs();
    }

    handleQuickFilter(event) {
        const filter = event.target;
        const filterValue = filter.dataset.filter;
        
        // Toggle active state
        filter.classList.toggle('active');
        
        // Update query input
        const queryInput = document.getElementById('what');
        if (filter.classList.contains('active')) {
            if (!queryInput.value.includes(filterValue)) {
                queryInput.value += (queryInput.value ? ' ' : '') + filterValue;
            }
        } else {
            queryInput.value = queryInput.value.replace(filterValue, '').trim();
        }
        
        // Trigger search
        this.handleSearch(new Event('submit'));
    }

    async searchJobs() {
        this.showLoading(true);
        
        try {
            console.log('🔍 Searching jobs with Adzuna API...', this.currentFilters);
            
            // Parse salary filter for Adzuna API
            let salaryMin = null, salaryMax = null;
            if (this.currentFilters.salary && this.currentFilters.salary !== 'any') {
                const salaryRange = this.currentFilters.salary.split('-');
                if (salaryRange.length === 2) {
                    salaryMin = parseInt(salaryRange[0]) * 1000;
                    salaryMax = parseInt(salaryRange[1]) * 1000;
                } else if (this.currentFilters.salary.includes('+')) {
                    salaryMin = parseInt(this.currentFilters.salary.replace('+', '')) * 1000;
                }
            }
            
            // Map work mode to contract type
            let contractType = null;
            if (this.currentFilters.workMode === 'full-time') contractType = 'full_time';
            else if (this.currentFilters.workMode === 'part-time') contractType = 'part_time';
            else if (this.currentFilters.workMode === 'contract') contractType = 'contract';
            
            const searchData = {
                what: this.currentFilters.query || '',
                where: this.currentFilters.location || '',
                page: this.currentPage,
                results_per_page: this.jobsPerPage,
                sort_by: document.getElementById('sort-options')?.value || 'relevance',
                salary_min: salaryMin,
                salary_max: salaryMax,
                contract_type: contractType
            };
            
            const response = await fetch('/api/job-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(searchData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentJobs = data.jobs;
                this.displayJobs(this.currentJobs);
                this.updateResultsStats(data.count, data.jobs.length);
                this.updateAIRecommendations({
                    skillsToFocus: "Jobs found using real-time data from Adzuna API. Consider skills that appear frequently in job descriptions.",
                    salaryInsight: `Found ${data.count} positions. Powered by Adzuna job search engine.`
                });
                
                console.log(`✅ Loaded ${data.jobs.length} jobs from Adzuna`);
                this.showNotification(`Found ${data.count} jobs!`, 'success');
                
            } else {
                console.error('❌ Job search failed:', data.error);
                this.showDemoJobs(); // Fallback to demo data
                this.showNotification('Using demo data - Adzuna API unavailable', 'warning');
            }
            
        } catch (error) {
            console.error('❌ Job search error:', error);
            this.showDemoJobs(); // Fallback to demo data
            this.showNotification('Connection error - showing demo jobs', 'warning');
        }
        
        this.showLoading(false);
    }

    async makeJobSearchAPI(filters, page) {
        // TODO: Replace with actual Flask API endpoint
        console.log('🔍 Searching jobs with filters:', filters, 'Page:', page);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        jobs: this.generateDemoJobs(filters),
                        total: 247,
                        showing: 12,
                        recommendations: {
                            skillsToFocus: "Based on your search, Cloud Computing and DevOps skills are in high demand. Consider learning AWS or Docker.",
                            salaryInsight: "Average salary for your search criteria: ₹6-12 LPA. Remote positions offer 15% higher pay."
                        }
                    }
                });
            }, 1500);
        });
    }

    generateDemoJobs(filters) {
        const companies = [
            { name: 'TechCorp', logo: 'TC' },
            { name: 'InnovateLabs', logo: 'IL' },
            { name: 'DataSystems', logo: 'DS' },
            { name: 'CloudWorks', logo: 'CW' },
            { name: 'StartupXYZ', logo: 'SX' },
            { name: 'MegaTech', logo: 'MT' },
            { name: 'FutureInc', logo: 'FI' },
            { name: 'DevStudio', logo: 'DS' }
        ];

        const jobTitles = [
            'Full Stack Developer',
            'Python Developer',
            'React Developer',
            'Data Scientist',
            'Software Engineer',
            'Backend Developer',
            'Frontend Developer',
            'DevOps Engineer',
            'ML Engineer',
            'UI/UX Designer'
        ];

        const locations = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Remote', 'Chennai', 'Kolkata'];
        const workModes = ['Remote', 'Hybrid', 'On-site'];
        const experiences = ['0-2 years', '2-5 years', '3-6 years', '5+ years'];
        const salaries = ['₹4-8 LPA', '₹6-12 LPA', '₹8-15 LPA', '₹10-18 LPA', '₹5-10 LPA'];

        const skills = [
            ['Python', 'Django', 'PostgreSQL'],
            ['JavaScript', 'React', 'Node.js'],
            ['Java', 'Spring Boot', 'MySQL'],
            ['Python', 'Machine Learning', 'TensorFlow'],
            ['React', 'TypeScript', 'Redux'],
            ['AWS', 'Docker', 'Kubernetes'],
            ['HTML', 'CSS', 'JavaScript'],
            ['Python', 'Data Science', 'Pandas']
        ];

        return Array.from({ length: 12 }, (_, i) => {
            const company = companies[Math.floor(Math.random() * companies.length)];
            const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            const workMode = workModes[Math.floor(Math.random() * workModes.length)];
            const experience = experiences[Math.floor(Math.random() * experiences.length)];
            const salary = salaries[Math.floor(Math.random() * salaries.length)];
            const jobSkills = skills[Math.floor(Math.random() * skills.length)];
            const matchScore = Math.floor(Math.random() * 30) + 70; // 70-99%
            const postedDays = Math.floor(Math.random() * 7) + 1;
            const isUrgent = Math.random() > 0.8;

            return {
                id: `job_${Date.now()}_${i}`,
                title,
                company: company.name,
                companyLogo: company.logo,
                location,
                workMode,
                experience,
                salary,
                skills: jobSkills,
                matchScore,
                postedDays,
                isUrgent,
                description: `Join our team as a ${title} and work on exciting projects using ${jobSkills.join(', ')}. We offer competitive compensation and great work-life balance.`,
                requirements: [
                    `${experience} of experience`,
                    `Strong skills in ${jobSkills[0]}`,
                    'Good communication skills',
                    'Team player'
                ]
            };
        });
    }

    displayJobs(jobs) {
        const resultsContainer = document.getElementById('jobs-container');
        if (!resultsContainer) {
            console.error('❌ jobs-container element not found!');
            return;
        }

        resultsContainer.innerHTML = '';
        resultsContainer.className = this.viewMode === 'grid' ? 'job-grid' : 'job-list';

        if (jobs.length === 0) {
            this.showNoResults();
            return;
        }

        console.log(`✅ Displaying ${jobs.length} jobs in container`);
        
        jobs.forEach((job, index) => {
            const jobCard = this.createJobCard(job, index);
            resultsContainer.appendChild(jobCard);
        });

        // Show load more button if needed
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn && jobs.length === this.jobsPerPage) {
            loadMoreBtn.classList.remove('hidden');
        }
    }

    createJobCard(job, index) {
        const isSaved = this.savedJobs.includes(job.id);
        const matchScore = job.match_score || job.recommendation_score || 75;
        const matchClass = matchScore >= 85 ? 'excellent' : matchScore >= 70 ? 'good' : 'fair';
        
        const card = document.createElement('div');
        card.className = `job-card fade-in`;
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Extract skills from description (basic approach)
        const skillsFromDescription = this.extractSkills(job.description);
        const displaySkills = skillsFromDescription.slice(0, 5);
        
        // Calculate days ago from created date
        const daysAgo = job.created ? this.calculateDaysAgo(job.created) : 1;
        
        card.innerHTML = `
            <div class="relative">
                <!-- Match Score -->
                <div class="match-score ${matchClass}">
                    ${matchScore}% Match
                </div>
                
                <!-- Save Button -->
                <button class="save-btn ${isSaved ? 'saved' : ''}" data-job-id="${job.id}" title="${isSaved ? 'Remove from saved' : 'Save job'}">
                    <i class="fas fa-heart"></i>
                </button>
                
                <!-- Company Info -->
                <div class="flex items-start gap-4 mb-4">
                    <div class="company-logo">
                        ${this.generateCompanyLogo(job.company)}
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-white mb-1">${job.title}</h3>
                        <p class="text-slate-300 font-medium mb-1">${job.company}</p>
                        <div class="flex items-center gap-2 text-sm text-slate-400">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${job.location}</span>
                            <span class="mx-2">•</span>
                            <span>${daysAgo} day${daysAgo > 1 ? 's' : ''} ago</span>
                        </div>
                    </div>
                </div>
                
                <!-- Job Tags -->
                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="job-tag salary">${job.salary}</span>
                    <span class="job-tag experience">${job.contract_type || 'Full-time'}</span>
                    <span class="job-tag category">${job.category || 'Technology'}</span>
                    ${job.ai_match_reason ? '<span class="job-tag ai-recommended">🤖 AI Recommended</span>' : ''}
                </div>
                
                <!-- Skills Match -->
                ${displaySkills.length > 0 ? `
                <div class="mb-4">
                    <p class="text-sm text-slate-400 mb-2">Key Skills:</p>
                    <div class="skills-match">
                        ${displaySkills.map(skill => `
                            <span class="skill-match matched">${skill}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- AI Match Reason (if available) -->
                ${job.ai_match_reason ? `
                <div class="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p class="text-sm text-purple-300">
                        <i class="fas fa-robot mr-2"></i>
                        ${job.ai_match_reason}
                    </p>
                </div>
                ` : ''}
                
                <!-- Description -->
                <p class="text-slate-300 text-sm mb-4 line-clamp-3">${job.description}</p>
                
                <!-- Actions -->
                <div class="flex items-center justify-between">
                    <button class="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1" onclick="window.open('${job.redirect_url || job.adzuna_url}', '_blank')">
                        <i class="fas fa-external-link-alt"></i>
                        View on Adzuna
                    </button>
                    <button class="apply-btn" data-job-id="${job.id}" onclick="window.open('${job.redirect_url}', '_blank')">
                        <i class="fas fa-paper-plane"></i>
                        Apply Now
                    </button>
                </div>
                
                <!-- Powered by Adzuna -->
                <div class="mt-3 pt-3 border-t border-slate-700/50">
                    <p class="text-xs text-slate-500 text-center">
                        Powered by <span class="text-blue-400">Adzuna API</span>
                    </p>
                </div>
            </div>
        `;
        
        // Add event listeners
        const saveBtn = card.querySelector('.save-btn');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => this.toggleSaveJob(e, job.id));
        }
        
        return card;
    }

    generateCompanyLogo(companyName) {
        if (!companyName || companyName === 'Company not specified') {
            return '<div class="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-white font-bold">?</div>';
        }
        
        const initials = companyName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500'];
        const colorIndex = companyName.length % colors.length;
        
        return `<div class="w-12 h-12 ${colors[colorIndex]} rounded-lg flex items-center justify-center text-white font-bold">${initials}</div>`;
    }

    extractSkills(description) {
        const commonSkills = [
            'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
            'HTML', 'CSS', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'C++', 'C#',
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQL', 'NoSQL',
            'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch'
        ];
        
        if (!description) return [];
        
        const foundSkills = [];
        const descLower = description.toLowerCase();
        
        commonSkills.forEach(skill => {
            if (descLower.includes(skill.toLowerCase()) && !foundSkills.includes(skill)) {
                foundSkills.push(skill);
            }
        });
        
        return foundSkills;
    }

    calculateDaysAgo(dateString) {
        try {
            const jobDate = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - jobDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            return 1; // Default to 1 day ago if parsing fails
        }
    }
        
        // Add event listeners
        const saveBtn = card.querySelector('.save-btn');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => this.toggleSaveJob(e, job.id));
        }
        
        return card;
    }

    toggleSaveJob(event, jobId) {
        event.stopPropagation();
        
        const saveBtn = event.currentTarget;
        const isSaved = this.savedJobs.includes(jobId);
        
        if (isSaved) {
            this.savedJobs = this.savedJobs.filter(id => id !== jobId);
            saveBtn.classList.remove('saved');
            saveBtn.title = 'Save job';
        } else {
            this.savedJobs.push(jobId);
            saveBtn.classList.add('saved');
            saveBtn.title = 'Remove from saved';
        }
        
        localStorage.setItem('savedJobs_syashu16', JSON.stringify(this.savedJobs));
        this.updateSavedCounter();
        
        console.log(`💾 Job ${isSaved ? 'removed from' : 'added to'} saved jobs:`, jobId);
    }

    applyToJob(event, job) {
        event.stopPropagation();
        
        // Simulate job application
        const applyBtn = event.currentTarget;
        const originalText = applyBtn.innerHTML;
        
        applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
        applyBtn.disabled = true;
        
        setTimeout(() => {
            applyBtn.innerHTML = '<i class="fas fa-check"></i> Applied';
            applyBtn.classList.add('bg-green-500');
            
            console.log(`📝 Applied to job: ${job.title} at ${job.company}`);
            
            // Show success message (you can implement a toast notification here)
            this.showStatus(`Successfully applied to ${job.title} at ${job.company}!`, 'success');
        }, 2000);
    }

    updateSavedCounter() {
        const counter = document.getElementById('saved-count');
        if (counter) {
            counter.textContent = `${this.savedJobs.length} Saved`;
        }
    }

    updateResultsStats(total, showing) {
        const statsElement = document.getElementById('results-count');
        if (statsElement) {
            statsElement.textContent = `Showing ${showing} of ${total} jobs`;
        }
    }

    updateAIRecommendations(recommendations) {
        if (!recommendations) return;
        
        const container = document.getElementById('ai-recommendations');
        if (container) {
            container.innerHTML = `
                <div class="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
                    <h4 class="font-semibold text-purple-400 mb-2">🎯 Skills to Focus On</h4>
                    <p class="text-slate-300 text-sm">${recommendations.skillsToFocus}</p>
                </div>
                <div class="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                    <h4 class="font-semibold text-blue-400 mb-2">📈 Salary Insights</h4>
                    <p class="text-slate-300 text-sm">${recommendations.salaryInsight}</p>
                </div>
            `;
        }
    }

    showLoading(show) {
        const loadingElement = document.getElementById('loading-jobs');
        const resultsContainer = document.getElementById('jobs-container');
        
        if (show) {
            if (loadingElement) loadingElement.classList.remove('hidden');
            if (resultsContainer) resultsContainer.innerHTML = '';
        } else {
            if (loadingElement) loadingElement.classList.add('hidden');
        }
        
        this.isLoading = show;
    };

    showNoResults() {
        const resultsContainer = document.getElementById('jobs-container');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3 class="text-xl font-bold text-white mb-2">No Jobs Found</h3>
                <p class="text-slate-400 mb-4">Try adjusting your search criteria or filters</p>
                <button class="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-500/30 transition-all" onclick="document.getElementById('what').value=''; this.closest('form').dispatchEvent(new Event('submit'))">
                    Clear Search
                </button>
            </div>
        `;
    }

    showDemoJobs() {
        // Fallback demo jobs
        this.currentJobs = this.generateDemoJobs({});
        this.displayJobs(this.currentJobs);
        this.updateResultsStats(247, 12);
    }

    toggleView(mode) {
        this.viewMode = mode;
        
        const gridBtn = document.getElementById('grid-view');
        const listBtn = document.getElementById('list-view');
        
        if (mode === 'grid') {
            gridBtn.classList.add('bg-purple-500/20', 'text-purple-400');
            gridBtn.classList.remove('bg-slate-800/50', 'text-slate-400');
            listBtn.classList.remove('bg-purple-500/20', 'text-purple-400');
            listBtn.classList.add('bg-slate-800/50', 'text-slate-400');
        } else {
            listBtn.classList.add('bg-purple-500/20', 'text-purple-400');
            listBtn.classList.remove('bg-slate-800/50', 'text-slate-400');
            gridBtn.classList.remove('bg-purple-500/20', 'text-purple-400');
            gridBtn.classList.add('bg-slate-800/50', 'text-slate-400');
        }
        
        this.displayJobs(this.currentJobs);
    }

    async loadInitialJobs() {
        // Set default search values if fields are empty
        const whatField = document.getElementById('what');
        const whereField = document.getElementById('where');
        
        if (whatField && !whatField.value.trim()) {
            whatField.value = 'Software Engineer';
        }
        if (whereField && !whereField.value.trim()) {
            whereField.value = 'Remote';
        }
        
        console.log('🔍 Loading initial jobs with default search...');
        await this.searchJobs();
    }

    async loadMoreJobs() {
        if (this.isLoading) return;
        
        this.currentPage++;
        // TODO: Implement pagination API call
        console.log(`📄 Loading page ${this.currentPage}`);
    }

    applyFilters() {
        // Get all filter values and trigger search
        setTimeout(() => {
            this.handleSearch(new Event('submit'));
        }, 100);
    }

    handleSort(event) {
        const sortBy = event.target.value;
        console.log(`🔄 Sorting by: ${sortBy}`);
        
        // TODO: Implement sorting logic
        // For now, just re-trigger search
        this.handleSearch(new Event('submit'));
    }

    showStatus(message, type = 'info') {
        // TODO: Implement toast notification system
        console.log(`📢 Status: ${message} (${type})`);
    }

    async checkAIStatus() {
        try {
            const response = await fetch('/api/ai-status');
            const data = await response.json();
            
            const statusElement = document.getElementById('ai-status');
            if (statusElement) {
                if (data.status === 'online') {
                    statusElement.textContent = 'AI Matching';
                    statusElement.className = 'text-purple-400 text-sm font-semibold';
                } else {
                    statusElement.textContent = 'AI Offline';
                    statusElement.className = 'text-yellow-400 text-sm font-semibold';
                }
            }
        } catch (error) {
            console.log('⚠️ Could not check AI status');
        }
    }

    loadResumeData() {
        // Check if resume analysis data is available from localStorage
        console.log('🔍 Checking for resume analysis data...');
        try {
            const resumeData = localStorage.getItem('resumeAnalysisData');
            console.log('📋 Raw localStorage data:', resumeData);
            
            if (resumeData) {
                const analysisData = JSON.parse(resumeData);
                console.log('📋 Found resume analysis data for job matching:', analysisData);
                console.log('📋 Category:', analysisData.category);
                console.log('📋 Skills:', analysisData.skills);
                
                // Auto-populate search with resume skills and category
                this.populateSearchWithResumeData(analysisData);
                
                // Automatically search for relevant jobs
                this.searchJobsBasedOnResume(analysisData);
                
                // Show notification
                this.showNotification('📋 Resume data loaded! Searching for matching jobs...', 'info');
            } else {
                console.log('ℹ️ No resume data found in localStorage, loading default jobs');
                // No resume data, load default jobs
                this.loadInitialJobs();
            }
        } catch (error) {
            console.error('⚠️ Could not load resume data:', error);
            this.loadInitialJobs();
        }
    }

    populateSearchWithResumeData(analysisData) {
        // Extract skills for search keywords
        let skillsArray = [];
        if (analysisData.skills && typeof analysisData.skills === 'object') {
            Object.keys(analysisData.skills).forEach(category => {
                if (Array.isArray(analysisData.skills[category])) {
                    skillsArray = skillsArray.concat(analysisData.skills[category]);
                }
            });
        }
        
        // Populate search fields
        const keywordsField = document.getElementById('what');
        const locationField = document.getElementById('where');
        
        if (keywordsField) {
            // Use category and top skills as search keywords
            const category = analysisData.category || 'Software Engineer';
            const topSkills = skillsArray.slice(0, 3).join(', ');
            keywordsField.value = topSkills ? `${category}, ${topSkills}` : category;
        }
        
        if (locationField && !locationField.value) {
            locationField.value = 'Remote'; // Default to remote
        }
        
        // Show resume analysis summary
        this.showResumeAnalysisSummary(analysisData);
    }

    async searchJobsBasedOnResume(analysisData) {
        try {
            // Extract skills for AI job matching
            let skillsArray = [];
            if (analysisData.skills && typeof analysisData.skills === 'object') {
                Object.keys(analysisData.skills).forEach(category => {
                    if (Array.isArray(analysisData.skills[category])) {
                        skillsArray = skillsArray.concat(analysisData.skills[category]);
                    }
                });
            }
            
            // Use AI job matching API
            const response = await fetch('/api/ai-job-match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    skills: skillsArray,
                    location: 'Remote',
                    min_salary: 60000,
                    contract_type: 'full_time'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.jobs) {
                    this.currentJobs = data.jobs;
                    this.displayJobs(data.jobs);
                    this.updateResultsStats(data.count, data.jobs.length);
                    
                    // Show AI-powered indicator
                    this.showAIPoweredBadge(data.user_profile);
                } else {
                    this.showNoResults();
                }
            } else {
                console.log('AI job search failed, using regular search');
                this.performRegularSearch(analysisData);
            }
        } catch (error) {
            console.log('Error in AI job search:', error);
            this.performRegularSearch(analysisData);
        }
    }

    async performRegularSearch(analysisData) {
        // Fallback to regular job search
        const category = analysisData.category || 'Software Engineer';
        
        // Set the actual form field values
        const jobQueryField = document.getElementById('what');
        const locationQueryField = document.getElementById('where');
        
        if (jobQueryField) {
            jobQueryField.value = category;
        }
        if (locationQueryField && !locationQueryField.value) {
            locationQueryField.value = 'Remote';
        }
        
        // Now trigger the search with a proper event
        this.handleSearch({
            preventDefault: () => {}
        });
    }

    showResumeAnalysisSummary(analysisData) {
        // Create summary card showing resume analysis results
        const summaryHTML = `
            <div class="glass-card rounded-2xl p-6 mb-6 border border-green-500/30 bg-green-500/10">
                <h3 class="text-lg font-bold text-green-400 mb-3">
                    <i class="fas fa-file-alt mr-2"></i>Resume-Based Job Search
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-400">${Math.round(analysisData.match_score || 0)}%</div>
                        <div class="text-xs text-slate-400">Resume Score</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-400">${analysisData.total_skills_count || 0}</div>
                        <div class="text-xs text-slate-400">Skills to Match</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-400">${analysisData.category || 'Tech'}</div>
                        <div class="text-xs text-slate-400">Target Category</div>
                    </div>
                </div>
                <p class="text-slate-300 text-sm">
                    <i class="fas fa-robot mr-2"></i>
                    AI is searching for jobs that match your resume profile. Results are personalized based on your skills and experience level.
                </p>
            </div>
        `;
        
        // Insert summary before the job results
        const jobsContainer = document.getElementById('jobs-container') || document.querySelector('.jobs-grid');
        if (jobsContainer) {
            jobsContainer.insertAdjacentHTML('beforebegin', summaryHTML);
        }
    }

    showAIPoweredBadge(userProfile) {
        // Add AI-powered badge to show enhanced matching
        const badge = document.createElement('div');
        badge.className = 'fixed top-20 right-4 z-40 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-3 max-w-sm';
        badge.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-robot text-purple-400"></i>
                <div>
                    <div class="text-sm font-semibold text-white">AI-Enhanced Results</div>
                    <div class="text-xs text-slate-400">Matched using ML models</div>
                </div>
            </div>
        `;
        document.body.appendChild(badge);
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            badge.style.opacity = '0';
            setTimeout(() => badge.remove(), 300);
        }, 8000);
    }

    showNotification(message, type = 'info') {
        // Create or update status message
        let statusDiv = document.getElementById('job-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'job-status';
            statusDiv.className = 'fixed top-4 right-4 z-50 max-w-md';
            document.body.appendChild(statusDiv);
        }
        
        const colorClasses = {
            info: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
            success: 'bg-green-500/20 border-green-500/30 text-green-300',
            error: 'bg-red-500/20 border-red-500/30 text-red-300'
        };
        
        statusDiv.innerHTML = `
            <div class="glass-card rounded-xl p-4 border ${colorClasses[type] || colorClasses.info}">
                <p class="text-sm font-medium">${message}</p>
            </div>
        `;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusDiv.style.opacity = '0';
            setTimeout(() => statusDiv.remove(), 300);
        }, 5000);
    }
}

// Initialize Job Matcher when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 LakshyaAI Job Matching loaded - User: syashu16 - 2025-08-05 12:09:40');
    new JobMatcher();
});