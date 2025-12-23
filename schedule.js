// Live Study Schedule page functionality
document.addEventListener('DOMContentLoaded', () => {
    initCalendar();
    renderUpcomingSessions();
    setupFilters();
});

// Sample session data (in production, this would come from a server)
const SAMPLE_SESSIONS = [
    {
        id: 1,
        title: "Period 3 Review: Revolution and Constitution",
        period: 3,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        time: "4:00 PM",
        duration: 60,
        instructor: "Dr. Smith",
        topic: "Constitutional Convention and Federalist Papers",
        rsvpCount: 15,
        maxCapacity: 30
    },
    {
        id: 2,
        title: "Period 5 Deep Dive: Civil War Causes",
        period: 5,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        time: "6:00 PM",
        duration: 90,
        instructor: "Prof. Johnson",
        topic: "Sectionalism and Road to War",
        rsvpCount: 22,
        maxCapacity: 30
    },
    {
        id: 3,
        title: "DBQ Workshop: Period 7",
        period: 7,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: "3:00 PM",
        duration: 120,
        instructor: "Ms. Williams",
        topic: "Progressive Era DBQ Practice",
        rsvpCount: 18,
        maxCapacity: 25
    },
    {
        id: 4,
        title: "Period 8: Civil Rights Movement",
        period: 8,
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        time: "5:00 PM",
        duration: 75,
        instructor: "Dr. Brown",
        topic: "MLK, Malcolm X, and Movement Strategies",
        rsvpCount: 12,
        maxCapacity: 30
    }
];

let currentWeekStart = getWeekStart(new Date());
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
    const calendarGrid = document.getElementById('calendar-grid');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentWeekStart = new Date(currentWeekStart);
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            renderCalendar();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentWeekStart = new Date(currentWeekStart);
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            renderCalendar();
        });
    }
    
    // View toggle
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
            renderCalendar();
        });
    });
    
    renderCalendar();
}

function renderCalendar() {
    const calendarTitle = document.getElementById('calendar-title');
    const calendarGrid = document.getElementById('calendar-grid');
    
    if (!calendarGrid) return;
    
    // Update title
    if (calendarTitle) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        calendarTitle.textContent = `${APUSH.formatDate(currentWeekStart)} - ${APUSH.formatDate(weekEnd)}`;
    }
    
    // Clear grid
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.style.cssText = 'font-weight: 600; text-align: center; padding: var(--spacing-sm);';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });
    
    // Add calendar days
    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.setAttribute('role', 'gridcell');
        
        const hasSession = SAMPLE_SESSIONS.some(session => {
            const sessionDate = new Date(session.date);
            return sessionDate.toDateString() === date.toDateString() &&
                   (currentPeriodFilter === 'all' || session.period.toString() === currentPeriodFilter);
        });
        
        if (hasSession) {
            day.classList.add('has-session');
        }
        
        day.innerHTML = `
            <div class="day-number">${date.getDate()}</div>
            ${hasSession ? '<div class="session-indicator">Session</div>' : ''}
        `;
        
        day.addEventListener('click', () => {
            showDaySessions(date);
        });
        
        calendarGrid.appendChild(day);
    }
}

function renderUpcomingSessions() {
    const list = document.getElementById('sessions-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const filteredSessions = SAMPLE_SESSIONS.filter(session => {
        if (currentPeriodFilter !== 'all' && session.period.toString() !== currentPeriodFilter) {
            return false;
        }
        return session.date >= new Date();
    }).sort((a, b) => a.date - b.date);
    
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
    const rsvpStatus = progress.rsvps && progress.rsvps.includes(session.id);
    
    card.innerHTML = `
        <div class="session-header">
            <div>
                <h3 class="session-title">${session.title}</h3>
                <p class="session-date">${APUSH.formatDate(session.date)} at ${session.time}</p>
            </div>
        </div>
        <div class="session-meta">
            <div class="session-meta-item">
                <span>📅</span>
                <span>Period ${session.period}</span>
            </div>
            <div class="session-meta-item">
                <span>⏱️</span>
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
    if (index > -1) {
        progress.rsvps.splice(index, 1);
    } else {
        progress.rsvps.push(sessionId);
    }
    
    APUSH.saveUserProgress(progress);
    
    // Add activity
    if (!progress.activities) progress.activities = [];
    progress.activities.push({
        action: index > -1 ? 'Cancelled RSVP' : 'RSVPed for session',
        timestamp: new Date().toISOString()
    });
    APUSH.saveUserProgress(progress);
    
    renderUpcomingSessions();
}

function setupFilters() {
    const periodFilter = document.getElementById('period-filter');
    if (periodFilter) {
        periodFilter.addEventListener('change', (e) => {
            currentPeriodFilter = e.target.value;
            renderCalendar();
            renderUpcomingSessions();
        });
    }
}

function showDaySessions(date) {
    const daySessions = SAMPLE_SESSIONS.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.toDateString() === date.toDateString();
    });
    
    if (daySessions.length > 0) {
        // Scroll to sessions list and highlight
        const sessionsSection = document.querySelector('.upcoming-sessions');
        if (sessionsSection) {
            sessionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Make toggleRSVP available globally
window.toggleRSVP = toggleRSVP;
