/**
 * Unified Settings Modal — opened from the nav gear icon.
 */
(function () {
    const MODAL_ID = 'unified-settings-modal';

    function isAuth() {
        return window.AuthManager && window.AuthManager.isAuthenticated();
    }

    function getSettings() {
        if (isAuth()) {
            return window.AuthManager.getCurrentUserSettings() || {};
        }
        return {
            theme: localStorage.getItem('theme') || 'light',
            reducedMotion: localStorage.getItem('reducedMotion') === 'true',
            fontSize: localStorage.getItem('fontSize') || 'medium',
            highContrast: localStorage.getItem('highContrast') === 'true',
            primaryHue: Number(localStorage.getItem('primaryHue')) || 217,
            saveHistory: true,
            personalizedRecommendations: true
        };
    }

    function saveSetting(key, value) {
        if (isAuth()) {
            window.AuthManager.updateSetting(key, value);
            return;
        }
        if (key === 'theme') localStorage.setItem('theme', value);
        else if (key === 'reducedMotion') localStorage.setItem('reducedMotion', value ? 'true' : 'false');
        else if (key === 'fontSize') localStorage.setItem('fontSize', value);
        else if (key === 'highContrast') localStorage.setItem('highContrast', value ? 'true' : 'false');
        else if (key === 'primaryHue') localStorage.setItem('primaryHue', String(value));
    }

    function applyPrimaryHue(hue) {
        document.documentElement.style.setProperty('--primary-color', `hsl(${hue}, 70%, 50%)`);
        document.documentElement.style.setProperty('--primary-hover', `hsl(${hue}, 70%, 40%)`);
    }

    function resolveTheme(theme) {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme === 'dark' ? 'dark' : 'light';
    }

    function createModalHTML() {
        return `
<div class="modal" id="${MODAL_ID}" role="dialog" aria-labelledby="settings-modal-title" aria-hidden="true">
    <div class="modal-content settings-modal-content no-liquid-glass">
        <div class="modal-header">
            <h2 id="settings-modal-title" class="modal-title">Settings</h2>
            <button class="modal-close" aria-label="Close settings">&times;</button>
        </div>
        <div class="settings-modal-body">
            <nav class="settings-modal-sidebar" role="tablist" aria-label="Settings sections">
                <button type="button" class="settings-tab-btn active" data-tab="appearance" role="tab" aria-selected="true">Appearance</button>
                <button type="button" class="settings-tab-btn" data-tab="accessibility" role="tab" aria-selected="false">Accessibility</button>
                <button type="button" class="settings-tab-btn" data-tab="account" role="tab" aria-selected="false" data-auth-only="true">Account</button>
                <button type="button" class="settings-tab-btn" data-tab="privacy" role="tab" aria-selected="false" data-auth-only="true">Privacy & Data</button>
                <button type="button" class="settings-tab-btn" data-tab="security" role="tab" aria-selected="false" data-auth-only="true">Session & Security</button>
            </nav>
            <div class="settings-modal-panels">
                <div class="settings-panel active" id="panel-appearance" role="tabpanel">
                    <h3>Appearance</h3>
                    <p class="settings-panel-desc">Customize the look and feel of the application.</p>
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Theme</div>
                            <div class="setting-description">Light, dark, or match your system</div>
                        </div>
                        <div class="settings-segmented" id="modal-theme-segmented" role="group" aria-label="Theme">
                            <button type="button" class="settings-segment-btn" data-theme-value="light">Light</button>
                            <button type="button" class="settings-segment-btn" data-theme-value="dark">Dark</button>
                            <button type="button" class="settings-segment-btn" data-theme-value="system">System</button>
                        </div>
                    </div>
                    <div class="setting-item setting-item--stacked">
                        <div class="setting-label">
                            <div class="setting-title">Theme Color</div>
                            <div class="setting-description">Choose your accent color (hue)</div>
                        </div>
                        <input type="range" id="theme-hue-slider" class="theme-hue-slider" min="0" max="360" value="217" aria-label="Theme color hue">
                        <p class="theme-hue-value"><span id="theme-hue-display">217</span>°</p>
                    </div>
                </div>
                <div class="settings-panel" id="panel-accessibility" role="tabpanel">
                    <h3>Accessibility</h3>
                    <p class="settings-panel-desc">Adjust motion, text size, and contrast.</p>
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Reduced Motion</div>
                            <div class="setting-description">Reduce animations and transitions</div>
                        </div>
                        <div class="toggle-switch" id="modal-reduced-motion" role="switch" aria-checked="false"></div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Font Size</div>
                            <div class="setting-description">Adjust the base font size</div>
                        </div>
                        <div class="settings-segmented" id="modal-font-size-segmented" role="group" aria-label="Font size">
                            <button type="button" class="settings-segment-btn" data-font-size-value="small">Small</button>
                            <button type="button" class="settings-segment-btn" data-font-size-value="medium">Medium</button>
                            <button type="button" class="settings-segment-btn" data-font-size-value="large">Large</button>
                        </div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">High Contrast Mode</div>
                            <div class="setting-description">Increase contrast for better visibility</div>
                        </div>
                        <div class="toggle-switch" id="modal-high-contrast" role="switch" aria-checked="false"></div>
                    </div>
                    <div class="setting-item" id="guest-clear-wrap">
                        <div class="setting-label">
                            <div class="setting-title">Clear Local Data</div>
                            <div class="setting-description">Remove saved preferences and progress from this device</div>
                        </div>
                        <button type="button" class="btn-secondary" id="modal-clear-data">Clear</button>
                    </div>
                </div>
                <div class="settings-panel" id="panel-account" role="tabpanel">
                    <h3>Account</h3>
                    <p class="settings-panel-desc">Manage your account information.</p>
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Email Address</div>
                            <div class="account-email" id="modal-account-email"></div>
                            <div class="last-login" id="modal-last-login"></div>
                        </div>
                    </div>
                    <div class="setting-item" id="modal-password-setting-row">
                        <div class="setting-label">
                            <div class="setting-title">Change Password</div>
                            <div class="setting-description">Update your account password</div>
                        </div>
                        <button type="button" class="btn-secondary" id="modal-change-password-btn">Change Password</button>
                    </div>
                    <div class="password-form hidden" id="modal-password-form" aria-labelledby="modal-change-password-btn">
                        <div class="password-form-group">
                            <label class="password-form-label" for="modal-current-password">Current Password</label>
                            <input type="password" id="modal-current-password" class="password-form-input" autocomplete="current-password">
                        </div>
                        <div class="password-form-group">
                            <label class="password-form-label" for="modal-new-password">New Password</label>
                            <input type="password" id="modal-new-password" class="password-form-input" autocomplete="new-password">
                        </div>
                        <div class="password-form-group">
                            <label class="password-form-label" for="modal-confirm-password">Confirm New Password</label>
                            <input type="password" id="modal-confirm-password" class="password-form-input" autocomplete="new-password">
                        </div>
                        <div class="password-form-actions">
                            <button type="button" class="btn-primary" id="modal-save-password-btn">Save Password</button>
                            <button type="button" class="btn-secondary" id="modal-cancel-password-btn">Cancel</button>
                        </div>
                        <div class="password-message" id="modal-password-message"></div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Log Out</div>
                            <div class="setting-description">Sign out of your account</div>
                        </div>
                        <button type="button" class="btn-danger" id="modal-logout">Log Out</button>
                    </div>
                    <div class="setting-item setting-item--danger">
                        <div class="setting-label">
                            <div class="setting-title">Delete Account</div>
                            <div class="setting-description">Permanently remove your account, progress, and settings from this device</div>
                        </div>
                        <button type="button" class="btn-danger btn-danger--outline" id="modal-delete-account">Delete Account</button>
                    </div>
                </div>
                <div class="settings-panel" id="panel-privacy" role="tabpanel">
                    <h3>Privacy & Data</h3>
                    <p class="settings-panel-desc">Control how your data is stored and used.</p>
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Save Study History</div>
                            <div class="setting-description">Store your progress and study sessions</div>
                        </div>
                        <div class="toggle-switch" id="modal-save-history" role="switch" aria-checked="true"></div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Personalized Recommendations</div>
                            <div class="setting-description">Use your data to provide personalized suggestions</div>
                        </div>
                        <div class="toggle-switch" id="modal-recommendations" role="switch" aria-checked="true"></div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Export All User Data</div>
                            <div class="setting-description">Download progress, settings, and history as JSON</div>
                        </div>
                        <button type="button" class="btn-secondary" id="modal-export-data">Export</button>
                    </div>
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Clear Local Cache</div>
                            <div class="setting-description">Remove cached settings and progress for this account</div>
                        </div>
                        <button type="button" class="btn-secondary" id="modal-clear-cache">Clear Cache</button>
                    </div>
                </div>
                <div class="settings-panel" id="panel-security" role="tabpanel">
                    <h3>Session & Security</h3>
                    <p class="settings-panel-desc">Manage active sessions and security.</p>
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Last Login</div>
                            <div class="setting-description" id="modal-security-last-login">—</div>
                        </div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Sign Out of All Sessions</div>
                            <div class="setting-description">End all active sessions and require re-authentication</div>
                        </div>
                        <button type="button" class="btn-danger" id="modal-signout-all">Sign Out All</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    function setToggle(el, active) {
        if (!el) return;
        el.classList.toggle('active', active);
        el.setAttribute('aria-checked', active ? 'true' : 'false');
    }

    function setSegmentedActive(container, attr, value) {
        if (!container) return;
        container.querySelectorAll('.settings-segment-btn').forEach((btn) => {
            const btnValue = btn.getAttribute(attr);
            const isActive = btnValue === value;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    function switchSettingsTab(tabId) {
        document.querySelectorAll('.settings-tab-btn').forEach((btn) => {
            const isActive = btn.dataset.tab === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        document.querySelectorAll('.settings-panel').forEach((panel) => {
            panel.classList.toggle('active', panel.id === 'panel-' + tabId);
        });
    }

    function syncModalFromSettings() {
        const settings = getSettings();
        const theme = settings.theme || 'light';
        setSegmentedActive(document.getElementById('modal-theme-segmented'), 'data-theme-value', theme);

        const hueSlider = document.getElementById('theme-hue-slider');
        const hueDisplay = document.getElementById('theme-hue-display');
        const hue = settings.primaryHue !== undefined ? settings.primaryHue : 217;
        if (hueSlider) hueSlider.value = hue;
        if (hueDisplay) hueDisplay.textContent = hue;
        applyPrimaryHue(hue);

        setToggle(document.getElementById('modal-reduced-motion'), settings.reducedMotion || false);
        setToggle(document.getElementById('modal-high-contrast'), settings.highContrast || false);
        setToggle(document.getElementById('modal-save-history'), settings.saveHistory !== false);
        setToggle(document.getElementById('modal-recommendations'), settings.personalizedRecommendations !== false);

        const fontSize = settings.fontSize || 'medium';
        setSegmentedActive(document.getElementById('modal-font-size-segmented'), 'data-font-size-value', fontSize);

        const guestClear = document.getElementById('guest-clear-wrap');
        if (guestClear) guestClear.style.display = isAuth() ? 'none' : '';

        document.querySelectorAll('.settings-tab-btn[data-auth-only="true"]').forEach((btn) => {
            btn.style.display = isAuth() ? '' : 'none';
        });

        const activeTabBtn = document.querySelector('.settings-tab-btn.active');
        if (activeTabBtn && activeTabBtn.style.display === 'none') {
            switchSettingsTab('appearance');
        }

        if (isAuth()) {
            const info = window.AuthManager.getUserInfo();
            const emailEl = document.getElementById('modal-account-email');
            if (emailEl) emailEl.textContent = info.email || '';
            const lastLogin = info.lastLogin ? new Date(info.lastLogin).toLocaleString() : '—';
            const lastEl = document.getElementById('modal-last-login');
            if (lastEl) lastEl.textContent = info.lastLogin ? `Last login: ${lastLogin}` : '';
            const secEl = document.getElementById('modal-security-last-login');
            if (secEl) secEl.textContent = lastLogin;
        }
    }

    function initModal() {
        if (document.getElementById(MODAL_ID)) return;

        document.body.insertAdjacentHTML('beforeend', createModalHTML());
        const modal = document.getElementById(MODAL_ID);

        document.querySelectorAll('.settings-tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (btn.style.display === 'none') return;
                switchSettingsTab(btn.dataset.tab);
            });
        });

        modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
            const deleteBtn = e.target.closest('#modal-delete-account');
            if (deleteBtn) {
                e.preventDefault();
                handleDeleteAccount();
                return;
            }
            const logoutBtn = e.target.closest('#modal-logout, #modal-signout-all');
            if (logoutBtn) {
                e.preventDefault();
                const message = logoutBtn.id === 'modal-signout-all'
                    ? 'Sign out of all sessions on this device?'
                    : 'Log out of your account?';
                handleLogout(message);
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(modal);
        });

        const hueSlider = document.getElementById('theme-hue-slider');
        if (hueSlider) {
            hueSlider.style.background = 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)';
            hueSlider.addEventListener('input', () => {
                const v = parseInt(hueSlider.value, 10);
                const hueDisplay = document.getElementById('theme-hue-display');
                if (hueDisplay) hueDisplay.textContent = v;
                applyPrimaryHue(v);
                saveSetting('primaryHue', v);
            });
        }

        document.getElementById('modal-theme-segmented')?.querySelectorAll('[data-theme-value]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const v = btn.getAttribute('data-theme-value');
                const resolved = resolveTheme(v);
                document.documentElement.setAttribute('data-theme', resolved);
                document.documentElement.classList.toggle('dark', resolved === 'dark');
                saveSetting('theme', v);
                setSegmentedActive(document.getElementById('modal-theme-segmented'), 'data-theme-value', v);
            });
        });

        document.getElementById('modal-font-size-segmented')?.querySelectorAll('[data-font-size-value]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const v = btn.getAttribute('data-font-size-value');
                document.documentElement.setAttribute('data-font-size', v || 'medium');
                saveSetting('fontSize', v);
                setSegmentedActive(document.getElementById('modal-font-size-segmented'), 'data-font-size-value', v);
            });
        });

        document.getElementById('modal-reduced-motion')?.addEventListener('click', function () {
            const active = !this.classList.contains('active');
            setToggle(this, active);
            document.documentElement.setAttribute('data-reduced-motion', active ? 'true' : 'false');
            saveSetting('reducedMotion', active);
        });

        document.getElementById('modal-high-contrast')?.addEventListener('click', function () {
            const active = !this.classList.contains('active');
            setToggle(this, active);
            document.documentElement.setAttribute('data-high-contrast', active ? 'true' : 'false');
            saveSetting('highContrast', active);
        });

        document.getElementById('modal-save-history')?.addEventListener('click', function () {
            const active = !this.classList.contains('active');
            setToggle(this, active);
            saveSetting('saveHistory', active);
        });

        document.getElementById('modal-recommendations')?.addEventListener('click', function () {
            const active = !this.classList.contains('active');
            setToggle(this, active);
            saveSetting('personalizedRecommendations', active);
        });

        document.getElementById('modal-clear-data')?.addEventListener('click', () => {
            if (!confirm('Clear all local preferences and progress from this device?')) return;
            ['theme', 'reducedMotion', 'fontSize', 'highContrast', 'primaryHue', 'userProgress'].forEach((k) => localStorage.removeItem(k));
            const user = window.AuthManager?.getCurrentUser?.();
            if (user?.id) {
                localStorage.removeItem(`user_${user.id}_progress`);
                localStorage.removeItem(`user_${user.id}_settings`);
            }
            document.documentElement.removeAttribute('data-high-contrast');
            document.documentElement.removeAttribute('data-font-size');
            document.documentElement.removeAttribute('data-reduced-motion');
            alert('Local data cleared. Refreshing.');
            location.reload();
        });

        document.getElementById('modal-clear-cache')?.addEventListener('click', () => {
            if (!confirm('Clear all cached data? Progress and settings will reset.')) return;
            const u = window.AuthManager?.getCurrentUser?.();
            if (u) {
                localStorage.removeItem(`user_${u.id}_settings`);
                localStorage.removeItem(`user_${u.id}_progress`);
            }
            alert('Cache cleared. Refreshing.');
            location.reload();
        });

        document.getElementById('modal-change-password-btn')?.addEventListener('click', () => {
            const form = document.getElementById('modal-password-form');
            const btn = document.getElementById('modal-change-password-btn');
            if (!form) return;
            const show = form.classList.contains('hidden');
            form.classList.toggle('hidden', !show);
            if (btn) btn.textContent = show ? 'Hide Password Form' : 'Change Password';
        });

        document.getElementById('modal-cancel-password-btn')?.addEventListener('click', () => {
            document.getElementById('modal-password-form')?.classList.add('hidden');
            const btn = document.getElementById('modal-change-password-btn');
            if (btn) btn.textContent = 'Change Password';
            document.getElementById('modal-password-message')?.classList.remove('show');
        });

        document.getElementById('modal-save-password-btn')?.addEventListener('click', () => {
            const cur = document.getElementById('modal-current-password')?.value || '';
            const neu = document.getElementById('modal-new-password')?.value || '';
            const conf = document.getElementById('modal-confirm-password')?.value || '';
            const msg = document.getElementById('modal-password-message');
            if (!msg) return;
            if (!cur || !neu || !conf) {
                msg.textContent = 'Fill all fields.';
                msg.className = 'password-message error show';
                return;
            }
            if (neu.length < 8) {
                msg.textContent = 'Password must be at least 8 characters.';
                msg.className = 'password-message error show';
                return;
            }
            if (neu !== conf) {
                msg.textContent = 'Passwords do not match.';
                msg.className = 'password-message error show';
                return;
            }
            try {
                window.AuthManager.changePassword(cur, neu);
                msg.textContent = 'Password changed.';
                msg.className = 'password-message success show';
                setTimeout(() => {
                    document.getElementById('modal-password-form')?.classList.add('hidden');
                    msg.classList.remove('show');
                    ['modal-current-password', 'modal-new-password', 'modal-confirm-password'].forEach((id) => {
                        const el = document.getElementById(id);
                        if (el) el.value = '';
                    });
                }, 2000);
            } catch (e) {
                msg.textContent = e.message || 'Failed.';
                msg.className = 'password-message error show';
            }
        });

        document.getElementById('modal-export-data')?.addEventListener('click', () => {
            const progress = window.APUSH ? window.APUSH.getUserProgress() : {};
            const settings = getSettings();
            const blob = new Blob([JSON.stringify({ progress, settings, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'apush-data-' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(a.href);
        });

        syncModalFromSettings();
        switchSettingsTab('appearance');
    }

    function openModal() {
        initModal();
        syncModalFromSettings();
        const modal = document.getElementById(MODAL_ID);
        switchSettingsTab('appearance');
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        const first = modal.querySelector('button, input, select');
        if (first) first.focus();
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    async function handleDeleteAccount() {
        if (!window.AuthManager) {
            alert('Sign-in is not ready yet. Refresh the page and try again.');
            return;
        }
        if (!window.AuthManager.isAuthenticated()) {
            alert('You are not signed in.');
            return;
        }

        const email = window.AuthManager.getCurrentUser()?.email || '';
        if (!window.confirm('Delete your account permanently? This removes all saved progress and cannot be undone.')) {
            return;
        }

        const typed = window.prompt(`Type your email to confirm deletion:\n${email}`);
        if (!typed || typed.trim().toLowerCase() !== email.toLowerCase()) {
            alert('Email did not match. Your account was not deleted.');
            return;
        }

        const modal = document.getElementById(MODAL_ID);
        closeModal(modal);

        try {
            await window.AuthManager.deleteAccount();
        } catch (err) {
            console.error('Delete account failed:', err);
            alert(err.message || 'Could not delete your account. Please try again.');
        }
    }

    async function handleLogout(confirmMessage) {
        if (!window.AuthManager) {
            alert('Sign-in is not ready yet. Refresh the page and try again.');
            return;
        }
        if (!window.AuthManager.isAuthenticated()) {
            alert('You are not signed in.');
            closeModal(document.getElementById(MODAL_ID));
            return;
        }
        if (!window.confirm(confirmMessage)) return;

        const modal = document.getElementById(MODAL_ID);
        closeModal(modal);

        try {
            await window.AuthManager.logout();
        } catch (err) {
            console.error('Logout failed:', err);
            alert('Could not sign out. Please refresh the page and try again.');
        }
    }

    window.openUnifiedSettings = openModal;

    document.addEventListener('DOMContentLoaded', () => {
        initModal();
        const s = getSettings();
        applyPrimaryHue(s.primaryHue !== undefined ? s.primaryHue : 217);
        document.querySelectorAll('.settings-gear-btn').forEach((btn) => {
            btn.addEventListener('click', openModal);
        });
        window.addEventListener('apush:session-restored', syncModalFromSettings);
        if (new URLSearchParams(window.location.search).get('settings') === '1') {
            openModal();
        }
    });
})();
