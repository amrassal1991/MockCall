import { SpeechService } from '../src/speechService.js';

describe('SpeechService', () => {
    let speechService;
    let mockIsRecognizing;
    let mockSetRecognitionState;
    let mockOnResult;
    let mockOnError;
    let mockGetTimeout;

    beforeEach(() => {
        mockIsRecognizing = jest.fn(() => false);
        mockSetRecognitionState = jest.fn();
        mockOnResult = jest.fn();
        mockOnError = jest.fn();
        mockGetTimeout = jest.fn(() => 5000);

        speechService = new SpeechService(
            mockIsRecognizing,
            mockSetRecognitionState,
            mockOnResult,
            mockOnError,
            mockGetTimeout
        );

        // Reset speech synthesis mock
        global.speechSynthesis.speak.mockClear();
        global.speechSynthesis.cancel.mockClear();
    });

    describe('Constructor', () => {
        test('should initialize with provided callbacks', () => {
            expect(speechService.isRecognizingGetter).toBe(mockIsRecognizing);
            expect(speechService.setRecognitionState).toBe(mockSetRecognitionState);
            expect(speechService.onResult).toBe(mockOnResult);
            expect(speechService.onError).toBe(mockOnError);
            expect(speechService.getTimeoutValue).toBe(mockGetTimeout);
        });

        test('should check browser support', () => {
            expect(speechService.isSupported).toBe(true);
        });

        test('should initialize synthesis reference', () => {
            expect(speechService.synthesis).toBeDefined();
        });
    });

    describe('checkSupport', () => {
        test('should return true when both APIs are supported', () => {
            const support = speechService.checkSupport();
            expect(support).toBe(true);
        });

        test('should return false when speech recognition is not supported', () => {
            const originalSpeechRecognition = global.SpeechRecognition;
            const originalWebkitSpeechRecognition = global.webkitSpeechRecognition;
            
            delete global.SpeechRecognition;
            delete global.webkitSpeechRecognition;
            
            const service = new SpeechService(mockIsRecognizing, mockSetRecognitionState, mockOnResult, mockOnError, mockGetTimeout);
            expect(service.checkSupport()).toBe(false);
            
            // Restore
            global.SpeechRecognition = originalSpeechRecognition;
            global.webkitSpeechRecognition = originalWebkitSpeechRecognition;
        });
    });

    describe('initRecognition', () => {
        test('should initialize recognition with default language', () => {
            speechService.initRecognition();
            
            expect(speechService.recognition).toBeDefined();
            expect(speechService.recognition.lang).toBe('en-US');
            expect(speechService.recognition.continuous).toBe(true);
            expect(speechService.recognition.interimResults).toBe(true);
        });

        test('should initialize recognition with specified language', () => {
            speechService.initRecognition('es-ES');
            
            expect(speechService.recognition.lang).toBe('es-ES');
        });

        test('should handle unsupported browser', () => {
            const unsupportedService = new SpeechService(
                mockIsRecognizing,
                mockSetRecognitionState,
                mockOnResult,
                mockOnError,
                mockGetTimeout
            );
            unsupportedService.isSupported = false;
            
            unsupportedService.initRecognition();
            
            expect(mockOnError).toHaveBeenCalledWith('Speech recognition not supported in this browser');
        });
    });

    describe('toggleRecognition', () => {
        test('should start recognition when not recognizing', () => {
            mockIsRecognizing.mockReturnValue(false);
            speechService.startRecognition = jest.fn();
            
            speechService.toggleRecognition('en-US');
            
            expect(speechService.startRecognition).toHaveBeenCalledWith('en-US');
        });

        test('should stop recognition when recognizing', () => {
            mockIsRecognizing.mockReturnValue(true);
            speechService.stopRecognition = jest.fn();
            
            speechService.toggleRecognition();
            
            expect(speechService.stopRecognition).toHaveBeenCalled();
        });

        test('should handle unsupported browser', () => {
            speechService.isSupported = false;
            
            speechService.toggleRecognition();
            
            expect(mockOnError).toHaveBeenCalledWith('Speech recognition not supported');
        });
    });

    describe('startRecognition', () => {
        test('should initialize and start recognition', () => {
            speechService.initRecognition = jest.fn();
            speechService.recognition = {
                start: jest.fn(),
                lang: 'en-US'
            };
            
            speechService.startRecognition('en-US');
            
            expect(speechService.recognition.start).toHaveBeenCalled();
        });

        test('should reinitialize if language changed', () => {
            speechService.initRecognition = jest.fn();
            speechService.recognition = {
                start: jest.fn(),
                lang: 'en-US'
            };
            
            speechService.startRecognition('es-ES');
            
            expect(speechService.initRecognition).toHaveBeenCalledWith('es-ES');
        });

        test('should handle start errors', () => {
            speechService.recognition = {
                start: jest.fn(() => { throw new Error('Start failed'); }),
                lang: 'en-US'
            };
            
            speechService.startRecognition();
            
            expect(mockOnError).toHaveBeenCalledWith('Failed to start recognition: Start failed');
        });
    });

    describe('stopRecognition', () => {
        test('should stop recognition and clear timer', () => {
            speechService.recognition = {
                stop: jest.fn()
            };
            speechService.clearSilenceTimer = jest.fn();
            
            speechService.stopRecognition();
            
            expect(speechService.recognition.stop).toHaveBeenCalled();
            expect(speechService.clearSilenceTimer).toHaveBeenCalled();
        });

        test('should handle missing recognition object', () => {
            speechService.recognition = null;
            speechService.clearSilenceTimer = jest.fn();
            
            expect(() => speechService.stopRecognition()).not.toThrow();
            expect(speechService.clearSilenceTimer).toHaveBeenCalled();
        });
    });

    describe('Silence Timer', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should start silence timer with correct timeout', () => {
            mockGetTimeout.mockReturnValue(3000);
            
            speechService.startSilenceTimer();
            
            expect(speechService.silenceTimer).toBeDefined();
        });

        test('should trigger timeout when silence timer expires', () => {
            mockIsRecognizing.mockReturnValue(true);
            speechService.stopRecognition = jest.fn();
            
            speechService.startSilenceTimer();
            
            jest.advanceTimersByTime(5000);
            
            expect(speechService.stopRecognition).toHaveBeenCalled();
            expect(mockOnResult).toHaveBeenCalledWith('');
        });

        test('should clear existing timer when starting new one', () => {
            speechService.startSilenceTimer();
            const firstTimer = speechService.silenceTimer;
            
            speechService.startSilenceTimer();
            
            expect(speechService.silenceTimer).not.toBe(firstTimer);
        });

        test('should clear timer properly', () => {
            speechService.startSilenceTimer();
            
            speechService.clearSilenceTimer();
            
            expect(speechService.silenceTimer).toBeNull();
        });
    });

    describe('Text-to-Speech', () => {
        test('should speak text with default parameters', () => {
            const text = 'Hello world';
            
            speechService.speak(text);
            
            expect(global.speechSynthesis.cancel).toHaveBeenCalled();
            expect(global.speechSynthesis.speak).toHaveBeenCalled();
        });

        test('should speak text with specified language', () => {
            const text = 'Hola mundo';
            
            speechService.speak(text, 'es-ES');
            
            expect(global.speechSynthesis.speak).toHaveBeenCalled();
        });

        test('should call onEnd callback when provided', () => {
            const onEnd = jest.fn();
            
            speechService.speak('test', 'en-US', onEnd);
            
            // Simulate utterance end
            const utteranceCall = global.speechSynthesis.speak.mock.calls[0][0];
            if (utteranceCall.onend) {
                utteranceCall.onend();
            }
            
            expect(onEnd).toHaveBeenCalled();
        });

        test('should handle unsupported browser gracefully', () => {
            speechService.isSupported = false;
            const onEnd = jest.fn();
            
            speechService.speak('test', 'en-US', onEnd);
            
            expect(onEnd).toHaveBeenCalled();
            expect(global.speechSynthesis.speak).not.toHaveBeenCalled();
        });
    });

    describe('stopSpeaking', () => {
        test('should cancel current speech', () => {
            speechService.stopSpeaking();
            
            expect(global.speechSynthesis.cancel).toHaveBeenCalled();
        });

        test('should handle missing synthesis object', () => {
            speechService.synthesis = null;
            
            expect(() => speechService.stopSpeaking()).not.toThrow();
        });
    });

    describe('isSpeaking', () => {
        test('should return true when speaking', () => {
            global.speechSynthesis.speaking = true;
            
            expect(speechService.isSpeaking()).toBe(true);
        });

        test('should return false when not speaking', () => {
            global.speechSynthesis.speaking = false;
            
            expect(speechService.isSpeaking()).toBe(false);
        });

        test('should handle missing synthesis object', () => {
            speechService.synthesis = null;
            
            expect(speechService.isSpeaking()).toBe(false);
        });
    });

    describe('getVoicesForLanguage', () => {
        test('should return voices for specified language', () => {
            const voices = speechService.getVoicesForLanguage('en-US');
            
            expect(Array.isArray(voices)).toBe(true);
            expect(voices.length).toBeGreaterThan(0);
            expect(voices[0].lang).toContain('en');
        });

        test('should return Spanish voices for Spanish language', () => {
            const voices = speechService.getVoicesForLanguage('es-ES');
            
            expect(Array.isArray(voices)).toBe(true);
            voices.forEach(voice => {
                expect(voice.lang).toContain('es');
            });
        });

        test('should handle language codes with region', () => {
            const voices = speechService.getVoicesForLanguage('en-GB');
            
            expect(Array.isArray(voices)).toBe(true);
        });
    });
});