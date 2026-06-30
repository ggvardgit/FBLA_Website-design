// Resources page functionality
document.addEventListener('DOMContentLoaded', () => {
    renderResources();
    setupFilters();
    setupDBQTool();
    setupSAQPractice();
    setupTimeline();
    setupLEQOutline();
    setupDBQPractice();
    setupLEQPractice();
    setupStudyGuide();
    setupQuestionBankActions();
});

const PERIOD_NUMBERS = Object.keys((window.APUSH_DATA && window.APUSH_DATA.periods) || {})
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

function promptBank() {
    return window.APUSHPromptBank || null;
}

function rawPromptBank() {
    const helper = promptBank();
    if (helper && typeof helper.bank === 'function') return helper.bank();
    return window.APUSH_PROMPT_BANK || null;
}

function isRealDbqSourceSet(sources) {
    if (!Array.isArray(sources) || sources.length === 0) return false;
    return sources.some(source => {
        const title = String(source && source.title || '');
        const excerpt = String(source && source.excerpt || '');
        return !/^Document\s+\d+/i.test(title) && !/Evidence excerpt/i.test(excerpt);
    });
}

function resolveDbqForPeriod(period, seed) {
    const pb = promptBank();
    if (pb) {
        const item = pb.getDbq(period, seed);
        if (item && isRealDbqSourceSet(item.sources)) {
            return {
                prompt: item.prompt,
                sources: (item.sources || []).slice(0, 6),
                fullTexts: pb.buildLegacySourceTexts(item.sources || []),
                meta: item
            };
        }
        if (item && item.prompt) {
            const p = String(period === 'all' ? item.period : period);
            const sources = (DBQ_SOURCE_SETS[p] || DBQ_SOURCE_SETS[item.period] || DBQ_SOURCE_SETS[3] || DBQ_SOURCE_SETS[2] || []).slice(0, 6);
            return {
                prompt: item.prompt,
                sources,
                fullTexts: DBQ_SOURCE_FULL_TEXTS,
                meta: item
            };
        }
    }
    const p = String(period);
    const prompt = p !== 'all' && DBQ_PROMPTS[p] ? DBQ_PROMPTS[p] : DBQ_PROMPTS.all;
    const sources = (DBQ_SOURCE_SETS[p] || DBQ_SOURCE_SETS[3] || DBQ_SOURCE_SETS[2] || DBQ_SOURCE_SETS[1] || []).slice(0, 6);
    return { prompt, sources, fullTexts: DBQ_SOURCE_FULL_TEXTS, meta: null };
}

function buildDbqPack(resource) {
    const period = resource?.period ?? 'all';
    const resolved = resolveDbqForPeriod(period, resource?.id || period);
    if (!resource?.customPrompt) return resolved;
    const sources = Array.isArray(resource.customSources) && resource.customSources.length
        ? resource.customSources
        : resolved.sources;
    return {
        prompt: resource.customPrompt,
        sources,
        fullTexts: resolved.fullTexts,
        meta: resource.meta || resolved.meta || null
    };
}

function normalizeSaqBankItem(item) {
    if (!item) return null;
    const period = item.period;
    const pd = window.APUSH_DATA && window.APUSH_DATA.periods ? window.APUSH_DATA.periods[period] : null;
    const firstEvent = pd && Array.isArray(pd.timeline) ? pd.timeline[0] : null;
    const defaultSample = firstEvent
        ? `Sample: ${firstEvent.title} (${firstEvent.date}) — ${firstEvent.description}. Connect this evidence directly to the question and explain significance.`
        : `Cite a specific person, law, or event from Period ${period} and explain its significance in 2–4 sentences.`;
    return {
        question: item.question || item.prompt || 'Short Answer Question',
        prompt: item.question ? (item.prompt || 'Answer in 2–4 sentences with specific evidence.') : 'Answer in 2–4 sentences with specific evidence.',
        sampleAnswer: item.sampleAnswer || item.answerHint || defaultSample
    };
}

function resolveLeqPromptForPeriod(period, seed) {
    const pb = promptBank();
    if (pb) {
        const text = pb.leqPrompt(period, seed);
        if (text) return text;
    }
    const p = String(period);
    return p !== 'all' && LEQ_PROMPTS[p] ? LEQ_PROMPTS[p] : LEQ_PROMPTS.all;
}

function buildPeriodResourceSuite(period) {
    const pd = window.APUSH_DATA && window.APUSH_DATA.periods ? window.APUSH_DATA.periods[period] : null;
    const periodName = pd && pd.name ? pd.name : `Period ${period}`;
    const dates = pd && pd.dates ? pd.dates : '';
    const timelineFocus = pd && pd.timeline && pd.timeline[0] ? pd.timeline[0].title : periodName;
    return [
        {
            title: `SAQ Practice Set: Period ${period}`,
            type: "practice",
            period,
            skill: "saq",
            format: "practice",
            description: `10 focused SAQ reps for ${periodName}${dates ? ` (${dates})` : ''} with quick rubric feedback`
        },
        {
            title: `Period ${period} Timeline: ${timelineFocus}`,
            type: "timeline",
            period,
            skill: "all",
            format: "timeline",
            description: `Interactive event sequence for ${periodName}${dates ? ` (${dates})` : ''}`
        },
        {
            title: `Study Guide: Period ${period}`,
            type: "guide",
            period,
            skill: "all",
            format: "guide",
            description: `Rapid-recall guide for key concepts, themes, and exam moves in ${periodName}`
        },
        {
            title: `LEQ Practice: Period ${period}`,
            type: "practice",
            period,
            skill: "leq",
            format: "practice",
            description: `Targeted LEQ prompt and planning flow for ${periodName}`
        },
        {
            title: `DBQ Practice: Period ${period}`,
            type: "practice",
            period,
            skill: "dbq",
            format: "practice",
            description: `Period-specific DBQ prompt + document-analysis workflow for ${periodName}`
        }
    ];
}

const BASE_RESOURCES = [
    {
        title: "DBQ Annotation Tool",
        type: "tool",
        period: "all",
        skill: "dbq",
        format: "tool",
        description: "Interactive tool for annotating and scoring DBQ responses"
    },
    {
        title: "LEQ Outline Generator",
        type: "tool",
        period: "all",
        skill: "leq",
        format: "tool",
        description: "Generate structured outlines for Long Essay Questions"
    },
    {
        title: "SAQ Drills: All Periods",
        type: "practice",
        period: "all",
        skill: "saq",
        format: "practice",
        description: "Timed SAQ practice covering all APUSH periods"
    }
];

const PERIOD_RESOURCES = PERIOD_NUMBERS.flatMap(period => buildPeriodResourceSuite(period));
const RESOURCES = [...BASE_RESOURCES, ...PERIOD_RESOURCES].map((resource, index) => ({
    id: index + 1,
    ...resource
}));

function isFeaturedResource(resource) {
    if (!resource || !resource.title) return false;
    return (
        resource.title.startsWith('SAQ Practice Set: Period ') ||
        resource.title.startsWith('Study Guide: Period ') ||
        resource.title.startsWith('Period ') && resource.title.includes('Timeline:') ||
        resource.title === 'SAQ Drills: All Periods'
    );
}

let currentFilters = {
    period: 'all',
    skill: 'all',
    format: 'all'
};

function isAuthenticatedUser() {
    return !!(window.AuthManager && typeof window.AuthManager.isAuthenticated === 'function' && window.AuthManager.isAuthenticated());
}

function trackResourceMetric(updateFn) {
    if (!isAuthenticatedUser() || typeof APUSH === 'undefined' || !APUSH.getUserProgress || !APUSH.saveUserProgress) return;
    const progress = APUSH.getUserProgress();
    if (!progress.metrics) progress.metrics = {};
    updateFn(progress.metrics);
    APUSH.saveUserProgress(progress);
}

/** Select value is always a string; resource.period may be a number — normalize for comparison */
function periodFilterMatches(filterVal, resourcePeriod) {
    if (filterVal === 'all') return true;
    if (resourcePeriod === 'all') return true;
    return String(resourcePeriod) === String(filterVal);
}

const PORTFOLIO_SECTIONS = [
    {
        id: 'saq',
        title: 'SAQ',
        subtitle: 'Short Answer Question drills with rubric-style feedback and period-specific sets.',
        accent: 'saq'
    },
    {
        id: 'dbq',
        title: 'DBQ',
        subtitle: 'Document-Based Question tools, annotation workflow, and period practice prompts.',
        accent: 'dbq'
    },
    {
        id: 'study-guides',
        title: 'Study Guides',
        subtitle: 'Rapid-recall guides and interactive timelines organized by APUSH period.',
        accent: 'guide'
    }
];

function getPortfolioCategory(resource) {
    if (!resource) return 'study-guides';
    if (resource.format === 'guide') return 'study-guides';
    if (resource.format === 'timeline' || resource.type === 'timeline') return 'study-guides';
    if (resource.skill === 'saq') return 'saq';
    if (resource.skill === 'dbq' || resource.skill === 'leq') return 'dbq';
    return 'study-guides';
}

function resourceMatchesFilters(resource) {
    if (!periodFilterMatches(currentFilters.period, resource.period)) {
        return false;
    }
    if (currentFilters.skill !== 'all' && resource.skill !== currentFilters.skill && resource.skill !== 'all') {
        return false;
    }
    if (currentFilters.format !== 'all' && resource.format !== currentFilters.format) {
        return false;
    }
    return true;
}

function getFilteredResources() {
    return RESOURCES.filter(resourceMatchesFilters);
}

function filtersAreActive() {
    return currentFilters.period !== 'all' || currentFilters.skill !== 'all' || currentFilters.format !== 'all';
}

function syncResourcesLayout() {
    const bank = document.getElementById('question-bank');
    if (bank) {
        bank.hidden = filtersAreActive();
    }
}

function renderResources() {
    const portfolio = document.getElementById('resources-portfolio');
    if (!portfolio) return;

    portfolio.innerHTML = '';

    const filtered = getFilteredResources();

    if (filtered.length === 0) {
        portfolio.innerHTML = '<p class="resources-portfolio-empty">No resources match your filters. Try changing period, skill, or format.</p>';
        return;
    }

    PORTFOLIO_SECTIONS.forEach(section => {
        const sectionItems = filtered.filter(resource => getPortfolioCategory(resource) === section.id);
        if (sectionItems.length === 0) return;

        const block = document.createElement('section');
        block.className = `portfolio-section portfolio-section--${section.accent}`;
        block.setAttribute('data-portfolio', section.id);
        block.setAttribute('aria-labelledby', `portfolio-heading-${section.id}`);

        const featuredCount = sectionItems.filter(isFeaturedResource).length;
        const countLabel = `${sectionItems.length} resource${sectionItems.length === 1 ? '' : 's'}`;
        const featuredNote = featuredCount > 0 ? ` · ${featuredCount} featured` : '';

        block.innerHTML = `
            <header class="portfolio-section-header">
                <div class="portfolio-section-heading">
                    <span class="portfolio-section-label">${section.title}</span>
                    <h2 id="portfolio-heading-${section.id}" class="portfolio-section-title">${section.title} Portfolio</h2>
                    <p class="portfolio-section-subtitle">${section.subtitle}</p>
                </div>
                <p class="portfolio-section-count" aria-label="${countLabel}">${countLabel}${featuredNote}</p>
            </header>
            <div class="portfolio-section-grid" role="list"></div>
        `;

        const grid = block.querySelector('.portfolio-section-grid');
        sectionItems.forEach(resource => {
            grid.appendChild(createResourceCard(resource));
        });

        portfolio.appendChild(block);
    });

    if (typeof window.applyLiquidGlassTargets === 'function') {
        window.applyLiquidGlassTargets();
    }

    syncResourcesLayout();
}

function createResourceCard(resource) {
    const card = document.createElement('div');
    const isFeatured = isFeaturedResource(resource);
    card.className = `resource-card${isFeatured ? ' resource-card-featured' : ''}`;
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
        all: 'All Skills'
    };
    
    const cta = resource.format === 'timeline'
        ? 'Explore Timeline'
        : resource.skill === 'saq'
            ? 'Start SAQ Drill'
            : resource.type === 'guide'
                ? 'Open Study Guide'
                : 'Open Resource';

    card.innerHTML = `
        <div class="resource-tags">
            <span class="resource-type resource-type--${resource.type}">${typeLabels[resource.type] || resource.type}</span>
            ${isFeatured ? '<span class="resource-featured-badge">Featured</span>' : ''}
        </div>
        <h3 class="resource-title">${resource.title}</h3>
        <p class="resource-description">${resource.description}</p>
        <div class="resource-meta">
            ${resource.period !== 'all' ? `<span>Period ${resource.period}</span>` : '<span>All Periods</span>'}
            <span>${skillLabels[resource.skill] || resource.skill}</span>
        </div>
        <div class="resource-cta-row">
            <span class="resource-cta">${cta} →</span>
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
    if (!resource) {
        console.error('No resource provided to handleResourceClick');
        return;
    }
    
    if (resource.format === 'timeline' || resource.type === 'timeline') {
        openTimeline(resource);
        return;
    }
    if (resource.type === 'tool' && resource.skill === 'dbq') {
        loadDBQPromptForTool(resource);
        APUSH.openModal('dbq-modal');
        return;
    }
    if (resource.type === 'tool' && resource.skill === 'leq') {
        openLEQOutlineGenerator(resource);
        return;
    }
    if (resource.type === 'guide') {
        openStudyGuide(resource);
        return;
    }
    if (resource.format === 'practice' && resource.skill === 'saq') {
        openSAQPractice(resource);
        return;
    }
    if (resource.format === 'practice' && resource.skill === 'dbq') {
        openDBQPractice(resource);
        return;
    }
    if (resource.format === 'practice' && resource.skill === 'leq') {
        openLEQPractice(resource);
        return;
    }
}

function setupFilters() {
    const periodFilter = document.getElementById('period-filter-resources');
    const skillFilter = document.getElementById('skill-filter');
    const formatFilter = document.getElementById('format-filter');

    if (periodFilter && typeof window.populatePeriodFilterOptions === 'function') {
        window.populatePeriodFilterOptions(periodFilter);
    }

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

let currentAnnotationType = null;
let currentDBQToolResource = { period: 'all' };

function setupDBQTool() {
    const dbqModal = document.getElementById('dbq-modal');
    if (!dbqModal) return;
    
    const dbqDocument = document.getElementById('dbq-document');
    const annotationsList = document.getElementById('annotations-list');
    const clearBtn = document.getElementById('clear-annotations-btn');
    const draftInput = document.getElementById('dbq-essay-draft');
    const estimateBtn = document.getElementById('dbq-estimate-btn');
    const estimateResult = document.getElementById('dbq-estimate-result');
    const advancedToggle = document.getElementById('dbq-advanced-estimate');

    if (dbqDocument) {
        dbqDocument.addEventListener('click', (event) => {
            const trigger = event.target.closest('.dbq-open-doc-btn');
            if (!trigger) return;
            event.preventDefault();
            openDbqDocumentModal({
                title: trigger.getAttribute('data-doc-title') || 'DBQ Document',
                source: trigger.getAttribute('data-doc-source') || 'Primary source',
                excerpt: trigger.getAttribute('data-doc-excerpt') || '',
                fullText: trigger.getAttribute('data-doc-full') || ''
            });
        });
    }
    
    const annotationBtns = document.querySelectorAll('.annotation-btn');
    annotationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'clear-annotations-btn') return;
            const type = btn.dataset.type;
            currentAnnotationType = type;
            annotationBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (dbqDocument) {
                dbqDocument.setAttribute('data-annotation-mode', type);
                dbqDocument.focus();
            }
        });
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            currentAnnotationType = null;
            annotationBtns.forEach(b => b.classList.remove('active'));
            if (annotationsList) annotationsList.innerHTML = '';
            loadDBQPromptForTool(currentDBQToolResource || { period: 'all' });
        });
    }

    const applyInlineAnnotation = (className) => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return '';
        const range = sel.getRangeAt(0);
        const selectedText = sel.toString().trim();
        if (!selectedText || !dbqDocument.contains(range.commonAncestorContainer)) return '';
        const span = document.createElement('span');
        span.className = className;
        try {
            range.surroundContents(span);
        } catch (e) {
            const fragment = range.extractContents();
            span.appendChild(fragment);
            range.insertNode(span);
        }
        sel.removeAllRanges();
        return selectedText;
    };
    
    if (dbqDocument) {
        dbqDocument.addEventListener('mouseup', () => {
            if (!currentAnnotationType) return;
            let text = '';
            if (currentAnnotationType === 'highlight') {
                text = applyInlineAnnotation('annotation-highlight');
            } else if (currentAnnotationType === 'underline') {
                text = applyInlineAnnotation('annotation-underline');
            } else if (currentAnnotationType === 'note') {
                const sel = window.getSelection();
                text = sel && sel.toString ? sel.toString().trim() : '';
                if (!text) return;
            } else {
                text = applyInlineAnnotation(`annotation-${currentAnnotationType}-mark`);
            }

            if (!text || !annotationsList) return;
            const label = currentAnnotationType.charAt(0).toUpperCase() + currentAnnotationType.slice(1);
            let noteBody = '';
            if (currentAnnotationType === 'note') {
                const note = prompt('Add a note for this passage:');
                if (note === null) return;
                noteBody = `<div class="annotation-note-body">${escapeHtml(note)}</div>`;
            }

            const tag = document.createElement('div');
            tag.className = `annotation-tag annotation-${currentAnnotationType}`;
            tag.innerHTML = `<strong>${label}:</strong> "${escapeHtml(text)}"${noteBody}`;
            annotationsList.appendChild(tag);

            trackResourceMetric(metrics => {
                metrics.dbq = metrics.dbq || {};
                metrics.dbq.annotations = (metrics.dbq.annotations || 0) + 1;
                metrics.dbq.lastAnnotationType = currentAnnotationType;
                metrics.dbq.lastUsedAt = new Date().toISOString();
            });
        });
    }

    if (estimateBtn && estimateResult && draftInput) {
        estimateBtn.addEventListener('click', () => {
            const draft = draftInput.value.trim();
            if (!draft) {
                alert('Write your DBQ response first, then estimate your score.');
                return;
            }
            const period = currentDBQToolResource && currentDBQToolResource.period;
            const prompt = period !== 'all' && DBQ_PROMPTS[period] ? DBQ_PROMPTS[period] : DBQ_PROMPTS.all;
            const annotationCount = annotationsList ? annotationsList.children.length : 0;
            const result = estimateDbqFromDraft(prompt, draft, annotationCount, !!(advancedToggle && advancedToggle.checked));

            estimateResult.style.display = 'block';
            const percent = Math.round((result.total / 7) * 100);
            estimateResult.innerHTML = `
                <div class="essay-estimate-header">
                    <h4 class="essay-estimate-title">Estimated score: ${result.total} / 7 (${result.band})</h4>
                    <span class="essay-estimate-confidence">Confidence: ~${result.confidence}%</span>
                </div>
                <div class="essay-estimate-meter" aria-hidden="true"><span style="width:${percent}%"></span></div>
                <div class="essay-estimate-grid">
                    <div class="essay-estimate-tile"><strong>Thesis</strong><span>${result.thesis} / 1</span></div>
                    <div class="essay-estimate-tile"><strong>Context</strong><span>${result.context} / 1</span></div>
                    <div class="essay-estimate-tile"><strong>Evidence</strong><span>${result.evidence} / 3</span></div>
                    <div class="essay-estimate-tile"><strong>Analysis</strong><span>${result.analysis} / 2</span></div>
                </div>
                <ul class="essay-rubric-hints">${result.tips.map(tip => `<li>${escapeHtml(tip)}</li>`).join('')}</ul>
            `;

            trackResourceMetric(metrics => {
                metrics.dbq = metrics.dbq || {};
                metrics.dbq.attempts = (metrics.dbq.attempts || 0) + 1;
                metrics.dbq.totalEstimated = (metrics.dbq.totalEstimated || 0) + result.total;
                metrics.dbq.maxPossible = 7;
                metrics.dbq.avgEstimated = Number((metrics.dbq.totalEstimated / metrics.dbq.attempts).toFixed(2));
                metrics.dbq.lastConfidence = result.confidence;
                metrics.dbq.lastEstimatedAt = new Date().toISOString();
            });
        });
    }
}

function estimateDbqFromDraft(promptText, draftText, annotationCount, advanced) {
    const text = draftText.toLowerCase();
    const firstSentences = text.split(/[.!?]/).slice(0, 2).join(' ');
    const words = draftText.split(/\s+/).filter(Boolean).length;
    const yearMatches = draftText.match(/\b(1[6-9]\d{2}|20\d{2})s?\b/g) || [];
    const docRefs = (text.match(/\b(doc|document)\s*\d*/g) || []).length;
    const reasoningSignals = (text.match(/\b(because|therefore|however|although|thus|as a result|led to|resulted in)\b/g) || []).length;
    const contextSignals = (text.match(/\b(before|earlier|long[- ]term|broader context|continuity)\b/g) || []).length;
    const promptTerms = String(promptText || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 5).slice(0, 8);
    const promptHits = promptTerms.filter(term => text.includes(term)).length;

    let thesis = 0;
    if (words >= 90 && (promptHits >= 2 || /\b(although|while|extent|overall)\b/.test(firstSentences))) thesis = 1;

    let context = 0;
    if (words >= 130 && (contextSignals >= 1 || yearMatches.length >= 2)) context = 1;

    let evidence = 0;
    const evidenceRaw = yearMatches.length + docRefs + Math.floor(annotationCount / 2);
    if (evidenceRaw >= 2) evidence = 1;
    if (evidenceRaw >= 4) evidence = 2;
    if (evidenceRaw >= 6 || docRefs >= 3) evidence = 3;

    let analysis = 0;
    if (reasoningSignals >= 2) analysis = 1;
    if (reasoningSignals >= 4) analysis = 2;

    if (advanced) {
        if (annotationCount >= 4 && evidence < 3) evidence += 1;
        if (promptHits >= 4 && analysis < 2) analysis += 1;
    }

    const total = Math.min(7, thesis + context + evidence + analysis);
    const confidence = Math.max(45, Math.min(95, Math.round(42 + (words / 10) + (reasoningSignals * 4))));
    const band = total >= 6 ? 'Strong' : total >= 4 ? 'Developing' : total >= 2 ? 'Emerging' : 'Starting';

    const tips = [];
    if (!thesis) tips.push('Make your first 1-2 sentences a defensible claim that directly answers the prompt.');
    if (!context) tips.push('Add broader context from events that happened before the period in question.');
    if (evidence < 2) tips.push('Use more specific evidence: laws, events, dates, and explicit document references.');
    if (analysis < 2) tips.push('After each evidence point, explain why it proves your argument.');
    if (advanced && annotationCount < 3) tips.push('Use the annotation tools on at least 3 passages before drafting to improve evidence coverage.');

    return { thesis, context, evidence, analysis, total, confidence, band, tips };
}

const DBQ_PROMPTS = {
    all: "Evaluate the extent to which the United States developed a national identity in the period 1800-1855.",
    1: "Evaluate the extent to which European colonization transformed Native American societies in North America in the period 1491-1607.",
    2: "Evaluate the extent to which regional economic differences shaped British North American colonial society in the period 1607-1754.",
    3: "Evaluate the extent to which the American Revolution changed American society in the period 1763-1800.",
    4: "Evaluate the extent to which the Market Revolution changed the American economy in the period 1800-1848.",
    5: "Evaluate the extent to which sectional conflict over slavery led to the Civil War in the period 1844-1861.",
    6: "Evaluate the extent to which industrialization changed American society in the period 1865-1898.",
    7: "Evaluate the extent to which the Progressive movement was successful in achieving its goals in the period 1890-1920.",
    8: "Evaluate the extent to which the Civil Rights movement achieved its goals in the period 1945-1980.",
    9: "Evaluate the extent to which globalization transformed United States foreign and domestic policy in the period 1980 to the present."
};

const DBQ_SOURCE_SETS = {
    1: [
        { title: "Bartolomé de las Casas, 'A Short Account of the Destruction of the Indies' (1542)", source: "Primary account", excerpt: "Las Casas described violence and forced labor imposed on Indigenous peoples after European contact." },
        { title: "Columbian Exchange summary (1492 onward)", source: "Historical synthesis", excerpt: "New World crops and Old World diseases reshaped population, diet, and labor systems across continents." },
        { title: "Encomienda system description (1500s)", source: "Colonial institution", excerpt: "Spanish colonizers claimed authority over Indigenous labor in exchange for nominal protection and conversion." },
        { title: "Joint-stock company charter for Virginia (1606)", source: "Corporate charter", excerpt: "Investors funded colonization expecting profit through land, trade, and resource extraction." },
        { title: "Powhatan diplomacy account (early 1600s)", source: "Indigenous-colonial relations", excerpt: "Algonquian leaders negotiated, resisted, and adapted as English settlement expanded in the Chesapeake." },
        { title: "African labor in early Atlantic colonies (1600s)", source: "Labor history", excerpt: "Enslaved Africans and indentured servants became central to colonial production and social hierarchy." }
    ],
    2: [
        { title: "John Winthrop, 'A Modell of Christian Charity' (1630)", source: "Sermon, Puritan migration", excerpt: "We shall be as a city upon a hill. The eyes of all people are upon us." },
        { title: "Virginia House of Burgesses law on tobacco labor (1670s)", source: "Colonial legal record", excerpt: "The increase of tobacco plantations required a dependable labor force and stronger social controls." },
        { title: "Pennsylvania promotional broadside (1680s)", source: "Colonial advertisement", excerpt: "Land, trade, and religious toleration invite industrious settlers to Pennsylvania." },
        { title: "Benjamin Franklin, 'Join, or Die' cartoon (1754)", source: "Pennsylvania Gazette", excerpt: "Franklin's segmented snake urged intercolonial unity against French and Native power." },
        { title: "Olaudah Equiano autobiography (1789)", source: "Enslavement narrative", excerpt: "The passage and sale system exposed the brutality at the center of Atlantic labor markets." },
        { title: "Navigation Act framework (1660s)", source: "British imperial statute", excerpt: "Colonial trade was tied to English ships and ports to reinforce imperial mercantilism." }
    ],
    3: [
        { title: "Thomas Paine, 'Common Sense' (1776)", source: "Political pamphlet", excerpt: "In America THE LAW IS KING; for as in absolute governments the King is law, so in free countries the law ought to be king." },
        { title: "Declaration of Independence (1776)", source: "Continental Congress", excerpt: "All men are created equal... they are endowed... with certain unalienable Rights." },
        { title: "The Federalist No. 10 (1787)", source: "James Madison", excerpt: "The latent causes of faction are thus sown in the nature of man." },
        { title: "Abigail Adams to John Adams (1776)", source: "Private correspondence", excerpt: "Remember the ladies, and be more generous and favorable to them than your ancestors." },
        { title: "George Washington Farewell Address (1796)", source: "Presidential address", excerpt: "Avoid permanent alliances and sectional parties that divide republican unity." },
        { title: "Judith Sargent Murray, 'On the Equality of the Sexes' (1790)", source: "Essay", excerpt: "Intellectual capacity is not naturally unequal between men and women." }
    ],
    4: [
        { title: "Lowell Mill worker testimony (1840s)", source: "Labor account", excerpt: "Factory discipline and the clock regulated every hour of the day." },
        { title: "Canal and railroad promotion (1830s)", source: "Economic pamphlet", excerpt: "Internal improvements unite markets and accelerate national prosperity." },
        { title: "Seneca Falls Declaration (1848)", source: "Women's rights convention", excerpt: "He has compelled her to submit to laws, in the formation of which she had no voice." },
        { title: "Andrew Jackson veto message on Bank recharter (1832)", source: "Presidential message", excerpt: "The Bank concentrated power and privilege beyond the will of ordinary citizens." },
        { title: "Cherokee Nation v. Georgia context (1831)", source: "Supreme Court era summary", excerpt: "Federal policy and removal pressure challenged Native sovereignty in the Southeast." },
        { title: "Frederick Douglass, Narrative (1845)", source: "Autobiography", excerpt: "Literacy became a path to resistance and an indictment of slavery's violence." }
    ],
    5: [
        { title: "Abraham Lincoln, Second Inaugural (1865)", source: "Presidential address", excerpt: "Yet, if God wills that it continue... until every drop of blood drawn with the lash shall be paid by another drawn with the sword..." },
        { title: "Freedmen's Bureau report (1866)", source: "Federal agency report", excerpt: "Schools and labor contracts became central instruments of postwar transition." },
        { title: "Mississippi Black Codes (1865)", source: "State legislation", excerpt: "Civil freedom was narrowly defined and labor mobility constrained." },
        { title: "Emancipation Proclamation excerpt (1863)", source: "Executive order", excerpt: "Enslaved persons in rebelling states were declared forever free as a war measure." },
        { title: "13th Amendment ratification text (1865)", source: "Constitutional amendment", excerpt: "Neither slavery nor involuntary servitude shall exist within the United States." },
        { title: "Sharecropping labor contract (1867)", source: "Postwar labor agreement", excerpt: "Freed families exchanged crop shares for land access under restrictive debt terms." }
    ],
    6: [
        { title: "Andrew Carnegie, 'Gospel of Wealth' (1889)", source: "Essay", excerpt: "The man who dies rich dies disgraced." },
        { title: "Henry George, 'Progress and Poverty' (1879)", source: "Economic critique", excerpt: "Material progress has not relieved labor from want." },
        { title: "Jacob Riis, 'How the Other Half Lives' (1890)", source: "Urban reform text", excerpt: "The tenements became dark, crowded spaces where disease spread rapidly." },
        { title: "Homestead Strike reporting (1892)", source: "Labor conflict coverage", excerpt: "Violence at Carnegie steel works highlighted corporate-labor confrontation." },
        { title: "Booker T. Washington, Atlanta Exposition Address (1895)", source: "Speech", excerpt: "Economic self-help was framed as the practical route toward Black advancement." },
        { title: "Plessy v. Ferguson ruling excerpt (1896)", source: "Supreme Court decision", excerpt: "The Court upheld 'separate but equal,' entrenching segregation in public life." }
    ],
    7: [
        { title: "Theodore Roosevelt, New Nationalism speech (1910)", source: "Campaign speech", excerpt: "Human welfare, not property, should be the first consideration of government." },
        { title: "Triangle Shirtwaist Factory fire coverage (1911)", source: "Newspaper reporting", excerpt: "Public outrage linked industrial safety failures to demands for reform." },
        { title: "Clayton Antitrust Act summary (1914)", source: "Congressional act", excerpt: "Labor organizations were exempted from prosecution as unlawful combinations." },
        { title: "Jane Addams on Hull House mission (1910)", source: "Settlement-house writing", excerpt: "Urban reform connected immigrant services to broader democratic participation." },
        { title: "Woodrow Wilson Fourteen Points excerpt (1918)", source: "War aims speech", excerpt: "Self-determination and collective security were offered as postwar principles." },
        { title: "19th Amendment text (1920)", source: "Constitutional amendment", excerpt: "Voting rights could not be denied on account of sex." }
    ],
    8: [
        { title: "George Kennan, 'Long Telegram' (1946)", source: "Diplomatic cable", excerpt: "Soviet power is impervious to the logic of reason, and highly sensitive to the logic of force." },
        { title: "Martin Luther King Jr., 'Letter from Birmingham Jail' (1963)", source: "Civil rights letter", excerpt: "Injustice anywhere is a threat to justice everywhere." },
        { title: "Lyndon B. Johnson, Great Society speech (1964)", source: "Presidential speech", excerpt: "The Great Society rests on abundance and liberty for all." },
        { title: "Brown v. Board of Education (1954)", source: "Supreme Court opinion", excerpt: "Separate educational facilities are inherently unequal." },
        { title: "Gulf of Tonkin Resolution (1964)", source: "Congressional resolution", excerpt: "Congress authorized broad presidential military action in Southeast Asia." },
        { title: "Rachel Carson, 'Silent Spring' excerpt (1962)", source: "Environmental text", excerpt: "Unchecked chemical use threatened ecological balance and public health." }
    ],
    9: [
        { title: "Ronald Reagan, first inaugural address (1981)", source: "Presidential address", excerpt: "Government is not the solution to our problem; government is the problem." },
        { title: "NAFTA debate statement (1993)", source: "Congressional record", excerpt: "Continental free trade will reshape labor and manufacturing patterns across North America." },
        { title: "September 20 Address to Congress (2001)", source: "Presidential address", excerpt: "Our war on terror begins with al Qaeda, but it does not end there." },
        { title: "George H.W. Bush 'New World Order' speech (1991)", source: "Presidential address", excerpt: "Post-Cold War policy emphasized coalition security and global cooperation." },
        { title: "USA PATRIOT Act findings (2001)", source: "Federal statute", excerpt: "National-security surveillance powers were significantly expanded after 9/11." },
        { title: "Obergefell v. Hodges ruling excerpt (2015)", source: "Supreme Court opinion", excerpt: "The Constitution protects the right of same-sex couples to marry." }
    ]
};

const DBQ_SOURCE_FULL_TEXTS = {
    "John Winthrop, 'A Modell of Christian Charity' (1630)": "For we must consider that we shall be as a city upon a hill. The eyes of all people are upon us. So that if we shall deal falsely with our God in this work we have undertaken, and so cause Him to withdraw His present help from us, we shall be made a story and a by-word through the world.",
    "Virginia House of Burgesses law on tobacco labor (1670s)": "Whereas the planting of tobacco and the increase of trade requires a constant and orderly laboring population, the Assembly establishes regulations governing service, status, and discipline. These laws reveal how colonial elites linked economic expansion to labor control.",
    "Pennsylvania promotional broadside (1680s)": "This province offers liberty of conscience, fertile lands, and access to Atlantic trade. Industrious families may improve their estate by farming and commerce under a frame of government that protects property and toleration.",
    "Thomas Paine, 'Common Sense' (1776)": "In America THE LAW IS KING. For as in absolute governments the King is law, so in free countries the law ought to be king; and there ought to be no other. A government of our own is our natural right.",
    "Declaration of Independence (1776)": "We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness. That to secure these rights, Governments are instituted among Men, deriving their just powers from the consent of the governed.",
    "The Federalist No. 10 (1787)": "The latent causes of faction are thus sown in the nature of man. The regulation of these various and interfering interests forms the principal task of modern legislation. A large republic provides a remedy by extending the sphere.",
    "Lowell Mill worker testimony (1840s)": "The bell rings at dawn, and we enter the mills where the machinery and overseers govern the rhythm of the day. Though wages are paid in cash, the discipline of factory labor transforms family life and social customs.",
    "Canal and railroad promotion (1830s)": "Internal improvements bind distant regions into one market and lower transportation costs for farmers and merchants. Canals and railroads accelerate circulation of goods, people, and information across the republic.",
    "Seneca Falls Declaration (1848)": "He has compelled her to submit to laws, in the formation of which she had no voice. He has taken from her all right in property, even to the wages she earns. Therefore, women demand equal civil and political rights.",
    "Abraham Lincoln, Second Inaugural (1865)": "Yet, if God wills that it continue until all the wealth piled by the bondman's two hundred and fifty years of unrequited toil shall be sunk, still it must be said, 'the judgments of the Lord are true and righteous altogether.'",
    "Freedmen's Bureau report (1866)": "The Bureau has supervised labor contracts, established schools, and arbitrated disputes in districts where civil authority is unsettled. Educational access and labor negotiation became central to Reconstruction policy.",
    "Mississippi Black Codes (1865)": "Freed people are declared free, yet restrictions on movement, labor contracts, and vagrancy penalties bind them to dependent labor. The codes demonstrate attempts to preserve racial hierarchy after emancipation.",
    "Andrew Carnegie, 'Gospel of Wealth' (1889)": "The man who dies rich dies disgraced. Wealth accumulated by exceptional ability should be administered for the community's benefit through institutions that improve civilization.",
    "Henry George, 'Progress and Poverty' (1879)": "Material progress has not relieved labor from want. The growth of productive power and the concentration of land value can deepen inequality unless public policy addresses structural causes.",
    "Jacob Riis, 'How the Other Half Lives' (1890)": "In tenement districts, overcrowded rooms, poor ventilation, and unsafe streets produce disease and hardship. Reform requires exposing these conditions to middle-class readers and policymakers.",
    "Theodore Roosevelt, New Nationalism speech (1910)": "The object of government is the welfare of the people. Human welfare, not property, must be the first concern of statesmanship. Powerful corporations require public supervision.",
    "Triangle Shirtwaist Factory fire coverage (1911)": "The factory fire killed workers trapped by locked doors and unsafe exits. Public outrage transformed workplace tragedy into demands for inspections, fire codes, and labor reform.",
    "Clayton Antitrust Act summary (1914)": "The Act strengthens antitrust enforcement while clarifying that labor is not a commodity and labor organizations are not unlawful combinations. It reflects Progressive efforts to regulate corporate power.",
    "George Kennan, 'Long Telegram' (1946)": "Soviet power is impervious to the logic of reason, but highly sensitive to the logic of force. U.S. policy should contain expansion through patient, firm, and vigilant pressure.",
    "Martin Luther King Jr., 'Letter from Birmingham Jail' (1963)": "Injustice anywhere is a threat to justice everywhere. We are caught in an inescapable network of mutuality, tied in a single garment of destiny. Direct action seeks to create tension that compels negotiation.",
    "Lyndon B. Johnson, Great Society speech (1964)": "The Great Society rests on abundance and liberty for all. It demands an end to poverty and racial injustice, while building cities, schools, and institutions worthy of national ideals.",
    "Ronald Reagan, first inaugural address (1981)": "In this present crisis, government is not the solution to our problem; government is the problem. Americans look to renewal through markets, federal restraint, and revived confidence.",
    "NAFTA debate statement (1993)": "Continental free trade will reshape investment, labor competition, and manufacturing supply chains across North America. Supporters and critics alike expect long-term structural change.",
    "September 20 Address to Congress (2001)": "Our war on terror begins with al Qaeda, but it does not end there. It will not end until every terrorist group of global reach has been found, stopped, and defeated.",
    "Benjamin Franklin, 'Join, or Die' cartoon (1754)": "Published during imperial conflict, Franklin's segmented snake image argued that disunited colonies would fail against external threats and internal disorder.",
    "Olaudah Equiano autobiography (1789)": "Equiano described kidnapping, the Middle Passage, and sale into Atlantic slavery, highlighting violence and commodification in imperial labor systems.",
    "Navigation Act framework (1660s)": "The Navigation Acts routed most colonial exports and imports through English ships and customs structures, strengthening mercantilist control over colonial economies.",
    "Abigail Adams to John Adams (1776)": "Remember the ladies, and be more generous and favorable to them than your ancestors. This appeal exposed limits of revolutionary equality.",
    "George Washington Farewell Address (1796)": "Washington warned against entrenched partisan factions and long-term foreign entanglements that could undermine republican self-government.",
    "Judith Sargent Murray, 'On the Equality of the Sexes' (1790)": "Murray challenged assumptions of female inferiority, arguing that unequal education—not nature—produced unequal outcomes.",
    "Andrew Jackson veto message on Bank recharter (1832)": "Jackson argued concentrated financial privilege threatened democratic equality and presented himself as defender of the common citizen.",
    "Cherokee Nation v. Georgia context (1831)": "The era's legal conflicts over Cherokee sovereignty demonstrated how federal expansion and state pressure displaced Native nations.",
    "Frederick Douglass, Narrative (1845)": "Douglass connected literacy to freedom, exposing slavery's dependence on violence and ignorance while framing abolition as a moral and political imperative.",
    "Emancipation Proclamation excerpt (1863)": "Lincoln declared enslaved people in rebelling states free, transforming Union war aims and opening the door to Black military service.",
    "13th Amendment ratification text (1865)": "The amendment constitutionally abolished slavery across the United States, marking a foundational legal shift in national citizenship and labor.",
    "Sharecropping labor contract (1867)": "Contracts often locked freed families into debt cycles and crop-lien dependence, limiting the economic independence promised by emancipation.",
    "Homestead Strike reporting (1892)": "News coverage of the strike linked private security violence and strikebreaking to national debates over labor rights and corporate power.",
    "Booker T. Washington, Atlanta Exposition Address (1895)": "Washington emphasized vocational advancement and economic cooperation while accepting segregation as a temporary political reality.",
    "Plessy v. Ferguson ruling excerpt (1896)": "By upholding segregation under 'separate but equal,' the Court provided constitutional cover for Jim Crow systems.",
    "Jane Addams on Hull House mission (1910)": "Addams argued settlement work should integrate immigrants into civic life while addressing structural poverty and urban inequality.",
    "Woodrow Wilson Fourteen Points excerpt (1918)": "Wilson's program framed open diplomacy, national self-determination, and collective security as principles for a stable postwar order.",
    "19th Amendment text (1920)": "Ratification nationalized women's suffrage and redefined democratic participation in federal and state elections.",
    "Brown v. Board of Education (1954)": "The Court rejected legal school segregation and energized direct-action civil rights campaigns across the South and beyond.",
    "Gulf of Tonkin Resolution (1964)": "The resolution granted broad executive war authority, accelerating U.S. intervention in Vietnam with limited congressional constraint.",
    "Rachel Carson, 'Silent Spring' excerpt (1962)": "Carson linked pesticide overuse to ecological harm and public risk, helping spark modern environmental regulation and activism.",
    "George H.W. Bush 'New World Order' speech (1991)": "Bush framed post-Cold War leadership around coalition warfare, international law, and multilateral security institutions.",
    "USA PATRIOT Act findings (2001)": "The law expanded federal surveillance and intelligence coordination, intensifying debates over liberty, privacy, and national security.",
    "Obergefell v. Hodges ruling excerpt (2015)": "The Court held that same-sex couples have a constitutional right to marry under due process and equal protection principles."
};

function loadDBQPromptForTool(resource) {
    const doc = document.getElementById('dbq-document');
    if (!doc) return;
    currentDBQToolResource = resource || { period: 'all' };
    const pack = buildDbqPack(currentDBQToolResource);
    const prompt = pack.prompt;
    const sourceSet = pack.sources;
    const fullTexts = pack.fullTexts;
    const bankNote = pack.meta
        ? `<p class="dbq-source-help dbq-source-help--bank">Pre-built set: <strong>${escapeHtml(pack.meta.id)}</strong> · ${escapeHtml(pack.meta.label || '')} · 6 documents</p>`
        : '';
    doc.innerHTML = `
        <div class="dbq-source-pack">
            <p><strong>DBQ Prompt:</strong></p>
            <p>${escapeHtml(prompt)}</p>
            ${bankNote}
            <hr>
            ${sourceSet.map((source, idx) => `
                <details class="dbq-source-accordion" data-doc="${idx + 1}" ${idx === 0 ? 'open' : ''}>
                    <summary>Document ${idx + 1}: ${escapeHtml(source.title)}</summary>
                    <article class="dbq-source-card">
                        <p class="dbq-source-meta">${escapeHtml(source.source)}</p>
                        <p class="dbq-source-text"><strong>Key excerpt:</strong> ${escapeHtml(source.excerpt)}</p>
                        <p class="dbq-source-text">${escapeHtml(fullTexts[source.title] || source.fullText || source.excerpt)}</p>
                        <button type="button" class="submit-btn dbq-open-doc-btn"
                            data-doc-title="${escapeHtml(source.title)}"
                            data-doc-source="${escapeHtml(source.source)}"
                            data-doc-excerpt="${escapeHtml(source.excerpt)}"
                            data-doc-full="${escapeHtml(fullTexts[source.title] || source.fullText || source.excerpt)}">Open full document</button>
                    </article>
                </details>
            `).join('')}
            <p class="dbq-source-help">Tip: select text, then choose Highlight / Underline / Notepad / rubric tag.</p>
        </div>
    `;
}

function openDbqDocumentModal(documentData) {
    const titleEl = document.getElementById('dbq-doc-modal-title');
    const bodyEl = document.getElementById('dbq-doc-modal-body');
    if (!titleEl || !bodyEl) return;
    titleEl.textContent = documentData.title || 'DBQ Document';
    bodyEl.innerHTML = `
        <p class="dbq-doc-modal-source"><strong>Source:</strong> ${escapeHtml(documentData.source || 'Primary source')}</p>
        <p class="dbq-doc-modal-excerpt"><strong>Excerpt:</strong> ${escapeHtml(documentData.excerpt || '')}</p>
        <p class="dbq-doc-modal-text">${escapeHtml(documentData.fullText || documentData.excerpt || '')}</p>
    `;
    APUSH.openModal('dbq-doc-modal');
}

// SAQ Practice Questions Data
const SAQ_QUESTIONS = {
    all: [
        {
            question: "Briefly explain ONE way in which the development of the Atlantic economy in the seventeenth and eighteenth centuries contributed to the development of regional identities in the British North American colonies.",
            prompt: "a) Explain ONE way in which the development of the Atlantic economy contributed to regional identities.",
            sampleAnswer: "The Atlantic economy fostered regional specialization: New England focused on shipbuilding and trade, the Middle Colonies on grain production, and the Southern Colonies on cash crops like tobacco and rice. This economic specialization created distinct regional cultures and social structures."
        },
        {
            question: "Briefly explain ONE specific historical development that represents an accomplishment of the national government under the Articles of Confederation.",
            prompt: "b) Explain ONE accomplishment of the Articles of Confederation government.",
            sampleAnswer: "The Articles of Confederation successfully established the Northwest Ordinance of 1787, which created a process for admitting new states, prohibited slavery in the Northwest Territory, and set aside land for public education."
        },
        {
            question: "Briefly explain ONE way in which the market revolution changed women's roles in society from 1800 to 1848.",
            prompt: "c) Explain ONE way the market revolution changed women's roles.",
            sampleAnswer: "The market revolution created the \"cult of domesticity,\" which idealized women as moral guardians of the home while men worked in the market economy. This separated public and private spheres, limiting women's economic participation outside the home."
        },
        {
            question: "Briefly explain ONE specific historical effect of the Civil War on the economy of the United States.",
            prompt: "d) Explain ONE economic effect of the Civil War.",
            sampleAnswer: "The Civil War accelerated industrialization in the North, as the Union needed mass-produced weapons, uniforms, and supplies. This led to increased factory production and consolidated economic power in the Northeast."
        },
        {
            question: "Briefly explain ONE way in which the Progressive Era reforms represented a response to the problems created by industrialization and urbanization.",
            prompt: "e) Explain ONE Progressive Era response to industrialization problems.",
            sampleAnswer: "Progressive reformers pushed for workplace safety regulations and labor laws, such as limiting working hours and improving factory conditions, in response to dangerous and exploitative industrial working conditions."
        },
        {
            question: "Briefly explain ONE argument used by supporters of Manifest Destiny in the 1840s.",
            prompt: "f) Explain ONE pro-Manifest Destiny argument.",
            sampleAnswer: "Supporters argued the United States had a providential mission to expand westward, spreading republican institutions and economic opportunity across the continent."
        },
        {
            question: "Briefly explain ONE way in which immigration changed American cities in the late nineteenth century.",
            prompt: "g) Explain ONE urban impact of immigration.",
            sampleAnswer: "Immigration fueled rapid urban growth and created ethnic neighborhoods, while also expanding factory labor and shaping political machines in major cities."
        },
        {
            question: "Briefly explain ONE cause of U.S. entry into World War I.",
            prompt: "h) Explain ONE cause of U.S. entry into WWI.",
            sampleAnswer: "Germany's unrestricted submarine warfare, including attacks on ships with American passengers and cargo, pushed the U.S. toward war."
        },
        {
            question: "Briefly explain ONE way the New Deal changed the role of the federal government.",
            prompt: "i) Explain ONE New Deal shift in federal power.",
            sampleAnswer: "The New Deal expanded federal responsibility for economic stability and social welfare through agencies, relief programs, and regulations."
        },
        {
            question: "Briefly explain ONE reason the Civil Rights Movement gained momentum after World War II.",
            prompt: "j) Explain ONE postwar factor behind Civil Rights activism.",
            sampleAnswer: "African American veterans returned from WWII demanding equal rights, and Cold War pressure highlighted contradictions between segregation and U.S. democratic ideals."
        }
    ],
    3: [
        {
            question: "Briefly explain ONE specific cause of the American Revolution.",
            prompt: "a) Explain ONE cause of the American Revolution.",
            sampleAnswer: "The British imposition of taxes without colonial representation, such as the Stamp Act and Townshend Acts, violated the colonists' understanding of their rights as Englishmen and led to widespread resistance."
        },
        {
            question: "Briefly explain ONE way in which the American Revolution changed political ideas about government.",
            prompt: "b) Explain ONE political idea changed by the Revolution.",
            sampleAnswer: "The Revolution popularized the concept of republicanism, emphasizing that government authority derives from the consent of the governed rather than divine right or hereditary monarchy."
        },
        {
            question: "Briefly explain ONE reason why the Articles of Confederation were replaced by the Constitution.",
            prompt: "c) Explain ONE reason for replacing the Articles of Confederation.",
            sampleAnswer: "The Articles gave the national government insufficient power to regulate commerce and tax, leading to economic chaos and inability to address issues like Shays' Rebellion, which convinced leaders a stronger central government was needed."
        },
        {
            question: "Briefly explain ONE way in which the Revolutionary War affected women.",
            prompt: "d) Explain ONE effect of the Revolution on women.",
            sampleAnswer: "The Revolution encouraged the idea of Republican Motherhood, assigning women a civic role in raising virtuous citizens even as most legal and political rights remained limited."
        },
        {
            question: "Briefly explain ONE challenge faced by the Continental Army during the war.",
            prompt: "e) Explain ONE wartime challenge for the Continental Army.",
            sampleAnswer: "The Continental Army struggled with supply shortages and inconsistent state support, which made sustaining troops and morale difficult."
        },
        {
            question: "Briefly explain ONE way in which the Constitution addressed a weakness of the Articles.",
            prompt: "f) Explain ONE constitutional fix to the Articles.",
            sampleAnswer: "The Constitution gave Congress power to tax, solving the Articles-era problem of a national government that could not reliably raise revenue."
        },
        {
            question: "Briefly explain ONE argument made by Anti-Federalists during ratification.",
            prompt: "g) Explain ONE Anti-Federalist argument.",
            sampleAnswer: "Anti-Federalists argued the Constitution created a central government too powerful and demanded a Bill of Rights to protect individual liberties."
        },
        {
            question: "Briefly explain ONE foreign-policy issue the new republic faced in the 1790s.",
            prompt: "h) Explain ONE diplomatic issue in the 1790s.",
            sampleAnswer: "Tensions between Britain and France forced U.S. leaders to define neutrality, balancing trade interests while avoiding entanglement in European wars."
        },
        {
            question: "Briefly explain ONE economic debate that shaped early U.S. politics.",
            prompt: "i) Explain ONE early national economic debate.",
            sampleAnswer: "Hamilton's proposal for a national bank divided leaders over constitutional interpretation and the proper scope of federal economic power."
        },
        {
            question: "Briefly explain ONE way political parties emerged in the 1790s.",
            prompt: "j) Explain ONE cause of first-party system emergence.",
            sampleAnswer: "Disagreements over the national bank, federal authority, and foreign policy split leaders into Federalists and Democratic-Republicans."
        }
    ]
};

function generatePeriodSAQQuestions(periodNum) {
    const pd = window.APUSH_DATA && window.APUSH_DATA.periods ? window.APUSH_DATA.periods[periodNum] : null;
    if (!pd) return shuffledCopy(SAQ_QUESTIONS.all).slice(0, 10);

    const timeline = Array.isArray(pd.timeline) ? pd.timeline : [];
    const concepts = Array.isArray(pd.keyConcepts) ? pd.keyConcepts : [];
    const themes = Array.isArray(pd.themes) ? pd.themes : [];

    const generated = [];

    timeline.slice(0, 4).forEach((event, idx) => {
        generated.push({
            question: `Briefly explain ONE way the development around "${event.title}" shaped ${pd.name}.`,
            prompt: `${String.fromCharCode(97 + idx)}) Explain ONE historical effect of "${event.title}" in ${pd.dates}.`,
            sampleAnswer: `One important effect of ${event.title} was that ${event.description}. This mattered because it influenced the broader trajectory of ${pd.name}.`
        });
    });

    concepts.slice(0, 3).forEach((concept, idx) => {
        generated.push({
            question: `Briefly explain ONE specific historical example that supports this idea: ${concept}`,
            prompt: `${String.fromCharCode(101 + idx)}) Provide ONE specific piece of evidence for this concept.`,
            sampleAnswer: `A strong example is [specific event/person/law] from ${pd.dates}, which supports the concept by showing how ${concept.toLowerCase()}.`
        });
    });

    themes.slice(0, 3).forEach((theme, idx) => {
        generated.push({
            question: `Briefly explain ONE way the theme of ${theme} appears in Period ${periodNum}.`,
            prompt: `${String.fromCharCode(104 + idx)}) Explain ONE example of ${theme} in this period.`,
            sampleAnswer: `The theme of ${theme} appears in [specific example], which demonstrates how historical actors responded to conditions of the era.`
        });
    });

    return generated.length ? generated.slice(0, 10) : shuffledCopy(SAQ_QUESTIONS.all).slice(0, 10);
}

let currentSAQIndex = 0;
let currentSAQSet = [];
let currentSAQScore = 0;
let currentSAQChecked = false;

function shuffledCopy(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function setupSAQPractice() {
    const prevBtn = document.getElementById('saq-prev-btn');
    const nextBtn = document.getElementById('saq-next-btn');
    const checkBtn = document.getElementById('saq-check-btn');
    const showAnswerBtn = document.getElementById('saq-show-answer-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentSAQIndex > 0) {
                currentSAQIndex--;
                displaySAQQuestion();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentSAQIndex < currentSAQSet.length - 1) {
                currentSAQIndex++;
                displaySAQQuestion();
            }
        });
    }

    if (checkBtn) {
        checkBtn.addEventListener('click', () => {
            checkSAQAnswer();
        });
    }

    if (showAnswerBtn) {
        showAnswerBtn.addEventListener('click', () => {
            showSAQAnswer();
        });
    }
}

function openSAQPractice(resource) {
    if (resource && resource.customSaqSet) {
        currentSAQSet = resource.customSaqSet;
        currentSAQIndex = 0;
        currentSAQScore = 0;
        currentSAQChecked = false;
        const title = document.getElementById('saq-modal-title');
        if (title) title.textContent = resource.title || 'SAQ Practice';
        displaySAQQuestion();
        APUSH.openModal('saq-modal');
        return;
    }

    if (resource && resource.customPrompt) {
        currentSAQSet = [
            {
                question: resource.customPrompt,
                prompt: "Use 2-4 sentences with one specific piece of evidence.",
                sampleAnswer: resource.sampleAnswer || "Strong SAQ responses make a clear claim, cite specific historical evidence, and explain significance."
            }
        ];
        currentSAQIndex = 0;
        currentSAQScore = 0;
        currentSAQChecked = false;
        const title = document.getElementById('saq-modal-title');
        if (title) title.textContent = resource.title || 'SAQ Practice';
        displaySAQQuestion();
        APUSH.openModal('saq-modal');
        return;
    }

    const period = resource.period;
    const pb = promptBank();
    const bankSaqs = pb ? pb.getSaqsForPeriod(period) : [];

    if (period === 'all') {
        currentSAQSet = bankSaqs.length
            ? [...bankSaqs, ...SAQ_QUESTIONS.all]
            : SAQ_QUESTIONS.all;
    } else if (bankSaqs.length) {
        currentSAQSet = bankSaqs.map(normalizeSaqBankItem).filter(Boolean);
    } else if (SAQ_QUESTIONS[period]) {
        currentSAQSet = SAQ_QUESTIONS[period];
    } else {
        currentSAQSet = generatePeriodSAQQuestions(Number(period));
    }

    if (!currentSAQSet || currentSAQSet.length === 0) {
        alert('No SAQ questions available for this period.');
        return;
    }

    // Make drill sets feel fresh each open
    if (resource.title && resource.title.toLowerCase().includes('drills')) {
        currentSAQSet = shuffledCopy(currentSAQSet).slice(0, 10);
    }

    currentSAQIndex = 0;
    currentSAQScore = 0;
    currentSAQChecked = false;
    const title = document.getElementById('saq-modal-title');
    if (title) title.textContent = resource.title || 'SAQ Practice';
    displaySAQQuestion();
    APUSH.openModal('saq-modal');
}

function displaySAQQuestion() {
    const question = currentSAQSet[currentSAQIndex];
    if (!question) return;

    const questionText = document.getElementById('saq-question-text');
    const promptText = document.getElementById('saq-prompt-text');
    const answerInput = document.getElementById('saq-answer-input');
    const counter = document.getElementById('saq-question-counter');
    const prevBtn = document.getElementById('saq-prev-btn');
    const nextBtn = document.getElementById('saq-next-btn');
    const feedback = document.getElementById('saq-feedback');
    const sampleAnswer = document.getElementById('saq-sample-answer');

    if (questionText) {
        if (question.html) {
            questionText.innerHTML = question.html;
        } else {
            questionText.textContent = question.question;
        }
    }
    if (promptText) promptText.textContent = question.prompt;
    if (answerInput) answerInput.value = '';
    if (counter) counter.textContent = `Question ${currentSAQIndex + 1} of ${currentSAQSet.length} • Score ${currentSAQScore}`;
    
    if (prevBtn) prevBtn.disabled = currentSAQIndex === 0;
    if (nextBtn) nextBtn.disabled = currentSAQIndex === currentSAQSet.length - 1;
    
    if (feedback) {
        feedback.style.display = 'none';
        feedback.innerHTML = '';
    }
    if (sampleAnswer) {
        sampleAnswer.style.display = 'none';
        sampleAnswer.innerHTML = '';
    }
    currentSAQChecked = false;
}

function checkSAQAnswer() {
    const answerInput = document.getElementById('saq-answer-input');
    const feedback = document.getElementById('saq-feedback');
    
    if (!answerInput || !feedback) return;
    
    const userAnswer = answerInput.value.trim();
    
    if (userAnswer.length === 0) {
        feedback.style.display = 'block';
        feedback.className = 'saq-feedback feedback-error';
        feedback.innerHTML = '<strong>Please provide an answer before checking.</strong>';
        return;
    }
    
    // Rubric-lite scoring (0-3) without AI
    let points = 0;
    const hasSpecific = /\b(Act|War|Treaty|Rebellion|Constitution|Congress|Federal|state|tax|rights|bank|amendment)\b/i.test(userAnswer);
    const hasReasoning = /\b(because|therefore|thus|led to|resulted in|as a result)\b/i.test(userAnswer);
    if (userAnswer.length >= 40) points += 1;
    if (hasSpecific) points += 1;
    if (hasReasoning) points += 1;

    let feedbackText = `<strong>SAQ Draft Score: ${points}/3</strong><br>`;
    if (!currentSAQChecked) {
        currentSAQScore += points;
        currentSAQChecked = true;
    }
    feedbackText += `
        <ul class="saq-mini-rubric">
            <li>${userAnswer.length >= 40 ? '✓' : '◻'} Clear claim in 2-4 sentences</li>
            <li>${hasSpecific ? '✓' : '◻'} Uses specific historical evidence</li>
            <li>${hasReasoning ? '✓' : '◻'} Explains cause/effect or significance</li>
        </ul>
    `;

    feedback.style.display = 'block';
    feedback.className = points >= 2 ? 'saq-feedback feedback-success' : 'saq-feedback feedback-info';
    feedback.innerHTML = feedbackText;

    const counter = document.getElementById('saq-question-counter');
    if (counter) counter.textContent = `Question ${currentSAQIndex + 1} of ${currentSAQSet.length} • Score ${currentSAQScore}`;
}

function showSAQAnswer() {
    const question = currentSAQSet[currentSAQIndex];
    const sampleAnswer = document.getElementById('saq-sample-answer');
    
    if (!question || !sampleAnswer) return;
    
    sampleAnswer.style.display = 'block';
    sampleAnswer.innerHTML = `
        <h4>Sample Answer:</h4>
        <p>${escapeHtml(question.sampleAnswer || 'A strong SAQ cites specific evidence and explains historical significance in 2–4 sentences.')}</p>
    `;
}

function setupTimeline() {}

function formatSupplementalSourceBlock(item) {
    if (!item || !item.source) return '';
    return `<p class="supplemental-source-block"><strong>Source:</strong> ${escapeHtml(item.source)} <span class="supplemental-source-type">(${escapeHtml(item.sourceType || 'Historical source')})</span></p>`;
}

function supplementalSaqEntry(item) {
    return {
        question: item.question,
        html: `${formatSupplementalSourceBlock(item)}<p>${escapeHtml(item.question)}</p>`,
        prompt: item.answerHint || 'Use 2–4 sentences with specific evidence from the source and period themes.',
        sampleAnswer: item.answerHint || 'Strong responses cite the source and connect to the period theme.'
    };
}

function setupQuestionBankActions() {
    const bank = rawPromptBank();
    if (!bank) return;

    function findById(collection, id) {
        if (!Array.isArray(collection)) return null;
        return collection.find(item => item && String(item.id) === String(id)) || null;
    }

    window.APUSHPromptBankActions = {
        openDbqById(id) {
            const item = findById(bank.dbqs, id);
            if (!item) {
                console.warn('DBQ not found:', id);
                return;
            }
            const packet = resolveDbqForPeriod(item.period || 'all', item.id);
            openDBQPractice({
                id: item.id,
                title: item.label || 'DBQ Practice',
                period: item.period || 'all',
                skill: 'dbq',
                format: 'practice',
                customPrompt: item.prompt || packet.prompt,
                customSources: packet.sources,
                meta: item
            });
        },
        openLeqById(id) {
            const item = findById(bank.leqs, id);
            if (!item) {
                console.warn('LEQ not found:', id);
                return;
            }
            openLEQPractice({
                id: item.id,
                title: 'LEQ Practice',
                period: item.period || 'all',
                skill: 'leq',
                format: 'practice',
                customPrompt: item.prompt
            });
        },
        openSaqById(id) {
            const item = findById(bank.saqs, id);
            if (!item) {
                console.warn('SAQ not found:', id);
                return;
            }
            openSAQPractice({
                id: item.id,
                title: 'SAQ Practice',
                period: item.period || 'all',
                customSaqSet: [normalizeSaqBankItem(item)]
            });
        },
        openSupplementalById(id) {
            const item = findById(bank.supplemental, id);
            if (!item) {
                console.warn('Supplemental prompt not found:', id);
                return;
            }
            const skill = String(item.skill || '').toLowerCase();
            if (skill === 'dbq') {
                const packet = resolveDbqForPeriod(item.period || 'all', item.id);
                openDBQPractice({
                    id: item.id,
                    title: 'Supplemental DBQ',
                    period: item.period || 'all',
                    skill: 'dbq',
                    customPrompt: item.question,
                    customSources: packet.sources,
                    meta: { id: item.id, label: 'Supplemental DBQ', supplemental: item }
                });
                return;
            }
            if (skill === 'leq') {
                openLEQPractice({
                    id: item.id,
                    title: 'Supplemental LEQ',
                    period: item.period || 'all',
                    skill: 'leq',
                    customPrompt: item.question,
                    supplementalSource: formatSupplementalSourceBlock(item)
                });
                return;
            }
            if (skill === 'saq') {
                openSAQPractice({
                    id: item.id,
                    title: 'Supplemental SAQ',
                    period: item.period || 'all',
                    customSaqSet: [supplementalSaqEntry(item)]
                });
            }
        }
    };

    document.dispatchEvent(new CustomEvent('apush-qb-actions-ready'));
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
}

function renderOutlineBody(body, label) {
    if (!body) return '';
    const ev = Array.isArray(body.evidence) ? body.evidence : [body.evidence].filter(Boolean);
    return `
        <section class="outline-card">
            <h4>${label}: ${escapeHtml(body.topic || 'Body Paragraph')}</h4>
            <p><strong>Analysis:</strong> ${escapeHtml(body.analysis || 'Connect evidence to thesis.')}</p>
            <div class="outline-evidence-row">
                ${ev.length ? ev.map(item => `<span class="outline-chip">${escapeHtml(item)}</span>`).join('') : '<span class="outline-chip">Add 1-2 specific examples</span>'}
            </div>
        </section>
    `;
}

let currentLEQOutlineResource = null;

function buildLEQExampleButtons(period) {
    const pd = window.APUSH_DATA && window.APUSH_DATA.periods ? window.APUSH_DATA.periods[period] : null;
    if (!pd) return '';
    const timeline = Array.isArray(pd.timeline) ? pd.timeline.slice(0, 3) : [];
    if (!timeline.length) return '';
    return `
        <section class="outline-card">
            <h4>Evidence examples you can use</h4>
            ${timeline.map((event, idx) => `
                <div class="outline-example-row">
                    <div>
                        <strong>${escapeHtml(event.title)}</strong>
                        <p>${escapeHtml(event.description)}</p>
                    </div>
                    <div class="outline-example-actions">
                        <button type="button" class="submit-btn outline-use-example-btn" data-example="${escapeHtml(event.title)}: ${escapeHtml(event.description)}">Use in Outline</button>
                        <a class="submit-btn outline-open-unit-btn" href="unit-study.html?period=${period}" target="_blank" rel="noopener noreferrer">Open Unit Lesson</a>
                    </div>
                </div>
                ${idx < timeline.length - 1 ? '<hr>' : ''}
            `).join('')}
        </section>
    `;
}

function buildPromptAwareOutline(promptText, period) {
    const p = period != null && period !== 'all' ? Number(period) : null;
    const pd = p && window.APUSH_DATA && window.APUSH_DATA.periods ? window.APUSH_DATA.periods[p] : null;
    const timeline = pd && Array.isArray(pd.timeline) ? pd.timeline.slice(0, 4) : [];
    const concepts = pd && Array.isArray(pd.keyConcepts) ? pd.keyConcepts.slice(0, 3) : [];
    const evidence = timeline.map(e => `${e.title} (${e.date})`);
    const promptLower = String(promptText).toLowerCase();
    const evalWord = /extent|evaluate|to what degree/i.test(promptText) ? 'To a significant extent' : 'In important ways';
    const topicA = concepts[0] || (timeline[0] ? timeline[0].title : 'a major development in the period');
    const topicB = concepts[1] || (timeline[1] ? timeline[1].title : 'a second cause or consequence');
    const continuityNote = /continuity|change/i.test(promptLower)
        ? 'Address both continuity and change across the time frame named in the prompt.'
        : 'Show how conditions shifted from earlier to later in the period.';

    return {
        thesis: `${evalWord}, ${promptText.replace(/\.$/, '')} — with ${topicA} as a central line of argument.`,
        context: pd
            ? `Before analyzing the prompt, establish background for ${pd.name} (${pd.dates}). Mention ${concepts[0] || 'colonial development'} and why the issue in the prompt mattered politically, economically, or socially.`
            : 'Provide 2–3 sentences of broader historical context that predate the prompt time frame and set up your argument.',
        body1: {
            topic: `Argument 1: ${topicA}`,
            evidence: evidence.length ? evidence.slice(0, 2) : ['Named law or event', 'Specific group or leader'],
            analysis: `Explain how this evidence supports your thesis and connects to the exact wording of the prompt. ${continuityNote}`
        },
        body2: {
            topic: `Argument 2: ${topicB}`,
            evidence: evidence.length > 2 ? evidence.slice(2, 4) : ['Comparative example', 'Policy or social outcome'],
            analysis: 'Show cause-and-effect or comparison. Use because/therefore language to earn the analysis point.'
        },
        body3: {
            topic: 'Counterargument or synthesis',
            evidence: ['Alternative interpretation', 'Long-term consequence'],
            analysis: 'Acknowledge a competing view, then explain why your thesis still holds (or qualify it thoughtfully).'
        },
        conclusion: `Reassert your thesis in new words and explain the historical significance of the transformation described in the prompt for ${pd ? pd.name : 'U.S. history'}.`
    };
}

function setupLEQOutline() {
    const btn = document.getElementById('leq-generate-outline-btn');
    const input = document.getElementById('leq-prompt-input');
    const result = document.getElementById('leq-outline-result');
    if (!btn || !input || !result) return;
    btn.addEventListener('click', async () => {
        const promptText = input.value.trim();
        if (!promptText) {
            result.style.display = 'block';
            result.innerHTML = '<p class="error">Please enter an LEQ prompt.</p>';
            return;
        }
        btn.disabled = true;
        btn.textContent = 'Generating...';
        result.style.display = 'block';
        result.innerHTML = '<p>Generating outline...</p>';
        let outline = null;
        if (window.OpenAIAPI && window.OpenAIAPI.hasApiKey()) {
            outline = await window.OpenAIAPI.generateLEQOutline(promptText);
        }
        if (!outline) {
            const period = currentLEQOutlineResource && currentLEQOutlineResource.period;
            outline = buildPromptAwareOutline(promptText, period);
        }
        result.innerHTML = `
            <div class="outline-prompt-banner">
                <div class="outline-prompt-label">LEQ Prompt</div>
                <p>${escapeHtml(promptText)}</p>
            </div>
            <section class="outline-card">
                <h4>Thesis</h4>
                <p>${escapeHtml(outline.thesis)}</p>
            </section>
            <section class="outline-card">
                <h4>Context</h4>
                <p>${escapeHtml(outline.context)}</p>
            </section>
            ${renderOutlineBody(outline.body1, 'Body Paragraph 1')}
            ${renderOutlineBody(outline.body2, 'Body Paragraph 2')}
            ${renderOutlineBody(outline.body3, 'Body Paragraph 3 / Counterargument')}
            <section class="outline-card">
                <h4>Conclusion</h4>
                <p>${escapeHtml(outline.conclusion)}</p>
            </section>
            <section class="outline-checklist">
                <h4>Before you write</h4>
                <ul>
                    <li>Use prompt language in your thesis.</li>
                    <li>Include specific historical evidence (names/events/dates).</li>
                    <li>Explain why each example proves your claim.</li>
                </ul>
            </section>
            ${buildLEQExampleButtons(currentLEQOutlineResource && currentLEQOutlineResource.period)}
        `;
        result.querySelectorAll('.outline-use-example-btn').forEach(button => {
            button.addEventListener('click', () => {
                const payload = button.getAttribute('data-example') || '';
                if (!payload) return;
                const current = input.value.trim();
                input.value = current
                    ? `${current}\n\nEvidence idea: ${payload}`
                    : `Evidence idea: ${payload}`;
                input.focus();
            });
        });
        trackResourceMetric(metrics => {
            metrics.leq = metrics.leq || {};
            metrics.leq.outlinesGenerated = (metrics.leq.outlinesGenerated || 0) + 1;
            metrics.leq.lastOutlineAt = new Date().toISOString();
        });
        btn.disabled = false;
        btn.textContent = 'Generate Outline';
    });
}

function openLEQOutlineGenerator(resource) {
    const input = document.getElementById('leq-prompt-input');
    const result = document.getElementById('leq-outline-result');
    const period = resource && resource.period !== undefined ? resource.period : 'all';
    currentLEQOutlineResource = resource || { period };
    if (input) input.value = resolveLeqPromptForPeriod(period, resource && resource.id);
    if (result) { result.style.display = 'none'; result.innerHTML = ''; }
    APUSH.openModal('leq-outline-modal');
}

const LEQ_PROMPTS = {
    all: "Evaluate the extent to which the Market Revolution changed the American economy in the period 1800-1848.",
    1: "Evaluate the extent to which contact between Europeans and Native Americans transformed both societies in the period 1491-1607.",
    2: "Evaluate the extent to which labor systems in British North America changed in the period 1607-1754.",
    3: "Evaluate the extent to which the American Revolution represented a turning point in U.S. history.",
    4: "Evaluate the extent to which the Market Revolution changed the American economy in the period 1800-1848.",
    5: "Evaluate the extent to which Reconstruction achieved its goals in the period 1863-1877.",
    6: "Evaluate the extent to which industrial capitalism changed social and economic life in the period 1865-1898.",
    7: "Evaluate the extent to which U.S. foreign policy changed in the period 1890-1920.",
    8: "Evaluate the extent to which the Cold War shaped U.S. society and politics in the period 1945-1980.",
    9: "Evaluate the extent to which political polarization changed U.S. politics from 1980 to the present."
};

function setupDBQPractice() {
    const practiceModal = document.getElementById('dbq-practice-modal');
    const openBtn = document.getElementById('dbq-open-annotation-btn');
    const viewBtn = document.getElementById('dbq-view-sources-btn');

    function openAnnotationFromPractice(e) {
        if (e) e.preventDefault();
        if (!currentDBQResource) return;
        if (typeof APUSH !== 'undefined' && APUSH.closeModal && practiceModal) {
            APUSH.closeModal(practiceModal);
        }
        loadDBQPromptForTool(currentDBQResource);
        if (typeof APUSH !== 'undefined' && APUSH.openModal) {
            APUSH.openModal('dbq-modal');
        }
    }

    if (openBtn) openBtn.addEventListener('click', openAnnotationFromPractice);
    if (viewBtn) viewBtn.addEventListener('click', openAnnotationFromPractice);
}

let currentDBQResource = null;

function openDBQPractice(resource) {
    if (!resource) return;
    const pack = buildDbqPack(resource);
    currentDBQResource = {
        ...resource,
        customPrompt: pack.prompt,
        customSources: pack.sources,
        meta: pack.meta || resource.meta || null
    };
    const promptEl = document.getElementById('dbq-practice-prompt');
    if (promptEl) {
        const sourceList = (pack.sources || []).length
            ? `<ul class="dbq-practice-source-list">${pack.sources.map((s, i) => `<li><strong>Doc ${i + 1}:</strong> ${escapeHtml(s.title)}</li>`).join('')}</ul>`
            : '<p class="dbq-practice-meta">Document packet loads in the annotation tool.</p>';
        promptEl.innerHTML = `
            <strong>DBQ Prompt:</strong>
            <p>${escapeHtml(pack.prompt)}</p>
            ${pack.meta ? `<p class="dbq-practice-meta">Set <strong>${escapeHtml(pack.meta.id || '')}</strong> · ${escapeHtml(pack.meta.label || '')} · ${pack.sources.length} sources</p>` : ''}
            ${sourceList}`;
    }
    trackResourceMetric(metrics => {
        metrics.dbq = metrics.dbq || {};
        metrics.dbq.practiceOpened = (metrics.dbq.practiceOpened || 0) + 1;
    });
    if (typeof APUSH === 'undefined' || !APUSH.openModal) {
        console.error('APUSH.openModal is not available');
        return;
    }
    APUSH.openModal('dbq-practice-modal');
}

function setupLEQPractice() {
    const checkBtn = document.getElementById('leq-check-response-btn');
    if (!checkBtn) return;
    checkBtn.addEventListener('click', () => {
        checkLEQResponse();
    });
}

function checkLEQResponse() {
    const input = document.getElementById('leq-response-input');
    const feedback = document.getElementById('leq-practice-feedback');
    if (!input || !feedback) return;

    const text = input.value.trim();
    if (!text) {
        feedback.hidden = false;
        feedback.className = 'leq-practice-feedback feedback-error';
        feedback.innerHTML = '<strong>Please write a response before checking.</strong>';
        return;
    }

    let points = 0;
    const hasThesis = /\b(thesis|argue|evaluate|extent|because|therefore|demonstrates)\b/i.test(text);
    const hasContext = text.length > 120;
    const hasEvidence = /\b(Act|War|Treaty|Amendment|Congress|President|Rebellion|Revolution|Constitution|movement|policy|law)\b/i.test(text);
    const hasAnalysis = /\b(because|therefore|led to|resulted in|shows|demonstrates|significance)\b/i.test(text);
    const hasStructure = (text.match(/\n\n/g) || []).length >= 1 || text.split('.').filter(Boolean).length >= 4;

    if (hasThesis) points += 1;
    if (hasContext) points += 1;
    if (hasEvidence) points += 2;
    if (hasAnalysis) points += 1;
    if (hasStructure) points += 1;

    const tips = [];
    if (!hasThesis) tips.push('Add a clear thesis that directly answers the prompt using evaluative language.');
    if (!hasContext) tips.push('Add 2–3 sentences of broader historical context before your argument.');
    if (!hasEvidence) tips.push('Name specific laws, events, people, or policies as evidence.');
    if (!hasAnalysis) tips.push('Explain how your evidence supports your claim (because/therefore language).');
    if (!hasStructure) tips.push('Organize into thesis, context, body paragraphs, and conclusion.');

    feedback.hidden = false;
    feedback.className = points >= 4 ? 'leq-practice-feedback feedback-success' : 'leq-practice-feedback feedback-info';
    feedback.innerHTML = `
        <h4>Estimated rubric score: ${points} / 6</h4>
        <p>${points >= 4 ? 'Strong draft — refine evidence specificity and synthesis.' : 'Keep building — focus on thesis, context, and evidence.'}</p>
        ${tips.length ? `<ul>${tips.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>` : ''}
    `;
}

let currentLEQResource = null;

function openLEQPractice(resource) {
    if (!resource) return;
    currentLEQResource = resource;
    const promptEl = document.getElementById('leq-practice-prompt');
    const period = resource.period;
    const prompt = resource.customPrompt || resolveLeqPromptForPeriod(period, resource.id || period);
    if (promptEl) {
        promptEl.innerHTML = `${resource.supplementalSource || ''}<strong>LEQ Prompt:</strong><p>${escapeHtml(prompt)}</p>`;
    }
    const responseInput = document.getElementById('leq-response-input');
    if (responseInput) responseInput.value = '';
    const leqFeedback = document.getElementById('leq-practice-feedback');
    if (leqFeedback) {
        leqFeedback.hidden = true;
        leqFeedback.innerHTML = '';
    }
    trackResourceMetric(metrics => {
        metrics.leq = metrics.leq || {};
        metrics.leq.practiceOpened = (metrics.leq.practiceOpened || 0) + 1;
    });
    if (typeof APUSH === 'undefined' || !APUSH.openModal) {
        console.error('APUSH.openModal is not available');
        return;
    }
    APUSH.openModal('leq-practice-modal');
}

function setupStudyGuide() {}

function openStudyGuide(resource) {
    const periodNum = parseInt(resource.period, 10);
    const content = document.getElementById('study-guide-content');
    const titleEl = document.getElementById('study-guide-modal-title');
    if (!content || !window.APUSH_DATA) return;
    const pd = window.APUSH_DATA.periods && window.APUSH_DATA.periods[periodNum];
    if (!pd) {
        content.innerHTML = '<p>No study guide available for this period.</p>';
    } else {
        const quickHits = (pd.keyConcepts || []).slice(0, 4);
        const examMoves = [
            'Name a specific event and explain why it matters in one sentence.',
            'Connect one continuity and one change across periods.',
            'Use causation language: because, therefore, led to, resulted in.',
            'Tie your final sentence back to the exact prompt wording.'
        ];
        content.innerHTML = `
            <div class="study-guide-hero">
                <h3>Period ${pd.number}: ${pd.name} (${pd.dates})</h3>
                <p>High-impact review sheet designed for fast recall before quizzes and FRQs.</p>
            </div>
            <div class="study-guide-pill-row">
                ${(pd.themes || []).slice(0, 5).map(t => `<span class="study-guide-pill">${t}</span>`).join('')}
            </div>
            <h4>Rapid Recall (Must Know)</h4>
            <ul>${quickHits.map(k => `<li>${k}</li>`).join('')}</ul>
            <h4>Key Concepts</h4>
            <ul>${(pd.keyConcepts || []).map(k => `<li>${k}</li>`).join('')}</ul>
            <h4>Themes</h4>
            <p>${(pd.themes || []).join(', ')}</p>
            <h4>Skills</h4>
            <p>${(pd.skills || []).join(', ')}</p>
            <h4>Exam-Day Moves</h4>
            <ul>${examMoves.map(m => `<li>${m}</li>`).join('')}</ul>
            ${pd.causesEffects && pd.causesEffects.length ? `
                <h4>Causes & Effects</h4>
                ${pd.causesEffects.map(ce => `
                    <div class="cause-effect-block">
                        <strong>${ce.title}</strong>
                        <ul>${(ce.steps || []).map(s => `<li><strong>${s.title}:</strong> ${s.description}</li>`).join('')}</ul>
                    </div>
                `).join('')}
            ` : ''}
            ${pd.primarySources && pd.primarySources.length ? `
                <h4>Primary Sources</h4>
                <ul>${pd.primarySources.map(ps => `<li><em>${ps.title}</em> (${ps.date}) - ${ps.author}</li>`).join('')}</ul>
            ` : ''}
        `;
    }
    if (titleEl) titleEl.textContent = resource.title;
    APUSH.openModal('study-guide-modal');
}

function openTimeline(resource) {
    if (!resource) {
        console.error('No resource provided to openTimeline');
        return;
    }
    
    // Get period data from APUSH_DATA
    const period = parseInt(resource.period);
    
    if (isNaN(period)) {
        console.error('Invalid period:', resource.period);
        alert('Invalid period specified for timeline.');
        return;
    }
    
    // Try multiple ways to access APUSH_DATA
    let periodData = null;
    let apushData = null;
    
    // Check window.APUSH_DATA first
    if (typeof window !== 'undefined' && window.APUSH_DATA) {
        apushData = window.APUSH_DATA;
    }
    // Fallback to global APUSH_DATA
    else if (typeof APUSH_DATA !== 'undefined') {
        apushData = APUSH_DATA;
    }
    
    // Get period data
    if (apushData && apushData.periods && apushData.periods[period]) {
        periodData = apushData.periods[period];
    }
    
    if (!periodData) {
        console.error('Timeline data not found for period:', period);
        alert(`Timeline data not available for Period ${period}. Please make sure apush-data.js is loaded.`);
        return;
    }
    
    try {
        displayTimeline(periodData, resource.title);
        if (typeof APUSH !== 'undefined' && APUSH.openModal) {
            APUSH.openModal('timeline-modal');
        } else {
            console.error('APUSH.openModal is not available');
            alert('Error: Cannot open timeline modal. Please refresh the page.');
        }
    } catch (error) {
        console.error('Error displaying timeline:', error);
        alert('An error occurred while displaying the timeline. Please check the console for details.');
    }
}

function displayTimeline(periodData, title) {
    const periodName = document.getElementById('timeline-period-name');
    const periodDates = document.getElementById('timeline-period-dates');
    const eventsContainer = document.getElementById('timeline-events');
    const modalTitle = document.getElementById('timeline-modal-title');
    
    if (!periodData || !periodData.timeline) {
        alert('No timeline data available for this period.');
        return;
    }
    
    if (modalTitle) modalTitle.textContent = title || `Period ${periodData.number}: ${periodData.name}`;
    if (periodName) periodName.textContent = periodData.name;
    if (periodDates) periodDates.textContent = periodData.dates;
    
    if (eventsContainer) {
        eventsContainer.innerHTML = '';
        if (periodData.number === 5) {
            const insight = document.createElement('div');
            insight.className = 'timeline-insight-card';
            insight.innerHTML = `
                <h4>Civil War Fast Lens</h4>
                <ul>
                    <li><strong>Cause:</strong> Escalating sectional conflict over slavery and federal power.</li>
                    <li><strong>Turning Point:</strong> Emancipation reframed the war around union + freedom.</li>
                    <li><strong>Outcome:</strong> Preservation of the Union and constitutional transformation.</li>
                </ul>
            `;
            eventsContainer.appendChild(insight);
        }
        
        periodData.timeline.forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.className = 'timeline-event';
            eventElement.setAttribute('data-index', index);
            
            eventElement.innerHTML = `
                <div class="timeline-event-marker"></div>
                <div class="timeline-event-content">
                    <div class="timeline-event-date">${event.date}</div>
                    <div class="timeline-event-title">${event.title}</div>
                    <div class="timeline-event-description">${event.description}</div>
                </div>
            `;
            
            // Add click handler for interactivity
            eventElement.addEventListener('click', () => {
                // Remove active class from all events
                document.querySelectorAll('.timeline-event').forEach(e => e.classList.remove('active'));
                // Add active class to clicked event
                eventElement.classList.add('active');
            });
            
            eventsContainer.appendChild(eventElement);
        });
    }
}

// Register question-bank button handlers as soon as this file loads (before user clicks).
setupQuestionBankActions();
