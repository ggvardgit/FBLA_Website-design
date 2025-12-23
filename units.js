// Units overview page functionality
document.addEventListener('DOMContentLoaded', () => {
    renderPeriodCards();
});

function renderPeriodCards() {
    const grid = document.getElementById('units-grid');
    if (!grid || !window.APUSH_DATA) return;
    
    const progress = APUSH.getUserProgress();
    
    Object.values(APUSH_DATA.periods).forEach(period => {
        const card = createPeriodCard(period, progress);
        grid.appendChild(card);
    });
}

function createPeriodCard(period, progress) {
    const card = document.createElement('div');
    card.className = 'unit-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    
    const periodProgress = progress.periods[period.number] || { mastery: 0, completed: false };
    const masteryPercentage = periodProgress.mastery || 0;
    
    // Difficulty badge
    const difficultyClass = `difficulty-${period.difficulty}`;
    const difficultyText = '★'.repeat(period.difficulty) + '☆'.repeat(5 - period.difficulty);
    
    card.innerHTML = `
        <div class="unit-card-header">
            <div>
                <h3 class="unit-card-title">Period ${period.number}: ${period.name}</h3>
                <p class="unit-card-dates">${period.dates}</p>
            </div>
            <span class="difficulty-badge ${difficultyClass}">${difficultyText}</span>
        </div>
        
        <div class="unit-card-themes">
            ${period.themes.slice(0, 4).map(theme => 
                `<span class="theme-tag">${theme}</span>`
            ).join('')}
        </div>
        
        <div class="unit-card-meta">
            <span>⏱️ ${period.studyTime} min</span>
            <span>📊 ${masteryPercentage}% Mastery</span>
        </div>
        
        <div class="unit-card-skills">
            <p style="font-size: 0.875rem; color: var(--text-muted); margin-top: var(--spacing-md);">
                Skills: ${period.skills.join(', ')}
            </p>
        </div>
    `;
    
    // Add click handler
    card.addEventListener('click', () => {
        window.location.href = `unit-study.html?period=${period.number}`;
    });
    
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = `unit-study.html?period=${period.number}`;
        }
    });
    
    return card;
}
