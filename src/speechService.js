/**
 * Speech Recognition and Text-to-Speech Service
 * Handles voice input/output with automatic timeout and language support
 */
export class SpeechService {
    constructor(isRecognizingGetter, setRecognitionState, onResult, onError, getTimeoutValue) {
        this.isRecognizingGetter = isRecognizingGetter;
        this.setRecognitionState = setRecognitionState;
        this.onResult = onResult;
        this.onError = onError;
        this.getTimeoutValue = getTimeoutValue;
        
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.silenceTimer = null;
        this.isSupported = this.checkSupport();
    }

    /**
     * Check if speech recognition and synthesis are supported
     * @returns {boolean} True if both are supported
     */
    checkSupport() {
        const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        const hasSynthesis = 'speechSynthesis' in window;
        return hasRecognition && hasSynthesis;
    }

    /**
     * Initialize speech recognition with language support
     * @param {string} language - Language code (e.g., 'en-US', 'es-ES')
     */
    initRecognition(language = 'en-US') {
        if (!this.isSupported) {
            this.onError('Speech recognition not supported in this browser');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = language;

        this.recognition.onstart = () => {
            this.setRecognitionState(true);
            this.startSilenceTimer();
        };

        this.recognition.onresult = (event) => {
            this.resetSilenceTimer();
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            
            if (finalTranscript) {
                this.onResult(finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            this.onError(`Speech recognition error: ${event.error}`);
            this.setRecognitionState(false);
        };

        this.recognition.onend = () => {
            this.setRecognitionState(false);
            this.clearSilenceTimer();
        };
    }

    /**
     * Toggle speech recognition on/off
     * @param {string} language - Language for recognition
     */
    toggleRecognition(language = 'en-US') {
        if (!this.isSupported) {
            this.onError('Speech recognition not supported');
            return;
        }

        if (this.isRecognizingGetter()) {
            this.stopRecognition();
        } else {
            this.startRecognition(language);
        }
    }

    /**
     * Start speech recognition
     * @param {string} language - Language for recognition
     */
    startRecognition(language = 'en-US') {
        if (!this.recognition || this.recognition.lang !== language) {
            this.initRecognition(language);
        }
        
        try {
            this.recognition.start();
        } catch (error) {
            this.onError(`Failed to start recognition: ${error.message}`);
        }
    }

    /**
     * Stop speech recognition
     */
    stopRecognition() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.clearSilenceTimer();
    }

    /**
     * Start silence timer for automatic timeout
     */
    startSilenceTimer() {
        this.clearSilenceTimer();
        const timeout = this.getTimeoutValue();
        
        this.silenceTimer = setTimeout(() => {
            if (this.isRecognizingGetter()) {
                this.stopRecognition();
                this.onResult(''); // Send empty result to trigger timeout handling
            }
        }, timeout);
    }

    /**
     * Reset silence timer
     */
    resetSilenceTimer() {
        this.startSilenceTimer();
    }

    /**
     * Clear silence timer
     */
    clearSilenceTimer() {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
    }

    /**
     * Speak text using text-to-speech
     * @param {string} text - Text to speak
     * @param {string} language - Language code
     * @param {Function} onEnd - Callback when speech ends
     */
    speak(text, language = 'en-US', onEnd = null) {
        if (!this.isSupported) {
            if (onEnd) onEnd();
            return;
        }

        // Stop any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        if (onEnd) {
            utterance.onend = onEnd;
        }

        this.synthesis.speak(utterance);
    }

    /**
     * Stop current speech synthesis
     */
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    /**
     * Check if currently speaking
     * @returns {boolean} True if speaking
     */
    isSpeaking() {
        return this.synthesis ? this.synthesis.speaking : false;
    }

    /**
     * Get available voices for a language
     * @param {string} language - Language code
     * @returns {Array} Array of available voices
     */
    getVoicesForLanguage(language) {
        const voices = this.synthesis.getVoices();
        return voices.filter(voice => voice.lang.startsWith(language.split('-')[0]));
    }
}