import {
    SCORING_GUIDELINES,
    getMaxPossibleScore,
    analyzeMessageQuality,
    getScoreWithIndicator,
    generateQualityInsights,
    validateQualityScore
} from '../src/qualityScoring.js';

describe('Quality Scoring System', () => {
    describe('SCORING_GUIDELINES', () => {
        test('should have all required sections', () => {
            expect(SCORING_GUIDELINES).toHaveProperty('s1');
            expect(SCORING_GUIDELINES).toHaveProperty('s2');
            expect(SCORING_GUIDELINES).toHaveProperty('s3');
            expect(SCORING_GUIDELINES).toHaveProperty('s4');
            expect(SCORING_GUIDELINES).toHaveProperty('behaviors');
        });

        test('should have valid section structure', () => {
            Object.values(SCORING_GUIDELINES).forEach(section => {
                expect(section).toHaveProperty('name');
                expect(section).toHaveProperty('maxPoints');
                expect(section).toHaveProperty('criteria');
                expect(Array.isArray(section.criteria)).toBe(true);
                expect(typeof section.maxPoints).toBe('number');
                expect(section.maxPoints).toBeGreaterThan(0);
            });
        });

        test('should have valid criteria structure', () => {
            Object.values(SCORING_GUIDELINES).forEach(section => {
                section.criteria.forEach(criterion => {
                    expect(criterion).toHaveProperty('name');
                    expect(criterion).toHaveProperty('maxScore');
                    expect(criterion).toHaveProperty('description');
                    expect(typeof criterion.name).toBe('string');
                    expect(typeof criterion.maxScore).toBe('number');
                    expect(typeof criterion.description).toBe('string');
                });
            });
        });

        test('should have criteria scores sum to section max points', () => {
            Object.values(SCORING_GUIDELINES).forEach(section => {
                const criteriaSum = section.criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);
                expect(criteriaSum).toBe(section.maxPoints);
            });
        });
    });

    describe('getMaxPossibleScore', () => {
        test('should return correct total maximum score', () => {
            const maxScore = getMaxPossibleScore();
            const expectedMax = 22 + 27 + 20 + 14 + 17; // S1 + S2 + S3 + S4 + Behaviors
            
            expect(maxScore).toBe(expectedMax);
            expect(typeof maxScore).toBe('number');
        });

        test('should be consistent with manual calculation', () => {
            const manualSum = Object.values(SCORING_GUIDELINES)
                .reduce((total, section) => total + section.maxPoints, 0);
            
            expect(getMaxPossibleScore()).toBe(manualSum);
        });
    });

    describe('analyzeMessageQuality', () => {
        test('should analyze greeting message correctly', () => {
            const message = "Hello, this is John from Comcast. How can I help you today?";
            const analysis = analyzeMessageQuality(message);
            
            expect(analysis).toHaveProperty('score');
            expect(analysis).toHaveProperty('maxScore');
            expect(analysis).toHaveProperty('feedback');
            expect(analysis).toHaveProperty('strengths');
            expect(analysis).toHaveProperty('improvements');
            
            expect(analysis.score).toBeGreaterThan(0);
            expect(analysis.strengths).toContain('Good greeting');
            expect(analysis.strengths).toContain('Asks clarifying questions');
        });

        test('should detect empathy in messages', () => {
            const message = "I understand your frustration and I'm sorry for the inconvenience. Let me help you resolve this issue.";
            const analysis = analyzeMessageQuality(message);
            
            expect(analysis.strengths).toContain('Shows empathy');
            expect(analysis.score).toBeGreaterThan(2);
        });

        test('should detect professional communication', () => {
            const message = "I will investigate this matter thoroughly and provide you with a complete solution.";
            const analysis = analyzeMessageQuality(message);
            
            expect(analysis.strengths).toContain('Professional communication');
        });

        test('should detect solution-oriented language', () => {
            const message = "Let me resolve this issue for you by checking your account settings.";
            const analysis = analyzeMessageQuality(message);
            
            expect(analysis.strengths).toContain('Solution-focused approach');
        });

        test('should provide improvement suggestions for low-quality messages', () => {
            const message = "um, yeah, okay";
            const analysis = analyzeMessageQuality(message);
            
            expect(analysis.score).toBeLessThan(4);
            expect(analysis.improvements.length).toBeGreaterThan(0);
        });

        test('should handle empty messages', () => {
            const analysis = analyzeMessageQuality('');
            
            expect(analysis.score).toBe(0);
            expect(analysis.improvements.length).toBeGreaterThan(0);
        });

        test('should consider context for closing messages', () => {
            const message = "Thank you for calling Comcast. Have a great day!";
            const analysis = analyzeMessageQuality(message, 'closing');
            
            expect(analysis).toBeDefined();
            expect(analysis.score).toBeGreaterThan(0);
        });

        test('should have consistent scoring range', () => {
            const messages = [
                "Hello from Comcast, how can I help?",
                "I understand and will resolve this",
                "What seems to be the problem?",
                "Let me fix that for you",
                "um, okay"
            ];
            
            messages.forEach(message => {
                const analysis = analyzeMessageQuality(message);
                expect(analysis.score).toBeGreaterThanOrEqual(0);
                expect(analysis.score).toBeLessThanOrEqual(analysis.maxScore);
            });
        });
    });

    describe('getScoreWithIndicator', () => {
        test('should return excellent indicator for high scores', () => {
            const result = getScoreWithIndicator(9, 10);
            
            expect(result.emoji).toBe('🟢');
            expect(result.color).toBe('text-green-400');
            expect(result.level).toBe('Excellent');
            expect(result.percentage).toBe(90);
        });

        test('should return good indicator for medium-high scores', () => {
            const result = getScoreWithIndicator(7, 10);
            
            expect(result.emoji).toBe('🟡');
            expect(result.color).toBe('text-yellow-400');
            expect(result.level).toBe('Good');
            expect(result.percentage).toBe(70);
        });

        test('should return needs improvement indicator for medium scores', () => {
            const result = getScoreWithIndicator(5, 10);
            
            expect(result.emoji).toBe('🟠');
            expect(result.color).toBe('text-orange-400');
            expect(result.level).toBe('Needs Improvement');
            expect(result.percentage).toBe(50);
        });

        test('should return poor indicator for low scores', () => {
            const result = getScoreWithIndicator(2, 10);
            
            expect(result.emoji).toBe('🔴');
            expect(result.color).toBe('text-red-400');
            expect(result.level).toBe('Poor');
            expect(result.percentage).toBe(20);
        });

        test('should handle perfect scores', () => {
            const result = getScoreWithIndicator(10, 10);
            
            expect(result.percentage).toBe(100);
            expect(result.level).toBe('Excellent');
        });

        test('should handle zero scores', () => {
            const result = getScoreWithIndicator(0, 10);
            
            expect(result.percentage).toBe(0);
            expect(result.level).toBe('Poor');
        });

        test('should round percentages correctly', () => {
            const result = getScoreWithIndicator(3.33, 10);
            
            expect(result.percentage).toBe(33);
        });
    });

    describe('generateQualityInsights', () => {
        test('should handle empty quality scores', () => {
            const insights = generateQualityInsights([]);
            
            expect(insights.overallTrend).toBe('No data available');
            expect(insights.recommendations).toContain('Start the conversation to receive quality feedback');
            expect(insights.averageScore).toBe(0);
        });

        test('should calculate average score correctly', () => {
            const scores = [
                { score: 8 },
                { score: 6 },
                { score: 7 }
            ];
            const insights = generateQualityInsights(scores);
            
            expect(insights.averageScore).toBe(7);
        });

        test('should detect improving trend', () => {
            const scores = [
                { score: 4 },
                { score: 5 },
                { score: 7 },
                { score: 8 }
            ];
            const insights = generateQualityInsights(scores);
            
            expect(insights.overallTrend).toBe('improving');
        });

        test('should detect declining trend', () => {
            const scores = [
                { score: 8 },
                { score: 7 },
                { score: 5 },
                { score: 4 }
            ];
            const insights = generateQualityInsights(scores);
            
            expect(insights.overallTrend).toBe('declining');
        });

        test('should detect stable trend', () => {
            const scores = [
                { score: 6 },
                { score: 6 },
                { score: 7 },
                { score: 6 }
            ];
            const insights = generateQualityInsights(scores);
            
            expect(insights.overallTrend).toBe('stable');
        });

        test('should provide appropriate recommendations for low scores', () => {
            const scores = [
                { score: 3 },
                { score: 4 },
                { score: 2 }
            ];
            const insights = generateQualityInsights(scores);
            
            expect(insights.recommendations).toContain('Focus on empathy and active listening');
            expect(insights.recommendations).toContain('Ask more probing questions to understand customer needs');
        });

        test('should provide positive feedback for high scores', () => {
            const scores = [
                { score: 8 },
                { score: 9 },
                { score: 8 }
            ];
            const insights = generateQualityInsights(scores);
            
            expect(insights.recommendations).toContain('Great job! Continue with current approach');
        });

        test('should suggest maintaining energy for declining trends', () => {
            const scores = [
                { score: 8 },
                { score: 6 },
                { score: 4 },
                { score: 3 }
            ];
            const insights = generateQualityInsights(scores);
            
            expect(insights.recommendations).toContain('Maintain energy and engagement throughout the call');
        });

        test('should handle single score', () => {
            const scores = [{ score: 7 }];
            const insights = generateQualityInsights(scores);
            
            expect(insights.averageScore).toBe(7);
            expect(insights.overallTrend).toBe('stable');
        });
    });

    describe('validateQualityScore', () => {
        test('should validate correct quality score object', () => {
            const validScore = {
                score: 7,
                maxScore: 10,
                feedback: ['Good job', 'Keep improving']
            };
            
            expect(validateQualityScore(validScore)).toBe(true);
        });

        test('should reject null or undefined objects', () => {
            expect(validateQualityScore(null)).toBe(false);
            expect(validateQualityScore(undefined)).toBe(false);
        });

        test('should reject objects missing required properties', () => {
            expect(validateQualityScore({ score: 5 })).toBe(false);
            expect(validateQualityScore({ maxScore: 10 })).toBe(false);
            expect(validateQualityScore({ feedback: [] })).toBe(false);
        });

        test('should reject invalid score types', () => {
            const invalidScore = {
                score: '7',
                maxScore: 10,
                feedback: []
            };
            
            expect(validateQualityScore(invalidScore)).toBe(false);
        });

        test('should reject negative scores', () => {
            const negativeScore = {
                score: -1,
                maxScore: 10,
                feedback: []
            };
            
            expect(validateQualityScore(negativeScore)).toBe(false);
        });

        test('should reject scores exceeding maximum', () => {
            const exceedingScore = {
                score: 15,
                maxScore: 10,
                feedback: []
            };
            
            expect(validateQualityScore(exceedingScore)).toBe(false);
        });

        test('should reject non-array feedback', () => {
            const invalidFeedback = {
                score: 7,
                maxScore: 10,
                feedback: 'Good job'
            };
            
            expect(validateQualityScore(invalidFeedback)).toBe(false);
        });

        test('should accept zero scores', () => {
            const zeroScore = {
                score: 0,
                maxScore: 10,
                feedback: []
            };
            
            expect(validateQualityScore(zeroScore)).toBe(true);
        });

        test('should accept perfect scores', () => {
            const perfectScore = {
                score: 10,
                maxScore: 10,
                feedback: ['Perfect!']
            };
            
            expect(validateQualityScore(perfectScore)).toBe(true);
        });
    });
});