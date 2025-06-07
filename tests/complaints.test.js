import { 
    complaints, 
    getAllScenarios, 
    filterByCustomerType, 
    filterByTopic, 
    getRandomScenario 
} from '../src/complaints.js';

describe('Complaints Database', () => {
    describe('complaints object', () => {
        test('should have all required categories', () => {
            expect(complaints).toHaveProperty('internet');
            expect(complaints).toHaveProperty('billing');
            expect(complaints).toHaveProperty('fraud');
            expect(complaints).toHaveProperty('technical');
            expect(complaints).toHaveProperty('rude');
        });

        test('should have valid scenario structure', () => {
            const allScenarios = getAllScenarios();
            
            allScenarios.forEach(scenario => {
                expect(scenario).toHaveProperty('id');
                expect(scenario).toHaveProperty('type');
                expect(scenario).toHaveProperty('scenario');
                expect(scenario).toHaveProperty('initialComplaint');
                expect(scenario).toHaveProperty('customerName');
                expect(scenario).toHaveProperty('difficulty');
                expect(scenario).toHaveProperty('customerType');
                expect(scenario).toHaveProperty('topic');
                
                // Check bilingual support
                expect(scenario.initialComplaint).toHaveProperty('en-US');
                expect(scenario.initialComplaint).toHaveProperty('es-ES');
                expect(typeof scenario.initialComplaint['en-US']).toBe('string');
                expect(typeof scenario.initialComplaint['es-ES']).toBe('string');
            });
        });

        test('should have non-empty complaint texts', () => {
            const allScenarios = getAllScenarios();
            
            allScenarios.forEach(scenario => {
                expect(scenario.initialComplaint['en-US'].length).toBeGreaterThan(0);
                expect(scenario.initialComplaint['es-ES'].length).toBeGreaterThan(0);
            });
        });
    });

    describe('getAllScenarios', () => {
        test('should return all scenarios from all categories', () => {
            const scenarios = getAllScenarios();
            const expectedCount = Object.values(complaints).reduce((sum, category) => sum + category.length, 0);
            
            expect(scenarios).toHaveLength(expectedCount);
            expect(Array.isArray(scenarios)).toBe(true);
        });

        test('should return scenarios with unique IDs', () => {
            const scenarios = getAllScenarios();
            const ids = scenarios.map(s => s.id);
            const uniqueIds = [...new Set(ids)];
            
            expect(ids).toHaveLength(uniqueIds.length);
        });
    });

    describe('filterByCustomerType', () => {
        test('should return all scenarios when type is "Any"', () => {
            const filtered = filterByCustomerType('Any');
            const all = getAllScenarios();
            
            expect(filtered).toHaveLength(all.length);
        });

        test('should filter scenarios by customer type', () => {
            const frustrated = filterByCustomerType('Frustrated');
            
            frustrated.forEach(scenario => {
                expect(scenario.customerType).toBe('Frustrated');
            });
        });

        test('should return empty array for non-existent customer type', () => {
            const filtered = filterByCustomerType('NonExistent');
            
            expect(filtered).toHaveLength(0);
        });

        test('should handle inquiry type correctly', () => {
            const inquiries = filterByCustomerType('Inquiry');
            
            expect(inquiries.length).toBeGreaterThan(0);
            inquiries.forEach(scenario => {
                expect(scenario.customerType).toBe('Inquiry');
            });
        });
    });

    describe('filterByTopic', () => {
        test('should return all scenarios when topic is "Any"', () => {
            const filtered = filterByTopic('Any');
            const all = getAllScenarios();
            
            expect(filtered).toHaveLength(all.length);
        });

        test('should filter scenarios by topic', () => {
            const internetIssues = filterByTopic('Internet Service');
            
            internetIssues.forEach(scenario => {
                expect(scenario.topic).toBe('Internet Service');
            });
        });

        test('should return empty array for non-existent topic', () => {
            const filtered = filterByTopic('NonExistent');
            
            expect(filtered).toHaveLength(0);
        });

        test('should handle billing topics correctly', () => {
            const billing = filterByTopic('Billing');
            
            expect(billing.length).toBeGreaterThan(0);
            billing.forEach(scenario => {
                expect(scenario.topic).toBe('Billing');
            });
        });
    });

    describe('getRandomScenario', () => {
        test('should return a valid scenario object', () => {
            const scenario = getRandomScenario();
            
            expect(scenario).toHaveProperty('id');
            expect(scenario).toHaveProperty('customerName');
            expect(scenario).toHaveProperty('initialComplaint');
        });

        test('should return scenario matching customer type filter', () => {
            const scenario = getRandomScenario('Inquiry', 'Any');
            
            expect(scenario.customerType).toBe('Inquiry');
        });

        test('should return scenario matching topic filter', () => {
            const scenario = getRandomScenario('Any', 'Billing');
            
            expect(scenario.topic).toBe('Billing');
        });

        test('should fallback to all scenarios when no matches found', () => {
            const scenario = getRandomScenario('NonExistent', 'NonExistent');
            
            expect(scenario).toBeDefined();
            expect(scenario).toHaveProperty('id');
        });

        test('should return different scenarios on multiple calls', () => {
            const scenarios = [];
            for (let i = 0; i < 10; i++) {
                scenarios.push(getRandomScenario());
            }
            
            // With multiple scenarios available, we should get some variety
            const uniqueIds = [...new Set(scenarios.map(s => s.id))];
            expect(uniqueIds.length).toBeGreaterThan(1);
        });

        test('should handle combined filters correctly', () => {
            // This test might fail if no scenarios match both filters
            // but should fallback gracefully
            const scenario = getRandomScenario('Inquiry', 'Technical Support');
            
            expect(scenario).toBeDefined();
            expect(scenario).toHaveProperty('id');
        });
    });

    describe('Language Support', () => {
        test('should have Spanish translations for all scenarios', () => {
            const scenarios = getAllScenarios();
            
            scenarios.forEach(scenario => {
                expect(scenario.initialComplaint['es-ES']).toBeDefined();
                expect(scenario.initialComplaint['es-ES'].length).toBeGreaterThan(0);
                expect(typeof scenario.initialComplaint['es-ES']).toBe('string');
            });
        });

        test('should have English versions for all scenarios', () => {
            const scenarios = getAllScenarios();
            
            scenarios.forEach(scenario => {
                expect(scenario.initialComplaint['en-US']).toBeDefined();
                expect(scenario.initialComplaint['en-US'].length).toBeGreaterThan(0);
                expect(typeof scenario.initialComplaint['en-US']).toBe('string');
            });
        });

        test('should have different content for English and Spanish', () => {
            const scenarios = getAllScenarios();
            
            scenarios.forEach(scenario => {
                // They should be different (not just the same text)
                expect(scenario.initialComplaint['en-US']).not.toBe(scenario.initialComplaint['es-ES']);
            });
        });
    });
});