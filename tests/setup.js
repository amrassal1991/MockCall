// Test setup file
// Mock browser APIs that are not available in Jest environment

// Mock Speech Recognition
global.SpeechRecognition = class MockSpeechRecognition {
    constructor() {
        this.continuous = false;
        this.interimResults = false;
        this.lang = 'en-US';
        this.onstart = null;
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
    }
    
    start() {
        if (this.onstart) this.onstart();
    }
    
    stop() {
        if (this.onend) this.onend();
    }
};

global.webkitSpeechRecognition = global.SpeechRecognition;

// Mock Speech Synthesis
global.SpeechSynthesisUtterance = class MockSpeechSynthesisUtterance {
    constructor(text) {
        this.text = text;
        this.lang = 'en-US';
        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;
        this.onend = null;
    }
};

global.speechSynthesis = {
    speak: jest.fn(),
    cancel: jest.fn(),
    speaking: false,
    getVoices: jest.fn(() => [
        { lang: 'en-US', name: 'English US' },
        { lang: 'es-ES', name: 'Spanish Spain' }
    ])
};

// Mock window object
Object.defineProperty(window, 'speechSynthesis', {
    value: global.speechSynthesis,
    writable: true
});

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};