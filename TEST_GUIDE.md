# APUSH Learning Hub - Test Guide

## Quick Start

### Option 1: Python HTTP Server (Recommended)
```bash
python3 test-server.py
```
This will:
- Start a local server on port 8000
- Automatically open your browser
- Serve all files with proper headers

### Option 2: Python Simple Server
```bash
python3 -m http.server 8000
```
Then open: http://localhost:8000/index.html

### Option 3: Direct File Opening
Simply open `index.html` in your browser (some features may be limited due to CORS)

## Test Checklist

### ✅ Navigation & Basic Functionality

- [ ] **Home Page Loads**
  - Open index.html
  - Verify all sections display correctly
  - Check navigation menu works
  - Test theme toggle (dark/light mode)
  - Test reduced motion toggle

- [ ] **Units Overview**
  - Navigate to Units page
  - Verify all 8 period cards display
  - Check difficulty badges show correctly
  - Click a period card → should navigate to unit-study page

- [ ] **Unit Study Page**
  - Select a period (e.g., Period 3)
  - Test all 5 tabs:
    - [ ] Overview tab shows themes, skills, concepts
    - [ ] Timeline tab displays events
    - [ ] Causes & Effects tab shows chains
    - [ ] Primary Sources tab shows source cards
    - [ ] Practice tab loads questions
  - Test progress bar updates
  - Click primary source → modal should open
  - Test practice question submission

- [ ] **Dashboard**
  - Navigate to Dashboard
  - Verify progress ring displays
  - Check mastery by period list
  - Verify "Study Next" recommendation appears
  - Check weakest themes section
  - Verify skills progress grid
  - Check recent activity feed

- [ ] **Live Study Schedule**
  - Navigate to Schedule page
  - Verify calendar displays
  - Test week navigation (prev/next)
  - Check session cards display
  - Test RSVP button (should toggle state)
  - Test period filter dropdown

- [ ] **Resources Hub**
  - Navigate to Resources page
  - Test all three filters (period, skill, format)
  - Verify resource cards display
  - Click DBQ tool resource → modal should open
  - Test DBQ scorer (checkboxes and inputs)
  - Verify total score calculates correctly

### ✅ AI Integration (Gemini)

- [ ] **API Configuration**
  - Navigate to "AI Settings" in menu
  - Verify configuration page loads
  - Test API key input field
  - Test "Save API Key" button
  - Test "Test Connection" button (with valid key)
  - Test "Clear API Key" button

- [ ] **AI Question Generation** (Requires API Key)
  - Configure valid Gemini API key
  - Go to Unit Study → Practice tab
  - Select SAQ, DBQ, or LEQ
  - Verify "✨ AI-Generated" indicator appears
  - Test "Generate New Question" button
  - Verify new questions are generated

- [ ] **Fallback Behavior** (No API Key)
  - Clear API key or don't set one
  - Go to Unit Study → Practice tab
  - Verify sample questions still load
  - Verify no errors occur

### ✅ Responsive Design

- [ ] **Mobile View** (Resize browser to < 768px)
  - Navigation menu should collapse
  - Hamburger menu should appear
  - All content should be readable
  - Cards should stack vertically
  - Calendar should remain functional

- [ ] **Tablet View** (768px - 1024px)
  - Layout should adapt appropriately
  - Grids should adjust column count

- [ ] **Desktop View** (> 1024px)
  - Full layout with all features visible
  - Hover effects work correctly

### ✅ Accessibility

- [ ] **Keyboard Navigation**
  - Tab through all interactive elements
  - Enter/Space should activate buttons
  - Focus indicators should be visible

- [ ] **Screen Reader**
  - All images have alt text
  - ARIA labels present on interactive elements
  - Semantic HTML structure

- [ ] **Color Contrast**
  - Text is readable in light mode
  - Text is readable in dark mode
  - Focus states are visible

### ✅ Data Persistence

- [ ] **LocalStorage**
  - Complete a practice question
  - Refresh page
  - Verify progress persists
  - Check dashboard updates
  - Verify API key persists (if set)

- [ ] **Progress Tracking**
  - Complete questions in different periods
  - Check dashboard shows updated mastery
  - Verify "Study Next" updates
  - Check activity feed updates

### ✅ Error Handling

- [ ] **Invalid API Key**
  - Enter invalid API key
  - Test connection → should show error
  - Verify fallback questions still work

- [ ] **Network Issues**
  - Disconnect internet
  - Verify site still works (offline mode)
  - Sample questions should load

- [ ] **Missing Data**
  - Navigate to unit-study without period parameter
  - Should redirect or show error gracefully

## Test Scenarios

### Scenario 1: New User Journey
1. Open home page
2. Click "Units" → Browse periods
3. Click Period 3 card
4. Explore Overview tab
5. Switch to Timeline tab
6. View Primary Sources
7. Go to Practice tab
8. Complete an SAQ question
9. Check Dashboard for updated progress
10. View "Study Next" recommendation

### Scenario 2: AI-Powered Study Session
1. Configure Gemini API key
2. Navigate to Period 5 study page
3. Go to Practice → SAQ
4. Verify AI-generated question appears
5. Answer question
6. Click "Generate New Question"
7. Verify new question loads
8. Repeat for DBQ and LEQ

### Scenario 3: Dashboard Analysis
1. Complete questions across multiple periods
2. Navigate to Dashboard
3. Review overall mastery percentage
4. Check period-by-period breakdown
5. Identify weakest themes
6. Click "Study Next" recommendation
7. Review skills progress
8. Check recent activity feed

### Scenario 4: Live Study Session
1. Navigate to Schedule page
2. Browse upcoming sessions
3. Filter by Period 7
4. RSVP for a session
5. Verify button changes to "Confirmed"
6. Navigate away and return
7. Verify RSVP persists

## Performance Tests

- [ ] Page load time < 1 second
- [ ] Navigation between pages is smooth
- [ ] Question generation < 5 seconds (with API)
- [ ] No console errors
- [ ] No broken images or resources

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Known Limitations

1. **API Key Required**: AI features require Gemini API key (free from Google)
2. **CORS**: Direct file opening may have CORS issues with API calls
3. **LocalStorage**: Data is browser-specific (clears with browser data)
4. **Offline Mode**: Works offline but AI features require internet

## Quick Test Commands

```bash
# Start test server
python3 test-server.py

# Or use Python's built-in server
python3 -m http.server 8000

# Check for JavaScript errors (in browser console)
# Open DevTools (F12) → Console tab
```

## Reporting Issues

If you find issues during testing:
1. Note the browser and version
2. Check browser console for errors
3. Note the steps to reproduce
4. Screenshot if possible

## Success Criteria

✅ All pages load without errors
✅ Navigation works smoothly
✅ All interactive features function
✅ Responsive design works on mobile
✅ AI integration works (with API key)
✅ Fallback works (without API key)
✅ Data persists across sessions
✅ No console errors
✅ Accessibility features work

