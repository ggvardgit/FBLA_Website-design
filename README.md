# APUSH Learning Hub

A comprehensive student learning platform for AP U.S. History exam preparation, designed to maximize exam readiness and align with FBLA Website Design judging standards.

## Project Overview

The APUSH Learning Hub is a fully functional, offline-capable web application that provides students with:

- **Complete APUSH Coverage**: All 8 periods (2-9) from Colonial America to Modern Era
- **Interactive Learning Tools**: Timelines, cause-effect chains, primary source analysis
- **Practice Questions**: SAQ, DBQ, and LEQ practice with instant feedback
- **Progress Tracking**: Comprehensive dashboard with mastery scores and recommendations
- **Live Study Sessions**: Calendar-based scheduling with RSVP functionality
- **Adaptive Learning**: Personalized study paths based on performance

## Site Structure

### Pages

1. **Home (`index.html`)**
   - Value proposition and exam readiness percentage
   - Quick access to all major sections
   - Real-time progress statistics

2. **Units Overview (`units.html`)**
   - Visual cards for all 8 APUSH periods
   - Difficulty ratings, study time estimates, and key themes
   - Direct navigation to period-specific study pages

3. **Unit Study Pages (`unit-study.html`)**
   - Dynamic content based on selected period
   - Five interactive tabs:
     - **Overview**: Key themes, skills, and concepts
     - **Timeline**: Interactive chronological events
     - **Causes & Effects**: Visual cause-effect chains
     - **Primary Sources**: Document analysis with pop-up modals
     - **Practice**: SAQ, DBQ, and LEQ practice questions

4. **Student Dashboard (`dashboard.html`)**
   - Overall mastery percentage with visual progress ring
   - Period-by-period mastery breakdown
   - "Study Next" recommendation engine
   - Weakest themes identification
   - AP exam skills progress tracking
   - Recent activity feed

5. **Live Study Schedule (`schedule.html`)**
   - Weekly calendar view with session indicators
   - Upcoming sessions list with RSVP functionality
   - Period-based filtering
   - Session details (instructor, topic, capacity)

6. **Resources Hub (`resources.html`)**
   - Filterable resource library (by period, skill, format)
   - DBQ annotation tool with College Board-aligned scorer
   - Practice question sets
   - Study guides and timelines

## Design Features

### UX Standards

- **Mobile-First Design**: Responsive layout works seamlessly on phone, tablet, and desktop
- **High Contrast**: WCAG-compliant color palette for accessibility
- **Consistent Navigation**: Sticky header with clear page indicators
- **One Primary Action Per Screen**: Focused user experience
- **Optimized Typography**: Fonts and spacing designed for extended reading

### Accessibility

- **WCAG 2.1 AA Compliant**: Color contrast ratios meet standards
- **Keyboard Navigation**: Full site navigation via keyboard
- **ARIA Labels**: Screen reader support throughout
- **Focus Indicators**: Visible focus states on all interactive elements
- **Alt Text**: All images include descriptive alt attributes

### Interactivity

- **Fast Feedback**: All interactions provide feedback within 300ms
- **Error-Free Interactions**: Comprehensive error handling
- **Clear Hover States**: Visual feedback on all interactive elements
- **Smooth Animations**: Respects reduced motion preferences

### AP-Specific Features

- **Adaptive Study Paths**: Recommendations based on quiz accuracy
- **DBQ Scorer**: Aligned to College Board 7-point rubric
- **Missed-Concept Tracker**: Identifies weakest themes by period
- **Exam Countdown Ready**: Infrastructure for countdown timer
- **Dark Mode**: Reduces eye strain during long study sessions
- **Reduced Motion Toggle**: Accommodates motion sensitivity

## Technical Implementation

### File Structure

```
awv/
├── index.html          # Home page
├── units.html          # Units overview
├── unit-study.html     # Individual period study page
├── dashboard.html      # Student progress dashboard
├── schedule.html       # Live study schedule
├── resources.html      # Resources hub
├── api-config.html     # Gemini API configuration page
├── styles.css          # Main stylesheet (mobile-first, responsive)
├── script.js           # Shared JavaScript (navigation, theme, modals)
├── apush-data.js       # All APUSH period content and data
├── gemini-api.js       # Gemini AI integration for question generation
├── home.js             # Home page functionality
├── units.js            # Units page functionality
├── dashboard.js        # Dashboard functionality
├── schedule.js         # Schedule functionality
├── resources.js        # Resources page functionality
└── unit-study.js       # Unit study page functionality
```

### Data Storage

- **LocalStorage**: User progress, preferences, activity tracking, and API keys
- **No External Dependencies**: Fully offline-capable for judging (with fallback questions)
- **Structured Data**: JSON-based period content for easy maintenance

### AI Integration (Gemini)

- **Optional AI-Powered Questions**: Uses Google's Gemini API to generate dynamic practice questions
- **API Key Management**: Secure local storage of API keys (never shared)
- **Fallback System**: Gracefully falls back to sample questions if API unavailable
- **Question Types**: Generates SAQ, DBQ, and LEQ prompts aligned with APUSH standards
- **Period-Specific**: Questions are tailored to each period's themes and key concepts

To enable AI-generated questions:
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Navigate to "AI Settings" in the navigation menu
3. Enter your API key and test the connection
4. Practice questions will now be AI-generated!

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Progressive enhancement for older browsers
- No framework dependencies

## FBLA Alignment

### Design Excellence
- Professional, modern UI with consistent branding
- High-quality visual hierarchy and typography
- Responsive design across all device sizes

### Functionality
- All required features implemented and working
- Smooth navigation and error-free interactions
- Fast load times and responsive feedback

### User Experience
- Intuitive navigation and clear information architecture
- Accessible to users with disabilities
- Optimized for student learning workflows

### Content Quality
- Accurate APUSH content aligned with College Board standards
- Comprehensive coverage of all 8 periods
- Educational value and exam preparation focus

## Metrics and Success Indicators

The platform tracks and displays:

- **Quiz Accuracy Percentage**: By period and overall
- **Average Session Length**: Study time tracking
- **Retention Improvement**: Progress over 7-day periods
- **Dashboard Completion Rate**: User engagement metrics
- **Live Session Attendance Rate**: RSVP and participation tracking

## Usage Instructions

1. Open `index.html` in a web browser
2. Navigate using the top navigation menu
3. (Optional) Configure Gemini API key in "AI Settings" for AI-generated questions
4. Click on period cards to access study materials
5. Complete practice questions to track progress
6. View dashboard for personalized recommendations
7. RSVP for live study sessions
8. Use resources hub for DBQ tools and practice sets

### Enabling AI-Generated Questions

1. Click "AI Settings" in the navigation menu
2. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Enter your API key in the configuration page
4. Click "Test Connection" to verify it works
5. Practice questions will now be dynamically generated using AI!

## Offline Demonstration

The site is designed for offline demonstration:
- No external API calls required
- All content embedded in JavaScript files
- LocalStorage for data persistence
- Smooth navigation without network dependency

## Future Enhancements

Potential additions for production:
- User authentication and cloud sync
- Real-time collaboration features
- Expanded question bank
- Video content integration
- Teacher dashboard
- Analytics and reporting

## Credits

Designed and developed for AP U.S. History exam preparation, aligned with College Board APUSH curriculum and FBLA Website Design competition standards.
