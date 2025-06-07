/**
 * Call Flow Manager
 * Manages call progression, interaction limits, and comprehensive quality reporting
 */

import { analyzeAgentResponse } from './s4QualityAnalyzer.js';

export class CallFlowManager {
    constructor(qualityFeedback, speechService) {
        this.qualityFeedback = qualityFeedback;
        this.speechService = speechService;
        this.maxInteractions = 10;
        this.currentInteraction = 0;
        this.callActive = false;
        this.callStartTime = null;
        this.callEndTime = null;
        this.interactions = [];
        this.finalReport = null;
        
        this.callEndPhrases = [
            'anything else i can help',
            'anything else i can assist',
            'have a great day',
            'have a lovely day',
            'thank you for calling',
            'thank you for choosing comcast',
            'is there anything else',
            'anything else today'
        ];
        
        this.customerEndPhrases = [
            'no thank you',
            'no thanks',
            'that\'s all',
            'nothing else',
            'no that\'s it',
            'no i\'m good',
            'that\'s everything'
        ];
    }

    /**
     * Start a new call
     */
    startCall(scenario) {
        this.callActive = true;
        this.callStartTime = new Date();
        this.currentInteraction = 0;
        this.interactions = [];
        this.finalReport = null;
        this.scenario = scenario;
        
        console.log('📞 Call started - Maximum 10 interactions allowed');
        this.updateCallStatus();
    }

    /**
     * Process agent interaction
     */
    processAgentInteraction(message, customerResponse = '') {
        if (!this.callActive) return null;
        
        this.currentInteraction++;
        
        const interaction = {
            number: this.currentInteraction,
            timestamp: new Date(),
            agent: message,
            customer: customerResponse,
            analysis: null
        };
        
        // Analyze with S4 quality system
        if (this.qualityFeedback) {
            interaction.analysis = this.qualityFeedback.analyzeMessage(message, customerResponse, {
                interactionNumber: this.currentInteraction,
                callStage: this.determineCallStage()
            });
        }
        
        this.interactions.push(interaction);
        
        // Check for call ending conditions
        if (this.shouldEndCall(message, customerResponse)) {
            this.endCall('natural_ending');
            return interaction;
        }
        
        // Check interaction limit
        if (this.currentInteraction >= this.maxInteractions) {
            this.endCall('interaction_limit');
            return interaction;
        }
        
        this.updateCallStatus();
        return interaction;
    }

    /**
     * Determine if call should end
     */
    shouldEndCall(agentMessage, customerResponse) {
        const lowerAgent = agentMessage.toLowerCase();
        const lowerCustomer = customerResponse.toLowerCase();
        
        // Check if agent used closing phrase
        const agentUsedClosing = this.callEndPhrases.some(phrase => 
            lowerAgent.includes(phrase)
        );
        
        // Check if customer indicated they're done
        const customerIsDone = this.customerEndPhrases.some(phrase => 
            lowerCustomer.includes(phrase)
        );
        
        // End call if agent used closing and customer responded negatively or didn't respond
        // OR if customer clearly indicated they're done regardless of agent message
        return (agentUsedClosing && (customerIsDone || customerResponse.trim() === '')) || 
               customerIsDone;
    }

    /**
     * End the call and generate comprehensive report
     */
    endCall(reason = 'manual') {
        if (!this.callActive) return;
        
        this.callActive = false;
        this.callEndTime = new Date();
        
        console.log(`📞 Call ended - Reason: ${reason}`);
        
        // Generate comprehensive quality report
        this.finalReport = this.generateComprehensiveReport();
        
        // Show call end indicator
        this.showCallEndIndicator(reason);
        
        // Display final report
        this.displayFinalReport();
        
        return this.finalReport;
    }

    /**
     * Generate comprehensive quality report
     */
    generateComprehensiveReport() {
        const callDuration = this.callEndTime - this.callStartTime;
        const analyses = this.interactions.map(i => i.analysis).filter(a => a);
        
        if (analyses.length === 0) {
            return this.generateBasicReport(callDuration);
        }
        
        // Calculate overall performance
        const totalScore = analyses.reduce((sum, analysis) => sum + analysis.totalScore, 0);
        const averageScore = totalScore / analyses.length;
        const maxPossibleScore = analyses[0]?.maxTotalScore || 100;
        const overallPercentage = (averageScore / maxPossibleScore) * 100;
        
        // Analyze section performance
        const sectionPerformance = this.analyzeSectionPerformance(analyses);
        
        // Generate personalized coaching plan
        const coachingPlan = this.generatePersonalizedCoachingPlan(sectionPerformance, analyses);
        
        // Calculate business metrics
        const businessMetrics = this.calculateBusinessMetrics(analyses);
        
        return {
            callSummary: {
                duration: Math.round(callDuration / 1000), // seconds
                interactions: this.currentInteraction,
                scenario: this.scenario?.customerName || 'Unknown',
                startTime: this.callStartTime.toISOString(),
                endTime: this.callEndTime.toISOString()
            },
            qualityMetrics: {
                overallScore: Math.round(averageScore),
                maxScore: maxPossibleScore,
                percentage: Math.round(overallPercentage),
                performanceLevel: this.getPerformanceLevel(overallPercentage),
                sectionBreakdown: sectionPerformance
            },
            businessMetrics,
            coachingPlan,
            guaranteedPromoterChecklist: this.generateGuaranteedPromoterChecklist(sectionPerformance),
            actionPlan: this.generateActionPlan(coachingPlan),
            interactions: this.interactions,
            exportTimestamp: new Date().toISOString()
        };
    }

    /**
     * Generate basic report when no analysis available
     */
    generateBasicReport(callDuration) {
        return {
            callSummary: {
                duration: Math.round(callDuration / 1000),
                interactions: this.currentInteraction,
                scenario: this.scenario?.customerName || 'Unknown',
                startTime: this.callStartTime.toISOString(),
                endTime: this.callEndTime.toISOString()
            },
            qualityMetrics: {
                overallScore: 0,
                maxScore: 100,
                percentage: 0,
                performanceLevel: 'No Analysis Available',
                sectionBreakdown: {}
            },
            businessMetrics: {
                promoterProbability: 0,
                resolutionRate: 0,
                salesOpportunity: false,
                firstCallResolution: false,
                customerSatisfactionPrediction: 'Unknown'
            },
            coachingPlan: {
                priority: 'high',
                focusAreas: [],
                strengths: [],
                overallRecommendation: 'Complete S4 methodology training required'
            },
            guaranteedPromoterChecklist: this.generateGuaranteedPromoterChecklist({}),
            actionPlan: {
                title: "Basic Action Plan",
                immediateActions: ["Complete S4 training"],
                weeklyGoals: ["Learn S4 methodology"],
                monthlyTarget: "Achieve basic S4 competency",
                practiceScenarios: ["Practice basic greetings"],
                keyPhrases: { greeting: "Hello, this is [Name] from Comcast" }
            },
            interactions: this.interactions
        };
    }

    /**
     * Analyze section performance across all interactions
     */
    analyzeSectionPerformance(analyses) {
        const sections = ['s1', 's2', 's3', 's4', 'behaviors'];
        const sectionPerformance = {};
        
        sections.forEach(sectionKey => {
            const sectionScores = analyses.map(analysis => 
                analysis.sections[sectionKey]?.score || 0
            );
            const sectionMaxScores = analyses.map(analysis => 
                analysis.sections[sectionKey]?.maxScore || 0
            );
            
            const totalScore = sectionScores.reduce((sum, score) => sum + score, 0);
            const totalMaxScore = sectionMaxScores.reduce((sum, max) => sum + max, 0);
            const averageScore = sectionScores.length > 0 ? totalScore / sectionScores.length : 0;
            const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
            
            sectionPerformance[sectionKey] = {
                name: analyses[0]?.sections[sectionKey]?.name || sectionKey.toUpperCase(),
                averageScore: Math.round(averageScore),
                totalPossible: totalMaxScore / sectionScores.length,
                percentage: Math.round(percentage),
                trend: this.calculateSectionTrend(sectionScores),
                strengths: this.extractSectionStrengths(analyses, sectionKey),
                improvements: this.extractSectionImprovements(analyses, sectionKey)
            };
        });
        
        return sectionPerformance;
    }

    /**
     * Generate personalized coaching plan
     */
    generatePersonalizedCoachingPlan(sectionPerformance, analyses) {
        const weakestSections = Object.entries(sectionPerformance)
            .filter(([key, section]) => section.percentage < 80)
            .sort((a, b) => a[1].percentage - b[1].percentage)
            .slice(0, 3);
        
        const strongestSections = Object.entries(sectionPerformance)
            .filter(([key, section]) => section.percentage >= 80)
            .sort((a, b) => b[1].percentage - a[1].percentage);
        
        return {
            priority: weakestSections.length > 2 ? 'high' : weakestSections.length > 0 ? 'medium' : 'low',
            focusAreas: weakestSections.map(([key, section]) => ({
                section: section.name,
                currentPerformance: section.percentage,
                targetImprovement: Math.min(100, section.percentage + 20),
                specificActions: this.generateSectionActions(key, section)
            })),
            strengths: strongestSections.map(([key, section]) => ({
                section: section.name,
                performance: section.percentage,
                maintainActions: [`Continue excellent ${section.name} performance`, 'Use as model for other sections']
            })),
            overallRecommendation: this.generateOverallRecommendation(sectionPerformance)
        };
    }

    /**
     * Generate guaranteed promoter checklist
     */
    generateGuaranteedPromoterChecklist(sectionPerformance) {
        const checklist = {
            title: "Guaranteed Promoter Checklist - Follow for 100% Score",
            description: "Complete this checklist to ensure promoter score and optimal business metrics",
            sections: {}
        };
        
        // S1 - START checklist
        checklist.sections.s1 = {
            name: "START - Opening Excellence",
            items: [
                "✓ Use complete greeting: 'Hello, this is [Name] from Comcast Business. How can I assist you today?'",
                "✓ Acknowledge customer concern: 'I understand your frustration with [issue]'",
                "✓ Take ownership: 'I'm here to help resolve this for you'",
                "✓ Set agenda: 'Let me verify your account and then we'll get this resolved'",
                "✓ Authenticate customer before proceeding"
            ],
            guaranteedScore: "22/22 points"
        };
        
        // S2 - SOLVE checklist
        checklist.sections.s2 = {
            name: "SOLVE - Resolution Mastery",
            items: [
                "✓ Ask probing questions: 'Can you tell me more about when this started?'",
                "✓ Explain root cause: 'The issue is caused by [reason]'",
                "✓ Provide complete solution: 'Here's how we'll fix this: [steps]'",
                "✓ Educate on prevention: 'To prevent this in the future...'",
                "✓ Capture email: 'May I have your email for important updates?'",
                "✓ Build value: 'This also gives you access to [benefit]'"
            ],
            guaranteedScore: "27/27 points"
        };
        
        // S3 - SELL checklist (if applicable)
        checklist.sections.s3 = {
            name: "SELL - Value Addition",
            items: [
                "✓ Transition after resolution: 'Since we've resolved this...'",
                "✓ Probe for needs: 'What's most important for your business?'",
                "✓ Present tailored offer: 'Based on your needs, I recommend...'",
                "✓ Focus on benefits: 'This would give you [specific benefits]'",
                "✓ Handle objections: 'I understand your concern. Let me explain...'",
                "✓ Ask for the sale: 'Would you like me to add this today?'"
            ],
            guaranteedScore: "20/20 points",
            note: "Only applicable if customer is not irate and hasn't opted out"
        };
        
        // S4 - SUMMARIZE checklist
        checklist.sections.s4 = {
            name: "SUMMARIZE - Professional Closure",
            items: [
                "✓ Summarize actions: 'Here's what we've accomplished today...'",
                "✓ Provide next steps: 'You can expect [timeline and actions]'",
                "✓ Offer additional help: 'Is there anything else I can assist with?'",
                "✓ Thank customer: 'Thank you for choosing Comcast Business'",
                "✓ Document everything: Include all details in ticket/notes"
            ],
            guaranteedScore: "14/14 points"
        };
        
        // Behaviors checklist
        checklist.sections.behaviors = {
            name: "BEHAVIORS - Professional Excellence",
            items: [
                "✓ Maintain professional, pleasant tone throughout",
                "✓ Use active listening: 'I hear you saying...'",
                "✓ Minimize dead air (under 20 seconds)",
                "✓ Take responsibility: 'I'll take care of this for you'",
                "✓ Build rapport: 'I appreciate your patience'",
                "✓ Show genuine concern for customer's business"
            ],
            guaranteedScore: "17/17 points"
        };
        
        checklist.businessMetrics = {
            title: "Business Metrics Guarantee",
            items: [
                "✓ Promoter Score: Following this checklist guarantees promoter rating",
                "✓ Resolution Rate: Proper troubleshooting prevents 7-day callbacks",
                "✓ Sales Conversion: Qualified leads will close when properly presented",
                "✓ First Call Resolution: Complete problem solving on first contact"
            ]
        };
        
        return checklist;
    }

    /**
     * Generate action plan
     */
    generateActionPlan(coachingPlan) {
        return {
            title: "Personalized Action Plan - Next Call Preparation",
            immediateActions: [
                "Review guaranteed promoter checklist before next call",
                "Practice weak section phrases using provided examples",
                "Focus on top 3 improvement areas identified"
            ],
            weeklyGoals: coachingPlan.focusAreas.map(area => 
                `Improve ${area.section} from ${area.currentPerformance}% to ${area.targetImprovement}%`
            ),
            monthlyTarget: "Achieve consistent 90%+ scores across all S4 sections",
            practiceScenarios: this.generatePracticeScenarios(coachingPlan),
            keyPhrases: this.generateKeyPhrases(coachingPlan)
        };
    }

    /**
     * Calculate business metrics
     */
    calculateBusinessMetrics(analyses) {
        const lastAnalysis = analyses[analyses.length - 1];
        const averageScore = analyses.reduce((sum, a) => sum + a.totalScore, 0) / analyses.length;
        const percentage = (averageScore / 100) * 100;
        
        return {
            promoterProbability: this.calculatePromoterProbability(percentage, analyses),
            resolutionRate: this.calculateResolutionRate(analyses),
            salesOpportunity: this.assessSalesOpportunity(analyses),
            firstCallResolution: this.assessFirstCallResolution(analyses),
            customerSatisfactionPrediction: this.predictCustomerSatisfaction(percentage)
        };
    }

    /**
     * Calculate promoter probability
     */
    calculatePromoterProbability(percentage, analyses) {
        // Base probability on overall score
        let probability = Math.max(0, (percentage - 60) * 2); // 60% = 0%, 80% = 40%, 100% = 80%
        
        // Boost for excellent S1 and S4 performance
        const s1Performance = this.getSectionPerformance(analyses, 's1');
        const s4Performance = this.getSectionPerformance(analyses, 's4');
        
        if (s1Performance > 80 && s4Performance > 80) {
            probability += 15;
        }
        
        // Penalty for poor behaviors
        const behaviorsPerformance = this.getSectionPerformance(analyses, 'behaviors');
        if (behaviorsPerformance < 60) {
            probability -= 20;
        }
        
        return Math.min(100, Math.max(0, Math.round(probability)));
    }

    /**
     * Show call end indicator
     */
    showCallEndIndicator(reason) {
        // Check if document and body exist (for testing environment)
        if (typeof document === 'undefined' || !document.body) {
            console.log(`Call ended: ${this.getEndReasonText(reason)}`);
            return;
        }
        
        const indicator = document.createElement('div');
        indicator.className = 'call-end-indicator';
        indicator.innerHTML = `
            <div class="call-end-content">
                <div class="call-end-icon">📞</div>
                <div class="call-end-title">Call Ended</div>
                <div class="call-end-reason">${this.getEndReasonText(reason)}</div>
                <div class="call-end-stats">
                    ${this.currentInteraction} interactions • ${Math.round((this.callEndTime - this.callStartTime) / 1000)}s duration
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(indicator);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 5000);
    }

    /**
     * Display final report
     */
    displayFinalReport() {
        if (!this.finalReport) return;
        
        // Check if document and body exist (for testing environment)
        if (typeof document === 'undefined' || !document.body) {
            console.log('Final report generated:', this.finalReport);
            return;
        }
        
        // Create report modal
        const modal = document.createElement('div');
        modal.className = 'final-report-modal';
        modal.innerHTML = this.generateReportHTML();
        
        document.body.appendChild(modal);
        
        // Bind close events
        const closeBtn = modal.querySelector('.close-report');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            });
        }
        
        // Bind export events
        const exportBtn = modal.querySelector('.export-report');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportReport();
            });
        }
    }

    /**
     * Generate report HTML
     */
    generateReportHTML() {
        const report = this.finalReport;
        
        return `
            <div class="report-overlay">
                <div class="report-container">
                    <div class="report-header">
                        <h2>📊 Comprehensive Quality Report</h2>
                        <button class="close-report">&times;</button>
                    </div>
                    
                    <div class="report-content">
                        <div class="report-summary">
                            <div class="score-display">
                                <div class="overall-score">
                                    ${report.qualityMetrics.overallScore}/${report.qualityMetrics.maxScore}
                                </div>
                                <div class="score-percentage">${report.qualityMetrics.percentage}%</div>
                                <div class="performance-level">${report.qualityMetrics.performanceLevel}</div>
                            </div>
                            
                            <div class="business-metrics">
                                <div class="metric">
                                    <span class="metric-label">Promoter Probability</span>
                                    <span class="metric-value">${report.businessMetrics.promoterProbability}%</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Resolution Rate</span>
                                    <span class="metric-value">${report.businessMetrics.resolutionRate}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="coaching-section">
                            <h3>🎯 Personalized Coaching Plan</h3>
                            <div class="coaching-priority priority-${report.coachingPlan.priority}">
                                Priority: ${report.coachingPlan.priority.toUpperCase()}
                            </div>
                            
                            <div class="focus-areas">
                                <h4>Focus Areas for Next Call:</h4>
                                ${(report.coachingPlan.focusAreas || []).map(area => `
                                    <div class="focus-area">
                                        <div class="area-title">${area.section}</div>
                                        <div class="area-progress">
                                            Current: ${area.currentPerformance}% → Target: ${area.targetImprovement}%
                                        </div>
                                        <ul class="area-actions">
                                            ${(area.specificActions || []).map(action => `<li>${action}</li>`).join('')}
                                        </ul>
                                    </div>
                                `).join('')}
                                ${(report.coachingPlan.focusAreas || []).length === 0 ? '<p>No specific focus areas identified. Continue with general S4 training.</p>' : ''}
                            </div>
                        </div>
                        
                        <div class="checklist-section">
                            <h3>✅ Guaranteed Promoter Checklist</h3>
                            <p class="checklist-description">${report.guaranteedPromoterChecklist.description}</p>
                            
                            ${Object.entries(report.guaranteedPromoterChecklist.sections).map(([key, section]) => `
                                <div class="checklist-section-item">
                                    <h4>${section.name} - ${section.guaranteedScore}</h4>
                                    <ul class="checklist-items">
                                        ${section.items.map(item => `<li>${item}</li>`).join('')}
                                    </ul>
                                    ${section.note ? `<div class="section-note">${section.note}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="action-plan-section">
                            <h3>📋 Action Plan</h3>
                            <div class="immediate-actions">
                                <h4>Immediate Actions:</h4>
                                <ul>
                                    ${report.actionPlan.immediateActions.map(action => `<li>${action}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class="weekly-goals">
                                <h4>Weekly Goals:</h4>
                                <ul>
                                    ${report.actionPlan.weeklyGoals.map(goal => `<li>${goal}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="report-footer">
                        <button class="export-report">📥 Export Report</button>
                        <button class="close-report">Close</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Helper methods
     */
    determineCallStage() {
        if (this.currentInteraction <= 2) return 's1';
        if (this.currentInteraction <= 6) return 's2';
        if (this.currentInteraction <= 8) return 's3';
        return 's4';
    }

    getEndReasonText(reason) {
        const reasons = {
            'natural_ending': 'Natural conversation conclusion',
            'interaction_limit': 'Maximum 10 interactions reached',
            'manual': 'Manually ended'
        };
        return reasons[reason] || reason;
    }

    getPerformanceLevel(percentage) {
        if (percentage >= 90) return 'Highly Effective';
        if (percentage >= 70) return 'Meets Expectations';
        return 'Below Expectations';
    }

    updateCallStatus() {
        const statusElement = document.getElementById('call-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="call-progress">
                    <span class="interaction-count">${this.currentInteraction}/${this.maxInteractions}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(this.currentInteraction / this.maxInteractions) * 100}%"></div>
                    </div>
                </div>
            `;
        }
    }

    // Additional helper methods for calculations
    calculateSectionTrend(scores) {
        if (scores.length < 2) return 'stable';
        const recent = scores.slice(-3);
        const early = scores.slice(0, 3);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
        
        if (recentAvg > earlyAvg + 2) return 'improving';
        if (recentAvg < earlyAvg - 2) return 'declining';
        return 'stable';
    }

    extractSectionStrengths(analyses, sectionKey) {
        return analyses
            .map(a => a.sections[sectionKey]?.strengths || [])
            .flat()
            .filter((strength, index, arr) => arr.indexOf(strength) === index)
            .slice(0, 3);
    }

    extractSectionImprovements(analyses, sectionKey) {
        return analyses
            .map(a => a.sections[sectionKey]?.improvements || [])
            .flat()
            .filter((improvement, index, arr) => arr.indexOf(improvement) === index)
            .slice(0, 3);
    }

    generateSectionActions(sectionKey, section) {
        const actions = {
            s1: [
                'Use complete company greeting with name',
                'Acknowledge customer emotion explicitly',
                'Set clear agenda before proceeding'
            ],
            s2: [
                'Ask more probing questions',
                'Explain root cause clearly',
                'Capture customer email address'
            ],
            s3: [
                'Transition smoothly after resolution',
                'Focus on benefits, not just features',
                'Ask directly for the sale'
            ],
            s4: [
                'Summarize all actions taken',
                'Provide clear next steps',
                'Offer additional assistance'
            ],
            behaviors: [
                'Maintain professional tone',
                'Use active listening phrases',
                'Take ownership of issues'
            ]
        };
        
        return actions[sectionKey] || ['Review section guidelines', 'Practice key phrases'];
    }

    generateOverallRecommendation(sectionPerformance) {
        const weakSections = Object.values(sectionPerformance).filter(s => s.percentage < 70);
        
        if (weakSections.length === 0) {
            return 'Excellent performance! Focus on consistency and maintaining high standards.';
        } else if (weakSections.length <= 2) {
            return 'Good foundation. Focus on strengthening identified weak areas for promoter scores.';
        } else {
            return 'Comprehensive S4 training recommended. Start with START and SUMMARIZE sections.';
        }
    }

    generatePracticeScenarios(coachingPlan) {
        return [
            'Practice greeting with company name and empathy',
            'Role-play probing questions for technical issues',
            'Practice transitioning to offers after resolution',
            'Rehearse professional call closing'
        ];
    }

    generateKeyPhrases(coachingPlan) {
        return {
            greeting: 'Hello, this is [Name] from Comcast Business. How can I assist you today?',
            empathy: 'I understand your frustration with this issue.',
            ownership: 'I\'m going to take care of this for you personally.',
            probing: 'Can you tell me more about when this started happening?',
            transition: 'Since we\'ve resolved your issue, I\'d like to show you...',
            closing: 'Is there anything else I can help you with today?'
        };
    }

    getSectionPerformance(analyses, sectionKey) {
        const scores = analyses.map(a => a.sections[sectionKey]?.score || 0);
        const maxScores = analyses.map(a => a.sections[sectionKey]?.maxScore || 1);
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        const totalMax = maxScores.reduce((sum, max) => sum + max, 0);
        return totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    }

    calculateResolutionRate(analyses) {
        // Simplified calculation based on S2 performance
        const s2Performance = this.getSectionPerformance(analyses, 's2');
        return Math.min(100, Math.max(0, s2Performance));
    }

    assessSalesOpportunity(analyses) {
        const s3Performance = this.getSectionPerformance(analyses, 's3');
        return s3Performance > 70;
    }

    assessFirstCallResolution(analyses) {
        const s2Performance = this.getSectionPerformance(analyses, 's2');
        return s2Performance > 80;
    }

    predictCustomerSatisfaction(percentage) {
        if (percentage >= 85) return 'Highly Satisfied';
        if (percentage >= 70) return 'Satisfied';
        if (percentage >= 50) return 'Neutral';
        return 'Dissatisfied';
    }

    exportReport() {
        const dataStr = JSON.stringify(this.finalReport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `quality-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

/**
 * Initialize call flow manager
 */
export function initializeCallFlowManager(qualityFeedback, speechService) {
    return new CallFlowManager(qualityFeedback, speechService);
}