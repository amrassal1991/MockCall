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
     * Speak text using text-to-speech with enhanced voice quality
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
        
        // Enhanced voice settings for more natural speech
        utterance.rate = 0.85; // Slightly slower for clarity
        utterance.pitch = 0.95; // Slightly lower pitch for professionalism
        utterance.volume = 0.9;

        // Get the best available voice
        const voice = this.getBestVoice(language);
        if (voice) {
            utterance.voice = voice;
        }

        // Add natural pauses and emphasis
        const enhancedText = this.enhanceTextForSpeech(text);
        utterance.text = enhancedText;

        if (onEnd) {
            utterance.onend = onEnd;
        }

        utterance.onerror = (event) => {
            console.error('Enhanced speech error:', event.error);
            if (onEnd) onEnd();
        };

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
     * Get the best available voice for the language
     * @param {string} language - Language code
     * @returns {SpeechSynthesisVoice|null} Best voice or null
     */
    getBestVoice(language) {
        const voices = this.synthesis.getVoices();
        const languageCode = language.split('-')[0];
        
        // Priority order for voice selection
        const voicePriorities = [
            // Premium voices (more natural)
            (voice) => voice.name.includes('Neural') || voice.name.includes('Premium'),
            (voice) => voice.name.includes('Google') && voice.name.includes('Standard'),
            (voice) => voice.name.includes('Microsoft') && voice.name.includes('Online'),
            (voice) => voice.name.includes('Apple') || voice.name.includes('Samantha') || voice.name.includes('Alex'),
            (voice) => voice.name.includes('Google'),
            (voice) => voice.name.includes('Microsoft'),
            // Fallback to any voice in the language
            (voice) => voice.lang.startsWith(languageCode)
        ];

        // Language-specific voice preferences
        const languagePreferences = {
            'en': ['Samantha', 'Alex', 'Google US English', 'Microsoft Zira', 'Google UK English Female'],
            'es': ['Google español', 'Microsoft Sabina', 'Paulina', 'Google español de Estados Unidos'],
            'fr': ['Google français', 'Microsoft Hortense', 'Thomas'],
            'de': ['Google Deutsch', 'Microsoft Hedda', 'Anna']
        };

        const preferredNames = languagePreferences[languageCode] || [];
        
        // First, try to find preferred voices by name
        for (const preferredName of preferredNames) {
            const voice = voices.find(v => 
                v.name.includes(preferredName) && 
                v.lang.startsWith(languageCode)
            );
            if (voice) {
                console.log(`Selected preferred voice: ${voice.name}`);
                return voice;
            }
        }

        // Then try priority-based selection
        for (const priority of voicePriorities) {
            const voice = voices.find(v => 
                v.lang.startsWith(languageCode) && priority(v)
            );
            if (voice) {
                console.log(`Selected priority voice: ${voice.name}`);
                return voice;
            }
        }

        // Fallback to first available voice in language
        const fallbackVoice = voices.find(v => v.lang.startsWith(languageCode));
        if (fallbackVoice) {
            console.log(`Selected fallback voice: ${fallbackVoice.name}`);
        }
        
        return fallbackVoice || null;
    }

    /**
     * Enhance text for more natural speech
     * @param {string} text - Original text
     * @returns {string} Enhanced text with natural pauses and emphasis
     */
    enhanceTextForSpeech(text) {
        let enhanced = text;

        // Add natural pauses after punctuation
        enhanced = enhanced.replace(/\./g, '. ');
        enhanced = enhanced.replace(/,/g, ', ');
        enhanced = enhanced.replace(/;/g, '; ');
        enhanced = enhanced.replace(/:/g, ': ');

        // Add pauses for better flow
        enhanced = enhanced.replace(/\b(however|therefore|additionally|furthermore|meanwhile)\b/gi, 
            (match) => `, ${match},`);

        // Improve number pronunciation
        enhanced = enhanced.replace(/\b(\d{1,3})-(\d{3})-(\d{4})\b/g, 
            (match, area, exchange, number) => `${area}, ${exchange}, ${number}`);

        // Add natural breathing pauses for long sentences
        if (enhanced.length > 100) {
            enhanced = enhanced.replace(/(\w+),\s+(\w+)/g, '$1, $2');
        }

        return enhanced;
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

    /**
     * Get available voices with quality ratings
     * @returns {Array} Array of voice objects with quality ratings
     */
    getAvailableVoicesWithQuality() {
        const voices = this.synthesis.getVoices();
        
        return voices.map(voice => {
            let quality = 'standard';
            let naturalness = 3; // 1-5 scale
            
            // Rate voice quality based on name and characteristics
            if (voice.name.includes('Neural') || voice.name.includes('Premium')) {
                quality = 'premium';
                naturalness = 5;
            } else if (voice.name.includes('Google') && voice.name.includes('Standard')) {
                quality = 'high';
                naturalness = 4;
            } else if (voice.name.includes('Apple') || voice.name.includes('Samantha') || voice.name.includes('Alex')) {
                quality = 'high';
                naturalness = 4;
            } else if (voice.name.includes('Google')) {
                quality = 'good';
                naturalness = 3;
            } else if (voice.name.includes('Microsoft') && voice.name.includes('Online')) {
                quality = 'good';
                naturalness = 3;
            }

            return {
                voice,
                quality,
                naturalness,
                name: voice.name,
                language: voice.lang,
                isLocal: voice.localService,
                isDefault: voice.default
            };
        }).sort((a, b) => b.naturalness - a.naturalness);
    }

    /**
     * Test voice quality and provide feedback
     * @param {string} language - Language to test
     */
    testVoiceQuality(language = 'en-US') {
        const testText = language.startsWith('es') ? 
            "Hola, soy un asistente de Comcast. ¿En qué puedo ayudarle hoy?" :
            "Hello, this is a Comcast assistant. How can I help you today?";
        
        const voices = this.getAvailableVoicesWithQuality()
            .filter(v => v.language.startsWith(language.split('-')[0]))
            .slice(0, 3); // Test top 3 voices

        console.log(`Testing ${voices.length} voices for ${language}:`);
        
        voices.forEach((voiceInfo, index) => {
            setTimeout(() => {
                console.log(`Testing voice ${index + 1}: ${voiceInfo.name} (Quality: ${voiceInfo.quality})`);
                
                const utterance = new SpeechSynthesisUtterance(testText);
                utterance.voice = voiceInfo.voice;
                utterance.rate = 0.85;
                utterance.pitch = 0.95;
                
                this.synthesis.speak(utterance);
            }, index * 3000); // 3 second delay between tests
        });
    }
}