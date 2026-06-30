// Unit Study page functionality
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const periodNumber = parseInt(urlParams.get('period')) || 2;
    
    loadPeriod(periodNumber);
    setupTabs();
    setupPracticeQuestions();
});

let currentPeriod = null;
let mcqDisplayNumber = 1;

function resetMcqCounter() {
    mcqDisplayNumber = 1;
}

function trackUnitMetric(updateFn) {
    const isAuth = window.AuthManager && typeof window.AuthManager.isAuthenticated === 'function' && window.AuthManager.isAuthenticated();
    if (!isAuth || typeof APUSH === 'undefined' || !APUSH.getUserProgress || !APUSH.saveUserProgress) return;
    const progress = APUSH.getUserProgress();
    if (!progress.metrics) progress.metrics = {};
    updateFn(progress.metrics);
    APUSH.saveUserProgress(progress);
}

function loadPeriod(periodNumber) {
    if (!window.APUSH_DATA || !APUSH_DATA.periods[periodNumber]) {
        alert('Period not found. Redirecting to units page.');
        window.location.href = 'units.html';
        return;
    }
    
    currentPeriod = APUSH_DATA.periods[periodNumber];
    resetMcqCounter();
    
    // Update page header
    document.getElementById('period-number').textContent = periodNumber;
    document.getElementById('period-dates').textContent = currentPeriod.dates;
    document.getElementById('current-period-name').textContent = `Period ${periodNumber}`;
    
    // Update progress
    updateUnitProgress();
    
    // Load all tabs
    loadOverview();
    loadTimeline();
    loadCausesEffects();
    loadPrimarySources();
}

function updateUnitProgress() {
    const progress = APUSH.getUserProgress();
    const periodProgress = progress.periods[currentPeriod.number] || { mastery: 0 };
    const mastery = periodProgress.mastery || 0;
    
    const progressFill = document.getElementById('unit-progress-fill');
    const progressText = document.getElementById('unit-progress-text');
    
    if (progressFill) {
        progressFill.style.width = `${mastery}%`;
        progressFill.setAttribute('aria-valuenow', mastery);
    }
    
    if (progressText) {
        progressText.textContent = `${mastery}% Complete`;
    }
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Update buttons
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            
            // Update panels
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            
            const targetPanel = document.getElementById(`${targetTab}-panel`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

function loadOverview() {
    const themesGrid = document.getElementById('themes-grid');
    const skillsList = document.getElementById('skills-list');
    const conceptsList = document.getElementById('concepts-list');
    
    // Load themes
    if (themesGrid) {
        themesGrid.innerHTML = '';
        currentPeriod.themes.forEach(theme => {
            const card = document.createElement('div');
            card.className = 'theme-card';
            card.innerHTML = `
                <h4 class="theme-card-title">${theme}</h4>
            `;
            themesGrid.appendChild(card);
        });
    }
    
    // Load skills
    if (skillsList) {
        skillsList.innerHTML = '';
        currentPeriod.skills.forEach(skill => {
            const item = document.createElement('div');
            item.style.cssText = 'padding: var(--spacing-sm) var(--spacing-md); background: var(--bg-secondary); border-radius: var(--border-radius); margin-bottom: var(--spacing-sm);';
            item.textContent = skill;
            skillsList.appendChild(item);
        });
    }
    
    // Load concepts
    if (conceptsList) {
        conceptsList.innerHTML = '';
        currentPeriod.keyConcepts.forEach((concept, index) => {
            const item = document.createElement('div');
            item.style.cssText = 'padding: var(--spacing-md); background: var(--bg-secondary); border-left: 4px solid var(--primary-color); border-radius: var(--border-radius); margin-bottom: var(--spacing-md);';
            item.innerHTML = `
                <strong>${index + 1}.</strong> ${concept}
            `;
            conceptsList.appendChild(item);
        });
    }
}

function loadTimeline() {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;
    
    timeline.innerHTML = '';
    
    currentPeriod.timeline.forEach((event, index) => {
        const eventEl = document.createElement('div');
        eventEl.className = 'timeline-event';
        eventEl.setAttribute('role', 'listitem');
        
        eventEl.innerHTML = `
            <div class="timeline-content">
                <div class="timeline-date">${event.date}</div>
                <h3 class="timeline-title">${event.title}</h3>
                <p class="timeline-description">${event.description}</p>
            </div>
            <div class="timeline-marker"></div>
        `;
        
        timeline.appendChild(eventEl);
    });
}

function loadCausesEffects() {
    const container = document.getElementById('chain-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    currentPeriod.causesEffects.forEach(chain => {
        const chainEl = document.createElement('div');
        chainEl.className = 'chain-item';
        
        chainEl.innerHTML = `
            <h2 class="chain-title">${chain.title}</h2>
            <div class="chain-flow">
                ${chain.steps.map((step, index) => `
                    <div class="chain-step">
                        <div class="chain-step-title">${index + 1}. ${step.title}</div>
                        <div class="chain-step-description">${step.description}</div>
                    </div>
                    ${index < chain.steps.length - 1 ? '<div style="text-align: center; padding: var(--spacing-sm);">↓</div>' : ''}
                `).join('')}
            </div>
        `;
        
        container.appendChild(chainEl);
    });
}

function loadPrimarySources() {
    const grid = document.getElementById('sources-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    currentPeriod.primarySources.forEach(source => {
        const card = document.createElement('div');
        card.className = 'source-card';
        card.setAttribute('role', 'listitem');
        card.setAttribute('tabindex', '0');
        
        card.innerHTML = `
            <h3 class="source-title">${source.title}</h3>
            <div class="source-meta">${source.author} • ${source.date}</div>
            <p class="source-preview">${source.preview}</p>
        `;
        
        card.addEventListener('click', () => {
            showPrimarySource(source);
        });
        
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showPrimarySource(source);
            }
        });
        
        grid.appendChild(card);
    });
}

function showPrimarySource(source) {
    const modal = document.getElementById('source-modal');
    const modalTitle = document.getElementById('source-modal-title');
    const sourceContent = document.getElementById('source-content');
    const analysisQuestions = document.getElementById('analysis-questions');
    
    if (modalTitle) modalTitle.textContent = source.title;
    
    if (sourceContent) {
        sourceContent.innerHTML = `
            <div style="margin-bottom: var(--spacing-md);">
                <p style="color: var(--text-muted); font-size: 0.875rem;">
                    <strong>Author:</strong> ${source.author}<br>
                    <strong>Date:</strong> ${source.date}
                </p>
            </div>
            <div style="padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: var(--border-radius); line-height: 1.8;">
                <p>${source.preview}</p>
                <p style="margin-top: var(--spacing-md); color: var(--text-secondary); font-style: italic;">
                    [Full text would be displayed here in a complete implementation]
                </p>
            </div>
        `;
    }
    
    if (analysisQuestions) {
        analysisQuestions.innerHTML = `
            <div style="margin-top: var(--spacing-lg);">
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--border-radius); margin-bottom: var(--spacing-md);">
                    <strong>1. Historical Context:</strong> What events or conditions led to the creation of this source?
                </div>
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--border-radius); margin-bottom: var(--spacing-md);">
                    <strong>2. Author's Purpose:</strong> What was the author trying to achieve with this document?
                </div>
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--border-radius); margin-bottom: var(--spacing-md);">
                    <strong>3. Point of View:</strong> How does the author's background influence their perspective?
                </div>
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--border-radius);">
                    <strong>4. Significance:</strong> Why is this source important for understanding this period?
                </div>
            </div>
        `;
    }
    
    APUSH.openModal('source-modal');
}

function setupPracticeQuestions() {
    const practiceTypeBtns = document.querySelectorAll('.practice-type-btn');
    const practiceContent = document.getElementById('practice-content');
    
    practiceTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            practiceTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const type = btn.dataset.type;
            if (type === 'mcq') resetMcqCounter();
            loadPracticeQuestions(type);
        });
    });
    
    // Load MCQ by default
    if (practiceTypeBtns.length > 0) {
        loadPracticeQuestions('mcq');
    }
}

async function loadPracticeQuestions(type) {
    const practiceContent = document.getElementById('practice-content');
    if (!practiceContent) return;
    
    // Show loading state
    practiceContent.innerHTML = `
        <div style="text-align: center; padding: var(--spacing-2xl);">
            <div style="font-size: 2rem; margin-bottom: var(--spacing-md);">⏳</div>
            <p style="color: var(--text-secondary);">
                ${window.OpenAIAPI && window.OpenAIAPI.hasApiKey() 
                    ? 'Generating question (OpenAI)...' 
                    : 'Loading practice question...'}
            </p>
        </div>
    `;
    
    let questionSet = [];
    
    // Try to generate with server OpenAI if available
    if (window.OpenAIAPI && window.OpenAIAPI.hasApiKey()) {
        try {
            if (type === 'mcq') {
                const aiQuestion = await window.OpenAIAPI.generateMCQ(currentPeriod);
                if (aiQuestion) {
                    aiQuestion.id = `ai-${Date.now()}`;
                    aiQuestion.feedback = aiQuestion.explanation || aiQuestion.feedback || '';
                    questionSet = [aiQuestion];
                }
            } else if (type === 'dbq') {
                const aiDBQ = await window.OpenAIAPI.generateDBQ(currentPeriod);
                if (aiDBQ) {
                    aiDBQ.id = `ai-dbq-${Date.now()}`;
                    questionSet = [aiDBQ];
                }
            } else if (type === 'leq') {
                const aiLEQ = await window.OpenAIAPI.generateLEQ(currentPeriod);
                if (aiLEQ) {
                    aiLEQ.id = `ai-leq-${Date.now()}`;
                    questionSet = [aiLEQ];
                }
            }
        } catch (error) {
            console.error('Error generating AI question:', error);
            // Fall through to sample questions
        }
    }
    
    // Fallback to sample questions if AI generation failed or not available
    if (questionSet.length === 0) {
        // Generate a random variation for fallback questions
        const questionVariations = [
            {
                question: `Briefly explain ONE cause of ${currentPeriod.name} (${currentPeriod.dates}).`,
                options: ["Economic factors", "Political factors", "Social factors", "Cultural factors"],
                correct: 0,
                feedback: "Economic factors such as trade, resources, and economic systems were primary drivers of this period."
            },
            {
                question: `Briefly explain ONE effect of ${currentPeriod.name} (${currentPeriod.dates}).`,
                options: ["Social changes", "Economic growth", "Political developments", "Cultural shifts"],
                correct: 2,
                feedback: "Political developments, including new forms of government and political structures, were significant effects of this period."
            },
            {
                question: `Briefly explain ONE way ${currentPeriod.name} (${currentPeriod.dates}) changed American society.`,
                options: ["Demographic changes", "Economic transformation", "Political restructuring", "Cultural evolution"],
                correct: 1,
                feedback: "Economic transformation through new trade patterns, industries, or labor systems fundamentally changed American society."
            },
            {
                question: `Briefly explain ONE continuity from ${currentPeriod.name} (${currentPeriod.dates}) to later periods.`,
                options: ["Economic systems", "Political institutions", "Social hierarchies", "Cultural values"],
                correct: 3,
                feedback: "Cultural values and beliefs often persisted across periods, influencing later developments."
            }
        ];
        
        // Pick variation based on current MCQ number (two questions per period)
        const variationIndex = (mcqDisplayNumber - 1) % questionVariations.length;
        const selectedVariation = questionVariations[variationIndex];
        
        const questions = {
            mcq: [
                {
                    id: `fallback-${Date.now()}-${variationIndex}`,
                    question: selectedVariation.question,
                    options: selectedVariation.options,
                    correct: selectedVariation.correct,
                    feedback: selectedVariation.feedback
                }
            ],
            dbq: [
                {
                    id: 1,
                    prompt: `Evaluate the extent to which ${currentPeriod.name} represented a turning point in U.S. history.`,
                    documents: 7,
                    points: 7
                }
            ],
            leq: [
                {
                    id: 1,
                    prompt: `Evaluate the extent to which ${currentPeriod.name} changed American society in the period ${currentPeriod.dates}.`,
                    points: 6
                }
            ]
        };
        questionSet = questions[type] || [];
    }
    
    if (type === 'mcq') {
        const aiIndicator = window.OpenAIAPI && window.OpenAIAPI.hasApiKey() && questionSet[0] && questionSet[0].id.startsWith('ai-') 
            ? '<span style="font-size: 0.75rem; color: var(--primary-color); margin-left: var(--spacing-sm);">✨ AI-Generated</span>' 
            : '';
        
        practiceContent.innerHTML = questionSet.map((q, index) => {
            const explainEnc = encodeURIComponent(q.feedback || q.explanation || '');
            return `
            <div class="practice-question" data-question-id="${q.id}" data-explanation="${explainEnc}">
                <div class="question-text">
                    <strong>MCQ ${mcqDisplayNumber}:</strong> ${q.question}${aiIndicator}
                </div>
                <ul class="question-options">
                    ${q.options.map((option, optIndex) => `
                        <li class="option-item" data-option="${optIndex}" role="option">
                            ${option}
                        </li>
                    `).join('')}
                </ul>
                <div class="feedback" style="display: none;"></div>
                <div class="question-actions">
                    <button class="submit-btn" onclick="checkMCQAnswer('${String(q.id)}', ${q.correct})">Submit Answer</button>
                </div>
            </div>
        `;
        }).join('');
        
        // Add click handlers for options
        practiceContent.querySelectorAll('.option-item').forEach(item => {
            item.addEventListener('click', function() {
                const question = this.closest('.practice-question');
                question.querySelectorAll('.option-item').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    } else if (type === 'dbq') {
        const aiIndicator = window.OpenAIAPI && window.OpenAIAPI.hasApiKey() && questionSet[0] && questionSet[0].id.startsWith('ai-') 
            ? '<span style="font-size: 0.75rem; color: var(--primary-color); margin-left: var(--spacing-sm);">✨ AI-Generated</span>' 
            : '';
        practiceContent.innerHTML = `
            <div class="practice-question dbq-practice-block" data-dbq-prompt="${encodeURIComponent(questionSet[0].prompt)}">
                <div class="question-text">
                    <strong>DBQ Prompt:</strong> ${questionSet[0].prompt}${aiIndicator}
                </div>
                <p style="color: var(--text-secondary); margin: var(--spacing-lg) 0;">
                    This DBQ is written for ${questionSet[0].documents} documents. Draft your response below, then run an instant score estimate to see your likely point range and revision targets.
                </p>
                <div style="padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: var(--border-radius);">
                    <h4 style="margin-bottom: var(--spacing-md);">DBQ point rubric (max 7)</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Thesis (1 pt):</strong> Responds to the prompt with a historically defensible thesis</li>
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Context (1 pt):</strong> Describes broader historical context</li>
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Evidence (3 pts):</strong> Uses evidence to support argument</li>
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Analysis (2 pts):</strong> Explains how or why evidence supports argument</li>
                    </ul>
                </div>
                <label for="dbq-essay-input" class="config-label" style="display:block;margin-top:var(--spacing-lg);">Your response</label>
                <textarea id="dbq-essay-input" class="config-input" style="width:100%;min-height:220px;font-family:inherit;" placeholder="Write a thesis, use evidence (cite documents if you refer to them), and analyze..."></textarea>
                <div class="essay-estimate-panel" aria-label="DBQ score estimate details">
                    <h4 class="essay-rubric-title">Instant score estimate</h4>
                    <p class="essay-rubric-desc">This uses rubric-based heuristics (thesis, context, evidence density, analysis language, and structure) to estimate a likely AP-style score.</p>
                    <label class="essay-estimate-toggle" for="dbq-advanced-grade">
                        <input type="checkbox" id="dbq-advanced-grade" checked>
                        <span>Advanced grader: compare to model outline and evidence anchors</span>
                    </label>
                </div>
                <div class="question-actions" style="margin-top:var(--spacing-md);display:flex;flex-wrap:wrap;gap:var(--spacing-sm);align-items:center;">
                    <button type="button" class="submit-btn" id="dbq-grade-btn">Estimate score &amp; feedback</button>
                    <a href="resources.html" class="submit-btn" style="display: inline-block; text-decoration: none; background: var(--secondary-color);">
                        Open DBQ Tool (Resources)
                    </a>
                    ${window.OpenAIAPI && window.OpenAIAPI.hasApiKey() ? `
                    <button type="button" class="submit-btn" onclick="generateNewQuestion('dbq')" style="background-color: var(--bg-tertiary); color: var(--text-primary);">
                        New DBQ prompt
                    </button>` : ''}
                </div>
                <div id="dbq-grade-result" class="essay-rubric-result essay-grade-result" style="display:none;padding:var(--spacing-lg);background:var(--bg-secondary);border-radius:var(--border-radius);border:1px solid var(--border-color);"></div>
            </div>
        `;
        const gradeBtn = document.getElementById('dbq-grade-btn');
        const gradeOut = document.getElementById('dbq-grade-result');
        if (gradeBtn && gradeOut) {
            gradeBtn.addEventListener('click', () => applyRubricScore('dbq', gradeOut));
        }
    } else if (type === 'leq') {
        const aiIndicator = window.OpenAIAPI && window.OpenAIAPI.hasApiKey() && questionSet[0] && questionSet[0].id.startsWith('ai-') 
            ? '<span style="font-size: 0.75rem; color: var(--primary-color); margin-left: var(--spacing-sm);">✨ AI-Generated</span>' 
            : '';
        
        practiceContent.innerHTML = `
            <div class="practice-question leq-practice-block" data-leq-prompt="${encodeURIComponent(questionSet[0].prompt)}">
                <div class="question-text">
                    <strong>LEQ Prompt:</strong> ${questionSet[0].prompt}${aiIndicator}
                </div>
                <div style="margin: var(--spacing-lg) 0;">
                    <h4 style="margin-bottom: var(--spacing-md);">LEQ point rubric (max 6)</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Thesis (1 pt):</strong> Responds to the prompt with a historically defensible thesis</li>
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Context (1 pt):</strong> Describes broader historical context</li>
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Evidence (2 pts):</strong> Provides specific examples relevant to the prompt</li>
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Analysis (2 pts):</strong> Explains how or why evidence supports argument</li>
                    </ul>
                </div>
                <label for="leq-essay-input" class="config-label" style="display:block;">Your response</label>
                <textarea id="leq-essay-input" class="config-input" style="width: 100%; min-height: 220px; font-family: inherit;" placeholder="Write your thesis, context, body paragraphs with evidence, and analysis..."></textarea>
                <div class="essay-estimate-panel" aria-label="LEQ score estimate details">
                    <h4 class="essay-rubric-title">Instant score estimate</h4>
                    <p class="essay-rubric-desc">The estimator scans your draft for argument clarity, historical context, concrete evidence, and line-of-reasoning language.</p>
                    <label class="essay-estimate-toggle" for="leq-advanced-grade">
                        <input type="checkbox" id="leq-advanced-grade" checked>
                        <span>Advanced grader: compare to model outline and evidence anchors</span>
                    </label>
                </div>
                <div class="question-actions" style="margin-top:var(--spacing-md);display:flex;flex-wrap:wrap;gap:var(--spacing-sm);">
                    <button type="button" class="submit-btn" id="leq-grade-btn">Estimate score &amp; feedback</button>
                    ${window.OpenAIAPI && window.OpenAIAPI.hasApiKey() ? `
                    <button type="button" class="submit-btn" onclick="generateNewQuestion('leq')" style="background-color: var(--secondary-color);">
                        New LEQ prompt
                    </button>` : ''}
                </div>
                <div id="leq-grade-result" class="essay-rubric-result essay-grade-result" style="display:none;padding:var(--spacing-lg);background:var(--bg-secondary);border-radius:var(--border-radius);border:1px solid var(--border-color);"></div>
            </div>
        `;
        const leqGradeBtn = document.getElementById('leq-grade-btn');
        const leqGradeOut = document.getElementById('leq-grade-result');
        if (leqGradeBtn && leqGradeOut) {
            leqGradeBtn.addEventListener('click', () => applyRubricScore('leq', leqGradeOut));
        }
    }
}

function dbqScoreBand(total) {
    if (total >= 6) return { label: 'Strong', tip: 'You are in range of top scores—keep doing timed practice with the same rubric.' };
    if (total >= 4) return { label: 'Developing', tip: 'Prioritize one more piece of evidence and a sentence of analysis for each example.' };
    if (total >= 2) return { label: 'Emerging', tip: 'Make the thesis unmistakable, then build one strong paragraph before adding more.' };
    return { label: 'Getting started', tip: 'Compare your draft to the rubric language; revise one category at a time.' };
}

function leqScoreBand(total) {
    if (total >= 5) return { label: 'Strong', tip: 'Refine synthesis and counterargument if the prompt allows.' };
    if (total >= 3) return { label: 'Developing', tip: 'Add specific names, dates, or events as evidence for each claim.' };
    if (total >= 1) return { label: 'Emerging', tip: 'Lead with a defensible thesis that uses words from the prompt.' };
    return { label: 'Getting started', tip: 'Outline thesis + two examples before expanding.' };
}

function structuralHints(text, essayType) {
    const words = text.split(/\s+/).filter(Boolean).length;
    const paras = text.split(/\n\s*\n/).filter(p => p.trim().length).length;
    const hints = [];
    const minWords = essayType === 'dbq' ? 300 : 350;
    if (words < minWords) {
        hints.push(`Draft length: about ${words} words. Many successful responses are longer—add context, examples, and analysis.`);
    }
    if (paras < 2) {
        hints.push('Try splitting into paragraphs: introduction (thesis + context), body (evidence + analysis), optional conclusion.');
    }
    const lastBlock = text.trim().split('\n').pop() || '';
    if (lastBlock.length > 0 && lastBlock.length < 40) {
        hints.push('Consider a brief closing line that ties back to the prompt.');
    }
    return { words, paras, hints };
}

function normalizeKeyword(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function collectPeriodAnchors(periodData) {
    if (!periodData) return [];
    const stop = new Set(['which', 'their', 'there', 'about', 'after', 'before', 'during', 'under', 'through', 'between', 'period', 'american', 'united', 'states', 'history']);
    const raw = [];
    const timeline = Array.isArray(periodData.timeline) ? periodData.timeline : [];
    const concepts = Array.isArray(periodData.keyConcepts) ? periodData.keyConcepts : [];
    const themes = Array.isArray(periodData.themes) ? periodData.themes : [];

    timeline.slice(0, 8).forEach(event => raw.push(event.title || '', event.description || ''));
    concepts.slice(0, 8).forEach(item => raw.push(item));
    themes.slice(0, 8).forEach(item => raw.push(item));

    const terms = raw
        .map(normalizeKeyword)
        .join(' ')
        .split(' ')
        .filter(token => token.length >= 5 && !stop.has(token));

    return Array.from(new Set(terms)).slice(0, 24);
}

function buildModelOutline(essayType, promptText, periodData) {
    const promptTerms = normalizeKeyword(promptText)
        .split(' ')
        .filter(token => token.length >= 5)
        .slice(0, 10);
    const anchors = collectPeriodAnchors(periodData);
    const timeline = Array.isArray(periodData && periodData.timeline) ? periodData.timeline : [];
    const contextExamples = timeline.slice(0, 3).map(item => item.title).filter(Boolean);

    const evidenceTarget = essayType === 'dbq' ? 8 : 6;
    return {
        promptTerms,
        anchors,
        contextExamples,
        evidenceTarget,
        thesisChecklist: [
            'Directly answers the prompt using extent/degree language',
            'Mentions a historical category of change or continuity',
            'Sets up a line of reasoning for body paragraphs'
        ]
    };
}

function evaluateAdvancedCoverage(essayText, model) {
    const text = normalizeKeyword(essayText);
    const coveredPromptTerms = model.promptTerms.filter(term => text.includes(term));
    const coveredAnchors = model.anchors.filter(term => text.includes(term));
    const missingAnchors = model.anchors.filter(term => !text.includes(term)).slice(0, 8);

    const promptCoverage = model.promptTerms.length ? (coveredPromptTerms.length / model.promptTerms.length) : 0;
    const anchorCoverage = model.anchors.length ? (coveredAnchors.length / model.anchors.length) : 0;
    const rawEvidenceMentions = coveredAnchors.length + coveredPromptTerms.length;
    const evidenceCoverage = Math.min(1, rawEvidenceMentions / Math.max(1, model.evidenceTarget));
    const coverageScore = Math.round((promptCoverage * 0.35 + anchorCoverage * 0.4 + evidenceCoverage * 0.25) * 100);

    const advancedTips = [];
    if (promptCoverage < 0.55) advancedTips.push('Echo more prompt language in your thesis and topic sentences to stay tightly on-task.');
    if (anchorCoverage < 0.35) advancedTips.push('Add more period-specific references (events, people, laws, or terms) to strengthen evidence quality.');
    if (evidenceCoverage < 0.55) advancedTips.push(`Increase specific evidence mentions to at least ${model.evidenceTarget}.`);
    if (missingAnchors.length) advancedTips.push(`Consider weaving in: ${missingAnchors.slice(0, 4).join(', ')}.`);

    return {
        coverageScore,
        coveredPromptTerms,
        coveredAnchors,
        missingAnchors,
        advancedTips
    };
}

function estimateEssayScore(essayType, promptText, essayText, options = {}) {
    const { advanced = false, periodData = null } = options;
    const text = essayText.toLowerCase();
    const firstChunk = text.split(/[.!?]/).slice(0, 2).join(' ');
    const words = essayText.split(/\s+/).filter(Boolean).length;
    const sentences = essayText.split(/[.!?]/).map(s => s.trim()).filter(Boolean).length;

    const thesisSignals = ['although', 'while', 'because', 'therefore', 'thus', 'however', 'overall', 'ultimately', 'extent'];
    const contextSignals = ['before', 'earlier', 'previously', 'prior to', 'in the broader context', 'long-term', 'continuity'];
    const analysisSignals = ['because', 'therefore', 'as a result', 'led to', 'resulted in', 'this shows', 'which meant', 'however', 'although', 'whereas'];
    const complexitySignals = ['however', 'although', 'despite', 'on the other hand', 'nevertheless', 'both', 'while also'];

    const yearMatches = essayText.match(/\b(1[6-9]\d{2}|20\d{2})s?\b/g) || [];
    const docRefs = (text.match(/\bdoc(ument)?\b/g) || []).length;
    const quoteRefs = (essayText.match(/["']/g) || []).length / 2;

    const promptKeywords = (promptText || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(token => token.length >= 5)
        .slice(0, 8);
    const keywordHits = promptKeywords.filter(token => text.includes(token)).length;

    const thesisSignalHits = thesisSignals.filter(sig => firstChunk.includes(sig)).length;
    const contextSignalHits = contextSignals.filter(sig => text.includes(sig)).length;
    const analysisSignalHits = analysisSignals.filter(sig => text.includes(sig)).length;
    const complexityHits = complexitySignals.filter(sig => text.includes(sig)).length;

    let thesis = 0;
    if (words >= 90 && (thesisSignalHits >= 1 || keywordHits >= Math.min(2, promptKeywords.length))) thesis = 1;

    let context = 0;
    if (words >= 120 && (contextSignalHits >= 1 || yearMatches.length >= 2)) context = 1;

    let evidence = 0;
    if (essayType === 'dbq') {
        const rawEvidence = yearMatches.length + docRefs + Math.min(2, Math.floor(quoteRefs));
        if (rawEvidence >= 2) evidence = 1;
        if (rawEvidence >= 4) evidence = 2;
        if (rawEvidence >= 6 || docRefs >= 3) evidence = 3;
    } else {
        const rawEvidence = yearMatches.length + Math.min(2, Math.floor(quoteRefs));
        if (rawEvidence >= 2) evidence = 1;
        if (rawEvidence >= 4) evidence = 2;
    }

    let analysis = 0;
    if (analysisSignalHits >= 2 && sentences >= 5) analysis = 1;
    if (analysisSignalHits >= 4 || complexityHits >= 2) analysis = 2;

    const maxTotal = essayType === 'dbq' ? 7 : 6;
    let total = thesis + context + evidence + analysis;
    let confidence = Math.max(45, Math.min(95, 40 + (words / 12) + (analysisSignalHits * 4)));

    const improvementTips = [];
    if (!thesis) improvementTips.push('Start with a clearer one-sentence claim that directly answers the prompt using “to a great/moderate/limited extent.”');
    if (!context) improvementTips.push('Add 2–3 context sentences about what happened before this period and why it matters.');
    if (evidence < (essayType === 'dbq' ? 2 : 1)) improvementTips.push('Use more specific evidence: named events, laws, people, dates, and (for DBQ) document references.');
    if (analysis < 2) improvementTips.push('After each evidence point, add a “because/therefore” sentence explaining how it proves your argument.');
    if (words < (essayType === 'dbq' ? 300 : 350)) improvementTips.push(`Expand your response. Aim for at least ${essayType === 'dbq' ? 300 : 350}+ words for stronger coverage.`);

    let advancedResult = null;
    if (advanced && periodData) {
        const model = buildModelOutline(essayType, promptText, periodData);
        advancedResult = evaluateAdvancedCoverage(essayText, model);

        if (advancedResult.coverageScore >= 70 && evidence < (essayType === 'dbq' ? 3 : 2)) {
            evidence += 1;
        }
        if (advancedResult.coverageScore >= 75 && analysis < 2 && analysisSignalHits >= 1) {
            analysis += 1;
        }

        total = Math.min(maxTotal, thesis + context + evidence + analysis);
        confidence = Math.min(97, confidence + 6);
        improvementTips.push(...advancedResult.advancedTips);
        advancedResult.model = model;
    }

    return { thesis, context, evidence, analysis, total, maxTotal, confidence: Math.round(confidence), improvementTips, advancedResult };
}

/** Heuristic AP-style estimate + structural tips (no external AI). */
function applyRubricScore(essayType, resultEl) {
    const ta = document.getElementById(essayType === 'dbq' ? 'dbq-essay-input' : 'leq-essay-input');
    const text = ta ? ta.value.trim() : '';
    if (!text) {
        alert('Write a draft first, then tap “Estimate score & feedback”.');
        return;
    }

    const block = ta.closest('.practice-question');
    const promptAttr = essayType === 'dbq' ? 'data-dbq-prompt' : 'data-leq-prompt';
    const promptText = block ? decodeURIComponent(block.getAttribute(promptAttr) || '') : '';
    const advancedToggleId = essayType === 'dbq' ? 'dbq-advanced-grade' : 'leq-advanced-grade';
    const advancedEnabled = !!document.getElementById(advancedToggleId)?.checked;
    const estimate = estimateEssayScore(essayType, promptText, text, { advanced: advancedEnabled, periodData: currentPeriod });
    const { thesis, context, evidence, analysis, total, maxTotal, confidence, improvementTips, advancedResult } = estimate;
    const band = essayType === 'dbq' ? dbqScoreBand(total) : leqScoreBand(total);
    const { words, paras, hints } = structuralHints(text, essayType);

    resultEl.style.display = 'block';
    const hintList = hints.map(h => `<li>${h}</li>`).join('');
    const improvementList = Array.from(new Set(improvementTips)).map(t => `<li>${t}</li>`).join('');
    const pct = Math.round((total / maxTotal) * 100);
    const advancedBlock = advancedResult ? `
        <div class="essay-advanced-block">
            <h5>Advanced model-outline alignment: ${advancedResult.coverageScore}%</h5>
            <p class="essay-advanced-text">Covered prompt terms: ${advancedResult.coveredPromptTerms.length} | Period anchors used: ${advancedResult.coveredAnchors.length}</p>
            <p class="essay-advanced-text"><strong>Suggested context examples:</strong> ${advancedResult.model.contextExamples.slice(0, 3).join(' | ') || 'Use broader context from events before the prompt period.'}</p>
            <div class="essay-advanced-chips">
                ${advancedResult.coveredAnchors.slice(0, 10).map(term => `<span class="essay-advanced-chip">${term}</span>`).join('') || '<span class="essay-advanced-chip">No anchor terms detected yet</span>'}
            </div>
            ${advancedResult.missingAnchors.length ? `
            <p class="essay-advanced-missing"><strong>Missing high-value anchors:</strong> ${advancedResult.missingAnchors.slice(0, 6).join(', ')}</p>
            ` : ''}
        </div>
    ` : '';
    resultEl.innerHTML = `
        <div class="essay-estimate-header">
            <h4 class="essay-estimate-title">Estimated score: ${total} / ${maxTotal} (${band.label})</h4>
            <span class="essay-estimate-confidence">Confidence: ~${confidence}%</span>
        </div>
        <div class="essay-estimate-meter" aria-hidden="true">
            <span style="width:${pct}%"></span>
        </div>
        <div class="essay-estimate-grid">
            <div class="essay-estimate-tile"><strong>Thesis</strong><span>${thesis} / 1</span></div>
            <div class="essay-estimate-tile"><strong>Context</strong><span>${context} / 1</span></div>
            <div class="essay-estimate-tile"><strong>Evidence</strong><span>${evidence} / ${essayType === 'dbq' ? 3 : 2}</span></div>
            <div class="essay-estimate-tile"><strong>Analysis</strong><span>${analysis} / 2</span></div>
        </div>
        ${advancedBlock}
        <p style="color:var(--text-secondary);">${band.tip}</p>
        <p style="margin-bottom:0.25rem;"><strong>Revision priorities:</strong></p>
        <ul class="essay-rubric-hints">
            ${improvementList}
        </ul>
        <p style="margin-bottom:0.25rem;"><strong>Structural check</strong> (automated hints only, not a grade):</p>
        <ul class="essay-rubric-hints">
            <li>About ${words} words, ${paras} paragraph block(s).</li>
            ${hintList}
        </ul>
        <p style="color:var(--text-muted);font-size:0.875rem;margin-top:var(--spacing-md);">Estimate only. Real AP scores come from human readers, but this is useful for fast iterative practice.</p>
    `;

    trackUnitMetric(metrics => {
        const bucket = essayType === 'dbq' ? 'dbq' : 'leq';
        metrics[bucket] = metrics[bucket] || {};
        metrics[bucket].attempts = (metrics[bucket].attempts || 0) + 1;
        metrics[bucket].totalEstimated = (metrics[bucket].totalEstimated || 0) + total;
        metrics[bucket].maxPossible = maxTotal;
        metrics[bucket].avgEstimated = Number((metrics[bucket].totalEstimated / metrics[bucket].attempts).toFixed(2));
        metrics[bucket].lastConfidence = confidence;
        metrics[bucket].lastUpdatedAt = new Date().toISOString();
    });
}

// Generate new question using AI
async function generateNewQuestion(type) {
    const practiceContent = document.getElementById('practice-content');
    if (!practiceContent) return;
    
    // If API is available, use it; otherwise use fallback
    if (window.OpenAIAPI && window.OpenAIAPI.hasApiKey()) {
        await loadPracticeQuestions(type);
    } else {
        // For fallback, just reload with a new question
        await loadPracticeQuestions(type);
    }
}

function checkMCQAnswer(questionId, correctIndex) {
    // Handle both string and number IDs
    const questionEl = document.querySelector(`[data-question-id="${questionId}"]`);
    if (!questionEl) {
        console.error('Question element not found for ID:', questionId);
        return;
    }
    
    const selectedOption = questionEl.querySelector('.option-item.selected');
    if (!selectedOption) {
        alert('Please select an answer first.');
        return;
    }
    
    const selectedIndex = parseInt(selectedOption.dataset.option);
    const feedbackEl = questionEl.querySelector('.feedback');
    const submitBtn = questionEl.querySelector('.submit-btn');
    
    // Mark options
    questionEl.querySelectorAll('.option-item').forEach((item, index) => {
        item.classList.remove('selected');
        if (index === correctIndex) {
            item.classList.add('correct');
        } else if (index === selectedIndex && index !== correctIndex) {
            item.classList.add('incorrect');
        }
    });
    
    // Show feedback
    if (feedbackEl) {
        feedbackEl.style.display = 'block';
        if (selectedIndex === correctIndex) {
            feedbackEl.className = 'feedback correct';
            let extra = '';
            try {
                const enc = questionEl.getAttribute('data-explanation');
                if (enc) extra = ' ' + decodeURIComponent(enc);
            } catch (e) { /* ignore */ }
            feedbackEl.textContent = '✓ Correct!' + extra;
            trackUnitMetric(metrics => {
                metrics.mcq = metrics.mcq || {};
                metrics.mcq.attempts = (metrics.mcq.attempts || 0) + 1;
                metrics.mcq.correct = (metrics.mcq.correct || 0) + 1;
                metrics.mcq.accuracy = Number(((metrics.mcq.correct / metrics.mcq.attempts) * 100).toFixed(1));
            });
            
            // Update progress
            updatePracticeProgress(true);
        } else {
            feedbackEl.className = 'feedback incorrect';
            let extra = '';
            try {
                const enc = questionEl.getAttribute('data-explanation');
                if (enc) extra = ' ' + decodeURIComponent(enc);
            } catch (e) { /* ignore */ }
            feedbackEl.textContent = '✗ Incorrect. The correct answer is: ' + questionEl.querySelectorAll('.option-item')[correctIndex].textContent + '.' + extra;
            trackUnitMetric(metrics => {
                metrics.mcq = metrics.mcq || {};
                metrics.mcq.attempts = (metrics.mcq.attempts || 0) + 1;
                metrics.mcq.incorrect = (metrics.mcq.incorrect || 0) + 1;
                const correct = metrics.mcq.correct || 0;
                metrics.mcq.accuracy = Number(((correct / metrics.mcq.attempts) * 100).toFixed(1));
            });
            
            updatePracticeProgress(false);
        }
    }
    
    // Disable submit button
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Answered';
    }
    
    // Add "Next Question" button after answering
    const nextBtn = questionEl.querySelector('.next-question-btn');
    if (!nextBtn) {
        const nextButton = document.createElement('button');
        nextButton.className = 'submit-btn next-question-btn';
        nextButton.style.cssText = 'background-color: var(--success-color); margin-top: var(--spacing-md);';
        nextButton.textContent = 'Next Question →';
        nextButton.onclick = () => {
            mcqDisplayNumber += 1;
            const practiceTypeBtns = document.querySelectorAll('.practice-type-btn');
            const activeType = Array.from(practiceTypeBtns).find(btn => btn.classList.contains('active'));
            const currentType = activeType ? activeType.dataset.type : 'mcq';
            loadPracticeQuestions(currentType);
        };
        submitBtn.parentNode.insertBefore(nextButton, submitBtn.nextSibling);
    }
}

function updatePracticeProgress(correct) {
    const isAuth = window.AuthManager && typeof window.AuthManager.isAuthenticated === 'function' && window.AuthManager.isAuthenticated();
    if (!isAuth) {
        if (!document.getElementById('practice-login-save-hint')) {
            const practiceContent = document.getElementById('practice-content');
            if (practiceContent) {
                const hint = document.createElement('div');
                hint.id = 'practice-login-save-hint';
                hint.style.cssText = 'margin: var(--spacing-md) 0; padding: var(--spacing-sm) var(--spacing-md); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-secondary); background: var(--bg-secondary); font-size: 0.875rem;';
                hint.textContent = 'You are in guest mode. Progress is not saved until you log in.';
                practiceContent.prepend(hint);
            }
        }
        updateUnitProgress();
        return;
    }

    const progress = APUSH.getUserProgress();
    APUSH.recordPracticeAttempt(progress, currentPeriod.number, correct);
    
    // Add activity
    if (!progress.activities) progress.activities = [];
    progress.activities.push({
        action: `Completed practice question in Period ${currentPeriod.number}`,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 20 activities
    if (progress.activities.length > 20) {
        progress.activities = progress.activities.slice(-20);
    }
    
    APUSH.saveUserProgress(progress);
    updateUnitProgress();
}

// Make functions available globally
window.checkMCQAnswer = checkMCQAnswer;
window.generateNewQuestion = generateNewQuestion;
