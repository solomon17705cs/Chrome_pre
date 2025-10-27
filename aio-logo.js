/**
 * AIO Logo Component
 * Creates a modern, scalable logo for the AIO (All-In-One) Assistant
 */

class AIOLogo {
    constructor(options = {}) {
        this.size = options.size || 'normal'; // normal, compact, mini
        this.theme = options.theme || 'light'; // light, dark
        this.animated = options.animated || false;
        this.showSubtitle = options.showSubtitle !== false;
    }

    /**
     * Generate the SVG logo
     */
    createSVG() {
        return `
            <svg class="aio-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="aioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="aioGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#7c3aed;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#0891b2;stop-opacity:1" />
                    </linearGradient>
                    <filter id="aioglow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                <!-- Outer circle -->
                <circle cx="50" cy="50" r="45" 
                        fill="url(#${this.theme === 'dark' ? 'aioGradientDark' : 'aioGradient'})" 
                        filter="${this.animated ? 'url(#aioglow)' : 'none'}"
                        opacity="0.9"/>
                
                <!-- Inner geometric pattern representing "All-In-One" -->
                <!-- A -->
                <path d="M 25 35 L 30 20 L 35 35 M 27 30 L 33 30" 
                      stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
                
                <!-- I -->
                <line x1="45" y1="20" x2="45" y2="35" 
                      stroke="white" stroke-width="3" stroke-linecap="round"/>
                <line x1="42" y1="20" x2="48" y2="20" 
                      stroke="white" stroke-width="2" stroke-linecap="round"/>
                <line x1="42" y1="35" x2="48" y2="35" 
                      stroke="white" stroke-width="2" stroke-linecap="round"/>
                
                <!-- O -->
                <circle cx="65" cy="27.5" r="7.5" 
                        stroke="white" stroke-width="3" fill="none"/>
                
                <!-- Connection lines representing integration -->
                <path d="M 35 40 Q 50 45 65 40" 
                      stroke="white" stroke-width="2" fill="none" opacity="0.7"/>
                
                <!-- Bottom integration symbol -->
                <g transform="translate(50, 55)">
                    <!-- Hexagon representing connectivity -->
                    <polygon points="-8,0 -4,-7 4,-7 8,0 4,7 -4,7" 
                             fill="white" opacity="0.9"/>
                    <!-- Inner dot -->
                    <circle cx="0" cy="0" r="2" fill="url(#${this.theme === 'dark' ? 'aioGradientDark' : 'aioGradient'})"/>
                    
                    <!-- Connection nodes -->
                    <circle cx="-12" cy="-8" r="1.5" fill="white" opacity="0.8"/>
                    <circle cx="12" cy="-8" r="1.5" fill="white" opacity="0.8"/>
                    <circle cx="-12" cy="8" r="1.5" fill="white" opacity="0.8"/>
                    <circle cx="12" cy="8" r="1.5" fill="white" opacity="0.8"/>
                    
                    <!-- Connection lines -->
                    <line x1="-8" y1="0" x2="-12" y2="-8" stroke="white" stroke-width="1" opacity="0.6"/>
                    <line x1="8" y1="0" x2="12" y2="-8" stroke="white" stroke-width="1" opacity="0.6"/>
                    <line x1="-8" y1="0" x2="-12" y2="8" stroke="white" stroke-width="1" opacity="0.6"/>
                    <line x1="8" y1="0" x2="12" y2="8" stroke="white" stroke-width="1" opacity="0.6"/>
                </g>
                
                ${this.animated ? `
                    <animateTransform attributeName="transform" type="rotate" 
                                    values="0 50 50;360 50 50" dur="20s" repeatCount="indefinite"/>
                ` : ''}
            </svg>
        `;
    }

    /**
     * Create the complete logo HTML
     */
    render() {
        const classes = [
            'aio-logo',
            this.size === 'compact' ? 'aio-logo-compact' : '',
            this.size === 'mini' ? 'aio-logo-mini' : '',
            this.theme === 'dark' ? 'aio-logo-dark' : '',
            this.animated ? 'aio-logo-animated' : ''
        ].filter(Boolean).join(' ');

        return `
            <div class="${classes}">
                <div class="aio-logo-icon">
                    ${this.createSVG()}
                </div>
                <div class="aio-logo-content">
                    <div class="aio-logo-text">AIO</div>
                    ${this.showSubtitle && this.size === 'normal' ? 
                        '<div class="aio-logo-subtitle">All-In-One Assistant</div>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * Create and insert logo into DOM element
     */
    insertInto(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.innerHTML = this.render();
        }
    }

    /**
     * Create a favicon version
     */
    createFavicon() {
        return `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
                    </linearGradient>
                </defs>
                
                <circle cx="50" cy="50" r="45" fill="url(#faviconGradient)"/>
                
                <!-- Simplified AIO text for favicon -->
                <text x="50" y="60" font-family="Arial, sans-serif" font-size="28" 
                      font-weight="bold" text-anchor="middle" fill="white">AIO</text>
                
                <!-- Small connectivity symbol -->
                <polygon points="50,25 45,30 55,30" fill="white" opacity="0.8"/>
                <circle cx="50" cy="32" r="2" fill="white"/>
            </svg>
        `;
    }
}

// Utility functions for easy logo creation
window.createAIOLogo = function(options = {}) {
    return new AIOLogo(options);
};

window.insertAIOLogo = function(selector, options = {}) {
    const logo = new AIOLogo(options);
    logo.insertInto(selector);
};

// Auto-replace existing logos on page load
document.addEventListener('DOMContentLoaded', function() {
    // Replace header titles with AIO logo
    const headerTitles = document.querySelectorAll('.header-title');
    headerTitles.forEach(title => {
        if (title.textContent.includes('AI Assistant') || title.textContent.includes('Assistant')) {
            const logo = new AIOLogo({ size: 'compact' });
            title.innerHTML = logo.render();
            title.style.display = 'flex';
            title.style.alignItems = 'center';
        }
    });
    
    // Add favicon if not present
    if (!document.querySelector('link[rel="icon"]')) {
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/svg+xml';
        const logo = new AIOLogo();
        favicon.href = 'data:image/svg+xml;base64,' + btoa(logo.createFavicon());
        document.head.appendChild(favicon);
    }
});