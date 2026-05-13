/**
 * AI Prompt Advisor
 * Analyzes user prompts for clarity, bias, completeness, and safety
 */

class PromptAdvisor {
    constructor() {
        this.qualityThresholds = {
            clarity: 0.7,
            specificity: 0.7,
            safety: 0.9,
            overall: 0.75
        };
    }

    /**
     * Analyze a prompt comprehensively
     */
    analyzePrompt(prompt) {
        if (!prompt || prompt.trim().length === 0) {
            return {
                score: 0,
                issues: ['Prompt is empty'],
                analysis: {
                    clarity: 0,
                    specificity: 0,
                    bias: 100,
                    completeness: 0,
                    safety: 100
                }
            };
        }

        const analysis = {
            clarity: this.analyzeClaritiy(prompt),
            specificity: this.analyzeSpecificity(prompt),
            bias: this.analyzeBias(prompt),
            completeness: this.analyzeCompleteness(prompt),
            safety: this.analyzeSafety(prompt)
        };

        const issues = this.identifyIssues(analysis, prompt);
        const score = this.calculateScore(analysis);
        const improved = this.improvePrompt(prompt, issues);
        const alternatives = this.generateAlternatives(prompt, analysis);

        return {
            score,
            analysis,
            issues,
            improved,
            alternatives,
            recommendation: this.getRecommendation(score)
        };
    }

    /**
     * Analyze clarity: Is the prompt easy to understand?
     */
    analyzeClaritiy(prompt) {
        let score = 50;

        // Check for clear language
        const clearWords = prompt.match(/\b(explain|describe|how|why|what|create|write|list)\b/gi);
        if (clearWords) score += 20;

        // Check sentence structure
        const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length > 0 && sentences[0].length < 150) score += 15;

        // Check for ambiguous words
        const ambiguousWords = prompt.match(/\b(something|anything|stuff|things|etc)\b/gi);
        if (!ambiguousWords) score += 15;

        return Math.min(100, score);
    }

    /**
     * Analyze specificity: Is the prompt detailed?
     */
    analyzeSpecificity(prompt) {
        let score = 30;

        // Word count (longer = more detailed)
        const wordCount = prompt.split(/\s+/).length;
        if (wordCount > 10) score += 15;
        if (wordCount > 20) score += 15;
        if (wordCount > 30) score += 20;

        // Check for specific examples
        if (prompt.includes('example') || prompt.includes('such as')) score += 10;

        // Check for constraints/parameters
        if (prompt.includes('for') || prompt.includes('should') || prompt.includes('must')) score += 10;

        // Check for context
        if (prompt.includes('because') || prompt.includes('in order')) score += 10;

        return Math.min(100, score);
    }

    /**
     * Analyze bias: Is the prompt neutral?
     */
    analyzeBias(prompt) {
        let score = 100;

        // Negative/loaded words
        const biasedWords = [
            'should', 'obviously', 'clearly', 'definitely', 'always', 'never',
            'best', 'worst', 'only', 'absolutely', 'certainly', 'undoubtedly'
        ];

        biasedWords.forEach(word => {
            if (prompt.toLowerCase().includes(word)) score -= 5;
        });

        // Leading questions
        if (prompt.match(/don't you think|isn't it|aren't they/gi)) score -= 15;

        // Strong opinions
        if (prompt.match(/[!]{2,}/)) score -= 10;

        // Extreme language
        if (prompt.match(/\b(stupid|idiotic|insane|crazy|obviously wrong)\b/gi)) score -= 20;

        return Math.max(0, score);
    }

    /**
     * Analyze completeness: Does it have all needed info?
     */
    analyzeCompleteness(prompt) {
        let score = 30;

        // Has context
        if (prompt.match(/for|because|purpose|goal|objective/gi)) score += 20;

        // Has format/style preferences
        if (prompt.match(/format|style|structure|organize|layout/gi)) score += 15;

        // Has audience/scope
        if (prompt.match(/audience|user|reader|beginner|expert|general|specific/gi)) score += 15;

        // Has constraints
        if (prompt.match(/length|time|word|character|limit|constraint/gi)) score += 10;

        // Has examples
        if (prompt.includes('example') || prompt.includes('such as')) score += 10;

        return Math.min(100, score);
    }

    /**
     * Analyze safety: Is the prompt safe and ethical?
     */
    analyzeSafety(prompt) {
        let score = 100;

        const unsafeWords = [
            'hack', 'illegal', 'harm', 'hurt', 'kill', 'weapon', 'exploit',
            'cheat', 'fraud', 'scam', 'phishing', 'malware', 'bypass'
        ];

        unsafeWords.forEach(word => {
            if (prompt.toLowerCase().includes(word)) score -= 15;
        });

        // Check for discriminatory content
        if (prompt.match(/racist|sexist|hateful|discriminat/gi)) score -= 25;

        // Check for privacy violations
        if (prompt.match(/password|secret|private|confidential/gi)) score -= 10;

        return Math.max(0, score);
    }

    /**
     * Identify specific issues
     */
    identifyIssues(analysis, prompt) {
        const issues = [];

        if (analysis.clarity < 70) {
            issues.push('❌ Unclear: The prompt is vague or hard to understand');
        }

        if (analysis.specificity < 60) {
            issues.push('⚠️ Vague: Add more detail and specific information');
        }

        if (analysis.bias < 70) {
            issues.push('⚠️ Biased: Remove loaded language and leading questions');
        }

        if (analysis.completeness < 50) {
            issues.push('❌ Incomplete: Missing context, format, or constraints');
        }

        if (analysis.safety < 90) {
            issues.push('🚨 Safety: Contains potentially harmful requests');
        }

        if (issues.length === 0) {
            issues.push('✅ No major issues detected');
        }

        return issues;
    }

    /**
     * Calculate overall quality score
     */
    calculateScore(analysis) {
        const weights = {
            clarity: 0.25,
            specificity: 0.20,
            bias: 0.20,
            completeness: 0.20,
            safety: 0.15
        };

        return Math.round(
            (analysis.clarity * weights.clarity +
             analysis.specificity * weights.specificity +
             analysis.bias * weights.bias +
             analysis.completeness * weights.completeness +
             analysis.safety * weights.safety)
        );
    }

    /**
     * Get quality recommendation
     */
    getRecommendation(score) {
        if (score >= 80) return { level: 'Excellent', color: '#00ff00', text: 'Ready to use!' };
        if (score >= 70) return { level: 'Good', color: '#00d9ff', text: 'Minor improvements suggested' };
        if (score >= 60) return { level: 'Fair', color: '#ffde00', text: 'Consider improvements' };
        return { level: 'Poor', color: '#ff006e', text: 'Major improvements needed' };
    }

    /**
     * Suggest improved version
     */
    improvePrompt(prompt, issues) {
        let improved = prompt;

        // Remove excessive punctuation
        improved = improved.replace(/[!]{2,}/g, '!');
        improved = improved.replace(/[?]{2,}/g, '?');

        // Add clarity if vague
        if (prompt.includes('something') || prompt.includes('things')) {
            improved = improved.replace(/something/gi, '[specific item]');
            improved = improved.replace(/things/gi, '[specific items]');
        }

        // Remove biased words and replace
        const replacements = {
            'obviously': 'notably',
            'clearly': 'it appears that',
            'definitely': 'likely',
            'should': 'could',
            'always': 'often',
            'never': 'rarely'
        };

        Object.entries(replacements).forEach(([old, newWord]) => {
            improved = improved.replace(new RegExp(old, 'gi'), newWord);
        });

        // Add specificity if missing
        if (improved.split(/\s+/).length < 15) {
            improved += '\n[Add more details about context, format, and constraints]';
        }

        return improved;
    }

    /**
     * Generate alternative prompts with different intent levels
     */
    generateAlternatives(prompt, analysis) {
        const alternatives = [];

        // Alternative 1: Beginner-friendly
        alternatives.push({
            level: 'Beginner-Friendly',
            prompt: this.makeBeginnerFriendly(prompt),
            description: 'Simplified version for those new to the topic'
        });

        // Alternative 2: Expert-level
        alternatives.push({
            level: 'Expert-Level',
            prompt: this.makeExpertLevel(prompt),
            description: 'More detailed, assumes domain knowledge'
        });

        // Alternative 3: Specific & Detailed
        alternatives.push({
            level: 'Specific & Detailed',
            prompt: this.makeSpecific(prompt),
            description: 'Highly specific with clear constraints and examples'
        });

        return alternatives;
    }

    /**
     * Make prompt beginner-friendly
     */
    makeBeginnerFriendly(prompt) {
        let simplified = prompt;

        // Add explanatory context
        simplified = `Explain in simple terms how to ${simplified.toLowerCase()}`;

        // Remove complex terms
        simplified = simplified.replace(/optimize|maximize|algorithm|framework/gi, 'improve');

        return simplified;
    }

    /**
     * Make prompt expert-level
     */
    makeExpertLevel(prompt) {
        let expert = `${prompt}\n\nInclude:\n- Technical considerations\n- Edge cases\n- Performance implications\n- Best practices`;
        return expert;
    }

    /**
     * Make prompt specific
     */
    makeSpecific(prompt) {
        let specific = `${prompt}\n\nPlease provide:\n- Specific examples\n- Step-by-step instructions\n- Expected output format\n- Any assumptions or constraints`;
        return specific;
    }
}

// Create global instance
const promptAdvisor = new PromptAdvisor();

/**
 * Analyze prompt and update UI
 */
function analyzeUserPrompt() {
    const promptInput = document.getElementById('promptAdvisorInput');
    const resultsContainer = document.getElementById('promptAdvisorResults');

    if (!promptInput || !promptInput.value.trim()) {
        resultsContainer.innerHTML = '<p style="color: var(--text-secondary);">Enter a prompt to analyze...</p>';
        return;
    }

    const analysis = promptAdvisor.analyzePrompt(promptInput.value);

    // Build results HTML
    let resultsHTML = `
        <div style="margin-bottom: var(--spacing-lg);">
            <h3 style="color: var(--primary-color); text-shadow: 0 0 10px rgba(255, 0, 110, 0.3); margin-bottom: var(--spacing-md);">
                📊 Prompt Analysis
            </h3>
            
            <!-- Score -->
            <div style="background: var(--dark-bg-secondary); border: 2px solid var(--border-color); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                    <span style="color: var(--text-secondary);">Overall Quality Score:</span>
                    <span style="font-size: 1.5rem; font-weight: bold; color: ${analysis.recommendation.color}; text-shadow: 0 0 10px ${analysis.recommendation.color};">
                        ${analysis.score}/100
                    </span>
                </div>
                <div style="background: rgba(0, 0, 0, 0.3); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: ${analysis.recommendation.color}; height: 100%; width: ${analysis.score}%; transition: width 0.3s ease;"></div>
                </div>
                <p style="color: ${analysis.recommendation.color}; margin-top: var(--spacing-sm); text-shadow: 0 0 8px ${analysis.recommendation.color};">
                    <strong>${analysis.recommendation.level}:</strong> ${analysis.recommendation.text}
                </p>
            </div>

            <!-- Detailed Scores -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                ${Object.entries(analysis.analysis).map(([key, value]) => `
                    <div style="background: var(--dark-bg-secondary); border: 2px solid var(--border-color); padding: var(--spacing-md); border-radius: var(--radius-md); text-align: center;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem; text-transform: capitalize; margin-bottom: var(--spacing-xs);">${key}</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--secondary-color); text-shadow: 0 0 10px rgba(0, 217, 255, 0.3);">${value}</div>
                    </div>
                `).join('')}
            </div>

            <!-- Issues -->
            <div style="background: var(--dark-bg-secondary); border: 2px solid var(--border-color); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md);">
                <h4 style="color: var(--primary-color); margin-bottom: var(--spacing-sm);">Issues Detected:</h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${analysis.issues.map(issue => `
                        <li style="color: var(--text-primary); padding: var(--spacing-xs) 0; border-bottom: 1px solid var(--border-color);">
                            ${issue}
                        </li>
                    `).join('')}
                </ul>
            </div>

            <!-- Improved Version -->
            <div style="background: var(--dark-bg-secondary); border: 2px solid var(--secondary-color); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md); box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);">
                <h4 style="color: var(--secondary-color); margin-bottom: var(--spacing-sm); text-shadow: 0 0 8px rgba(0, 217, 255, 0.3);">✨ Improved Version:</h4>
                <p style="color: var(--text-primary); line-height: 1.7; white-space: pre-wrap;">${analysis.improved}</p>
            </div>

            <!-- Alternatives -->
            <div>
                <h4 style="color: var(--primary-color); margin-bottom: var(--spacing-md);">🎯 Alternative Prompts:</h4>
                ${analysis.alternatives.map((alt, idx) => `
                    <div style="background: var(--dark-bg-secondary); border: 2px solid var(--border-color); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md);">
                        <div style="color: var(--accent-color); font-weight: bold; margin-bottom: var(--spacing-sm); text-shadow: 0 0 8px rgba(255, 222, 0, 0.3);">
                            ${idx + 1}. ${alt.level}
                        </div>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: var(--spacing-sm);">${alt.description}</p>
                        <p style="color: var(--text-primary); line-height: 1.7; white-space: pre-wrap;">${alt.prompt}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    resultsContainer.innerHTML = resultsHTML;
}

/**
 * Auto-analyze as user types
 */
function setupPromptAdvisor() {
    const promptInput = document.getElementById('promptAdvisorInput');
    if (promptInput) {
        promptInput.addEventListener('input', analyzeUserPrompt);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPromptAdvisor);
} else {
    setupPromptAdvisor();
}
