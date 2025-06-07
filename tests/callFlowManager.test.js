/**
 * Tests for Call Flow Manager
 */

import { CallFlowManager } from '../src/callFlowManager.js';

// Mock dependencies
const mockQualityFeedback = {
    analyzeMessage: jest.fn().mockReturnValue({
        totalScore: 75,
        maxTotalScore: 100,
        sections: {
            s1: { score: 18, maxScore: 22, name: 'START' },
            s2: { score: 20, maxScore: 27, name: 'SOLVE' },
            s3: { score: 15, maxScore: 20, name: 'SELL' },
            s4: { score: 12, maxScore: 14, name: 'SUMMARIZE' },
            behaviors: { score: 10, maxScore: 17, name: 'BEHAVIORS' }
        }
    })
};

const mockSpeechService = {
    speak: jest.fn(),
    stopSpeaking: jest.fn()
};

describe('Call Flow Manager', () => {
    let callFlowManager;

    beforeEach(() => {
        callFlowManager = new CallFlowManager(mockQualityFeedback, mockSpeechService);
        
        // Mock DOM elements
        document.body.innerHTML = '<div id="call-status"></div>';
        
        // Reset mocks
        jest.clearAllMocks();
    });

    describe('Call Management', () => {
        test('should start a new call', () => {
            const scenario = { customerName: 'Test Customer' };
            
            callFlowManager.startCall(scenario);
            
            expect(callFlowManager.callActive).toBe(true);
            expect(callFlowManager.currentInteraction).toBe(0);
            expect(callFlowManager.scenario).toBe(scenario);
            expect(callFlowManager.callStartTime).toBeInstanceOf(Date);
        });

        test('should process agent interactions', () => {
            callFlowManager.startCall({ customerName: 'Test' });
            
            const interaction = callFlowManager.processAgentInteraction(
                'Hello, this is John from Comcast',
                'Hi, I need help'
            );
            
            expect(interaction).toBeDefined();
            expect(interaction.number).toBe(1);
            expect(interaction.agent).toBe('Hello, this is John from Comcast');
            expect(interaction.customer).toBe('Hi, I need help');
            expect(callFlowManager.currentInteraction).toBe(1);
        });

        test('should limit interactions to 10', () => {
            callFlowManager.startCall({ customerName: 'Test' });
            
            // Process 10 interactions
            for (let i = 1; i <= 10; i++) {
                callFlowManager.processAgentInteraction(`Message ${i}`, `Response ${i}`);
            }
            
            expect(callFlowManager.callActive).toBe(false);
            expect(callFlowManager.currentInteraction).toBe(10);
        });

        test('should detect natural call ending', () => {
            callFlowManager.startCall({ customerName: 'Test' });
            
            const interaction = callFlowManager.processAgentInteraction(
                'Is there anything else I can help you with?',
                'No thank you'
            );
            
            expect(callFlowManager.callActive).toBe(false);
        });

        test('should end call manually', () => {
            callFlowManager.startCall({ customerName: 'Test' });
            
            const report = callFlowManager.endCall('manual');
            
            expect(callFlowManager.callActive).toBe(false);
            expect(callFlowManager.callEndTime).toBeInstanceOf(Date);
            expect(report).toBeDefined();
        });
    });

    describe('Call Ending Detection', () => {
        test('should detect agent closing phrases', () => {
            const closingPhrases = [
                'anything else i can help',
                'have a great day',
                'thank you for calling'
            ];
            
            closingPhrases.forEach(phrase => {
                expect(callFlowManager.shouldEndCall(phrase, 'no thanks')).toBe(true);
            });
        });

        test('should detect customer ending responses', () => {
            const endingResponses = [
                'no thank you',
                'that\'s all',
                'nothing else'
            ];
            
            endingResponses.forEach(response => {
                expect(callFlowManager.shouldEndCall('anything else?', response)).toBe(true);
            });
        });

        test('should not end call prematurely', () => {
            expect(callFlowManager.shouldEndCall('How can I help?', 'I have an issue')).toBe(false);
        });
    });

    describe('Quality Report Generation', () => {
        test('should generate comprehensive report', () => {
            callFlowManager.startCall({ customerName: 'Test Customer' });
            callFlowManager.processAgentInteraction('Hello from Comcast', 'Hi there');
            callFlowManager.processAgentInteraction('How can I help?', 'I need support');
            
            const report = callFlowManager.endCall();
            
            expect(report).toHaveProperty('callSummary');
            expect(report).toHaveProperty('qualityMetrics');
            expect(report).toHaveProperty('businessMetrics');
            expect(report).toHaveProperty('coachingPlan');
            expect(report).toHaveProperty('guaranteedPromoterChecklist');
            expect(report).toHaveProperty('actionPlan');
            
            expect(report.callSummary.interactions).toBe(2);
            expect(report.callSummary.scenario).toBe('Test Customer');
        });

        test('should calculate section performance', () => {
            callFlowManager.startCall({ customerName: 'Test' });
            callFlowManager.processAgentInteraction('Test message', 'Test response');
            
            const report = callFlowManager.endCall();
            
            expect(report.qualityMetrics.sectionBreakdown).toHaveProperty('s1');
            expect(report.qualityMetrics.sectionBreakdown).toHaveProperty('s2');
            expect(report.qualityMetrics.sectionBreakdown).toHaveProperty('s3');
            expect(report.qualityMetrics.sectionBreakdown).toHaveProperty('s4');
            expect(report.qualityMetrics.sectionBreakdown).toHaveProperty('behaviors');
        });

        test('should generate coaching plan', () => {
            callFlowManager.startCall({ customerName: 'Test' });
            callFlowManager.processAgentInteraction('Test message', 'Test response');
            
            const report = callFlowManager.endCall();
            
            expect(report.coachingPlan).toHaveProperty('priority');
            expect(report.coachingPlan).toHaveProperty('focusAreas');
            expect(report.coachingPlan).toHaveProperty('strengths');
            expect(report.coachingPlan).toHaveProperty('overallRecommendation');
        });

        test('should generate guaranteed promoter checklist', () => {
            callFlowManager.startCall({ customerName: 'Test' });
            callFlowManager.processAgentInteraction('Test message', 'Test response');
            
            const report = callFlowManager.endCall();
            
            expect(report.guaranteedPromoterChecklist).toHaveProperty('title');
            expect(report.guaranteedPromoterChecklist).toHaveProperty('sections');
            expect(report.guaranteedPromoterChecklist.sections).toHaveProperty('s1');
            expect(report.guaranteedPromoterChecklist.sections).toHaveProperty('s2');
            expect(report.guaranteedPromoterChecklist.sections).toHaveProperty('s3');
            expect(report.guaranteedPromoterChecklist.sections).toHaveProperty('s4');
            expect(report.guaranteedPromoterChecklist.sections).toHaveProperty('behaviors');
        });

        test('should calculate business metrics', () => {
            callFlowManager.startCall({ customerName: 'Test' });
            callFlowManager.processAgentInteraction('Test message', 'Test response');
            
            const report = callFlowManager.endCall();
            
            expect(report.businessMetrics).toHaveProperty('promoterProbability');
            expect(report.businessMetrics).toHaveProperty('resolutionRate');
            expect(report.businessMetrics).toHaveProperty('salesOpportunity');
            expect(report.businessMetrics).toHaveProperty('firstCallResolution');
            expect(report.businessMetrics).toHaveProperty('customerSatisfactionPrediction');
            
            expect(typeof report.businessMetrics.promoterProbability).toBe('number');
            expect(report.businessMetrics.promoterProbability).toBeGreaterThanOrEqual(0);
            expect(report.businessMetrics.promoterProbability).toBeLessThanOrEqual(100);
        });

        test('should handle calls with no analysis', () => {
            const callFlowManagerNoAnalysis = new CallFlowManager(null, mockSpeechService);
            
            callFlowManagerNoAnalysis.startCall({ customerName: 'Test' });
            callFlowManagerNoAnalysis.processAgentInteraction('Test', 'Test');
            
            const report = callFlowManagerNoAnalysis.endCall();
            
            expect(report.qualityMetrics.overallScore).toBe(0);
            expect(report.qualityMetrics.performanceLevel).toBe('No Analysis Available');
        });
    });

    describe('Performance Level Classification', () => {
        test('should classify performance levels correctly', () => {
            expect(callFlowManager.getPerformanceLevel(95)).toBe('Highly Effective');
            expect(callFlowManager.getPerformanceLevel(85)).toBe('Meets Expectations');
            expect(callFlowManager.getPerformanceLevel(65)).toBe('Below Expectations');
        });
    });

    describe('Call Stage Determination', () => {
        test('should determine call stages correctly', () => {
            callFlowManager.currentInteraction = 1;
            expect(callFlowManager.determineCallStage()).toBe('s1');
            
            callFlowManager.currentInteraction = 4;
            expect(callFlowManager.determineCallStage()).toBe('s2');
            
            callFlowManager.currentInteraction = 7;
            expect(callFlowManager.determineCallStage()).toBe('s3');
            
            callFlowManager.currentInteraction = 9;
            expect(callFlowManager.determineCallStage()).toBe('s4');
        });
    });

    describe('Promoter Probability Calculation', () => {
        test('should calculate promoter probability based on score', () => {
            const analyses = [mockQualityFeedback.analyzeMessage()];
            
            const probability = callFlowManager.calculatePromoterProbability(80, analyses);
            
            expect(typeof probability).toBe('number');
            expect(probability).toBeGreaterThanOrEqual(0);
            expect(probability).toBeLessThanOrEqual(100);
        });

        test('should boost probability for excellent S1 and S4', () => {
            const excellentAnalyses = [{
                sections: {
                    s1: { score: 20, maxScore: 22 },
                    s4: { score: 13, maxScore: 14 },
                    behaviors: { score: 15, maxScore: 17 }
                }
            }];
            
            const probability = callFlowManager.calculatePromoterProbability(85, excellentAnalyses);
            
            expect(probability).toBeGreaterThan(50);
        });

        test('should penalize for poor behaviors', () => {
            const poorBehaviorAnalyses = [{
                sections: {
                    s1: { score: 20, maxScore: 22 },
                    s4: { score: 13, maxScore: 14 },
                    behaviors: { score: 8, maxScore: 17 }
                }
            }];
            
            const probability = callFlowManager.calculatePromoterProbability(85, poorBehaviorAnalyses);
            
            expect(probability).toBeLessThan(85);
        });
    });

    describe('Action Plan Generation', () => {
        test('should generate actionable plan', () => {
            const coachingPlan = {
                focusAreas: [
                    { section: 'START', currentPerformance: 70, targetImprovement: 90 },
                    { section: 'SOLVE', currentPerformance: 65, targetImprovement: 85 }
                ]
            };
            
            const actionPlan = callFlowManager.generateActionPlan(coachingPlan);
            
            expect(actionPlan).toHaveProperty('title');
            expect(actionPlan).toHaveProperty('immediateActions');
            expect(actionPlan).toHaveProperty('weeklyGoals');
            expect(actionPlan).toHaveProperty('monthlyTarget');
            expect(actionPlan).toHaveProperty('practiceScenarios');
            expect(actionPlan).toHaveProperty('keyPhrases');
            
            expect(Array.isArray(actionPlan.immediateActions)).toBe(true);
            expect(Array.isArray(actionPlan.weeklyGoals)).toBe(true);
            expect(Array.isArray(actionPlan.practiceScenarios)).toBe(true);
        });
    });

    describe('UI Integration', () => {
        test('should update call status display', () => {
            callFlowManager.startCall({ customerName: 'Test' });
            callFlowManager.processAgentInteraction('Test', 'Test');
            
            const statusElement = document.getElementById('call-status');
            expect(statusElement.innerHTML).toContain('1/10');
        });

        test('should handle missing status element gracefully', () => {
            document.body.innerHTML = '';
            
            expect(() => {
                callFlowManager.updateCallStatus();
            }).not.toThrow();
        });
    });

    describe('Report Export', () => {
        test('should export report as JSON', () => {
            // Mock URL.createObjectURL and related functions
            global.URL.createObjectURL = jest.fn(() => 'mock-url');
            global.URL.revokeObjectURL = jest.fn();
            
            const mockLink = {
                href: '',
                download: '',
                click: jest.fn()
            };
            
            const originalCreateElement = document.createElement;
            document.createElement = jest.fn((tagName) => {
                if (tagName === 'a') {
                    return mockLink;
                }
                return originalCreateElement.call(document, tagName);
            });
            
            // Mock document.body.appendChild to avoid DOM issues
            const originalAppendChild = document.body.appendChild;
            document.body.appendChild = jest.fn();
            
            callFlowManager.startCall({ customerName: 'Test' });
            callFlowManager.processAgentInteraction('Test', 'Test');
            callFlowManager.endCall();
            
            expect(() => callFlowManager.exportReport()).not.toThrow();
            
            // Restore mocks
            document.createElement = originalCreateElement;
            document.body.appendChild = originalAppendChild;
        });
    });
});