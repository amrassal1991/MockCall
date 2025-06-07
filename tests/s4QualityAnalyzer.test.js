import {
    S4_SCORING_GUIDELINES,
    CRITICAL_FAILURES,
    analyzeAgentResponse,
    getLightBulbInsights
} from '../src/s4QualityAnalyzer.js';

describe('S4 Quality Analyzer', () => {
    describe('S4_SCORING_GUIDELINES', () => {
        test('should have all required sections', () => {
            expect(S4_SCORING_GUIDELINES).toHaveProperty('s1');
            expect(S4_SCORING_GUIDELINES).toHaveProperty('s2');
            expect(S4_SCORING_GUIDELINES).toHaveProperty('s3');
            expect(S4_SCORING_GUIDELINES).toHaveProperty('s4');
            expect(S4_SCORING_GUIDELINES).toHaveProperty('behaviors');
        });

        test('should have correct maximum points for each section', () => {
            expect(S4_SCORING_GUIDELINES.s1.maxPoints).toBe(22);
            expect(S4_SCORING_GUIDELINES.s2.maxPoints).toBe(27);
            expect(S4_SCORING_GUIDELINES.s3.maxPoints).toBe(20);
            expect(S4_SCORING_GUIDELINES.s4.maxPoints).toBe(14);
            expect(S4_SCORING_GUIDELINES.behaviors.maxPoints).toBe(17);
        });

        test('should have valid criteria structure for all sections', () => {
            Object.values(S4_SCORING_GUIDELINES).forEach(section => {
                expect(section).toHaveProperty('name');
                expect(section).toHaveProperty('maxPoints');
                expect(section).toHaveProperty('description');
                expect(section).toHaveProperty('criteria');
                expect(Array.isArray(section.criteria)).toBe(true);
                
                section.criteria.forEach(criterion => {
                    expect(criterion).toHaveProperty('name');
                    expect(criterion).toHaveProperty('maxScore');
                    expect(criterion).toHaveProperty('description');
                    expect(typeof criterion.maxScore).toBe('number');
                });
            });
        });

        test('should have criteria scores sum to section max points', () => {
            Object.values(S4_SCORING_GUIDELINES).forEach(section => {
                const criteriaSum = section.criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);
                expect(criteriaSum).toBe(section.maxPoints);
            });
        });
    });

    describe('CRITICAL_FAILURES', () => {
        test('should define section failures', () => {
            expect(CRITICAL_FAILURES.sectionFailures).toHaveProperty('authentication');
            expect(CRITICAL_FAILURES.sectionFailures).toHaveProperty('accountActions');
            expect(CRITICAL_FAILURES.sectionFailures).toHaveProperty('tpvProcess');
        });

        test('should define auto-fail behaviors', () => {
            expect(CRITICAL_FAILURES.autoFailBehaviors).toHaveProperty('rudeness');
            expect(CRITICAL_FAILURES.autoFailBehaviors).toHaveProperty('callAvoidance');
            expect(CRITICAL_FAILURES.autoFailBehaviors).toHaveProperty('inappropriateTransfer');
        });
    });

    describe('analyzeAgentResponse', () => {
        test('should analyze excellent S1 greeting response', () => {
            const agentMessage = "Hello, this is John from Comcast. I understand your concern about your internet service and I'm here to help resolve this for you. Let me verify your account information so we can get this taken care of.";
            const analysis = analyzeAgentResponse(agentMessage, '', { stage: 's1' });
            
            expect(analysis.totalScore).toBeGreaterThan(15);
            expect(analysis.sections.s1.score).toBeGreaterThan(10);
            expect(analysis.autoFailDetected).toBe(false);
            expect(analysis.insights.length).toBeGreaterThan(0);
        });

        test('should analyze poor S1 response', () => {
            const agentMessage = "Yeah, what do you want?";
            const analysis = analyzeAgentResponse(agentMessage, '', { stage: 's1' });
            
            expect(analysis.sections.s1.score).toBeLessThan(5);
            expect(analysis.opportunities.length).toBeGreaterThan(0);
            expect(analysis.nextStepHints.length).toBeGreaterThan(0);
        });

        test('should analyze S2 probing and resolution', () => {
            const agentMessage = "Can you tell me more about when this internet issue started? What specific problems are you experiencing? Let me check your connection and explain what's causing this issue.";
            const analysis = analyzeAgentResponse(agentMessage, 'My internet keeps dropping', { stage: 's2' });
            
            expect(analysis.sections.s2.score).toBeGreaterThan(5);
            expect(analysis.sections.s2.strengths.length).toBeGreaterThan(0);
        });

        test('should handle S3 sell section when applicable', () => {
            const agentMessage = "Since we've resolved your internet issue, I'd like to show you our enhanced security package that can prevent future problems. This would give you better protection and faster speeds. Would you like me to add this to your account?";
            const customerMessage = "Thank you for fixing my internet";
            const analysis = analyzeAgentResponse(agentMessage, customerMessage, { 
                stage: 's3', 
                authenticated: true, 
                optedOutOfSales: false 
            });
            
            expect(analysis.sections.s3.applicable).toBe(true);
            expect(analysis.sections.s3.score).toBeGreaterThan(10);
        });

        test('should mark S3 as not applicable for irate customers', () => {
            const agentMessage = "Let me offer you an upgrade";
            const customerMessage = "This is terrible! I hate your service!";
            const analysis = analyzeAgentResponse(agentMessage, customerMessage, { stage: 's3' });
            
            expect(analysis.sections.s3.applicable).toBe(false);
            expect(analysis.sections.s3.score).toBe(0);
        });

        test('should analyze S4 summarization', () => {
            const agentMessage = "Let me summarize what we've accomplished today. I've fixed your internet connection and set up monitoring. You can expect stable service going forward. Is there anything else I can help you with? Thank you for choosing Comcast.";
            const analysis = analyzeAgentResponse(agentMessage, '', { stage: 's4' });
            
            expect(analysis.sections.s4.score).toBeGreaterThan(8);
        });

        test('should analyze professional behaviors', () => {
            const agentMessage = "I understand your frustration and I take full responsibility for resolving this issue. Let me personally ensure this gets fixed for you today.";
            const analysis = analyzeAgentResponse(agentMessage, '', {});
            
            expect(analysis.sections.behaviors.score).toBeGreaterThan(5);
        });

        test('should detect auto-fail for rudeness', () => {
            const agentMessage = "Shut up and listen to me, you idiot!";
            const analysis = analyzeAgentResponse(agentMessage, '', {});
            
            expect(analysis.autoFailDetected).toBe(true);
            expect(analysis.autoFailReason).toContain('Rudeness detected');
            expect(analysis.totalScore).toBe(0);
        });

        test('should detect auto-fail for inappropriate transfer', () => {
            const agentMessage = "That's not my department, you need to call another department.";
            const analysis = analyzeAgentResponse(agentMessage, '', {});
            
            expect(analysis.autoFailDetected).toBe(true);
            expect(analysis.autoFailReason).toContain('Inappropriate transfer');
        });

        test('should provide comprehensive analysis structure', () => {
            const agentMessage = "Hello from Comcast, how can I help?";
            const analysis = analyzeAgentResponse(agentMessage, '', {});
            
            expect(analysis).toHaveProperty('totalScore');
            expect(analysis).toHaveProperty('maxTotalScore');
            expect(analysis).toHaveProperty('sections');
            expect(analysis).toHaveProperty('insights');
            expect(analysis).toHaveProperty('opportunities');
            expect(analysis).toHaveProperty('nextStepHints');
            expect(analysis).toHaveProperty('breakdown');
            expect(analysis).toHaveProperty('autoFailDetected');
            expect(analysis).toHaveProperty('autoFailReason');
        });

        test('should generate appropriate insights for different performance levels', () => {
            // High performance
            const excellentMessage = "Hello, this is Sarah from Comcast. I understand your concern and I'm here to help resolve this for you. Let me verify your account and get this taken care of.";
            const excellentAnalysis = analyzeAgentResponse(excellentMessage, '', {});
            
            const successInsights = excellentAnalysis.insights.filter(insight => insight.type === 'success');
            expect(successInsights.length).toBeGreaterThan(0);
            
            // Poor performance
            const poorMessage = "What?";
            const poorAnalysis = analyzeAgentResponse(poorMessage, '', {});
            
            const errorInsights = poorAnalysis.insights.filter(insight => insight.type === 'error');
            expect(errorInsights.length).toBeGreaterThan(0);
        });

        test('should generate opportunities for improvement', () => {
            const incompleteMessage = "Hi, what's wrong?";
            const analysis = analyzeAgentResponse(incompleteMessage, '', {});
            
            expect(analysis.opportunities.length).toBeGreaterThan(0);
            analysis.opportunities.forEach(opportunity => {
                expect(opportunity).toHaveProperty('section');
                expect(opportunity).toHaveProperty('criterion');
                expect(opportunity).toHaveProperty('description');
                expect(opportunity).toHaveProperty('suggestion');
            });
        });

        test('should provide next step hints based on call stage', () => {
            const analysis = analyzeAgentResponse("Hello", '', { stage: 's1' });
            
            expect(analysis.nextStepHints.length).toBeGreaterThan(0);
            analysis.nextStepHints.forEach(hint => {
                expect(hint).toHaveProperty('stage');
                expect(hint).toHaveProperty('hint');
                expect(hint).toHaveProperty('priority');
            });
        });

        test('should handle empty or invalid messages', () => {
            const analysis = analyzeAgentResponse('', '', {});
            
            expect(analysis.totalScore).toBe(0);
            expect(analysis.autoFailDetected).toBe(false);
            expect(analysis.opportunities.length).toBeGreaterThan(0);
        });

        test('should calculate correct total scores', () => {
            const message = "Hello, this is John from Comcast. I understand your concern and will help resolve this.";
            const analysis = analyzeAgentResponse(message, '', {});
            
            const calculatedTotal = Object.values(analysis.sections)
                .reduce((sum, section) => sum + section.score, 0);
            
            expect(analysis.totalScore).toBe(calculatedTotal);
            expect(analysis.maxTotalScore).toBe(100); // 22+27+20+14+17
        });
    });

    describe('getLightBulbInsights', () => {
        test('should provide detailed insights for a section', () => {
            const sectionAnalysis = {
                name: 'START',
                score: 10,
                maxScore: 22,
                criteria: [
                    { name: 'Greeting', score: 3, maxScore: 3, justification: 'Good greeting' },
                    { name: 'Empathy', score: 7, maxScore: 15, justification: 'Some empathy shown' },
                    { name: 'Agenda', score: 0, maxScore: 4, justification: 'No agenda set' }
                ],
                strengths: ['Good greeting'],
                improvements: ['Add empathy', 'Set agenda']
            };
            
            const insights = getLightBulbInsights('s1', sectionAnalysis);
            
            expect(insights).toHaveProperty('sectionName');
            expect(insights).toHaveProperty('currentScore');
            expect(insights).toHaveProperty('maxScore');
            expect(insights).toHaveProperty('opportunities');
            expect(insights).toHaveProperty('quickWins');
            expect(insights).toHaveProperty('detailedBreakdown');
            expect(insights).toHaveProperty('nextSteps');
            expect(insights).toHaveProperty('examples');
            
            expect(insights.sectionName).toBe('START');
            expect(insights.currentScore).toBe(10);
            expect(insights.maxScore).toBe(22);
            expect(Array.isArray(insights.examples)).toBe(true);
        });

        test('should generate quick wins for missing criteria', () => {
            const sectionAnalysis = {
                score: 5,
                maxScore: 22,
                criteria: [
                    { name: 'Greeting', score: 0, maxScore: 3 },
                    { name: 'Empathy', score: 5, maxScore: 15 },
                    { name: 'Agenda', score: 0, maxScore: 4 }
                ],
                improvements: ['Add greeting', 'Set agenda']
            };
            
            const insights = getLightBulbInsights('s1', sectionAnalysis);
            
            expect(insights.quickWins.length).toBeGreaterThan(0);
            insights.quickWins.forEach(quickWin => {
                expect(quickWin).toHaveProperty('criterion');
                expect(quickWin).toHaveProperty('suggestion');
                expect(quickWin).toHaveProperty('impact');
                expect(quickWin).toHaveProperty('difficulty');
            });
        });

        test('should provide section-specific examples', () => {
            const sectionAnalysis = { score: 10, maxScore: 22, criteria: [], improvements: [] };
            
            const s1Insights = getLightBulbInsights('s1', sectionAnalysis);
            const s2Insights = getLightBulbInsights('s2', sectionAnalysis);
            const s3Insights = getLightBulbInsights('s3', sectionAnalysis);
            
            expect(s1Insights.examples.length).toBeGreaterThan(0);
            expect(s2Insights.examples.length).toBeGreaterThan(0);
            expect(s3Insights.examples.length).toBeGreaterThan(0);
            
            // Examples should be different for different sections
            expect(s1Insights.examples[0]).not.toBe(s2Insights.examples[0]);
        });

        test('should generate appropriate next steps based on performance', () => {
            const poorSectionAnalysis = {
                score: 2,
                maxScore: 22,
                criteria: [],
                improvements: ['Improve greeting', 'Add empathy']
            };
            
            const insights = getLightBulbInsights('s1', poorSectionAnalysis);
            
            expect(insights.nextSteps.length).toBeGreaterThan(0);
            
            const highPrioritySteps = insights.nextSteps.filter(step => step.priority === 'high');
            expect(highPrioritySteps.length).toBeGreaterThan(0);
        });
    });

    describe('Real-world Scenarios', () => {
        test('should handle complete call flow analysis', () => {
            const callFlow = [
                {
                    stage: 's1',
                    agent: "Hello, this is Maria from Comcast. I understand you're having internet issues and I'm here to help resolve this for you.",
                    customer: "Yes, my internet keeps dropping every hour!"
                },
                {
                    stage: 's2', 
                    agent: "I'm sorry to hear that. Can you tell me when this started happening? Let me check your connection and explain what's causing this issue.",
                    customer: "It started yesterday morning"
                },
                {
                    stage: 's3',
                    agent: "I've fixed the connection issue. Since we've resolved this, I'd like to show you our enhanced service that prevents these problems. Would you like to hear about it?",
                    customer: "Sure, tell me more"
                },
                {
                    stage: 's4',
                    agent: "Perfect! Let me summarize - I've fixed your connection and added the enhanced service. You'll see improved stability. Is there anything else I can help with today?",
                    customer: "No, thank you!"
                }
            ];
            
            callFlow.forEach(turn => {
                const analysis = analyzeAgentResponse(turn.agent, turn.customer, { stage: turn.stage });
                
                expect(analysis.totalScore).toBeGreaterThan(0);
                expect(analysis.autoFailDetected).toBe(false);
                expect(analysis.sections[turn.stage].score).toBeGreaterThan(0);
            });
        });

        test('should handle bilingual context appropriately', () => {
            const spanishMessage = "Hola, soy Juan de Comcast. Entiendo su preocupación y estoy aquí para ayudarle a resolver esto.";
            const analysis = analyzeAgentResponse(spanishMessage, '', { language: 'es-ES' });
            
            // Should still analyze structure even if keywords are in Spanish
            expect(analysis.totalScore).toBeGreaterThan(0);
            expect(analysis.insights.length).toBeGreaterThan(0);
        });

        test('should provide consistent scoring across similar messages', () => {
            const similarMessages = [
                "Hello, this is John from Comcast. How can I help you today?",
                "Hi, this is Sarah from Comcast. How may I assist you?",
                "Good morning, this is Mike from Comcast. What can I do for you?"
            ];
            
            const scores = similarMessages.map(message => 
                analyzeAgentResponse(message, '', {}).totalScore
            );
            
            // Scores should be similar for similar quality messages
            const maxScore = Math.max(...scores);
            const minScore = Math.min(...scores);
            expect(maxScore - minScore).toBeLessThan(10); // Within 10 points
        });

        test('should handle edge cases gracefully', () => {
            const edgeCases = [
                null,
                undefined,
                '',
                '   ',
                'a'.repeat(1000), // Very long message
                '!@#$%^&*()', // Special characters only
            ];
            
            edgeCases.forEach(message => {
                expect(() => {
                    const analysis = analyzeAgentResponse(message || '', '', {});
                    expect(analysis).toHaveProperty('totalScore');
                    expect(analysis).toHaveProperty('autoFailDetected');
                }).not.toThrow();
            });
        });
    });

    describe('Performance and Accuracy', () => {
        test('should maintain consistent performance across multiple analyses', () => {
            const testMessage = "Hello, this is John from Comcast. I understand your concern and I'm here to help.";
            const iterations = 50;
            
            const results = [];
            for (let i = 0; i < iterations; i++) {
                const analysis = analyzeAgentResponse(testMessage, '', {});
                results.push(analysis.totalScore);
            }
            
            // All results should be identical for the same input
            const uniqueScores = [...new Set(results)];
            expect(uniqueScores.length).toBe(1);
        });

        test('should provide accurate scoring for known good practices', () => {
            const excellentPractices = [
                "Hello, this is John from Comcast. I understand your frustration and I'm here to help resolve this for you.",
                "Can you tell me more about when this issue started? Let me check your account and explain what's causing this.",
                "I've resolved your issue and I'd like to show you how our enhanced service can prevent this in the future.",
                "Let me summarize what we've accomplished and what you can expect next. Is there anything else I can help with?"
            ];
            
            excellentPractices.forEach(message => {
                const analysis = analyzeAgentResponse(message, '', {});
                expect(analysis.totalScore).toBeGreaterThan(10); // Should score well
            });
        });

        test('should accurately identify poor practices', () => {
            const poorPractices = [
                "What?",
                "That's not my problem",
                "I don't know, call someone else",
                "Whatever, bye"
            ];
            
            poorPractices.forEach(message => {
                const analysis = analyzeAgentResponse(message, '', {});
                expect(analysis.totalScore).toBeLessThan(10); // Should score poorly
                expect(analysis.opportunities.length).toBeGreaterThanOrEqual(0);
            });
        });
    });
});