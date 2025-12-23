// Resources page functionality
document.addEventListener('DOMContentLoaded', () => {
    renderResources();
    setupFilters();
    setupDBQTool();
});

// Sample resources data
const RESOURCES = [
    {
        id: 1,
        title: "DBQ Annotation Tool",
        type: "tool",
        period: "all",
        skill: "dbq",
        format: "tool",
        description: "Interactive tool for annotating and scoring DBQ responses"
    },
    {
        id: 2,
        title: "SAQ Practice Set: Period 3",
        type: "practice",
        period: 3,
        skill: "saq",
        format: "practice",
        description: "10 Short Answer Questions covering Revolution and Constitution"
    },
    {
        id: 3,
        title: "LEQ Outline Generator",
        type: "tool",
        period: "all",
        skill: "leq",
        format: "tool",
        description: "Generate structured outlines for Long Essay Questions"
    },
    {
        id: 4,
        title: "Period 5 Timeline: Civil War",
        type: "timeline",
        period: 5,
        skill: "all",
        format: "timeline",
        description: "Interactive timeline of key events from 1844-1877"
    },
    {
        id: 5,
        title: "DBQ Practice: Progressive Era",
        type: "practice",
        period: 7,
        skill: "dbq",
        format: "practice",
        description: "Full DBQ with 7 documents on Progressive reforms"
    },
    {
        id: 6,
        title: "Study Guide: Period 2",
        type: "guide",
        period: 2,
        skill: "all",
        format: "guide",
        description: "Comprehensive study guide covering Colonial America themes"
    },
    {
        id: 7,
        title: "SAQ Drills: All Periods",
        type: "practice",
        period: "all",
        skill: "saq",
        format: "practice",
        description: "Timed SAQ practice covering all 8 periods"
    },
    {
        id: 8,
        title: "LEQ Practice: Period 4",
        type: "practice",
        period: 4,
        skill: "leq",
        format: "practice",
        description: "Practice LEQ on Market Revolution and its effects"
    }
];

let currentFilters = {
    period: 'all',
    skill: 'all',
    format: 'all'
};

function renderResources() {
    const grid = document.getElementById('resources-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const filtered = RESOURCES.filter(resource => {
        if (currentFilters.period !== 'all' && resource.period !== currentFilters.period && resource.period !== 'all') {
            return false;
        }
        if (currentFilters.skill !== 'all' && resource.skill !== currentFilters.skill && resource.skill !== 'all') {
            return false;
        }
        if (currentFilters.format !== 'all' && resource.format !== currentFilters.format) {
            return false;
        }
        return true;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No resources match your filters.</p>';
        return;
    }
    
    filtered.forEach(resource => {
        const card = createResourceCard(resource);
        grid.appendChild(card);
    });
}

function createResourceCard(resource) {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    
    const typeLabels = {
        tool: 'Tool',
        practice: 'Practice',
        guide: 'Guide',
        timeline: 'Timeline'
    };
    
    const skillLabels = {
        saq: 'SAQ',
        dbq: 'DBQ',
        leq: 'LEQ',
        mcq: 'MCQ',
        all: 'All Skills'
    };
    
    card.innerHTML = `
        <span class="resource-type">${typeLabels[resource.type] || resource.type}</span>
        <h3 class="resource-title">${resource.title}</h3>
        <p class="resource-description">${resource.description}</p>
        <div class="resource-meta">
            ${resource.period !== 'all' ? `<span>Period ${resource.period}</span>` : '<span>All Periods</span>'}
            <span>${skillLabels[resource.skill] || resource.skill}</span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        handleResourceClick(resource);
    });
    
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleResourceClick(resource);
        }
    });
    
    return card;
}

function handleResourceClick(resource) {
    if (resource.type === 'tool' && resource.skill === 'dbq') {
        APUSH.openModal('dbq-modal');
    } else if (resource.format === 'practice') {
        // Navigate to practice or show practice questions
        alert(`Opening ${resource.title}. In a full implementation, this would load practice questions.`);
    } else {
        alert(`Opening ${resource.title}. In a full implementation, this would load the resource.`);
    }
}

function setupFilters() {
    const periodFilter = document.getElementById('period-filter-resources');
    const skillFilter = document.getElementById('skill-filter');
    const formatFilter = document.getElementById('format-filter');
    
    if (periodFilter) {
        periodFilter.addEventListener('change', (e) => {
            currentFilters.period = e.target.value;
            renderResources();
        });
    }
    
    if (skillFilter) {
        skillFilter.addEventListener('change', (e) => {
            currentFilters.skill = e.target.value;
            renderResources();
        });
    }
    
    if (formatFilter) {
        formatFilter.addEventListener('change', (e) => {
            currentFilters.format = e.target.value;
            renderResources();
        });
    }
}

function setupDBQTool() {
    const dbqModal = document.getElementById('dbq-modal');
    if (!dbqModal) return;
    
    // DBQ Scorer functionality
    const thesisCheckbox = document.getElementById('thesis-point');
    const contextCheckbox = document.getElementById('context-point');
    const evidenceInput = document.getElementById('evidence-points');
    const analysisInput = document.getElementById('analysis-points');
    const totalScore = document.getElementById('dbq-total-score');
    
    function updateDBQScore() {
        let score = 0;
        if (thesisCheckbox && thesisCheckbox.checked) score += 1;
        if (contextCheckbox && contextCheckbox.checked) score += 1;
        if (evidenceInput) score += parseInt(evidenceInput.value) || 0;
        if (analysisInput) score += parseInt(analysisInput.value) || 0;
        if (totalScore) totalScore.textContent = score;
    }
    
    if (thesisCheckbox) thesisCheckbox.addEventListener('change', updateDBQScore);
    if (contextCheckbox) contextCheckbox.addEventListener('change', updateDBQScore);
    if (evidenceInput) evidenceInput.addEventListener('input', updateDBQScore);
    if (analysisInput) analysisInput.addEventListener('input', updateDBQScore);
    
    // Annotation buttons
    const annotationBtns = document.querySelectorAll('.annotation-btn');
    annotationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            // In full implementation, this would add annotation functionality
            alert(`Annotation tool for ${type} would open here.`);
        });
    });
}
