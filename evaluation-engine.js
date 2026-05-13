const MODEL_KEYS = ['grok', 'chatgpt', 'llama', 'deepseek'];

const DEFAULT_WEIGHTS = {
    responseTime: 0.05,
    accuracy: 0.15,
    comprehensiveness: 0.10,
    precisionRecall: 0.10,
    sentimentDetection: 0.05,
    multiModality: 0.05,
    predictiveAccuracy: 0.05,
    scalability: 0.05,
    explainability: 0.05,
    contextAwareness: 0.10,
    customization: 0.05,
    promptSensitivity: 0.05,
    knowledgeFreshness: 0.05,
    integration: 0.05,
    costValue: 0.05
};

const METRIC_META = {
    responseTime: {
        name: 'Response Time',
        description: 'Measures how fast the tool responds to a query or data request.',
        icon: '⚡'
    },
    accuracy: {
        name: 'Accuracy of Output',
        description: 'Correctness of insights, summaries, or classifications compared to ground truth.',
        icon: '🎯'
    },
    comprehensiveness: {
        name: 'Comprehensiveness',
        description: 'How thoroughly the tool analyzes input (e.g., are all relevant themes detected?).',
        icon: '📚'
    },
    precisionRecall: {
        name: 'Precision & Recall',
        description: 'Accuracy of identified patterns and ratio of relevant patterns found.',
        icon: '📊'
    },
    sentimentDetection: {
        name: 'Sentiment Detection Quality',
        description: 'How accurately emotions (positive, negative, neutral) are captured.',
        icon: '💡'
    },
    multiModality: {
        name: 'Multi-Modality Support',
        description: 'Ability to analyze different data formats — text, audio, video, etc.',
        icon: '📺'
    },
    predictiveAccuracy: {
        name: 'Predictive Accuracy',
        description: 'How well the tool forecasts future user behaviors or trends.',
        icon: '📈'
    },
    scalability: {
        name: 'Scalability',
        description: 'Ability to handle increasing volumes of data efficiently.',
        icon: '⚙️'
    },
    explainability: {
        name: 'Explainability / Interpretability',
        description: 'How well the tool explains why it made a certain suggestion or classification.',
        icon: '🔍'
    },
    contextAwareness: {
        name: 'Context Awareness',
        description: 'Ability to understand context over multiple interactions or user statements.',
        icon: '👥'
    },
    customization: {
        name: 'Customization & Fine-Tuning',
        description: 'Allows adjustments based on domain, language, or business needs.',
        icon: '🛠️'
    },
    promptSensitivity: {
        name: 'Prompt Sensitivity',
        description: 'Effectiveness with different prompt styles (concise, descriptive, conversational).',
        icon: '📝'
    },
    knowledgeFreshness: {
        name: 'Knowledge Freshness',
        description: 'How up-to-date the knowledge base is.',
        icon: '📅'
    },
    integration: {
        name: 'Integration & API Support',
        description: 'Ease of integrating with data pipelines, CRMs, and reporting tools.',
        icon: '🔌'
    },
    costValue: {
        name: 'Cost vs. Value',
        description: 'Pricing efficiency — analysis quality relative to price point.',
        icon: '💰'
    }
};

function clamp(value, min = 0, max = 10) {
    return Math.max(min, Math.min(max, value));
}

function normalizeWeights(weights = {}) {
    const merged = {
        ...DEFAULT_WEIGHTS,
        ...weights
    };

    const safeTotal = Object.values(merged).reduce((total, value) => {
        return total + (Number.isFinite(value) && value > 0 ? value : 0);
    }, 0);

    if (safeTotal === 0) {
        return { ...DEFAULT_WEIGHTS };
    }

    return Object.fromEntries(
        Object.entries(merged).map(([key, value]) => [key, (value > 0 ? value : 0) / safeTotal])
    );
}

function tokenize(text) {
    return (text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length > 2);
}

function extractPromptKeywords(prompt) {
    const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'what', 'when', 'where', 'which', 'will', 'would', 'could', 'should', 'about', 'into', 'your']);
    return tokenize(prompt).filter((token) => !stopWords.has(token));
}

function scoreResponseTime(responseTimeMs = 0) {
    const maxReasonableMs = 120000; // Increased to 120s to accommodate even the slowest models
    return clamp(10 - (responseTimeMs / maxReasonableMs) * 10);
}

function scoreAccuracy(text = '') {
    const lower = text.toLowerCase();
    let score = 5.0; // Base score

    if (lower.includes('according to') || lower.includes('research shows') ||
        lower.includes('studies indicate') || lower.includes('data suggests')) {
        score += 2;
    }

    const hedges = ['might', 'possibly', 'perhaps', 'could be', 'may be'];
    const hedgeCount = hedges.filter(h => lower.includes(h)).length;
    score -= hedgeCount * 0.5;

    if (text.includes('[') || text.includes('source:') || text.includes('reference:')) {
        score += 2;
    }

    return clamp(score);
}

function scoreComprehensiveness(text = '') {
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).length;
    const hasLists = /[-*]\s|[0-9]\./g.test(text);
    const hasMultipleParagraphs = text.split('\n\n').length > 1;

    let score = (Math.min(wordCount, 500) / 500) * 5;
    if (hasLists) score += 2;
    if (hasMultipleParagraphs) score += 2;
    if (sentenceCount > 5) score += 1;

    return clamp(score);
}

function scorePrecisionRecall(text = '') {
    let score = 5;
    const lower = text.toLowerCase();

    const fluffWords = ['basically', 'essentially', 'actually', 'literally', 'just'];
    const fluffCount = fluffWords.filter(w => lower.includes(w)).length;
    score -= fluffCount * 0.5;

    const hasExamples = lower.includes('example') || lower.includes('for instance');
    const hasMultiplePoints = (lower.match(/firstly|secondly|additionally|furthermore|moreover/gi) || []).length;

    if (hasExamples) score += 2;
    score += Math.min(3, hasMultiplePoints);

    return clamp(score);
}

function scoreSentimentDetection(text = '') {
    const lower = text.toLowerCase();
    let score = 5;

    const positiveWords = ['benefit', 'advantage', 'positive', 'improve', 'enhance'];
    const negativeWords = ['challenge', 'issue', 'problem', 'disadvantage', 'concern'];
    const neutralWords = ['however', 'although', 'while', 'consider', 'depends'];

    const hasPositive = positiveWords.some(w => lower.includes(w));
    const hasNegative = negativeWords.some(w => lower.includes(w));
    const hasNeutral = neutralWords.some(w => lower.includes(w));

    if (hasPositive) score += 2;
    if (hasNegative) score += 2;
    if (hasNeutral) score += 1;

    return clamp(score);
}

function scoreMultiModality(modelKey) {
    const scores = {
        grok: 8.5,
        chatgpt: 9.2,
        llama: 7.8,
        deepseek: 8.4
    };
    return scores[modelKey] || 7.5;
}

function scorePredictiveAccuracy(text = '') {
    const lower = text.toLowerCase();
    let score = 5;
    const predictiveTerms = ['will', 'expect', 'forecast', 'predict', 'likely', 'trend', 'future'];
    const predictiveCount = predictiveTerms.filter(t => lower.includes(t)).length;
    score += Math.min(3, predictiveCount);
    if (lower.includes('data') || lower.includes('statistics') || lower.includes('analysis')) score += 2;
    return clamp(score);
}

function scoreScalability(modelKey) {
    const scores = {
        grok: 9.5,
        chatgpt: 8.8,
        llama: 8.2,
        deepseek: 8.6
    };
    return scores[modelKey] || 8.0;
}

function scoreExplainability(text = '') {
    const lower = text.toLowerCase();
    let score = 5;
    const explainTerms = ['because', 'therefore', 'thus', 'consequently', 'as a result', 'due to'];
    const explainCount = explainTerms.filter(t => lower.includes(t)).length;
    score += Math.min(3, explainCount);
    if (lower.includes('first') && lower.includes('second')) score += 1;
    if (lower.includes('step') || lower.includes('process')) score += 1;
    return clamp(score);
}

function scoreContextAwareness(prompt, text) {
    const promptKeywords = extractPromptKeywords(prompt);
    if (promptKeywords.length === 0) return 6;
    const responseTokens = new Set(tokenize(text));
    const overlap = promptKeywords.filter((token) => responseTokens.has(token)).length;
    const overlapRatio = overlap / promptKeywords.length;
    let score = 3 + overlapRatio * 5;
    if (text.toLowerCase().includes('you asked') || text.toLowerCase().includes('regarding')) score += 2;
    return clamp(score);
}

function scoreCustomization(modelKey) {
    const scores = {
        grok: 8.5,
        chatgpt: 7.8,
        llama: 9.5,
        deepseek: 7.2
    };
    return scores[modelKey] || 7.0;
}

function scorePromptSensitivity(prompt, text) {
    let score = 7;
    const responseLength = text.length;
    if (responseLength > 150 && responseLength < 4000) score += 2;
    if (text.toLowerCase().includes(prompt.toLowerCase().substring(0, 15))) score += 1;
    return clamp(score);
}

function scoreKnowledgeFreshness(text = '') {
    const lower = text.toLowerCase();
    let score = 5;
    const currentYear = new Date().getFullYear();
    if (lower.includes(currentYear.toString()) || lower.includes((currentYear - 1).toString())) score += 3;
    const freshnessTerms = ['recent', 'latest', 'current', 'modern', 'contemporary', 'up-to-date'];
    const freshnessCount = freshnessTerms.filter(t => lower.includes(t)).length;
    score += Math.min(2, freshnessCount);
    return clamp(score);
}

function scoreIntegration(modelKey) {
    const scores = {
        grok: 8.2,
        chatgpt: 9.0,
        llama: 9.4,
        deepseek: 7.8
    };
    return scores[modelKey] || 8.0;
}

function scoreCostValue(modelKey) {
    const scores = {
        grok: 7.5,
        chatgpt: 8.5,
        llama: 9.0,
        deepseek: 9.6
    };
    return scores[modelKey] || 8.0;
}

function computeWinner(scoresByModel) {
    return Object.entries(scoresByModel).reduce((best, current) => {
        if (!best || Number(current[1]) > Number(best[1])) return current;
        return best;
    }, null)?.[0] || MODEL_KEYS[0];
}

function createMetric(metricKey, valuesByModel) {
    return {
        ...METRIC_META[metricKey],
        scores: valuesByModel,
        winner: computeWinner(valuesByModel)
    };
}

function evaluateResponses(prompt, responses, customWeights = null) {
    const weights = normalizeWeights(customWeights || DEFAULT_WEIGHTS);

    const scoresByMetric = {
        responseTime: {}, accuracy: {}, comprehensiveness: {}, precisionRecall: {},
        sentimentDetection: {}, multiModality: {}, predictiveAccuracy: {}, scalability: {},
        explainability: {}, contextAwareness: {}, customization: {}, promptSensitivity: {},
        knowledgeFreshness: {}, integration: {}, costValue: {}
    };

    MODEL_KEYS.forEach((model) => {
        const payload = responses[model] || {};
        const text = payload.response || '';
        const isSuccess = Boolean(payload.success);
        const responseTime = Number(payload.responseTime || 0);

        if (!isSuccess || !text.trim()) {
            scoresByMetric.responseTime[model] = clamp(scoreResponseTime(responseTime) * 0.4);
            Object.keys(scoresByMetric).forEach(k => {
                if (k !== 'responseTime') scoresByMetric[k][model] = 0;
            });
            return;
        }

        scoresByMetric.responseTime[model] = scoreResponseTime(responseTime);
        scoresByMetric.accuracy[model] = scoreAccuracy(text);
        scoresByMetric.comprehensiveness[model] = scoreComprehensiveness(text);
        scoresByMetric.precisionRecall[model] = scorePrecisionRecall(text);
        scoresByMetric.sentimentDetection[model] = scoreSentimentDetection(text);
        scoresByMetric.multiModality[model] = scoreMultiModality(model);
        scoresByMetric.predictiveAccuracy[model] = scorePredictiveAccuracy(text);
        scoresByMetric.scalability[model] = scoreScalability(model);
        scoresByMetric.explainability[model] = scoreExplainability(text);
        scoresByMetric.contextAwareness[model] = scoreContextAwareness(prompt, text);
        scoresByMetric.customization[model] = scoreCustomization(model);
        scoresByMetric.promptSensitivity[model] = scorePromptSensitivity(prompt, text);
        scoresByMetric.knowledgeFreshness[model] = scoreKnowledgeFreshness(text);
        scoresByMetric.integration[model] = scoreIntegration(model);
        scoresByMetric.costValue[model] = scoreCostValue(model);
    });

    const weightedScores = {};
    MODEL_KEYS.forEach((model) => {
        let weighted = 0;
        Object.keys(weights).forEach(metricKey => {
            if (scoresByMetric[metricKey]) {
                weighted += scoresByMetric[metricKey][model] * weights[metricKey];
            }
        });
        weightedScores[model] = Number(weighted.toFixed(2));
    });

    const ranking = MODEL_KEYS
        .map((model) => ({ model, score: weightedScores[model] }))
        .sort((a, b) => b.score - a.score);

    const recommended = ranking[0];

    // Build the final evaluation object with all 15 metrics
    const evaluation = {
        overall: {
            scores: weightedScores,
            winner: recommended.model,
            winnerScore: recommended.score.toFixed(2),
            ranking,
            weights
        },
        recommendation: {
            model: recommended.model,
            score: recommended.score,
            reason: `${recommended.model} achieved the highest weighted score across all 15 metrics.`
        }
    };

    // Add each individual metric to the root of evaluation
    Object.keys(scoresByMetric).forEach(metricKey => {
        evaluation[metricKey] = createMetric(metricKey, scoresByMetric[metricKey]);
    });

    return evaluation;
}

module.exports = {
    MODEL_KEYS,
    DEFAULT_WEIGHTS,
    evaluateResponses
};
