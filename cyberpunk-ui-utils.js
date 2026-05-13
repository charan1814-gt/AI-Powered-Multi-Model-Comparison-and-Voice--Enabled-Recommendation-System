/**
 * Cyberpunk UI Utilities
 * Helper functions for implementing cyberpunk UI effects
 */

// ====================================
// Message Display Functions
// ====================================

/**
 * Show error message with styling
 * @param {string} message - Error message to display
 * @param {number} duration - Duration in ms (0 = permanent)
 */
function showErrorNotification(message, duration = 5000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<strong> Error:</strong> ${message}`;
    errorDiv.style.marginBottom = 'var(--spacing-md)';
    
    const container = document.querySelector('main') || document.body;
    container.insertBefore(errorDiv, container.firstChild);
    
    if (duration > 0) {
        setTimeout(() => errorDiv.remove(), duration);
    }
    
    return errorDiv;
}

/**
 * Show success message with styling
 * @param {string} message - Success message to display
 * @param {number} duration - Duration in ms (0 = permanent)
 */
function showSuccessNotification(message, duration = 5000) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<strong> Success:</strong> ${message}`;
    successDiv.style.marginBottom = 'var(--spacing-md)';
    
    const container = document.querySelector('main') || document.body;
    container.insertBefore(successDiv, container.firstChild);
    
    if (duration > 0) {
        setTimeout(() => successDiv.remove(), duration);
    }
    
    return successDiv;
}

/**
 * Show warning message with styling
 * @param {string} message - Warning message to display
 * @param {number} duration - Duration in ms (0 = permanent)
 */
function showWarningNotification(message, duration = 5000) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'warning-message';
    warningDiv.innerHTML = `<strong> Warning:</strong> ${message}`;
    warningDiv.style.marginBottom = 'var(--spacing-md)';
    
    const container = document.querySelector('main') || document.body;
    container.insertBefore(warningDiv, container.firstChild);
    
    if (duration > 0) {
        setTimeout(() => warningDiv.remove(), duration);
    }
    
    return warningDiv;
}

// ====================================
// Glow Effects
// ====================================

/**
 * Add glow effect to element
 * @param {HTMLElement} element - Element to add glow to
 * @param {string} color - Glow color ('primary', 'secondary', 'accent')
 * @param {number} intensity - Glow intensity (5-50)
 */
function addGlowEffect(element, color = 'primary', intensity = 20) {
    const colorMap = {
        'primary': 'rgba(255, 0, 110, 0.3)',
        'secondary': 'rgba(0, 217, 255, 0.3)',
        'accent': 'rgba(255, 222, 0, 0.2)'
    };
    
    const glowColor = colorMap[color] || colorMap['primary'];
    element.style.boxShadow = `0 0 ${intensity}px ${glowColor}`;
    element.style.transition = 'all 0.3s ease';
}

/**
 * Add pulsing glow animation
 * @param {HTMLElement} element - Element to animate
 * @param {string} color - Animation color ('primary', 'secondary', 'accent')
 */
function addPulsingGlow(element, color = 'primary') {
    const animationName = `glow-pulse-${color}-${Date.now()}`;
    const colorMap = {
        'primary': 'rgba(255, 0, 110, 0.2)',
        'secondary': 'rgba(0, 217, 255, 0.2)',
        'accent': 'rgba(255, 222, 0, 0.2)'
    };
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ${animationName} {
            0%, 100% { box-shadow: 0 0 20px ${colorMap[color]}; }
            50% { box-shadow: 0 0 40px ${colorMap[color]}; }
        }
    `;
    document.head.appendChild(style);
    
    element.style.animation = `${animationName} 2s ease-in-out infinite`;
}

/**
 * Remove pulsing glow animation
 * @param {HTMLElement} element - Element to remove animation from
 */
function removePulsingGlow(element) {
    element.style.animation = 'none';
}

// ====================================
// Interactive Effects
// ====================================

/**
 * Add hover glow effect to element
 * @param {HTMLElement} element - Element to add hover effect to
 * @param {string} defaultColor - Default glow color
 * @param {string} hoverColor - Hover glow color
 */
function addHoverGlowEffect(element, defaultColor = 'primary', hoverColor = 'secondary') {
    const colorMap = {
        'primary': { glow: 'rgba(255, 0, 110, 0.2)', borderColor: '#ff006e' },
        'secondary': { glow: 'rgba(0, 217, 255, 0.3)', borderColor: '#00d9ff' },
        'accent': { glow: 'rgba(255, 222, 0, 0.2)', borderColor: '#ffde00' }
    };
    
    const defaultStyle = colorMap[defaultColor];
    const hoverStyle = colorMap[hoverColor];
    
    element.style.transition = 'all 0.3s ease';
    element.style.boxShadow = `0 0 20px ${defaultStyle.glow}`;
    
    element.addEventListener('mouseenter', () => {
        element.style.boxShadow = `0 0 30px ${hoverStyle.glow}`;
        if (element.style.borderColor !== 'undefined') {
            element.style.borderColor = hoverStyle.borderColor;
        }
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.boxShadow = `0 0 20px ${defaultStyle.glow}`;
        if (element.dataset.borderColor) {
            element.style.borderColor = element.dataset.borderColor;
        }
    });
}

// ====================================
// Text Effects
// ====================================

/**
 * Add glow text effect
 * @param {HTMLElement} element - Element with text to glow
 * @param {string} color - Glow color ('primary', 'secondary', 'accent')
 * @param {number} blur - Blur amount (5-30)
 */
function addTextGlow(element, color = 'primary', blur = 10) {
    const colorMap = {
        'primary': 'rgba(255, 0, 110, 0.3)',
        'secondary': 'rgba(0, 217, 255, 0.3)',
        'accent': 'rgba(255, 222, 0, 0.3)'
    };
    
    const glowColor = colorMap[color] || colorMap['primary'];
    element.style.textShadow = `0 0 ${blur}px ${glowColor}`;
}

/**
 * Add letter spacing to element
 * @param {HTMLElement} element - Element to add spacing to
 * @param {number} spacing - Spacing in px (1-3)
 */
function addLetterSpacing(element, spacing = 2) {
    element.style.letterSpacing = `${spacing}px`;
}

/**
 * Add text transform
 * @param {HTMLElement} element - Element to transform
 * @param {string} transform - Transform type ('uppercase', 'lowercase', 'capitalize')
 */
function addTextTransform(element, transform = 'uppercase') {
    element.style.textTransform = transform;
}

// ====================================
// Card Effects
// ====================================

/**
 * Create a glowing card
 * @param {string} content - HTML content of card
 * @param {string} glowColor - Glow color ('primary', 'secondary', 'accent')
 * @returns {HTMLElement} - Card element
 */
function createGlowingCard(content, glowColor = 'primary') {
    const card = document.createElement('div');
    card.className = 'glowing-card';
    card.innerHTML = content;
    
    const colorMap = {
        'primary': { border: '#ff006e', glow: 'rgba(255, 0, 110, 0.2)' },
        'secondary': { border: '#00d9ff', glow: 'rgba(0, 217, 255, 0.2)' },
        'accent': { border: '#ffde00', glow: 'rgba(255, 222, 0, 0.2)' }
    };
    
    const style = colorMap[glowColor];
    card.style.cssText = `
        background: var(--card-bg);
        border: 2px solid ${style.border};
        padding: var(--spacing-md);
        border-radius: var(--radius-lg);
        box-shadow: 0 0 20px ${style.glow};
        transition: all 0.3s ease;
    `;
    
    addHoverGlowEffect(card, glowColor === 'primary' ? 'primary' : 'secondary');
    
    return card;
}

// ====================================
// Button Effects
// ====================================

/**
 * Convert button to cyberpunk style
 * @param {HTMLElement} button - Button element
 * @param {string} type - Button type ('primary', 'secondary')
 */
function styleCyberpunkButton(button, type = 'primary') {
    button.classList.remove('btn', 'btn-primary', 'btn-secondary');
    button.classList.add('btn', `btn-${type}`);
}

/**
 * Add button ripple effect (optional advanced effect)
 * @param {HTMLElement} button - Button element
 */
function addRippleEffect(button) {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
}

// ====================================
// Radial Menu
// ====================================

/**
 * Create radial menu with items positioned in circle
 * @param {Array<Object>} items - Array of items with {icon, label, action}
 * @returns {HTMLElement} - Menu container
 */
function createRadialMenu(items) {
    const container = document.createElement('div');
    container.className = 'radial-menu';
    container.style.position = 'relative';
    container.style.width = '300px';
    container.style.height = '300px';
    container.style.margin = 'var(--spacing-xl) auto';
    
    // Center button
    const center = document.createElement('div');
    center.className = 'radial-menu-center';
    center.innerHTML = '';
    container.appendChild(center);
    
    // Position items in circle
    const itemCount = items.length;
    const angleSlice = (2 * Math.PI) / itemCount;
    const radius = 100;
    
    items.forEach((item, index) => {
        const angle = angleSlice * index;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        const itemEl = document.createElement('div');
        itemEl.className = 'radial-menu-item';
        itemEl.innerHTML = item.label;
        itemEl.style.left = `calc(50% + ${x}px)`;
        itemEl.style.top = `calc(50% + ${y}px)`;
        itemEl.style.transform = 'translate(-50%, -50%)';
        
        if (item.action) {
            itemEl.addEventListener('click', item.action);
        }
        
        container.appendChild(itemEl);
    });
    
    return container;
}

// ====================================
// Utility Functions
// ====================================

/**
 * Get CSS variable value
 * @param {string} varName - Variable name (with or without --)
 * @returns {string} - CSS variable value
 */
function getCSSVariable(varName) {
    const cleanName = varName.startsWith('--') ? varName : `--${varName}`;
    return getComputedStyle(document.documentElement).getPropertyValue(cleanName).trim();
}

/**
 * Set CSS variable value
 * @param {string} varName - Variable name
 * @param {string} value - New value
 */
function setCSSVariable(varName, value) {
    const cleanName = varName.startsWith('--') ? varName : `--${varName}`;
    document.documentElement.style.setProperty(cleanName, value);
}

/**
 * Toggle dark mode (if you add light theme later)
 */
function toggleTheme() {
    const html = document.documentElement;
    html.style.filter = html.style.filter === 'invert(1)' ? 'invert(0)' : 'invert(1)';
}

// ====================================
// Initialize Cyberpunk Effects
// ====================================

/**
 * Auto-apply cyberpunk effects to common elements
 */
function initializeCyberpunkUI() {
    // Add glow to all buttons
    document.querySelectorAll('button').forEach(btn => {
        const type = btn.classList.contains('btn-primary') ? 'primary' : 'secondary';
        addHoverGlowEffect(btn, type);
    });
    
    // Add glow to all cards
    document.querySelectorAll('.response-card, .metric-card, .recommendation-card').forEach(card => {
        addGlowEffect(card, 'primary', 20);
    });
    
    // Add text glow to section headers
    document.querySelectorAll('h2, h3').forEach(header => {
        if (header.parentElement.classList.contains('section-header')) {
            addTextGlow(header, 'primary', 10);
        }
    });
    
    console.log(' Cyberpunk UI Initialized!');
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCyberpunkUI);
} else {
    initializeCyberpunkUI();
}

// Export for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showErrorNotification,
        showSuccessNotification,
        showWarningNotification,
        addGlowEffect,
        addPulsingGlow,
        removePulsingGlow,
        addHoverGlowEffect,
        addTextGlow,
        addLetterSpacing,
        addTextTransform,
        createGlowingCard,
        styleCyberpunkButton,
        addRippleEffect,
        createRadialMenu,
        getCSSVariable,
        setCSSVariable,
        toggleTheme,
        initializeCyberpunkUI
    };
}
