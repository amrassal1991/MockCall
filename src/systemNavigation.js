/**
 * System Navigation and Troubleshooting Tools
 * ITG (Issue Type Guide), LLQ (Line of Questions), and Ticketing System
 */

export class SystemNavigationManager {
    constructor() {
        this.currentITG = null;
        this.currentLLQ = [];
        this.llqStep = 0;
        this.ticketData = {};
        this.troubleshootingSteps = [];
        
        this.initializeITGCategories();
        this.initializeLLQFlows();
        this.initializeCSGCodes();
    }

    /**
     * Initialize ITG (Issue Type Guide) categories
     */
    initializeITGCategories() {
        this.itgCategories = {
            'connectivity': {
                name: 'Connectivity Issues',
                description: 'Internet connection problems, slow speeds, intermittent service',
                icon: '🌐',
                llqFlow: 'connectivity_flow'
            },
            'static_ip': {
                name: 'Static IP Service',
                description: 'Static IP configuration, routing issues, IP conflicts',
                icon: '🔗',
                llqFlow: 'static_ip_flow'
            },
            'equipment': {
                name: 'Equipment Issues',
                description: 'Router, modem, WiFi problems, hardware failures',
                icon: '📡',
                llqFlow: 'equipment_flow'
            },
            'tv_cable': {
                name: 'TV/Cable Service',
                description: 'Cable TV issues, channel problems, signal quality',
                icon: '📺',
                llqFlow: 'tv_flow'
            },
            'phone': {
                name: 'Phone/Landline',
                description: 'Voice service issues, call quality, line problems',
                icon: '☎️',
                llqFlow: 'phone_flow'
            },
            'billing': {
                name: 'Billing/Account',
                description: 'Billing questions, account changes, service modifications',
                icon: '💳',
                llqFlow: 'billing_flow'
            },
            'new_service': {
                name: 'New Service Request',
                description: 'Service installations, upgrades, additions',
                icon: '➕',
                llqFlow: 'new_service_flow'
            }
        };
    }

    /**
     * Initialize LLQ (Line of Questions) flows
     */
    initializeLLQFlows() {
        this.llqFlows = {
            connectivity_flow: [
                {
                    question: "Is the customer experiencing complete loss of internet or slow speeds?",
                    options: [
                        { text: "Complete loss", next: 1, action: "check_physical_connections" },
                        { text: "Slow speeds", next: 2, action: "speed_test" },
                        { text: "Intermittent", next: 3, action: "signal_analysis" }
                    ]
                },
                {
                    question: "Are all cable connections secure and LED lights showing normal status?",
                    options: [
                        { text: "Yes, all secure", next: 4, action: "check_service_status" },
                        { text: "Loose connections", next: 5, action: "reconnect_cables" },
                        { text: "No lights/power", next: 6, action: "power_cycle" }
                    ]
                },
                {
                    question: "What speed is the customer getting vs. their plan speed?",
                    options: [
                        { text: "Less than 50% of plan", next: 7, action: "signal_check" },
                        { text: "50-80% of plan", next: 8, action: "optimize_connection" },
                        { text: "Close to plan speed", next: 9, action: "explain_factors" }
                    ]
                },
                {
                    question: "How often does the connection drop?",
                    options: [
                        { text: "Multiple times per hour", next: 10, action: "schedule_tech" },
                        { text: "Few times per day", next: 11, action: "signal_monitoring" },
                        { text: "Occasionally", next: 12, action: "environmental_check" }
                    ]
                }
            ],
            
            static_ip_flow: [
                {
                    question: "Is this a new static IP setup or existing configuration issue?",
                    options: [
                        { text: "New setup", next: 1, action: "configure_static_ip" },
                        { text: "Existing issue", next: 2, action: "verify_current_config" },
                        { text: "IP conflict", next: 3, action: "resolve_ip_conflict" }
                    ]
                },
                {
                    question: "Can the customer access the internet with DHCP?",
                    options: [
                        { text: "Yes, DHCP works", next: 4, action: "static_ip_config_issue" },
                        { text: "No internet at all", next: 5, action: "basic_connectivity_check" },
                        { text: "Partial access", next: 6, action: "routing_issue" }
                    ]
                }
            ],
            
            equipment_flow: [
                {
                    question: "What type of equipment is experiencing issues?",
                    options: [
                        { text: "Business Router (Cisco/Netgear)", next: 1, action: "router_diagnostics" },
                        { text: "WiFi Pro Service", next: 2, action: "wifi_pro_check" },
                        { text: "Connection Pro Service", next: 3, action: "connection_pro_check" },
                        { text: "Basic Modem", next: 4, action: "modem_diagnostics" }
                    ]
                },
                {
                    question: "What specific symptoms is the customer experiencing?",
                    options: [
                        { text: "No power/lights", next: 5, action: "power_supply_check" },
                        { text: "Connectivity issues", next: 6, action: "connection_diagnostics" },
                        { text: "Performance problems", next: 7, action: "performance_analysis" },
                        { text: "Configuration issues", next: 8, action: "config_review" }
                    ]
                }
            ]
        };
    }

    /**
     * Initialize CSG codes
     */
    initializeCSGCodes() {
        this.csgCodes = {
            'PDR': {
                name: 'Perry Drop',
                description: 'Temporary service interruption for maintenance',
                urgency: 'normal',
                sla: '3 days',
                cost: 'free'
            },
            'RDR': {
                name: 'Raise Drop',
                description: 'Raise cable drop for clearance issues',
                urgency: 'normal',
                sla: '3 days',
                cost: 'free'
            },
            'NSI': {
                name: 'New Service Install',
                description: 'Installation of new service',
                urgency: 'normal',
                sla: '3-5 days',
                cost: 'varies'
            },
            'SRO': {
                name: 'Service Repair Order',
                description: 'Repair existing service issue',
                urgency: 'high',
                sla: '24-48 hours',
                cost: 'free_if_comcast_issue'
            },
            'UGT': {
                name: 'Urgent Technician',
                description: 'Emergency technician visit',
                urgency: 'urgent',
                sla: '2-4 hours',
                cost: 'customer_pays_if_customer_issue'
            }
        };
    }

    /**
     * Show ITG selection popup
     */
    showITGSelection() {
        const popup = this.createPopup('itg-selection', 'Select Issue Type Guide (ITG)');
        
        const content = `
            <div class="itg-selection-content">
                <p class="itg-instruction">Choose the category that best describes the customer's main concern:</p>
                <div class="itg-categories">
                    ${Object.entries(this.itgCategories).map(([key, category]) => `
                        <div class="itg-category" data-itg="${key}">
                            <div class="itg-icon">${category.icon}</div>
                            <div class="itg-name">${category.name}</div>
                            <div class="itg-description">${category.description}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="itg-actions">
                    <button class="btn-cancel">Cancel</button>
                </div>
            </div>
        `;
        
        popup.querySelector('.popup-content').innerHTML = content;
        
        // Bind events
        popup.querySelectorAll('.itg-category').forEach(category => {
            category.addEventListener('click', (e) => {
                const itgKey = e.currentTarget.dataset.itg;
                this.selectITG(itgKey);
                this.closePopup(popup);
            });
        });
        
        popup.querySelector('.btn-cancel').addEventListener('click', () => {
            this.closePopup(popup);
        });
        
        document.body.appendChild(popup);
    }

    /**
     * Select ITG and start LLQ flow
     */
    selectITG(itgKey) {
        this.currentITG = this.itgCategories[itgKey];
        this.currentLLQ = this.currentITG ? this.llqFlows[this.currentITG.llqFlow] || [] : [];
        this.llqStep = 0;
        
        console.log(`ITG Selected: ${this.currentITG?.name || 'Unknown'}`);
        
        // Update ITG display
        this.updateITGDisplay();
        
        // Start LLQ flow
        if (this.currentLLQ.length > 0) {
            this.showLLQStep();
        }
    }

    /**
     * Show current LLQ step
     */
    showLLQStep() {
        if (this.llqStep >= this.currentLLQ.length) {
            this.completeLLQFlow();
            return;
        }
        
        const step = this.currentLLQ[this.llqStep];
        const popup = this.createPopup('llq-step', `LLQ Step ${this.llqStep + 1}`);
        
        const content = `
            <div class="llq-step-content">
                <div class="llq-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((this.llqStep + 1) / this.currentLLQ.length) * 100}%"></div>
                    </div>
                    <span class="progress-text">Step ${this.llqStep + 1} of ${this.currentLLQ.length}</span>
                </div>
                
                <div class="llq-question">
                    <h4>${step.question}</h4>
                </div>
                
                <div class="llq-options">
                    ${step.options.map((option, index) => `
                        <button class="llq-option" data-option="${index}">
                            ${option.text}
                        </button>
                    `).join('')}
                </div>
                
                <div class="llq-actions">
                    ${this.llqStep > 0 ? '<button class="btn-back">← Back</button>' : ''}
                    <button class="btn-cancel">Cancel</button>
                </div>
            </div>
        `;
        
        popup.querySelector('.popup-content').innerHTML = content;
        
        // Bind events
        popup.querySelectorAll('.llq-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const optionIndex = parseInt(e.currentTarget.dataset.option);
                this.selectLLQOption(step.options[optionIndex]);
                this.closePopup(popup);
            });
        });
        
        const backBtn = popup.querySelector('.btn-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.llqStep = Math.max(0, this.llqStep - 1);
                this.closePopup(popup);
                this.showLLQStep();
            });
        }
        
        popup.querySelector('.btn-cancel').addEventListener('click', () => {
            this.closePopup(popup);
        });
        
        document.body.appendChild(popup);
    }

    /**
     * Select LLQ option and proceed
     */
    selectLLQOption(option) {
        console.log(`LLQ Option Selected: ${option.text} (Action: ${option.action})`);
        
        // Record the step
        this.recordLLQStep(option);
        
        // Move to next step
        if (option.next !== undefined && option.next < this.currentLLQ.length) {
            this.llqStep = option.next;
            this.showLLQStep();
        } else {
            this.completeLLQFlow();
        }
    }

    /**
     * Complete LLQ flow
     */
    completeLLQFlow() {
        console.log('LLQ Flow Completed');
        
        // Show completion message
        const popup = this.createPopup('llq-complete', 'Triage Complete');
        
        const content = `
            <div class="llq-complete-content">
                <div class="completion-icon">✅</div>
                <h3>Triage Completed</h3>
                <p>Based on the triage, the recommended action is:</p>
                <div class="recommended-action">
                    ${this.getRecommendedAction()}
                </div>
                <div class="next-steps">
                    <button class="btn-create-ticket">Create Service Ticket</button>
                    <button class="btn-continue-troubleshooting">Continue Troubleshooting</button>
                    <button class="btn-close">Close</button>
                </div>
            </div>
        `;
        
        popup.querySelector('.popup-content').innerHTML = content;
        
        // Bind events
        popup.querySelector('.btn-create-ticket').addEventListener('click', () => {
            this.closePopup(popup);
            this.showTicketingForm();
        });
        
        popup.querySelector('.btn-continue-troubleshooting').addEventListener('click', () => {
            this.closePopup(popup);
            this.showTroubleshootingForm();
        });
        
        popup.querySelector('.btn-close').addEventListener('click', () => {
            this.closePopup(popup);
        });
        
        document.body.appendChild(popup);
    }

    /**
     * Show ticketing form
     */
    showTicketingForm() {
        const popup = this.createPopup('ticketing-form', 'Create Service Ticket');
        
        const content = `
            <div class="ticketing-form-content">
                <form class="ticket-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="caller-name">Caller Name *</label>
                            <input type="text" id="caller-name" name="callerName" required>
                        </div>
                        <div class="form-group">
                            <label for="email-address">Email Address *</label>
                            <input type="email" id="email-address" name="emailAddress" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="ticket-number">Ticket Number</label>
                            <input type="text" id="ticket-number" name="ticketNumber" value="${this.generateTicketNumber()}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="csg-code">CSG Code *</label>
                            <select id="csg-code" name="csgCode" required>
                                <option value="">Select CSG Code</option>
                                ${Object.entries(this.csgCodes).map(([code, info]) => `
                                    <option value="${code}">${code} - ${info.name}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="technician-name">Technician Name/Number</label>
                            <input type="text" id="technician-name" name="technicianName">
                        </div>
                        <div class="form-group">
                            <label for="device-type">Device Type *</label>
                            <select id="device-type" name="deviceType" required>
                                <option value="">Select Device Type</option>
                                <option value="business_router">Business Router (Cisco/Netgear)</option>
                                <option value="wifi_pro">WiFi Pro Service</option>
                                <option value="connection_pro">Connection Pro Service</option>
                                <option value="basic_modem">Basic Modem</option>
                                <option value="tv_cable">TV/Cable Equipment</option>
                                <option value="phone_landline">Phone/Landline</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="troubleshooting-steps">Troubleshooting Steps Performed *</label>
                        <textarea id="troubleshooting-steps" name="troubleshootingSteps" rows="6" 
                                  placeholder="List all troubleshooting steps performed:&#10;1. Restarted the router&#10;2. Corrected the boot file&#10;3. Asked customer to perform hard reset&#10;4. Tested router from backend&#10;5. Refreshed indicators&#10;6. Confirmed with customer - all positive" required></textarea>
                    </div>
                    
                    <div class="csg-info" id="csg-info" style="display: none;">
                        <h4>CSG Code Information</h4>
                        <div class="csg-details"></div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-create">Create Ticket</button>
                        <button type="button" class="btn-cancel">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        popup.querySelector('.popup-content').innerHTML = content;
        
        // Bind events
        const form = popup.querySelector('.ticket-form');
        const csgSelect = popup.querySelector('#csg-code');
        const csgInfo = popup.querySelector('#csg-info');
        
        csgSelect.addEventListener('change', (e) => {
            const csgCode = e.target.value;
            if (csgCode && this.csgCodes[csgCode]) {
                const info = this.csgCodes[csgCode];
                csgInfo.style.display = 'block';
                csgInfo.querySelector('.csg-details').innerHTML = `
                    <div class="csg-detail"><strong>Description:</strong> ${info.description}</div>
                    <div class="csg-detail"><strong>Urgency:</strong> ${info.urgency}</div>
                    <div class="csg-detail"><strong>SLA:</strong> ${info.sla}</div>
                    <div class="csg-detail"><strong>Cost:</strong> ${info.cost}</div>
                `;
            } else {
                csgInfo.style.display = 'none';
            }
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTicket(new FormData(form));
            this.closePopup(popup);
        });
        
        popup.querySelector('.btn-cancel').addEventListener('click', () => {
            this.closePopup(popup);
        });
        
        document.body.appendChild(popup);
    }

    /**
     * Show troubleshooting form
     */
    showTroubleshootingForm() {
        const popup = this.createPopup('troubleshooting-form', 'Troubleshooting Documentation');
        
        const content = `
            <div class="troubleshooting-form-content">
                <div class="troubleshooting-header">
                    <h3>Document Troubleshooting Steps</h3>
                    <p>Record all troubleshooting actions performed during this call:</p>
                </div>
                
                <div class="troubleshooting-steps">
                    <div class="steps-list" id="steps-list">
                        ${this.troubleshootingSteps.map((step, index) => `
                            <div class="step-item" data-index="${index}">
                                <span class="step-number">${index + 1}.</span>
                                <span class="step-text">${step}</span>
                                <button class="remove-step" data-index="${index}">×</button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="add-step">
                        <input type="text" id="new-step" placeholder="Enter troubleshooting step..." maxlength="200">
                        <button id="add-step-btn">Add Step</button>
                    </div>
                </div>
                
                <div class="common-steps">
                    <h4>Common Troubleshooting Steps:</h4>
                    <div class="common-steps-grid">
                        <button class="common-step" data-step="Restarted the router/modem">Restart Equipment</button>
                        <button class="common-step" data-step="Checked all cable connections">Check Connections</button>
                        <button class="common-step" data-step="Performed power cycle (30 seconds)">Power Cycle</button>
                        <button class="common-step" data-step="Verified signal levels from backend">Check Signal</button>
                        <button class="common-step" data-step="Updated/corrected boot file">Update Boot File</button>
                        <button class="common-step" data-step="Refreshed equipment indicators">Refresh Indicators</button>
                        <button class="common-step" data-step="Tested connectivity from customer end">Test Connectivity</button>
                        <button class="common-step" data-step="Confirmed resolution with customer">Confirm Resolution</button>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button class="btn-save">Save Steps</button>
                    <button class="btn-cancel">Cancel</button>
                </div>
            </div>
        `;
        
        popup.querySelector('.popup-content').innerHTML = content;
        
        // Bind events
        const newStepInput = popup.querySelector('#new-step');
        const addStepBtn = popup.querySelector('#add-step-btn');
        const stepsList = popup.querySelector('#steps-list');
        
        const addStep = () => {
            const stepText = newStepInput.value.trim();
            if (stepText) {
                this.troubleshootingSteps.push(stepText);
                this.updateStepsList(stepsList);
                newStepInput.value = '';
            }
        };
        
        addStepBtn.addEventListener('click', addStep);
        newStepInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addStep();
            }
        });
        
        // Common steps
        popup.querySelectorAll('.common-step').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stepText = e.target.dataset.step;
                this.troubleshootingSteps.push(stepText);
                this.updateStepsList(stepsList);
            });
        });
        
        popup.querySelector('.btn-save').addEventListener('click', () => {
            this.saveTroubleshootingSteps();
            this.closePopup(popup);
        });
        
        popup.querySelector('.btn-cancel').addEventListener('click', () => {
            this.closePopup(popup);
        });
        
        document.body.appendChild(popup);
    }

    /**
     * Helper methods
     */
    createPopup(id, title) {
        const popup = document.createElement('div');
        popup.className = 'system-popup';
        popup.id = id;
        popup.innerHTML = `
            <div class="popup-overlay">
                <div class="popup-container">
                    <div class="popup-header">
                        <h3>${title}</h3>
                        <button class="popup-close">&times;</button>
                    </div>
                    <div class="popup-content"></div>
                </div>
            </div>
        `;
        
        popup.querySelector('.popup-close').addEventListener('click', () => {
            this.closePopup(popup);
        });
        
        popup.querySelector('.popup-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closePopup(popup);
            }
        });
        
        return popup;
    }

    closePopup(popup) {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }

    updateITGDisplay() {
        const itgDisplay = document.getElementById('current-itg');
        if (itgDisplay && this.currentITG) {
            itgDisplay.innerHTML = `
                <div class="itg-current">
                    <span class="itg-icon">${this.currentITG.icon}</span>
                    <span class="itg-name">${this.currentITG.name}</span>
                </div>
            `;
        }
    }

    updateStepsList(container) {
        container.innerHTML = this.troubleshootingSteps.map((step, index) => `
            <div class="step-item" data-index="${index}">
                <span class="step-number">${index + 1}.</span>
                <span class="step-text">${step}</span>
                <button class="remove-step" data-index="${index}">×</button>
            </div>
        `).join('');
        
        // Bind remove events
        container.querySelectorAll('.remove-step').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.troubleshootingSteps.splice(index, 1);
                this.updateStepsList(container);
            });
        });
    }

    generateTicketNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `TKT${timestamp}${random}`;
    }

    recordLLQStep(option) {
        // Record the LLQ step for reporting
        console.log(`LLQ Step Recorded: ${option.text} -> ${option.action}`);
    }

    getRecommendedAction() {
        // Determine recommended action based on LLQ flow
        return "Based on the triage, recommend creating a service ticket for technician visit.";
    }

    createTicket(formData) {
        const ticketData = {};
        for (let [key, value] of formData.entries()) {
            ticketData[key] = value;
        }
        
        this.ticketData = ticketData;
        console.log('Ticket Created:', ticketData);
        
        // Show confirmation
        this.showTicketConfirmation(ticketData);
    }

    showTicketConfirmation(ticketData) {
        const popup = this.createPopup('ticket-confirmation', 'Ticket Created Successfully');
        
        const content = `
            <div class="ticket-confirmation-content">
                <div class="confirmation-icon">✅</div>
                <h3>Service Ticket Created</h3>
                <div class="ticket-details">
                    <div class="ticket-number">Ticket #${ticketData.ticketNumber}</div>
                    <div class="ticket-info">
                        <div><strong>Customer:</strong> ${ticketData.callerName}</div>
                        <div><strong>Email:</strong> ${ticketData.emailAddress}</div>
                        <div><strong>CSG Code:</strong> ${ticketData.csgCode}</div>
                        <div><strong>Device:</strong> ${ticketData.deviceType}</div>
                    </div>
                </div>
                <div class="delivery-options">
                    <h4>How would you like to provide the ticket number to the customer?</h4>
                    <div class="delivery-buttons">
                        <button class="delivery-option" data-method="phone">📞 Read over phone</button>
                        <button class="delivery-option" data-method="email">📧 Send via email</button>
                        <button class="delivery-option" data-method="sms">📱 Send via SMS</button>
                    </div>
                </div>
                <div class="confirmation-actions">
                    <button class="btn-close">Close</button>
                </div>
            </div>
        `;
        
        popup.querySelector('.popup-content').innerHTML = content;
        
        // Bind events
        popup.querySelectorAll('.delivery-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const method = e.target.dataset.method;
                this.handleTicketDelivery(method, ticketData);
            });
        });
        
        popup.querySelector('.btn-close').addEventListener('click', () => {
            this.closePopup(popup);
        });
        
        document.body.appendChild(popup);
    }

    handleTicketDelivery(method, ticketData) {
        const methods = {
            phone: 'Ticket number will be read to customer over the phone',
            email: `Ticket confirmation sent to ${ticketData.emailAddress}`,
            sms: 'Ticket number sent via SMS to customer\'s phone'
        };
        
        console.log(`Ticket Delivery: ${methods[method]}`);
        alert(methods[method]);
    }

    saveTroubleshootingSteps() {
        console.log('Troubleshooting Steps Saved:', this.troubleshootingSteps);
        
        // Show confirmation
        alert(`${this.troubleshootingSteps.length} troubleshooting steps saved successfully.`);
    }
}

/**
 * Initialize system navigation manager
 */
export function initializeSystemNavigation() {
    return new SystemNavigationManager();
}