// LakshyaAI Dashboard JavaScript
class Dashboard {
    constructor() {
        this.currentUser = 'syashu16';
        this.init();
    }

    init() {
        this.setupInteractivity();
        this.loadDashboardData();
        this.setupRealTimeUpdates();
        this.setupNotifications();
        console.log('🎯 LakshyaAI Dashboard initialized');
    }

    setupInteractivity() {
        // Sidebar navigation
        this.setupSidebarNavigation();
        
        // Feature cards
        this.setupFeatureCards();
        
        // Quick actions
        this.setupQuickActions();
        
        // Search functionality
        this.setupSearch();
    }

    setupSidebarNavigation() {
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active state from all items
                sidebarItems.forEach(i => {
                    i.classList.remove('bg-gradient-to-r', 'from-blue-500/20', 'to-purple-500/20', 'border-l-3', 'border-blue-500', 'text-white');
                    i.classList.add('text-slate-300');
                });
                
                // Add active state to clicked item
                item.classList.add('bg-gradient-to-r', 'from-blue-500/20', 'to-purple-500/20', 'border-l-3', 'border-blue-500', 'text-white');
                item.classList.remove('text-slate-300');
                
                // Get the section to navigate to
                const section = item.getAttribute('href').substring(1);
                this.navigateToSection(section);
            });
        });
    }

    navigateToSection(section) {
        console.log(`🧭 Navigating to section: ${section}`);
        
        // Here you would implement section switching logic
        // For now, we'll show a notification
        this.showNotification(`Navigating to ${section} section...`, 'info');
    }

    setupFeatureCards() {
        const featureCards = document.querySelectorAll('.feature-card');
        
        featureCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('h3').textContent;
                this.openFeature(title);
            });
            
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                this.animateCard(card, 'enter');
            });
            
            card.addEventListener('mouseleave', () => {
                this.animateCard(card, 'leave');
            });
        });
    }

    animateCard(card, type) {
        if (type === 'enter') {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = '0 25px 50px rgba(59, 130, 246, 0.3)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = 'none';
        }
    }

    openFeature(featureName) {
        console.log(`🎯 Opening feature: ${featureName}`);
        this.showNotification(`Opening ${featureName}...`, 'info');
    }

    setupQuickActions() {
        // Upload Resume
        const uploadBtn = document.querySelector('button:has(.fa-upload)');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                this.triggerFileUpload();
            });
        }
        
        // Find Jobs
        const findJobsBtn = document.querySelector('button:has(.fa-search)');
        if (findJobsBtn) {
            findJobsBtn.addEventListener('click', () => {
                this.openJobSearch();
            });
        }
        
        // Ask AI Coach
        const aiCoachBtn = document.querySelector('button:has(.fa-comments)');
        if (aiCoachBtn) {
            aiCoachBtn.addEventListener('click', () => {
                this.openAICoach();
            });
        }
    }

    triggerFileUpload() {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadResume(file);
            }
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    uploadResume(file) {
        this.showNotification(`📄 Uploading ${file.name}...`, 'info');
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                clearInterval(interval);
                this.showNotification('✅ Resume uploaded successfully!', 'success');
                this.updateResumeAnalysis();
            }
        }, 200);
    }

    updateResumeAnalysis() {
        // Update the resume analysis card
        setTimeout(() => {
            this.showNotification('🤖 AI analysis complete! ATS score: 94/100', 'success');
        }, 2000);
    }

    openJobSearch() {
        this.showNotification('🔍 Opening job search...', 'info');
        // Here you would navigate to job search section
    }

    openAICoach() {
        this.showNotification('🤖 Connecting to AI Career Coach...', 'info');
        // Here you would open AI chat interface
    }

    setupSearch() {
        const searchInput = document.querySelector('input[placeholder="Search anything..."]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.length > 2) {
                    this.performSearch(query);
                }
            });
        }
    }

    performSearch(query) {
        console.log(`🔍 Searching for: ${query}`);
        // Implement search functionality
    }

    loadDashboardData() {
        // Simulate loading dashboard data
        this.updateStats();
        this.loadRecentActivity();
        this.checkNotifications();
    }

    updateStats() {
        // Animate stat numbers
        const statNumbers = document.querySelectorAll('.stats-card h3');
        statNumbers.forEach(stat => {
            this.animateNumber(stat);
        });
    }

    animateNumber(element) {
        const finalNumber = parseInt(element.textContent);
        let currentNumber = 0;
        const increment = finalNumber / 50;
        
        const timer = setInterval(() => {
            currentNumber += increment;
            if (currentNumber >= finalNumber) {
                currentNumber = finalNumber;
                clearInterval(timer);
            }
            
            if (element.textContent.includes('%')) {
                element.textContent = Math.round(currentNumber) + '%';
            } else {
                element.textContent = Math.round(currentNumber);
            }
        }, 30);
    }

    loadRecentActivity() {
        // Load and display recent activities
        console.log('📊 Loading recent activity...');
    }

    checkNotifications() {
        // Check for new notifications
        setTimeout(() => {
            this.showNotification('🎉 You have 3 new job matches!', 'success');
        }, 3000);
    }

    setupRealTimeUpdates() {
        // Setup WebSocket or polling for real-time updates
        setInterval(() => {
            this.updateDashboardData();
        }, 30000); // Update every 30 seconds
    }

    updateDashboardData() {
        // Update dashboard with fresh data
        console.log('🔄 Updating dashboard data...');
    }

    setupNotifications() {
        // Setup notification system
        this.notificationQueue = [];
        this.maxNotifications = 3;
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 z-50 p-4 rounded-xl text-white max-w-sm transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500/90' : 
            type === 'error' ? 'bg-red-500/90' : 
            type === 'warning' ? 'bg-yellow-500/90' :
            'bg-blue-500/90'
        } backdrop-blur-sm border border-white/20 shadow-lg`;
        
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <i class="fas ${
                        type === 'success' ? 'fa-check-circle' : 
                        type === 'error' ? 'fa-exclamation-triangle' : 
                        type === 'warning' ? 'fa-exclamation-circle' :
                        'fa-info-circle'
                    }"></i>
                    <span>${message}</span>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white/80 hover:text-white transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Position notification
        const existingNotifications = document.querySelectorAll('.fixed.top-20.right-4');
        notification.style.top = `${80 + (existingNotifications.length * 80)}px`;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    // Utility methods
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    getCurrentTime() {
        return new Date().toLocaleString();
    }

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lakshyaAIDashboard = new Dashboard();
});

// Handle window resize
window.addEventListener('resize', () => {
    // Adjust layout for mobile
    const sidebar = document.querySelector('aside');
    const main = document.querySelector('main');
    
    if (window.innerWidth < 1024) {
        // Mobile layout adjustments
        console.log('📱 Switching to mobile layout');
    }
});