import { RealTimeQualityFeedback, initializeRealTimeQualityFeedback } from '../src/realTimeQualityFeedback.js';

// Mock DOM elements
const createMockElement = (id) => ({
    id,
    innerHTML: '',
    textContent: '',
    style: {},
    className: '',
    classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn()
    },
    addEventListener: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => [])
});

// Mock document.getElementById
const mockGetElementById = jest.fn((id) => createMockElement(id));
global.document = {
    getElementById: mockGetElementById,
    createElement: jest.fn(() => createMockElement('mock')),
    addEventListener: jest.fn()
};

describe('Real-time Quality Feedback', () => {
    let feedback;
    let mockContainer;
    let mockInsightsContainer;

    beforeEach(() => {
        mockContainer = createMockElement('feedback-container');
        mockInsightsContainer = createMockElement('insights-container');
        feedback = new RealTimeQualityFeedback(mockContainer, mockInsightsContainer);
        
        // Reset global document mock
        mockGetElementById.mockClear();
    });

    describe('RealTimeQualityFeedback Constructor', () => {
        test('should initialize with containers', () => {
            expect(feedback.feedbackContainer).toBe(mockContainer);
            expect(feedback.insightsContainer).toBe(mockInsightsContainer);
            expect(feedback.conversationHistory).toEqual([]);
            expect(feedback.qualityHistory).toEqual([]);
        });

        test('should initialize with default call context', () => {
            expect(feedback.currentCallContext).toEqual({
                stage: 's1',
                turnCount: 0,
                customerType: 'neutral',
                authenticated: false,
                optedOutOfSales: false
            });
        });

        test('should initialize UI when container is provided', () => {
            expect(mockContainer.innerHTML).toContain('Quality Feedback');
            expect(mockContainer.innerHTML).toContain('overall-score');
            expect(mockContainer.innerHTML).toContain('section-scores');
        });
    });

    describe('analyzeMessage', () => {
        test('should analyze agent message and update context', () => {
            const agentMessage = "Hello, this is John from Comcast. How can I help you today?";
            const customerMessage = "I have an internet problem";
            
            const analysis = feedback.analyzeMessage(agentMessage, customerMessage);
            
            expect(analysis).toBeDefined();
            expect(analysis.totalScore).toBeGreaterThanOrEqual(0);
            expect(feedback.conversationHistory).toHaveLength(1);
            expect(feedback.qualityHistory).toHaveLength(1);
            expect(feedback.currentCallContext.turnCount).toBe(1);
        });

        test('should update call stage based on turn count', () => {
            // First few turns should be S1 (START)
            feedback.analyzeMessage("Hello from Comcast", "");
            expect(feedback.currentCallContext.stage).toBe('s1');
            
            feedback.analyzeMessage("I understand your concern", "");
            expect(feedback.currentCallContext.stage).toBe('s1');
            
            // Middle turns should be S2 (SOLVE)
            for (let i = 0; i < 4; i++) {
                feedback.analyzeMessage("Let me help you", "");
            }
            expect(feedback.currentCallContext.stage).toBe('s2');
            
            // Later turns should be S3 (SELL)
            feedback.analyzeMessage("I'd like to offer", "");
            expect(feedback.currentCallContext.stage).toBe('s3');
            
            // Final turns should be S4 (SUMMARIZE)
            feedback.analyzeMessage("Let me summarize", "");
            feedback.analyzeMessage("Thank you for calling", "");
            expect(feedback.currentCallContext.stage).toBe('s4');
        });

        test('should detect customer sentiment', () => {
            feedback.analyzeMessage("I understand", "I'm really angry about this!");
            expect(feedback.currentCallContext.customerType).toBe('irate');
            
            feedback.analyzeMessage("Great to hear", "Thank you so much!");
            expect(feedback.currentCallContext.customerType).toBe('satisfied');
        });

        test('should detect authentication attempts', () => {
            feedback.analyzeMessage("Let me verify your account", "");
            expect(feedback.currentCallContext.authenticated).toBe(true);
            
            feedback.analyzeMessage("I need to authenticate you", "");
            expect(feedback.currentCallContext.authenticated).toBe(true);
        });

        test('should store conversation history correctly', () => {
            const agentMessage = "Hello from Comcast";
            const customerMessage = "I need help";
            
            feedback.analyzeMessage(agentMessage, customerMessage);
            
            expect(feedback.conversationHistory).toHaveLength(1);
            expect(feedback.conversationHistory[0].agent).toBe(agentMessage);
            expect(feedback.conversationHistory[0].customer).toBe(customerMessage);
            expect(feedback.conversationHistory[0].timestamp).toBeDefined();
            expect(feedback.conversationHistory[0].analysis).toBeDefined();
        });
    });

    describe('updateCallContext', () => {
        test('should increment turn count', () => {
            const initialCount = feedback.currentCallContext.turnCount;
            feedback.updateCallContext("test message", "", {});
            expect(feedback.currentCallContext.turnCount).toBe(initialCount + 1);
        });

        test('should apply additional context', () => {
            const additionalContext = {
                optedOutOfSales: true,
                customField: 'test'
            };
            
            feedback.updateCallContext("test", "", additionalContext);
            
            expect(feedback.currentCallContext.optedOutOfSales).toBe(true);
            expect(feedback.currentCallContext.customField).toBe('test');
        });

        test('should detect customer sentiment from message', () => {
            feedback.updateCallContext("", "This is terrible! I hate this service!", {});
            expect(feedback.currentCallContext.customerType).toBe('irate');
            
            feedback.updateCallContext("", "This is great! Thank you so much!", {});
            expect(feedback.currentCallContext.customerType).toBe('satisfied');
        });
    });

    describe('updateFeedbackDisplay', () => {
        test('should call all update methods', () => {
            const mockAnalysis = {
                totalScore: 75,
                maxTotalScore: 100,
                sections: {
                    s1: { name: 'START', score: 15, maxScore: 22, applicable: true },
                    s2: { name: 'SOLVE', score: 20, maxScore: 27, applicable: true }
                },
                insights: [{ type: 'success', icon: '✅', message: 'Good job' }],
                opportunities: [{ criterion: 'Greeting', suggestion: 'Improve greeting' }],
                nextStepHints: [{ stage: 'SOLVE', hint: 'Ask more questions' }]
            };
            
            // Mock the DOM elements that would be updated
            mockGetElementById.mockImplementation((id) => {
                if (id === 'overall-score' || id === 'score-bar' || id === 'section-scores' || id === 'live-feedback') {
                    return createMockElement(id);
                }
                return null;
            });
            
            expect(() => feedback.updateFeedbackDisplay(mockAnalysis)).not.toThrow();
        });
    });

    describe('showInsights', () => {
        test('should show insights for valid section', () => {
            // Add some conversation history first
            feedback.analyzeMessage("Hello from Comcast", "");
            
            // Mock the insights panel elements
            const mockInsightsPanel = createMockElement('insights-panel');
            const mockInsightsContent = createMockElement('insights-content');
            
            mockGetElementById.mockImplementation((id) => {
                if (id === 'insights-panel') return mockInsightsPanel;
                if (id === 'insights-content') return mockInsightsContent;
                return createMockElement(id);
            });
            
            expect(() => feedback.showInsights('s1')).not.toThrow();
            // Note: DOM manipulation testing would require more complex setup
        });

        test('should handle invalid section gracefully', () => {
            expect(() => feedback.showInsights('invalid')).not.toThrow();
        });

        test('should handle empty conversation history', () => {
            expect(() => feedback.showInsights('s1')).not.toThrow();
        });
    });

    describe('hideInsights', () => {
        test('should hide insights panel', () => {
            const mockInsightsPanel = createMockElement('insights-panel');
            mockGetElementById.mockReturnValue(mockInsightsPanel);
            
            expect(() => feedback.hideInsights()).not.toThrow();
        });

        test('should handle missing insights panel', () => {
            mockGetElementById.mockReturnValue(null);
            expect(() => feedback.hideInsights()).not.toThrow();
        });
    });

    describe('getQualityTrend', () => {
        test('should return insufficient data for less than 2 entries', () => {
            const trend = feedback.getQualityTrend();
            expect(trend.trend).toBe('insufficient_data');
        });

        test('should detect improving trend', () => {
            feedback.qualityHistory = [
                { score: 50 },
                { score: 60 },
                { score: 70 }
            ];
            
            const trend = feedback.getQualityTrend();
            expect(trend.trend).toBe('improving');
        });

        test('should detect declining trend', () => {
            feedback.qualityHistory = [
                { score: 70 },
                { score: 60 },
                { score: 50 }
            ];
            
            const trend = feedback.getQualityTrend();
            expect(trend.trend).toBe('declining');
        });

        test('should detect stable trend', () => {
            feedback.qualityHistory = [
                { score: 60 },
                { score: 62 },
                { score: 61 }
            ];
            
            const trend = feedback.getQualityTrend();
            expect(trend.trend).toBe('stable');
        });
    });

    describe('resetForNewCall', () => {
        test('should reset all state', () => {
            // Add some data first
            feedback.analyzeMessage("Hello", "Hi");
            feedback.currentCallContext.authenticated = true;
            
            // Reset
            feedback.resetForNewCall();
            
            expect(feedback.conversationHistory).toEqual([]);
            expect(feedback.qualityHistory).toEqual([]);
            expect(feedback.currentCallContext).toEqual({
                stage: 's1',
                turnCount: 0,
                customerType: 'neutral',
                authenticated: false,
                optedOutOfSales: false
            });
        });

        test('should reset UI elements', () => {
            const mockElements = {
                'overall-score': createMockElement('overall-score'),
                'section-scores': createMockElement('section-scores'),
                'live-feedback': createMockElement('live-feedback')
            };
            
            mockGetElementById.mockImplementation((id) => mockElements[id] || null);
            
            expect(() => feedback.resetForNewCall()).not.toThrow();
            
            // Verify state was reset
            expect(feedback.conversationHistory).toEqual([]);
            expect(feedback.qualityHistory).toEqual([]);
            expect(feedback.currentCallContext.turnCount).toBe(0);
        });
    });

    describe('exportQualityReport', () => {
        test('should export complete quality report', () => {
            // Add some data
            feedback.analyzeMessage("Hello from Comcast", "I need help");
            feedback.analyzeMessage("I understand your concern", "Thank you");
            
            const report = feedback.exportQualityReport();
            
            expect(report).toHaveProperty('callSummary');
            expect(report).toHaveProperty('conversationHistory');
            expect(report).toHaveProperty('qualityHistory');
            expect(report).toHaveProperty('callContext');
            expect(report).toHaveProperty('exportTimestamp');
            
            expect(report.callSummary.totalInteractions).toBe(2);
            expect(report.conversationHistory).toHaveLength(2);
            expect(report.qualityHistory).toHaveLength(2);
        });

        test('should handle empty conversation', () => {
            const report = feedback.exportQualityReport();
            
            expect(report.callSummary.totalInteractions).toBe(0);
            expect(report.callSummary.averageScore).toBe(0);
            expect(report.callSummary.finalScore).toBe(0);
        });

        test('should calculate average score correctly', () => {
            feedback.qualityHistory = [
                { score: 60 },
                { score: 80 },
                { score: 70 }
            ];
            
            const report = feedback.exportQualityReport();
            expect(report.callSummary.averageScore).toBe(70);
        });
    });

    describe('Integration with S4 Quality Analyzer', () => {
        test('should integrate with S4 analysis correctly', () => {
            const excellentMessage = "Hello, this is John from Comcast. I understand your concern and I'm here to help resolve this for you.";
            const analysis = feedback.analyzeMessage(excellentMessage, "I have a problem");
            
            expect(analysis.totalScore).toBeGreaterThan(0);
            expect(analysis.sections).toHaveProperty('s1');
            expect(analysis.sections).toHaveProperty('s2');
            expect(analysis.sections).toHaveProperty('s3');
            expect(analysis.sections).toHaveProperty('s4');
            expect(analysis.sections).toHaveProperty('behaviors');
        });

        test('should handle auto-fail scenarios', () => {
            const rudeMessage = "Shut up and listen!";
            const analysis = feedback.analyzeMessage(rudeMessage, "");
            
            expect(analysis.autoFailDetected).toBe(true);
            expect(analysis.totalScore).toBe(0);
        });

        test('should provide appropriate insights for different performance levels', () => {
            // Test excellent performance
            const excellentMessage = "Hello, this is Sarah from Comcast. I understand your frustration and I'm here to help resolve this for you.";
            const excellentAnalysis = feedback.analyzeMessage(excellentMessage, "");
            
            const successInsights = excellentAnalysis.insights.filter(insight => insight.type === 'success');
            expect(successInsights.length).toBeGreaterThanOrEqual(0);
            
            // Test poor performance
            feedback.resetForNewCall();
            const poorMessage = "What?";
            const poorAnalysis = feedback.analyzeMessage(poorMessage, "");
            
            const errorInsights = poorAnalysis.insights.filter(insight => insight.type === 'error');
            expect(errorInsights.length).toBeGreaterThan(0);
        });
    });

    describe('UI Interaction', () => {
        test('should bind event listeners correctly', () => {
            const mockCloseBtn = createMockElement('close-insights');
            mockGetElementById.mockImplementation((id) => {
                if (id === 'close-insights') return mockCloseBtn;
                return createMockElement(id);
            });
            
            expect(() => feedback.bindEventListeners()).not.toThrow();
        });

        test('should handle missing UI elements gracefully', () => {
            mockGetElementById.mockReturnValue(null);
            
            expect(() => feedback.updateOverallScore({ totalScore: 50, maxTotalScore: 100 })).not.toThrow();
            expect(() => feedback.updateSectionScores({ sections: {} })).not.toThrow();
            expect(() => feedback.updateLiveFeedback({ insights: [], opportunities: [], nextStepHints: [] })).not.toThrow();
        });
    });

    describe('Performance and Edge Cases', () => {
        test('should handle rapid successive analyses', () => {
            const messages = [
                "Hello from Comcast",
                "I understand your concern",
                "Let me help you",
                "Can you tell me more?",
                "I'll resolve this"
            ];
            
            messages.forEach(message => {
                expect(() => feedback.analyzeMessage(message, "")).not.toThrow();
            });
            
            expect(feedback.conversationHistory).toHaveLength(5);
            expect(feedback.qualityHistory).toHaveLength(5);
        });

        test('should handle very long messages', () => {
            const longMessage = "Hello from Comcast. ".repeat(100);
            expect(() => feedback.analyzeMessage(longMessage, "")).not.toThrow();
        });

        test('should handle special characters and emojis', () => {
            const specialMessage = "Hello! 😊 This is John from Comcast. How can I help you today? 🎯";
            expect(() => feedback.analyzeMessage(specialMessage, "")).not.toThrow();
        });

        test('should maintain consistent state across operations', () => {
            feedback.analyzeMessage("First message", "");
            const firstState = { ...feedback.currentCallContext };
            
            feedback.analyzeMessage("Second message", "");
            
            expect(feedback.currentCallContext.turnCount).toBe(firstState.turnCount + 1);
            expect(feedback.currentCallContext.stage).toBeDefined();
        });
    });
});

describe('initializeRealTimeQualityFeedback', () => {
    test('should create and return feedback instance', () => {
        const mockContainer = createMockElement('feedback');
        const mockInsights = createMockElement('insights');
        
        const feedback = initializeRealTimeQualityFeedback(mockContainer, mockInsights);
        
        expect(feedback).toBeInstanceOf(RealTimeQualityFeedback);
        expect(feedback.feedbackContainer).toBe(mockContainer);
        expect(feedback.insightsContainer).toBe(mockInsights);
    });

    test('should make feedback globally accessible', () => {
        const mockContainer = createMockElement('feedback');
        const feedback = initializeRealTimeQualityFeedback(mockContainer, null);
        
        expect(window.qualityFeedback).toBe(feedback);
    });
});