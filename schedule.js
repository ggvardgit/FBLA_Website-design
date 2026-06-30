// Live Study Schedule page functionality
document.addEventListener('DOMContentLoaded', () => {
    if (typeof APUSH === 'undefined') {
        console.error('APUSH utilities not loaded. Ensure script.js is included before schedule.js.');
        return;
    }
    SAMPLE_SESSIONS = buildSampleSessions();
    loadCustomSessions();
    applyPersistedRsvpCounts();
    initCalendar();
    renderUpcomingSessions();
    setupFilters();
    setupAddSessionForm();
});

/**
 * Session datetime in the future (rolls forward if the slot has already passed).
 * Upcoming list filters with session.date >= now — week-only anchors made late-week visits show zero sessions.
 */
function nextUpcomingSlot(daysFromToday, hour, minute) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + daysFromToday);
    d.setHours(hour, minute, 0, 0);
    const now = new Date();
    while (d <= now) {
        d.setDate(d.getDate() + 1);
        d.setHours(hour, minute, 0, 0);
    }
    return d;
}

function formatSessionTime(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/** Sessions spread across the next several days so the list and calendar stay populated */
function buildSampleSessions() {
    const d1 = nextUpcomingSlot(1, 16, 0);
    const d2 = nextUpcomingSlot(2, 18, 0);
    const d3 = nextUpcomingSlot(4, 15, 0);
    const d4 = nextUpcomingSlot(6, 17, 0);
    return [
        {
            id: 1,
            title: 'Period 3 Review: Revolution and Constitution',
            period: 3,
            date: d1,
            time: formatSessionTime(d1),
            duration: 60,
            instructor: 'Dr. Smith',
            topic: 'Constitutional Convention and Federalist Papers',
            rsvpCount: 15,
            maxCapacity: 30
        },
        {
            id: 2,
            title: 'Period 5 Deep Dive: Civil War Causes',
            period: 5,
            date: d2,
            time: formatSessionTime(d2),
            duration: 90,
            instructor: 'Prof. Johnson',
            topic: 'Sectionalism and Road to War',
            rsvpCount: 22,
            maxCapacity: 30
        },
        {
            id: 3,
            title: 'DBQ Workshop: Period 7',
            period: 7,
            date: d3,
            time: formatSessionTime(d3),
            duration: 120,
            instructor: 'Ms. Williams',
            topic: 'Progressive Era DBQ Practice',
            rsvpCount: 18,
            maxCapacity: 25
        },
        {
            id: 4,
            title: 'Period 8: Civil Rights Movement',
            period: 8,
            date: d4,
            time: formatSessionTime(d4),
            duration: 75,
            instructor: 'Dr. Brown',
            topic: 'MLK, Malcolm X, and Movement Strategies',
            rsvpCount: 12,
            maxCapacity: 30
        }
    ];
}

let SAMPLE_SESSIONS = [];
let customSessionId = 1000;

function loadCustomSessions() {
    const progress = APUSH.getUserProgress();
    const stored = progress.customSessions || [];
    stored.forEach((raw) => {
        const date = new Date(raw.date);
        if (Number.isNaN(date.getTime())) return;
        SAMPLE_SESSIONS.push({
            id: raw.id,
            title: raw.title,
            period: raw.period,
            date,
            time: raw.time || formatSessionTime(date),
            duration: raw.duration || 60,
            instructor: raw.instructor || 'You',
            topic: raw.topic || 'Personal study session',
            rsvpCount: typeof raw.rsvpCount === 'number' ? raw.rsvpCount : 0,
            maxCapacity: raw.maxCapacity || 30,
            custom: true
        });
        if (raw.id >= customSessionId) customSessionId = raw.id + 1;
    });
}

function persistCustomSessions() {
    const progress = APUSH.getUserProgress();
    progress.customSessions = SAMPLE_SESSIONS
        .filter((s) => s.custom)
        .map((s) => ({
            id: s.id,
            title: s.title,
            period: s.period,
            date: s.date.toISOString(),
            time: s.time,
            duration: s.duration,
            instructor: s.instructor,
            topic: s.topic,
            rsvpCount: s.rsvpCount,
            maxCapacity: s.maxCapacity
        }));
    APUSH.saveUserProgress(progress);
}

function setupAddSessionForm() {
    const form = document.getElementById('add-session-form');
    const dateInput = document.getElementById('session-date-input');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().slice(0, 10);
    }
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('session-title-input')?.value?.trim();
        const dateStr = document.getElementById('session-date-input')?.value;
        const timeStr = document.getElementById('session-time-input')?.value;
        const period = parseInt(document.getElementById('session-period-input')?.value || '1', 10);
        if (!title || !dateStr || !timeStr) return;

        const [year, month, day] = dateStr.split('-').map(Number);
        const [hour, minute] = timeStr.split(':').map(Number);
        const date = new Date(year, month - 1, day, hour, minute, 0, 0);

        const session = {
            id: customSessionId++,
            title,
            period,
            date,
            time: formatSessionTime(date),
            duration: 60,
            instructor: 'You',
            topic: 'Personal study session',
            rsvpCount: 0,
            maxCapacity: 30,
            custom: true
        };
        SAMPLE_SESSIONS.push(session);
        persistCustomSessions();
        form.reset();
        if (dateInput) {
            const next = new Date();
            next.setDate(next.getDate() + 1);
            dateInput.value = next.toISOString().slice(0, 10);
        }
        renderCalendar();
        renderUpcomingSessions();
    });
}

function formatDaySessionIndicator(daySessions) {
    const times = daySessions.map((s) => s.time).slice(0, 2);
    const extra = daySessions.length > 2 ? ` +${daySessions.length - 2}` : '';
    const timeHtml = times.map((t) => `<span class="session-time-chip">${t}</span>`).join('');
    const countLabel = `${daySessions.length} session${daySessions.length > 1 ? 's' : ''}`;
    return `<div class="session-indicator">${timeHtml}</div><div class="session-count">${countLabel}${extra}</div>`;
}

function applyPersistedRsvpCounts() {
    const progress = APUSH.getUserProgress();
    const counts = progress.sessionRsvpCounts || {};
    SAMPLE_SESSIONS.forEach((session) => {
        if (typeof counts[session.id] === 'number') {
            session.rsvpCount = counts[session.id];
        }
    });
}

function updateSessionRsvpCount(sessionId, delta, progress) {
    const session = SAMPLE_SESSIONS.find((s) => s.id === sessionId);
    if (!session || !progress) return;
    const next = session.rsvpCount + delta;
    session.rsvpCount = Math.max(0, Math.min(session.maxCapacity, next));
    if (!progress.sessionRsvpCounts) progress.sessionRsvpCounts = {};
    progress.sessionRsvpCounts[sessionId] = session.rsvpCount;
}

let currentWeekStart = getWeekStart(new Date());
/** First day of the month being shown in month view */
let currentMonthView = (() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
})();
let currentView = 'week';
let currentPeriodFilter = 'all';

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

function initCalendar() {
    const prevBtn = document.getElementById('prev-week');
    const nextBtn = document.getElementById('next-week');
    const calendarTitle = document.getElementById('calendar-title');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentView === 'month') {
                currentMonthView = new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() - 1, 1);
            } else {
                currentWeekStart = new Date(currentWeekStart);
                currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            }
            renderCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentView === 'month') {
                currentMonthView = new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 1);
            } else {
                currentWeekStart = new Date(currentWeekStart);
                currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            }
            renderCalendar();
        });
    }

    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            currentView = btn.dataset.view;
            if (currentView === 'month') {
                const now = new Date();
                currentMonthView = new Date(now.getFullYear(), now.getMonth(), 1);
            }
            renderCalendar();
        });
    });

    renderCalendar();
}

function sessionMatchesPeriodFilter(session) {
    return currentPeriodFilter === 'all' || session.period.toString() === currentPeriodFilter;
}

function sessionsOnDate(date) {
    return SAMPLE_SESSIONS.filter(session => {
        if (!sessionMatchesPeriodFilter(session)) return false;
        const sessionDate = new Date(session.date);
        return sessionDate.toDateString() === date.toDateString();
    });
}

function renderCalendar() {
    const calendarTitle = document.getElementById('calendar-title');
    const calendarGrid = document.getElementById('calendar-grid');

    if (!calendarGrid) return;

    if (currentView === 'month') {
        renderMonthCalendar(calendarTitle, calendarGrid);
        return;
    }

    if (calendarTitle) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        calendarTitle.textContent = `${APUSH.formatDate(currentWeekStart)} - ${APUSH.formatDate(weekEnd)}`;
    }

    calendarGrid.innerHTML = '';
    calendarGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.style.cssText = 'font-weight: 600; text-align: center; padding: var(--spacing-sm);';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);

        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.setAttribute('role', 'gridcell');

        const daySessions = sessionsOnDate(date);
        const hasSession = daySessions.length > 0;

        if (hasSession) {
            day.classList.add('has-session');
        }

        day.innerHTML = `
            <div class="day-number">${date.getDate()}</div>
            ${hasSession ? formatDaySessionIndicator(daySessions) : ''}
        `;

        day.addEventListener('click', () => {
            showDaySessions(date);
        });

        calendarGrid.appendChild(day);
    }
}

function renderMonthCalendar(calendarTitle, calendarGrid) {
    const y = currentMonthView.getFullYear();
    const m = currentMonthView.getMonth();
    if (calendarTitle) {
        calendarTitle.textContent = currentMonthView.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    calendarGrid.innerHTML = '';
    calendarGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.style.cssText = 'font-weight: 600; text-align: center; padding: var(--spacing-sm);';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    const firstOfMonth = new Date(y, m, 1);
    const startPad = firstOfMonth.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
        const cellIndex = i - startPad + 1;
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.setAttribute('role', 'gridcell');

        if (cellIndex < 1 || cellIndex > daysInMonth) {
            day.style.opacity = '0.35';
            day.innerHTML = '<div class="day-number"></div>';
            calendarGrid.appendChild(day);
            continue;
        }

        const date = new Date(y, m, cellIndex);
        const daySessions = sessionsOnDate(date);
        const hasSession = daySessions.length > 0;
        if (hasSession) day.classList.add('has-session');

        day.innerHTML = `
            <div class="day-number">${cellIndex}</div>
            ${hasSession ? formatDaySessionIndicator(daySessions) : ''}
        `;
        day.addEventListener('click', () => showDaySessions(date));
        calendarGrid.appendChild(day);
    }
}

/** Public Jitsi Meet room per session (WebRTC video in the browser; no extra signup for basic use). */
function getSessionVideoUrl(session) {
    const room = `APUSHHub-S${session.id}-P${session.period}`;
    return `https://meet.jit.si/${encodeURIComponent(room)}`;
}

function renderUpcomingSessions() {
    const list = document.getElementById('sessions-list');
    if (!list) return;

    list.innerHTML = '';

    const now = new Date();
    const filteredSessions = SAMPLE_SESSIONS.filter(session => {
        if (!sessionMatchesPeriodFilter(session)) return false;
        return new Date(session.date) >= now;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (filteredSessions.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: var(--spacing-xl);">No upcoming sessions match your filters.</p>';
        return;
    }

    filteredSessions.forEach(session => {
        const card = createSessionCard(session);
        list.appendChild(card);
    });
}

function createSessionCard(session) {
    const card = document.createElement('div');
    card.className = 'session-card';
    card.setAttribute('role', 'listitem');

    const progress = APUSH.getUserProgress();
    const rsvps = progress.rsvps || [];
    const rsvpStatus = rsvps.includes(session.id);

    card.innerHTML = `
        <div class="session-header">
            <div>
                <h3 class="session-title">${session.title}</h3>
                <p class="session-date">${APUSH.formatDate(session.date)} at ${session.time}</p>
            </div>
        </div>
        <div class="session-meta">
            <div class="session-meta-item">
                <span>Period ${session.period}</span>
            </div>
            <div class="session-meta-item">
                <span>Time:</span>
                <span>${session.duration} min</span>
            </div>
            <div class="session-meta-item">
                <span>👤</span>
                <span>${session.instructor}</span>
            </div>
            <div class="session-meta-item">
                <span>👥</span>
                <span>${session.rsvpCount}/${session.maxCapacity}</span>
            </div>
        </div>
        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">
            <strong>Topic:</strong> ${session.topic}
        </p>
        <p style="margin-bottom: var(--spacing-md);">
            <a href="${getSessionVideoUrl(session)}" target="_blank" rel="noopener noreferrer" class="submit-btn" style="display:inline-block;text-decoration:none;margin-right:var(--spacing-sm);">Join video room</a>
            <span style="color: var(--text-muted); font-size: 0.875rem;">Opens Jitsi Meet (browser video chat). Share the room name with your group.</span>
        </p>
        <button class="rsvp-btn ${rsvpStatus ? 'confirmed' : ''}" 
                data-session-id="${session.id}"
                onclick="toggleRSVP(${session.id})">
            ${rsvpStatus ? '✓ Confirmed' : 'RSVP'}
        </button>
    `;

    return card;
}

function toggleRSVP(sessionId) {
    const progress = APUSH.getUserProgress();
    if (!progress.rsvps) {
        progress.rsvps = [];
    }

    const index = progress.rsvps.indexOf(sessionId);
    const wasRsvped = index > -1;
    if (wasRsvped) {
        progress.rsvps.splice(index, 1);
        updateSessionRsvpCount(sessionId, -1, progress);
    } else {
        progress.rsvps.push(sessionId);
        updateSessionRsvpCount(sessionId, 1, progress);
    }

    if (!progress.activities) progress.activities = [];
    progress.activities.push({
        action: wasRsvped ? 'Cancelled RSVP' : 'RSVPed for session',
        timestamp: new Date().toISOString()
    });
    if (progress.activities.length > 20) {
        progress.activities = progress.activities.slice(-20);
    }

    APUSH.saveUserProgress(progress);

    renderUpcomingSessions();
}

function setupFilters() {
    const periodFilter = document.getElementById('period-filter');
    if (periodFilter && typeof window.populatePeriodFilterOptions === 'function') {
        window.populatePeriodFilterOptions(periodFilter);
    }
    if (periodFilter) {
        periodFilter.addEventListener('change', e => {
            currentPeriodFilter = e.target.value;
            renderCalendar();
            renderUpcomingSessions();
        });
    }
}

function showDaySessions(date) {
    const daySessions = SAMPLE_SESSIONS.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.toDateString() === date.toDateString() && sessionMatchesPeriodFilter(session);
    });

    if (daySessions.length > 0) {
        const sessionsSection = document.querySelector('.upcoming-sessions');
        if (sessionsSection) {
            sessionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

window.toggleRSVP = toggleRSVP;
