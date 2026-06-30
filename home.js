// Home page functionality
document.addEventListener('DOMContentLoaded', () => {
    updateReadiness();
    updateQuickStats();
    initMetricsLab();
    initDailyChallenge();
});

function updateReadiness() {
    const progress = APUSH.getUserProgress();
    const overallMastery = APUSH.calculateOverallMastery();
    
    const percentageEl = document.getElementById('readiness-percentage');
    const progressEl = document.getElementById('readiness-progress');
    
    if (percentageEl) {
        percentageEl.textContent = `${overallMastery}%`;
    }
    
    if (progressEl) {
        progressEl.style.width = `${overallMastery}%`;
        progressEl.setAttribute('aria-valuenow', overallMastery);
    }
}

function updateQuickStats() {
    const progress = APUSH.getUserProgress();
    
    // Count completed periods
    const completedPeriods = Object.values(progress.periods).filter(p => p.completed).length;
    
    // Get practice questions count
    const practiceQuestions = progress.practiceQuestions || 0;
    
    // Get study hours (convert from minutes or use stored value)
    const studyHours = Math.round((progress.studyHours || 0) / 60);
    
    const periodsEl = document.getElementById('periods-completed');
    const questionsEl = document.getElementById('practice-questions');
    const hoursEl = document.getElementById('study-hours');
    
    if (periodsEl) periodsEl.textContent = completedPeriods;
    if (questionsEl) questionsEl.textContent = practiceQuestions;
    if (hoursEl) hoursEl.textContent = studyHours;
}

function initMetricsLab() {
    const hoursInput = document.getElementById('hours-input');
    const accuracyInput = document.getElementById('accuracy-input');
    const engagementInput = document.getElementById('engagement-input');

    if (!hoursInput || !accuracyInput || !engagementInput) {
        return;
    }

    const hoursOutput = document.getElementById('hours-output');
    const accuracyOutput = document.getElementById('accuracy-output');
    const engagementOutput = document.getElementById('engagement-output');

    const projectedScore = document.getElementById('projected-score');
    const metricStreak = document.getElementById('metric-streak');
    const metricCompletion = document.getElementById('metric-completion');
    const metricAttendance = document.getElementById('metric-attendance');
    const projectedNote = document.getElementById('projected-note');

    const progress = APUSH.getUserProgress();
    const metrics = progress.metrics || {};
    const mcq = metrics.mcq || {};
    const dbq = metrics.dbq || {};
    const leq = metrics.leq || {};
    const combinedEssayAvg = (() => {
        const weightedDbq = (dbq.avgEstimated || 0) / (dbq.maxPossible || 7);
        const weightedLeq = (leq.avgEstimated || 0) / (leq.maxPossible || 6);
        if ((dbq.attempts || 0) + (leq.attempts || 0) === 0) return 0.5;
        return clamp((weightedDbq + weightedLeq) / 2, 0, 1);
    })();
    const accountAccuracy = mcq.accuracy !== undefined ? Number(mcq.accuracy) : Math.round(combinedEssayAvg * 100);
    const engagementBaseline = clamp(
        Math.round(
            ((progress.activities || []).length * 3) +
            ((dbq.attempts || 0) * 4) +
            ((leq.attempts || 0) * 4) +
            ((mcq.attempts || 0) * 2)
        ),
        20,
        100
    );
    const hoursBaseline = clamp(Math.round((progress.studyHours || 0) / 60), 1, 15);

    hoursInput.value = String(hoursBaseline);
    accuracyInput.value = String(accountAccuracy);
    engagementInput.value = String(engagementBaseline);

    const updateOutputs = () => {
        const hours = Number(hoursInput.value);
        const accuracy = Number(accuracyInput.value);
        const engagement = Number(engagementInput.value);

        if (hoursOutput) hoursOutput.textContent = String(hours);
        if (accuracyOutput) accuracyOutput.textContent = String(accuracy);
        if (engagementOutput) engagementOutput.textContent = String(engagement);

        // Account-based projection model tied to real feature performance.
        const essayStrength = Math.round(combinedEssayAvg * 100);
        const readiness = clamp(Math.round((hours * 2.6) + (accuracy * 0.42) + (engagement * 0.26) + (essayStrength * 0.2)), 35, 99);
        const streak = clamp(Math.round((accuracy * 0.55) + (engagement * 0.3) + (hours * 1.1)), 20, 98);
        const completion = clamp(Math.round((hours * 4.2) + (essayStrength * 0.35) + (accuracy * 0.18)), 18, 97);
        const attendance = clamp(Math.round((engagement * 0.75) + ((progress.activities || []).length * 0.9)), 10, 99);

        if (projectedScore) projectedScore.textContent = `${readiness}%`;
        if (metricStreak) metricStreak.textContent = `${streak}%`;
        if (metricCompletion) metricCompletion.textContent = `${completion}%`;
        if (metricAttendance) metricAttendance.textContent = `${attendance}%`;

        if (!projectedNote) return;
        projectedNote.textContent = `Based on your account data: MCQ ${mcq.accuracy || 0}% accuracy, DBQ avg ${dbq.avgEstimated || 0}/${dbq.maxPossible || 7}, LEQ avg ${leq.avgEstimated || 0}/${leq.maxPossible || 6}.`;
    };

    hoursInput.addEventListener('input', updateOutputs);
    accuracyInput.addEventListener('input', updateOutputs);
    engagementInput.addEventListener('input', updateOutputs);
    updateOutputs();
}

function initDailyChallenge() {
    const challengeButton = document.getElementById('generate-focus-btn');
    const challengeOutput = document.getElementById('focus-challenge');

    if (!challengeButton || !challengeOutput) {
        return;
    }

    const prompts = [
        'SAQ Sprint (Period 3): Explain one cause and one effect of the French and Indian War in 4-5 sentences.',
        'DBQ Micro-Task (Period 5): Evaluate how Civil War-era federal actions reshaped citizenship from 1861-1877.',
        'LEQ Builder (Period 7): Develop a thesis on continuity and change in U.S. foreign policy from 1890-1945.',
        'Source Lens (Period 2): Compare two colonial labor systems and identify one long-term economic consequence.',
        'Argument Drill (Period 8): Defend or refute the claim that domestic policy shifted most during 1960-1980.',
        'Evidence Check (Period 6): Cite two specific examples showing the impact of industrialization on migration.'
    ];

    challengeButton.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * prompts.length);
        challengeOutput.textContent = prompts[randomIndex];
    });
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
