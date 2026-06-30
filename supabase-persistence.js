/**
 * Supabase persistence for user settings and progress.
 * When SUPABASE_CONFIG is set, syncs to Supabase; otherwise no-op.
 */
(function() {
    function isReady() {
        return window.SupabaseAuth && window.SupabaseAuth.isConfigured();
    }

    function getClient() {
        if (!isReady() || !window.supabase) return null;
        return window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.anonKey
        );
    }

    async function loadSettings(userId) {
        const supabase = getClient();
        if (!supabase) return null;
        try {
            const { data, error } = await supabase
                .from('apush_user_settings')
                .select('settings')
                .eq('user_id', userId)
                .single();
            if (error || !data) return null;
            return data.settings;
        } catch (e) {
            console.warn('Supabase loadSettings:', e);
            return null;
        }
    }

    async function saveSettings(userId, settings) {
        const supabase = getClient();
        if (!supabase) return;
        try {
            await supabase
                .from('apush_user_settings')
                .upsert({
                    user_id: userId,
                    settings: settings || {},
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
        } catch (e) {
            console.warn('Supabase saveSettings:', e);
        }
    }

    async function loadProgress(userId) {
        const supabase = getClient();
        if (!supabase) return null;
        try {
            const { data, error } = await supabase
                .from('apush_user_progress')
                .select('progress')
                .eq('user_id', userId)
                .single();
            if (error || !data) return null;
            return data.progress;
        } catch (e) {
            console.warn('Supabase loadProgress:', e);
            return null;
        }
    }

    async function saveProgress(userId, progress) {
        const supabase = getClient();
        if (!supabase) return;
        try {
            await supabase
                .from('apush_user_progress')
                .upsert({
                    user_id: userId,
                    progress: progress || {},
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
        } catch (e) {
            console.warn('Supabase saveProgress:', e);
        }
    }

    /**
     * After Supabase login, load settings and progress from backend and merge into localStorage.
     * Call this from syncSessionToAuthManager.
     */
    async function syncFromSupabase(userId) {
        if (!userId) return;
        const [remoteSettings, remoteProgress] = await Promise.all([
            loadSettings(userId),
            loadProgress(userId)
        ]);
        if (remoteSettings && typeof remoteSettings === 'object') {
            const key = `user_${userId}_settings`;
            localStorage.setItem(key, JSON.stringify(remoteSettings));
        }
        if (remoteProgress && typeof remoteProgress === 'object') {
            const key = `user_${userId}_progress`;
            localStorage.setItem(key, JSON.stringify(remoteProgress));
        }
    }

    /**
     * Push current localStorage settings to Supabase (fire-and-forget).
     */
    function pushSettings(userId, settings) {
        if (!isReady() || !userId) return;
        saveSettings(userId, settings);
    }

    /**
     * Push current progress to Supabase (fire-and-forget).
     */
    function pushProgress(userId, progress) {
        if (!isReady() || !userId) return;
        saveProgress(userId, progress);
    }

    window.SupabasePersistence = {
        isReady,
        syncFromSupabase,
        pushSettings,
        pushProgress,
        loadSettings,
        saveSettings,
        loadProgress,
        saveProgress
    };
})();
