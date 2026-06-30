// Validation script for APUSH Learning Hub
// Run this in browser console to validate setup

console.log('🔍 APUSH Learning Hub - Setup Validation');
console.log('=' .repeat(50));

const checks = {
    files: [],
    apis: [],
    errors: []
};

// Check if required files are loaded
function checkFile(name, required = true) {
    try {
        if (typeof window[name] !== 'undefined') {
            checks.files.push(`✅ ${name} loaded`);
            return true;
        } else if (required) {
            checks.errors.push(`❌ ${name} not found (required)`);
            return false;
        } else {
            checks.files.push(`⚠️  ${name} not loaded (optional)`);
            return false;
        }
    } catch (e) {
        checks.errors.push(`❌ Error checking ${name}: ${e.message}`);
        return false;
    }
}

// Validate setup
console.log('\n📁 Checking Required Files...');
checkFile('APUSH', true); // Main APUSH object
checkFile('APUSH_DATA', true); // Period data

console.log('\n🤖 Checking AI Integration...');
checkFile('OpenAIAPI', false); // Optional; server OpenAI via python app.py

console.log('\n📊 Checking Data Structure...');
if (window.APUSH_DATA) {
    const periods = Object.keys(window.APUSH_DATA.periods || {});
    if (periods.length === 8) {
        checks.apis.push(`✅ All 8 periods loaded (${periods.join(', ')})`);
    } else {
        checks.errors.push(`❌ Expected 8 periods, found ${periods.length}`);
    }
    
    // Check period structure
    const samplePeriod = window.APUSH_DATA.periods[3];
    if (samplePeriod) {
        const requiredFields = ['number', 'name', 'dates', 'themes', 'timeline'];
        const missing = requiredFields.filter(f => !samplePeriod[f]);
        if (missing.length === 0) {
            checks.apis.push('✅ Period data structure valid');
        } else {
            checks.errors.push(`❌ Missing fields in period data: ${missing.join(', ')}`);
        }
    }
}

console.log('\n💾 Checking LocalStorage...');
try {
    const progress = localStorage.getItem('userProgress');
    if (progress) {
        checks.apis.push('✅ User progress data found');
    } else {
        checks.apis.push('ℹ️  No user progress yet (this is normal for new users)');
    }
    
    checks.apis.push('ℹ️  OpenAI API key is server-side (OPENAI_API_KEY), not in localStorage');
} catch (e) {
    checks.errors.push(`❌ LocalStorage error: ${e.message}`);
}

console.log('\n🎨 Checking UI Elements...');
const requiredElements = [
    { id: 'readiness-percentage', name: 'Readiness percentage' },
    { id: 'units-grid', name: 'Units grid' },
    { id: 'overall-mastery', name: 'Overall mastery' }
];

requiredElements.forEach(el => {
    const element = document.getElementById(el.id);
    if (element) {
        checks.apis.push(`✅ ${el.name} element found`);
    } else {
        // Not an error if not on current page
        checks.apis.push(`ℹ️  ${el.name} not on current page`);
    }
});

// Print results
console.log('\n' + '='.repeat(50));
console.log('\n📋 VALIDATION RESULTS\n');

if (checks.files.length > 0) {
    console.log('Files:');
    checks.files.forEach(f => console.log('  ' + f));
}

if (checks.apis.length > 0) {
    console.log('\nStatus:');
    checks.apis.forEach(a => console.log('  ' + a));
}

if (checks.errors.length > 0) {
    console.log('\n❌ Errors:');
    checks.errors.forEach(e => console.log('  ' + e));
    console.log('\n⚠️  Some issues found. Please check the errors above.');
} else {
    console.log('\n✅ All checks passed! Setup looks good.');
}

console.log('\n' + '='.repeat(50));
console.log('\n💡 Quick Test Commands:');
console.log('  - Test navigation: Click through all menu items');
console.log('  - Test theme: Click theme toggle button');
console.log('  - Test AI: Run python app.py with OPENAI_API_KEY; Settings → AI shows status');
console.log('  - Test practice: Go to Units → Select Period → Practice tab');
console.log('\n📖 See TEST_GUIDE.md for complete testing instructions');

// Return validation status
window.VALIDATION_RESULTS = {
    passed: checks.errors.length === 0,
    files: checks.files,
    status: checks.apis,
    errors: checks.errors
};


