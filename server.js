const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const { evaluateResponses, DEFAULT_WEIGHTS } = require('./evaluation-engine');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// API Configuration
const API_CONFIG = {
    grok: {
        url: 'https://api.x.ai/v1/chat/completions',
        key: process.env.GROK_API_KEY,
        model: process.env.GROK_MODEL || 'grok-beta'
    },
    openrouter: {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        key: process.env.OPENROUTER_API_KEY || process.env.LLAMA_API_KEY,
        title: 'AI Comparison Tool',
        referer: 'http://localhost:3000'
    },
    chatgpt: {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        key: process.env.CHATGPT_API_KEY || process.env.OPENROUTER_API_KEY,
        model: 'openai/gpt-4o-mini' // Fast and reliable
    },
    llama: {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        key: process.env.LLAMA_API_KEY || process.env.OPENROUTER_API_KEY,
        model: 'meta-llama/llama-3.3-70b-instruct'
    },
    deepseek: {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        key: process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY,
        model: 'deepseek/deepseek-chat'
    }
};

// Helper function to call Grok API
async function callGrok(prompt, selectedModel) {
    const startTime = Date.now();

    const mapToOpenRouterModel = (model) => {
        if (!model) return null;
        if (model.startsWith('x-ai/')) return model;

        const mapping = {
            'grok-beta': 'x-ai/grok-3-beta',
            'grok-2': 'x-ai/grok-3-mini',
            'grok-2-1212': 'x-ai/grok-3-mini'
        };

        return mapping[model] || 'x-ai/grok-3-mini';
    };

    const tryOpenRouterGrok = async (preferredModel) => {
        if (!API_CONFIG.openrouter.key) {
            throw new Error('OpenRouter API key not configured for Grok fallback');
        }

        const modelCandidates = Array.from(new Set([
            mapToOpenRouterModel(preferredModel),
            'x-ai/grok-3-mini',
            'x-ai/grok-3-beta',
            'x-ai/grok-4.1-fast'
        ].filter(Boolean)));

        let lastError = null;

        for (const model of modelCandidates) {
            try {
                const response = await axios.post(
                    API_CONFIG.openrouter.url,
                    {
                        model,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a helpful AI assistant. Always provide responses in English and directly address the user\'s specific request without fluff.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        max_tokens: 1000,
                        temperature: 0.7
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${API_CONFIG.openrouter.key}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': API_CONFIG.openrouter.referer,
                            'X-Title': API_CONFIG.openrouter.title
                        },
                        timeout: 30000
                    }
                );

                return response;
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('OpenRouter Grok fallback failed');
    };

    try {
        if (!API_CONFIG.grok.key) {
            throw new Error('Grok API key not configured');
        }

        const modelCandidates = Array.from(new Set([
            selectedModel,
            API_CONFIG.grok.model,
            'grok-beta',
            'grok-2',
            'grok-2-1212'
        ].filter(Boolean)));

        let response = null;
        let lastError = null;

        for (const model of modelCandidates) {
            try {
                response = await axios.post(
                    API_CONFIG.grok.url,
                    {
                        model,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a helpful AI assistant. Always provide responses in English and directly address the user\'s specific request without fluff.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        max_tokens: 1000,
                        temperature: 0.7
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${API_CONFIG.grok.key}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                );
                break;
            } catch (error) {
                lastError = error;
                const statusCode = error.response?.status;
                const message = String(error.response?.data?.error || error.message || '').toLowerCase();
                const shouldFallbackToOpenRouter =
                    statusCode === 401 ||
                    statusCode === 403 ||
                    message.includes('model not found') ||
                    message.includes('does not have permission') ||
                    message.includes('credits') ||
                    message.includes('license');

                if (shouldFallbackToOpenRouter) {
                    try {
                        response = await tryOpenRouterGrok(model);
                        break;
                    } catch (fallbackError) {
                        lastError = fallbackError;
                    }
                } else {
                    throw error;
                }
            }
        }

        if (!response) {
            throw lastError || new Error('No Grok model candidate succeeded');
        }

        const responseTime = Date.now() - startTime;
        const content = response.data?.choices?.[0]?.message?.content || '';

        return {
            response: content || `Grok Response: Here is an answer to your prompt "${prompt.substring(0, 50)}...".`,
            responseTime,
            success: true
        };
    } catch (error) {
        console.error('Grok API Error:', error.response?.data || error.message);
        const responseTime = Date.now() - startTime;
        return {
            response: `Grok Response: For your query about "${prompt.substring(0, 50)}...", Grok provides direct, context-aware reasoning. This is a fallback response shown because the API request failed.`,
            responseTime,
            success: false,
            error: 'API request failed, showing fallback response'
        };
    }
}

// Helper function to call ChatGPT API (via OpenRouter)
async function callChatGPT(prompt) {
    const startTime = Date.now();

    try {
        if (!API_CONFIG.chatgpt.key) {
            throw new Error('ChatGPT/OpenRouter API key not configured');
        }

        const response = await axios.post(
            API_CONFIG.chatgpt.url,
            {
                model: API_CONFIG.chatgpt.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant. Always provide responses in English and directly address the user\'s specific request without fluff.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.chatgpt.key}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'AI Comparison Tool'
                },
                timeout: 30000
            }
        );

        const responseTime = Date.now() - startTime;
        const content = response.data?.choices?.[0]?.message?.content || '';

        return {
            response: content || 'ChatGPT returned an empty response.',
            responseTime,
            success: true
        };
    } catch (error) {
        console.error('ChatGPT API Error:', error.response?.data || error.message);
        const responseTime = Date.now() - startTime;

        return {
            response: `ChatGPT Response: For your question about "${prompt.substring(0, 50)}...", ChatGPT would provide high-performance reasoning. This fallback response is shown because the API request failed or the model was unavailable.`,
            responseTime,
            success: false,
            error: error.message
        };
    }
}

// Helper function to call Llama API (via OpenRouter)
async function callLlama(prompt) {
    const startTime = Date.now();

    try {
        if (!API_CONFIG.llama.key) {
            throw new Error('Llama/OpenRouter API key not configured');
        }

        const response = await axios.post(
            API_CONFIG.llama.url,
            {
                model: API_CONFIG.llama.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant. Always provide responses in English and directly address the user\'s specific request without fluff.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.llama.key}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'AI Comparison Tool'
                },
                timeout: 30000
            }
        );

        const responseTime = Date.now() - startTime;
        const content = response.data?.choices?.[0]?.message?.content || '';

        return {
            response: content || 'Llama returned an empty response.',
            responseTime,
            success: true
        };
    } catch (error) {
        console.error('Llama API Error:', error.response?.data || error.message);
        const responseTime = Date.now() - startTime;

        return {
            response: `Llama Response: For your question about "${prompt.substring(0, 50)}...", Llama provides high-performance open-source reasoning. This fallback response is shown because the API request failed.`,
            responseTime,
            success: false,
            error: error.message
        };
    }
}

// Helper function to call DeepSeek API (Using OpenRouter)
async function callDeepSeek(prompt) {
    const startTime = Date.now();

    try {
        if (!API_CONFIG.deepseek.key) {
            throw new Error('DeepSeek API key not configured');
        }

        const response = await axios.post(
            API_CONFIG.deepseek.url,
            {
                model: API_CONFIG.deepseek.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant. Always provide responses in English and directly address the user\'s specific request without fluff.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.deepseek.key}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'AI Comparison Tool'
                },
                timeout: 30000
            }
        );

        const responseTime = Date.now() - startTime;
        const content = response.data.choices[0].message.content;

        return {
            response: content,
            responseTime,
            success: true
        };
    } catch (error) {
        console.error('DeepSeek API Error:', error.response?.data || error.message);
        const responseTime = Date.now() - startTime;

        // Fallback to mock response if API fails
        return {
            response: `DeepSeek Response: For your question about "${prompt.substring(0, 50)}...", DeepSeek AI provides advanced reasoning capabilities. DeepSeek is designed to handle complex problem-solving and technical questions with depth and accuracy. This response shows how DeepSeek approaches analytical queries with systematic reasoning.`,
            responseTime,
            success: false,
            error: 'API request failed, showing mock response'
        };
    }
}



// Main endpoint to compare AI responses
app.post('/api/compare', async (req, res) => {
    const { prompt, grokModel } = req.body;

    if (!prompt || prompt.trim() === '') {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // Call all AI APIs in parallel
        const [grokResult, chatgptResult, llamaResult, deepseekResult] = await Promise.all([
            callGrok(prompt, grokModel),
            callChatGPT(prompt),
            callLlama(prompt),
            callDeepSeek(prompt)
        ]);

        const responses = {
            grok: grokResult,
            chatgpt: chatgptResult,
            llama: llamaResult,
            deepseek: deepseekResult
        };

        const evaluation = evaluateResponses(prompt, responses);

        res.json({
            success: true,
            responses,
            evaluation,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Comparison Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to compare AI responses',
            message: error.message
        });
    }
});

// Individual endpoints for faster async loading
app.post('/api/grok', async (req, res) => {
    const { prompt, grokModel } = req.body;
    console.log(`[POST /api/grok] Prompt received: "${prompt ? prompt.substring(0, 50) : 'MISSING'}"`);
    const result = await callGrok(prompt, grokModel);
    res.json(result);
});

app.post('/api/chatgpt', async (req, res) => {
    const { prompt } = req.body;
    console.log(`[POST /api/chatgpt] Prompt received: "${prompt ? prompt.substring(0, 50) : 'MISSING'}"`);
    const result = await callChatGPT(prompt);
    res.json(result);
});

app.post('/api/llama', async (req, res) => {
    const { prompt } = req.body;
    console.log(`[POST /api/llama] Prompt received: "${prompt ? prompt.substring(0, 50) : 'MISSING'}"`);
    const result = await callLlama(prompt);
    res.json(result);
});

app.post('/api/deepseek', async (req, res) => {
    const { prompt } = req.body;
    console.log(`[POST /api/deepseek] Prompt received: "${prompt ? prompt.substring(0, 50) : 'MISSING'}"`);
    const result = await callDeepSeek(prompt);
    res.json(result);
});

app.post('/api/evaluate', (req, res) => {
    const { prompt, responses, weights } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!responses || typeof responses !== 'object') {
        return res.status(400).json({ error: 'Responses object is required' });
    }

    const evaluation = evaluateResponses(prompt, responses, weights);
    return res.json({
        success: true,
        evaluation,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/weights', (req, res) => {
    res.json({
        success: true,
        weights: DEFAULT_WEIGHTS
    });
});

// Endpoint to analyze prompt quality
app.post('/api/analyze-prompt', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === '') {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Analyze prompt quality
    const analysis = analyzePromptQuality(prompt);
    const suggestions = generatePromptSuggestions(prompt, analysis);

    res.json({
        success: true,
        analysis,
        suggestions,
        improvedPrompt: suggestions.improvedVersion
    });
});

// Function to analyze prompt quality
function analyzePromptQuality(prompt) {
    const length = prompt.length;
    const wordCount = prompt.trim().split(/\s+/).length;
    const hasQuestion = /\?/.test(prompt);
    const hasContext = wordCount > 10;
    const isSpecific = /\b(specific|detail|explain|how|why|what|when|where)\b/i.test(prompt);
    const hasExamples = /\b(example|such as|like|for instance)\b/i.test(prompt);

    let score = 0;
    let issues = [];
    let strengths = [];

    // Length analysis
    if (wordCount < 5) {
        issues.push('Prompt is too short. Add more context and details.');
        score += 2;
    } else if (wordCount >= 5 && wordCount <= 50) {
        strengths.push('Good length for a prompt.');
        score += 5;
    } else {
        strengths.push('Comprehensive prompt with good detail.');
        score += 4;
    }

    // Question format
    if (hasQuestion) {
        strengths.push('Uses question format which helps AI understand intent.');
        score += 2;
    }

    // Context
    if (hasContext) {
        strengths.push('Provides sufficient context.');
        score += 2;
    } else {
        issues.push('Add more context to help AI understand your needs better.');
    }

    // Specificity
    if (isSpecific) {
        strengths.push('Uses specific keywords that guide the response.');
        score += 3;
    } else {
        issues.push('Be more specific about what you want.');
    }

    // Examples
    if (hasExamples) {
        strengths.push('Includes examples which clarify expectations.');
        score += 3;
    }

    return {
        score: Math.min(score, 10),
        maxScore: 10,
        wordCount,
        issues,
        strengths,
        quality: score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Fair' : 'Needs Improvement'
    };
}

// Function to generate prompt improvement suggestions
function generatePromptSuggestions(prompt, analysis) {
    let suggestions = [];
    let improvedPrompts = [];

    // Varied suggestion endings based on what's missing
    const contextEnhancements = [
        'Please provide a detailed explanation suitable for a general audience.',
        'Include practical examples and clear explanations.',
        'Explain this in a way that\'s easy to understand for beginners.',
        'Provide comprehensive information with relevant details.',
        'Give a thorough explanation with actionable insights.'
    ];

    const audienceSpecifications = [
        'Target the explanation for someone with no prior knowledge.',
        'Explain this for a professional audience.',
        'Make it understandable for a technical audience.',
        'Tailor the explanation for a business context.'
    ];

    const formatSpecifications = [
        'Structure the response with clear sections and bullet points.',
        'Use a step-by-step format for clarity.',
        'Organize the information in a logical flow.',
        'Present the information in an easy-to-scan format.'
    ];

    // Generate varied improved versions
    if (analysis.wordCount < 10) {
        // Select varied enhancements
        improvedPrompts.push(`${prompt} ${contextEnhancements[0]}`);
        improvedPrompts.push(`${prompt} ${contextEnhancements[1]}`);
        improvedPrompts.push(`${prompt} ${audienceSpecifications[0]}`);

        suggestions.push('📝 Add context: Consider specifying who your audience is and what format you prefer.');
    } else if (analysis.wordCount < 20) {
        improvedPrompts.push(`${prompt} ${contextEnhancements[2]}`);
        improvedPrompts.push(`${prompt} ${formatSpecifications[0]}`);

        suggestions.push('📝 Add more detail: Include information about the format or depth you\'re looking for.');
    } else {
        improvedPrompts.push(`${prompt} ${contextEnhancements[4]}`);
        improvedPrompts.push(prompt);
    }

    if (analysis.score < 8) {
        suggestions.push('💡 Increase specificity: Add details about what exactly you want to know or achieve.');
    }

    if (!analysis.strengths.some(s => s.includes('examples'))) {
        suggestions.push('🔍 Use examples: Provide concrete examples to illustrate what you\'re looking for.');
    }

    if (!prompt.includes('?')) {
        suggestions.push('❓ Frame as question: Rephrase as a direct question for clarity.');
        // Ensure improved versions end with question mark
        improvedPrompts = improvedPrompts.map(p =>
            p.endsWith('?') ? p : p + '?'
        );
    }

    suggestions.push('✅ Be specific: Include desired format, length, detail level, and target audience.');
    suggestions.push('🎯 Use action verbs: Try explain, analyze, compare, describe, list, evaluate, etc.');

    // Select primary improved version (the most specific one)
    const improvedVersion = improvedPrompts.length > 0 ? improvedPrompts[0] : prompt;

    return {
        suggestions,
        improvedVersion: improvedVersion,
        alternativeVersions: improvedPrompts.slice(1, 3) // Show up to 2 alternative versions
    };
}

// ============================================================
// Project Implementation Planner
// ============================================================

function buildImplementationPlan(prompt) {
    const p = prompt.toLowerCase();

    // ── Detect project type from keywords ──────────────────
    const isWeb = /web|website|frontend|html|css|react|vue|angular|next|nuxt|svelte/.test(p);
    const isMobile = /mobile|android|ios|flutter|react native|expo|swift|kotlin/.test(p);
    const isAPI = /api|rest|graphql|endpoint|backend|express|fastapi|django|flask|spring/.test(p);
    const isDB = /database|db|sql|postgres|mysql|mongodb|firebase|supabase|prisma|orm/.test(p);
    const isAI = /ai|ml|machine learning|deep learning|model|llm|chatbot|nlp|neural|train/.test(p);
    const isCLI = /cli|command.line|terminal|script|bash|powershell|automation/.test(p);
    const isFullStack = (isWeb || isMobile) && isAPI;

    // ── Tech stack detection ───────────────────────────────
    const techStack = [];
    if (/react/.test(p)) techStack.push('React');
    if (/next/.test(p)) techStack.push('Next.js');
    if (/vue/.test(p)) techStack.push('Vue.js');
    if (/angular/.test(p)) techStack.push('Angular');
    if (/svelte/.test(p)) techStack.push('Svelte');
    if (/flutter/.test(p)) techStack.push('Flutter');
    if (/react native/.test(p)) techStack.push('React Native');
    if (/express/.test(p)) techStack.push('Express.js');
    if (/fastapi/.test(p)) techStack.push('FastAPI');
    if (/django/.test(p)) techStack.push('Django');
    if (/flask/.test(p)) techStack.push('Flask');
    if (/node/.test(p)) techStack.push('Node.js');
    if (/python/.test(p)) techStack.push('Python');
    if (/typescript/.test(p)) techStack.push('TypeScript');
    if (/postgres/.test(p)) techStack.push('PostgreSQL');
    if (/mysql/.test(p)) techStack.push('MySQL');
    if (/mongodb/.test(p)) techStack.push('MongoDB');
    if (/firebase/.test(p)) techStack.push('Firebase');
    if (/supabase/.test(p)) techStack.push('Supabase');
    if (/docker/.test(p)) techStack.push('Docker');
    if (/kubernetes|k8s/.test(p)) techStack.push('Kubernetes');
    if (/aws/.test(p)) techStack.push('AWS');
    if (/vercel/.test(p)) techStack.push('Vercel');

    // Smart defaults when nothing detected
    if (techStack.length === 0) {
        if (isAI) techStack.push('Python', 'PyTorch / TensorFlow', 'FastAPI');
        else if (isMobile) techStack.push('React Native', 'Expo', 'Node.js');
        else if (isCLI) techStack.push('Node.js', 'Commander.js');
        else techStack.push('Node.js', 'Express.js', isWeb ? 'React' : 'REST API', 'PostgreSQL');
    }

    // ── Extract a project title ────────────────────────────
    const words = prompt.trim().split(/\s+/);
    const title = words.slice(0, 8).join(' ') + (words.length > 8 ? '…' : '');

    // ── Build dynamic dev steps by project type ────────────
    const devSteps = [];
    if (isWeb || (!isMobile && !isCLI && !isAI)) {
        devSteps.push(
            'Set up project scaffolding (Vite / Create React App / Next.js)',
            'Implement reusable component library with theming',
            'Build main pages / views and routing',
            'Integrate with backend API endpoints',
            'Add authentication / authorization flow',
            'Handle loading, error, and empty states'
        );
    }
    if (isMobile) {
        devSteps.push(
            'Initialise project with Expo or native CLI',
            'Design navigation structure (stack / tab / drawer)',
            'Build core screens and components',
            'Integrate device APIs (camera, notifications, location)',
            'Connect to backend services',
            'Handle offline mode and data caching'
        );
    }
    if (isAPI || isFullStack) {
        devSteps.push(
            'Define REST / GraphQL schema and route structure',
            'Implement controllers and service layer',
            'Add request validation and error handling middleware',
            'Connect ORM / database and write migrations',
            'Secure endpoints with JWT / OAuth',
            'Add rate limiting, logging, and health-check route'
        );
    }
    if (isDB) {
        devSteps.push(
            'Design normalized data schema / entity relationships',
            'Write database migrations and seed scripts',
            'Implement repository / data-access layer',
            'Add indexing strategy for query performance'
        );
    }
    if (isAI) {
        devSteps.push(
            'Collect and preprocess training / evaluation data',
            'Select and configure model architecture',
            'Train model and monitor loss / metrics (MLflow / W&B)',
            'Evaluate model with validation set and adjust hyperparameters',
            'Export / quantize model for production serving',
            'Wrap model in an inference API endpoint'
        );
    }
    if (isCLI) {
        devSteps.push(
            'Define command structure and argument schema',
            'Implement sub-commands and flags with help text',
            'Add config file support (dotenv / cosmiconfig)',
            'Write progress indicators and colourful output',
            'Package and publish to npm / PyPI'
        );
    }
    if (devSteps.length === 0) {
        devSteps.push(
            'Break the project into modules and define interfaces',
            'Implement core business logic',
            'Wire up data persistence layer',
            'Build user-facing interface or API surface',
            'Integrate third-party services as needed'
        );
    }

    // ── 5 universal phases ────────────────────────────────
    const phases = [
        {
            id: 1,
            icon: '📋',
            name: 'Requirements & Planning',
            description: 'Define what you are building, who it is for, and what constraints exist.',
            steps: [
                'Write user stories / acceptance criteria for each feature',
                'Document functional and non-functional requirements (performance, security, scalability)',
                'Identify stakeholders and define MVP scope',
                'Choose tech stack and justify each choice',
                'Estimate effort and create a project timeline (milestones)',
                'Set up project management board (GitHub Projects / Jira / Trello)'
            ],
            promptTips: [
                'State the target audience clearly ("for non-technical users aged 40+")',
                'Mention constraints upfront ("must work offline", "budget < $50/mo")',
                'Specify the MVP scope vs nice-to-haves explicitly'
            ]
        },
        {
            id: 2,
            icon: '🎨',
            name: 'Architecture & Design',
            description: 'Design the system before writing a single line of production code.',
            steps: [
                'Draw a high-level system architecture diagram (C4 or informal)',
                'Define data models / entity-relationship diagram',
                'Design API contract (OpenAPI / Swagger spec)',
                'Create UI wireframes / mockups for all key screens',
                'Plan folder structure and module boundaries',
                'Document architectural decisions (ADRs)'
            ],
            promptTips: [
                'Describe the data flow: "User submits form → API validates → DB stores → webhook fires"',
                'Include scale requirements: expected users, requests/sec, data volume',
                'Ask AI to generate the OpenAPI spec before any code'
            ]
        },
        {
            id: 3,
            icon: '⚙️',
            name: 'Development',
            description: 'Implement the project following the architecture design.',
            steps: devSteps
        },
        {
            id: 4,
            icon: '🧪',
            name: 'Testing & Quality',
            description: 'Ensure correctness, reliability and performance at every layer.',
            steps: [
                'Write unit tests for all business-logic functions (>80% coverage)',
                'Write integration tests for API endpoints',
                'Perform end-to-end tests for critical user flows (Playwright / Cypress)',
                'Run linting, type-checking and static analysis in CI',
                'Conduct load / stress tests for heavily used endpoints',
                'Perform security audit (OWASP Top 10, dependency scanning)',
                'Collect user acceptance testing (UAT) feedback'
            ],
            promptTips: [
                'Ask AI: "Write Jest unit tests for [function name] covering edge cases"',
                'Provide the function signature and expected outputs in your prompt',
                'Ask for both happy path and failure/error case tests'
            ]
        },
        {
            id: 5,
            icon: '🚀',
            name: 'Deployment & Documentation',
            description: 'Ship reliably and make the project maintainable long-term.',
            steps: [
                'Set up CI/CD pipeline (GitHub Actions / GitLab CI)',
                'Configure staging and production environments',
                'Add environment variable management (.env, secrets manager)',
                'Write comprehensive README (setup, usage, contributing guide)',
                'Document API with interactive Swagger / Redoc UI',
                'Implement monitoring, alerting and error tracking (Sentry / Datadog)',
                'Create runbook for common operational procedures'
            ],
            promptTips: [
                'Ask AI: "Write a production-ready GitHub Actions workflow for [stack]"',
                'Specify your hosting target ("deploy to Vercel", "containerise for AWS ECS")',
                'Ask for a README template and fill in project-specific details'
            ]
        }
    ];

    // ── Prompt engineering guide ───────────────────────────
    const promptGuide = {
        doList: [
            '✅ Specify the audience: "Explain for a junior developer"',
            '✅ Provide context: "I am using React 18 with TypeScript and Vite"',
            '✅ State constraints: "Must run in a Docker container, no cloud deps"',
            '✅ Define output format: "Return valid JSON", "Use bullet points"',
            '✅ Break large requests into steps: ask for design first, then code',
            '✅ Include examples: "Like Stripe\'s webhook system but for SMS"',
            '✅ Ask for alternatives: "Give me 3 different approaches with trade-offs"'
        ],
        dontList: [
            '❌ Vague: "Make a website" \u2192 Be specific about features and tech',
            '❌ Too broad: "Build an e-commerce app" \u2192 Scope to one feature at a time',
            '❌ No context: Dumping raw code without explaining what it should do',
            '❌ Ambiguous pronouns: "Fix it" \u2192 Say exactly what "it" refers to',
            '❌ Assuming knowledge: Mention the framework version, OS, and dependencies'
        ],
        templatePrompt: `I am building [PROJECT TYPE] for [TARGET AUDIENCE].

Tech stack: [STACK]
Constraints: [CONSTRAINTS]
Current state: [WHAT EXISTS ALREADY]

Task: [SPECIFIC TASK — one thing at a time]

Expected output: [FORMAT — code, JSON, explanation, diagram, etc.]

Example of what I want: [OPTIONAL BUT VERY HELPFUL]`
    };

    return {
        title: `Project Plan: ${title}`,
        summary: `A structured 5-phase implementation plan for: "${prompt.trim()}"`,
        techStack,
        phases,
        promptGuide
    };
}

// Project Implementation Planner endpoint
app.post('/api/plan', (req, res) => {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: 'Project description prompt is required' });
    }

    if (prompt.trim().length < 5) {
        return res.status(400).json({ error: 'Please provide a more detailed project description' });
    }

    const plan = buildImplementationPlan(prompt.trim());
    return res.json({ success: true, plan, timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'AI Comparison Tool API is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 AI Comparison Tool Server is running!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   - POST /api/compare        - Compare AI responses`);
    console.log(`   - POST /api/evaluate       - Evaluate responses with weighted metrics`);
    console.log(`   - POST /api/analyze-prompt - Analyze prompt quality`);
    console.log(`   - POST /api/plan           - Generate project implementation plan`);
    console.log(`   - GET  /api/weights        - Default metric weights`);
    console.log(`   - GET  /api/health         - Health check\n`);
});

module.exports = app;
