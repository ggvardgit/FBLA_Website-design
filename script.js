// Main shared JavaScript for APUSH Learning Hub
// Handles navigation, theme toggle, and common functionality

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initMotionToggle();
    initModals();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
    }
}

// Theme toggle (Dark mode)
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme, themeIcon);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme, themeIcon);
        });
    }
}

function updateThemeIcon(theme, iconElement) {
    if (iconElement) {
        iconElement.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Reduced motion toggle
function initMotionToggle() {
    const motionToggle = document.querySelector('.motion-toggle');
    
    // Check for saved preference
    const reducedMotion = localStorage.getItem('reducedMotion') === 'true';
    if (reducedMotion) {
        document.documentElement.setAttribute('data-reduced-motion', 'true');
    }
    
    if (motionToggle) {
        motionToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-reduced-motion');
            const newValue = current === 'true' ? 'false' : 'true';
            
            document.documentElement.setAttribute('data-reduced-motion', newValue);
            localStorage.setItem('reducedMotion', newValue);
        });
    }
}

// Modal functionality
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const modalCloses = document.querySelectorAll('.modal-close');
    
    modals.forEach(modal => {
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal(modal);
            }
        });
    });
    
    modalCloses.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        // Focus first focusable element
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

// Utility function to get user progress from localStorage
function getUserProgress() {
    const progress = localStorage.getItem('userProgress');
    return progress ? JSON.parse(progress) : {
        periods: {},
        skills: {},
        practiceQuestions: 0,
        studyHours: 0,
        activities: []
    };
}

// Utility function to save user progress
function saveUserProgress(progress) {
    localStorage.setItem('userProgress', JSON.stringify(progress));
}

// Utility function to update progress
function updateProgress(period, skill, value) {
    const progress = getUserProgress();
    
    if (!progress.periods[period]) {
        progress.periods[period] = { mastery: 0, completed: false };
    }
    
    if (skill) {
        if (!progress.skills[skill]) {
            progress.skills[skill] = 0;
        }
        progress.skills[skill] = value;
    }
    
    saveUserProgress(progress);
    return progress;
}

// Calculate overall mastery percentage
function calculateOverallMastery() {
    const progress = getUserProgress();
    const periods = Object.keys(progress.periods);
    
    if (periods.length === 0) return 0;
    
    const totalMastery = periods.reduce((sum, period) => {
        return sum + (progress.periods[period].mastery || 0);
    }, 0);
    
    return Math.round(totalMastery / periods.length);
}

// Format date for display
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format time for display
function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Export functions for use in other scripts
window.APUSH = {
    openModal,
    closeModal,
    getUserProgress,
    saveUserProgress,
    updateProgress,
    calculateOverallMastery,
    formatDate,
    formatTime
};
