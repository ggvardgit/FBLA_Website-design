// Gemini AI API Integration for Question Generation
// Uses Google's Gemini API to generate APUSH practice questions

const GEMINI_CONFIG = {
    apiKey: localStorage.getItem('gemini_api_key') || '',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    fallbackEnabled: true // Use sample questions if API fails
};

// Initialize Gemini API key from user input or localStorage
function setGeminiApiKey(apiKey) {
    if (apiKey && apiKey.trim()) {
        GEMINI_CONFIG.apiKey = apiKey.trim();
        localStorage.setItem('gemini_api_key', GEMINI_CONFIG.apiKey);
        return true;
    }
    return false;
}

// Get current API key status
function hasApiKey() {
    return GEMINI_CONFIG.apiKey && GEMINI_CONFIG.apiKey.length > 0;
}

// Generate SAQ (Short Answer Question) using Gemini
async function generateSAQ(period, topic = null) {
    if (!hasApiKey()) {
        console.warn('Gemini API key not set. Using fallback questions.');
        return null;
    }

    const prompt = `Generate a Short Answer Question (SAQ) for AP U.S. History Period ${period.number}: ${period.name} (${period.dates}).

Requirements:
- The question should test understanding of key themes: ${period.themes.slice(0, 3).join(', ')}
- Format as a single question that can be answered in 2-3 sentences
- Include 4 multiple choice options that are plausible but only one is clearly correct
- The correct answer should align with College Board APUSH standards
- Make it specific to this period's content

Return ONLY a JSON object in this exact format:
{
    "question": "The question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "feedback": "Brief explanation of why the correct answer is right"
}

${topic ? `Focus the question on: ${topic}` : ''}`;

    try {
        const response = await fetch(`${GEMINI_CONFIG.apiUrl}?key=${GEMINI_CONFIG.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text;
            
            // Extract JSON from response (handle markdown code blocks)
            let jsonText = text.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/```\n?/g, '').trim();
            }
            
            const question = JSON.parse(jsonText);
            
            // Validate question structure
            if (question.question && question.options && question.options.length === 4 && 
                typeof question.correct === 'number' && question.feedback) {
                return question;
            } else {
                throw new Error('Invalid question format from API');
            }
        } else {
            throw new Error('No content in API response');
        }
    } catch (error) {
        console.error('Error generating SAQ with Gemini:', error);
        if (GEMINI_CONFIG.fallbackEnabled) {
            return null; // Will trigger fallback
        }
        throw error;
    }
}

// Generate DBQ prompt using Gemini
async function generateDBQ(period) {
    if (!hasApiKey()) {
        console.warn('Gemini API key not set. Using fallback DBQ.');
        return null;
    }

    const prompt = `Generate a Document-Based Question (DBQ) prompt for AP U.S. History Period ${period.number}: ${period.name} (${period.dates}).

Requirements:
- The prompt should align with College Board APUSH DBQ format
- Should be evaluative (evaluate the extent to which...)
- Should relate to key themes: ${period.themes.slice(0, 3).join(', ')}
- Should be appropriate for a 7-document DBQ
- Make it specific and historically accurate

Return ONLY a JSON object in this exact format:
{
    "prompt": "The full DBQ prompt text here",
    "documents": 7,
    "points": 7,
    "themes": ["Theme 1", "Theme 2", "Theme 3"]
}`;

    try {
        const response = await fetch(`${GEMINI_CONFIG.apiUrl}?key=${GEMINI_CONFIG.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text;
            
            let jsonText = text.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/```\n?/g, '').trim();
            }
            
            const dbq = JSON.parse(jsonText);
            
            if (dbq.prompt && dbq.documents && dbq.points) {
                return dbq;
            } else {
                throw new Error('Invalid DBQ format from API');
            }
        } else {
            throw new Error('No content in API response');
        }
    } catch (error) {
        console.error('Error generating DBQ with Gemini:', error);
        if (GEMINI_CONFIG.fallbackEnabled) {
            return null;
        }
        throw error;
    }
}

// Generate LEQ prompt using Gemini
async function generateLEQ(period) {
    if (!hasApiKey()) {
        console.warn('Gemini API key not set. Using fallback LEQ.');
        return null;
    }

    const prompt = `Generate a Long Essay Question (LEQ) prompt for AP U.S. History Period ${period.number}: ${period.name} (${period.dates}).

Requirements:
- The prompt should align with College Board APUSH LEQ format
- Should be evaluative (evaluate the extent to which...)
- Should relate to key themes: ${period.themes.slice(0, 3).join(', ')}
- Should be appropriate for a 6-point LEQ
- Make it specific and historically accurate

Return ONLY a JSON object in this exact format:
{
    "prompt": "The full LEQ prompt text here",
    "points": 6,
    "themes": ["Theme 1", "Theme 2"]
}`;

    try {
        const response = await fetch(`${GEMINI_CONFIG.apiUrl}?key=${GEMINI_CONFIG.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text;
            
            let jsonText = text.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/```\n?/g, '').trim();
            }
            
            const leq = JSON.parse(jsonText);
            
            if (leq.prompt && leq.points) {
                return leq;
            } else {
                throw new Error('Invalid LEQ format from API');
            }
        } else {
            throw new Error('No content in API response');
        }
    } catch (error) {
        console.error('Error generating LEQ with Gemini:', error);
        if (GEMINI_CONFIG.fallbackEnabled) {
            return null;
        }
        throw error;
    }
}

// Generate multiple SAQs for a period
async function generateMultipleSAQs(period, count = 3) {
    const questions = [];
    for (let i = 0; i < count; i++) {
        try {
            const question = await generateSAQ(period);
            if (question) {
                question.id = `ai-saq-${period.number}-${i + 1}`;
                questions.push(question);
            }
        } catch (error) {
            console.error(`Error generating question ${i + 1}:`, error);
        }
    }
    return questions;
}

// Export functions
window.GeminiAPI = {
    setGeminiApiKey,
    hasApiKey,
    generateSAQ,
    generateDBQ,
    generateLEQ,
    generateMultipleSAQs,
    GEMINI_CONFIG
};
