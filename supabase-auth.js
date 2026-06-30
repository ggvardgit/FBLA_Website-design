/**
 * Supabase-backed authentication with email verification.
 * When SUPABASE_CONFIG is set, uses Supabase; otherwise falls back to local AuthManager.
 */
(function() {
    function isConfigured() {
        const c = window.SUPABASE_CONFIG || {};
        return !!(c.url && c.anonKey && typeof window.supabase !== 'undefined');
    }

    function getClient() {
        if (!isConfigured()) return null;
        return window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.anonKey
        );
    }

    async function signUpWithSupabase(email, password) {
        const supabase = getClient();
        if (!supabase) throw new Error('Supabase not configured');
        const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: { emailRedirectTo: window.location.origin + '/index.html' }
        });
        if (error) throw new Error(error.message);
        return { user: data.user, session: data.session, needsVerification: !data.session };
    }

    async function signInWithSupabase(email, password) {
        const supabase = getClient();
        if (!supabase) throw new Error('Supabase not configured');
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password
        });
        if (error) throw new Error(error.message);
        if (data.user && !data.user.email_confirmed_at) {
            await supabase.auth.signOut();
            throw new Error('Please verify your email before signing in. Check your inbox for the confirmation link.');
        }
        return { user: data.user, session: data.session };
    }

    async function syncSessionToAuthManager(user) {
        if (!window.AuthManager || !user) return;
        const emailNorm = (user.email || '').toLowerCase();
        const u = {
            id: user.id,
            email: emailNorm,
            createdAt: user.created_at,
            lastLogin: new Date().toISOString()
        };
        window.AuthManager.users.set(emailNorm, u);
        window.AuthManager.saveUsers();
        window.AuthManager.currentUser = { id: user.id, email: emailNorm };
        localStorage.setItem('apush_session', JSON.stringify({
            id: user.id,
            email: emailNorm,
            sessionToken: 'supabase_' + user.id,
            loginTime: new Date().toISOString()
        }));
        window.AuthManager.createDefaultSettings(user.id);
        if (window.SupabasePersistence && window.SupabasePersistence.isReady()) {
            await window.SupabasePersistence.syncFromSupabase(user.id);
        }
        window.AuthManager.loadUserSettings(user.id);
        window.AuthManager.applyUserSettings();
        window.AuthManager.loadUserProgress();
        window.dispatchEvent(new CustomEvent('apush:login'));
    }

    async function signOut() {
        const supabase = getClient();
        if (supabase) await supabase.auth.signOut();
    }

    async function resetPassword(email) {
        const supabase = getClient();
        if (!supabase) throw new Error('Supabase not configured');
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
            redirectTo: window.location.origin + '/login.html'
        });
        if (error) throw new Error(error.message);
    }

    window.SupabaseAuth = {
        isConfigured,
        signUp: signUpWithSupabase,
        signIn: signInWithSupabase,
        signOut,
        resetPassword,
        syncSessionToAuthManager,
        async getSession() {
            const supabase = getClient();
            if (!supabase) return null;
            const { data } = await supabase.auth.getSession();
            return data.session;
        }
    };
})();
