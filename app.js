// ====================================
// Global Variables & Configuration
// ====================================
const API_BASE_URL = `${window.location.origin}/api`;
let currentResponses = null;
let currentMetrics = null;
const MODEL_DISPLAY_NAMES = {
    grok: 'Grok-2',
    chatgpt: 'GPT-4o',
    llama: 'Llama 3.1',
    deepseek: 'DeepSeek'
};
const MODEL_EMOJIS = {
    grok: '⚙️',
    chatgpt: '🧠',
    llama: '🏗️',
    deepseek: '🔍'
};
const DEFAULT_UI_WEIGHTS = {
    accuracy: 0.35,
    comprehensiveness: 0.25,
    precisionRecall: 0.2,
    contextAwareness: 0.2
};
const voiceEvents = new EventTarget();

// ====================================
// DOM Elements
// ====================================
const promptInput = document.getElementById('promptInput');
const analyzePromptBtn = document.getElementById('analyzePromptBtn');
const compareBtn = document.getElementById('compareBtn');
const grokModelSelect = document.getElementById('grokModelSelect');
const loadingIndicator = document.getElementById('loadingIndicator');
const promptAnalysis = document.getElementById('promptAnalysis');
const promptAnalysisContent = document.getElementById('promptAnalysisContent');
const responsesSection = document.getElementById('responsesSection');
const metricsSection = document.getElementById('metricsSection');
const dashboardSection = document.getElementById('dashboardSection');
const rankingBars = document.getElementById('rankingBars');
const metricsCanvas = document.getElementById('metricsCanvas');
const weightAccuracy = document.getElementById('weightAccuracy');
const weightComprehensiveness = document.getElementById('weightComprehensiveness');
const weightPrecisionRecall = document.getElementById('weightPrecisionRecall');
const weightContextAwareness = document.getElementById('weightContext');
const weightAccuracyValue = document.getElementById('weightAccuracyValue');
const weightComprehensivenessValue = document.getElementById('weightComprehensivenessValue');
const weightPrecisionRecallValue = document.getElementById('weightPrecisionRecallValue');
const weightContextAwarenessValue = document.getElementById('weightContextValue');
const resetWeightsBtn = document.getElementById('resetWeightsBtn');
const weightStatus = document.getElementById('weightStatus');
const recommendationsSection = document.getElementById('recommendationsSection');
const responseOverlay = document.getElementById('responseOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMeta = document.getElementById('overlayMeta');
const overlayContent = document.getElementById('overlayContent');
const overlayCloseBtn = document.getElementById('overlayCloseBtn');
const soundToggleBtn = document.getElementById('soundToggle');
const uiTapSound = document.getElementById('uiTapSound');
const voiceStartBtn = document.getElementById('voiceStartBtn');
const voiceStopBtn = document.getElementById('voiceStopBtn');
const voiceSpeakBtn = document.getElementById('voiceSpeakBtn');
const voiceAutoSend = document.getElementById('voiceAutoSend');
const voiceSpeakToggle = document.getElementById('voiceSpeakToggle');
const voiceModelSelect = document.getElementById('voiceModelSelect');
const voiceStatus = document.getElementById('voiceStatus');
const voiceStopSpeakBtn = document.getElementById('voiceStopSpeakBtn');
const voiceChatPanel = document.getElementById('voiceChat');
const voiceIndicator = document.getElementById('voiceIndicator');
let tapAudioContext = null;
let soundEnabled = true;
let speechRecognition = null;
let isRecognizing = false;
let recognitionSupported = false;
let speechSynthesisActive = false;
let lastRecognitionError = null;
let audioUnlocked = false;
let voiceMediaStream = null;
let voiceSilenceTimer = null;
let voiceFinalText = '';
let voiceInterimText = '';
let voiceBaselineText = '';
let voiceSessionNeedsReset = false;
let voiceModeEnabled = false;
let weightUpdateTimer = null;
let weightControlsReady = false;
const VOICE_CONFIDENCE_THRESHOLD = 0.75; // Raised to reject ambient noise / low-confidence transcripts
const VOICE_SILENCE_TIMEOUT_MS = 3500; // Increased timeout for better capture

// ====================================
// Event Listeners
// ====================================
analyzePromptBtn.addEventListener('click', analyzePrompt);
compareBtn.addEventListener('click', compareAIResponses);

// Sound toggle (accessibility)
const storedSoundSetting = localStorage.getItem('uiSoundEnabled');
if (storedSoundSetting !== null) {
    soundEnabled = storedSoundSetting === 'true';
}
updateSoundToggleUI();

const storedVoiceMode = localStorage.getItem('voiceModeEnabled');
if (storedVoiceMode !== null) {
    voiceModeEnabled = storedVoiceMode === 'true';
}

// Unlock audio on first user interaction
document.addEventListener('pointerdown', unlockAudio, { once: true });
document.addEventListener('keydown', unlockAudio, { once: true });

// Chrome workaround for speech synthesis voices
if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

// Global UI sound handler for all interactive controls
const SOUND_TARGET_SELECTOR = 'button, a, [role="button"], .response-card';
document.addEventListener('click', (event) => {
    const target = event.target.closest(SOUND_TARGET_SELECTOR);
    if (!target) return;
    if (target === soundToggleBtn) return;
    playTapSound();
});

soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('uiSoundEnabled', String(soundEnabled));
    updateSoundToggleUI();
});

// Expand response on card click
document.querySelectorAll('.response-card').forEach(card => {
    card.addEventListener('click', () => {
        const aiName = card.getAttribute('data-ai');
        pulseElement(card);
        card.classList.remove('pop-highlight');
        void card.offsetWidth;
        card.classList.add('pop-highlight');
        openResponseOverlay(aiName);

        // Speak only the clicked model's response if audio is enabled
        if (soundEnabled) {
            speakResponseForModel(aiName);
        }
    });

    card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 6;
        const rotateX = ((centerY - y) / centerY) * 6;
        card.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
        card.classList.add('floating');
    });

    card.addEventListener('mouseleave', () => {
        card.classList.remove('floating');
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
    });
});

overlayCloseBtn.addEventListener('click', closeResponseOverlay);
responseOverlay.addEventListener('click', (event) => {
    if (event.target.dataset.overlayClose === 'true') {
        closeResponseOverlay();
    }
});

analyzePromptBtn.addEventListener('click', () => { pulseElement(analyzePromptBtn); });
compareBtn.addEventListener('click', () => { pulseElement(compareBtn); });

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !responseOverlay.classList.contains('hidden')) {
        closeResponseOverlay();
    }
});

// Allow Enter key to trigger comparison (with Shift+Enter for new lines)
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        compareAIResponses();
    }
});

// Click-to-toggle voice recording (easier than push-to-talk in noisy environments)
if (voiceStartBtn) {
    voiceStartBtn.addEventListener('click', (e) => {
        console.log('Mic button clicked. isRecognizing:', isRecognizing);
        if (!isRecognizing) {
            startVoiceCapture();
        } else {
            stopVoiceCapture();
        }
    });
}

if (voiceSpeakBtn) {
    voiceSpeakBtn.addEventListener('click', () => {
        if (speechSynthesisActive) {
            stopSpeaking();
        } else {
            speakLastResponse();
        }
    });
}

if (voiceSpeakToggle) {
    voiceSpeakToggle.addEventListener('change', () => {
        if (!voiceSpeakToggle.checked) {
            stopSpeaking();
        }
    });
}

if (voiceStopSpeakBtn) {
    voiceStopSpeakBtn.addEventListener('click', () => {
        stopSpeaking();
    });
}

initVoiceChat();
initWeightControls();

// ====================================
// Voice Chat
// ====================================
function initVoiceChat() {
    console.log('Initializing voice chat...');
    console.log('Browser:', navigator.userAgent.substring(0, 100));

    if (!voiceStartBtn || !voiceStatus) {
        console.warn('Voice UI elements not found');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.error('SpeechRecognition API not available in this browser');
        recognitionSupported = false;
        setVoiceStatus('Speech recognition not supported in this browser.', true);
        updateVoiceButtons();
        return;
    }

    console.log(' SpeechRecognition API available');
    recognitionSupported = true;
    speechRecognition = new SpeechRecognition();
    speechRecognition.lang = 'en-US';
    speechRecognition.interimResults = true;
    speechRecognition.continuous = true; // Continuous until user stops
    speechRecognition.maxAlternatives = 1;

    speechRecognition.onstart = () => {
        console.log(' Speech recognition STARTED successfully');
        isRecognizing = true;
        lastRecognitionError = null;
        setVoiceListeningState(true);
        setVoiceStatus(' Recording... Speak now!');
        emitVoiceEvent('voice:start');
    };

    speechRecognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            const confidence = typeof result[0].confidence === 'number' ? result[0].confidence : 1;

            if (result.isFinal) {
                // Only accept final results above confidence threshold to reject ambient noise
                if (confidence >= VOICE_CONFIDENCE_THRESHOLD) {
                    finalTranscript += `${transcript} `;
                    console.log('Voice (final accepted):', transcript, 'confidence:', confidence);
                } else {
                    console.log('Voice (final rejected - low confidence):', transcript, 'confidence:', confidence);
                }
            } else {
                // Only show interim results above a lower threshold for real-time feedback
                if (confidence >= VOICE_CONFIDENCE_THRESHOLD * 0.8) {
                    interimTranscript += transcript;
                    console.log('Voice (interim accepted):', transcript, 'confidence:', confidence);
                } else {
                    console.log('Voice (interim rejected - low confidence):', transcript, 'confidence:', confidence);
                }
            }
        }

        if (voiceSessionNeedsReset) {
            voiceSessionNeedsReset = false;
            voiceBaselineText = '';
            voiceFinalText = '';
            voiceInterimText = '';
            promptInput.value = '';
        }

        if (finalTranscript) {
            voiceFinalText += finalTranscript;
        }
        voiceInterimText = interimTranscript;

        const combinedText = `${voiceBaselineText} ${voiceFinalText}${voiceInterimText}`.trim();
        if (combinedText) {
            promptInput.value = combinedText;
        }

        // Show captured text in status for feedback
        const statusText = interimTranscript
            ? ` "${interimTranscript.substring(0, 30)}${interimTranscript.length > 30 ? '...' : ''}"`
            : 'Listening...';
        setVoiceStatus(statusText);
        startVoiceSilenceTimer();
        emitVoiceEvent('voice:result', { text: combinedText, interim: voiceInterimText });
    };

    speechRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error, event);
        lastRecognitionError = event.error;

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setVoiceStatus(' Microphone permission denied.', true);
            stopVoiceCapture();
            emitVoiceEvent('voice:error', { error: event.error });
            return;
        }
        if (event.error === 'no-speech') {
            setVoiceStatus('No speech detected. Still listening...', true);
            emitVoiceEvent('voice:warning', { error: event.error });
            return;
        }
        if (event.error === 'network') {
            setVoiceStatus(' Network error in speech service.', true);
            emitVoiceEvent('voice:error', { error: event.error });
            return;
        }
        if (event.error === 'aborted') {
            console.log('Speech recognition aborted (normal if you stopped it)');
            return;
        }
        setVoiceStatus(` Voice error: ${event.error}`, true);
        emitVoiceEvent('voice:error', { error: event.error });
    };

    speechRecognition.onend = () => {
        console.log('Speech recognition ended. Captured text:', promptInput.value);
        isRecognizing = false;
        setVoiceListeningState(false);
        emitVoiceEvent('voice:stop');

        // Auto-restart if voice mode is still enabled
        if (voiceModeEnabled) {
            console.log('Voice mode enabled, restarting...');
            scheduleVoiceRestart();
        } else {
            console.log('Voice mode disabled, staying idle');
            setVoiceStatus('Click mic to record');
        }
    };

    updateVoiceButtons();
    if (voiceModeEnabled) {
        startVoiceCapture();
    } else {
        setVoiceStatus('Voice chat idle');
    }
}

async function startVoiceCapture() {
    if (!recognitionSupported || !speechRecognition) {
        setVoiceStatus('Speech recognition not available.', true);
        return;
    }

    if (isRecognizing) return;

    // Don't start mic while TTS is playing (prevents capturing own speaker output)
    if (speechSynthesisActive) {
        console.log('TTS is active  deferring mic start until speech ends.');
        return;
    }

    voiceModeEnabled = true;
    localStorage.setItem('voiceModeEnabled', 'true');
    voiceBaselineText = promptInput.value.trim();
    voiceFinalText = '';
    voiceInterimText = '';
    voiceSessionNeedsReset = false;

    console.log('Starting voice capture...');
    setVoiceStatus('Starting microphone...');

    // Obtain a constrained audio stream first so the browser applies
    // hardware-level echo cancellation, noise suppression and auto-gain
    // before passing audio to the Speech Recognition engine.
    try {
        await ensureVoiceMediaStream();
        console.log(' Noise-suppressed media stream ready');
    } catch (streamErr) {
        console.warn('Could not obtain constrained media stream:', streamErr.message, ' falling back to default mic');
    }

    // Start speech recognition
    try {
        speechRecognition.start();
        console.log('Speech recognition start() called');
    } catch (error) {
        console.error('Speech recognition start error:', error);
        setVoiceStatus('Unable to start microphone: ' + error.message, true);
        emitVoiceEvent('voice:error', { error: 'start-failed' });
    }
}

function stopVoiceCapture() {
    voiceModeEnabled = false;
    localStorage.setItem('voiceModeEnabled', 'false');
    clearVoiceSilenceTimer();

    if (!speechRecognition || !isRecognizing) {
        setVoiceStatus('Voice chat idle');
        updateVoiceButtons();
        stopVoiceMediaStream(); // Release mic hardware
        return;
    }

    console.log('Stopping voice capture...');
    speechRecognition.stop();
    stopVoiceMediaStream(); // Release mic hardware so camera/mic indicators turn off
    emitVoiceEvent('voice:stop');
}

function updateVoiceButtons() {
    if (!voiceStartBtn) return;

    // Update mic button state (glows when active/recording)
    if (isRecognizing) {
        voiceStartBtn.classList.add('active');
    } else {
        voiceStartBtn.classList.remove('active');
    }

    // Update speaker button
    if (voiceSpeakBtn) {
        if (speechSynthesisActive) {
            voiceSpeakBtn.classList.add('active');
        } else {
            voiceSpeakBtn.classList.remove('active');
        }
    }
}

function emitVoiceEvent(name, detail = {}) {
    voiceEvents.dispatchEvent(new CustomEvent(name, { detail }));
}

function setVoiceListeningState(isListening) {
    updateVoiceButtons();
    if (voiceChatPanel) {
        voiceChatPanel.classList.toggle('is-listening', isListening);
    }
    if (voiceIndicator) {
        voiceIndicator.classList.toggle('is-active', isListening);
    }
    setVoiceStatus(isListening ? 'Listening...' : 'Voice chat idle');
}

function startVoiceSilenceTimer() {
    clearVoiceSilenceTimer();
    voiceSilenceTimer = setTimeout(() => {
        finalizeVoiceInput();
    }, VOICE_SILENCE_TIMEOUT_MS);
}

function clearVoiceSilenceTimer() {
    if (voiceSilenceTimer) {
        clearTimeout(voiceSilenceTimer);
        voiceSilenceTimer = null;
    }
}

function finalizeVoiceInput() {
    clearVoiceSilenceTimer();
    if (!isRecognizing) return;
    const combinedText = `${voiceBaselineText} ${voiceFinalText}${voiceInterimText}`.trim();
    if (!combinedText) {
        setVoiceStatus('No speech detected. Listening...', true);
        emitVoiceEvent('voice:warning', { error: 'no-speech' });
        return;
    }
    promptInput.value = combinedText;
    voiceSessionNeedsReset = true;
    emitVoiceEvent('voice:submit', { text: combinedText });
    const shouldAutoSend = !voiceAutoSend || voiceAutoSend.checked;
    if (shouldAutoSend) {
        compareAIResponses();
    } else {
        setVoiceStatus('Captured. Press Compare to run evaluation.');
    }
}

function scheduleVoiceRestart() {
    setTimeout(() => {
        if (voiceModeEnabled && !isRecognizing) {
            startVoiceCapture();
        }
    }, 400);
}

async function ensureVoiceMediaStream() {
    if (voiceMediaStream) return voiceMediaStream;
    // Advanced audio constraints for noise suppression in noisy environments
    const constraints = {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 16000
        }
    };
    voiceMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    return voiceMediaStream;
}

function stopVoiceMediaStream() {
    if (!voiceMediaStream) return;
    voiceMediaStream.getTracks().forEach(track => track.stop());
    voiceMediaStream = null;
}

function setVoiceStatus(message, isError = false) {
    if (!voiceStatus) return;
    voiceStatus.textContent = message;
    voiceStatus.style.color = isError ? '#ef4444' : 'var(--text-secondary)';
    voiceStatus.title = message; // Show full message on hover for compact view
}

function speakSelectedResponse() {
    if (!voiceSpeakToggle || !voiceSpeakToggle.checked || !voiceModelSelect) return;
    const aiName = voiceModelSelect.value;
    const responseElement = document.getElementById(`${aiName}Response`);
    const fullText = responseElement?.dataset.fullText || '';
    if (!fullText) return;
    speakText(fullText);
}

function speakText(text) {
    // Force set soundEnabled to true if explicitly triggered by click
    // but we'll respect the global toggle if possible
    if (!soundEnabled) {
        console.warn('Speech requested but sound is disabled.');
        return;
    }

    if (!text || text.trim() === '') {
        console.warn('No text to speak.');
        return;
    }

    if (!('speechSynthesis' in window)) {
        setVoiceStatus('Speech synthesis not supported.', true);
        return;
    }

    // Clean text: remove markdown artifacts and special characters
    const cleanText = text.replace(/[*#`_]/g, '').replace(/\s+/g, ' ').trim();

    // Cancel any current speech to start fresh
    window.speechSynthesis.cancel();
    speechSynthesisActive = false;

    // Pause mic while TTS plays
    if (isRecognizing && recognitionSupported) {
        try {
            speechRecognition.stop();
        } catch (e) { }
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
        speechSynthesisActive = true;
        if (voiceStopSpeakBtn) voiceStopSpeakBtn.disabled = false;
        setVoiceStatus('Speaking response...');
    };

    utterance.onend = () => {
        speechSynthesisActive = false;
        if (voiceStopSpeakBtn) voiceStopSpeakBtn.disabled = true;
        setVoiceStatus('Voice chat idle');
        updateVoiceButtons();
    };

    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        speechSynthesisActive = false;
        if (voiceStopSpeakBtn) voiceStopSpeakBtn.disabled = true;
        setVoiceStatus('Speech synthesis error.', true);
        updateVoiceButtons();
    };

    // Chrome workaround to ensure it starts
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }

    // Slight delay to ensure cancel finished
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 100);
}

function speakResponseForModel(aiName) {
    const responseElement = document.getElementById(`${aiName}Response`);
    const fullText = responseElement?.dataset.fullText || responseElement?.textContent || '';
    if (fullText && !fullText.includes('Waiting for response')) {
        speakText(fullText);
    }
}

function stopSpeaking() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    speechSynthesisActive = false;

    // Clear any pending utterances to prevent 'synthetic error' or queue buildup
    if (window.speechSynthesis.pause) window.speechSynthesis.pause();
    if (window.speechSynthesis.resume) window.speechSynthesis.resume();

    if (voiceStopSpeakBtn) {
        voiceStopSpeakBtn.disabled = true;
    }
    updateVoiceButtons();
    setVoiceStatus('Voice chat idle');
}

function speakLastResponse() {
    if (!('speechSynthesis' in window)) {
        setVoiceStatus('Speech synthesis not supported.', true);
        return;
    }

    // Find the winner card or last response
    const winnerCard = document.querySelector('.response-card.winner');
    let responseElement = null;
    let fullText = '';

    if (winnerCard) {
        // Use data-ai to find the response container
        const aiName = winnerCard.dataset.ai;
        const responseElement = document.getElementById(`${aiName}Response`);
        fullText = responseElement?.dataset.fullText || responseElement?.textContent || '';
    } else {
        // Fallback to first visible response
        const aiNames = ['grok', 'chatgpt', 'llama', 'deepseek'];
        for (const ai of aiNames) {
            const responseElement = document.getElementById(`${ai}Response`);
            const text = responseElement?.dataset.fullText || responseElement?.textContent || '';
            if (text && text.trim().length > 0 && !text.includes('Waiting for response')) {
                fullText = text;
                break;
            }
        }
    }

    if (!fullText || fullText.trim() === '') {
        setVoiceStatus('No response to read.', true);
        return;
    }

    stopSpeaking();

    // Pause mic while TTS plays to prevent capturing the speaker's own output
    if (isRecognizing) {
        speechRecognition.stop();
        console.log('Mic paused while TTS is active');
    }

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1;
    utterance.pitch = 1;

    speechSynthesisActive = true;
    updateVoiceButtons();
    setVoiceStatus(' Speaking response... (mic paused)');

    const onTTSDoneLastResponse = () => {
        speechSynthesisActive = false;
        updateVoiceButtons();
        setVoiceStatus('Voice chat idle');
        // Resume mic if voice mode was active before TTS started
        if (voiceModeEnabled && !isRecognizing) {
            scheduleVoiceRestart();
        }
    };

    utterance.onend = onTTSDoneLastResponse;
    utterance.onerror = () => {
        speechSynthesisActive = false;
        updateVoiceButtons();
        setVoiceStatus('Speech synthesis error.', true);
        if (voiceModeEnabled && !isRecognizing) {
            scheduleVoiceRestart();
        }
    };

    window.speechSynthesis.speak(utterance);
}

// ====================================
// Analyze Prompt Quality
// ====================================
async function analyzePrompt() {
    const prompt = promptInput.value.trim();

    if (!prompt) {
        showError('Please enter a prompt first.');
        return;
    }

    try {
        analyzePromptBtn.disabled = true;
        analyzePromptBtn.innerHTML = '<span class="icon"></span> Analyzing...';

        const response = await fetch(`${API_BASE_URL}/analyze-prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        if (data.success) {
            displayPromptAnalysis(data.analysis, data.suggestions);
        } else {
            showError('Failed to analyze prompt.');
        }
    } catch (error) {
        console.error('Error analyzing prompt:', error);
        showError('Network error. Please ensure the server is running.');
    } finally {
        analyzePromptBtn.disabled = false;
        analyzePromptBtn.innerHTML = ' Analyze Quality';
    }
}

// ====================================
// Display Prompt Analysis
// ====================================
function displayPromptAnalysis(analysis, suggestions) {
    let html = `
        <div style="margin-bottom: 1rem;">
            <strong>Quality Score: ${analysis.score}/${analysis.maxScore}</strong> - ${analysis.quality}
            <div style="margin-top: 0.5rem;">
                <strong>Word Count:</strong> ${analysis.wordCount} words
            </div>
        </div>
    `;

    if (analysis.strengths.length > 0) {
        html += '<div style="margin-bottom: 1rem;"><strong> Strengths:</strong><ul>';
        analysis.strengths.forEach(strength => {
            html += `<li>${strength}</li>`;
        });
        html += '</ul></div>';
    }

    if (analysis.issues.length > 0) {
        html += '<div style="margin-bottom: 1rem;"><strong> Areas to Improve:</strong><ul>';
        analysis.issues.forEach(issue => {
            html += `<li>${issue}</li>`;
        });
        html += '</ul></div>';
    }

    if (suggestions.suggestions.length > 0) {
        html += '<div><strong> Suggestions:</strong><ul>';
        suggestions.suggestions.forEach(suggestion => {
            html += `<li>${suggestion}</li>`;
        });
        html += '</ul></div>';
    }

    if (suggestions.improvedVersion !== promptInput.value.trim()) {
        html += `
            <div style="margin-top: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 0.5rem; border-left: 4px solid #2563eb;">
                <strong> Improved Version:</strong>
                <p style="margin-top: 0.5rem; font-style: italic; padding: 0.5rem; background: rgba(0, 0, 0, 0.3); border-radius: 0.375rem; color: #fff;">"${suggestions.improvedVersion}"</p>
                <button onclick="useImprovedPrompt('${suggestions.improvedVersion.replace(/'/g, "\\'")}')" 
                        style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
                     Use This Prompt
                </button>
            </div>
        `;

        // Show alternative versions if available
        if (suggestions.alternativeVersions && suggestions.alternativeVersions.length > 0) {
            html += `<div style="margin-top: 0.5rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 0.5rem;">
                <strong> Alternative Versions:</strong>
                <div style="margin-top: 0.5rem;">`;

            suggestions.alternativeVersions.forEach((alt, index) => {
                if (alt && alt !== suggestions.improvedVersion) {
                    html += `
                        <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: rgba(0, 0, 0, 0.3); border-radius: 0.375rem;">
                            <p style="margin: 0; font-size: 0.9rem; font-style: italic; color: #fff;">"${alt}"</p>
                            <button onclick="useImprovedPrompt('${alt.replace(/'/g, "\\'")}')" 
                                    style="margin-top: 0.25rem; padding: 0.25rem 0.75rem; background: #6b7280; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.85rem;">
                                Use Option ${index + 2}
                            </button>
                        </div>
                    `;
                }
            });

            html += `</div></div>`;
        }
    }

    promptAnalysisContent.innerHTML = html;
    promptAnalysis.classList.remove('hidden');
}

// ====================================
// Use Improved Prompt
// ====================================
function useImprovedPrompt(improvedPrompt) {
    promptInput.value = improvedPrompt;
    promptAnalysis.classList.add('hidden');
    showSuccess('Prompt updated! Click "Compare AI Responses" to continue.');
}

// ====================================
// Compare AI Responses
// ====================================
// ====================================
// Compare AI Responses (Optimized with Async Individual Fetching)
// ====================================
async function compareAIResponses() {
    const prompt = promptInput.value.trim();

    if (!prompt) {
        showError('Please enter a prompt first.');
        return;
    }

    try {
        // Reset UI
        compareBtn.disabled = true;
        compareBtn.innerHTML = '<span class="icon"></span> Processing AI Results...';
        loadingIndicator.classList.remove('hidden');
        responsesSection.classList.remove('hidden');

        // Reset response displays
        resetResponseDisplays();

        // Clear previous results
        currentResponses = {
            grok: null,
            chatgpt: null,
            llama: null,
            deepseek: null
        };

        const aiModelNames = ['grok', 'chatgpt', 'llama', 'deepseek'];
        const startTime = Date.now();

        // Function to fetch a single AI response
        const fetchAI = async (aiName) => {
            try {
                const body = { prompt };
                if (aiName === 'grok' && grokModelSelect) {
                    body.grokModel = grokModelSelect.value;
                }

                const response = await fetch(`${API_BASE_URL}/${aiName}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                const data = await response.json();
                currentResponses[aiName] = data;

                // Update specific display for this model as soon as it returns
                displayResponse(aiName, data);

                return { name: aiName, data };
            } catch (error) {
                console.error(`Error fetching ${aiName}:`, error);
                const errorData = {
                    success: false,
                    response: `Failed to fetch ${aiName}: ${error.message}`,
                    responseTime: Date.now() - startTime
                };
                currentResponses[aiName] = errorData;
                displayResponse(aiName, errorData);
                return { name: aiName, data: errorData };
            }
        };

        // Call all APIs in parallel, but they update UI independently
        await Promise.all(aiModelNames.map(name => fetchAI(name)));

        // Once all responses are in, perform evaluation
        const evaluationResponse = await fetch(`${API_BASE_URL}/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                responses: currentResponses,
                weights: getNormalizedWeightsFromSliders()
            })
        });

        const evalData = await evaluationResponse.json();

        if (evalData.success) {
            currentMetrics = evalData.evaluation;

            // Display metrics
            displayMetrics(currentMetrics);

            // Display recommendations
            displayRecommendations(currentMetrics);

            // Real-time dashboard
            renderDashboard(currentMetrics);

            // Show sections
            metricsSection.classList.remove('hidden');
            if (dashboardSection) dashboardSection.classList.remove('hidden');
            recommendationsSection.classList.remove('hidden');

            // Speak response if enabled - disabled to respect user choice
            // speakSelectedResponse();

            // Success feedback
            setWeightStatus('Analysis complete. All 15 metrics updated.');
        } else {
            // Fallback to local analysis if backend evaluation fails
            console.warn('Backend evaluation failed, falling back to local analysis');
            currentMetrics = analyzeMetrics(prompt, currentResponses);
            displayMetrics(currentMetrics);
            displayRecommendations(currentMetrics);
            renderDashboard(currentMetrics);
            metricsSection.classList.remove('hidden');
            recommendationsSection.classList.remove('hidden');
        }

    } catch (error) {
        console.error('Error in comparison workflow:', error);
        showError('Network error or server unavailable. Please ensure the server is running on port 3000.');
    } finally {
        compareBtn.disabled = false;
        compareBtn.innerHTML = '<span class="icon"></span> Compare AI Responses';
        loadingIndicator.classList.add('hidden');

        // Scroll to results if we have at least one success
        const someSuccess = Object.values(currentResponses).some(r => r && r.success);
        if (someSuccess) {
            responsesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

async function initWeightControls() {
    if (!weightAccuracy || !weightComprehensiveness || !weightPrecisionRecall || !weightContextAwareness) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/weights`);
        const data = await response.json();
        const defaults = data?.success ? data.weights : DEFAULT_UI_WEIGHTS;
        setSliderWeights(defaults);
    } catch (error) {
        console.warn('Unable to load default weights, using local defaults.', error);
        setSliderWeights(DEFAULT_UI_WEIGHTS);
    }

    const sliderHandler = () => {
        updateWeightLabelsFromSliders();
        scheduleLiveWeightEvaluation();
    };

    [weightAccuracy, weightComprehensiveness, weightPrecisionRecall, weightContextAwareness].forEach((slider) => {
        slider.addEventListener('input', sliderHandler);
    });

    if (resetWeightsBtn) {
        resetWeightsBtn.addEventListener('click', () => {
            setSliderWeights(DEFAULT_UI_WEIGHTS);
            scheduleLiveWeightEvaluation(true);
        });
    }

    updateWeightLabelsFromSliders();
    weightControlsReady = true;
}

function setSliderWeights(weights) {
    const normalized = normalizeWeights(weights);
    if (weightAccuracy) weightAccuracy.value = Math.round(normalized.accuracy * 100);
    if (weightComprehensiveness) weightComprehensiveness.value = Math.round(normalized.comprehensiveness * 100);
    if (weightPrecisionRecall) weightPrecisionRecall.value = Math.round(normalized.precisionRecall * 100);
    if (weightContextAwareness) weightContextAwareness.value = Math.round(normalized.contextAwareness * 100);
    updateWeightLabelsFromSliders();
}

function normalizeWeights(weights) {
    const raw = {
        accuracy: Number(weights.accuracy || 0),
        comprehensiveness: Number(weights.comprehensiveness || 0),
        precisionRecall: Number(weights.precisionRecall || 0),
        contextAwareness: Number(weights.contextAwareness || 0)
    };

    const total = Object.values(raw).reduce((sum, value) => sum + (Number.isFinite(value) && value > 0 ? value : 0), 0);
    if (total <= 0) {
        return { ...DEFAULT_UI_WEIGHTS };
    }

    return {
        accuracy: raw.accuracy / total,
        comprehensiveness: raw.comprehensiveness / total,
        precisionRecall: raw.precisionRecall / total,
        contextAwareness: raw.contextAwareness / total
    };
}

function getNormalizedWeightsFromSliders() {
    return normalizeWeights({
        accuracy: Number(weightAccuracy?.value || 0),
        comprehensiveness: Number(weightComprehensiveness?.value || 0),
        precisionRecall: Number(weightPrecisionRecall?.value || 0),
        contextAwareness: Number(weightContextAwareness?.value || 0)
    });
}

function updateWeightLabelsFromSliders() {
    const normalized = getNormalizedWeightsFromSliders();
    if (weightAccuracyValue) weightAccuracyValue.textContent = `${Math.round(normalized.accuracy * 100)}%`;
    if (weightComprehensivenessValue) weightComprehensivenessValue.textContent = `${Math.round(normalized.comprehensiveness * 100)}%`;
    if (weightPrecisionRecallValue) weightPrecisionRecallValue.textContent = `${Math.round(normalized.precisionRecall * 100)}%`;
    if (weightContextAwarenessValue) weightContextAwarenessValue.textContent = `${Math.round(normalized.contextAwareness * 100)}%`;
}

function setWeightStatus(message, isError = false) {
    if (!weightStatus) return;
    weightStatus.textContent = message;
    weightStatus.style.color = isError ? 'var(--danger-color)' : 'var(--text-secondary)';
}

function scheduleLiveWeightEvaluation(isImmediate = false) {
    if (!weightControlsReady) return;
    if (weightUpdateTimer) {
        clearTimeout(weightUpdateTimer);
        weightUpdateTimer = null;
    }

    const evaluateNow = async () => {
        const prompt = promptInput.value.trim();
        if (!prompt || !currentResponses) {
            setWeightStatus('Set a prompt and compare responses to re-rank live.');
            return;
        }

        setWeightStatus('Updating ranking...');
        const weights = getNormalizedWeightsFromSliders();
        const evaluation = await evaluateWithWeights(prompt, weights, true);
        if (!evaluation) {
            setWeightStatus('Unable to update ranking right now.', true);
        }
    };

    if (isImmediate) {
        evaluateNow();
        return;
    }

    weightUpdateTimer = setTimeout(() => {
        evaluateNow();
    }, 280);
}

async function evaluateWithWeights(prompt, weights, refreshUI = true) {
    if (!prompt || !currentResponses) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                responses: currentResponses,
                weights
            })
        });

        const data = await response.json();
        if (!data.success || !data.evaluation) {
            return null;
        }

        if (refreshUI) {
            currentMetrics = data.evaluation;
            displayMetrics(currentMetrics);
            displayRecommendations(currentMetrics);
            renderDashboard(currentMetrics);
            setWeightStatus('Ranking updated with your custom weights.');
        }

        return data.evaluation;
    } catch (error) {
        console.error('Weight-based evaluation failed:', error);
        return null;
    }
}

// ====================================
// Reset Response Displays
// ====================================
function resetResponseDisplays() {
    const aiNames = ['grok', 'chatgpt', 'llama', 'deepseek'];
    aiNames.forEach(ai => {
        const responseElement = document.getElementById(`${ai}Response`);
        const timeElement = document.getElementById(`${ai}Time`);
        const card = document.querySelector(`.response-card[data-ai="${ai}"]`);

        if (responseElement) {
            responseElement.innerHTML = '<div class="loading-placeholder">Waiting for response...</div>';
            responseElement.dataset.fullText = '';
        }
        if (timeElement) {
            timeElement.textContent = '--';
        }
    });
}

// ====================================
// Display Single AI Response
// ====================================
function displayResponse(aiName, data) {
    const responseElement = document.getElementById(`${aiName}Response`);
    const timeElement = document.getElementById(`${aiName}Time`);
    const responseText = data.response || '';
    responseElement.dataset.fullText = responseText;

    if (data.success) {
        responseElement.innerHTML = `<p class="response-text response-preview">${escapeHtml(createPreviewText(responseText))}</p>`;
        timeElement.textContent = `${(data.responseTime / 1000).toFixed(2)}s`;
        timeElement.style.background = '#10b981';
    } else {
        responseElement.innerHTML = `<p class="response-text response-preview" style="color: #ef4444;">${escapeHtml(createPreviewText(responseText))}</p>`;
        timeElement.textContent = 'Error';
        timeElement.style.background = '#ef4444';
    }
}

// ====================================
// Focused Response Overlay
// ====================================
function openResponseOverlay(aiName) {
    if (!aiName) return;

    const responseElement = document.getElementById(`${aiName}Response`);
    const timeElement = document.getElementById(`${aiName}Time`);

    // Get display name from MODEL_DISPLAY_NAMES or fall back to capitalized aiName
    const displayName = MODEL_DISPLAY_NAMES[aiName] || aiName.charAt(0).toUpperCase() + aiName.slice(1);

    const fullText = responseElement?.dataset.fullText || responseElement?.innerText || 'No response available yet.';
    const responseTime = timeElement?.textContent || '--';

    if (overlayTitle) overlayTitle.textContent = displayName;
    if (overlayMeta) overlayMeta.textContent = `Response time: ${responseTime}`;
    if (overlayContent) {
        overlayContent.innerHTML = formatResponseToHtml(fullText);
    }

    if (responseOverlay) {
        responseOverlay.classList.remove('hidden');
        responseOverlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('overlay-open');
    }
}

function closeResponseOverlay() {
    responseOverlay.classList.add('hidden');
    responseOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overlay-open');

    // Stop speaking when user closes the card
    stopSpeaking();
}

function updateSoundToggleUI() {
    if (!soundToggleBtn) return;
    soundToggleBtn.textContent = soundEnabled ? 'On' : 'Off';
    soundToggleBtn.setAttribute('aria-pressed', soundEnabled ? 'true' : 'false');
    soundToggleBtn.classList.toggle('is-off', !soundEnabled);
}

function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    if (uiTapSound) {
        try {
            const previousVolume = uiTapSound.volume;
            uiTapSound.volume = 0;
            const playPromise = uiTapSound.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(() => {
                    uiTapSound.pause();
                    uiTapSound.currentTime = 0;
                    uiTapSound.volume = previousVolume;
                }).catch(() => {
                    uiTapSound.volume = previousVolume;
                });
            } else {
                uiTapSound.volume = previousVolume;
            }
        } catch (error) {
            console.warn('Audio unlock failed for UI tap sound.', error);
        }
    }

    if (!tapAudioContext) {
        tapAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (tapAudioContext.state === 'suspended') {
        tapAudioContext.resume();
    }
}

function pulseElement(element) {
    if (!element) return;
    element.classList.remove('ui-press');
    void element.offsetWidth;
    element.classList.add('ui-press');
}

// ====================================
// Futuristic Tap Sound
// ====================================
function playTapSound() {
    if (!soundEnabled) return;
    if (uiTapSound) {
        try {
            uiTapSound.volume = 0.35;
            uiTapSound.currentTime = 0;
            const playPromise = uiTapSound.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => playSynthTap());
            }
            return;
        } catch (error) {
            console.warn('UI tap sound playback failed, falling back to synthesized audio.', error);
        }
    }

    playSynthTap();
}

function playSynthTap() {
    if (!tapAudioContext) {
        tapAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (tapAudioContext.state === 'suspended') {
        tapAudioContext.resume();
    }

    const now = tapAudioContext.currentTime;
    const clickOsc = tapAudioContext.createOscillator();
    const snapOsc = tapAudioContext.createOscillator();
    const gain = tapAudioContext.createGain();
    const bandpass = tapAudioContext.createBiquadFilter();

    // Midpitch soft click with tiny chime tail (0.25s total)
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(820, now);
    clickOsc.frequency.exponentialRampToValueAtTime(520, now + 0.06);

    snapOsc.type = 'sine';
    snapOsc.frequency.setValueAtTime(1500, now);
    snapOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1100, now);
    bandpass.Q.value = 0.8;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    clickOsc.connect(bandpass);
    snapOsc.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(tapAudioContext.destination);

    clickOsc.start(now);
    snapOsc.start(now + 0.02);
    clickOsc.stop(now + 0.12);
    snapOsc.stop(now + 0.25);
}

// ====================================
// Response Formatting Helpers
// ====================================
function createPreviewText(text) {
    const normalized = text.replace(/\s+/g, ' ').trim();
    const maxLength = 420;
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength)}...`;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatResponseToHtml(text) {
    if (!text || text.trim() === '') {
        return '<p>No response available yet.</p>';
    }

    const lines = text.split(/\r?\n/);
    let html = '';
    let inList = false;
    let paragraphBuffer = [];

    const formatInline = (str) => {
        return str
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    };

    const flushParagraph = () => {
        if (paragraphBuffer.length > 0) {
            html += `<p>${formatInline(escapeHtml(paragraphBuffer.join(' ')))}</p>`;
            paragraphBuffer = [];
        }
    };

    lines.forEach((rawLine) => {
        const line = rawLine.trim();

        if (line === '') {
            flushParagraph();
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            return;
        }

        const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
        if (headingMatch) {
            flushParagraph();
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            const level = headingMatch[1].length + 1;
            const headingText = formatInline(escapeHtml(headingMatch[2]));
            html += `<h${level}>${headingText}</h${level}>`;
            return;
        }

        const bulletMatch = line.match(/^[-*]\s+(.*)/);
        if (bulletMatch) {
            flushParagraph();
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${formatInline(escapeHtml(bulletMatch[1]))}</li>`;
            return;
        }

        paragraphBuffer.push(line);
    });

    flushParagraph();
    if (inList) {
        html += '</ul>';
    }

    return html;
}

// ====================================
// Analyze All 15 Metrics
// ====================================
function analyzeMetrics(prompt, responses) {
    const metrics = {
        responseTime: analyzeResponseTime(responses),
        accuracy: analyzeAccuracy(responses),
        comprehensiveness: analyzeComprehensiveness(responses),
        precisionRecall: analyzePrecisionRecall(responses),
        sentimentDetection: analyzeSentimentDetection(responses),
        multiModality: analyzeMultiModality(responses),
        predictiveAccuracy: analyzePredictiveAccuracy(responses),
        scalability: analyzeScalability(responses),
        explainability: analyzeExplainability(responses),
        contextAwareness: analyzeContextAwareness(prompt, responses),
        customization: analyzeCustomization(responses),
        promptSensitivity: analyzePromptSensitivity(prompt, responses),
        knowledgeFreshness: analyzeKnowledgeFreshness(responses),
        integration: analyzeIntegration(responses),
        costValue: analyzeCostValue(responses)
    };

    // Calculate overall scores
    const overallScores = calculateOverallScores(metrics);

    return { ...metrics, overall: overallScores };
}

// ====================================
// Metric 1: Response Time
// ====================================
function analyzeResponseTime(responses) {
    const times = {
        grok: responses.grok.responseTime,
        chatgpt: responses.chatgpt.responseTime,
        llama: responses.llama.responseTime,
        deepseek: responses.deepseek.responseTime
    };

    const fastest = Object.entries(times).reduce((a, b) => a[1] < b[1] ? a : b);

    return {
        name: 'Response Time',
        description: 'Measures how fast the tool responds to a query',
        scores: {
            grok: normalizeScore(times.grok, 5000, true),
            chatgpt: normalizeScore(times.chatgpt, 5000, true),
            llama: normalizeScore(times.llama, 5000, true),
            deepseek: normalizeScore(times.deepseek, 5000, true)
        },
        rawValues: times,
        winner: fastest[0],
        icon: ''
    };
}

// ====================================
// Metric 2: Accuracy of Output
// ====================================
function analyzeAccuracy(responses) {
    const scores = {};

    Object.entries(responses).forEach(([ai, data]) => {
        if (!data.success) {
            scores[ai] = 0;
            return;
        }

        let score = 5; // Base score
        const text = data.response.toLowerCase();

        // Check for specific, factual language
        if (text.includes('according to') || text.includes('research shows') ||
            text.includes('studies indicate') || text.includes('data suggests')) {
            score += 2;
        }

        // Check for hedging language (reduces certainty)
        const hedges = ['might', 'possibly', 'perhaps', 'could be', 'may be'];
        const hedgeCount = hedges.filter(h => text.includes(h)).length;
        score -= hedgeCount * 0.5;

        // Check for citations or references
        if (text.includes('[') || text.includes('source:') || text.includes('reference:')) {
            score += 2;
        }

        scores[ai] = Math.max(0, Math.min(10, score));
    });

    const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);

    return {
        name: 'Accuracy of Output',
        description: 'Correctness of insights and information provided',
        scores,
        winner: winner[0],
        icon: ''
    };
}

// ====================================
// Metric 3: Comprehensiveness
// ====================================
function analyzeComprehensiveness(responses) {
    const scores = {};

    Object.entries(responses).forEach(([ai, data]) => {
        if (!data.success) {
            scores[ai] = 0;
            return;
        }

        const text = data.response;
        const wordCount = text.split(/\s+/).length;
        const sentenceCount = text.split(/[.!?]+/).length;
        const hasLists = /[-*]\s|[0-9]\./g.test(text);
        const hasMultipleParagraphs = text.split('\n\n').length > 1;

        let score = normalizeScore(wordCount, 500, false) * 5; // Up to 5 points for length

        if (hasLists) score += 2;
        if (hasMultipleParagraphs) score += 2;
        if (sentenceCount > 5) score += 1;

        scores[ai] = Math.min(10, score);
    });

    const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);

    return {
        name: 'Comprehensiveness',
        description: 'How thoroughly the tool analyzes and covers the topic',
        scores,
        winner: winner[0],
        icon: ''
    };
}

// ====================================
// Metric 4: Precision & Recall
// ====================================
function analyzePrecisionRecall(responses) {
    const scores = {};

    Object.entries(responses).forEach(([ai, data]) => {
        if (!data.success) {
            scores[ai] = 0;
            return;
        }

        const text = data.response;
        let score = 5; // Base score

        // Check for focused, relevant content (precision)
        const fluffWords = ['basically', 'essentially', 'actually', 'literally', 'just'];
        const fluffCount = fluffWords.filter(w => text.toLowerCase().includes(w)).length;
        score -= fluffCount * 0.5;

        // Check for comprehensive coverage (recall)
        const hasExamples = text.toLowerCase().includes('example') || text.toLowerCase().includes('for instance');
        const hasMultiplePoints = (text.match(/firstly|secondly|additionally|furthermore|moreover/gi) || []).length;

        if (hasExamples) score += 2;
        score += Math.min(3, hasMultiplePoints);

        scores[ai] = Math.max(0, Math.min(10, score));
    });

    const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);

    return {
        name: 'Precision & Recall',
        description: 'Relevance and completeness of information',
        scores,
        winner: winner[0],
        icon: ''
    };
}

// ====================================
// Metric 5: Sentiment Detection Quality
// ====================================
function analyzeSentimentDetection(responses) {
    const scores = {};

    Object.entries(responses).forEach(([ai, data]) => {
        if (!data.success) {
            scores[ai] = 0;
            return;
        }

        const text = data.response.toLowerCase();
        let score = 5; // Base score

        // Check for emotional intelligence markers
        const positiveWords = ['benefit', 'advantage', 'positive', 'improve', 'enhance'];
        const negativeWords = ['challenge', 'issue', 'problem', 'disadvantage', 'concern'];
        const neutralWords = ['however', 'although', 'while', 'consider', 'depends'];

        const hasPositive = positiveWords.some(w => text.includes(w));
        const hasNegative = negativeWords.some(w => text.includes(w));
        const hasNeutral = neutralWords.some(w => text.includes(w));

        if (hasPositive) score += 2;
        if (hasNegative) score += 2;
        if (hasNeutral) score += 1;

        scores[ai] = Math.min(10, score);
    });

    const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);

    return {
        name: 'Sentiment Detection Quality',
        description: 'Ability to capture and convey nuanced emotions',
        scores,
        winner: winner[0],
        icon: ''
    };
}

function analyzeMultiModality(responses) {
    const scores = {
        grok: 8.5,
        chatgpt: 9.0,  // GPT models have strong multi-modal support
        llama: 7.5,
        deepseek: 8.0
    };

    const winner = 'chatgpt';
    return {
        name: 'Multi-Modality Support',
        description: 'Ability to analyze different data formats',
        scores,
        winner: winner,
        icon: ''
    };
}

// ====================================
// Metric 7: Predictive Accuracy
// ====================================
function analyzePredictiveAccuracy(responses) {
    const scores = {};

    Object.entries(responses).forEach(([ai, data]) => {
        if (!data.success) {
            scores[ai] = 0;
            return;
        }

        const text = data.response.toLowerCase();
        let score = 5;

        // Check for forward-looking statements
        const predictiveTerms = ['will', 'expect', 'forecast', 'predict', 'likely', 'trend', 'future'];
        const predictiveCount = predictiveTerms.filter(t => text.includes(t)).length;

        score += Math.min(3, predictiveCount);

        // Check for data-driven predictions
        if (text.includes('data') || text.includes('statistics') || text.includes('analysis')) {
            score += 2;
        }

        scores[ai] = Math.min(10, score);
    });

    const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);

    return {
        name: 'Predictive Accuracy',
        description: 'Quality of future trend forecasting',
        scores,
        winner: winner[0],
        icon: ''
    };
}

// ====================================
// Metric 8: Scalability
// ====================================
function analyzeScalability(responses) {
    // Based on known infrastructure capabilities
    const scores = {
        grok: 9.0,
        chatgpt: 8.0,
        llama: 7.5,
        deepseek: 8.5
    };

    return {
        name: 'Scalability',
        description: 'Ability to handle increasing data volumes',
        scores,
        winner: 'grok',
        icon: ''
    };
}

// ====================================
// Metric 9: Explainability / Interpretability
// ====================================
function analyzeExplainability(responses) {
    const scores = {};

    Object.entries(responses).forEach(([ai, data]) => {
        if (!data.success) {
            scores[ai] = 0;
            return;
        }

        const text = data.response.toLowerCase();
        let score = 5;

        // Check for explanatory language
        const explainTerms = ['because', 'therefore', 'thus', 'consequently', 'as a result', 'due to'];
        const explainCount = explainTerms.filter(t => text.includes(t)).length;

        score += Math.min(3, explainCount);

        // Check for step-by-step explanations
        if (text.includes('first') && text.includes('second')) score += 1;
        if (text.includes('step') || text.includes('process')) score += 1;

        scores[ai] = Math.min(10, score);
    });

    const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);

    return {
        name: 'Explainability / Interpretability',
        description: 'Clarity in explaining reasoning and decisions',
        scores,
        winner: winner[0],
        icon: ''
    };
}

// ====================================
// Metric 10: Context Awareness
// ====================================
function analyzeContextAwareness(prompt, responses) {
    const scores = {};

    // Extract key terms from prompt
    const promptLower = prompt.toLowerCase();
    const promptWords = promptLower.split(/\s+/).filter(w => w.length > 4);

    Object.entries(responses).forEach(([ai, data]) => {
        if (!data.success) {
            scores[ai] = 0;
            return;
        }

        const text = data.response.toLowerCase();
        let score = 5;

        // Check how many prompt keywords are addressed
        const addressedKeywords = promptWords.filter(word => text.includes(word)).length;
        score += Math.min(3, addressedKeywords * 0.5);

        // Check for contextual references
        if (text.includes('you asked') || text.includes('your question') || text.includes('regarding')) {
            score += 2;
        }

        scores[ai] = Math.min(10, score);
    });

    const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);

    return {
        name: 'Context Awareness',
        description: 'Understanding context over interactions',
        scores,
        winner: winner[0],
        icon: ''
    };
}

// ====================================
// Metric 11: Customization & Fine-Tuning
// ====================================
function analyzeCustomization(responses) {
    // Based on known platform capabilities
    const scores = {
        grok: 9.0,
        chatgpt: 8.0,
        llama: 8.5,
        deepseek: 7.0
    };

    return {
        name: 'Customization & Fine-Tuning',
        description: 'Flexibility for domain-specific adjustments',
        scores,
        winner: 'grok',
        icon: ''
    };
}

// ====================================
// Metric 12: Prompt Sensitivity
// ====================================
function analyzePromptSensitivity(prompt, responses) {
    const scores = {};

    Object.entries(responses).forEach(([ai, data]) => {
        if (!data.success) {
            scores[ai] = 0;
            return;
        }

        let score = 7; // Base score for successful response

        const responseLength = data.response.length;
        const isAppropriateLength = responseLength > 100 && responseLength < 3000;

        if (isAppropriateLength) score += 2;

        // Check if response directly answers the prompt
        const text = data.response.toLowerCase();
        if (text.includes(prompt.toLowerCase().substring(0, 20))) {
            score += 1;
        }

        scores[ai] = Math.min(10, score);
    });

    const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);

    return {
        name: 'Prompt Sensitivity',
        description: 'Effectiveness with different prompt styles',
        scores,
        winner: winner[0],
        icon: ''
    };
}

// ====================================
// Metric 13: Knowledge Freshness
// ====================================
function analyzeKnowledgeFreshness(responses) {
    const scores = {};

    Object.entries(responses).forEach(([ai, data]) => {
        if (!data.success) {
            scores[ai] = 0;
            return;
        }

        const text = data.response.toLowerCase();
        let score = 5;

        // Check for recent references
        const currentYear = new Date().getFullYear();
        const recentYears = [currentYear, currentYear - 1, currentYear - 2];
        const hasRecentYear = recentYears.some(year => text.includes(year.toString()));

        if (hasRecentYear) score += 3;

        // Check for terms indicating recent information
        const freshnessTerms = ['recent', 'latest', 'current', 'modern', 'contemporary', 'up-to-date'];
        const freshnessCount = freshnessTerms.filter(t => text.includes(t)).length;

        score += Math.min(2, freshnessCount);

        scores[ai] = Math.min(10, score);
    });

    const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);

    return {
        name: 'Knowledge Freshness',
        description: 'How up-to-date the knowledge base is',
        scores,
        winner: winner[0],
        icon: ''
    };
}

function analyzeIntegration(responses) {
    // Based on known API capabilities
    const scores = {
        grok: 8.5,
        chatgpt: 9.0,
        llama: 9.5,
        deepseek: 8.0
    };

    return {
        name: 'Integration & API Support',
        description: 'Ease of integration with existing systems',
        scores,
        winner: 'grok',
        icon: ''
    };
}

function analyzeCostValue(responses) {
    // Considering typical pricing and value delivered
    const scores = {
        grok: 8.0,
        chatgpt: 8.5,
        llama: 9.0,
        deepseek: 9.5 // DeepSeek is famous for value
    };

    return {
        name: 'Cost vs. Value',
        description: 'Analysis quality relative to price point',
        scores,
        winner: 'deepseek',
        icon: ''
    };
}

// ====================================
// Helper: Normalize Score
// ====================================
function normalizeScore(value, max, inverse = false) {
    if (inverse) {
        // For metrics where lower is better (e.g., response time)
        return Math.max(0, Math.min(10, 10 - (value / max) * 10));
    } else {
        // For metrics where higher is better
        return Math.max(0, Math.min(10, (value / max) * 10));
    }
}

// ====================================
// Calculate Overall Scores
// ====================================
function calculateOverallScores(metrics) {
    const aiNames = ['grok', 'chatgpt', 'llama', 'deepseek'];
    const scores = {};

    aiNames.forEach(ai => {
        let totalScore = 0;
        let metricCount = 0;

        Object.values(metrics).forEach(metric => {
            if (metric.scores && metric.scores[ai] !== undefined) {
                totalScore += metric.scores[ai];
                metricCount++;
            }
        });

        scores[ai] = metricCount > 0 ? (totalScore / metricCount).toFixed(2) : 0;
    });

    const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);

    return {
        scores,
        winner: winner[0],
        winnerScore: winner[1]
    };
}

// ====================================
// Display Metrics
// ====================================
function displayMetrics(metrics) {
    // Display winner
    displayWinner(metrics.overall);

    // Display individual metrics
    displayMetricsGrid(metrics);

    // Display metrics table
    displayMetricsTable(metrics);
}

// ====================================
// Display Winner
// ====================================
function displayWinner(overall) {
    const winnerContent = document.getElementById('winnerContent');
    const winnerLabel = `${MODEL_EMOJIS[overall.winner]} ${MODEL_DISPLAY_NAMES[overall.winner]}`;

    winnerContent.innerHTML = `
        <div class="winner-name">${winnerLabel}</div>
        <div class="winner-score">Overall Score: ${overall.winnerScore}/10</div>
        <p style="margin-top: 1rem; color: #155724;">
            ${winnerLabel} is currently the best-performing model for this prompt.
        </p>
    `;
}

// ====================================
// Display Metrics Grid
// ====================================
function displayMetricsGrid(metrics) {
    const metricsGrid = document.getElementById('metricsGrid');

    let html = '';

    Object.entries(metrics).forEach(([key, metric]) => {
        if (key === 'overall' || !metric.scores) return;

        html += `
            <div class="metric-card">
                <h4>${metric.icon} ${metric.name}</h4>
                <p style="font-size: 0.9rem; color: #6b7280; margin-bottom: 0.75rem;">
                    ${metric.description}
                </p>
                <div class="metric-winner">
                     Winner: ${MODEL_DISPLAY_NAMES[metric.winner]}
                </div>
                <div class="metric-scores">
                    ${Object.entries(metric.scores).map(([ai, score]) => `
                        <div class="score-bar">
                            <span class="score-label">${MODEL_DISPLAY_NAMES[ai]}</span>
                            <div class="score-value">
                                <div class="score-fill" style="width: ${score * 10}%"></div>
                            </div>
                            <span class="score-number">${typeof score === 'number' ? score.toFixed(1) : score}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    metricsGrid.innerHTML = html;
}

// ====================================
// Display Metrics Table
// ====================================
function displayMetricsTable(metrics) {
    const tableBody = document.getElementById('metricsTableBody');

    let html = '';

    Object.entries(metrics).forEach(([key, metric]) => {
        if (key === 'overall' || !metric.scores) return;

        html += `<tr>`;
        html += `<td><strong>${metric.icon} ${metric.name}</strong></td>`;

        ['grok', 'chatgpt', 'llama', 'deepseek'].forEach(ai => {
            const score = metric.scores[ai];
            const isWinner = metric.winner === ai;
            const cellClass = isWinner ? 'winner-cell' : '';
            const displayScore = typeof score === 'number' ? score.toFixed(1) : score;

            html += `<td class="${cellClass}">${displayScore}${isWinner ? ' ' : ''}</td>`;
        });

        html += `</tr>`;
    });

    // Add overall row
    html += `<tr style="background: rgba(255, 255, 255, 0.1); border-top: 2px solid var(--primary-color); font-weight: 700; color: #ffffff;">`;
    html += `<td><strong> Overall Average Score</strong></td>`;
    ['grok', 'chatgpt', 'llama', 'deepseek'].forEach(ai => {
        const score = metrics.overall.scores[ai];
        const isWinner = metrics.overall.winner === ai;
        const cellClass = isWinner ? 'winner-cell' : '';

        html += `<td class="${cellClass}" style="color: #ffffff;">${score}${isWinner ? ' ' : ''}</td>`;
    });
    html += `</tr>`;

    tableBody.innerHTML = html;
}

// ====================================
// Display Recommendations
// ====================================
function displayRecommendations(metrics) {
    const recommendationsContent = document.getElementById('recommendationsContent');
    const ranked = Array.isArray(metrics?.overall?.ranking) ? metrics.overall.ranking : [];
    const topModel = metrics?.overall?.winner;
    const topScore = metrics?.overall?.winnerScore;
    const speedWinner = metrics?.responseTime?.winner;
    const accuracyWinner = metrics?.accuracy?.winner;
    const comprehensionWinner = metrics?.comprehensiveness?.winner;
    const precisionWinner = metrics?.precisionRecall?.winner;
    const explainWinner = metrics?.explainability?.winner;
    const weights = metrics?.overall?.weights || {};

    let recommendations = [];

    recommendations.push({
        title: ' Best Overall Choice',
        content: `${MODEL_DISPLAY_NAMES[topModel]} achieved the highest weighted score (${topScore}/10) for this prompt.`
    });

    recommendations.push({
        title: ' Fastest Response',
        content: `${MODEL_DISPLAY_NAMES[speedWinner] || 'N/A'} returned the quickest answer.`
    });

    recommendations.push({
        title: ' Best Accuracy',
        content: `${MODEL_DISPLAY_NAMES[accuracyWinner] || 'N/A'} provided the most accurate and factually grounded response.`
    });

    recommendations.push({
        title: ' Most Comprehensive',
        content: `${MODEL_DISPLAY_NAMES[comprehensionWinner] || 'N/A'} offered the most thorough analysis of the input.`
    });

    recommendations.push({
        title: ' Best Reasoning',
        content: `${MODEL_DISPLAY_NAMES[explainWinner] || 'N/A'} provided the clearest explanation of its reasoning and logic.`
    });

    recommendations.push({
        title: ' Active Weighting',
        content: `Current scoring weights are Accuracy ${(weights.accuracy || 0).toFixed(2)}, Comprehensiveness ${(weights.comprehensiveness || 0).toFixed(2)}, Precision ${(weights.precisionRecall || 0).toFixed(2)}, Context ${(weights.contextAwareness || 0).toFixed(2)}.`
    });

    if (ranked.length > 1) {
        const shortRanking = ranked
            .map((item, index) => `${index + 1}. ${MODEL_DISPLAY_NAMES[item.model]} (${item.score.toFixed(2)})`)
            .join(' | ');
        recommendations.push({
            title: ' Ranking Snapshot',
            content: shortRanking
        });
    }

    let html = recommendations.map(rec => `
        <div class="recommendation-card">
            <h4>${rec.title}</h4>
            <p>${rec.content}</p>
        </div>
    `).join('');

    recommendationsContent.innerHTML = html;
}

function renderDashboard(metrics) {
    if (!metrics?.overall || !rankingBars || !metricsCanvas) return;

    renderRankingBars(metrics.overall.ranking || []);
    renderMetricCanvas(metrics);
}

function renderRankingBars(ranking) {
    if (!rankingBars) return;

    rankingBars.innerHTML = ranking.map((entry) => {
        const width = Math.max(4, Math.min(100, entry.score * 10));
        return `
            <div class="dashboard-row">
                <div class="dashboard-label">${MODEL_DISPLAY_NAMES[entry.model]}</div>
                <div class="dashboard-track"><div class="dashboard-fill" style="width: ${width}%"></div></div>
                <div class="dashboard-value">${entry.score.toFixed(2)}</div>
            </div>
        `;
    }).join('');
}

function renderMetricCanvas(metrics) {
    const canvas = metricsCanvas;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const coreMetrics = ['accuracy', 'comprehensiveness', 'precisionRecall', 'explainability'];
    const models = ['grok', 'chatgpt', 'llama', 'deepseek'];
    const rowHeight = 54;
    const labelWidth = 110;
    const chartWidth = canvas.width - labelWidth - 20;
    const rootStyles = getComputedStyle(document.documentElement);
    const textPrimary = rootStyles.getPropertyValue('--text-primary').trim() || '#ffffff';
    const textSecondary = rootStyles.getPropertyValue('--text-secondary').trim() || '#b0b0c0';
    const primary = rootStyles.getPropertyValue('--primary-color').trim() || '#ff006e';
    const secondary = rootStyles.getPropertyValue('--secondary-color').trim() || '#00d9ff';

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = textPrimary;
    context.font = '13px Segoe UI';

    coreMetrics.forEach((metricKey, rowIndex) => {
        const y = 34 + rowIndex * rowHeight;
        context.fillStyle = textSecondary;
        context.fillText(metricKey.charAt(0).toUpperCase() + metricKey.slice(1), 10, y);

        models.forEach((model, modelIndex) => {
            const value = Number(metrics?.[metricKey]?.scores?.[model] || 0);
            const baseX = labelWidth + modelIndex * (chartWidth / models.length);
            const barWidth = (chartWidth / models.length) - 16;
            const barHeight = Math.max(4, value * 3.6);
            const yBase = y + 24;

            context.fillStyle = modelIndex % 2 === 0 ? secondary : primary;
            context.fillRect(baseX, yBase - barHeight, barWidth, barHeight);
            context.fillStyle = textPrimary;
            context.font = '11px Segoe UI';
            context.fillText(value.toFixed(1), baseX + 6, yBase - barHeight - 4);
        });
    });

    const legendY = canvas.height - 14;
    context.font = '11px Segoe UI';
    models.forEach((model, index) => {
        const x = 14 + index * 150;
        context.fillStyle = index % 2 === 0 ? secondary : primary;
        context.fillRect(x, legendY - 8, 10, 10);
        context.fillStyle = textSecondary;
        context.fillText(MODEL_DISPLAY_NAMES[model], x + 16, legendY);
    });
}

// ====================================
// Utility Functions
// ====================================
function showError(message) {
    alert(' ' + message);
}

function showSuccess(message) {
    alert(' ' + message);
}

// ====================================
// Initialize
// ====================================
console.log('AI Comparison Tool initialized successfully! ');
