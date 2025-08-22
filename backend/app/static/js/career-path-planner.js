// Career Path Planner Page JavaScript
// LakshyaAI - User: syashu16 - Updated: 2025-08-05 15:47:25

class CareerPathPlanner {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('careerGoals_syashu16') || '[]');
        this.milestones = [];
        this.currentView = 'timeline';
        this.charts = {};
        this.sortableInstance = null;
        this.networkInstance = null;
        this.init();
    }

    init() {
        console.log('🚀 Career Path Planner initialized for user: syashu16 - 2025-08-05 15:47:25');
        this.setupEventListeners();
        this.initializeCharts();
        this.loadMilestones();
        this.loadGoals();
        this.generateActionPlan();
        this.updateProgressCounter();
        this.checkAIStatus();
        
        // Initialize AOS animations
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50
        });

        // Initialize Day.js plugins
        dayjs.extend(dayjs_plugin_relativeTime);
    }

    setupEventListeners() {
        // Roadmap view toggle
        const timelineBtn = document.getElementById('roadmap-view-timeline');
        const networkBtn = document.getElementById('roadmap-view-network');
        
        if (timelineBtn) {
            timelineBtn.addEventListener('click', () => this.switchRoadmapView('timeline'));
        }
        if (networkBtn) {
            networkBtn.addEventListener('click', () => this.switchRoadmapView('network'));
        }

        // Goal management
        const addGoalBtn = document.getElementById('add-goal-btn');
        const saveGoalBtn = document.getElementById('save-goal-btn');
        const cancelGoalBtn = document.getElementById('cancel-goal-btn');

        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => this.showAddGoalForm());
        }
        if (saveGoalBtn) {
            saveGoalBtn.addEventListener('click', () => this.saveNewGoal());
        }
        if (cancelGoalBtn) {
            cancelGoalBtn.addEventListener('click', () => this.hideAddGoalForm());
        }

        // Action plan generator
        const generatePlanBtn = document.getElementById('generate-plan-btn');
        if (generatePlanBtn) {
            generatePlanBtn.addEventListener('click', () => this.generateActionPlan());
        }

        // Export buttons
        const exportPdfBtn = document.getElementById('export-pdf');
        const exportCalendarBtn = document.getElementById('export-calendar');
        const sharePlanBtn = document.getElementById('share-plan');

        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.exportToPDF());
        }
        if (exportCalendarBtn) {
            exportCalendarBtn.addEventListener('click', () => this.exportToCalendar());
        }
        if (sharePlanBtn) {
            sharePlanBtn.addEventListener('click', () => this.sharePlan());
        }

        // Enter key for goal form
        const goalTitleInput = document.getElementById('new-goal-title');
        if (goalTitleInput) {
            goalTitleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveNewGoal();
                }
            });
        }
    }

    initializeCharts() {
        this.initSkillsProgressChart();
        this.initMonthlyProgressChart();
        this.initPeerComparisonChart();
    }

    initSkillsProgressChart() {
        const ctx = document.getElementById('skills-progress-chart');
        if (!ctx) return;

        this.charts.skillsProgress = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Technical Skills', 'Leadership', 'Communication', 'Problem Solving', 'Industry Knowledge', 'Networking'],
                datasets: [{
                    label: 'Current Level',
                    data: [7.8, 6.2, 8.1, 7.5, 6.8, 5.9],
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }, {
                    label: 'Target Level',
                    data: [9.0, 8.5, 8.5, 8.8, 8.0, 7.5],
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderColor: '#8b5cf6',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            color: '#94a3b8',
                            backdropColor: 'transparent'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.2)'
                        },
                        pointLabels: {
                            color: '#e2e8f0',
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e2e8f0'
                        }
                    }
                }
            }
        });
    }

    initMonthlyProgressChart() {
        const ctx = document.getElementById('monthly-progress-chart');
        if (!ctx) return;

        this.charts.monthlyProgress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Goals Completed',
                    data: [2, 3, 1, 4, 2, 3],
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderColor: '#22c55e',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#22c55e',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e2e8f0'
                        }
                    }
                }
            }
        });
    }

    initPeerComparisonChart() {
        const ctx = document.getElementById('peer-comparison-chart');
        if (!ctx) return;

        this.charts.peerComparison = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['You', 'Industry Average', 'Top Performers'],
                datasets: [{
                    data: [78, 65, 92],
                    backgroundColor: [
                        '#6366f1',
                        '#94a3b8',
                        '#22c55e'
                    ],
                    borderColor: [
                        '#6366f1',
                        '#94a3b8',
                        '#22c55e'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    loadMilestones() {
        // Demo milestones data
        this.milestones = [
            {
                id: 1,
                title: 'Learn React & Node.js',
                description: 'Master modern full-stack development with React frontend and Node.js backend',
                date: '2024-03-15',
                status: 'completed',
                category: 'skill',
                progress: 100
            },
            {
                id: 2,
                title: 'Complete AWS Certification',
                description: 'Get AWS Solutions Architect Associate certification',
                date: '2024-06-20',
                status: 'completed',
                category: 'certification',
                progress: 100
            },
            {
                id: 3,
                title: 'Lead a Team Project',
                description: 'Take leadership role in a major product development project',
                date: '2025-09-10',
                status: 'current',
                category: 'experience',
                progress: 65
            },
            {
                id: 4,
                title: 'System Design Mastery',
                description: 'Master system design principles and patterns for scalable applications',
                date: '2026-01-15',
                status: 'upcoming',
                category: 'skill',
                progress: 25
            },
            {
                id: 5,
                title: 'Senior Developer Promotion',
                description: 'Achieve promotion to Senior Full Stack Developer role',
                date: '2026-04-30',
                status: 'upcoming',
                category: 'career',
                progress: 0
            },
            {
                id: 6,
                title: 'Tech Conference Speaker',
                description: 'Speak at a major technology conference about your expertise',
                date: '2026-08-20',
                status: 'upcoming',
                category: 'recognition',
                progress: 0
            }
        ];

        this.displayTimeline();
    }

    displayTimeline() {
        const container = document.getElementById('timeline-milestones');
        if (!container) return;

        container.innerHTML = this.milestones.map((milestone, index) => {
            const date = dayjs(milestone.date);
            const isOverdue = date.isBefore(dayjs()) && milestone.status !== 'completed';
            
            return `
                <div class="milestone" style="animation-delay: ${index * 0.2}s">
                    <div class="milestone-content ${milestone.status}">
                        <h4 class="font-bold text-white mb-2">${milestone.title}</h4>
                        <p class="text-slate-300 text-sm mb-3">${milestone.description}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-xs px-2 py-1 rounded-full ${this.getCategoryColor(milestone.category)}">
                                ${milestone.category.charAt(0).toUpperCase() + milestone.category.slice(1)}
                            </span>
                            <div class="flex items-center space-x-2">
                                <div class="w-16 bg-slate-700 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000" 
                                         style="width: ${milestone.progress}%"></div>
                                </div>
                                <span class="text-xs text-slate-400">${milestone.progress}%</span>
                            </div>
                        </div>
                        ${isOverdue ? '<div class="mt-2 text-red-400 text-xs"><i class="fas fa-exclamation-triangle mr-1"></i>Overdue</div>' : ''}
                    </div>
                    <div class="milestone-marker ${milestone.status}"></div>
                    <div class="milestone-date ${isOverdue ? 'text-red-400' : ''}">${date.format('MMM YYYY')}</div>
                </div>
            `;
        }).join('');
    }

    getCategoryColor(category) {
        const colors = {
            skill: 'bg-blue-500/20 text-blue-400',
            certification: 'bg-green-500/20 text-green-400',
            experience: 'bg-purple-500/20 text-purple-400',
            career: 'bg-yellow-500/20 text-yellow-400',
            recognition: 'bg-pink-500/20 text-pink-400'
        };
        return colors[category] || 'bg-slate-500/20 text-slate-400';
    }

    switchRoadmapView(view) {
        const timelineBtn = document.getElementById('roadmap-view-timeline');
        const networkBtn = document.getElementById('roadmap-view-network');
        const timelineContainer = document.getElementById('roadmap-timeline');
        const networkContainer = document.getElementById('roadmap-network');

        if (view === 'timeline') {
            timelineBtn.classList.add('bg-indigo-500/20', 'border-indigo-500/30', 'text-indigo-400');
            timelineBtn.classList.remove('bg-slate-800/50', 'border-slate-700', 'text-slate-400');
            networkBtn.classList.remove('bg-indigo-500/20', 'border-indigo-500/30', 'text-indigo-400');
            networkBtn.classList.add('bg-slate-800/50', 'border-slate-700', 'text-slate-400');
            
            timelineContainer.classList.remove('hidden');
            networkContainer.classList.add('hidden');
        } else {
            networkBtn.classList.add('bg-indigo-500/20', 'border-indigo-500/30', 'text-indigo-400');
            networkBtn.classList.remove('bg-slate-800/50', 'border-slate-700', 'text-slate-400');
            timelineBtn.classList.remove('bg-indigo-500/20', 'border-indigo-500/30', 'text-indigo-400');
            timelineBtn.classList.add('bg-slate-800/50', 'border-slate-700', 'text-slate-400');
            
            networkContainer.classList.remove('hidden');
            timelineContainer.classList.add('hidden');
            
            this.initNetworkView();
        }
        
        this.currentView = view;
    }

    initNetworkView() {
        const container = document.getElementById('career-network');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Demo network data
        const nodes = new vis.DataSet([
            { id: 1, label: 'Current\nSoftware Dev', color: '#6366f1', x: -200, y: 0 },
            { id: 2, label: 'React\nExpert', color: '#3b82f6', x: -100, y: -100 },
            { id: 3, label: 'Node.js\nMaster', color: '#3b82f6', x: -100, y: 100 },
            { id: 4, label: 'AWS\nCertified', color: '#22c55e', x: 0, y: -100 },
            { id: 5, label: 'Team\nLeader', color: '#8b5cf6', x: 0, y: 100 },
            { id: 6, label: 'Senior\nDeveloper', color: '#f59e0b', x: 100, y: 0 },
            { id: 7, label: 'System\nArchitect', color: '#ec4899', x: 200, y: -50 },
            { id: 8, label: 'Tech\nLead', color: '#eab308', x: 200, y: 50 }
        ]);

        const edges = new vis.DataSet([
            { from: 1, to: 2, color: '#6366f1' },
            { from: 1, to: 3, color: '#6366f1' },
            { from: 2, to: 4, color: '#3b82f6' },
            { from: 3, to: 5, color: '#3b82f6' },
            { from: 4, to: 6, color: '#22c55e' },
            { from: 5, to: 6, color: '#8b5cf6' },
            { from: 6, to: 7, color: '#f59e0b' },
            { from: 6, to: 8, color: '#f59e0b' }
        ]);

        const data = { nodes: nodes, edges: edges };
        const options = {
            nodes: {
                shape: 'circle',
                size: 25,
                font: {
                    size: 12,
                    color: '#ffffff'
                },
                borderWidth: 2,
                borderColor: '#ffffff'
            },
            edges: {
                width: 2,
                smooth: {
                    type: 'continuous'
                }
            },
            physics: {
                enabled: false
            },
            interaction: {
                zoomView: false,
                dragView: false
            }
        };

        this.networkInstance = new vis.Network(container, data, options);
        
        console.log('🕸️ Network view initialized');
    }

    loadGoals() {
        // Demo goals if none exist
        if (this.goals.length === 0) {
            this.goals = [
                {
                    id: Date.now() + 1,
                    title: 'Complete Docker Certification',
                    description: 'Get Docker Certified Associate certification to improve containerization skills',
                    priority: 'high',
                    deadline: dayjs().add(2, 'month').format('YYYY-MM-DD'),
                    progress: 40,
                    completed: false,
                    createdAt: dayjs().subtract(1, 'week').toISOString()
                },
                {
                    id: Date.now() + 2,
                    title: 'Build Personal Portfolio',
                    description: 'Create a comprehensive portfolio showcasing recent projects and skills',
                    priority: 'medium',
                    deadline: dayjs().add(1, 'month').format('YYYY-MM-DD'),
                    progress: 75,
                    completed: false,
                    createdAt: dayjs().subtract(2, 'week').toISOString()
                },
                {
                    id: Date.now() + 3,
                    title: 'Learn GraphQL',
                    description: 'Master GraphQL for better API development and data fetching',
                    priority: 'low',
                    deadline: dayjs().add(3, 'month').format('YYYY-MM-DD'),
                    progress: 20,
                    completed: false,
                    createdAt: dayjs().subtract(3, 'day').toISOString()
                }
            ];
            this.saveGoals();
        }

        this.displayGoals();
        this.initSortableGoals();
    }

    displayGoals() {
        const container = document.getElementById('active-goals');
        if (!container) return;

        if (this.goals.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-bullseye text-4xl text-slate-600 mb-4"></i>
                    <p class="text-slate-400">No goals set yet. Create your first career goal!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.goals.map(goal => {
            const deadline = dayjs(goal.deadline);
            const isOverdue = deadline.isBefore(dayjs()) && !goal.completed;
            const daysLeft = deadline.diff(dayjs(), 'day');

            return `
                <div class="goal-card ${goal.priority}-priority ${goal.completed ? 'completed' : ''}" data-goal-id="${goal.id}">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <h4 class="goal-title font-semibold text-white mb-1">${goal.title}</h4>
                            <p class="text-slate-400 text-sm">${goal.description}</p>
                        </div>
                        <div class="flex items-center space-x-2 ml-3">
                            <button class="text-slate-400 hover:text-blue-400 transition-all" onclick="window.careerPlanner.editGoal(${goal.id})" title="Edit Goal">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="text-slate-400 hover:text-green-400 transition-all" onclick="window.careerPlanner.toggleGoalComplete(${goal.id})" title="${goal.completed ? 'Mark Incomplete' : 'Mark Complete'}">
                                <i class="fas fa-${goal.completed ? 'undo' : 'check'}"></i>
                            </button>
                            <button class="text-slate-400 hover:text-red-400 transition-all" onclick="window.careerPlanner.deleteGoal(${goal.id})" title="Delete Goal">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between mb-2">
                        <span class="priority-badge ${goal.priority}">${goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}</span>
                        <span class="text-xs text-slate-400 ${isOverdue ? 'text-red-400' : ''}">
                            ${isOverdue ? 'Overdue' : goal.completed ? 'Completed' : `${daysLeft} days left`}
                        </span>
                    </div>
                    
                    <div class="goal-progress">
                        <div class="goal-progress-bar" style="width: ${goal.progress}%"></div>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-xs text-slate-500">Progress: ${goal.progress}%</span>
                        <span class="text-xs text-slate-500">Due: ${deadline.format('MMM DD, YYYY')}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    initSortableGoals() {
        const container = document.getElementById('active-goals');
        if (!container) return;

        if (this.sortableInstance) {
            this.sortableInstance.destroy();
        }

        this.sortableInstance = Sortable.create(container, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                const goalId = parseInt(evt.item.dataset.goalId);
                const newIndex = evt.newIndex;
                
                // Reorder goals array
                const goal = this.goals.find(g => g.id === goalId);
                if (goal) {
                    this.goals.splice(this.goals.indexOf(goal), 1);
                    this.goals.splice(newIndex, 0, goal);
                    this.saveGoals();
                    console.log(`🔄 Goal reordered: ${goal.title}`);
                }
            }
        });

        console.log('🎯 Sortable goals initialized');
    }

    showAddGoalForm() {
        const form = document.getElementById('add-goal-form');
        const btn = document.getElementById('add-goal-btn');
        
        if (form && btn) {
            form.classList.remove('hidden');
            btn.style.display = 'none';
            
            // Focus on title input
            const titleInput = document.getElementById('new-goal-title');
            if (titleInput) {
                titleInput.focus();
            }
            
            // Set default deadline to 1 month from now
            const deadlineInput = document.getElementById('new-goal-deadline');
            if (deadlineInput) {
                deadlineInput.value = dayjs().add(1, 'month').format('YYYY-MM-DD');
            }
        }
    }

    hideAddGoalForm() {
        const form = document.getElementById('add-goal-form');
        const btn = document.getElementById('add-goal-btn');
        
        if (form && btn) {
            form.classList.add('hidden');
            btn.style.display = 'block';
            
            // Clear form
            this.clearGoalForm();
        }
    }

    clearGoalForm() {
        const inputs = ['new-goal-title', 'new-goal-description', 'new-goal-deadline'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        const prioritySelect = document.getElementById('new-goal-priority');
        if (prioritySelect) prioritySelect.value = 'medium';
    }

    saveNewGoal() {
        const title = document.getElementById('new-goal-title').value.trim();
        const description = document.getElementById('new-goal-description').value.trim();
        const priority = document.getElementById('new-goal-priority').value;
        const deadline = document.getElementById('new-goal-deadline').value;

        if (!title) {
            this.showStatus('Please enter a goal title.', 'error');
            return;
        }

        if (!deadline) {
            this.showStatus('Please set a deadline.', 'error');
            return;
        }

        const newGoal = {
            id: Date.now(),
            title,
            description: description || 'No description provided',
            priority,
            deadline,
            progress: 0,
            completed: false,
            createdAt: dayjs().toISOString()
        };

        this.goals.unshift(newGoal);
        this.saveGoals();
        this.displayGoals();
        this.initSortableGoals();
        this.hideAddGoalForm();
        this.updateProgressCounter();

        this.showStatus(`Goal "${title}" created successfully! 🎯`, 'success');
        console.log('✅ New goal created:', newGoal);
    }

    editGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            // TODO: Implement goal editing modal/form
            this.showStatus(`Edit goal: ${goal.title} - Feature coming soon!`, 'info');
            console.log('✏️ Editing goal:', goal);
        }
    }

    toggleGoalComplete(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.completed = !goal.completed;
            goal.progress = goal.completed ? 100 : Math.min(goal.progress, 99);
            
            this.saveGoals();
            this.displayGoals();
            this.initSortableGoals();
            this.updateProgressCounter();
            
            const status = goal.completed ? 'completed' : 'reopened';
            this.showStatus(`Goal "${goal.title}" ${status}! ${goal.completed ? '🎉' : '🔄'}`, 'success');
            console.log(`${goal.completed ? '✅' : '🔄'} Goal ${status}:`, goal.title);
        }
    }

    deleteGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal && confirm(`Are you sure you want to delete "${goal.title}"?`)) {
            this.goals = this.goals.filter(g => g.id !== goalId);
            this.saveGoals();
            this.displayGoals();
            this.initSortableGoals();
            this.updateProgressCounter();
            
            this.showStatus(`Goal "${goal.title}" deleted.`, 'info');
            console.log('🗑️ Goal deleted:', goal.title);
        }
    }

    saveGoals() {
        localStorage.setItem('careerGoals_syashu16', JSON.stringify(this.goals));
    }

    updateProgressCounter() {
        const completedGoals = this.goals.filter(g => g.completed).length;
        const totalGoals = this.goals.length;
        
        const counter = document.getElementById('goals-progress');
        if (counter) {
            counter.textContent = `${completedGoals}/${totalGoals} Goals`;
        }
    }

    generateActionPlan() {
        const generateBtn = document.getElementById('generate-plan-btn');
        const originalText = generateBtn.innerHTML;
        
        // Show loading
        generateBtn.innerHTML = '<div class="loading-spinner"></div> Generating...';
        generateBtn.disabled = true;

        setTimeout(() => {
            const actionPlan = this.createActionPlan();
            this.displayActionPlan(actionPlan);
            
            // Reset button
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
            
            this.showStatus('New action plan generated! 🤖', 'success');
            console.log('🎯 Action plan generated');
        }, 2000);
    }

    createActionPlan() {
        const plans = [
            {
                priority: 1,
                icon: 'fas fa-code',
                title: 'Master Advanced JavaScript Concepts',
                description: 'Focus on closures, async/await, and design patterns. Practice with real projects.',
                timeline: '2-3 weeks',
                difficulty: 'Medium'
            },
            {
                priority: 2,
                icon: 'fas fa-cloud',
                title: 'Complete AWS Solutions Architect Course',
                description: 'Get hands-on experience with EC2, Lambda, and RDS. Aim for certification.',
                timeline: '4-6 weeks',
                difficulty: 'High'
            },
            {
                priority: 2,
                icon: 'fas fa-users',
                title: 'Develop Leadership Skills',
                description: 'Take initiative in team meetings. Mentor junior developers. Lead a small project.',
                timeline: 'Ongoing',
                difficulty: 'Medium'
            },
            {
                priority: 3,
                icon: 'fas fa-microphone',
                title: 'Improve Public Speaking',
                description: 'Join Toastmasters or present at local meetups. Practice technical presentations.',
                timeline: '3-4 months',
                difficulty: 'Medium'
            },
            {
                priority: 1,
                icon: 'fas fa-project-diagram',
                title: 'Build System Design Portfolio',
                description: 'Design scalable systems for popular applications. Document your thought process.',
                timeline: '6-8 weeks',
                difficulty: 'High'
            }
        ];

        return plans.sort((a, b) => a.priority - b.priority);
    }

    displayActionPlan(plans) {
        const container = document.getElementById('action-plan');
        if (!container) return;

        container.innerHTML = plans.map((plan, index) => `
            <div class="action-item priority-${plan.priority} fade-in" style="animation-delay: ${index * 0.1}s">
                <div class="flex items-start">
                    <div class="action-item-icon">
                        <i class="${plan.icon}"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-semibold text-white">${plan.title}</h4>
                            <div class="flex items-center space-x-2">
                                <span class="text-xs px-2 py-1 rounded-full ${plan.difficulty === 'High' ? 'bg-red-500/20 text-red-400' : plan.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}">${plan.difficulty}</span>
                                <span class="text-xs text-slate-500">${plan.timeline}</span>
                            </div>
                        </div>
                        <p class="text-slate-400 text-sm mb-3">${plan.description}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-slate-500">Priority ${plan.priority}</span>
                            <button class="text-indigo-400 hover:text-indigo-300 text-sm font-medium" onclick="window.careerPlanner.addActionToGoals('${plan.title}')">
                                <i class="fas fa-plus mr-1"></i>Add to Goals
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    addActionToGoals(actionTitle) {
        // Pre-fill add goal form with action item
        this.showAddGoalForm();
        
        const titleInput = document.getElementById('new-goal-title');
        if (titleInput) {
            titleInput.value = actionTitle;
        }
        
        this.showStatus('Action item added to goal form! 📝', 'success');
    }

    exportToPDF() {
        this.showStatus('PDF export feature coming soon! 📄', 'info');
        console.log('📄 Exporting career plan to PDF');
    }

    exportToCalendar() {
        // Create calendar events for goals and milestones
        const events = [];
        
        this.goals.forEach(goal => {
            if (!goal.completed) {
                events.push({
                    title: `Goal: ${goal.title}`,
                    date: goal.deadline,
                    description: goal.description
                });
            }
        });

        this.milestones.forEach(milestone => {
            if (milestone.status !== 'completed') {
                events.push({
                    title: `Milestone: ${milestone.title}`,
                    date: milestone.date,
                    description: milestone.description
                });
            }
        });

        if (events.length > 0) {
            this.showStatus(`${events.length} events ready for calendar export! 📅`, 'success');
            console.log('📅 Calendar events prepared:', events);
        } else {
            this.showStatus('No upcoming events to export.', 'info');
        }
    }

    sharePlan() {
        const shareData = {
            completedGoals: this.goals.filter(g => g.completed).length,
            totalGoals: this.goals.length,
            currentMilestone: this.milestones.find(m => m.status === 'current')?.title || 'None',
            targetRole: document.getElementById('target-role').textContent
        };

        const shareText = `🎯 My Career Progress with LakshyaAI:
• Goals Completed: ${shareData.completedGoals}/${shareData.totalGoals}
• Current Milestone: ${shareData.currentMilestone}
• Target Role: ${shareData.targetRole}
• Powered by AI Career Planning 🚀

#CareerDevelopment #LakshyaAI`;

        if (navigator.share) {
            navigator.share({
                title: 'My Career Plan Progress',
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText);
            this.showStatus('Career plan copied to clipboard! 📋', 'success');
        }

        console.log('📤 Career plan shared');
    }

    showStatus(message, type = 'info') {
        // Create a toast notification
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
            type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
            type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
            type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' :
            'bg-blue-500/20 border border-blue-500/30 text-blue-400'
        }`;
        
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-${
                    type === 'success' ? 'check-circle' :
                    type === 'error' ? 'exclamation-circle' :
                    type === 'warning' ? 'exclamation-triangle' :
                    'info-circle'
                }"></i>
                <span class="text-sm font-medium">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
        
        console.log(`📢 Status: ${message} (${type})`);
    }

    async checkAIStatus() {
        try {
            const response = await fetch('/api/ai-status');
            const data = await response.json();
            
            const statusElement = document.getElementById('ai-status');
            if (statusElement) {
                if (data.status === 'online') {
                    statusElement.textContent = 'AI Planning';
                    statusElement.className = 'text-indigo-400 text-sm font-semibold';
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

// Initialize Career Path Planner when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 LakshyaAI Career Path Planner loaded - User: syashu16 - 2025-08-05 15:47:25');
    window.careerPlanner = new CareerPathPlanner();
});