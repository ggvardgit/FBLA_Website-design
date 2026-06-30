// Main shared JavaScript for APUSH Learning Hub
// Handles navigation, theme toggle, and common functionality

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.AuthManager !== 'undefined' && typeof window.AuthManager.init === 'function') {
        window.AuthManager.init();
    }
    applyGlobalAccessibility();
    initNavigation();
    initThemeToggle();
    syncAuthThemeToggles();
    initMotionToggle();
    initLiquidGlassSystem();
    initModals();
    setTimeout(() => {
        if (typeof updateNavigation === 'function') updateNavigation();
        syncAuthThemeToggles();
    }, 100);
    // Re-apply when Supabase restores session asynchronously
    window.addEventListener('apush:session-restored', () => {
        applyGlobalAccessibility();
        if (typeof updateNavigation === 'function') updateNavigation();
        syncAuthThemeToggles();
    });
    window.addEventListener('apush:login', syncAuthThemeToggles);
    window.addEventListener('apush:logout', syncAuthThemeToggles);
    window.addEventListener('apush:app-shell-revealed', syncAuthThemeToggles);
});

// Apply reduced motion, high contrast, font size, primary hue globally (guest + auth)
function applyGlobalAccessibility() {
    const isAuth = window.AuthManager && window.AuthManager.isAuthenticated();
    let reducedMotion = false, highContrast = false, fontSize = 'medium', primaryHue = 217;
    if (isAuth) {
        const s = window.AuthManager.getCurrentUserSettings();
        if (s) {
            reducedMotion = s.reducedMotion || false;
            highContrast = s.highContrast || false;
            fontSize = s.fontSize || 'medium';
            primaryHue = s.primaryHue !== undefined ? s.primaryHue : 217;
        }
    } else {
        // Guests use local preference storage from settings modal/page.
        reducedMotion = localStorage.getItem('reducedMotion') === 'true';
        highContrast = localStorage.getItem('highContrast') === 'true';
        fontSize = localStorage.getItem('fontSize') || 'medium';
        const savedHue = Number(localStorage.getItem('primaryHue'));
        if (Number.isFinite(savedHue)) primaryHue = savedHue;
    }
    if (reducedMotion) document.documentElement.setAttribute('data-reduced-motion', 'true');
    else document.documentElement.removeAttribute('data-reduced-motion');
    if (highContrast) document.documentElement.setAttribute('data-high-contrast', 'true');
    else document.documentElement.removeAttribute('data-high-contrast');
    document.documentElement.setAttribute('data-font-size', fontSize || 'medium');
    document.documentElement.style.setProperty('--primary-color', `hsl(${primaryHue}, 70%, 50%)`);
    document.documentElement.style.setProperty('--primary-hover', `hsl(${primaryHue}, 70%, 40%)`);
}

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
    const reactThemeRoot = document.querySelector('[data-theme-toggler-root]');
    const themeToggle = document.querySelector('.theme-toggle:not(.att-btn)');
    const themeIcon = document.querySelector('.theme-icon');
    const guestThemeKey = 'apush_guest_theme';
    
    // Check for user settings if authenticated; guests use non-persistent default.
    let currentTheme = 'light';
    if (window.AuthManager && window.AuthManager.isAuthenticated()) {
        const settings = window.AuthManager.getCurrentUserSettings();
        if (settings && settings.theme) {
            if (settings.theme === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                currentTheme = prefersDark ? 'dark' : 'light';
            } else {
                currentTheme = settings.theme;
            }
        }
    } else {
        const sessionTheme = sessionStorage.getItem(guestThemeKey);
        if (sessionTheme === 'light' || sessionTheme === 'dark') {
            currentTheme = sessionTheme;
        }
    }
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    updateThemeIcon(currentTheme, themeIcon);

    if (reactThemeRoot) {
        syncAuthThemeToggles();
        return;
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            document.documentElement.classList.toggle('dark', newTheme === 'dark');

            // Save only for authenticated users.
            if (window.AuthManager && window.AuthManager.isAuthenticated()) {
                window.AuthManager.updateSetting('theme', newTheme);
            } else {
                // Keep guest theme consistent across pages for this browsing session only.
                sessionStorage.setItem(guestThemeKey, newTheme);
            }
            
            updateThemeIcon(newTheme, themeIcon);
        });
    }
}

function initMotionToggle() {
    const btn = document.querySelector('.motion-toggle');
    if (!btn) return;

    const isReduced = () => document.documentElement.getAttribute('data-reduced-motion') === 'true';
    const syncUi = () => {
        const active = isReduced();
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        btn.title = active ? 'Reduce motion: on' : 'Reduce motion: off';
    };

    btn.addEventListener('click', () => {
        const next = !isReduced();
        document.documentElement.setAttribute('data-reduced-motion', next ? 'true' : 'false');
        if (window.AuthManager && window.AuthManager.isAuthenticated()) {
            window.AuthManager.updateSetting('reducedMotion', next);
        } else {
            localStorage.setItem('reducedMotion', next ? 'true' : 'false');
        }
        syncUi();
    });

    syncUi();
}

function isAuthPage() {
    const path = (window.location.pathname || '').toLowerCase();
    return /(?:^|\/)(login|signin|signup)\.html$/.test(path);
}

function syncAuthThemeToggles() {
    const splash = document.getElementById('intro-splash');
    const splashVisible = splash && !splash.hidden && !splash.classList.contains('intro-splash--exit');
    const authenticated = window.AuthManager && typeof window.AuthManager.isAuthenticated === 'function'
        && window.AuthManager.isAuthenticated();
    const show = authenticated && !isAuthPage() && !splashVisible;

    document.querySelectorAll('[data-theme-toggler-root]').forEach((root) => {
        if (root.closest('#intro-splash')) {
            root.hidden = true;
            root.setAttribute('aria-hidden', 'true');
            return;
        }

        const inNav = root.closest('.nav-controls, .navbar');
        if (!inNav) return;

        root.hidden = !show;
        root.setAttribute('aria-hidden', show ? 'false' : 'true');
    });
}

window.syncAuthThemeToggles = syncAuthThemeToggles;

function updateThemeIcon(theme, iconElement) {
    if (iconElement) {
        iconElement.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Liquid glass switcher + card styling system
function initLiquidGlassSystem() {
    const fallbackStyle = 'classic';
    const styleOptions = ['classic', 'dark', 'aurora'];

    let currentStyle = fallbackStyle;
    if (window.AuthManager && window.AuthManager.isAuthenticated()) {
        const settings = window.AuthManager.getCurrentUserSettings();
        if (settings && styleOptions.includes(settings.liquidGlassStyle)) {
            currentStyle = settings.liquidGlassStyle;
        }
    }

    applyLiquidGlassStyle(currentStyle);
    document.documentElement.setAttribute('data-glass-style', currentStyle);
    createLiquidGlassSwitcher(currentStyle);
    applyLiquidGlassTargets();

    // Re-apply to dynamic content (resources, sessions, modal-generated blocks)
    const observer = new MutationObserver(() => {
        applyLiquidGlassTargets();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function createLiquidGlassSwitcher(currentStyle) {
    if (document.querySelector('.liquid-glass-switcher')) return;

    const switcher = document.createElement('fieldset');
    switcher.className = 'liquid-glass-switcher';
    switcher.setAttribute('aria-label', 'Liquid glass style');

    switcher.innerHTML = `
        <legend class="liquid-glass-switcher__legend">Visual style</legend>
        <label class="liquid-glass-switcher__option">
            <input class="liquid-glass-switcher__input" type="radio" name="liquid-glass-style" value="classic">
            <span class="liquid-glass-switcher__icon" aria-hidden="true">☀️</span>
        </label>
        <label class="liquid-glass-switcher__option">
            <input class="liquid-glass-switcher__input" type="radio" name="liquid-glass-style" value="dark">
            <span class="liquid-glass-switcher__icon" aria-hidden="true">🌙</span>
        </label>
        <label class="liquid-glass-switcher__option">
            <input class="liquid-glass-switcher__input" type="radio" name="liquid-glass-style" value="aurora">
            <span class="liquid-glass-switcher__icon" aria-hidden="true">✨</span>
        </label>
    `;

    document.body.appendChild(switcher);
    bindLiquidGlassSwitcher(switcher, currentStyle);
}

function bindLiquidGlassSwitcher(switcher, currentStyle) {
    const radios = Array.from(switcher.querySelectorAll('input[type="radio"]'));
    const selected = radios.find(radio => radio.value === currentStyle) || radios[0];
    if (selected) {
        selected.checked = true;
    }

    const setActivePosition = (value) => {
        const index = Math.max(0, radios.findIndex(radio => radio.value === value));
        switcher.style.setProperty('--liquid-active-index', String(index));
    };

    setActivePosition(currentStyle);

    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (!radio.checked) return;
            setActivePosition(radio.value);
            applyLiquidGlassStyle(radio.value);

            if (window.AuthManager && window.AuthManager.isAuthenticated()) {
                window.AuthManager.updateSetting('liquidGlassStyle', radio.value);
            }
        });
    });
}

function applyLiquidGlassStyle(style) {
    document.documentElement.setAttribute('data-glass-style', style);
}

function initLiquidGlassTargets() {
    applyLiquidGlassTargets();
}

function applyLiquidGlassTargets() {
    const glassSelectors = [
        '.archive-status-panel',
        '.readiness-card',
        '.action-card',
        '.feature-card',
        '.challenge-card',
        '.metrics-results',
        '.metrics-form',
        '.stat-item',
        '.dashboard-card',
        '.calendar-container',
        '.session-card',
        '.resource-card',
        '.unit-card',
        '.theme-toggle.att-btn--vanilla',
        '.settings-gear-btn'
    ];

    document.querySelectorAll(glassSelectors.join(',')).forEach(element => {
        if (element.classList.contains('no-liquid-glass')) return;
        element.classList.add('liquid-glass');
    });
}

if (typeof window !== 'undefined') {
    window.initLiquidGlassTargets = initLiquidGlassTargets;
    window.applyLiquidGlassTargets = applyLiquidGlassTargets;
}

// Reduced motion, high contrast now in Unified Settings Modal (gear)

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
// Uses user-specific key if authenticated, otherwise falls back to global
function getUserProgress() {
    let progressKey = null;
    try {
        if (window.AuthManager && typeof window.AuthManager.isAuthenticated === 'function' && window.AuthManager.isAuthenticated()) {
            const currentUser = window.AuthManager.getCurrentUser();
            if (currentUser && currentUser.id) {
                progressKey = `user_${currentUser.id}_progress`;
            }
        }
    } catch (e) {
        console.debug('AuthManager not ready, returning guest defaults');
    }

    if (!progressKey) {
        return {
            periods: {},
            skills: {},
            practiceQuestions: 0,
            studyHours: 0,
            activities: []
        };
    }

    try {
        const progress = localStorage.getItem(progressKey);
        return progress ? JSON.parse(progress) : {
            periods: {},
            skills: {},
            practiceQuestions: 0,
            studyHours: 0,
            activities: []
        };
    } catch (e) {
        console.error('Failed to parse progress data:', e);
        return {
            periods: {},
            skills: {},
            practiceQuestions: 0,
            studyHours: 0,
            activities: []
        };
    }
}

// Utility function to save user progress
// Uses user-specific key if authenticated, otherwise falls back to global
function saveUserProgress(progress) {
    let progressKey = null;
    try {
        if (window.AuthManager && typeof window.AuthManager.isAuthenticated === 'function' && window.AuthManager.isAuthenticated()) {
            const currentUser = window.AuthManager.getCurrentUser();
            if (currentUser && currentUser.id) {
                progressKey = `user_${currentUser.id}_progress`;
            }
        }
    } catch (e) {
        console.debug('AuthManager not ready, skipping save');
    }

    if (!progressKey) {
        // Explicitly do not persist guest data.
        return false;
    }
    
    try {
        localStorage.setItem(progressKey, JSON.stringify(progress));
        if (window.SupabasePersistence && window.SupabasePersistence.isReady()) {
            const currentUser = window.AuthManager && window.AuthManager.getCurrentUser ? window.AuthManager.getCurrentUser() : null;
            if (currentUser && currentUser.id) {
                window.SupabasePersistence.pushProgress(currentUser.id, progress);
            }
        }
    } catch (e) {
        console.error('Failed to save progress:', e);
        // Try to clear space if quota exceeded
        if (e.name === 'QuotaExceededError') {
            alert('Storage quota exceeded. Please clear some data.');
        }
    }
    return true;
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

const APUSH_TOTAL_PERIODS = 8;
const MASTERY_GAIN_CORRECT = 1;
const MASTERY_GAIN_ATTEMPT = 0.15;
const PERIOD_MASTERY_COMPLETE = 85;

function getPeriodMastery(progress, periodNumber) {
    if (!progress || !progress.periods) return 0;
    const entry = progress.periods[periodNumber] ?? progress.periods[String(periodNumber)];
    return entry && typeof entry.mastery === 'number' ? entry.mastery : 0;
}

/** Record one practice attempt and update period mastery with realistic gains. */
function recordPracticeAttempt(progress, periodNumber, correct) {
    const periodKey = Number(periodNumber);
    if (!progress.periods[periodKey]) {
        progress.periods[periodKey] = {
            mastery: 0,
            completed: false,
            questionsAttempted: 0,
            questionsCorrect: 0
        };
    }

    const period = progress.periods[periodKey];
    period.questionsAttempted = (period.questionsAttempted || 0) + 1;
    if (correct) {
        period.questionsCorrect = (period.questionsCorrect || 0) + 1;
    }

    const gain = correct ? MASTERY_GAIN_CORRECT : MASTERY_GAIN_ATTEMPT;
    period.mastery = Math.min(100, (period.mastery || 0) + gain);
    period.completed = period.mastery >= PERIOD_MASTERY_COMPLETE;

    progress.practiceQuestions = (progress.practiceQuestions || 0) + 1;
    return progress;
}

// Exam readiness: average mastery across all 8 APUSH periods (untouched = 0%)
function calculateOverallMastery() {
    const progress = getUserProgress();
    let sum = 0;
    for (let i = 1; i <= APUSH_TOTAL_PERIODS; i++) {
        sum += getPeriodMastery(progress, i);
    }

    const average = sum / APUSH_TOTAL_PERIODS;
    if (average > 0 && average < 1) {
        return 1;
    }
    return Math.min(100, Math.round(average));
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

/** Fill a period dropdown from APUSH_DATA. Keeps filters in sync with loaded period data. */
function populatePeriodFilterOptions(selectEl, { includeAll = true } = {}) {
    if (!selectEl || !window.APUSH_DATA || !window.APUSH_DATA.periods) return;
    const periodNums = Object.keys(window.APUSH_DATA.periods)
        .map(Number)
        .filter(Number.isFinite)
        .sort((a, b) => a - b);
    const previous = selectEl.value;
    selectEl.innerHTML = '';
    if (includeAll) {
        const allOpt = document.createElement('option');
        allOpt.value = 'all';
        allOpt.textContent = 'All Periods';
        selectEl.appendChild(allOpt);
    }
    periodNums.forEach(num => {
        const opt = document.createElement('option');
        opt.value = String(num);
        opt.textContent = `Period ${num}`;
        selectEl.appendChild(opt);
    });
    if ([...selectEl.options].some(o => o.value === previous)) {
        selectEl.value = previous;
    }
}

// Export functions for use in other scripts
window.APUSH = {
    openModal,
    closeModal,
    getUserProgress,
    saveUserProgress,
    updateProgress,
    calculateOverallMastery,
    recordPracticeAttempt,
    getPeriodMastery,
    APUSH_TOTAL_PERIODS,
    formatDate,
    formatTime,
    populatePeriodFilterOptions
};
window.populatePeriodFilterOptions = populatePeriodFilterOptions;

/** Load rule-based site assistant on all pages that include script.js */
(function bootSiteAssistant() {
    if (window.__apushAssistantBoot) return;
    window.__apushAssistantBoot = true;
    if (!document.querySelector('link[href*="site-assistant.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'site-assistant.css?v=1';
        document.head.appendChild(link);
    }
    if (!document.getElementById('cw-bubble') && !document.querySelector('script[src*="site-assistant.js"]')) {
        const script = document.createElement('script');
        script.src = 'site-assistant.js?v=1';
        script.defer = true;
        document.body.appendChild(script);
    }
})();
