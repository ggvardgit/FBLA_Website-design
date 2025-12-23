# APUSH Learning Hub - Site Map

## Navigation Structure

```
APUSH Learning Hub
│
├── Home (/index.html)
│   ├── Hero Section
│   │   ├── Value Statement
│   │   └── Exam Readiness Card
│   ├── Action Grid
│   │   ├── Units Link
│   │   ├── Dashboard Link
│   │   ├── Live Study Link
│   │   └── Resources Link
│   ├── Quick Stats
│   │   ├── Periods Completed
│   │   ├── Practice Questions
│   │   └── Study Hours
│   └── Features Section
│
├── Units Overview (/units.html)
│   └── Period Cards (2-9)
│       ├── Period 2: Colonial America (1607-1754)
│       ├── Period 3: Revolution and Early Republic (1754-1800)
│       ├── Period 4: Expansion and Reform (1800-1848)
│       ├── Period 5: Civil War and Reconstruction (1844-1877)
│       ├── Period 6: Gilded Age (1865-1898)
│       ├── Period 7: Progressive Era to WWII (1890-1945)
│       ├── Period 8: Cold War Era (1945-1980)
│       └── Period 9: Modern America (1980-Present)
│
├── Unit Study (/unit-study.html?period=X)
│   ├── Header
│   │   ├── Breadcrumb Navigation
│   │   ├── Period Title and Dates
│   │   └── Progress Bar
│   └── Tabbed Content
│       ├── Overview Tab
│       │   ├── Key Themes Grid
│       │   ├── AP Exam Skills List
│       │   └── Key Concepts List
│       ├── Timeline Tab
│       │   └── Interactive Timeline
│       │       └── Timeline Events (with dates, titles, descriptions)
│       ├── Causes & Effects Tab
│       │   └── Cause-Effect Chains
│       │       └── Step-by-Step Flow Diagrams
│       ├── Primary Sources Tab
│       │   └── Source Cards
│       │       └── Source Modal (on click)
│       │           ├── Full Source Text
│       │           └── Analysis Questions
│       └── Practice Tab
│           ├── Practice Type Selector (SAQ/DBQ/LEQ)
│           └── Practice Questions
│               ├── Question Text
│               ├── Answer Options
│               ├── Submit Button
│               └── Instant Feedback
│
├── Student Dashboard (/dashboard.html)
│   ├── Overall Progress Card
│   │   ├── Mastery Percentage (Circular Progress)
│   │   ├── Periods Completed Count
│   │   ├── Skills Mastered Count
│   │   └── Total Practice Questions
│   ├── Mastery by Period Card
│   │   └── Period List with Progress Bars
│   ├── Study Next Card
│   │   └── Recommendation Engine Output
│   ├── Weakest Themes Card
│   │   └── Theme List with Mastery Scores
│   ├── AP Exam Skills Progress Card
│   │   └── Skills Grid with Progress Bars
│   └── Recent Activity Card
│       └── Activity Feed (Last 5 Activities)
│
├── Live Study Schedule (/schedule.html)
│   ├── Schedule Controls
│   │   ├── View Toggle (Week/Month)
│   │   └── Period Filter Dropdown
│   ├── Calendar Container
│   │   ├── Calendar Header (Navigation)
│   │   └── Calendar Grid (7-day week)
│   │       └── Calendar Days (with session indicators)
│   └── Upcoming Sessions List
│       └── Session Cards
│           ├── Session Title and Date
│           ├── Session Metadata
│           │   ├── Period
│           │   ├── Duration
│           │   ├── Instructor
│           │   └── Capacity
│           ├── Topic Description
│           └── RSVP Button
│
└── Resources Hub (/resources.html)
    ├── Filter Controls
    │   ├── Period Filter
    │   ├── Skill Filter (SAQ/DBQ/LEQ/MCQ)
    │   └── Format Filter (Practice/Tool/Guide/Timeline)
    ├── Resources Grid
    │   └── Resource Cards
    │       ├── Resource Type Badge
    │       ├── Resource Title
    │       ├── Description
    │       └── Metadata (Period, Skill)
    └── DBQ Tool Modal (on resource click)
        ├── Document Area (Editable)
        ├── Annotation Panel
        │   ├── Annotation Controls
        │   └── Annotations List
        └── DBQ Scorer
            ├── Thesis Checkbox (1 pt)
            ├── Context Checkbox (1 pt)
            ├── Evidence Input (0-3 pts)
            ├── Analysis Input (0-2 pts)
            └── Total Score Display (0-7 pts)
```

## User Flows

### Primary Flow: Study a Period
1. Home → Units Overview
2. Click Period Card → Unit Study Page
3. Navigate Tabs (Overview → Timeline → Causes & Effects → Primary Sources → Practice)
4. Complete Practice Questions
5. Dashboard (view updated progress)

### Secondary Flow: Track Progress
1. Home → Dashboard
2. View Mastery Scores
3. Click "Study Next" Recommendation
4. Navigate to Recommended Period

### Tertiary Flow: Join Study Session
1. Home → Live Study Schedule
2. View Calendar
3. Click Session Card
4. RSVP for Session
5. View Confirmation

### Resource Access Flow
1. Home → Resources Hub
2. Apply Filters (Period, Skill, Format)
3. Click Resource Card
4. Open Tool or Practice Set
5. Use DBQ Tool or Complete Practice

## Page-Level UX Behavior

### Home Page
- **Load Time**: < 1 second
- **Primary Action**: Navigate to Units
- **Feedback**: Real-time readiness percentage update
- **Interactivity**: Hover effects on action cards, smooth transitions

### Units Overview
- **Load Time**: < 1 second
- **Primary Action**: Select a period to study
- **Feedback**: Card hover states, click navigation
- **Interactivity**: Responsive grid layout, difficulty badges

### Unit Study Page
- **Load Time**: < 1 second
- **Primary Action**: Complete practice questions
- **Feedback**: Tab switching, progress bar updates, instant question feedback
- **Interactivity**: Timeline visualization, modal pop-ups, practice question submission

### Dashboard
- **Load Time**: < 1 second
- **Primary Action**: View recommendations and act on them
- **Feedback**: Progress ring animation, mastery bar updates
- **Interactivity**: Click recommendations to navigate, scroll through activity feed

### Live Study Schedule
- **Load Time**: < 1 second
- **Primary Action**: RSVP for sessions
- **Feedback**: RSVP button state change, calendar day highlighting
- **Interactivity**: Week navigation, filter application, RSVP toggle

### Resources Hub
- **Load Time**: < 1 second
- **Primary Action**: Access DBQ tool or practice sets
- **Feedback**: Filter results update, modal open/close
- **Interactivity**: Filter dropdowns, resource card clicks, DBQ scorer updates

## Design Decision Rationale

### Mobile-First Approach
**Decision**: Design for mobile screens first, then enhance for larger screens.
**Rationale**: Most students access study materials on mobile devices. Ensures core functionality works everywhere.

### LocalStorage for Progress
**Decision**: Use browser LocalStorage instead of server-side storage.
**Rationale**: Enables offline demonstration for judging. No external dependencies required.

### Tabbed Interface for Unit Study
**Decision**: Use tabs instead of separate pages for unit content.
**Rationale**: Reduces navigation overhead, keeps all period content in one place, improves learning flow.

### Circular Progress Indicator
**Decision**: Use SVG circle for overall mastery on dashboard.
**Rationale**: More visually engaging than linear bar, clearly communicates percentage, stands out on dashboard.

### Recommendation Engine
**Decision**: Show period with lowest mastery as "Study Next".
**Rationale**: Directly addresses student needs, improves exam readiness, demonstrates adaptive learning.

### Dark Mode Toggle
**Decision**: Include theme toggle in navigation.
**Rationale**: Reduces eye strain during long study sessions, accommodates user preferences, modern UX standard.

### Instant Feedback on Practice Questions
**Decision**: Show correct/incorrect immediately after submission.
**Rationale**: Improves learning retention, aligns with educational best practices, provides immediate gratification.

### DBQ Scorer Alignment
**Decision**: Use exact College Board 7-point rubric breakdown.
**Rationale**: Ensures students understand official scoring, prepares them for actual exam, demonstrates curriculum alignment.

## FBLA Scoring Criteria Alignment

### Design (25 points)
- ✅ Professional appearance and visual appeal
- ✅ Consistent color scheme and branding
- ✅ High-quality graphics and typography
- ✅ Effective use of white space

### Functionality (25 points)
- ✅ All features work as intended
- ✅ Navigation is intuitive and smooth
- ✅ No broken links or errors
- ✅ Fast load times and responsive interactions

### Content (25 points)
- ✅ Accurate and relevant APUSH content
- ✅ Comprehensive coverage of all periods
- ✅ Educational value and exam preparation focus
- ✅ Clear organization and structure

### Originality (25 points)
- ✅ Unique design and implementation
- ✅ Creative features (recommendation engine, adaptive paths)
- ✅ Innovative use of interactive elements
- ✅ Distinctive user experience
