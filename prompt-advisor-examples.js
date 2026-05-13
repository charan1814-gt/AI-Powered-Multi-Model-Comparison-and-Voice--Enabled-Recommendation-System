/**
 * Prompt Advisor - Real-World Examples & Framework
 * Comprehensive guide for prompt analysis
 */

const PROMPT_EXAMPLES = {
    general_knowledge: {
        category: "General Knowledge",
        bad: "Tell me about Trump",
        issues: ["Too vague", "No time period", "No context"],
        improved: "Who is Donald Trump? Summarize his background, career, and political role in a neutral manner.",
        alternatives: [
            "Explain Donald Trump's career before and after becoming U.S. President.",
            "Provide a factual overview of Donald Trump without political opinions."
        ]
    },
    educational: {
        category: "Educational / Exam-Oriented",
        bad: "Explain AI",
        issues: ["No level mentioned", "Too broad", "Missing audience context"],
        improved: "Explain Artificial Intelligence in simple terms suitable for an undergraduate student.",
        alternatives: [
            "Explain AI with real-world examples.",
            "Compare narrow AI and general AI with examples."
        ]
    },
    technical: {
        category: "Technical / Programming",
        bad: "Code not working fix it",
        issues: ["No code shared", "No error details", "Unclear language"],
        improved: "I am getting a null pointer exception in Java. Here is my code and error message. Explain the issue and how to fix it.",
        alternatives: [
            "Optimize this code for better performance and readability.",
            "Explain why this code fails and suggest best practices."
        ]
    },
    opinion_sensitive: {
        category: "Opinion-Sensitive Topics (Politics, Society)",
        bad: "Is Trump good or bad?",
        issues: ["Biased question", "Leads to opinionated output", "Not neutral"],
        improved: "List major achievements and criticisms of Donald Trump during his presidency in a neutral manner.",
        alternatives: [
            "What policies did Donald Trump introduce, and how were they received?",
            "Summarize different perspectives on Donald Trump's leadership."
        ]
    },
    health_medical: {
        category: "Health & Medical (High Risk)",
        bad: "I have chest pain what medicine to take",
        issues: ["Dangerous", "Needs professional help", "Could cause harm"],
        improved: "What are common causes of chest pain, and when should someone seek medical attention?",
        alternatives: [
            "Explain chest pain symptoms that require emergency care.",
            "What immediate steps should someone take if experiencing sudden chest pain?"
        ]
    },
    ai_comparison: {
        category: "AI Comparison (Your Project Core Feature 🔥)",
        bad: "Which AI is best?",
        issues: ["Undefined metrics", "Subjective", "No context"],
        improved: "Compare ChatGPT, Gemini, and Replicate AI based on accuracy, clarity, and usefulness for students.",
        alternatives: [
            "Which AI performs better for research-based questions and why?",
            "Evaluate AI tools using measurable response-quality criteria."
        ]
    }
};

/**
 * Display examples in the guide
 */
function displayPromptExamples() {
    const container = document.getElementById('promptExamplesContainer');
    if (!container) return;

    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--spacing-lg);">';

    Object.entries(PROMPT_EXAMPLES).forEach(([key, example]) => {
        html += `
            <div style="background: var(--card-bg); border: 2px solid var(--border-color); border-radius: var(--radius-lg); padding: var(--spacing-lg); box-shadow: 0 0 20px rgba(255, 0, 110, 0.15);">
                <h4 style="color: var(--primary-color); margin-bottom: var(--spacing-md); text-shadow: 0 0 10px rgba(255, 0, 110, 0.3);">
                    ${example.category}
                </h4>

                <!-- Bad Prompt -->
                <div style="margin-bottom: var(--spacing-md);">
                    <div style="color: #ff006e; font-weight: bold; margin-bottom: var(--spacing-xs);">❌ Bad Prompt</div>
                    <div style="background: var(--dark-bg); padding: var(--spacing-sm); border-left: 3px solid #ff006e; color: var(--text-primary); border-radius: var(--radius-sm);">
                        "${example.bad}"
                    </div>
                </div>

                <!-- Problems -->
                <div style="margin-bottom: var(--spacing-md);">
                    <div style="color: #ffde00; font-weight: bold; margin-bottom: var(--spacing-xs);">⚠️ Problems</div>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${example.issues.map(issue => `
                            <li style="color: var(--text-secondary); padding: 4px 0; font-size: 0.9rem;">• ${issue}</li>
                        `).join('')}
                    </ul>
                </div>

                <!-- Improved -->
                <div style="margin-bottom: var(--spacing-md);">
                    <div style="color: #00d9ff; font-weight: bold; margin-bottom: var(--spacing-xs);">✅ Recommended Prompt</div>
                    <div style="background: var(--dark-bg); padding: var(--spacing-sm); border-left: 3px solid #00d9ff; color: var(--text-primary); border-radius: var(--radius-sm); line-height: 1.6;">
                        ${example.improved}
                    </div>
                </div>

                <!-- Alternatives -->
                <div>
                    <div style="color: var(--accent-color); font-weight: bold; margin-bottom: var(--spacing-xs);">⭐ Alternative Prompts</div>
                    ${example.alternatives.map((alt, idx) => `
                        <div style="background: var(--dark-bg); padding: var(--spacing-sm); margin-bottom: var(--spacing-xs); border-left: 3px solid var(--accent-color); color: var(--text-primary); border-radius: var(--radius-sm); font-size: 0.9rem; line-height: 1.5;">
                            ${idx + 1}. ${alt}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Initialize examples when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayPromptExamples);
} else {
    displayPromptExamples();
}

export { PROMPT_EXAMPLES };
