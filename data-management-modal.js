/**
 * Personal Data Management Modal Component
 * Provides UI for viewing, managing, and controlling personal data
 */

class DataManagementModal {
    constructor(personalDataManager) {
        this.pdm = personalDataManager;
        this.modal = null;
        this.isOpen = false;
        this.currentTab = 'overview';
        
        this.init();
    }

    /**
     * Initialize the modal component
     */
    init() {
        this.createModalStructure();
        this.attachEventListeners();
        this.setupKeyboardNavigation();
    }

    /**
     * Create the modal HTML structure
     */
    createModalStructure() {
        // Create modal overlay
        this.modal = document.createElement('div');
        this.modal.className = 'data-modal-overlay';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.setAttribute('aria-labelledby', 'data-modal-title');
        this.modal.setAttribute('aria-hidden', 'true');
        this.modal.style.display = 'none';

        // Modal content structure
        this.modal.innerHTML = `
            <div class="data-modal-container">
                <div class="data-modal-header">
                    <h2 id="data-modal-title" class="data-modal-title">Personal Data Manager</h2>
                    <button class="data-modal-close" aria-label="Close modal" title="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <div class="data-modal-tabs" role="tablist" aria-label="Data management sections">
                    <button class="data-tab-btn active" data-tab="overview" role="tab" 
                            aria-selected="true" aria-controls="overview-panel" id="overview-tab">
                        <span class="tab-icon">📊</span>
                        <span class="tab-text">Overview</span>
                    </button>
                    <button class="data-tab-btn" data-tab="personal" role="tab" 
                            aria-selected="false" aria-controls="personal-panel" id="personal-tab">
                        <span class="tab-icon">👤</span>
                        <span class="tab-text">Personal</span>
                    </button>
                    <button class="data-tab-btn" data-tab="preferences" role="tab" 
                            aria-selected="false" aria-controls="preferences-panel" id="preferences-tab">
                        <span class="tab-icon">❤️</span>
                        <span class="tab-text">Preferences</span>
                    </button>
                    <button class="data-tab-btn" data-tab="events" role="tab" 
                            aria-selected="false" aria-controls="events-panel" id="events-tab">
                        <span class="tab-icon">📅</span>
                        <span class="tab-text">Events</span>
                    </button>
                    <button class="data-tab-btn" data-tab="goals" role="tab" 
                            aria-selected="false" aria-controls="goals-panel" id="goals-tab">
                        <span class="tab-icon">🎯</span>
                        <span class="tab-text">Goals</span>
                    </button>
                    <button class="data-tab-btn" data-tab="manage" role="tab" 
                            aria-selected="false" aria-controls="manage-panel" id="manage-tab">
                        <span class="tab-icon">⚙️</span>
                        <span class="tab-text">Manage</span>
                    </button>
                </div>

                <div class="data-modal-body">
                    <!-- Overview Panel -->
                    <div id="overview-panel" class="data-panel active" role="tabpanel" 
                         aria-labelledby="overview-tab">
                        <div class="data-summary-dashboard">
                            <div class="summary-cards">
                                <div class="summary-card">
                                    <div class="card-icon">👤</div>
                                    <div class="card-content">
                                        <div class="card-number" id="personal-count">0</div>
                                        <div class="card-label">Personal Details</div>
                                    </div>
                                </div>
                                <div class="summary-card">
                                    <div class="card-icon">❤️</div>
                                    <div class="card-content">
                                        <div class="card-number" id="preferences-count">0</div>
                                        <div class="card-label">Preferences</div>
                                    </div>
                                </div>
                                <div class="summary-card">
                                    <div class="card-icon">📅</div>
                                    <div class="card-content">
                                        <div class="card-number" id="events-count">0</div>
                                        <div class="card-label">Events</div>
                                    </div>
                                </div>
                                <div class="summary-card">
                                    <div class="card-icon">🎯</div>
                                    <div class="card-content">
                                        <div class="card-number" id="goals-count">0</div>
                                        <div class="card-label">Goals</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="data-health-indicators">
                                <h3>Data Health</h3>
                                <div class="health-indicator">
                                    <span class="indicator-label">Profile Completeness</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="completeness-progress"></div>
                                    </div>
                                    <span class="indicator-value" id="completeness-value">0%</span>
                                </div>
                                <div class="health-indicator">
                                    <span class="indicator-label">Data Recency</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="recency-progress"></div>
                                    </div>
                                    <span class="indicator-value" id="recency-value">0%</span>
                                </div>
                                <div class="health-indicator">
                                    <span class="indicator-label">Storage Usage</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="storage-progress"></div>
                                    </div>
                                    <span class="indicator-value" id="storage-value">0%</span>
                                </div>
                            </div>

                            <div class="recent-activity">
                                <h3>Recent Activity</h3>
                                <div class="activity-list" id="recent-activity-list">
                                    <!-- Activity items will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Personal Panel -->
                    <div id="personal-panel" class="data-panel" role="tabpanel" 
                         aria-labelledby="personal-tab">
                        <div class="personal-info-container">
                            <div class="data-section">
                                <div class="section-header">
                                    <h3><span class="section-icon">👤</span>Basic Information</h3>
                                    <div class="section-description">Core personal details and identity</div>
                                    <button class="add-data-btn" data-type="personal" title="Add new personal information">
                                        <span>➕</span> Add New
                                    </button>
                                </div>
                                <div class="data-grid" id="personal-data-grid">
                                    <!-- Personal data will be populated here -->
                                </div>
                            </div>
                            <div class="data-section">
                                <div class="section-header">
                                    <h3><span class="section-icon">💼</span>Professional Information</h3>
                                    <div class="section-description">Work-related details and career info</div>
                                    <button class="add-data-btn" data-type="work" title="Add new work information">
                                        <span>➕</span> Add New
                                    </button>
                                </div>
                                <div class="data-grid" id="work-data-grid">
                                    <!-- Work data will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Preferences Panel -->
                    <div id="preferences-panel" class="data-panel" role="tabpanel" 
                         aria-labelledby="preferences-tab">
                        <div class="preferences-container">
                            <div class="preference-category">
                                <h3>👍 Likes</h3>
                                <div class="preference-list" id="likes-list">
                                    <!-- Likes will be populated here -->
                                </div>
                            </div>
                            <div class="preference-category">
                                <h3>👎 Dislikes</h3>
                                <div class="preference-list" id="dislikes-list">
                                    <!-- Dislikes will be populated here -->
                                </div>
                            </div>
                            <div class="preference-category">
                                <h3>⭐ Favorites</h3>
                                <div class="preference-list" id="favorites-list">
                                    <!-- Favorites will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Events Panel -->
                    <div id="events-panel" class="data-panel" role="tabpanel" 
                         aria-labelledby="events-tab">
                        <div class="events-container">
                            <div class="events-filter">
                                <select id="events-filter-select" aria-label="Filter events by type">
                                    <option value="all">All Events</option>
                                    <option value="meeting">Meetings</option>
                                    <option value="appointment">Appointments</option>
                                    <option value="deadline">Deadlines</option>
                                    <option value="event">Events</option>
                                    <option value="reminder">Reminders</option>
                                </select>
                            </div>
                            <div class="events-list" id="events-list">
                                <!-- Events will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Goals Panel -->
                    <div id="goals-panel" class="data-panel" role="tabpanel" 
                         aria-labelledby="goals-tab">
                        <div class="goals-container">
                            <div class="goals-filter">
                                <select id="goals-filter-select" aria-label="Filter goals by category">
                                    <option value="all">All Goals</option>
                                    <option value="learning">Learning</option>
                                    <option value="career">Career</option>
                                    <option value="personal">Personal</option>
                                    <option value="health">Health</option>
                                    <option value="travel">Travel</option>
                                    <option value="creative">Creative</option>
                                </select>
                            </div>
                            <div class="goals-list" id="goals-list">
                                <!-- Goals will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Manage Panel -->
                    <div id="manage-panel" class="data-panel" role="tabpanel" 
                         aria-labelledby="manage-tab">
                        <div class="management-actions">
                            <div class="action-section">
                                <h3>Export & Import</h3>
                                <div class="action-buttons">
                                    <button class="action-btn primary" id="export-data-btn">
                                        <span class="btn-icon">📥</span>
                                        <span class="btn-text">Export Data</span>
                                    </button>
                                    <button class="action-btn secondary" id="import-data-btn">
                                        <span class="btn-icon">📤</span>
                                        <span class="btn-text">Import Data</span>
                                    </button>
                                    <input type="file" id="import-file-input" accept=".json" style="display: none;">
                                </div>
                            </div>
                            
                            <div class="action-section">
                                <h3>Data Management</h3>
                                <div class="action-buttons">
                                    <button class="action-btn secondary" id="clear-category-btn">
                                        <span class="btn-icon">🗑️</span>
                                        <span class="btn-text">Clear Category</span>
                                    </button>
                                    <button class="action-btn danger" id="clear-all-btn">
                                        <span class="btn-icon">⚠️</span>
                                        <span class="btn-text">Clear All Data</span>
                                    </button>
                                </div>
                            </div>

                            <div class="action-section">
                                <h3>Storage Information</h3>
                                <div class="storage-info" id="storage-info">
                                    <!-- Storage info will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append to body
        document.body.appendChild(this.modal);
    }

    /**
     * Attach event listeners to modal elements
     */
    attachEventListeners() {
        // Close modal events
        const closeBtn = this.modal.querySelector('.data-modal-close');
        closeBtn.addEventListener('click', () => this.close());

        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Tab navigation
        const tabBtns = this.modal.querySelectorAll('.data-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Export/Import functionality
        const exportBtn = this.modal.querySelector('#export-data-btn');
        const importBtn = this.modal.querySelector('#import-data-btn');
        const importInput = this.modal.querySelector('#import-file-input');

        exportBtn.addEventListener('click', () => this.exportData());
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => this.importData(e));

        // Clear data functionality
        const clearCategoryBtn = this.modal.querySelector('#clear-category-btn');
        const clearAllBtn = this.modal.querySelector('#clear-all-btn');

        clearCategoryBtn.addEventListener('click', () => this.clearCategory());
        clearAllBtn.addEventListener('click', () => this.clearAllData());

        // Filter events
        const eventsFilter = this.modal.querySelector('#events-filter-select');
        eventsFilter.addEventListener('change', (e) => this.filterEvents(e.target.value));

        // Filter goals
        const goalsFilter = this.modal.querySelector('#goals-filter-select');
        goalsFilter.addEventListener('change', (e) => this.filterGoals(e.target.value));

        // Add activity listeners to reset inactivity timer
        this.addActivityListeners();

        // Data item edit and delete functionality
        this.attachDataItemListeners();
    }

    /**
     * Add listeners for user activity to reset inactivity timer
     */
    addActivityListeners() {
        const activityEvents = ['click', 'keydown', 'mousemove', 'scroll'];
        
        activityEvents.forEach(eventType => {
            this.modal.addEventListener(eventType, () => {
                this.resetInactivityTimer();
            }, { passive: true });
        });
    }

    /**
     * Attach event listeners for data item actions
     */
    attachDataItemListeners() {
        // Use event delegation for dynamically created buttons
        this.modal.addEventListener('click', (e) => {
            console.log('Modal click detected:', e.target);
            
            if (e.target.closest('.edit-data-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.edit-data-btn');
                const key = btn.dataset.key;
                const type = btn.dataset.type;
                console.log('Edit button clicked:', key, type);
                try {
                    this.openFullScreenEditor(key, type);
                } catch (error) {
                    console.error('Edit error:', error);
                    alert('Edit error: ' + error.message);
                }
                return false;
            }
            
            if (e.target.closest('.delete-data-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.delete-data-btn');
                const key = btn.dataset.key;
                const type = btn.dataset.type;
                console.log('Delete button clicked:', key, type);
                try {
                    this.deleteDataItem(key, type);
                } catch (error) {
                    console.error('Delete error:', error);
                    alert('Delete error: ' + error.message);
                }
                return false;
            }
            
            if (e.target.closest('.add-data-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.add-data-btn');
                const type = btn.dataset.type;
                console.log('Add button clicked:', type);
                try {
                    this.openAddNewDialog(type);
                } catch (error) {
                    console.error('Add error:', error);
                    alert('Add error: ' + error.message);
                }
                return false;
            }
        });
    }

    /**
     * Setup keyboard navigation for accessibility
     */
    setupKeyboardNavigation() {
        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }

            // Tab navigation with arrow keys
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const tabBtns = Array.from(this.modal.querySelectorAll('.data-tab-btn'));
                const currentIndex = tabBtns.findIndex(btn => btn.classList.contains('active'));
                
                let newIndex;
                if (e.key === 'ArrowLeft') {
                    newIndex = currentIndex > 0 ? currentIndex - 1 : tabBtns.length - 1;
                } else {
                    newIndex = currentIndex < tabBtns.length - 1 ? currentIndex + 1 : 0;
                }
                
                const newTab = tabBtns[newIndex].dataset.tab;
                this.switchTab(newTab);
                tabBtns[newIndex].focus();
            }
        });
    }

    /**
     * Open the modal
     */
    open() {
  if (this.isOpen) return;
  this.isOpen = true;
  this.modal.style.display = 'flex';
  this.modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Load data AFTER modal is visible
  setTimeout(() => {
    this.refreshData();
    this.startInactivityTimer();
  }, 100);

  // Focus first element
  const firstFocusable = this.modal.querySelector('.data-modal-close');
  if (firstFocusable) firstFocusable.focus();
}

    /**
     * Start inactivity timer for auto-close
     */
    startInactivityTimer() {
        // Clear any existing timer
        this.clearInactivityTimer();
        
        // Set auto-close timeout from global config (if available)
        const inactivityTimeout = (typeof POPUP_CONFIG !== 'undefined') 
            ? POPUP_CONFIG.modalInactivityTimeout 
            : 30000; // fallback to 30 seconds
        
        if (inactivityTimeout > 0) {
            this.inactivityTimer = setTimeout(() => {
                if (this.isOpen) {
                    console.log('Auto-closing modal due to inactivity');
                    this.close();
                }
            }, inactivityTimeout);
        }
    }

    /**
     * Clear inactivity timer
     */
    clearInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
    }

    /**
     * Reset inactivity timer (call on user interaction)
     */
    resetInactivityTimer() {
        if (this.isOpen) {
            this.startInactivityTimer();
        }
    }

    /**
     * Close the modal
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.modal.classList.remove('modal-open');
        
        // Clear inactivity timer
        this.clearInactivityTimer();
        
        // Restore body scroll
        document.body.style.overflow = '';

        // Hide after animation
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.modal.setAttribute('aria-hidden', 'true');
        }, 300);
    }

    /**
     * Switch between tabs
     * @param {string} tabId - Tab identifier
     */
    switchTab(tabId) {
        // Update tab buttons
        const tabBtns = this.modal.querySelectorAll('.data-tab-btn');
        tabBtns.forEach(btn => {
            const isActive = btn.dataset.tab === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });

        // Update panels
        const panels = this.modal.querySelectorAll('.data-panel');
        panels.forEach(panel => {
            const isActive = panel.id === `${tabId}-panel`;
            panel.classList.toggle('active', isActive);
        });

        this.currentTab = tabId;

        // Load tab-specific data
        this.loadTabData(tabId);
    }

    /**
     * Load data for specific tab
     * @param {string} tabId - Tab identifier
     */
    loadTabData(tabId) {
        switch (tabId) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'personal':
                this.loadPersonalData();
                break;
            case 'preferences':
                this.loadPreferencesData();
                break;
            case 'events':
                this.loadEventsData();
                break;
            case 'goals':
                this.loadGoalsData();
                break;
            case 'manage':
                this.loadManageData();
                break;
        }
    }

    /**
     * Refresh all data in the modal
     */
    refreshData() {
        this.loadTabData(this.currentTab);
    }

    /**
     * Load overview dashboard data
     */
    loadOverviewData() {
        const summary = this.pdm.getDataSummary();
        const data = this.pdm.getAllData();
        
        // Update summary cards with enhanced statistics
        this.updateSummaryCards(summary, data);

        // Update health indicators
        this.updateHealthIndicators(summary, data);

        // Load recent activity
        this.loadRecentActivity();

        // Add data insights
        this.generateDataInsights(data);
    }

    /**
     * Update summary cards with enhanced statistics
     * @param {Object} summary - Data summary object
     * @param {Object} data - Complete data object
     */
    updateSummaryCards(summary, data) {
        // Personal info card
        const personalCard = document.getElementById('personal-count');
        personalCard.textContent = summary.personalInfoCount;
        this.addCardTrend(personalCard.parentNode, this.calculatePersonalTrend(data));

        // Preferences card
        const preferencesCard = document.getElementById('preferences-count');
        preferencesCard.textContent = summary.preferencesCount;
        this.addCardTrend(preferencesCard.parentNode, this.calculatePreferencesTrend(data));

        // Events card
        const eventsCard = document.getElementById('events-count');
        eventsCard.textContent = summary.eventsCount;
        this.addCardTrend(eventsCard.parentNode, this.calculateEventsTrend(data));

        // Goals card
        const goalsCard = document.getElementById('goals-count');
        goalsCard.textContent = summary.goalsCount;
        this.addCardTrend(goalsCard.parentNode, this.calculateGoalsTrend(data));
    }

    /**
     * Add trend indicator to summary card
     * @param {Element} cardElement - Card element
     * @param {Object} trend - Trend data {direction, percentage, label}
     */
    addCardTrend(cardElement, trend) {
        // Remove existing trend
        const existingTrend = cardElement.querySelector('.card-trend');
        if (existingTrend) {
            existingTrend.remove();
        }

        if (!trend) return;

        const trendElement = document.createElement('div');
        trendElement.className = `card-trend trend-${trend.direction}`;
        trendElement.innerHTML = `
            <span class="trend-icon">${trend.direction === 'up' ? '↗️' : trend.direction === 'down' ? '↘️' : '➡️'}</span>
            <span class="trend-text">${trend.label}</span>
        `;
        
        cardElement.appendChild(trendElement);
    }

    /**
     * Calculate personal info trend
     * @param {Object} data - Complete data object
     * @returns {Object|null} Trend data
     */
    calculatePersonalTrend(data) {
        const recentMemories = data.memories.slice(-10);
        const personalExtractions = recentMemories.filter(m => 
            m.extractedData && m.extractedData.personal && Object.keys(m.extractedData.personal).length > 0
        );
        
        if (personalExtractions.length > 0) {
            return {
                direction: 'up',
                label: 'Recently updated'
            };
        }
        
        return null;
    }

    /**
     * Calculate preferences trend
     * @param {Object} data - Complete data object
     * @returns {Object|null} Trend data
     */
    calculatePreferencesTrend(data) {
        const recentMemories = data.memories.slice(-10);
        const preferenceExtractions = recentMemories.filter(m => 
            m.extractedData && m.extractedData.preferences && 
            (m.extractedData.preferences.likes.length > 0 || 
             m.extractedData.preferences.dislikes.length > 0 || 
             m.extractedData.preferences.favorites.length > 0)
        );
        
        if (preferenceExtractions.length > 0) {
            return {
                direction: 'up',
                label: `${preferenceExtractions.length} new this week`
            };
        }
        
        return null;
    }

    /**
     * Calculate events trend
     * @param {Object} data - Complete data object
     * @returns {Object|null} Trend data
     */
    calculateEventsTrend(data) {
        const now = new Date();
        const upcomingEvents = data.events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate > now;
        });
        
        if (upcomingEvents.length > 0) {
            return {
                direction: 'up',
                label: `${upcomingEvents.length} upcoming`
            };
        }
        
        return null;
    }

    /**
     * Calculate goals trend
     * @param {Object} data - Complete data object
     * @returns {Object|null} Trend data
     */
    calculateGoalsTrend(data) {
        const highPriorityGoals = data.goals.filter(goal => goal.priority === 'high');
        
        if (highPriorityGoals.length > 0) {
            return {
                direction: 'up',
                label: `${highPriorityGoals.length} high priority`
            };
        }
        
        return null;
    }

    /**
     * Update data health indicators
     * @param {Object} summary - Data summary object
     * @param {Object} data - Complete data object
     */
    updateHealthIndicators(summary, data) {
        // Calculate completeness (out of 6 personal fields)
        const completeness = Math.round((summary.personalInfoCount / 6) * 100);
        this.updateProgressBar('completeness', completeness);

        // Calculate recency based on last update
        const recency = this.calculateRecencyScore(summary.lastUpdated);
        this.updateProgressBar('recency', recency);

        // Calculate storage usage (assuming 1MB limit)
        const storageUsage = Math.min(100, Math.round((summary.storageSize / (1024 * 1024)) * 100));
        this.updateProgressBar('storage', storageUsage);

        // Add data quality indicators
        this.updateDataQualityIndicators(data);
    }

    /**
     * Update data quality indicators
     * @param {Object} data - Complete data object
     */
    updateDataQualityIndicators(data) {
        // Add quality indicators after existing health indicators
        const healthSection = document.querySelector('.data-health-indicators');
        
        // Remove existing quality indicators
        const existingQuality = healthSection.querySelector('.quality-indicators');
        if (existingQuality) {
            existingQuality.remove();
        }

        const qualitySection = document.createElement('div');
        qualitySection.className = 'quality-indicators';
        qualitySection.innerHTML = `
            <h4>Data Quality Metrics</h4>
            <div class="quality-metrics">
                <div class="quality-metric">
                    <span class="metric-label">Data Diversity</span>
                    <div class="metric-value">${this.calculateDataDiversity(data)}%</div>
                    <div class="metric-description">Coverage across different data types</div>
                </div>
                <div class="quality-metric">
                    <span class="metric-label">Activity Level</span>
                    <div class="metric-value">${this.calculateActivityLevel(data)}%</div>
                    <div class="metric-description">Recent data extraction activity</div>
                </div>
                <div class="quality-metric">
                    <span class="metric-label">Goal Progress</span>
                    <div class="metric-value">${this.calculateGoalProgress(data)}%</div>
                    <div class="metric-description">Active goals vs completed</div>
                </div>
            </div>
        `;
        
        healthSection.appendChild(qualitySection);
    }

    /**
     * Calculate data diversity score
     * @param {Object} data - Complete data object
     * @returns {number} Diversity score (0-100)
     */
    calculateDataDiversity(data) {
        const categories = ['personal', 'preferences', 'events', 'work', 'goals'];
        let filledCategories = 0;

        categories.forEach(category => {
            if (category === 'personal' || category === 'work') {
                const hasData = Object.values(data[category]).some(value => 
                    value !== null && value !== '' && 
                    (!Array.isArray(value) || value.length > 0)
                );
                if (hasData) filledCategories++;
            } else if (category === 'preferences') {
                const hasPrefs = data.preferences.likes.length > 0 || 
                               data.preferences.dislikes.length > 0 || 
                               data.preferences.favorites.length > 0;
                if (hasPrefs) filledCategories++;
            } else if (Array.isArray(data[category]) && data[category].length > 0) {
                filledCategories++;
            }
        });

        return Math.round((filledCategories / categories.length) * 100);
    }

    /**
     * Calculate activity level score
     * @param {Object} data - Complete data object
     * @returns {number} Activity score (0-100)
     */
    calculateActivityLevel(data) {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const recentMemories = data.memories.filter(memory => 
            new Date(memory.timestamp) > oneWeekAgo
        );
        
        // Score based on recent activity (max 10 memories per week = 100%)
        return Math.min(100, Math.round((recentMemories.length / 10) * 100));
    }

    /**
     * Calculate goal progress score
     * @param {Object} data - Complete data object
     * @returns {number} Goal progress score (0-100)
     */
    calculateGoalProgress(data) {
        if (data.goals.length === 0) return 0;
        
        const now = new Date();
        const activeGoals = data.goals.filter(goal => {
            const goalAge = (now - new Date(goal.timestamp)) / (1000 * 60 * 60 * 24);
            return goalAge < 365; // Goals less than a year old
        });
        
        if (activeGoals.length === 0) return 0;
        
        // Simple progress calculation based on goal age and priority
        const progressScore = activeGoals.reduce((total, goal) => {
            const goalAge = (now - new Date(goal.timestamp)) / (1000 * 60 * 60 * 24);
            const priorityMultiplier = goal.priority === 'high' ? 1.0 : goal.priority === 'medium' ? 0.7 : 0.4;
            const ageScore = Math.max(0, 100 - (goalAge / 30) * 10); // Decrease over 30 days
            return total + (ageScore * priorityMultiplier);
        }, 0);
        
        return Math.round(progressScore / activeGoals.length);
    }

    /**
     * Update progress bar
     * @param {string} type - Progress bar type
     * @param {number} percentage - Percentage value
     */
    updateProgressBar(type, percentage) {
        const progressBar = document.getElementById(`${type}-progress`);
        const valueSpan = document.getElementById(`${type}-value`);
        
        if (progressBar && valueSpan) {
            progressBar.style.width = `${percentage}%`;
            valueSpan.textContent = `${percentage}%`;
            
            // Color coding
            if (percentage >= 80) {
                progressBar.style.background = 'var(--color-success)';
            } else if (percentage >= 50) {
                progressBar.style.background = 'var(--color-warning)';
            } else {
                progressBar.style.background = 'var(--color-error)';
            }
        }
    }

    /**
     * Calculate recency score based on last update
     * @param {string} lastUpdated - Last update timestamp
     * @returns {number} Recency score (0-100)
     */
    calculateRecencyScore(lastUpdated) {
        if (!lastUpdated) return 0;
        
        const now = new Date();
        const updated = new Date(lastUpdated);
        const daysSince = (now - updated) / (1000 * 60 * 60 * 24);
        
        // 100% if updated today, decreasing over 30 days
        return Math.max(0, Math.round(100 - (daysSince / 30) * 100));
    }

    /**
     * Load recent activity
     */
    loadRecentActivity() {
        const activityList = document.getElementById('recent-activity-list');
        const memories = this.pdm.getAllData().memories.slice(-5).reverse();
        
        if (memories.length === 0) {
            activityList.innerHTML = '<div class="no-data">No recent activity</div>';
            return;
        }

        activityList.innerHTML = memories.map(memory => {
            const date = new Date(memory.timestamp).toLocaleDateString();
            const preview = memory.text.substring(0, 60) + (memory.text.length > 60 ? '...' : '');
            const extractedTypes = this.getExtractedDataTypes(memory.extractedData);
            
            return `
                <div class="activity-item">
                    <div class="activity-header">
                        <div class="activity-date">${date}</div>
                        <div class="activity-types">${extractedTypes}</div>
                    </div>
                    <div class="activity-text">${this.escapeHtml(preview)}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get extracted data types from memory
     * @param {Object} extractedData - Extracted data object
     * @returns {string} HTML string of data type badges
     */
    getExtractedDataTypes(extractedData) {
        if (!extractedData) return '';
        
        const types = [];
        
        if (extractedData.personal && Object.keys(extractedData.personal).length > 0) {
            types.push('<span class="data-type-badge personal">👤 Personal</span>');
        }
        if (extractedData.preferences && (
            extractedData.preferences.likes.length > 0 || 
            extractedData.preferences.dislikes.length > 0 || 
            extractedData.preferences.favorites.length > 0
        )) {
            types.push('<span class="data-type-badge preferences">❤️ Preferences</span>');
        }
        if (extractedData.events && extractedData.events.length > 0) {
            types.push('<span class="data-type-badge events">📅 Events</span>');
        }
        if (extractedData.work && Object.keys(extractedData.work).length > 0) {
            types.push('<span class="data-type-badge work">💼 Work</span>');
        }
        if (extractedData.goals && extractedData.goals.length > 0) {
            types.push('<span class="data-type-badge goals">🎯 Goals</span>');
        }
        
        return types.join(' ');
    }

    /**
     * Generate data insights
     * @param {Object} data - Complete data object
     */
    generateDataInsights(data) {
        const recentActivity = document.querySelector('.recent-activity');
        
        // Remove existing insights
        const existingInsights = recentActivity.querySelector('.data-insights');
        if (existingInsights) {
            existingInsights.remove();
        }

        const insights = this.calculateDataInsights(data);
        
        if (insights.length === 0) return;

        const insightsSection = document.createElement('div');
        insightsSection.className = 'data-insights';
        insightsSection.innerHTML = `
            <h3>💡 Data Insights</h3>
            <div class="insights-list">
                ${insights.map(insight => `
                    <div class="insight-item ${insight.type}">
                        <div class="insight-icon">${insight.icon}</div>
                        <div class="insight-content">
                            <div class="insight-title">${insight.title}</div>
                            <div class="insight-description">${insight.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        recentActivity.appendChild(insightsSection);
    }

    /**
     * Calculate data insights
     * @param {Object} data - Complete data object
     * @returns {Array} Array of insight objects
     */
    calculateDataInsights(data) {
        const insights = [];
        const now = new Date();

        // Profile completeness insight
        const personalFields = Object.values(data.personal).filter(v => v !== null && v !== '').length;
        if (personalFields < 3) {
            insights.push({
                type: 'suggestion',
                icon: '📝',
                title: 'Complete Your Profile',
                description: `Add ${6 - personalFields} more personal details to improve AI personalization.`
            });
        }

        // Upcoming events insight
        const upcomingEvents = data.events.filter(event => {
            const eventDate = new Date(event.timestamp);
            const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
            return daysUntil >= 0 && daysUntil <= 7;
        });
        
        if (upcomingEvents.length > 0) {
            insights.push({
                type: 'info',
                icon: '📅',
                title: 'Upcoming Events',
                description: `You have ${upcomingEvents.length} event${upcomingEvents.length > 1 ? 's' : ''} in the next 7 days.`
            });
        }

        // High priority goals insight
        const highPriorityGoals = data.goals.filter(goal => goal.priority === 'high');
        if (highPriorityGoals.length > 0) {
            insights.push({
                type: 'warning',
                icon: '🎯',
                title: 'High Priority Goals',
                description: `Focus on ${highPriorityGoals.length} high-priority goal${highPriorityGoals.length > 1 ? 's' : ''} you've set.`
            });
        }

        // Data activity insight
        const recentMemories = data.memories.filter(memory => {
            const memoryDate = new Date(memory.timestamp);
            const daysAgo = (now - memoryDate) / (1000 * 60 * 60 * 24);
            return daysAgo <= 7;
        });

        if (recentMemories.length === 0 && data.memories.length > 0) {
            insights.push({
                type: 'suggestion',
                icon: '💬',
                title: 'Stay Active',
                description: 'No new data extracted this week. Chat more to keep your profile updated!'
            });
        }

        // Preferences diversity insight
        const totalPreferences = data.preferences.likes.length + data.preferences.dislikes.length + data.preferences.favorites.length;
        if (totalPreferences > 20) {
            insights.push({
                type: 'success',
                icon: '⭐',
                title: 'Rich Preferences',
                description: `Great! You have ${totalPreferences} preferences recorded for better personalization.`
            });
        }

        // Storage usage insight
        const storageSize = JSON.stringify(data).length;
        const storageMB = storageSize / (1024 * 1024);
        if (storageMB > 0.8) {
            insights.push({
                type: 'warning',
                icon: '💾',
                title: 'Storage Usage High',
                description: 'Consider exporting and clearing old data to free up space.'
            });
        }

        return insights.slice(0, 3); // Limit to 3 insights
    }

    /**
     * Load personal data
     */
    loadPersonalData() {
        const data = this.pdm.getAllData();
        
        // Personal information
        const personalGrid = document.getElementById('personal-data-grid');
        if (personalGrid) {
            personalGrid.innerHTML = this.createDataGrid(data.personal, 'personal');
            console.log('Personal data loaded, buttons should be available');
        }

        // Work information
        const workGrid = document.getElementById('work-data-grid');
        if (workGrid) {
            workGrid.innerHTML = this.createDataGrid(data.work, 'work');
            console.log('Work data loaded, buttons should be available');
        }
    }

    /**
     * Create data grid HTML
     * @param {Object} data - Data object
     * @param {string} type - Data type
     * @returns {string} HTML string
     */
    createDataGrid(data, type) {
        const items = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (value && (typeof value === 'string' || Array.isArray(value))) {
                const displayValue = Array.isArray(value) ? value.join(', ') : value;
                const label = this.formatLabel(key);
                const icon = this.getFieldIcon(key, type);
                
                items.push(`
                    <div class="data-item">
                        <div class="data-item-header">
                            <span class="data-icon">${icon}</span>
                            <div class="data-label">${label}</div>
                            <div class="data-item-actions">
                                <button class="edit-data-btn" data-key="${key}" data-type="${type}" 
                                        title="Edit ${label}" aria-label="Edit ${label}">
                                    <span>✏️</span>
                                </button>
                                <button class="delete-data-btn" data-key="${key}" data-type="${type}" 
                                        title="Delete ${label}" aria-label="Delete ${label}">
                                    <span>🗑️</span>
                                </button>
                            </div>
                        </div>
                        <div class="data-value">${this.escapeHtml(displayValue)}</div>
                    </div>
                `);
            }
        }
        
        return items.length > 0 ? items.join('') : '<div class="no-data">📭 No data available</div>';
    }

    /**
     * Get appropriate icon for data field
     * @param {string} key - Field key
     * @param {string} type - Data type
     * @returns {string} Icon emoji
     */
    getFieldIcon(key, type) {
        const iconMap = {
            // Personal information icons
            'name': '👤',
            'age': '🎂',
            'location': '📍',
            'occupation': '💼',
            'email': '📧',
            'phone': '📱',
            'address': '🏠',
            'birthday': '🎉',
            'nationality': '🌍',
            'language': '🗣️',
            'languages': '🗣️',
            'education': '🎓',
            'skills': '⚡',
            'hobbies': '🎨',
            'interests': '💡',
            
            // Work information icons
            'company': '🏢',
            'position': '👔',
            'department': '🏛️',
            'salary': '💰',
            'experience': '📈',
            'manager': '👨‍💼',
            'team': '👥',
            'projects': '📋',
            'responsibilities': '📝',
            
            // Contact information
            'website': '🌐',
            'linkedin': '💼',
            'twitter': '🐦',
            'github': '💻',
            'social': '📱',
            
            // Personal details
            'gender': '⚧️',
            'marital_status': '💑',
            'children': '👶',
            'pets': '🐕',
            'height': '📏',
            'weight': '⚖️'
        };
        
        // Try exact match first
        if (iconMap[key.toLowerCase()]) {
            return iconMap[key.toLowerCase()];
        }
        
        // Try partial matches
        const lowerKey = key.toLowerCase();
        for (const [iconKey, icon] of Object.entries(iconMap)) {
            if (lowerKey.includes(iconKey) || iconKey.includes(lowerKey)) {
                return icon;
            }
        }
        
        // Default icons by type
        if (type === 'personal') return '👤';
        if (type === 'work') return '💼';
        
        return '📄'; // Default fallback
    }

    /**
     * Load preferences data
     */
    loadPreferencesData() {
        const data = this.pdm.getAllData().preferences;
        
        this.populatePreferenceList('likes', data.likes);
        this.populatePreferenceList('dislikes', data.dislikes);
        this.populatePreferenceList('favorites', data.favorites);
    }

    /**
     * Populate preference list
     * @param {string} type - Preference type
     * @param {Array} items - Preference items
     */
    populatePreferenceList(type, items) {
        const container = document.getElementById(`${type}-list`);
        
        if (items.length === 0) {
            container.innerHTML = '<div class="no-data">No preferences recorded</div>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="preference-item">
                <span class="preference-text">${this.escapeHtml(item)}</span>
                <button class="remove-preference" data-type="${type}" data-item="${this.escapeHtml(item)}" 
                        aria-label="Remove ${item}" title="Remove">×</button>
            </div>
        `).join('');

        // Add remove functionality
        container.querySelectorAll('.remove-preference').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const item = e.target.dataset.item;
                this.removePreference(type, item);
            });
        });
    }

    /**
     * Load events data
     */
    loadEventsData() {
        const events = this.pdm.getAllData().events;
        this.displayEvents(events);
    }

    /**
     * Display events
     * @param {Array} events - Events array
     */
    displayEvents(events) {
        const container = document.getElementById('events-list');
        
        if (events.length === 0) {
            container.innerHTML = '<div class="no-data">No events recorded</div>';
            return;
        }

        // Sort events by timestamp
        const sortedEvents = events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        container.innerHTML = sortedEvents.map(event => {
            const date = new Date(event.timestamp);
            const isUpcoming = date > new Date();
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            return `
                <div class="event-item ${isUpcoming ? 'upcoming' : 'past'}">
                    <div class="event-type">${this.formatLabel(event.type)}</div>
                    <div class="event-details">${this.escapeHtml(event.details)}</div>
                    <div class="event-date">${formattedDate}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Filter events by type
     * @param {string} filterType - Event type filter
     */
    filterEvents(filterType) {
        const allEvents = this.pdm.getAllData().events;
        const filteredEvents = filterType === 'all' 
            ? allEvents 
            : allEvents.filter(event => event.type === filterType);
        
        this.displayEvents(filteredEvents);
    }

    /**
     * Load goals data
     */
    loadGoalsData() {
        const goals = this.pdm.getAllData().goals;
        this.displayGoals(goals);
    }

    /**
     * Display goals
     * @param {Array} goals - Goals array
     */
    displayGoals(goals) {
        const container = document.getElementById('goals-list');
        
        if (goals.length === 0) {
            container.innerHTML = '<div class="no-data">No goals recorded</div>';
            return;
        }

        // Sort goals by priority and timestamp
        const sortedGoals = goals.sort((a, b) => {
            const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
            const priorityDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        container.innerHTML = sortedGoals.map(goal => {
            const date = new Date(goal.timestamp).toLocaleDateString();
            
            return `
                <div class="goal-item priority-${goal.priority}">
                    <div class="goal-header">
                        <div class="goal-category">${this.formatLabel(goal.category)}</div>
                        <div class="goal-priority priority-${goal.priority}">${goal.priority}</div>
                    </div>
                    <div class="goal-text">${this.escapeHtml(goal.goal)}</div>
                    <div class="goal-date">Set on ${date}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Filter goals by category
     * @param {string} filterCategory - Goal category filter
     */
    filterGoals(filterCategory) {
        const allGoals = this.pdm.getAllData().goals;
        const filteredGoals = filterCategory === 'all' 
            ? allGoals 
            : allGoals.filter(goal => goal.category === filterCategory);
        
        this.displayGoals(filteredGoals);
    }

    /**
     * Load management data
     */
    loadManageData() {
        const summary = this.pdm.getDataSummary();
        const storageInfo = document.getElementById('storage-info');
        
        const sizeInKB = Math.round(summary.storageSize / 1024);
        const lastUpdated = summary.lastUpdated 
            ? new Date(summary.lastUpdated).toLocaleString()
            : 'Never';

        storageInfo.innerHTML = `
            <div class="storage-item">
                <span class="storage-label">Total Size:</span>
                <span class="storage-value">${sizeInKB} KB</span>
            </div>
            <div class="storage-item">
                <span class="storage-label">Last Updated:</span>
                <span class="storage-value">${lastUpdated}</span>
            </div>
            <div class="storage-item">
                <span class="storage-label">Total Memories:</span>
                <span class="storage-value">${summary.memoriesCount}</span>
            </div>
            <div class="storage-item">
                <span class="storage-label">Chat History:</span>
                <span class="storage-value">${summary.chatHistoryCount} conversations</span>
            </div>
        `;
    }

    /**
     * Export data as JSON file with enhanced formatting and metadata
     */
    exportData() {
        try {
            const rawData = this.pdm.getAllData();
            const summary = this.pdm.getDataSummary();
            
            // Create enhanced export data with metadata
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: '1.0',
                    dataVersion: rawData.lastUpdated || new Date().toISOString(),
                    summary: summary,
                    source: 'Personal Data Manager'
                },
                data: rawData
            };
            
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `personal-data-backup-${timestamp}.json`;
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            // Log export for analytics
            this.logExportEvent(summary);
            
            this.showNotification(`Data exported successfully as ${filename}!`, 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    }

    /**
     * Log export event for analytics
     * @param {Object} summary - Data summary
     */
    logExportEvent(summary) {
        console.log('Data export completed:', {
            timestamp: new Date().toISOString(),
            dataSize: summary.storageSize,
            categories: {
                personal: summary.personalInfoCount,
                preferences: summary.preferencesCount,
                events: summary.eventsCount,
                goals: summary.goalsCount,
                memories: summary.memoriesCount
            }
        });
    }

    /**
     * Import data from JSON file with enhanced validation and merge strategies
     * @param {Event} event - File input change event
     */
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json')) {
            this.showNotification('Please select a valid JSON file.', 'error');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('File too large. Maximum size is 10MB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonString = e.target.result;
                const importedData = JSON.parse(jsonString);
                
                // Validate and process imported data
                const validationResult = this.validateImportData(importedData);
                if (!validationResult.isValid) {
                    this.showNotification(`Import failed: ${validationResult.error}`, 'error');
                    return;
                }

                // Show merge strategy dialog
                this.showMergeStrategyDialog(validationResult.data);
                
            } catch (error) {
                console.error('Import failed:', error);
                if (error instanceof SyntaxError) {
                    this.showNotification('Import failed. Invalid JSON format.', 'error');
                } else {
                    this.showNotification('Import failed. Please check the file format.', 'error');
                }
            }
        };
        
        reader.onerror = () => {
            this.showNotification('Failed to read file. Please try again.', 'error');
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    }

    /**
     * Validate imported data structure and content
     * @param {Object} importedData - Imported data object
     * @returns {Object} Validation result {isValid, data, error}
     */
    validateImportData(importedData) {
        try {
            let dataToImport;
            
            // Handle different export formats
            if (importedData.metadata && importedData.data) {
                // Enhanced export format
                dataToImport = importedData.data;
            } else if (importedData.personal || importedData.preferences || importedData.events) {
                // Direct data format
                dataToImport = importedData;
            } else {
                return {
                    isValid: false,
                    error: 'Unrecognized data format. Please use a valid export file.'
                };
            }

            // Validate required structure
            const requiredFields = ['personal', 'preferences', 'events', 'work', 'goals', 'memories'];
            const missingFields = requiredFields.filter(field => !(field in dataToImport));
            
            if (missingFields.length > 0) {
                return {
                    isValid: false,
                    error: `Missing required fields: ${missingFields.join(', ')}`
                };
            }

            // Validate data types
            if (typeof dataToImport.personal !== 'object' || Array.isArray(dataToImport.personal)) {
                return { isValid: false, error: 'Invalid personal data format' };
            }

            if (!dataToImport.preferences || 
                !Array.isArray(dataToImport.preferences.likes) ||
                !Array.isArray(dataToImport.preferences.dislikes) ||
                !Array.isArray(dataToImport.preferences.favorites)) {
                return { isValid: false, error: 'Invalid preferences data format' };
            }

            if (!Array.isArray(dataToImport.events)) {
                return { isValid: false, error: 'Invalid events data format' };
            }

            if (!Array.isArray(dataToImport.goals)) {
                return { isValid: false, error: 'Invalid goals data format' };
            }

            return {
                isValid: true,
                data: dataToImport,
                metadata: importedData.metadata || null
            };

        } catch (error) {
            return {
                isValid: false,
                error: 'Data validation failed: ' + error.message
            };
        }
    }

    /**
     * Show merge strategy dialog
     * @param {Object} importData - Validated import data
     */
    showMergeStrategyDialog(importData) {
        const currentData = this.pdm.getAllData();
        const conflicts = this.detectDataConflicts(currentData, importData);
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'merge-strategy-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-content">
                    <h3>Import Data</h3>
                    <p>Choose how to handle the imported data:</p>
                    
                    ${conflicts.length > 0 ? `
                        <div class="conflicts-warning">
                            <strong>⚠️ Conflicts detected:</strong>
                            <ul>
                                ${conflicts.map(conflict => `<li>${conflict}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="merge-options">
                        <button class="merge-btn replace" data-strategy="replace">
                            <strong>Replace All</strong>
                            <span>Replace current data with imported data</span>
                        </button>
                        <button class="merge-btn merge" data-strategy="merge">
                            <strong>Merge</strong>
                            <span>Combine imported data with existing data</span>
                        </button>
                        <button class="merge-btn append" data-strategy="append">
                            <strong>Append Only</strong>
                            <span>Add new data without replacing existing</span>
                        </button>
                    </div>
                    
                    <div class="dialog-actions">
                        <button class="cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Handle strategy selection
        dialog.querySelectorAll('.merge-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const strategy = e.currentTarget.dataset.strategy;
                this.executeImport(importData, strategy);
                document.body.removeChild(dialog);
            });
        });
        
        // Handle cancel
        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        // Close on overlay click
        dialog.querySelector('.dialog-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.body.removeChild(dialog);
            }
        });
    }

    /**
     * Detect conflicts between current and import data
     * @param {Object} currentData - Current data
     * @param {Object} importData - Import data
     * @returns {Array} Array of conflict descriptions
     */
    detectDataConflicts(currentData, importData) {
        const conflicts = [];
        
        // Check personal info conflicts
        const personalConflicts = Object.keys(importData.personal).filter(key => 
            currentData.personal[key] && 
            importData.personal[key] && 
            currentData.personal[key] !== importData.personal[key]
        );
        
        if (personalConflicts.length > 0) {
            conflicts.push(`Personal info conflicts: ${personalConflicts.join(', ')}`);
        }
        
        // Check preferences conflicts
        const currentPrefs = currentData.preferences.likes.length + 
                           currentData.preferences.dislikes.length + 
                           currentData.preferences.favorites.length;
        const importPrefs = importData.preferences.likes.length + 
                          importData.preferences.dislikes.length + 
                          importData.preferences.favorites.length;
        
        if (currentPrefs > 0 && importPrefs > 0) {
            conflicts.push(`${currentPrefs} existing preferences vs ${importPrefs} imported preferences`);
        }
        
        // Check events conflicts
        if (currentData.events.length > 0 && importData.events.length > 0) {
            conflicts.push(`${currentData.events.length} existing events vs ${importData.events.length} imported events`);
        }
        
        // Check goals conflicts
        if (currentData.goals.length > 0 && importData.goals.length > 0) {
            conflicts.push(`${currentData.goals.length} existing goals vs ${importData.goals.length} imported goals`);
        }
        
        return conflicts;
    }

    /**
     * Execute import with specified merge strategy
     * @param {Object} importData - Data to import
     * @param {string} strategy - Merge strategy ('replace', 'merge', 'append')
     */
    executeImport(importData, strategy) {
        try {
            let success = false;
            
            switch (strategy) {
                case 'replace':
                    success = this.pdm.importData(JSON.stringify(importData));
                    break;
                    
                case 'merge':
                    success = this.mergeImportData(importData);
                    break;
                    
                case 'append':
                    success = this.appendImportData(importData);
                    break;
                    
                default:
                    throw new Error('Invalid merge strategy');
            }
            
            if (success) {
                this.refreshData();
                this.showNotification(`Data imported successfully using ${strategy} strategy!`, 'success');
                
                // Log import event
                this.logImportEvent(importData, strategy);
            } else {
                this.showNotification('Import failed during data processing.', 'error');
            }
            
        } catch (error) {
            console.error('Import execution failed:', error);
            this.showNotification('Import failed: ' + error.message, 'error');
        }
    }

    /**
     * Merge import data with existing data
     * @param {Object} importData - Data to merge
     * @returns {boolean} Success status
     */
    mergeImportData(importData) {
        try {
            const currentData = this.pdm.getAllData();
            
            // Merge personal info (imported data takes precedence for non-null values)
            Object.keys(importData.personal).forEach(key => {
                if (importData.personal[key] !== null && importData.personal[key] !== '') {
                    currentData.personal[key] = importData.personal[key];
                }
            });
            
            // Merge preferences (combine arrays, remove duplicates)
            ['likes', 'dislikes', 'favorites'].forEach(type => {
                const combined = [...currentData.preferences[type], ...importData.preferences[type]];
                currentData.preferences[type] = [...new Set(combined)];
            });
            
            // Merge events (combine arrays, remove duplicates based on type, details, and timestamp)
            const combinedEvents = [...currentData.events];
            importData.events.forEach(importEvent => {
                const isDuplicate = combinedEvents.some(existing => 
                    existing.type === importEvent.type &&
                    existing.details === importEvent.details &&
                    Math.abs(new Date(existing.timestamp) - new Date(importEvent.timestamp)) < 60000
                );
                if (!isDuplicate) {
                    combinedEvents.push(importEvent);
                }
            });
            currentData.events = combinedEvents;
            
            // Merge work info
            Object.keys(importData.work).forEach(key => {
                if (Array.isArray(importData.work[key])) {
                    const combined = [...(currentData.work[key] || []), ...importData.work[key]];
                    currentData.work[key] = [...new Set(combined)];
                } else if (importData.work[key] !== null && importData.work[key] !== '') {
                    currentData.work[key] = importData.work[key];
                }
            });
            
            // Merge goals (combine arrays, remove duplicates based on goal text and category)
            const combinedGoals = [...currentData.goals];
            importData.goals.forEach(importGoal => {
                const isDuplicate = combinedGoals.some(existing => 
                    existing.goal.toLowerCase() === importGoal.goal.toLowerCase() &&
                    existing.category === importGoal.category
                );
                if (!isDuplicate) {
                    combinedGoals.push(importGoal);
                }
            });
            currentData.goals = combinedGoals;
            
            // Merge memories (combine arrays, remove duplicates based on text and timestamp)
            const combinedMemories = [...currentData.memories];
            importData.memories.forEach(importMemory => {
                const isDuplicate = combinedMemories.some(existing => 
                    existing.text === importMemory.text &&
                    Math.abs(new Date(existing.timestamp) - new Date(importMemory.timestamp)) < 1000
                );
                if (!isDuplicate) {
                    combinedMemories.push(importMemory);
                }
            });
            currentData.memories = combinedMemories.slice(-this.pdm.maxMemories); // Respect memory limit
            
            // Update data and save
            this.pdm.data = currentData;
            return this.pdm.saveData();
            
        } catch (error) {
            console.error('Merge failed:', error);
            return false;
        }
    }

    /**
     * Append import data to existing data (only add new items)
     * @param {Object} importData - Data to append
     * @returns {boolean} Success status
     */
    appendImportData(importData) {
        try {
            const currentData = this.pdm.getAllData();
            
            // Append preferences (only new items)
            ['likes', 'dislikes', 'favorites'].forEach(type => {
                importData.preferences[type].forEach(item => {
                    if (!currentData.preferences[type].includes(item)) {
                        currentData.preferences[type].push(item);
                    }
                });
            });
            
            // Append events (only new items)
            importData.events.forEach(importEvent => {
                const isDuplicate = currentData.events.some(existing => 
                    existing.type === importEvent.type &&
                    existing.details === importEvent.details &&
                    Math.abs(new Date(existing.timestamp) - new Date(importEvent.timestamp)) < 60000
                );
                if (!isDuplicate) {
                    currentData.events.push(importEvent);
                }
            });
            
            // Append goals (only new items)
            importData.goals.forEach(importGoal => {
                const isDuplicate = currentData.goals.some(existing => 
                    existing.goal.toLowerCase() === importGoal.goal.toLowerCase() &&
                    existing.category === importGoal.category
                );
                if (!isDuplicate) {
                    currentData.goals.push(importGoal);
                }
            });
            
            // Update data and save
            this.pdm.data = currentData;
            return this.pdm.saveData();
            
        } catch (error) {
            console.error('Append failed:', error);
            return false;
        }
    }

    /**
     * Log import event for analytics
     * @param {Object} importData - Imported data
     * @param {string} strategy - Merge strategy used
     */
    logImportEvent(importData, strategy) {
        console.log('Data import completed:', {
            timestamp: new Date().toISOString(),
            strategy: strategy,
            importedCategories: {
                personal: Object.keys(importData.personal).length,
                preferences: importData.preferences.likes.length + 
                           importData.preferences.dislikes.length + 
                           importData.preferences.favorites.length,
                events: importData.events.length,
                goals: importData.goals.length,
                memories: importData.memories.length
            }
        });
    }

    /**
     * Clear data by category with enhanced selection dialog
     */
    clearCategory() {
        this.showCategoryClearDialog();
    }

    /**
     * Show category selection dialog for clearing data
     */
    showCategoryClearDialog() {
        const data = this.pdm.getAllData();
        const categories = [
            { 
                id: 'personal', 
                name: 'Personal Information', 
                icon: '👤',
                count: Object.values(data.personal).filter(v => v !== null && v !== '').length,
                description: 'Name, age, location, occupation, contact details'
            },
            { 
                id: 'preferences', 
                name: 'Preferences', 
                icon: '❤️',
                count: data.preferences.likes.length + data.preferences.dislikes.length + data.preferences.favorites.length,
                description: 'Likes, dislikes, and favorites'
            },
            { 
                id: 'events', 
                name: 'Events & Appointments', 
                icon: '📅',
                count: data.events.length,
                description: 'Meetings, deadlines, and scheduled events'
            },
            { 
                id: 'goals', 
                name: 'Goals & Aspirations', 
                icon: '🎯',
                count: data.goals.length,
                description: 'Personal and professional goals'
            },
            { 
                id: 'work', 
                name: 'Work Information', 
                icon: '💼',
                count: Object.values(data.work).filter(v => 
                    v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)
                ).length,
                description: 'Company, position, colleagues, projects'
            },
            { 
                id: 'memories', 
                name: 'Conversation Memories', 
                icon: '💭',
                count: data.memories.length,
                description: 'Extracted data from past conversations'
            },
            { 
                id: 'chatHistory', 
                name: 'Chat History', 
                icon: '💬',
                count: data.chatHistory ? data.chatHistory.length : 0,
                description: 'Stored conversation history'
            }
        ];

        const dialog = document.createElement('div');
        dialog.className = 'category-clear-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-content">
                    <h3>🗑️ Clear Data by Category</h3>
                    <p>Select which category of data you want to clear. This action cannot be undone.</p>
                    
                    <div class="category-list">
                        ${categories.map(category => `
                            <div class="category-option ${category.count === 0 ? 'disabled' : ''}" 
                                 data-category="${category.id}" 
                                 ${category.count === 0 ? 'title="No data in this category"' : ''}>
                                <div class="category-header">
                                    <span class="category-icon">${category.icon}</span>
                                    <span class="category-name">${category.name}</span>
                                    <span class="category-count">${category.count} items</span>
                                </div>
                                <div class="category-description">${category.description}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="dialog-actions">
                        <button class="cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Handle category selection
        dialog.querySelectorAll('.category-option:not(.disabled)').forEach(option => {
            option.addEventListener('click', (e) => {
                const categoryId = e.currentTarget.dataset.category;
                const category = categories.find(c => c.id === categoryId);
                document.body.removeChild(dialog);
                this.confirmCategoryClear(category);
            });
        });
        
        // Handle cancel
        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        // Close on overlay click
        dialog.querySelector('.dialog-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.body.removeChild(dialog);
            }
        });
    }

    /**
     * Show confirmation dialog for category clearing
     * @param {Object} category - Category to clear
     */
    confirmCategoryClear(category) {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-clear-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-content">
                    <div class="warning-icon">⚠️</div>
                    <h3>Clear ${category.name}?</h3>
                    <p>You are about to permanently delete <strong>${category.count} items</strong> from your ${category.name.toLowerCase()}.</p>
                    <p class="warning-text">This action cannot be undone. Are you sure you want to continue?</p>
                    
                    <div class="dialog-actions">
                        <button class="cancel-btn">Cancel</button>
                        <button class="confirm-clear-btn danger">Clear ${category.name}</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Handle confirmation
        dialog.querySelector('.confirm-clear-btn').addEventListener('click', () => {
            document.body.removeChild(dialog);
            this.executeCategoryClear(category.id);
        });
        
        // Handle cancel
        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        // Close on overlay click
        dialog.querySelector('.dialog-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.body.removeChild(dialog);
            }
        });
    }

    /**
     * Execute category clearing
     * @param {string} categoryId - Category ID to clear
     */
    executeCategoryClear(categoryId) {
        try {
            const data = this.pdm.getAllData();
            let itemsCleared = 0;
            
            switch (categoryId) {
                case 'personal':
                    itemsCleared = Object.values(data.personal).filter(v => v !== null && v !== '').length;
                    data.personal = {
                        name: null,
                        age: null,
                        location: null,
                        occupation: null,
                        email: null,
                        phone: null
                    };
                    break;
                    
                case 'preferences':
                    itemsCleared = data.preferences.likes.length + 
                                 data.preferences.dislikes.length + 
                                 data.preferences.favorites.length;
                    data.preferences = { likes: [], dislikes: [], favorites: [] };
                    break;
                    
                case 'events':
                    itemsCleared = data.events.length;
                    data.events = [];
                    break;
                    
                case 'goals':
                    itemsCleared = data.goals.length;
                    data.goals = [];
                    break;
                    
                case 'work':
                    itemsCleared = Object.values(data.work).filter(v => 
                        v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)
                    ).length;
                    data.work = {
                        company: null,
                        position: null,
                        colleagues: [],
                        projects: []
                    };
                    break;
                    
                case 'memories':
                    itemsCleared = data.memories.length;
                    data.memories = [];
                    break;
                    
                case 'chatHistory':
                    itemsCleared = data.chatHistory ? data.chatHistory.length : 0;
                    data.chatHistory = [];
                    break;
                    
                default:
                    throw new Error('Invalid category');
            }
            
            // Save updated data
            this.pdm.data = data;
            this.pdm.saveData();
            
            this.refreshData();
            this.showNotification(`${itemsCleared} items cleared from ${categoryId}!`, 'success');
            
            // Log clearing event
            this.logClearEvent(categoryId, itemsCleared);
            
        } catch (error) {
            console.error('Clear category failed:', error);
            this.showNotification('Failed to clear category data.', 'error');
        }
    }

    /**
     * Clear all data with enhanced confirmation
     */
    clearAllData() {
        this.showClearAllDialog();
    }

    /**
     * Show clear all data confirmation dialog
     */
    showClearAllDialog() {
        const summary = this.pdm.getDataSummary();
        const totalItems = summary.personalInfoCount + 
                          summary.preferencesCount + 
                          summary.eventsCount + 
                          summary.goalsCount + 
                          summary.memoriesCount + 
                          summary.chatHistoryCount;

        const dialog = document.createElement('div');
        dialog.className = 'clear-all-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-content">
                    <div class="danger-icon">🚨</div>
                    <h3>Clear ALL Personal Data</h3>
                    <p>You are about to permanently delete <strong>ALL</strong> of your personal data.</p>
                    
                    <div class="data-summary">
                        <h4>This will delete:</h4>
                        <ul>
                            <li>${summary.personalInfoCount} personal details</li>
                            <li>${summary.preferencesCount} preferences</li>
                            <li>${summary.eventsCount} events and appointments</li>
                            <li>${summary.goalsCount} goals and aspirations</li>
                            <li>${summary.memoriesCount} conversation memories</li>
                            <li>${summary.chatHistoryCount} chat history entries</li>
                        </ul>
                        <div class="total-items">
                            <strong>Total: ${totalItems} items</strong>
                        </div>
                    </div>
                    
                    <div class="warning-box">
                        <strong>⚠️ This action cannot be undone!</strong>
                        <p>Consider exporting your data first as a backup.</p>
                    </div>
                    
                    <div class="confirmation-steps">
                        <label class="confirmation-checkbox">
                            <input type="checkbox" id="understand-permanent">
                            <span>I understand this action is permanent and cannot be undone</span>
                        </label>
                        <label class="confirmation-checkbox">
                            <input type="checkbox" id="confirm-delete-all">
                            <span>I want to delete ALL my personal data</span>
                        </label>
                    </div>
                    
                    <div class="dialog-actions">
                        <button class="cancel-btn">Cancel</button>
                        <button class="export-first-btn secondary">Export First</button>
                        <button class="confirm-clear-all-btn danger" disabled>Delete Everything</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Handle checkbox validation
        const checkboxes = dialog.querySelectorAll('input[type="checkbox"]');
        const confirmBtn = dialog.querySelector('.confirm-clear-all-btn');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                confirmBtn.disabled = !allChecked;
            });
        });
        
        // Handle actions
        dialog.querySelector('.confirm-clear-all-btn').addEventListener('click', () => {
            document.body.removeChild(dialog);
            this.executeClearAll();
        });
        
        dialog.querySelector('.export-first-btn').addEventListener('click', () => {
            this.exportData();
            // Keep dialog open so user can still clear after export
        });
        
        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        // Close on overlay click
        dialog.querySelector('.dialog-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.body.removeChild(dialog);
            }
        });
    }

    /**
     * Execute clear all data
     */
    executeClearAll() {
        try {
            const summary = this.pdm.getDataSummary();
            const totalItems = summary.personalInfoCount + 
                              summary.preferencesCount + 
                              summary.eventsCount + 
                              summary.goalsCount + 
                              summary.memoriesCount + 
                              summary.chatHistoryCount;
            
            this.pdm.clearAllData();
            this.refreshData();
            this.showNotification(`All data cleared! ${totalItems} items deleted.`, 'success');
            
            // Log clear all event
            this.logClearEvent('all', totalItems);
            
        } catch (error) {
            console.error('Clear all data failed:', error);
            this.showNotification('Failed to clear all data.', 'error');
        }
    }

    /**
     * Log data clearing event
     * @param {string} category - Category cleared or 'all'
     * @param {number} itemCount - Number of items cleared
     */
    logClearEvent(category, itemCount) {
        console.log('Data clearing completed:', {
            timestamp: new Date().toISOString(),
            category: category,
            itemsCleared: itemCount,
            action: category === 'all' ? 'clear_all' : 'clear_category'
        });
    }

    /**
     * Remove a specific preference
     * @param {string} type - Preference type
     * @param {string} item - Preference item
     */
    removePreference(type, item) {
        try {
            this.pdm.removePreference(type, item);
            this.loadPreferencesData();
            this.showNotification('Preference removed successfully!', 'success');
        } catch (error) {
            console.error('Remove preference failed:', error);
            this.showNotification('Failed to remove preference.', 'error');
        }
    }

    /**
     * Show notification message
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `data-notification ${type}`;
        notification.textContent = message;
        
        // Add to modal
        this.modal.querySelector('.data-modal-container').appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Format label for display
     * @param {string} key - Data key
     * @returns {string} Formatted label
     */
    formatLabel(key) {
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Open full-screen editor for data item
     * @param {string} key - Data key
     * @param {string} type - Data type
     */
    openFullScreenEditor(key, type) {
        const data = this.pdm.getAllData();
        const currentValue = data[type][key];
        const label = this.formatLabel(key);
        const icon = this.getFieldIcon(key, type);

        // Create full-screen editor
        const editor = document.createElement('div');
        editor.className = 'fullscreen-editor-overlay';
        editor.innerHTML = `
            <div class="fullscreen-editor">
                <div class="editor-header">
                    <div class="editor-title">
                        <span class="editor-icon">${icon}</span>
                        <h2>Edit ${label}</h2>
                    </div>
                    <div class="editor-actions">
                        <button class="editor-btn secondary" id="cancel-edit">Cancel</button>
                        <button class="editor-btn primary" id="save-edit">Save Changes</button>
                    </div>
                </div>
                <div class="editor-body">
                    <div class="editor-field">
                        <label for="edit-value">Value:</label>
                        <textarea id="edit-value" class="editor-input" rows="4" placeholder="Enter ${label.toLowerCase()}...">${this.escapeHtml(currentValue || '')}</textarea>
                    </div>
                    <div class="editor-info">
                        <div class="info-item">
                            <strong>Field:</strong> ${label}
                        </div>
                        <div class="info-item">
                            <strong>Category:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}
                        </div>
                        <div class="info-item">
                            <strong>Last Updated:</strong> ${new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to document
        document.body.appendChild(editor);
        
        // Focus on input
        const input = editor.querySelector('#edit-value');
        input.focus();
        input.select();

        // Event listeners
        editor.querySelector('#cancel-edit').addEventListener('click', () => {
            document.body.removeChild(editor);
        });

        editor.querySelector('#save-edit').addEventListener('click', () => {
            const newValue = input.value.trim();
            if (newValue) {
                this.updateDataItem(key, type, newValue);
                document.body.removeChild(editor);
                this.refreshCurrentTab();
            }
        });

        // Close on Escape
        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(editor);
            }
        });

        // Close on overlay click
        editor.addEventListener('click', (e) => {
            if (e.target === editor) {
                document.body.removeChild(editor);
            }
        });
    }

    /**
     * Update data item
     * @param {string} key - Data key
     * @param {string} type - Data type
     * @param {string} value - New value
     */
    updateDataItem(key, type, value) {
        const data = this.pdm.getAllData();
        data[type][key] = value;
        
        // Save updated data
        this.pdm.saveData(data);
        
        // Show success notification
        this.showNotification(`✅ ${this.formatLabel(key)} updated successfully!`, 'success');
    }

    /**
     * Delete data item
     * @param {string} key - Data key
     * @param {string} type - Data type
     */
    deleteDataItem(key, type) {
        const label = this.formatLabel(key);
        
        // Create confirmation dialog
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog-overlay';
        dialog.innerHTML = `
            <div class="confirmation-dialog">
                <div class="dialog-header">
                    <h3>🗑️ Delete ${label}</h3>
                </div>
                <div class="dialog-body">
                    <p>Are you sure you want to delete this information?</p>
                    <div class="delete-item-preview">
                        <strong>${label}:</strong> ${this.escapeHtml(this.pdm.getAllData()[type][key] || '')}
                    </div>
                    <p class="warning-text">⚠️ This action cannot be undone.</p>
                </div>
                <div class="dialog-actions">
                    <button class="dialog-btn secondary" id="cancel-delete">Cancel</button>
                    <button class="dialog-btn danger" id="confirm-delete">Delete</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Event listeners
        dialog.querySelector('#cancel-delete').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.querySelector('#confirm-delete').addEventListener('click', () => {
            const data = this.pdm.getAllData();
            delete data[type][key];
            this.pdm.saveData(data);
            
            document.body.removeChild(dialog);
            this.refreshCurrentTab();
            this.showNotification(`🗑️ ${label} deleted successfully!`, 'success');
        });

        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });
    }

    /**
     * Refresh current tab data
     */
    refreshCurrentTab() {
        switch (this.currentTab) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'personal':
                this.loadPersonalData();
                break;
            case 'preferences':
                this.loadPreferencesData();
                break;
            case 'events':
                this.loadEventsData();
                break;
            case 'goals':
                this.loadGoalsData();
                break;
        }
    }

    /**
     * Show notification message
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Position at top of screen
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#10b981';
                break;
            case 'error':
                notification.style.background = '#ef4444';
                break;
            default:
                notification.style.background = '#6366f1';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Open dialog to add new data item
     * @param {string} type - Data type (personal, work, etc.)
     */
    openAddNewDialog(type) {
        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
        
        // Create add new dialog
        const dialog = document.createElement('div');
        dialog.className = 'fullscreen-editor-overlay';
        dialog.innerHTML = `
            <div class="fullscreen-editor">
                <div class="editor-header">
                    <div class="editor-title">
                        <span class="editor-icon">➕</span>
                        <h2>Add New ${typeLabel} Information</h2>
                    </div>
                    <div class="editor-actions">
                        <button class="editor-btn secondary" id="cancel-add">Cancel</button>
                        <button class="editor-btn primary" id="save-add">Add Information</button>
                    </div>
                </div>
                <div class="editor-body">
                    <div class="editor-field">
                        <label for="add-field-name">Field Name:</label>
                        <input type="text" id="add-field-name" class="editor-input-text" placeholder="e.g., Phone, Address, Skills..." />
                    </div>
                    <div class="editor-field">
                        <label for="add-field-value">Value:</label>
                        <textarea id="add-field-value" class="editor-input" rows="4" placeholder="Enter the information..."></textarea>
                    </div>
                    <div class="editor-info">
                        <div class="info-item">
                            <strong>Category:</strong> ${typeLabel}
                        </div>
                        <div class="info-item">
                            <strong>Examples:</strong> ${this.getFieldExamples(type)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
        
        // Focus on field name input
        const fieldNameInput = dialog.querySelector('#add-field-name');
        fieldNameInput.focus();

        // Event listeners
        dialog.querySelector('#cancel-add').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.querySelector('#save-add').addEventListener('click', () => {
            const fieldName = fieldNameInput.value.trim();
            const fieldValue = dialog.querySelector('#add-field-value').value.trim();
            
            if (fieldName && fieldValue) {
                this.addNewDataItem(fieldName, type, fieldValue);
                document.body.removeChild(dialog);
                this.refreshCurrentTab();
            } else {
                this.showNotification('⚠️ Please fill in both field name and value', 'error');
            }
        });

        // Close on Escape
        dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(dialog);
            }
        });

        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });
    }

    /**
     * Add new data item
     * @param {string} fieldName - Field name
     * @param {string} type - Data type
     * @param {string} value - Field value
     */
    addNewDataItem(fieldName, type, value) {
        const data = this.pdm.getAllData();
        const key = fieldName.toLowerCase().replace(/\s+/g, '_');
        
        data[type][key] = value;
        this.pdm.saveData(data);
        
        this.showNotification(`✅ ${fieldName} added successfully!`, 'success');
    }

    /**
     * Get field examples for a data type
     * @param {string} type - Data type
     * @returns {string} Examples string
     */
    getFieldExamples(type) {
        const examples = {
            personal: 'Name, Age, Location, Phone, Email, Birthday, Hobbies',
            work: 'Company, Position, Department, Manager, Skills, Experience'
        };
        
        return examples[type] || 'Custom field';
    }
}
