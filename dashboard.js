// Dashboard page functionality
document.addEventListener('DOMContentLoaded', () => {
    updateOverallStats();
    renderMasteryByPeriod();
    renderRecommendations();
    renderWeakestThemes();
    renderSkillsProgress();
    renderRecentActivity();
});

function updateOverallStats() {
    const progress = APUSH.getUserProgress();
    const overallMastery = APUSH.calculateOverallMastery();
    
    // Update overall mastery circle
    const progressRing = document.querySelector('.progress-ring-progress');
    if (progressRing) {
        const circumference = 2 * Math.PI * 54; // radius = 54
        const offset = circumference - (overallMastery / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
    }
    
    const masteryValue = document.getElementById('overall-mastery');
    if (masteryValue) masteryValue.textContent = `${overallMastery}%`;
    
    // Count completed periods
    const completedCount = Object.values(progress.periods).filter(p => p.completed).length;
    const periodsEl = document.getElementById('periods-completed-count');
    if (periodsEl) periodsEl.textContent = `${completedCount}/8`;
    
    // Count mastered skills (skills with >70% mastery)
    const masteredSkills = Object.values(progress.skills).filter(s => s >= 70).length;
    const skillsEl = document.getElementById('skills-mastered-count');
    if (skillsEl) skillsEl.textContent = `${masteredSkills}/24`;
    
    // Total practice questions
    const questionsEl = document.getElementById('total-practice-questions');
    if (questionsEl) questionsEl.textContent = progress.practiceQuestions || 0;
}

function renderMasteryByPeriod() {
    const list = document.getElementById('mastery-list');
    if (!list || !window.APUSH_DATA) return;
    
    const progress = APUSH.getUserProgress();
    
    Object.values(APUSH_DATA.periods).forEach(period => {
        const periodProgress = progress.periods[period.number] || { mastery: 0 };
        const mastery = periodProgress.mastery || 0;
        
        const item = document.createElement('div');
        item.className = 'mastery-item';
        item.setAttribute('role', 'listitem');
        
        item.innerHTML = `
            <span class="mastery-period">Period ${period.number}</span>
            <div class="mastery-bar-container">
                <div class="mastery-bar" style="width: ${mastery}%"></div>
            </div>
            <span class="mastery-percentage">${mastery}%</span>
        `;
        
        list.appendChild(item);
    });
}

function renderRecommendations() {
    const container = document.getElementById('recommendation-content');
    if (!container || !window.APUSH_DATA) return;
    
    const progress = APUSH.getUserProgress();
    
    // Find period with lowest mastery
    let lowestMastery = 100;
    let recommendedPeriod = null;
    
    Object.values(APUSH_DATA.periods).forEach(period => {
        const periodProgress = progress.periods[period.number] || { mastery: 0 };
        const mastery = periodProgress.mastery || 0;
        
        if (mastery < lowestMastery) {
            lowestMastery = mastery;
            recommendedPeriod = period;
        }
    });
    
    if (recommendedPeriod && lowestMastery < 100) {
        container.innerHTML = `
            <div class="recommendation-item">
                <h3 style="margin-bottom: var(--spacing-sm);">Period ${recommendedPeriod.number}: ${recommendedPeriod.name}</h3>
                <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">
                    Your current mastery is ${lowestMastery}%. Focus on this period to improve your overall score.
                </p>
                <a href="unit-study.html?period=${recommendedPeriod.number}" 
                   class="submit-btn" 
                   style="display: inline-block; text-decoration: none;">
                    Study Now
                </a>
            </div>
        `;
    } else {
        container.innerHTML = `
            <p class="recommendation-text">Great job! You've completed all periods. Review your weakest themes or take practice exams.</p>
        `;
    }
}

function renderWeakestThemes() {
    const list = document.getElementById('weaknesses-list');
    if (!list || !window.APUSH_DATA) return;
    
    const progress = APUSH.getUserProgress();
    
    // Collect all themes with their associated periods
    const themeScores = {};
    
    Object.values(APUSH_DATA.periods).forEach(period => {
        const periodProgress = progress.periods[period.number] || { mastery: 0 };
        const mastery = periodProgress.mastery || 0;
        
        period.themes.forEach(theme => {
            if (!themeScores[theme]) {
                themeScores[theme] = { total: 0, count: 0 };
            }
            themeScores[theme].total += mastery;
            themeScores[theme].count += 1;
        });
    });
    
    // Calculate averages and sort
    const weaknesses = Object.entries(themeScores)
        .map(([theme, data]) => ({
            theme,
            average: data.total / data.count
        }))
        .sort((a, b) => a.average - b.average)
        .slice(0, 5);
    
    if (weaknesses.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary);">Complete some periods to see your weakest themes.</p>';
        return;
    }
    
    weaknesses.forEach(weakness => {
        const item = document.createElement('div');
        item.className = 'mastery-item';
        item.setAttribute('role', 'listitem');
        
        item.innerHTML = `
            <span class="mastery-period">${weakness.theme}</span>
            <div class="mastery-bar-container">
                <div class="mastery-bar" style="width: ${weakness.average}%"></div>
            </div>
            <span class="mastery-percentage">${Math.round(weakness.average)}%</span>
        `;
        
        list.appendChild(item);
    });
}

function renderSkillsProgress() {
    const grid = document.getElementById('skills-grid');
    if (!grid || !window.APUSH_DATA) return;
    
    const progress = APUSH.getUserProgress();
    
    APUSH_DATA.skills.forEach(skill => {
        const skillScore = progress.skills[skill.id] || 0;
        
        const item = document.createElement('div');
        item.className = 'skill-item';
        item.setAttribute('role', 'listitem');
        item.style.cssText = 'padding: var(--spacing-md); background: var(--bg-tertiary); border-radius: var(--border-radius);';
        
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                <span style="font-weight: 600;">${skill.name}</span>
                <span style="color: var(--primary-color); font-weight: 600;">${skillScore}%</span>
            </div>
            <div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; background: var(--primary-color); width: ${skillScore}%; transition: width var(--transition-base);"></div>
            </div>
        `;
        
        grid.appendChild(item);
    });
}

function renderRecentActivity() {
    const list = document.getElementById('activity-list');
    if (!list) return;
    
    const progress = APUSH.getUserProgress();
    const activities = progress.activities || [];
    
    if (activities.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary);">No recent activity. Start studying to see your progress!</p>';
        return;
    }
    
    // Show last 5 activities
    activities.slice(-5).reverse().forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.style.cssText = 'padding: var(--spacing-md); border-bottom: 1px solid var(--border-color);';
        
        const date = new Date(activity.timestamp);
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <p style="margin: 0; font-weight: 600;">${activity.action}</p>
                    <p style="margin: var(--spacing-xs) 0 0 0; color: var(--text-muted); font-size: 0.875rem;">
                        ${APUSH.formatDate(date)} at ${APUSH.formatTime(date)}
                    </p>
                </div>
            </div>
        `;
        
        list.appendChild(item);
    });
}
