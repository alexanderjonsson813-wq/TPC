// Twitch Points Claimer Dashboard
class TwitchDashboard {
    constructor() {
        this.charts = {};
        this.data = {};
        this.settings = {};
        this.theme = 'dark';
        
        this.init();
    }

    async init() {
        console.log('Twitch Dashboard initializing...');
        
        // Load data and settings
        await this.loadData();
        await this.loadSettings();
        
        // Setup UI
        this.setupEventListeners();
        this.setupTheme();
        this.updateUI();
        this.initializeCharts();
        
        // Hide loading overlay
        setTimeout(() => {
            document.getElementById('loadingOverlay').classList.add('hidden');
        }, 1000);

        console.log('Dashboard initialized successfully');
    }

    async loadData() {
        try {
            const result = await chrome.storage.local.get([
                'totalPoints',
                'totalDrops',
                'sessionsToday',
                'activeDays',
                'pointsHistory',
                'streamerStats',
                'recentActivity',
                'lastResetDate',
                'dailyStats'
            ]);

            this.data = {
                totalPoints: result.totalPoints || 0,
                totalDrops: result.totalDrops || 0,
                sessionsToday: result.sessionsToday || 0,
                activeDays: result.activeDays || 0,
                pointsHistory: result.pointsHistory || [],
                streamerStats: result.streamerStats || {},
                recentActivity: result.recentActivity || [],
                lastResetDate: result.lastResetDate || new Date().toDateString(),
                dailyStats: result.dailyStats || {}
            };

            // If no real data exists, show empty state
            if (this.data.totalPoints === 0 && this.data.totalDrops === 0) {
                this.showEmptyState();
            }

            console.log('Dashboard data loaded:', this.data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.data = this.getDefaultData();
        }
    }

    showEmptyState() {
        // Show helpful message when no data exists
        console.log('No claiming data found - showing empty state');
        
        // Generate minimal sample data just for charts to not break
        this.data.pointsHistory = this.generateEmptyHistory();
        this.data.recentActivity = [{
            type: 'info',
            description: 'Start watching Twitch streams to see activity here',
            timestamp: new Date().toISOString(),
            value: null,
            streamer: 'System'
        }];
    }

    generateEmptyHistory() {
        // Generate empty history for chart
        const history = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            history.push({
                date: date.toISOString(),
                points: 0
            });
        }
        
        return history;
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'autoClaimPoints',
                'autoClaimDrops',
                'enableNotifications',
                'soundNotifications',
                'claimingInterval',
                'debugMode',
                'dashboardTheme'
            ]);

            this.settings = {
                autoClaimPoints: result.autoClaimPoints !== undefined ? result.autoClaimPoints : true,
                autoClaimDrops: result.autoClaimDrops !== undefined ? result.autoClaimDrops : true,
                enableNotifications: result.enableNotifications !== undefined ? result.enableNotifications : true,
                soundNotifications: result.soundNotifications || false,
                claimingInterval: result.claimingInterval || 3000,
                debugMode: result.debugMode || false,
                dashboardTheme: result.dashboardTheme || 'dark'
            };

            this.theme = this.settings.dashboardTheme;
            console.log('Settings loaded:', this.settings);
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = this.getDefaultSettings();
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleThemeSelector();
        });

        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.changeTheme(theme);
            });
        });

        // Refresh data
        document.getElementById('refreshData').addEventListener('click', () => {
            this.refreshData();
        });

        // Settings toggles
        document.getElementById('autoClaimPoints').addEventListener('change', (e) => {
            this.updateSetting('autoClaimPoints', e.target.checked);
        });

        document.getElementById('autoClaimDrops').addEventListener('change', (e) => {
            this.updateSetting('autoClaimDrops', e.target.checked);
        });

        document.getElementById('enableNotifications').addEventListener('change', (e) => {
            this.updateSetting('enableNotifications', e.target.checked);
        });

        document.getElementById('soundNotifications').addEventListener('change', (e) => {
            this.updateSetting('soundNotifications', e.target.checked);
        });

        document.getElementById('claimingInterval').addEventListener('change', (e) => {
            this.updateSetting('claimingInterval', parseInt(e.target.value));
        });

        document.getElementById('debugMode').addEventListener('change', (e) => {
            this.updateSetting('debugMode', e.target.checked);
        });

        // Data management
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importData').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        document.getElementById('resetStats').addEventListener('click', () => {
            this.resetStats();
        });

        // Close theme selector when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-btn') && !e.target.closest('.theme-selector')) {
                document.getElementById('themeSelector').classList.add('hidden');
            }
        });
    }

    setupTheme() {
        document.body.setAttribute('data-theme', this.theme);
        
        // Update active theme option
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        
        const activeOption = document.querySelector(`[data-theme="${this.theme}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
    }

    updateUI() {
        this.updateStats();
        this.updateSettings();
        this.updateStreamers();
        this.updateActivity();
    }

    updateStats() {
        // Main stats
        document.getElementById('totalPointsValue').textContent = this.formatNumber(this.data.totalPoints);
        document.getElementById('totalDropsValue').textContent = this.formatNumber(this.data.totalDrops);
        document.getElementById('activeDaysValue').textContent = this.data.activeDays;
        
        // Calculate daily average
        const avgDaily = this.data.activeDays > 0 ? Math.round(this.data.totalPoints / this.data.activeDays) : 0;
        document.getElementById('avgDailyValue').textContent = this.formatNumber(avgDaily);

        // Update change indicators
        const todayPoints = this.getTodayPoints();
        const weekDrops = this.getWeekDrops();
        
        document.getElementById('pointsChange').textContent = `+${this.formatNumber(todayPoints)} today`;
        document.getElementById('dropsChange').textContent = `+${weekDrops} this week`;
        document.getElementById('streakChange').textContent = `${this.data.activeDays} day${this.data.activeDays !== 1 ? 's' : ''} streak`;
        document.getElementById('avgChange').textContent = 'points per day';

        // Add fade-in animation
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            card.classList.add('fade-in');
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    updateSettings() {
        document.getElementById('autoClaimPoints').checked = this.settings.autoClaimPoints;
        document.getElementById('autoClaimDrops').checked = this.settings.autoClaimDrops;
        document.getElementById('enableNotifications').checked = this.settings.enableNotifications;
        document.getElementById('soundNotifications').checked = this.settings.soundNotifications;
        document.getElementById('claimingInterval').value = this.settings.claimingInterval;
        document.getElementById('debugMode').checked = this.settings.debugMode;
    }

    updateStreamers() {
        const container = document.getElementById('streamersGrid');
        container.innerHTML = '';

        // Sort streamers by points claimed
        const sortedStreamers = Object.entries(this.data.streamerStats)
            .sort(([,a], [,b]) => b.points - a.points)
            .slice(0, 6); // Top 6 streamers

        sortedStreamers.forEach(([streamer, stats], index) => {
            const card = this.createStreamerCard(streamer, stats, index + 1);
            container.appendChild(card);
        });
    }

    updateActivity() {
        const container = document.getElementById('activityFeed');
        container.innerHTML = '';

        this.data.recentActivity.slice(0, 10).forEach(activity => {
            const item = this.createActivityItem(activity);
            container.appendChild(item);
        });
    }

    initializeCharts() {
        this.initializePointsChart();
        this.initializeActivityChart();
    }

    initializePointsChart() {
        const ctx = document.getElementById('pointsChart').getContext('2d');
        
        const data = this.data.pointsHistory;
        const labels = data.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const points = data.map(item => item.points);

        this.charts.pointsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Points Claimed',
                    data: points,
                    borderColor: getComputedStyle(document.body).getPropertyValue('--accent-primary'),
                    backgroundColor: getComputedStyle(document.body).getPropertyValue('--accent-primary') + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: getComputedStyle(document.body).getPropertyValue('--accent-primary'),
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--border-color'),
                            borderColor: getComputedStyle(document.body).getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                        }
                    },
                    y: {
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--border-color'),
                            borderColor: getComputedStyle(document.body).getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    initializeActivityChart() {
        const ctx = document.getElementById('activityChart').getContext('2d');
        
        const activityData = this.calculateActivityDistribution();
        
        this.charts.activityChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Points', 'Drops', 'Sessions'],
                datasets: [{
                    data: [
                        activityData.points,
                        activityData.drops,
                        activityData.sessions
                    ],
                    backgroundColor: [
                        getComputedStyle(document.body).getPropertyValue('--accent-primary'),
                        getComputedStyle(document.body).getPropertyValue('--success'),
                        getComputedStyle(document.body).getPropertyValue('--warning')
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    createStreamerCard(streamerName, stats, rank) {
        const card = document.createElement('div');
        card.className = 'streamer-card';
        
        const initial = streamerName.charAt(0).toUpperCase();
        const points = this.formatNumber(stats.points);
        const hours = Math.round(stats.watchTime / 3600); // Convert seconds to hours
        
        card.innerHTML = `
            <div class="streamer-avatar">${initial}</div>
            <div class="streamer-info">
                <h4>#${rank} ${streamerName}</h4>
                <div class="streamer-stats">
                    <span class="streamer-points">${points} points</span> • 
                    <span>${hours}h watched</span>
                </div>
            </div>
        `;
        
        return card;
    }

    createActivityItem(activity) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        const iconClass = activity.type === 'points' ? 'fa-coins' : 
                         activity.type === 'drops' ? 'fa-gift' : 'fa-play';
        
        const timeAgo = this.getTimeAgo(activity.timestamp);
        
        item.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">
                    ${activity.description} 
                    ${activity.value ? `<span class="activity-value">+${activity.value}</span>` : ''}
                </div>
                <div class="activity-time">${timeAgo}</div>
            </div>
        `;
        
        return item;
    }

    toggleThemeSelector() {
        const selector = document.getElementById('themeSelector');
        selector.classList.toggle('hidden');
    }

    changeTheme(newTheme) {
        this.theme = newTheme;
        this.setupTheme();
        
        // Save theme preference
        this.updateSetting('dashboardTheme', newTheme);
        
        // Hide theme selector
        document.getElementById('themeSelector').classList.add('hidden');
        
        // Reinitialize charts with new theme colors
        setTimeout(() => {
            this.destroyCharts();
            this.initializeCharts();
        }, 100);
        
        this.showNotification(`Theme changed to ${newTheme}`, 'success');
    }

    async updateSetting(key, value) {
        this.settings[key] = value;
        
        try {
            await chrome.storage.sync.set({ [key]: value });
            console.log(`Setting updated: ${key} = ${value}`);
            
            this.showNotification('Settings saved', 'success');
        } catch (error) {
            console.error('Error saving setting:', error);
            this.showNotification('Error saving settings', 'error');
        }
    }

    async refreshData() {
        const refreshBtn = document.getElementById('refreshData');
        const icon = refreshBtn.querySelector('i');
        
        // Add loading animation
        icon.style.animation = 'spin 1s linear infinite';
        refreshBtn.disabled = true;
        
        try {
            await this.loadData();
            this.updateUI();
            this.destroyCharts();
            this.initializeCharts();
            
            this.showNotification('Data refreshed successfully', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showNotification('Error refreshing data', 'error');
        } finally {
            // Remove loading animation
            setTimeout(() => {
                icon.style.animation = '';
                refreshBtn.disabled = false;
            }, 1000);
        }
    }

    exportData() {
        const exportData = {
            version: '1.1.0',
            exported: new Date().toISOString(),
            data: this.data,
            settings: this.settings
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `twitch-points-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully', 'success');
    }

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData.data && importedData.settings) {
                    // Save imported data
                    await chrome.storage.local.set(importedData.data);
                    await chrome.storage.sync.set(importedData.settings);
                    
                    // Reload data and UI
                    await this.loadData();
                    await this.loadSettings();
                    this.updateUI();
                    this.setupTheme();
                    this.destroyCharts();
                    this.initializeCharts();
                    
                    this.showNotification('Data imported successfully', 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                this.showNotification('Error importing data: Invalid file format', 'error');
            }
        };
        
        reader.readAsText(file);
    }

    async resetStats() {
        if (!confirm('Are you sure you want to reset ALL statistics? This action cannot be undone.')) {
            return;
        }

        try {
            // Reset all data
            const resetData = {
                totalPoints: 0,
                totalDrops: 0,
                sessionsToday: 0,
                activeDays: 0,
                pointsHistory: [],
                streamerStats: {},
                recentActivity: [],
                lastResetDate: new Date().toDateString()
            };

            await chrome.storage.local.set(resetData);
            
            // Reload data and UI
            await this.loadData();
            this.updateUI();
            this.destroyCharts();
            this.initializeCharts();
            
            this.showNotification('All statistics have been reset', 'success');
        } catch (error) {
            console.error('Error resetting stats:', error);
            this.showNotification('Error resetting statistics', 'error');
        }
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    // Helper methods
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }

    getTodayPoints() {
        const today = new Date().toDateString();
        const todayData = this.data.pointsHistory.find(item => 
            new Date(item.date).toDateString() === today
        );
        return todayData ? todayData.points : 0;
    }

    getWeekDrops() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return this.data.recentActivity.filter(activity => 
            activity.type === 'drops' && new Date(activity.timestamp) >= weekAgo
        ).length;
    }

    calculateActivityDistribution() {
        const total = this.data.totalPoints + this.data.totalDrops + this.data.sessionsToday;
        
        return {
            points: total > 0 ? Math.round((this.data.totalPoints / total) * 100) : 0,
            drops: total > 0 ? Math.round((this.data.totalDrops / total) * 100) : 0,
            sessions: total > 0 ? Math.round((this.data.sessionsToday / total) * 100) : 0
        };
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const colors = {
            success: 'var(--success)',
            error: 'var(--danger)',
            warning: 'var(--warning)',
            info: 'var(--accent-primary)'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 300px;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Sample data generators for demo purposes
    generateSampleHistory() {
        const history = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            history.push({
                date: date.toISOString(),
                points: Math.floor(Math.random() * 500) + 100
            });
        }
        
        return history;
    }

    generateSampleStreamers() {
        const streamers = [
            'xQcOW', 'Ninja', 'Pokimane', 'shroud', 'TimTheTatman',
            'DrLupo', 'LIRIK', 'Summit1G', 'Tfue', 'Myth'
        ];
        
        const stats = {};
        
        streamers.forEach(streamer => {
            stats[streamer] = {
                points: Math.floor(Math.random() * 5000) + 500,
                drops: Math.floor(Math.random() * 10) + 1,
                watchTime: Math.floor(Math.random() * 100000) + 10000, // seconds
                sessions: Math.floor(Math.random() * 50) + 5
            };
        });
        
        return stats;
    }

    generateSampleActivity() {
        const activities = [];
        const now = new Date();
        
        const activityTypes = [
            { type: 'points', description: 'Claimed bonus points on {streamer}', value: '50 points' },
            { type: 'drops', description: 'Claimed drop on {streamer}', value: '1 drop' },
            { type: 'session', description: 'Started watching {streamer}', value: null }
        ];
        
        const streamers = ['xQcOW', 'Ninja', 'Pokimane', 'shroud', 'TimTheTatman'];
        
        for (let i = 0; i < 20; i++) {
            const timestamp = new Date(now.getTime() - (Math.random() * 7 * 24 * 60 * 60 * 1000));
            const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            const streamer = streamers[Math.floor(Math.random() * streamers.length)];
            
            activities.push({
                type: activity.type,
                description: activity.description.replace('{streamer}', streamer),
                value: activity.value,
                timestamp: timestamp.toISOString(),
                streamer: streamer
            });
        }
        
        // Sort by timestamp (most recent first)
        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    getDefaultData() {
        return {
            totalPoints: 0,
            totalDrops: 0,
            sessionsToday: 0,
            activeDays: 0,
            pointsHistory: this.generateEmptyHistory(),
            streamerStats: {},
            recentActivity: [],
            lastResetDate: new Date().toDateString(),
            dailyStats: {}
        };
    }

    getDefaultSettings() {
        return {
            autoClaimPoints: true,
            autoClaimDrops: true,
            enableNotifications: true,
            soundNotifications: false,
            claimingInterval: 3000,
            debugMode: false,
            dashboardTheme: 'dark'
        };
    }
}

// CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TwitchDashboard();
});