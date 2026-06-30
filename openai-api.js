/**
 * Server-backed OpenAI (ChatGPT API) integration.
 * The API key lives only on the server (OPENAI_API_KEY). Run: python app.py
 */

async function apiHealth() {
    try {
        const r = await fetch('/api/health');
        if (!r.ok) return { ok: false, ai: false };
        return await r.json();
    } catch {
        return { ok: false, ai: false };
    }
}

async function apiAi(action, payload) {
    const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
        const err = new Error(data.error || r.statusText || 'AI request failed');
        err.status = r.status;
        throw err;
    }
    return data;
}

let _aiReady = false;
let _aiAvailable = false;

async function refreshAiStatus() {
    const h = await apiHealth();
    _aiReady = true;
    _aiAvailable = h.ai === true;
    return _aiAvailable;
}

function hasApiKey() {
    return _aiAvailable;
}

/** No browser API key; kept for compatibility with older UI calls */
function setGeminiApiKey() {
    return false;
}

async function ensureAi() {
    if (!_aiReady) {
        await refreshAiStatus();
    }
    return _aiAvailable;
}

async function generateMCQ(period) {
    if (!(await ensureAi())) return null;
    try {
        const q = await apiAi('mcq', { period });
        if (q.question && q.options && q.options.length >= 4) {
            q.feedback = q.explanation || q.feedback || '';
            return q;
        }
    } catch (e) {
        console.warn('generateMCQ:', e);
    }
    return null;
}

async function generateSAQ(period, topic = null) {
    if (!(await ensureAi())) return null;
    try {
        const q = await apiAi('saq', { period, topic });
        if (q.question && q.options && q.options.length === 4 && typeof q.correct === 'number') {
            return q;
        }
    } catch (e) {
        console.warn('generateSAQ:', e);
    }
    return null;
}

async function generateDBQ(period) {
    if (!(await ensureAi())) return null;
    try {
        const dbq = await apiAi('dbq', { period });
        if (dbq.prompt && dbq.documents && dbq.points) return dbq;
    } catch (e) {
        console.warn('generateDBQ:', e);
    }
    return null;
}

async function generateLEQ(period) {
    if (!(await ensureAi())) return null;
    try {
        const leq = await apiAi('leq', { period });
        if (leq.prompt && leq.points) return leq;
    } catch (e) {
        console.warn('generateLEQ:', e);
    }
    return null;
}

async function generateLEQOutline(promptText, period = null) {
    if (!(await ensureAi())) return null;
    try {
        return await apiAi('leq-outline', { promptText, period });
    } catch (e) {
        console.warn('generateLEQOutline:', e);
    }
    return null;
}

async function generateMultipleSAQs(period, count = 3) {
    const questions = [];
    for (let i = 0; i < count; i++) {
        const question = await generateSAQ(period);
        if (question) {
            question.id = `ai-saq-${period.number}-${i + 1}`;
            questions.push(question);
        }
    }
    return questions;
}

async function gradeEssayResponse({ essayType, promptText, studentResponse, period }) {
    if (!(await ensureAi())) {
        return { error: 'AI is not available. Run the site with python app.py and set OPENAI_API_KEY on the server.' };
    }
    const trimmed = (studentResponse || '').trim();
    if (!trimmed || trimmed.length < 40) {
        return {
            error: 'Please write a longer response (at least a few sentences) before submitting for grading.'
        };
    }
    try {
        return await apiAi('grade-essay', {
            essayType,
            promptText,
            studentResponse: trimmed,
            period
        });
    } catch (e) {
        console.warn('gradeEssayResponse:', e);
        return { error: e.message || 'Grading failed.' };
    }
}

const GEMINI_CONFIG = {
    apiKey: '',
    get apiUrl() {
        return '';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    refreshAiStatus();
});

window.OpenAIAPI = {
    refreshAiStatus,
    ensureAi,
    setGeminiApiKey,
    hasApiKey,
    generateSAQ,
    generateDBQ,
    generateLEQ,
    generateLEQOutline,
    generateMCQ,
    generateMultipleSAQs,
    gradeEssayResponse,
    GEMINI_CONFIG
};

window.GeminiAPI = window.OpenAIAPI;
