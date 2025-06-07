/**
 * Real-time Quality Feedback System
 * Provides live analysis and feedback during agent-customer interactions
 * Integrates with S4 Quality Analyzer for comprehensive scoring
 */

import { analyzeAgentResponse, getLightBulbInsights } from './s4QualityAnalyzer.js';
import { getScoreWithIndicator } from './qualityScoring.js';

/**
 * Real-time Quality Feedback Manager
 * Handles live analysis, feedback display, and insights generation
 */
export class RealTimeQualityFeedback {
    constructor(feedbackContainer, insightsContainer) {
        this.feedbackContainer = feedbackContainer;
        this.insightsContainer = insightsContainer;
        this.conversationHistory = [];
        this.qualityHistory = [];
        this.currentCallContext = {
            stage: 's1',
            turnCount: 0,
            customerType: 'neutral',
            authenticated: false,
            optedOutOfSales: false
        };
        
        this.initializeUI();
    }

    /**
     * Initialize the quality feedback UI
     */
    initializeUI() {
        if (this.feedbackContainer) {
            this.feedbackContainer.innerHTML = `
                <div class="quality-feedback-header">
                    <h3 class="text-lg font-semibold text-white mb-2">Quality Feedback</h3>
                    <div class="quality-score-display">
                        <div id="overall-score" class="text-2xl font-bold text-center mb-2">
                            <span class="score-emoji">⭐</span>
                            <span class="score-text">0/100</span>
                        </div>
                        <div class="score-bar-container">
                            <div id="score-bar" class="score-bar"></div>
                        </div>
                    </div>
                </div>
                <div id="section-scores" class="section-scores mt-4"></div>
                <div id="live-feedback" class="live-feedback mt-4"></div>
                <div id="insights-panel" class="insights-panel mt-4 hidden">
                    <div class="insights-header">
                        <button id="close-insights" class="close-btn">&times;</button>
                        <h4 class="text-md font-semibold">💡 Quality Insights</h4>
                    </div>
                    <div id="insights-content" class="insights-content"></div>
                </div>
            `;
            
            this.bindEventListeners();
        }
    }

    /**
     * Bind event listeners for UI interactions
     */
    bindEventListeners() {
        const closeInsightsBtn = document.getElementById('close-insights');
        if (closeInsightsBtn) {
            closeInsightsBtn.addEventListener('click', () => {
                this.hideInsights();
            });
        }
    }

    /**
     * Analyze agent message and provide real-time feedback
     * @param {string} agentMessage - Agent's message to analyze
     * @param {string} customerMessage - Customer's previous message
     * @param {Object} additionalContext - Additional call context
     */
    analyzeMessage(agentMessage, customerMessage = '', additionalContext = {}) {
        // Update call context
        this.updateCallContext(agentMessage, customerMessage, additionalContext);
        
        // Perform S4 analysis
        const analysis = analyzeAgentResponse(
            agentMessage, 
            customerMessage, 
            this.currentCallContext
        );
        
        // Store in history
        this.conversationHistory.push({
            agent: agentMessage,
            customer: customerMessage,
            timestamp: new Date().toISOString(),
            analysis: analysis
        });
        
        this.qualityHistory.push({
            score: analysis.totalScore,
            maxScore: analysis.maxTotalScore,
            timestamp: new Date().toISOString(),
            sections: analysis.sections
        });
        
        // Update UI with feedback
        this.updateFeedbackDisplay(analysis);
        
        // Return analysis for external use
        return analysis;
    }

    /**
     * Update call context based on conversation flow
     * @param {string} agentMessage - Agent's message
     * @param {string} customerMessage - Customer's message
     * @param {Object} additionalContext - Additional context
     */
    updateCallContext(agentMessage, customerMessage, additionalContext) {
        this.currentCallContext.turnCount++;
        
        // Update stage based on conversation flow
        if (this.currentCallContext.turnCount <= 2) {
            this.currentCallContext.stage = 's1'; // START
        } else if (this.currentCallContext.turnCount <= 6) {
            this.currentCallContext.stage = 's2'; // SOLVE
        } else if (this.currentCallContext.turnCount <= 8) {
            this.currentCallContext.stage = 's3'; // SELL
        } else {
            this.currentCallContext.stage = 's4'; // SUMMARIZE
        }
        
        // Detect customer sentiment
        if (customerMessage) {
            const lowerCustomer = customerMessage.toLowerCase();
            if (lowerCustomer.includes('angry') || lowerCustomer.includes('terrible') || lowerCustomer.includes('hate')) {
                this.currentCallContext.customerType = 'irate';
            } else if (lowerCustomer.includes('thank') || lowerCustomer.includes('great') || lowerCustomer.includes('good')) {
                this.currentCallContext.customerType = 'satisfied';
            }
        }
        
        // Check for authentication
        if (agentMessage.toLowerCase().includes('verify') || agentMessage.toLowerCase().includes('authenticate')) {
            this.currentCallContext.authenticated = true;
        }
        
        // Apply additional context
        Object.assign(this.currentCallContext, additionalContext);
    }

    /**
     * Update the feedback display with analysis results
     * @param {Object} analysis - S4 analysis results
     */
    updateFeedbackDisplay(analysis) {
        this.updateOverallScore(analysis);
        this.updateSectionScores(analysis);
        this.updateLiveFeedback(analysis);
    }

    /**
     * Update overall score display
     * @param {Object} analysis - S4 analysis results
     */
    updateOverallScore(analysis) {
        const scoreElement = document.getElementById('overall-score');
        const scoreBarElement = document.getElementById('score-bar');
        
        if (scoreElement && scoreBarElement) {
            const percentage = Math.round((analysis.totalScore / analysis.maxTotalScore) * 100);
            const indicator = getScoreWithIndicator(analysis.totalScore, analysis.maxTotalScore);
            
            scoreElement.innerHTML = `
                <span class="score-emoji">${indicator.emoji}</span>
                <span class="score-text">${analysis.totalScore}/${analysis.maxTotalScore}</span>
                <div class="score-percentage ${indicator.color}">${percentage}%</div>
            `;
            
            scoreBarElement.style.width = `${percentage}%`;
            scoreBarElement.className = `score-bar ${indicator.color.replace('text-', 'bg-')}`;
        }
    }

    /**
     * Update section scores display
     * @param {Object} analysis - S4 analysis results
     */
    updateSectionScores(analysis) {
        const sectionContainer = document.getElementById('section-scores');
        if (!sectionContainer) return;
        
        const sectionsHTML = Object.entries(analysis.sections).map(([key, section]) => {
            const percentage = Math.round((section.score / section.maxScore) * 100);
            const indicator = getScoreWithIndicator(section.score, section.maxScore);
            
            return `
                <div class="section-score-item" data-section="${key}">
                    <div class="section-header">
                        <span class="section-name">${section.name}</span>
                        <button class="lightbulb-btn" onclick="window.qualityFeedback.showInsights('${key}')" 
                                title="Get insights for ${section.name}">
                            💡
                        </button>
                    </div>
                    <div class="section-score">
                        <span class="score-indicator ${indicator.color}">${indicator.emoji}</span>
                        <span class="score-value">${section.score}/${section.maxScore}</span>
                        <span class="score-percentage">(${percentage}%)</span>
                    </div>
                    <div class="section-bar-container">
                        <div class="section-bar ${indicator.color.replace('text-', 'bg-')}" 
                             style="width: ${percentage}%"></div>
                    </div>
                    ${section.applicable === false ? '<div class="not-applicable">N/A</div>' : ''}
                </div>
            `;
        }).join('');
        
        sectionContainer.innerHTML = sectionsHTML;
    }

    /**
     * Update live feedback with insights and recommendations
     * @param {Object} analysis - S4 analysis results
     */
    updateLiveFeedback(analysis) {
        const feedbackContainer = document.getElementById('live-feedback');
        if (!feedbackContainer) return;
        
        const latestInsights = analysis.insights.slice(0, 3); // Show top 3 insights
        const latestOpportunities = analysis.opportunities.slice(0, 2); // Show top 2 opportunities
        
        let feedbackHTML = '';
        
        // Show insights
        if (latestInsights.length > 0) {
            feedbackHTML += '<div class="feedback-section"><h5>💡 Live Insights</h5>';
            latestInsights.forEach(insight => {
                feedbackHTML += `
                    <div class="feedback-item ${insight.type}">
                        <span class="feedback-icon">${insight.icon}</span>
                        <span class="feedback-message">${insight.message}</span>
                    </div>
                `;
            });
            feedbackHTML += '</div>';
        }
        
        // Show opportunities
        if (latestOpportunities.length > 0) {
            feedbackHTML += '<div class="feedback-section"><h5>🎯 Opportunities</h5>';
            latestOpportunities.forEach(opportunity => {
                feedbackHTML += `
                    <div class="feedback-item opportunity">
                        <div class="opportunity-title">${opportunity.criterion}</div>
                        <div class="opportunity-suggestion">${opportunity.suggestion}</div>
                    </div>
                `;
            });
            feedbackHTML += '</div>';
        }
        
        // Show next step hints
        if (analysis.nextStepHints.length > 0) {
            const nextHint = analysis.nextStepHints[0];
            feedbackHTML += `
                <div class="feedback-section">
                    <h5>➡️ Next Step</h5>
                    <div class="feedback-item next-step">
                        <div class="next-step-stage">${nextHint.stage}</div>
                        <div class="next-step-hint">${nextHint.hint}</div>
                    </div>
                </div>
            `;
        }
        
        feedbackContainer.innerHTML = feedbackHTML;
    }

    /**
     * Show detailed insights for a specific section (light bulb functionality)
     * @param {string} sectionKey - Section to show insights for
     */
    showInsights(sectionKey) {
        if (this.qualityHistory.length === 0) return;
        
        const latestAnalysis = this.conversationHistory[this.conversationHistory.length - 1].analysis;
        const sectionAnalysis = latestAnalysis.sections[sectionKey];
        
        if (!sectionAnalysis) return;
        
        const insights = getLightBulbInsights(sectionKey, sectionAnalysis);
        this.displayInsights(insights);
    }

    /**
     * Display detailed insights in the insights panel
     * @param {Object} insights - Detailed insights object
     */
    displayInsights(insights) {
        const insightsPanel = document.getElementById('insights-panel');
        const insightsContent = document.getElementById('insights-content');
        
        if (!insightsPanel || !insightsContent) return;
        
        let insightsHTML = `
            <div class="insights-overview">
                <h5>${insights.sectionName} Analysis</h5>
                <div class="current-performance">
                    Score: ${insights.currentScore}/${insights.maxScore} 
                    (${Math.round((insights.currentScore / insights.maxScore) * 100)}%)
                </div>
            </div>
        `;
        
        // Quick wins
        if (insights.quickWins.length > 0) {
            insightsHTML += '<div class="insights-section"><h6>🚀 Quick Wins</h6>';
            insights.quickWins.forEach(quickWin => {
                insightsHTML += `
                    <div class="quick-win-item">
                        <div class="quick-win-criterion">${quickWin.criterion}</div>
                        <div class="quick-win-suggestion">${quickWin.suggestion}</div>
                        <div class="quick-win-impact">Impact: +${quickWin.impact} points</div>
                    </div>
                `;
            });
            insightsHTML += '</div>';
        }
        
        // Detailed breakdown
        if (insights.detailedBreakdown.length > 0) {
            insightsHTML += '<div class="insights-section"><h6>📊 Detailed Breakdown</h6>';
            insights.detailedBreakdown.forEach(criterion => {
                const percentage = Math.round((criterion.score / criterion.maxScore) * 100);
                insightsHTML += `
                    <div class="criterion-breakdown">
                        <div class="criterion-name">${criterion.name}</div>
                        <div class="criterion-score">${criterion.score}/${criterion.maxScore} (${percentage}%)</div>
                        <div class="criterion-justification">${criterion.justification}</div>
                    </div>
                `;
            });
            insightsHTML += '</div>';
        }
        
        // Examples
        if (insights.examples.length > 0) {
            insightsHTML += '<div class="insights-section"><h6>💬 Example Phrases</h6>';
            insights.examples.forEach(example => {
                insightsHTML += `<div class="example-phrase">"${example}"</div>`;
            });
            insightsHTML += '</div>';
        }
        
        // Next steps
        if (insights.nextSteps.length > 0) {
            insightsHTML += '<div class="insights-section"><h6>📋 Next Steps</h6>';
            insights.nextSteps.forEach(step => {
                insightsHTML += `
                    <div class="next-step-item ${step.priority}">
                        <div class="step-action">${step.action}</div>
                        <div class="step-description">${step.description}</div>
                    </div>
                `;
            });
            insightsHTML += '</div>';
        }
        
        insightsContent.innerHTML = insightsHTML;
        insightsPanel.classList.remove('hidden');
    }

    /**
     * Hide the insights panel
     */
    hideInsights() {
        const insightsPanel = document.getElementById('insights-panel');
        if (insightsPanel) {
            insightsPanel.classList.add('hidden');
        }
    }

    /**
     * Get quality trend analysis
     * @returns {Object} Trend analysis
     */
    getQualityTrend() {
        if (this.qualityHistory.length < 2) {
            return { trend: 'insufficient_data', message: 'Need more interactions for trend analysis' };
        }
        
        const recent = this.qualityHistory.slice(-3);
        const scores = recent.map(entry => entry.score);
        
        const firstScore = scores[0];
        const lastScore = scores[scores.length - 1];
        const difference = lastScore - firstScore;
        
        if (difference > 5) {
            return { trend: 'improving', message: 'Quality is improving! Keep up the good work.' };
        } else if (difference < -5) {
            return { trend: 'declining', message: 'Quality is declining. Focus on S4 fundamentals.' };
        } else {
            return { trend: 'stable', message: 'Quality is stable. Look for opportunities to excel.' };
        }
    }

    /**
     * Reset feedback for new call
     */
    resetForNewCall() {
        this.conversationHistory = [];
        this.qualityHistory = [];
        this.currentCallContext = {
            stage: 's1',
            turnCount: 0,
            customerType: 'neutral',
            authenticated: false,
            optedOutOfSales: false
        };
        
        // Reset UI
        const scoreElement = document.getElementById('overall-score');
        const sectionContainer = document.getElementById('section-scores');
        const feedbackContainer = document.getElementById('live-feedback');
        
        if (scoreElement) {
            scoreElement.innerHTML = '<span class="score-emoji">⭐</span><span class="score-text">0/100</span>';
        }
        
        if (sectionContainer) {
            sectionContainer.innerHTML = '<div class="text-gray-500 text-center">Waiting for first interaction...</div>';
        }
        
        if (feedbackContainer) {
            feedbackContainer.innerHTML = '<div class="text-gray-500 text-center">Start speaking to receive quality feedback</div>';
        }
        
        this.hideInsights();
    }

    /**
     * Export quality report
     * @returns {Object} Complete quality report
     */
    exportQualityReport() {
        const trend = this.getQualityTrend();
        
        return {
            callSummary: {
                totalInteractions: this.conversationHistory.length,
                averageScore: this.qualityHistory.length > 0 ? 
                    Math.round(this.qualityHistory.reduce((sum, entry) => sum + entry.score, 0) / this.qualityHistory.length) : 0,
                finalScore: this.qualityHistory.length > 0 ? this.qualityHistory[this.qualityHistory.length - 1].score : 0,
                trend: trend
            },
            conversationHistory: this.conversationHistory,
            qualityHistory: this.qualityHistory,
            callContext: this.currentCallContext,
            exportTimestamp: new Date().toISOString()
        };
    }
}

/**
 * Initialize real-time quality feedback
 * @param {HTMLElement} feedbackContainer - Container for feedback display
 * @param {HTMLElement} insightsContainer - Container for insights display
 * @returns {RealTimeQualityFeedback} Feedback manager instance
 */
export function initializeRealTimeQualityFeedback(feedbackContainer, insightsContainer) {
    const feedback = new RealTimeQualityFeedback(feedbackContainer, insightsContainer);
    
    // Make it globally accessible for light bulb buttons
    window.qualityFeedback = feedback;
    
    return feedback;
}