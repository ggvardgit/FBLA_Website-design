// Home page functionality
document.addEventListener('DOMContentLoaded', () => {
    updateReadiness();
    updateQuickStats();
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
