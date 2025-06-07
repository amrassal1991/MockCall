import { getRandomScenario, filterByCustomerType } from '../src/complaints.js';
import { processVoiceCommand, generatePersonaPrompt, validateMessage, formatMessage } from '../src/messageHandler.js';
import { analyzeMessageQuality, generateQualityInsights, getScoreWithIndicator } from '../src/qualityScoring.js';
import { SpeechService } from '../src/speechService.js';

describe('Integration Tests', () => {
    describe('Complete Call Simulation Flow', () => {
        test('should handle complete English call simulation', () => {
            // 1. Get a random scenario
            const scenario = getRandomScenario('Inquiry', 'Any');
            expect(scenario).toBeDefined();
            expect(scenario.initialComplaint['en-US']).toBeDefined();
            
            // 2. Generate persona prompt
            const persona = generatePersonaPrompt(
                scenario.customerName, 
                scenario.initialComplaint['en-US'], 
                'en-US'
            );
            expect(persona).toContain(scenario.customerName);
            expect(persona).toContain('You are a customer');
            
            // 3. Process agent messages and analyze quality
            const agentMessages = [
                "Hello, this is John from Comcast. How can I help you today?",
                "I understand your concern. Let me look into this for you.",
                "I can resolve this issue by updating your account settings."
            ];
            
            const qualityScores = [];
            agentMessages.forEach(message => {
                // Validate message
                const validation = validateMessage(message);
                expect(validation.isValid).toBe(true);
                
                // Format message
                const formatted = formatMessage(message, 'agent');
                expect(formatted.sender).toBe('agent');
                expect(formatted.text).toBe(message);
                
                // Analyze quality
                const quality = analyzeMessageQuality(message);
                expect(quality.score).toBeGreaterThanOrEqual(0);
                qualityScores.push(quality);
            });
            
            // 4. Generate insights
            const insights = generateQualityInsights(qualityScores);
            expect(insights.averageScore).toBeGreaterThan(0);
            expect(insights.recommendations).toBeDefined();
            expect(Array.isArray(insights.recommendations)).toBe(true);
        });

        test('should handle complete Spanish call simulation', () => {
            // 1. Get a Spanish-compatible scenario
            const scenario = getRandomScenario('Frustrated', 'Any');
            expect(scenario.initialComplaint['es-ES']).toBeDefined();
            
            // 2. Generate Spanish persona prompt
            const persona = generatePersonaPrompt(
                scenario.customerName, 
                scenario.initialComplaint['es-ES'], 
                'es-ES'
            );
            expect(persona).toContain(scenario.customerName);
            expect(persona).toContain('Eres un cliente de habla hispana');
            
            // 3. Process Spanish agent messages
            const spanishMessages = [
                "Hola, soy María de Comcast. ¿En qué puedo ayudarle?",
                "Entiendo su frustración. Permítame revisar su cuenta.",
                "Puedo resolver este problema actualizando su configuración."
            ];
            
            spanishMessages.forEach(message => {
                const validation = validateMessage(message);
                expect(validation.isValid).toBe(true);
                
                const formatted = formatMessage(message, 'agent');
                expect(formatted.text).toBe(message);
                
                const quality = analyzeMessageQuality(message);
                expect(quality.score).toBeGreaterThanOrEqual(0);
            });
        });
    });

    describe('Voice Command Integration', () => {
        test('should process voice commands and validate results', () => {
            const voiceInputs = [
                "Hello, I need help with my internet send",
                "Can you check my account please enviar",
                "clear",
                "nueva llamada"
            ];
            
            voiceInputs.forEach(input => {
                const command = processVoiceCommand(input);
                expect(command).toHaveProperty('action');
                expect(command).toHaveProperty('message');
                expect(command).toHaveProperty('isCommand');
                
                if (command.action === 'send') {
                    // Validate the extracted message
                    const validation = validateMessage(command.message);
                    expect(validation.isValid).toBe(true);
                    
                    // Analyze quality of the message
                    const quality = analyzeMessageQuality(command.message);
                    expect(quality).toHaveProperty('score');
                    expect(quality).toHaveProperty('strengths');
                }
            });
        });
    });

    describe('Quality Scoring Integration', () => {
        test('should provide consistent scoring across conversation', () => {
            const conversation = [
                { message: "Hello from Comcast", context: "greeting" },
                { message: "I understand your problem", context: "empathy" },
                { message: "What specific issues are you experiencing?", context: "probing" },
                { message: "Let me resolve this for you", context: "solution" },
                { message: "Is there anything else I can help with?", context: "closing" }
            ];
            
            const scores = conversation.map(turn => {
                const quality = analyzeMessageQuality(turn.message, turn.context);
                const indicator = getScoreWithIndicator(quality.score, quality.maxScore);
                
                return {
                    ...quality,
                    indicator,
                    context: turn.context
                };
            });
            
            // Verify all scores are valid
            scores.forEach(score => {
                expect(score.score).toBeGreaterThanOrEqual(0);
                expect(score.score).toBeLessThanOrEqual(score.maxScore);
                expect(score.indicator.percentage).toBeGreaterThanOrEqual(0);
                expect(score.indicator.percentage).toBeLessThanOrEqual(100);
            });
            
            // Generate insights for the conversation
            const insights = generateQualityInsights(scores);
            expect(insights.averageScore).toBeGreaterThan(0);
            expect(insights.overallTrend).toMatch(/improving|declining|stable/);
        });
    });

    describe('Speech Service Integration', () => {
        test('should initialize speech service with proper callbacks', () => {
            const mockCallbacks = {
                isRecognizing: jest.fn(() => false),
                setRecognitionState: jest.fn(),
                onResult: jest.fn(),
                onError: jest.fn(),
                getTimeout: jest.fn(() => 5000)
            };
            
            const speechService = new SpeechService(
                mockCallbacks.isRecognizing,
                mockCallbacks.setRecognitionState,
                mockCallbacks.onResult,
                mockCallbacks.onError,
                mockCallbacks.getTimeout
            );
            
            expect(speechService.isSupported).toBe(true);
            expect(speechService.checkSupport()).toBe(true);
            
            // Test language switching
            speechService.initRecognition('en-US');
            expect(speechService.recognition).toBeDefined();
            expect(speechService.recognition.lang).toBe('en-US');
            
            speechService.initRecognition('es-ES');
            expect(speechService.recognition.lang).toBe('es-ES');
        });

        test('should handle speech synthesis with different languages', () => {
            const speechService = new SpeechService(
                () => false, () => {}, () => {}, () => {}, () => 5000
            );
            
            const testTexts = [
                { text: "Hello, how can I help you?", lang: "en-US" },
                { text: "Hola, ¿en qué puedo ayudarle?", lang: "es-ES" }
            ];
            
            testTexts.forEach(({ text, lang }) => {
                expect(() => speechService.speak(text, lang)).not.toThrow();
            });
            
            expect(global.speechSynthesis.speak).toHaveBeenCalled();
        });
    });

    describe('Scenario Filtering Integration', () => {
        test('should filter scenarios and generate appropriate personas', () => {
            const customerTypes = ['Inquiry', 'Frustrated', 'Rude'];
            const languages = ['en-US', 'es-ES'];
            
            customerTypes.forEach(customerType => {
                const scenarios = filterByCustomerType(customerType);
                expect(scenarios.length).toBeGreaterThan(0);
                
                scenarios.forEach(scenario => {
                    expect(scenario.customerType).toBe(customerType);
                    
                    languages.forEach(lang => {
                        const persona = generatePersonaPrompt(
                            scenario.customerName,
                            scenario.initialComplaint[lang],
                            lang
                        );
                        
                        expect(persona).toContain(scenario.customerName);
                        expect(persona.length).toBeGreaterThan(50); // Substantial prompt
                    });
                });
            });
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle invalid inputs gracefully across modules', () => {
            // Test invalid message validation
            const invalidMessages = [null, undefined, '', '   ', 123, {}];
            
            invalidMessages.forEach(invalid => {
                const validation = validateMessage(invalid);
                expect(validation.isValid).toBe(false);
                expect(validation.errors.length).toBeGreaterThan(0);
            });
            
            // Test quality analysis with invalid inputs
            const qualityResult = analyzeMessageQuality('');
            expect(qualityResult.score).toBe(0);
            expect(qualityResult.improvements.length).toBeGreaterThan(0);
            
            // Test insights with empty data
            const insights = generateQualityInsights([]);
            expect(insights.overallTrend).toBe('No data available');
            expect(insights.averageScore).toBe(0);
        });
    });

    describe('Performance and Consistency', () => {
        test('should maintain consistent performance across multiple calls', () => {
            const iterations = 50;
            const results = [];
            
            for (let i = 0; i < iterations; i++) {
                const scenario = getRandomScenario();
                const persona = generatePersonaPrompt(
                    scenario.customerName,
                    scenario.initialComplaint['en-US'],
                    'en-US'
                );
                const quality = analyzeMessageQuality("Hello, how can I help you?");
                
                results.push({
                    scenario: scenario.id,
                    personaLength: persona.length,
                    qualityScore: quality.score
                });
            }
            
            // Verify we get variety in scenarios
            const uniqueScenarios = new Set(results.map(r => r.scenario));
            expect(uniqueScenarios.size).toBeGreaterThan(1);
            
            // Verify consistent persona generation
            results.forEach(result => {
                expect(result.personaLength).toBeGreaterThan(50);
                expect(result.qualityScore).toBeGreaterThanOrEqual(0);
            });
        });
    });
});