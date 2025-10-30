/**
 * Personal Data Storage and Retrieval System
 * Core PersonalDataManager class for managing user personal data
 */

class PersonalDataManager {
    constructor() {
        this.storageKey = 'personalDataStorage';
        this.maxMemories = 100;
        this.maxChatHistory = 50;
        
        // Initialize data structure
        this.defaultData = {
            personal: {
                name: null,
                age: null,
                location: null,
                occupation: null,
                email: null,
                phone: null
            },
            preferences: {
                likes: [],
                dislikes: [],
                favorites: []
            },
            events: [],
            work: {
                company: null,
                position: null,
                colleagues: [],
                projects: []
            },
            family: {
                spouse: null,
                children: [],
                parents: []
            },
            health: {
                conditions: [],
                medications: [],
                allergies: []
            },
            goals: [],
            memories: [],
            chatHistory: [],
            lastUpdated: null
        };
        
        // Load existing data or initialize with defaults
        this.data = this.loadData();
    }

    /**
     * Load data from localStorage with error handling
     * @returns {Object} Loaded data or default structure
     */
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Validate and merge with default structure to ensure all properties exist
                return this.validateAndMergeData(parsed);
            }
        } catch (error) {
            console.warn('Failed to load personal data from localStorage:', error);
        }
        
        return { ...this.defaultData };
    }

    /**
     * Save data to localStorage with error handling
     * @returns {boolean} Success status
     */
    saveData() {
        try {
            this.data.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Failed to save personal data to localStorage:', error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldData();
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
                    return true;
                } catch (retryError) {
                    console.error('Failed to save data even after cleanup:', retryError);
                }
            }
            return false;
        }
    }

    /**
     * Validate and merge loaded data with default structure
     * @param {Object} loadedData - Data loaded from storage
     * @returns {Object} Validated and merged data
     */
    validateAndMergeData(loadedData) {
        const merged = { ...this.defaultData };
        
        if (loadedData && typeof loadedData === 'object') {
            // Merge each section while maintaining structure
            Object.keys(merged).forEach(key => {
                if (loadedData[key] !== undefined) {
                    if (typeof merged[key] === 'object' && !Array.isArray(merged[key])) {
                        merged[key] = { ...merged[key], ...loadedData[key] };
                    } else {
                        merged[key] = loadedData[key];
                    }
                }
            });
        }
        
        return merged;
    }

    /**
     * Sanitize string input to prevent XSS and ensure data quality
     * @param {string} input - Input string to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeString(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/\s+/g, ' ') // Normalize whitespace
            .substring(0, 500); // Limit length
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone number to validate
     * @returns {boolean} Is valid phone number
     */
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Clean up old data to manage storage size
     */
    cleanupOldData() {
        // Remove oldest memories if exceeding limit
        if (this.data.memories.length > this.maxMemories) {
            this.data.memories = this.data.memories
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, this.maxMemories);
        }
        
        // Remove oldest chat history if exceeding limit
        if (this.data.chatHistory.length > this.maxChatHistory) {
            this.data.chatHistory = this.data.chatHistory
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, this.maxChatHistory);
        }
        
        // Remove events older than 1 year
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        this.data.events = this.data.events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate > oneYearAgo;
        });
    }

    /**
     * Get all stored personal data
     * @returns {Object} Complete personal data object
     */
    getAllData() {
        return { ...this.data };
    }

    /**
     * Update personal information
     * @param {Object} personalInfo - Personal information to update
     * @returns {boolean} Success status
     */
    updatePersonalInfo(personalInfo) {
        try {
            if (personalInfo.name) {
                this.data.personal.name = this.sanitizeString(personalInfo.name);
            }
            if (personalInfo.age) {
                const age = parseInt(personalInfo.age);
                if (age > 0 && age < 150) {
                    this.data.personal.age = age.toString();
                }
            }
            if (personalInfo.location) {
                this.data.personal.location = this.sanitizeString(personalInfo.location);
            }
            if (personalInfo.occupation) {
                this.data.personal.occupation = this.sanitizeString(personalInfo.occupation);
            }
            if (personalInfo.email && this.isValidEmail(personalInfo.email)) {
                this.data.personal.email = personalInfo.email.toLowerCase().trim();
            }
            if (personalInfo.phone && this.isValidPhone(personalInfo.phone)) {
                this.data.personal.phone = personalInfo.phone.replace(/\s/g, '');
            }
            
            return this.saveData();
        } catch (error) {
            console.error('Failed to update personal info:', error);
            return false;
        }
    }

    /**
     * Add preference (like, dislike, or favorite)
     * @param {string} type - Type of preference ('likes', 'dislikes', 'favorites')
     * @param {string} item - Preference item to add
     * @returns {boolean} Success status
     */
    addPreference(type, item) {
        try {
            if (!['likes', 'dislikes', 'favorites'].includes(type)) {
                return false;
            }
            
            const sanitizedItem = this.sanitizeString(item);
            if (!sanitizedItem) return false;
            
            // Prevent duplicates
            if (!this.data.preferences[type].includes(sanitizedItem)) {
                this.data.preferences[type].push(sanitizedItem);
                return this.saveData();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to add preference:', error);
            return false;
        }
    }

    /**
     * Remove preference
     * @param {string} type - Type of preference ('likes', 'dislikes', 'favorites')
     * @param {string} item - Preference item to remove
     * @returns {boolean} Success status
     */
    removePreference(type, item) {
        try {
            if (!['likes', 'dislikes', 'favorites'].includes(type)) {
                return false;
            }
            
            const index = this.data.preferences[type].indexOf(item);
            if (index > -1) {
                this.data.preferences[type].splice(index, 1);
                return this.saveData();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to remove preference:', error);
            return false;
        }
    }

    /**
     * Add event
     * @param {Object} event - Event object {type, details, timestamp, text}
     * @returns {boolean} Success status
     */
    addEvent(event) {
        try {
            const sanitizedEvent = {
                type: this.sanitizeString(event.type),
                details: this.sanitizeString(event.details),
                timestamp: event.timestamp || new Date().toISOString(),
                text: this.sanitizeString(event.text || '')
            };
            
            // Prevent duplicate events
            const isDuplicate = this.data.events.some(existing => 
                existing.type === sanitizedEvent.type &&
                existing.details === sanitizedEvent.details &&
                Math.abs(new Date(existing.timestamp) - new Date(sanitizedEvent.timestamp)) < 60000 // Within 1 minute
            );
            
            if (!isDuplicate) {
                this.data.events.push(sanitizedEvent);
                return this.saveData();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to add event:', error);
            return false;
        }
    }

    /**
     * Add goal
     * @param {Object} goal - Goal object {goal, category, priority, timestamp, text}
     * @returns {boolean} Success status
     */
    addGoal(goal) {
        try {
            const sanitizedGoal = {
                goal: this.sanitizeString(goal.goal),
                category: goal.category || 'general',
                priority: goal.priority || 'medium',
                timestamp: goal.timestamp || new Date().toISOString(),
                text: this.sanitizeString(goal.text || '')
            };
            
            // Prevent duplicate goals
            const isDuplicate = this.data.goals.some(existing => 
                existing.goal === sanitizedGoal.goal ||
                (existing.goal.toLowerCase().includes(sanitizedGoal.goal.toLowerCase()) && 
                 existing.category === sanitizedGoal.category)
            );
            
            if (!isDuplicate && sanitizedGoal.goal) {
                this.data.goals.push(sanitizedGoal);
                return this.saveData();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to add goal:', error);
            return false;
        }
    }

    /**
     * Update work information
     * @param {Object} workInfo - Work information to update
     * @returns {boolean} Success status
     */
    updateWorkInfo(workInfo) {
        try {
            if (workInfo.company) {
                this.data.work.company = this.sanitizeString(workInfo.company);
            }
            if (workInfo.position) {
                this.data.work.position = this.sanitizeString(workInfo.position);
            }
            if (workInfo.colleagues && Array.isArray(workInfo.colleagues)) {
                workInfo.colleagues.forEach(colleague => {
                    const sanitizedColleague = this.sanitizeString(colleague);
                    if (sanitizedColleague && !this.data.work.colleagues.includes(sanitizedColleague)) {
                        this.data.work.colleagues.push(sanitizedColleague);
                    }
                });
            }
            if (workInfo.projects && Array.isArray(workInfo.projects)) {
                workInfo.projects.forEach(project => {
                    const sanitizedProject = this.sanitizeString(project);
                    if (sanitizedProject && !this.data.work.projects.includes(sanitizedProject)) {
                        this.data.work.projects.push(sanitizedProject);
                    }
                });
            }
            
            return this.saveData();
        } catch (error) {
            console.error('Failed to update work info:', error);
            return false;
        }
    }

    /**
     * Add memory (extracted data from conversation)
     * @param {Object} memory - Memory object {text, timestamp, extractedData}
     * @returns {boolean} Success status
     */
    addMemory(memory) {
        try {
            const sanitizedMemory = {
                text: this.sanitizeString(memory.text),
                timestamp: memory.timestamp || new Date().toISOString(),
                extractedData: memory.extractedData || {}
            };
            
            this.data.memories.push(sanitizedMemory);
            
            // Cleanup if exceeding limit
            if (this.data.memories.length > this.maxMemories) {
                this.cleanupOldData();
            }
            
            return this.saveData();
        } catch (error) {
            console.error('Failed to add memory:', error);
            return false;
        }
    }

    /**
     * Main extraction method that processes a user message and extracts all types of data
     * @param {string} userMessage - User message to analyze
     * @returns {Object|null} Extracted data object or null if nothing found
     */
    extractAndStore(userMessage) {
        if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
            return null;
        }

        const extractedData = {
            personal: {},
            preferences: { likes: [], dislikes: [], favorites: [] },
            events: [],
            work: {},
            goals: [],
            hasData: false
        };

        try {
            // Extract personal information
            const personalInfo = this.extractPersonalInfo(userMessage);
            if (Object.keys(personalInfo).length > 0) {
                extractedData.personal = personalInfo;
                extractedData.hasData = true;
                
                // Store personal information
                this.updatePersonalInfo(personalInfo);
            }

            // Extract preferences
            const preferences = this.extractPreferences(userMessage);
            if (preferences.likes.length > 0 || preferences.dislikes.length > 0 || preferences.favorites.length > 0) {
                extractedData.preferences = preferences;
                extractedData.hasData = true;
                
                // Store preferences
                preferences.likes.forEach(like => this.addPreference('likes', like));
                preferences.dislikes.forEach(dislike => this.addPreference('dislikes', dislike));
                preferences.favorites.forEach(favorite => this.addPreference('favorites', favorite));
            }

            // Extract events
            const events = this.extractEvents(userMessage);
            if (events.length > 0) {
                extractedData.events = events;
                extractedData.hasData = true;
                
                // Store events with conflict checking
                events.forEach(event => {
                    const conflicts = this.checkEventConflicts(event);
                    if (conflicts.length > 0) {
                        console.warn('Event conflict detected:', event, 'conflicts with:', conflicts);
                        // Still add the event but could notify user
                    }
                    this.addEvent(event);
                });
            }

            // Extract work-related information
            const workInfo = this.extractWorkInfo(userMessage);
            if (Object.keys(workInfo).length > 0) {
                extractedData.work = workInfo;
                extractedData.hasData = true;
                
                // Store work information
                this.updateWorkInfo(workInfo);
            }

            // Extract goals and aspirations
            const goals = this.extractGoals(userMessage);
            if (goals.length > 0) {
                extractedData.goals = goals;
                extractedData.hasData = true;
                
                // Store goals
                goals.forEach(goal => this.addGoal(goal));
            }

            // Add to memories if any data was extracted
            if (extractedData.hasData) {
                this.addMemory({
                    text: userMessage,
                    timestamp: new Date().toISOString(),
                    extractedData: extractedData
                });

                return extractedData;
            }

            return null;
        } catch (error) {
            console.error('Error in extractAndStore:', error);
            return null;
        }
    }

    /**
     * Extract personal information from user message
     * @param {string} message - User message to analyze
     * @returns {Object} Extracted personal information
     */
    extractPersonalInfo(message) {
        const extracted = {};
        const lowerMessage = message.toLowerCase();
        
        // Name extraction patterns
        const namePatterns = [
            /(?:my name is|myself|This is|this is|i'm|i am|call me|i go by)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i,
            /(?:i'm|i am)\s+([a-zA-Z]+)(?:\s|,|\.)/i
        ];
        
        for (const pattern of namePatterns) {
            const match = message.match(pattern);
            if (match && match[1] && match[1].length > 1) {
                const name = match[1].trim();
                // Avoid common false positives
                if (!['going', 'working', 'living', 'thinking', 'feeling', 'looking', 'trying'].includes(name.toLowerCase())) {
                    extracted.name = name;
                    break;
                }
            }
        }
        
        // Age extraction patterns
        const agePatterns = [
            /(?:i'm|i am|im |my age is|i'm about)\s+(\d+)\s*(?:years old|years|yrs old|yrs)?/i,
            /(?:age|aged)\s+(\d+)/i
        ];
        
        for (const pattern of agePatterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                const age = parseInt(match[1]);
                if (age >= 13 && age <= 120) { // Reasonable age range
                    extracted.age = age.toString();
                    break;
                }
            }
        }
        
        // Location extraction patterns
        const locationPatterns = [
            /(?:i live in|i'm from|im form|i'm from|i'm in|i'm based in|located in|i'm currently in)\s+([a-zA-Z\s,]+?)(?:\.|,|$|\s+(?:and|but|so|because))/i,
            /(?:from|in)\s+([A-Z][a-zA-Z\s,]+?)(?:\.|,|$|\s+(?:and|but|so|because))/
        ];
        
        for (const pattern of locationPatterns) {
            const match = message.match(pattern);
            if (match && match[1] && match[1].trim().length > 2) {
                const location = match[1].trim().replace(/,$/, '');
                // Filter out common false positives
                if (!['bed', 'love', 'trouble', 'pain', 'school', 'work'].includes(location.toLowerCase())) {
                    extracted.location = location;
                    break;
                }
            }
        }
        
        // Occupation extraction patterns
        const occupationPatterns = [
            /(?:i work as|hobby|i'm a|im a|i am a|my job is|i work in|my profession is|my career is)\s+(?:a\s+)?([a-zA-Z\s]+?)(?:\.|,|$|\s+(?:and|but|so|at|in))/i,
            /(?:i'm|i am)\s+(?:a\s+)?([a-zA-Z\s]+?)(?:\s+(?:by|at|in|for)\s+)/i
        ];
        
        for (const pattern of occupationPatterns) {
            const match = message.match(pattern);
            if (match && match[1] && match[1].trim().length > 2) {
                const occupation = match[1].trim();
                // Filter out common false positives
                if (!['person', 'human', 'guy', 'girl', 'man', 'woman', 'student at', 'working at'].includes(occupation.toLowerCase())) {
                    extracted.occupation = occupation;
                    break;
                }
            }
        }
        
        // Email extraction patterns
        const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const emailMatches = message.match(emailPattern);
        if (emailMatches && emailMatches.length > 0) {
            const email = emailMatches[0];
            if (this.isValidEmail(email)) {
                extracted.email = email.toLowerCase();
            }
        }
        
        // Phone number extraction patterns
        const phonePatterns = [
            /(?:my phone|my number|call me at|reach me at|phone number is)\s*:?\s*([\+]?[\d\s\-\(\)]{10,})/i,
            /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/
        ];
        
        for (const pattern of phonePatterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                const phone = match[1].trim();
                if (this.isValidPhone(phone)) {
                    extracted.phone = phone.replace(/\s/g, '');
                    break;
                }
            }
        }
        
        return extracted;
    }

    /**
     * Extract preferences and opinions from user message
     * @param {string} message - User message to analyze
     * @returns {Object} Extracted preferences {likes: [], dislikes: [], favorites: []}
     */
    extractPreferences(message) {
        const extracted = {
            likes: [],
            dislikes: [],
            favorites: []
        };
        
        // Likes patterns
        const likePatterns = [
            /(?:i like|goal|i love|i enjoy|i'm into|i prefer|i'm fond of|i adore)\s+([^.!?]+?)(?:\.|!|\?|$|,\s*(?:and|but|because|so))/gi,
            /(?:i really like|i absolutely love|i'm passionate about)\s+([^.!?]+?)(?:\.|!|\?|$|,\s*(?:and|but|because|so))/gi,
            /([^.!?]+?)\s+(?:is|are)\s+(?:great|amazing|awesome|fantastic|wonderful|my favorite)/gi
        ];
        
        for (const pattern of likePatterns) {
            let match;
            while ((match = pattern.exec(message)) !== null) {
                if (match[1] && match[1].trim().length > 1) {
                    const preference = this.cleanPreference(match[1].trim());
                    if (preference && !this.isDuplicatePreference(extracted.likes, preference)) {
                        extracted.likes.push(preference);
                    }
                }
            }
        }
        
        // Dislikes patterns
        const dislikePatterns = [
            /(?:i hate|i dislike|i don't like|i can't stand|i despise|i'm not into|i'm not fond of)\s+([^.!?]+?)(?:\.|!|\?|$|,\s*(?:and|but|because|so))/gi,
            /(?:i really hate|i absolutely hate|i strongly dislike)\s+([^.!?]+?)(?:\.|!|\?|$|,\s*(?:and|but|because|so))/gi,
            /([^.!?]+?)\s+(?:is|are)\s+(?:terrible|awful|horrible|disgusting|annoying)/gi
        ];
        
        for (const pattern of dislikePatterns) {
            let match;
            while ((match = pattern.exec(message)) !== null) {
                if (match[1] && match[1].trim().length > 1) {
                    const preference = this.cleanPreference(match[1].trim());
                    if (preference && !this.isDuplicatePreference(extracted.dislikes, preference)) {
                        extracted.dislikes.push(preference);
                    }
                }
            }
        }
        
        // Favorites patterns
        const favoritePatterns = [
            /(?:my favorite|my favourite)\s+([^.!?]+?)(?:\s+(?:is|are)\s+([^.!?]+?))?(?:\.|!|\?|$|,\s*(?:and|but|because|so))/gi,
            /([^.!?]+?)\s+(?:is|are)\s+my\s+(?:favorite|favourite)/gi,
            /(?:i prefer|i'd rather have|i'd choose)\s+([^.!?]+?)(?:\s+over\s+[^.!?]+?)?(?:\.|!|\?|$|,\s*(?:and|but|because|so))/gi
        ];
        
        for (const pattern of favoritePatterns) {
            let match;
            while ((match = pattern.exec(message)) !== null) {
                // Handle both "my favorite X is Y" and "Y is my favorite"
                const preference = match[2] || match[1];
                if (preference && preference.trim().length > 1) {
                    const cleanedPreference = this.cleanPreference(preference.trim());
                    if (cleanedPreference && !this.isDuplicatePreference(extracted.favorites, cleanedPreference)) {
                        extracted.favorites.push(cleanedPreference);
                    }
                }
            }
        }
        
        return extracted;
    }

    /**
     * Clean and validate preference text
     * @param {string} preference - Raw preference text
     * @returns {string|null} Cleaned preference or null if invalid
     */
    cleanPreference(preference) {
        if (!preference || typeof preference !== 'string') return null;
        
        // Remove common filler words and clean up
        let cleaned = preference
            .toLowerCase()
            .replace(/^(a|an|the|some|any|)\s+/, '') // Remove articles
            .replace(/\s+(a lot|very much|so much|really|quite|pretty|very)$/, '') // Remove intensity modifiers
            .trim();
        
        // Filter out too short or common false positives
        if (cleaned.length < 2 || 
            ['it', 'that', 'this', 'them', 'they', 'he', 'she', 'we', 'you', 'me', 'i'].includes(cleaned) ||
            cleaned.includes('when') || cleaned.includes('where') || cleaned.includes('how')) {
            return null;
        }
        
        // Capitalize first letter
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    /**
     * Check if preference already exists in array (case-insensitive)
     * @param {Array} preferences - Array of existing preferences
     * @param {string} newPreference - New preference to check
     * @returns {boolean} True if duplicate exists
     */
    isDuplicatePreference(preferences, newPreference) {
        return preferences.some(existing => 
            existing.toLowerCase() === newPreference.toLowerCase() ||
            existing.toLowerCase().includes(newPreference.toLowerCase()) ||
            newPreference.toLowerCase().includes(existing.toLowerCase())
        );
    }

    /**
     * Extract work-related information from user message
     * @param {string} message - User message to analyze
     * @returns {Object} Extracted work information {company, position, colleagues, projects}
     */
    extractWorkInfo(message) {
        // Simplified work extraction - just return empty for now
        return {};
    }

    /**
     * Extract events and appointments from user message
     * @param {string} message - User message to analyze
     * @returns {Array} Array of extracted events
     */
    extractEvents(message) {
        // Simplified event extraction - just return empty for now
        return [];
    }

    /**
     * Extract goals and aspirations from user message
     * @param {string} message - User message to analyze
     * @returns {Array} Array of extracted goals
     */
    extractGoals(message) {
        // Simplified goal extraction - just return empty for now
        return [];
    }

    /**
     * Check for event conflicts (events within 1 hour of each other)
     * @param {Object} newEvent - New event to check for conflicts
     * @returns {Array} Array of conflicting events
     */
    checkEventConflicts(newEvent) {
        return [];
    }

    /**
     * Clear all stored data
     * @returns {boolean} Success status
     */
    clearAllData() {
        try {
            this.data = { ...this.defaultData };
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to clear all data:', error);
            return false;
        }
    }

    /**
     * Export data as JSON string
     * @returns {string} JSON string of all data
     */
    exportData() {
        try {
            return JSON.stringify(this.data, null, 2);
        } catch (error) {
            console.error('Failed to export data:', error);
            return null;
        }
    }

    /**
     * Import data from JSON string
     * @param {string} jsonData - JSON string to import
     * @returns {boolean} Success status
     */
    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            this.data = this.validateAndMergeData(importedData);
            return this.saveData();
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    /**
     * Get data summary for dashboard
     * @returns {Object} Summary statistics
     */
    getDataSummary() {
        return {
            personalInfoCount: Object.values(this.data.personal).filter(v => v !== null && v !== '').length,
            preferencesCount: this.data.preferences.likes.length + this.data.preferences.dislikes.length + this.data.preferences.favorites.length,
            eventsCount: this.data.events.length,
            goalsCount: this.data.goals.length,
            memoriesCount: this.data.memories.length,
            chatHistoryCount: this.data.chatHistory.length,
            lastUpdated: this.data.lastUpdated,
            storageSize: JSON.stringify(this.data).length
        };
    }

    /**
     * Generate contextual information for AI prompts based on stored personal data
     * @param {string} currentMessage - Current user message for topic-based filtering
     * @param {number} maxLength - Maximum context length in characters (default: 1000)
     * @returns {string} Formatted context string
     */
    generateContext(currentMessage = '', maxLength = 1000) {
        try {
            const contextParts = [];
            
            // Add personal information if available
            const personal = this.data.personal;
            if (personal.name) {
                contextParts.push(`name: ${personal.name}`);
            }
            if (personal.occupation) {
                contextParts.push(`occupation: ${personal.occupation}`);
            }
            if (personal.location) {
                contextParts.push(`location: ${personal.location}`);
            }
            
            // Add some preferences if available
            if (this.data.preferences.likes.length > 0) {
                const likes = this.data.preferences.likes.slice(0, 3).join(', ');
                contextParts.push(`likes: ${likes}`);
            }
            
            if (this.data.preferences.favorites.length > 0) {
                const favorites = this.data.preferences.favorites.slice(0, 2).join(', ');
                contextParts.push(`favorites: ${favorites}`);
            }
            
            if (contextParts.length === 0) {
                return '';
            }
            
            const contextString = `Personal context: ${contextParts.join('; ')}`;
            
            // Truncate if too long
            if (contextString.length > maxLength) {
                return contextString.substring(0, maxLength - 3) + '...';
            }
            
            return contextString;
        } catch (error) {
            console.error('Error generating context:', error);
            return '';
        }
    }

    /**
     * Inject personal context into user message for AI processing
     * @param {string} message - Original user message
     * @param {string} context - Personal context to inject
     * @returns {string} Enhanced message with context
     */
    injectContext(message, context) {
        if (!context || context.trim().length === 0) {
            return message;
        }
        
        return `${context}\n\nUser message: ${message}`;
    }

    /**
     * Store chat history for future context generation
     * @param {string} userMessage - User's message
     * @param {string} assistantResponse - Assistant's response
     * @param {Object} extractedData - Any data extracted from the conversation
     * @returns {boolean} Success status
     */
    storeChatHistory(userMessage, assistantResponse, extractedData = null) {
        try {
            const chatEntry = {
                timestamp: new Date().toISOString(),
                userMessage: this.sanitizeString(userMessage),
                assistantResponse: this.sanitizeString(assistantResponse),
                extractedData: extractedData
            };
            
            this.data.chatHistory.push(chatEntry);
            
            // Cleanup if exceeding limit
            if (this.data.chatHistory.length > this.maxChatHistory) {
                this.cleanupOldData();
            }
            
            return this.saveData();
        } catch (error) {
            console.error('Failed to store chat history:', error);
            return false;
        }
    }

    /**
     * Update work information
     * @param {Object} workInfo - Work information to update
     * @returns {boolean} Success status
     */
    updateWorkInfo(workInfo) {
        try {
            if (workInfo.company) {
                this.data.work.company = this.sanitizeString(workInfo.company);
            }
            if (workInfo.position) {
                this.data.work.position = this.sanitizeString(workInfo.position);
            }
            if (workInfo.colleagues && Array.isArray(workInfo.colleagues)) {
                workInfo.colleagues.forEach(colleague => {
                    const sanitized = this.sanitizeString(colleague);
                    if (sanitized && !this.data.work.colleagues.includes(sanitized)) {
                        this.data.work.colleagues.push(sanitized);
                    }
                });
            }
            if (workInfo.projects && Array.isArray(workInfo.projects)) {
                workInfo.projects.forEach(project => {
                    const sanitized = this.sanitizeString(project);
                    if (sanitized && !this.data.work.projects.includes(sanitized)) {
                        this.data.work.projects.push(sanitized);
                    }
                });
            }
            
            return this.saveData();
        } catch (error) {
            console.error('Failed to update work info:', error);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersonalDataManager;
}