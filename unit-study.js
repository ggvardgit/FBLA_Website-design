// Unit Study page functionality
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const periodNumber = parseInt(urlParams.get('period')) || 2;
    
    loadPeriod(periodNumber);
    setupTabs();
    setupPracticeQuestions();
});

let currentPeriod = null;

function loadPeriod(periodNumber) {
    if (!window.APUSH_DATA || !APUSH_DATA.periods[periodNumber]) {
        alert('Period not found. Redirecting to units page.');
        window.location.href = 'units.html';
        return;
    }
    
    currentPeriod = APUSH_DATA.periods[periodNumber];
    
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
            loadPracticeQuestions(type);
        });
    });
    
    // Load SAQ by default
    if (practiceTypeBtns.length > 0) {
        loadPracticeQuestions('saq');
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
                ${window.GeminiAPI && window.GeminiAPI.hasApiKey() 
                    ? 'Generating AI-powered question...' 
                    : 'Loading practice question...'}
            </p>
        </div>
    `;
    
    let questionSet = [];
    
    // Try to generate with Gemini AI if available
    if (window.GeminiAPI && window.GeminiAPI.hasApiKey()) {
        try {
            if (type === 'saq') {
                const aiQuestion = await window.GeminiAPI.generateSAQ(currentPeriod);
                if (aiQuestion) {
                    aiQuestion.id = `ai-${Date.now()}`;
                    questionSet = [aiQuestion];
                }
            } else if (type === 'dbq') {
                const aiDBQ = await window.GeminiAPI.generateDBQ(currentPeriod);
                if (aiDBQ) {
                    aiDBQ.id = `ai-dbq-${Date.now()}`;
                    questionSet = [aiDBQ];
                }
            } else if (type === 'leq') {
                const aiLEQ = await window.GeminiAPI.generateLEQ(currentPeriod);
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
        const questions = {
            saq: [
                {
                    id: 1,
                    question: `Briefly explain ONE cause of ${currentPeriod.name} (${currentPeriod.dates}).`,
                    options: [
                        "Economic factors",
                        "Political factors",
                        "Social factors",
                        "Cultural factors"
                    ],
                    correct: 0,
                    feedback: "Economic factors such as trade, resources, and economic systems were primary drivers of this period."
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
    
    if (type === 'saq') {
        const aiIndicator = window.GeminiAPI && window.GeminiAPI.hasApiKey() && questionSet[0] && questionSet[0].id.startsWith('ai-') 
            ? '<span style="font-size: 0.75rem; color: var(--primary-color); margin-left: var(--spacing-sm);">✨ AI-Generated</span>' 
            : '';
        
        practiceContent.innerHTML = questionSet.map((q, index) => `
            <div class="practice-question" data-question-id="${q.id}">
                <div class="question-text">
                    <strong>Question ${index + 1}:</strong> ${q.question}${aiIndicator}
                </div>
                <ul class="question-options">
                    ${q.options.map((option, optIndex) => `
                        <li class="option-item" data-option="${optIndex}" role="option">
                            ${option}
                        </li>
                    `).join('')}
                </ul>
                <div class="feedback" style="display: none;"></div>
                <button class="submit-btn" onclick="checkSAQAnswer('${String(q.id)}', ${q.correct})">Submit Answer</button>
                ${window.GeminiAPI && window.GeminiAPI.hasApiKey() ? `
                    <button class="submit-btn" onclick="generateNewQuestion('saq')" style="background-color: var(--secondary-color); margin-top: var(--spacing-md);">
                        Generate New Question
                    </button>
                ` : ''}
            </div>
        `).join('');
        
        // Add click handlers for options
        practiceContent.querySelectorAll('.option-item').forEach(item => {
            item.addEventListener('click', function() {
                const question = this.closest('.practice-question');
                question.querySelectorAll('.option-item').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    } else if (type === 'dbq') {
        const aiIndicator = window.GeminiAPI && window.GeminiAPI.hasApiKey() && questionSet[0] && questionSet[0].id.startsWith('ai-') 
            ? '<span style="font-size: 0.75rem; color: var(--primary-color); margin-left: var(--spacing-sm);">✨ AI-Generated</span>' 
            : '';
        
        practiceContent.innerHTML = `
            <div class="practice-question">
                <div class="question-text">
                    <strong>DBQ Prompt:</strong> ${questionSet[0].prompt}${aiIndicator}
                </div>
                <p style="color: var(--text-secondary); margin: var(--spacing-lg) 0;">
                    This DBQ includes ${questionSet[0].documents} documents. Use the DBQ Annotation Tool in the Resources section to practice annotating and scoring your response.
                </p>
                <div style="padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: var(--border-radius);">
                    <h4 style="margin-bottom: var(--spacing-md);">DBQ Scoring Rubric:</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Thesis (1 pt):</strong> Responds to the prompt with a historically defensible thesis</li>
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Context (1 pt):</strong> Describes broader historical context</li>
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Evidence (3 pts):</strong> Uses at least 6 documents to support argument</li>
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Analysis (2 pts):</strong> Explains how or why document supports argument</li>
                    </ul>
                </div>
                <a href="resources.html" class="submit-btn" style="display: inline-block; text-decoration: none; margin-top: var(--spacing-lg);">
                    Open DBQ Tool
                </a>
                ${window.GeminiAPI && window.GeminiAPI.hasApiKey() ? `
                    <button class="submit-btn" onclick="generateNewQuestion('dbq')" style="background-color: var(--secondary-color); margin-top: var(--spacing-md);">
                        Generate New DBQ Prompt
                    </button>
                ` : ''}
            </div>
        `;
    } else if (type === 'leq') {
        const aiIndicator = window.GeminiAPI && window.GeminiAPI.hasApiKey() && questionSet[0] && questionSet[0].id.startsWith('ai-') 
            ? '<span style="font-size: 0.75rem; color: var(--primary-color); margin-left: var(--spacing-sm);">✨ AI-Generated</span>' 
            : '';
        
        practiceContent.innerHTML = `
            <div class="practice-question">
                <div class="question-text">
                    <strong>LEQ Prompt:</strong> ${questionSet[0].prompt}${aiIndicator}
                </div>
                <div style="margin: var(--spacing-lg) 0;">
                    <h4 style="margin-bottom: var(--spacing-md);">LEQ Scoring Rubric:</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Thesis (1 pt):</strong> Responds to the prompt with a historically defensible thesis</li>
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Context (1 pt):</strong> Describes broader historical context</li>
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Evidence (2 pts):</strong> Provides specific examples relevant to the prompt</li>
                        <li style="padding: var(--spacing-sm) 0;">✓ <strong>Analysis (2 pts):</strong> Explains how or why evidence supports argument</li>
                    </ul>
                </div>
                <div style="padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: var(--border-radius); margin-top: var(--spacing-lg);">
                    <h4 style="margin-bottom: var(--spacing-md);">Outline Your Response:</h4>
                    <textarea style="width: 100%; min-height: 200px; padding: var(--spacing-md); border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--bg-primary); color: var(--text-primary); font-family: inherit;" placeholder="Write your thesis, context, evidence, and analysis here..."></textarea>
                </div>
                ${window.GeminiAPI && window.GeminiAPI.hasApiKey() ? `
                    <button class="submit-btn" onclick="generateNewQuestion('leq')" style="background-color: var(--secondary-color); margin-top: var(--spacing-md);">
                        Generate New LEQ Prompt
                    </button>
                ` : ''}
            </div>
        `;
    }
}

// Generate new question using AI
async function generateNewQuestion(type) {
    const practiceContent = document.getElementById('practice-content');
    if (!practiceContent || !window.GeminiAPI || !window.GeminiAPI.hasApiKey()) {
        alert('Please configure your Gemini API key in the settings to generate new questions.');
        return;
    }
    
    await loadPracticeQuestions(type);
}

function checkSAQAnswer(questionId, correctIndex) {
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
            feedbackEl.textContent = '✓ Correct! ' + (questionEl.querySelector('.option-item.correct').textContent);
            
            // Update progress
            updatePracticeProgress(true);
        } else {
            feedbackEl.className = 'feedback incorrect';
            feedbackEl.textContent = '✗ Incorrect. The correct answer is: ' + questionEl.querySelectorAll('.option-item')[correctIndex].textContent;
            
            updatePracticeProgress(false);
        }
    }
    
    // Disable submit button
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Answered';
    }
}

function updatePracticeProgress(correct) {
    const progress = APUSH.getUserProgress();
    progress.practiceQuestions = (progress.practiceQuestions || 0) + 1;
    
    // Update period mastery based on practice
    if (!progress.periods[currentPeriod.number]) {
        progress.periods[currentPeriod.number] = { mastery: 0, completed: false };
    }
    
    if (correct) {
        progress.periods[currentPeriod.number].mastery = Math.min(100, (progress.periods[currentPeriod.number].mastery || 0) + 5);
    }
    
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
window.checkSAQAnswer = checkSAQAnswer;
window.generateNewQuestion = generateNewQuestion;
