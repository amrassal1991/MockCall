/**
 * Tests for System Navigation Manager
 */

import { SystemNavigationManager } from '../src/systemNavigation.js';

describe('System Navigation Manager', () => {
    let systemNav;

    beforeEach(() => {
        systemNav = new SystemNavigationManager();
        
        // Mock DOM
        document.body.innerHTML = '<div id="current-itg"></div>';
        
        // Mock console methods
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // Clean up DOM
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    describe('ITG Categories', () => {
        test('should initialize ITG categories', () => {
            expect(systemNav.itgCategories).toBeDefined();
            expect(systemNav.itgCategories.connectivity).toBeDefined();
            expect(systemNav.itgCategories.static_ip).toBeDefined();
            expect(systemNav.itgCategories.equipment).toBeDefined();
            expect(systemNav.itgCategories.tv_cable).toBeDefined();
            expect(systemNav.itgCategories.phone).toBeDefined();
            expect(systemNav.itgCategories.billing).toBeDefined();
            expect(systemNav.itgCategories.new_service).toBeDefined();
        });

        test('should have proper ITG category structure', () => {
            const connectivity = systemNav.itgCategories.connectivity;
            
            expect(connectivity).toHaveProperty('name');
            expect(connectivity).toHaveProperty('description');
            expect(connectivity).toHaveProperty('icon');
            expect(connectivity).toHaveProperty('llqFlow');
            
            expect(connectivity.name).toBe('Connectivity Issues');
            expect(connectivity.icon).toBe('🌐');
        });
    });

    describe('LLQ Flows', () => {
        test('should initialize LLQ flows', () => {
            expect(systemNav.llqFlows).toBeDefined();
            expect(systemNav.llqFlows.connectivity_flow).toBeDefined();
            expect(systemNav.llqFlows.static_ip_flow).toBeDefined();
            expect(systemNav.llqFlows.equipment_flow).toBeDefined();
        });

        test('should have proper LLQ step structure', () => {
            const connectivityFlow = systemNav.llqFlows.connectivity_flow;
            
            expect(Array.isArray(connectivityFlow)).toBe(true);
            expect(connectivityFlow.length).toBeGreaterThan(0);
            
            const firstStep = connectivityFlow[0];
            expect(firstStep).toHaveProperty('question');
            expect(firstStep).toHaveProperty('options');
            expect(Array.isArray(firstStep.options)).toBe(true);
            
            const firstOption = firstStep.options[0];
            expect(firstOption).toHaveProperty('text');
            expect(firstOption).toHaveProperty('next');
            expect(firstOption).toHaveProperty('action');
        });
    });

    describe('CSG Codes', () => {
        test('should initialize CSG codes', () => {
            expect(systemNav.csgCodes).toBeDefined();
            expect(systemNav.csgCodes.PDR).toBeDefined();
            expect(systemNav.csgCodes.RDR).toBeDefined();
            expect(systemNav.csgCodes.NSI).toBeDefined();
            expect(systemNav.csgCodes.SRO).toBeDefined();
            expect(systemNav.csgCodes.UGT).toBeDefined();
        });

        test('should have proper CSG code structure', () => {
            const pdr = systemNav.csgCodes.PDR;
            
            expect(pdr).toHaveProperty('name');
            expect(pdr).toHaveProperty('description');
            expect(pdr).toHaveProperty('urgency');
            expect(pdr).toHaveProperty('sla');
            expect(pdr).toHaveProperty('cost');
            
            expect(pdr.name).toBe('Perry Drop');
            expect(pdr.urgency).toBe('normal');
        });
    });

    describe('ITG Selection', () => {
        test('should select ITG and initialize LLQ', () => {
            systemNav.selectITG('connectivity');
            
            expect(systemNav.currentITG).toBe(systemNav.itgCategories.connectivity);
            expect(systemNav.currentLLQ).toBe(systemNav.llqFlows.connectivity_flow);
            expect(systemNav.llqStep).toBe(0);
        });

        test('should update ITG display', () => {
            systemNav.selectITG('equipment');
            
            const itgDisplay = document.getElementById('current-itg');
            expect(itgDisplay.innerHTML).toContain('Equipment Issues');
            expect(itgDisplay.innerHTML).toContain('📡');
        });

        test('should handle invalid ITG selection', () => {
            systemNav.selectITG('invalid_itg');
            
            expect(systemNav.currentITG).toBe(systemNav.itgCategories.invalid_itg);
            expect(systemNav.currentLLQ).toEqual([]);
        });
    });

    describe('LLQ Navigation', () => {
        beforeEach(() => {
            systemNav.selectITG('connectivity');
        });

        test('should select LLQ option and proceed', () => {
            const option = {
                text: 'Complete loss',
                next: 1,
                action: 'check_physical_connections'
            };
            
            systemNav.selectLLQOption(option);
            
            expect(systemNav.llqStep).toBe(1);
        });

        test('should complete LLQ flow when reaching end', () => {
            const option = {
                text: 'Final option',
                next: 999, // Beyond flow length
                action: 'complete_flow'
            };
            
            const completeSpy = jest.spyOn(systemNav, 'completeLLQFlow').mockImplementation(() => {});
            
            systemNav.selectLLQOption(option);
            
            expect(completeSpy).toHaveBeenCalled();
        });

        test('should record LLQ steps', () => {
            const option = {
                text: 'Test option',
                next: 1,
                action: 'test_action'
            };
            
            const recordSpy = jest.spyOn(systemNav, 'recordLLQStep').mockImplementation(() => {});
            
            systemNav.selectLLQOption(option);
            
            expect(recordSpy).toHaveBeenCalledWith(option);
        });
    });

    describe('Ticket Generation', () => {
        test('should generate unique ticket numbers', () => {
            const ticket1 = systemNav.generateTicketNumber();
            const ticket2 = systemNav.generateTicketNumber();
            
            expect(ticket1).toMatch(/^TKT\d{6}[A-Z0-9]{4}$/);
            expect(ticket2).toMatch(/^TKT\d{6}[A-Z0-9]{4}$/);
            expect(ticket1).not.toBe(ticket2);
        });

        test('should create ticket from form data', () => {
            const formData = new FormData();
            formData.append('callerName', 'John Doe');
            formData.append('emailAddress', 'john@example.com');
            formData.append('csgCode', 'SRO');
            formData.append('deviceType', 'business_router');
            formData.append('troubleshootingSteps', 'Restarted router, checked connections');
            
            const confirmationSpy = jest.spyOn(systemNav, 'showTicketConfirmation').mockImplementation(() => {});
            
            systemNav.createTicket(formData);
            
            expect(systemNav.ticketData.callerName).toBe('John Doe');
            expect(systemNav.ticketData.emailAddress).toBe('john@example.com');
            expect(systemNav.ticketData.csgCode).toBe('SRO');
            expect(confirmationSpy).toHaveBeenCalled();
        });
    });

    describe('Troubleshooting Steps', () => {
        test('should add troubleshooting steps', () => {
            const initialLength = systemNav.troubleshootingSteps.length;
            
            systemNav.troubleshootingSteps.push('Restarted the router');
            systemNav.troubleshootingSteps.push('Checked cable connections');
            
            expect(systemNav.troubleshootingSteps.length).toBe(initialLength + 2);
            expect(systemNav.troubleshootingSteps).toContain('Restarted the router');
            expect(systemNav.troubleshootingSteps).toContain('Checked cable connections');
        });

        test('should save troubleshooting steps', () => {
            systemNav.troubleshootingSteps = [
                'Step 1: Restarted router',
                'Step 2: Checked connections',
                'Step 3: Tested connectivity'
            ];
            
            // Mock alert
            global.alert = jest.fn();
            
            systemNav.saveTroubleshootingSteps();
            
            expect(global.alert).toHaveBeenCalledWith('3 troubleshooting steps saved successfully.');
        });
    });

    describe('Popup Management', () => {
        test('should create popup with proper structure', () => {
            const popup = systemNav.createPopup('test-popup', 'Test Title');
            
            expect(popup.className).toBe('system-popup');
            expect(popup.id).toBe('test-popup');
            expect(popup.innerHTML).toContain('Test Title');
            expect(popup.querySelector('.popup-header')).toBeDefined();
            expect(popup.querySelector('.popup-content')).toBeDefined();
            expect(popup.querySelector('.popup-close')).toBeDefined();
        });

        test('should close popup when close button clicked', () => {
            const popup = systemNav.createPopup('test-popup', 'Test Title');
            document.body.appendChild(popup);
            
            const closeBtn = popup.querySelector('.popup-close');
            closeBtn.click();
            
            expect(document.getElementById('test-popup')).toBeNull();
        });

        test('should close popup when overlay clicked', () => {
            const popup = systemNav.createPopup('test-popup', 'Test Title');
            document.body.appendChild(popup);
            
            const overlay = popup.querySelector('.popup-overlay');
            
            // Simulate clicking on overlay (not on child)
            const event = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(event, 'target', { value: overlay });
            Object.defineProperty(event, 'currentTarget', { value: overlay });
            
            overlay.dispatchEvent(event);
            
            expect(document.getElementById('test-popup')).toBeNull();
        });
    });

    describe('Ticket Delivery', () => {
        test('should handle different delivery methods', () => {
            const ticketData = {
                ticketNumber: 'TKT123456ABCD',
                emailAddress: 'test@example.com'
            };
            
            global.alert = jest.fn();
            
            systemNav.handleTicketDelivery('phone', ticketData);
            expect(global.alert).toHaveBeenCalledWith('Ticket number will be read to customer over the phone');
            
            systemNav.handleTicketDelivery('email', ticketData);
            expect(global.alert).toHaveBeenCalledWith('Ticket confirmation sent to test@example.com');
            
            systemNav.handleTicketDelivery('sms', ticketData);
            expect(global.alert).toHaveBeenCalledWith('Ticket number sent via SMS to customer\'s phone');
        });
    });

    describe('Recommended Actions', () => {
        test('should provide recommended action', () => {
            const action = systemNav.getRecommendedAction();
            
            expect(typeof action).toBe('string');
            expect(action.length).toBeGreaterThan(0);
        });
    });

    describe('Error Handling', () => {
        test('should handle missing DOM elements gracefully', () => {
            document.body.innerHTML = '';
            
            expect(() => {
                systemNav.updateITGDisplay();
            }).not.toThrow();
        });

        test('should handle empty LLQ flows', () => {
            systemNav.currentLLQ = [];
            systemNav.llqStep = 0;
            
            expect(() => {
                systemNav.showLLQStep();
            }).not.toThrow();
        });
    });

    describe('Integration Tests', () => {
        test('should complete full ITG to ticket flow', () => {
            // Select ITG
            systemNav.selectITG('connectivity');
            expect(systemNav.currentITG.name).toBe('Connectivity Issues');
            
            // Navigate through LLQ
            const option = systemNav.currentLLQ[0].options[0];
            systemNav.selectLLQOption(option);
            expect(systemNav.llqStep).toBeGreaterThan(0);
            
            // Create ticket
            const formData = new FormData();
            formData.append('callerName', 'Test Customer');
            formData.append('emailAddress', 'test@test.com');
            formData.append('csgCode', 'SRO');
            
            expect(() => {
                systemNav.createTicket(formData);
            }).not.toThrow();
            
            expect(systemNav.ticketData.callerName).toBe('Test Customer');
        });

        test('should handle complete troubleshooting workflow', () => {
            // Add troubleshooting steps
            systemNav.troubleshootingSteps.push('Restarted equipment');
            systemNav.troubleshootingSteps.push('Checked connections');
            systemNav.troubleshootingSteps.push('Tested connectivity');
            
            expect(systemNav.troubleshootingSteps.length).toBe(3);
            
            // Save steps
            global.alert = jest.fn();
            systemNav.saveTroubleshootingSteps();
            
            expect(global.alert).toHaveBeenCalledWith('3 troubleshooting steps saved successfully.');
        });
    });
});