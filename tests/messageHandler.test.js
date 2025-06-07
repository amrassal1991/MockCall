import {
    processVoiceCommand,
    validateMessage,
    formatMessage,
    generateMessageId,
    generatePersonaPrompt,
    isTimeoutMessage,
    generateTimeoutMessage,
    sanitizeMessage,
    isUrgentMessage,
    extractMessageInfo
} from '../src/messageHandler.js';

describe('Message Handler', () => {
    describe('processVoiceCommand', () => {
        test('should detect send command in English', () => {
            const result = processVoiceCommand('Hello, how are you send');
            
            expect(result.action).toBe('send');
            expect(result.message).toBe('Hello, how are you');
            expect(result.isCommand).toBe(true);
        });

        test('should detect send command in Spanish', () => {
            const result = processVoiceCommand('Hola, ¿cómo estás? enviar');
            
            expect(result.action).toBe('send');
            expect(result.message).toBe('Hola, ¿cómo estás?');
            expect(result.isCommand).toBe(true);
        });

        test('should detect clear command in English', () => {
            const result = processVoiceCommand('clear');
            
            expect(result.action).toBe('clear');
            expect(result.message).toBe('');
            expect(result.isCommand).toBe(true);
        });

        test('should detect clear command in Spanish', () => {
            const result = processVoiceCommand('limpiar');
            
            expect(result.action).toBe('clear');
            expect(result.message).toBe('');
            expect(result.isCommand).toBe(true);
        });

        test('should detect new call command in English', () => {
            const result = processVoiceCommand('new call');
            
            expect(result.action).toBe('newCall');
            expect(result.message).toBe('');
            expect(result.isCommand).toBe(true);
        });

        test('should detect new call command in Spanish', () => {
            const result = processVoiceCommand('nueva llamada');
            
            expect(result.action).toBe('newCall');
            expect(result.message).toBe('');
            expect(result.isCommand).toBe(true);
        });

        test('should handle regular text input', () => {
            const result = processVoiceCommand('This is just regular text');
            
            expect(result.action).toBe('input');
            expect(result.message).toBe('This is just regular text');
            expect(result.isCommand).toBe(false);
        });

        test('should handle case insensitive commands', () => {
            const result = processVoiceCommand('CLEAR');
            
            expect(result.action).toBe('clear');
            expect(result.isCommand).toBe(true);
        });

        test('should handle mixed case send commands', () => {
            const result = processVoiceCommand('Hello world SEND');
            
            expect(result.action).toBe('send');
            expect(result.message).toBe('Hello world');
        });
    });

    describe('validateMessage', () => {
        test('should validate correct message', () => {
            const result = validateMessage('Hello, this is a valid message');
            
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should reject null message', () => {
            const result = validateMessage(null);
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Message must be a non-empty string');
        });

        test('should reject undefined message', () => {
            const result = validateMessage(undefined);
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Message must be a non-empty string');
        });

        test('should reject non-string message', () => {
            const result = validateMessage(123);
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Message must be a non-empty string');
        });

        test('should reject empty string', () => {
            const result = validateMessage('');
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Message cannot be empty');
        });

        test('should reject whitespace-only string', () => {
            const result = validateMessage('   ');
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Message cannot be empty');
        });

        test('should warn about very long messages', () => {
            const longMessage = 'a'.repeat(1001);
            const result = validateMessage(longMessage);
            
            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain('Message is very long and may be truncated');
        });

        test('should warn about unprofessional language', () => {
            const result = validateMessage('This is fucking stupid');
            
            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain('Message contains potentially unprofessional language');
        });

        test('should detect multiple issues', () => {
            const longProfaneMessage = 'This is fucking stupid '.repeat(50);
            const result = validateMessage(longProfaneMessage);
            
            expect(result.warnings.length).toBeGreaterThan(1);
        });
    });

    describe('formatMessage', () => {
        test('should format message with all properties', () => {
            const message = formatMessage('Hello world', 'agent', '2023-01-01T00:00:00Z');
            
            expect(message).toHaveProperty('id');
            expect(message).toHaveProperty('text');
            expect(message).toHaveProperty('sender');
            expect(message).toHaveProperty('timestamp');
            expect(message).toHaveProperty('formatted');
            
            expect(message.text).toBe('Hello world');
            expect(message.sender).toBe('agent');
            expect(message.timestamp).toBe('2023-01-01T00:00:00Z');
            expect(message.formatted).toBe(true);
        });

        test('should generate timestamp when not provided', () => {
            const message = formatMessage('Hello', 'customer');
            
            expect(message.timestamp).toBeDefined();
            expect(new Date(message.timestamp)).toBeInstanceOf(Date);
        });

        test('should trim message text', () => {
            const message = formatMessage('  Hello world  ', 'agent');
            
            expect(message.text).toBe('Hello world');
        });

        test('should generate unique ID', () => {
            const message1 = formatMessage('Hello', 'agent');
            const message2 = formatMessage('World', 'customer');
            
            expect(message1.id).not.toBe(message2.id);
        });
    });

    describe('generateMessageId', () => {
        test('should generate unique IDs', () => {
            const id1 = generateMessageId();
            const id2 = generateMessageId();
            
            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(typeof id2).toBe('string');
        });

        test('should start with msg_ prefix', () => {
            const id = generateMessageId();
            
            expect(id).toMatch(/^msg_/);
        });

        test('should contain timestamp and random component', () => {
            const id = generateMessageId();
            const parts = id.split('_');
            
            expect(parts).toHaveLength(3);
            expect(parts[0]).toBe('msg');
            expect(parseInt(parts[1])).toBeGreaterThan(0);
            expect(parts[2]).toMatch(/^[a-z0-9]+$/);
        });
    });

    describe('generatePersonaPrompt', () => {
        test('should generate English persona prompt', () => {
            const prompt = generatePersonaPrompt('John Doe', 'Internet is down', 'en-US');
            
            expect(prompt).toContain('John Doe');
            expect(prompt).toContain('Internet is down');
            expect(prompt).toContain('You are a customer');
            expect(prompt).toContain('frustrated but trying to be polite');
        });

        test('should generate Spanish persona prompt', () => {
            const prompt = generatePersonaPrompt('María García', 'El internet no funciona', 'es-ES');
            
            expect(prompt).toContain('María García');
            expect(prompt).toContain('El internet no funciona');
            expect(prompt).toContain('Eres un cliente de habla hispana');
            expect(prompt).toContain('frustrado pero intentas ser educado');
        });

        test('should default to English for unknown language', () => {
            const prompt = generatePersonaPrompt('John', 'Problem', 'fr-FR');
            
            expect(prompt).toContain('You are a customer');
        });

        test('should handle empty inputs gracefully', () => {
            const prompt = generatePersonaPrompt('', '', 'en-US');
            
            expect(typeof prompt).toBe('string');
            expect(prompt.length).toBeGreaterThan(0);
        });
    });

    describe('isTimeoutMessage', () => {
        test('should detect empty message as timeout', () => {
            expect(isTimeoutMessage('')).toBe(true);
        });

        test('should detect null as timeout', () => {
            expect(isTimeoutMessage(null)).toBe(true);
        });

        test('should detect undefined as timeout', () => {
            expect(isTimeoutMessage(undefined)).toBe(true);
        });

        test('should detect whitespace-only as timeout', () => {
            expect(isTimeoutMessage('   ')).toBe(true);
        });

        test('should not detect valid message as timeout', () => {
            expect(isTimeoutMessage('Hello world')).toBe(false);
        });
    });

    describe('generateTimeoutMessage', () => {
        test('should generate English timeout message', () => {
            const message = generateTimeoutMessage('en-US');
            
            expect(message).toContain('Timeout reached');
            expect(message).toContain('sent automatically');
        });

        test('should generate Spanish timeout message', () => {
            const message = generateTimeoutMessage('es-ES');
            
            expect(message).toContain('Se agotó el tiempo');
            expect(message).toContain('automáticamente');
        });

        test('should default to English', () => {
            const message = generateTimeoutMessage();
            
            expect(message).toContain('Timeout reached');
        });
    });

    describe('sanitizeMessage', () => {
        test('should trim whitespace', () => {
            const result = sanitizeMessage('  Hello world  ');
            
            expect(result).toBe('Hello world');
        });

        test('should replace multiple spaces with single space', () => {
            const result = sanitizeMessage('Hello    world');
            
            expect(result).toBe('Hello world');
        });

        test('should remove potential HTML tags', () => {
            const result = sanitizeMessage('Hello <script>alert("xss")</script> world');
            
            expect(result).toBe('Hello scriptalert("xss")/script world');
        });

        test('should limit message length', () => {
            const longMessage = 'a'.repeat(1500);
            const result = sanitizeMessage(longMessage);
            
            expect(result.length).toBe(1000);
        });

        test('should handle null input', () => {
            const result = sanitizeMessage(null);
            
            expect(result).toBe('');
        });

        test('should handle undefined input', () => {
            const result = sanitizeMessage(undefined);
            
            expect(result).toBe('');
        });

        test('should handle non-string input', () => {
            const result = sanitizeMessage(123);
            
            expect(result).toBe('');
        });
    });

    describe('isUrgentMessage', () => {
        test('should detect urgent English keywords', () => {
            expect(isUrgentMessage('This is an emergency!')).toBe(true);
            expect(isUrgentMessage('I need help urgently')).toBe(true);
            expect(isUrgentMessage('Please respond immediately')).toBe(true);
            expect(isUrgentMessage('I need this now')).toBe(true);
            expect(isUrgentMessage('ASAP please')).toBe(true);
        });

        test('should detect urgent Spanish keywords', () => {
            expect(isUrgentMessage('Es una emergencia')).toBe(true);
            expect(isUrgentMessage('Es urgente')).toBe(true);
            expect(isUrgentMessage('Inmediatamente por favor')).toBe(true);
            expect(isUrgentMessage('Lo necesito ahora')).toBe(true);
        });

        test('should not detect non-urgent messages', () => {
            expect(isUrgentMessage('Hello, how are you?')).toBe(false);
            expect(isUrgentMessage('Thank you for your help')).toBe(false);
            expect(isUrgentMessage('I have a question')).toBe(false);
        });

        test('should be case insensitive', () => {
            expect(isUrgentMessage('EMERGENCY')).toBe(true);
            expect(isUrgentMessage('Emergency')).toBe(true);
            expect(isUrgentMessage('emergency')).toBe(true);
        });
    });

    describe('extractMessageInfo', () => {
        test('should detect questions', () => {
            const info = extractMessageInfo('How can you help me?');
            
            expect(info.hasQuestion).toBe(true);
        });

        test('should detect complaints', () => {
            const info = extractMessageInfo('I have a problem with my service');
            
            expect(info.hasComplaint).toBe(true);
        });

        test('should detect requests', () => {
            const info = extractMessageInfo('Can you please help me?');
            
            expect(info.hasRequest).toBe(true);
        });

        test('should analyze positive sentiment', () => {
            const info = extractMessageInfo('Thank you, that was great!');
            
            expect(info.sentiment).toBe('positive');
        });

        test('should analyze negative sentiment', () => {
            const info = extractMessageInfo('This is terrible and I hate it');
            
            expect(info.sentiment).toBe('negative');
        });

        test('should default to neutral sentiment', () => {
            const info = extractMessageInfo('I need to check my account');
            
            expect(info.sentiment).toBe('neutral');
        });

        test('should detect Spanish complaint words', () => {
            const info = extractMessageInfo('Tengo un problema con mi servicio');
            
            expect(info.hasComplaint).toBe(true);
        });

        test('should detect Spanish request words', () => {
            const info = extractMessageInfo('Por favor, puedes ayudarme?');
            
            expect(info.hasRequest).toBe(true);
        });

        test('should handle empty messages', () => {
            const info = extractMessageInfo('');
            
            expect(info.hasQuestion).toBe(false);
            expect(info.hasComplaint).toBe(false);
            expect(info.hasRequest).toBe(false);
            expect(info.sentiment).toBe('neutral');
        });

        test('should return complete info object', () => {
            const info = extractMessageInfo('Hello world');
            
            expect(info).toHaveProperty('hasQuestion');
            expect(info).toHaveProperty('hasComplaint');
            expect(info).toHaveProperty('hasRequest');
            expect(info).toHaveProperty('sentiment');
            expect(info).toHaveProperty('keywords');
            expect(Array.isArray(info.keywords)).toBe(true);
        });
    });
});