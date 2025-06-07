/**
 * S4 Quality Analysis System
 * Real-time analysis based on Comcast S4 Quality Training Material guidelines
 * Provides detailed scoring, insights, and improvement recommendations
 */

// S4 Quality Guidelines - Complete scoring system
export const S4_SCORING_GUIDELINES = {
    s1: {
        name: "START",
        maxPoints: 22,
        description: "Opening the call professionally and setting the foundation",
        criteria: [
            {
                name: "Greeting",
                maxScore: 3,
                description: "Agent greets clearly (Comcast Name, Agent First Name, offer assistance)",
                keywords: ["comcast", "hello", "hi", "good morning", "good afternoon", "how can i help", "assist"],
                failureConditions: ["incomplete greeting", "rushed", "no company name"]
            },
            {
                name: "Reflect, Relate, Empathize",
                maxScore: 15,
                description: "Reflects call reason, empathizes with customer, assures action",
                keywords: ["understand", "sorry", "apologize", "help", "resolve", "concern", "frustration"],
                failureConditions: ["vague response", "trap words", "no ownership", "dismissive"]
            },
            {
                name: "Set Agenda / Auth / Plant Seed",
                maxScore: 4,
                description: "Sets agenda, authenticates caller, plants seed for account review",
                keywords: ["verify", "confirm", "account", "review", "check", "authenticate"],
                failureConditions: ["no agenda", "no authentication", "no account review mention"]
            }
        ]
    },
    s2: {
        name: "SOLVE",
        maxPoints: 27,
        description: "Gathering information and resolving the customer's issue",
        criteria: [
            {
                name: "Obtain Info / Probe",
                maxScore: 7,
                description: "Asks effective questions, probes root causes",
                keywords: ["what", "when", "how", "why", "tell me", "explain", "describe"],
                failureConditions: ["assumptions", "no probing", "no opportunity for customer to describe"]
            },
            {
                name: "Resolve / Address Issue(s)",
                maxScore: 14,
                description: "Explains problem cause, provides complete resolution, educates on prevention",
                keywords: ["solution", "fix", "resolve", "because", "reason", "prevent", "avoid"],
                failureConditions: ["incomplete resolution", "insufficient info", "no confirmation"]
            },
            {
                name: "Build Value / Enhance",
                maxScore: 6,
                description: "Attempts email capture AND builds value of EXISTING Comcast products/services",
                keywords: ["email", "contact", "benefits", "features", "value", "service"],
                failureConditions: ["no email capture", "no value building"]
            }
        ]
    },
    s3: {
        name: "SELL",
        maxPoints: 20,
        description: "Presenting relevant offers (only if customer is not irate, authenticated, and hasn't opted out)",
        applicableConditions: ["customer not irate", "authenticated", "not opted out of sales"],
        criteria: [
            {
                name: "Transition to Relevant Offer",
                maxScore: 6,
                description: "Transitions after resolving issue, uses bridging statements, probes for needs",
                keywords: ["also", "additionally", "by the way", "speaking of", "since", "needs"],
                failureConditions: ["transitions too early", "no bridging", "abrupt transition"]
            },
            {
                name: "Present Offer",
                maxScore: 6,
                description: "Presents tailored recommendation, discusses benefits/value",
                keywords: ["recommend", "suggest", "offer", "benefits", "save", "upgrade", "enhance"],
                failureConditions: ["only mentions price", "no benefits", "generic offer"]
            },
            {
                name: "Overcome Objections",
                maxScore: 4,
                description: "Acknowledges objection, attempts to overcome resistance",
                keywords: ["understand", "however", "but", "consider", "what if", "alternative"],
                failureConditions: ["poor attempt", "aggressive", "dismissive"],
                notApplicable: "if customer accepts without resistance"
            },
            {
                name: "Proactively Ask for the Sale",
                maxScore: 4,
                description: "Uses closing techniques (choice, assumptive, urgency)",
                keywords: ["would you like", "shall we", "can we", "today", "now", "which option"],
                failureConditions: ["discusses solution but doesn't ask"],
                notApplicable: "if customer pre-purchases or rejects after objection handling"
            }
        ]
    },
    s4: {
        name: "SUMMARIZE",
        maxPoints: 14,
        description: "Wrapping up the call professionally and ensuring clarity",
        criteria: [
            {
                name: "Summarize Actions",
                maxScore: 7,
                description: "Provides clear next steps, documents resolution, validates sales",
                keywords: ["summary", "next steps", "will", "should", "expect", "follow up"],
                failureConditions: ["no recap", "no next steps", "unclear resolution"]
            },
            {
                name: "Close Contact",
                maxScore: 4,
                description: "Offers additional assistance, personalized closing, shows appreciation",
                keywords: ["anything else", "additional", "thank you", "appreciate", "have a great"],
                failureConditions: ["abrupt ending", "no additional assistance offer", "impersonal"]
            },
            {
                name: "Documentation",
                maxScore: 3,
                description: "Documents caller, reason, resolution/actions",
                keywords: ["document", "note", "record", "file"],
                failureConditions: ["missing required info"],
                note: "Cannot be fully assessed from transcript alone"
            }
        ]
    },
    behaviors: {
        name: "BEHAVIORS",
        maxPoints: 17,
        description: "Professional behaviors assessed throughout the call",
        criteria: [
            {
                name: "Tone, Confidence & Clarity",
                maxScore: 3,
                description: "Professional, pleasant, clear, unrushed pace",
                indicators: ["clear communication", "professional language", "confident delivery"],
                failureConditions: ["unprofessional tone", "unclear speech", "rushed delivery"]
            },
            {
                name: "Active Listening",
                maxScore: 3,
                description: "Verbal cues, avoids interruption, references customer info",
                indicators: ["acknowledges customer", "references previous statements", "asks follow-up questions"],
                failureConditions: ["interrupts customer", "ignores customer input", "no verbal cues"]
            },
            {
                name: "Contact Management",
                maxScore: 3,
                description: "Minimizes dead air (<20s), manages holds (<60s) with explanation",
                indicators: ["smooth transitions", "explains delays", "manages time well"],
                failureConditions: ["excessive dead air", "long holds without explanation"]
            },
            {
                name: "Acknowledge / Take Responsibility",
                maxScore: 4,
                description: "Assures solution, positive language, avoids blame",
                keywords: ["I will", "we can", "let me", "I'll take care", "my responsibility"],
                failureConditions: ["blames customer", "negative language", "no ownership"]
            },
            {
                name: "Build Rapport / Demonstrate Concern",
                maxScore: 4,
                description: "Genuine interest, acknowledges feelings, personalizes interaction",
                keywords: ["understand", "appreciate", "concern", "important", "personally"],
                failureConditions: ["robotic responses", "ignores emotions", "impersonal"]
            }
        ]
    }
};

// Critical failure policies
export const CRITICAL_FAILURES = {
    sectionFailures: {
        authentication: {
            section: "s1",
            description: "Disclosing info to non-authorized user",
            penalty: "Deducts all 22 points from S1"
        },
        accountActions: {
            section: "s2", 
            description: "Misinforming about charges, failing promises, not escalating supervisor call",
            penalty: "Deducts all 27 points from S2"
        },
        tpvProcess: {
            section: "s4",
            description: "Failure to attempt Third Party Verification where required",
            penalty: "Deducts all 14 points from S4"
        }
    },
    autoFailBehaviors: {
        rudeness: {
            description: "Rude, disrespectful, arguing, profanity, hanging up, refusing escalation/transfer",
            penalty: "Results in 0 overall score for the entire call"
        },
        callAvoidance: {
            description: "Failing to answer, personal calls/web surfing",
            penalty: "Results in 0 overall score for the entire call"
        },
        inappropriateTransfer: {
            description: "Blind transfer, advocating for customers to contact other departments",
            penalty: "Results in 0 overall score for the entire call"
        }
    }
};

/**
 * Analyze agent response using S4 guidelines
 * @param {string} agentMessage - Agent's response to analyze
 * @param {string} customerMessage - Customer's previous message for context
 * @param {Object} callContext - Current call context (stage, customer type, etc.)
 * @returns {Object} Detailed S4 analysis with scores and insights
 */
export function analyzeAgentResponse(agentMessage, customerMessage = '', callContext = {}) {
    const analysis = {
        totalScore: 0,
        maxTotalScore: 100,
        sections: {},
        insights: [],
        opportunities: [],
        nextStepHints: [],
        breakdown: {},
        autoFailDetected: false,
        autoFailReason: ''
    };

    // Check for auto-fail behaviors first
    const autoFail = checkAutoFailBehaviors(agentMessage);
    if (autoFail.detected) {
        analysis.autoFailDetected = true;
        analysis.autoFailReason = autoFail.reason;
        analysis.totalScore = 0;
        return analysis;
    }

    // Analyze each S4 section
    const sections = ['s1', 's2', 's3', 's4', 'behaviors'];
    
    sections.forEach(sectionKey => {
        const sectionAnalysis = analyzeSectionResponse(
            sectionKey, 
            agentMessage, 
            customerMessage, 
            callContext
        );
        analysis.sections[sectionKey] = sectionAnalysis;
        analysis.totalScore += sectionAnalysis.score;
    });

    // Generate insights and opportunities
    analysis.insights = generateInsights(analysis.sections, callContext);
    analysis.opportunities = generateOpportunities(analysis.sections, callContext);
    analysis.nextStepHints = generateNextStepHints(analysis.sections, callContext);
    analysis.breakdown = generateScoreBreakdown(analysis.sections);

    return analysis;
}

/**
 * Check for auto-fail behaviors in agent message
 * @param {string} message - Agent message to check
 * @returns {Object} Auto-fail detection result
 */
function checkAutoFailBehaviors(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for rudeness indicators
    const rudePatterns = [
        /\b(shut up|stupid|idiot|moron)\b/gi,
        /\b(fuck|shit|damn|hell)\b/gi,
        /\b(whatever|don't care|not my problem)\b/gi
    ];
    
    for (const pattern of rudePatterns) {
        if (pattern.test(message)) {
            return {
                detected: true,
                reason: "Rudeness detected: Unprofessional language or attitude",
                type: "rudeness"
            };
        }
    }
    
    // Check for call avoidance
    if (lowerMessage.includes('hold on') && lowerMessage.includes('personal')) {
        return {
            detected: true,
            reason: "Call avoidance: Personal activities during call",
            type: "callAvoidance"
        };
    }
    
    // Check for inappropriate transfer
    if (lowerMessage.includes('call another department') || lowerMessage.includes('not my department')) {
        return {
            detected: true,
            reason: "Inappropriate transfer: Directing customer to other departments without assistance",
            type: "inappropriateTransfer"
        };
    }
    
    return { detected: false, reason: '', type: '' };
}

/**
 * Analyze specific S4 section response
 * @param {string} sectionKey - Section to analyze (s1, s2, s3, s4, behaviors)
 * @param {string} agentMessage - Agent's message
 * @param {string} customerMessage - Customer's message for context
 * @param {Object} callContext - Call context
 * @returns {Object} Section analysis result
 */
function analyzeSectionResponse(sectionKey, agentMessage, customerMessage, callContext) {
    const section = S4_SCORING_GUIDELINES[sectionKey];
    const lowerMessage = agentMessage.toLowerCase();
    
    const sectionResult = {
        name: section.name,
        score: 0,
        maxScore: section.maxPoints,
        criteria: [],
        strengths: [],
        improvements: [],
        applicable: true
    };

    // Check if S3 (SELL) is applicable
    if (sectionKey === 's3') {
        sectionResult.applicable = isSellSectionApplicable(customerMessage, callContext);
        if (!sectionResult.applicable) {
            sectionResult.score = 0; // N/A sections don't contribute to score
            sectionResult.criteria.push({
                name: "Section Not Applicable",
                score: "N/A",
                maxScore: section.maxPoints,
                justification: "Customer is irate, not authenticated, or opted out of sales"
            });
            return sectionResult;
        }
    }

    // Analyze each criterion in the section
    section.criteria.forEach(criterion => {
        const criterionAnalysis = analyzeCriterion(criterion, lowerMessage, callContext);
        sectionResult.criteria.push(criterionAnalysis);
        sectionResult.score += criterionAnalysis.score;
        
        if (criterionAnalysis.score > 0) {
            sectionResult.strengths.push(criterionAnalysis.strength);
        } else {
            sectionResult.improvements.push(criterionAnalysis.improvement);
        }
    });

    return sectionResult;
}

/**
 * Analyze individual criterion
 * @param {Object} criterion - Criterion to analyze
 * @param {string} lowerMessage - Lowercase agent message
 * @param {Object} callContext - Call context
 * @returns {Object} Criterion analysis result
 */
function analyzeCriterion(criterion, lowerMessage, callContext) {
    const result = {
        name: criterion.name,
        score: 0,
        maxScore: criterion.maxScore,
        justification: '',
        strength: '',
        improvement: ''
    };

    // Check for keywords that indicate good performance
    const keywordMatches = criterion.keywords ? 
        criterion.keywords.filter(keyword => lowerMessage.includes(keyword.toLowerCase())).length : 0;
    
    // Check for failure conditions
    const failureDetected = criterion.failureConditions ?
        criterion.failureConditions.some(condition => 
            lowerMessage.includes(condition.toLowerCase()) || 
            checkFailureCondition(condition, lowerMessage, callContext)
        ) : false;

    // Score based on keyword matches and failure conditions
    if (failureDetected) {
        result.score = 0;
        result.justification = `Failed: ${criterion.failureConditions.find(condition => 
            lowerMessage.includes(condition.toLowerCase()))}`;
        result.improvement = `Improve ${criterion.name.toLowerCase()}: ${criterion.description}`;
    } else if (keywordMatches > 0) {
        // Award points based on keyword matches and criterion importance
        const keywordRatio = keywordMatches / (criterion.keywords?.length || 1);
        if (keywordRatio >= 0.5 || keywordMatches >= 2) {
            result.score = criterion.maxScore; // Full points for good performance
            result.justification = `Excellent: Demonstrated ${criterion.name.toLowerCase()} effectively`;
            result.strength = `Strong ${criterion.name.toLowerCase()}`;
        } else {
            result.score = Math.ceil(criterion.maxScore * 0.6); // Partial points
            result.justification = `Good: Some evidence of ${criterion.name.toLowerCase()}`;
            result.strength = `Adequate ${criterion.name.toLowerCase()}`;
        }
    } else {
        // No clear evidence of the criterion
        result.score = 0;
        result.justification = `Missing: No clear evidence of ${criterion.name.toLowerCase()}`;
        result.improvement = `Add ${criterion.name.toLowerCase()}: ${criterion.description}`;
    }

    return result;
}

/**
 * Check if SELL section is applicable
 * @param {string} customerMessage - Customer's message
 * @param {Object} callContext - Call context
 * @returns {boolean} True if sell section applies
 */
function isSellSectionApplicable(customerMessage, callContext) {
    const lowerCustomerMessage = customerMessage.toLowerCase();
    
    // Check if customer is irate
    const irateIndicators = ['angry', 'furious', 'terrible', 'awful', 'hate', 'worst'];
    const isIrate = irateIndicators.some(indicator => lowerCustomerMessage.includes(indicator));
    
    // Check if authenticated (assume true for simulation unless specified)
    const isAuthenticated = callContext.authenticated !== false;
    
    // Check if opted out of sales
    const hasOptedOut = callContext.optedOutOfSales === true;
    
    return !isIrate && isAuthenticated && !hasOptedOut;
}

/**
 * Check specific failure conditions
 * @param {string} condition - Failure condition to check
 * @param {string} message - Agent message
 * @param {Object} callContext - Call context
 * @returns {boolean} True if failure condition is met
 */
function checkFailureCondition(condition, message, callContext) {
    switch (condition) {
        case 'incomplete greeting':
            return !message.includes('comcast') || !message.includes('help');
        case 'rushed':
            return message.length < 20; // Very short greeting
        case 'no company name':
            return !message.includes('comcast');
        case 'vague response':
            return message.length < 30 && !message.includes('understand');
        case 'no ownership':
            return !message.includes('i will') && !message.includes('let me') && !message.includes('i can');
        case 'assumptions':
            return message.includes('probably') || message.includes('maybe') || message.includes('i think');
        case 'no probing':
            return !message.includes('?') && !message.includes('tell me') && !message.includes('what');
        default:
            return false;
    }
}

/**
 * Generate insights based on section analysis
 * @param {Object} sections - Analyzed sections
 * @param {Object} callContext - Call context
 * @returns {Array} Array of insights
 */
function generateInsights(sections, callContext) {
    const insights = [];
    
    // Overall performance insight
    const totalScore = Object.values(sections).reduce((sum, section) => sum + section.score, 0);
    const maxScore = Object.values(sections).reduce((sum, section) => sum + section.maxScore, 0);
    const percentage = (totalScore / maxScore) * 100;
    
    if (percentage >= 80) {
        insights.push({
            type: 'success',
            icon: '🎉',
            message: 'Excellent performance! You\'re following S4 methodology effectively.',
            priority: 'high'
        });
    } else if (percentage >= 60) {
        insights.push({
            type: 'warning',
            icon: '⚠️',
            message: 'Good foundation, but there\'s room for improvement in S4 execution.',
            priority: 'medium'
        });
    } else {
        insights.push({
            type: 'error',
            icon: '🚨',
            message: 'Focus on S4 fundamentals. Review training materials for better performance.',
            priority: 'high'
        });
    }
    
    // Section-specific insights
    Object.entries(sections).forEach(([key, section]) => {
        if (section.score === 0 && section.applicable) {
            insights.push({
                type: 'error',
                icon: '💡',
                message: `${section.name}: Missing key elements. ${section.improvements[0] || 'Review section requirements.'}`,
                priority: 'high',
                section: key
            });
        } else if (section.score === section.maxScore) {
            insights.push({
                type: 'success',
                icon: '✅',
                message: `${section.name}: Perfect execution! ${section.strengths[0] || 'Keep up the excellent work.'}`,
                priority: 'low',
                section: key
            });
        }
    });
    
    return insights;
}

/**
 * Generate opportunities for improvement
 * @param {Object} sections - Analyzed sections
 * @param {Object} callContext - Call context
 * @returns {Array} Array of opportunities
 */
function generateOpportunities(sections, callContext) {
    const opportunities = [];
    
    // Check for missed opportunities in each section
    Object.entries(sections).forEach(([key, section]) => {
        if (section.applicable && section.score < section.maxScore) {
            const sectionGuidelines = S4_SCORING_GUIDELINES[key];
            
            section.criteria.forEach(criterion => {
                if (criterion.score < criterion.maxScore) {
                    const guideline = sectionGuidelines.criteria.find(c => c.name === criterion.name);
                    if (guideline) {
                        opportunities.push({
                            section: section.name,
                            criterion: criterion.name,
                            description: guideline.description,
                            suggestion: generateSuggestion(guideline, callContext),
                            impact: criterion.score === 0 ? 'high' : 'medium',
                            keywords: guideline.keywords || []
                        });
                    }
                }
            });
        }
    });
    
    return opportunities;
}

/**
 * Generate next step hints
 * @param {Object} sections - Analyzed sections
 * @param {Object} callContext - Call context
 * @returns {Array} Array of next step hints
 */
function generateNextStepHints(sections, callContext) {
    const hints = [];
    
    // Determine current call stage based on section performance
    const s1Score = sections.s1?.score || 0;
    const s2Score = sections.s2?.score || 0;
    const s3Score = sections.s3?.score || 0;
    
    if (s1Score < S4_SCORING_GUIDELINES.s1.maxPoints * 0.8) {
        hints.push({
            stage: 'START',
            hint: 'Focus on completing your greeting and empathy. Try: "I understand your concern and I\'m here to help resolve this for you."',
            priority: 'high'
        });
    } else if (s2Score < S4_SCORING_GUIDELINES.s2.maxPoints * 0.8) {
        hints.push({
            stage: 'SOLVE',
            hint: 'Ask probing questions to understand the root cause. Try: "Can you tell me more about when this issue started?"',
            priority: 'high'
        });
    } else if (sections.s3?.applicable && s3Score < S4_SCORING_GUIDELINES.s3.maxPoints * 0.8) {
        hints.push({
            stage: 'SELL',
            hint: 'Look for opportunities to add value. Try: "Since we\'ve resolved this, let me show you how to prevent this in the future with our enhanced service."',
            priority: 'medium'
        });
    } else {
        hints.push({
            stage: 'SUMMARIZE',
            hint: 'Wrap up with clear next steps. Try: "Let me summarize what we\'ve accomplished and what you can expect next."',
            priority: 'medium'
        });
    }
    
    return hints;
}

/**
 * Generate improvement suggestion for a criterion
 * @param {Object} guideline - Criterion guideline
 * @param {Object} callContext - Call context
 * @returns {string} Improvement suggestion
 */
function generateSuggestion(guideline, callContext) {
    const suggestions = {
        'Greeting': 'Start with "Hello, this is [Your Name] from Comcast. How can I assist you today?"',
        'Reflect, Relate, Empathize': 'Use phrases like "I understand your frustration" and "Let me help resolve this for you"',
        'Set Agenda / Auth / Plant Seed': 'Say "Let me verify your account and then we\'ll get this resolved"',
        'Obtain Info / Probe': 'Ask open-ended questions: "Can you tell me more about..." or "When did this start?"',
        'Resolve / Address Issue(s)': 'Explain the cause and solution: "The issue is caused by... and here\'s how we\'ll fix it..."',
        'Build Value / Enhance': 'Mention service benefits: "This also gives you access to..." or "Can I get your email for updates?"',
        'Transition to Relevant Offer': 'Bridge naturally: "Since we\'ve resolved this, I\'d like to show you how to enhance your service"',
        'Present Offer': 'Focus on benefits: "This upgrade would give you faster speeds and better reliability"',
        'Overcome Objections': 'Acknowledge and redirect: "I understand your concern. Let me explain how this addresses that..."',
        'Proactively Ask for the Sale': 'Use closing techniques: "Would you like me to add this to your account today?"',
        'Summarize Actions': 'Recap clearly: "Here\'s what we\'ve done... and here\'s what happens next..."',
        'Close Contact': 'End professionally: "Is there anything else I can help you with today? Thank you for choosing Comcast"'
    };
    
    return suggestions[guideline.name] || `Focus on: ${guideline.description}`;
}

/**
 * Generate detailed score breakdown
 * @param {Object} sections - Analyzed sections
 * @returns {Object} Score breakdown
 */
function generateScoreBreakdown(sections) {
    const breakdown = {
        totalScore: 0,
        maxTotalScore: 0,
        sectionBreakdown: {},
        performanceLevel: '',
        recommendations: []
    };
    
    Object.entries(sections).forEach(([key, section]) => {
        breakdown.totalScore += section.score;
        breakdown.maxTotalScore += section.maxScore;
        breakdown.sectionBreakdown[key] = {
            name: section.name,
            score: section.score,
            maxScore: section.maxScore,
            percentage: Math.round((section.score / section.maxScore) * 100),
            applicable: section.applicable
        };
    });
    
    const overallPercentage = (breakdown.totalScore / breakdown.maxTotalScore) * 100;
    
    if (overallPercentage >= 90) {
        breakdown.performanceLevel = 'Highly Effective';
    } else if (overallPercentage >= 70) {
        breakdown.performanceLevel = 'Meets Expectations';
    } else {
        breakdown.performanceLevel = 'Below Expectations';
    }
    
    return breakdown;
}

/**
 * Get light bulb insights for specific section
 * @param {string} sectionKey - Section key (s1, s2, s3, s4, behaviors)
 * @param {Object} sectionAnalysis - Section analysis result
 * @returns {Object} Light bulb insights
 */
export function getLightBulbInsights(sectionKey, sectionAnalysis) {
    const section = S4_SCORING_GUIDELINES[sectionKey];
    
    return {
        sectionName: section.name,
        currentScore: sectionAnalysis.score,
        maxScore: sectionAnalysis.maxScore,
        opportunities: sectionAnalysis.improvements,
        quickWins: generateQuickWins(sectionKey, sectionAnalysis),
        detailedBreakdown: sectionAnalysis.criteria,
        nextSteps: generateSectionNextSteps(sectionKey, sectionAnalysis),
        examples: generateExamples(sectionKey)
    };
}

/**
 * Generate quick wins for a section
 * @param {string} sectionKey - Section key
 * @param {Object} sectionAnalysis - Section analysis
 * @returns {Array} Quick win suggestions
 */
function generateQuickWins(sectionKey, sectionAnalysis) {
    const quickWins = [];
    
    sectionAnalysis.criteria.forEach(criterion => {
        if (criterion.score === 0) {
            const section = S4_SCORING_GUIDELINES[sectionKey];
            const guideline = section.criteria.find(c => c.name === criterion.name);
            
            if (guideline && guideline.keywords) {
                quickWins.push({
                    criterion: criterion.name,
                    suggestion: `Include keywords like: ${guideline.keywords.slice(0, 3).join(', ')}`,
                    impact: criterion.maxScore,
                    difficulty: 'easy'
                });
            }
        }
    });
    
    return quickWins;
}

/**
 * Generate section-specific next steps
 * @param {string} sectionKey - Section key
 * @param {Object} sectionAnalysis - Section analysis
 * @returns {Array} Next step recommendations
 */
function generateSectionNextSteps(sectionKey, sectionAnalysis) {
    const nextSteps = [];
    const section = S4_SCORING_GUIDELINES[sectionKey];
    
    if (sectionAnalysis.score < sectionAnalysis.maxScore * 0.5) {
        nextSteps.push({
            priority: 'high',
            action: `Review ${section.name} training materials`,
            description: section.description
        });
    }
    
    sectionAnalysis.improvements.forEach(improvement => {
        nextSteps.push({
            priority: 'medium',
            action: improvement,
            description: 'Focus on this in your next customer interaction'
        });
    });
    
    return nextSteps;
}

/**
 * Generate examples for a section
 * @param {string} sectionKey - Section key
 * @returns {Array} Example phrases and approaches
 */
function generateExamples(sectionKey) {
    const examples = {
        s1: [
            "Hello, this is [Name] from Comcast. How can I assist you today?",
            "I understand your frustration with this issue, and I'm here to help resolve it.",
            "Let me verify your account information so we can get this taken care of for you."
        ],
        s2: [
            "Can you tell me more about when this issue started?",
            "The problem is caused by [reason], and here's how we'll fix it: [solution]",
            "I'd like to capture your email address for important account updates."
        ],
        s3: [
            "Since we've resolved your internet issue, I'd like to show you how our enhanced security package can prevent future problems.",
            "This upgrade would give you faster speeds and better reliability for your business needs.",
            "Would you like me to add this service to your account today?"
        ],
        s4: [
            "Let me summarize what we've accomplished today and what you can expect next.",
            "Is there anything else I can help you with today?",
            "Thank you for choosing Comcast, and have a great day!"
        ],
        behaviors: [
            "I completely understand your concern about this.",
            "Let me take care of that for you right away.",
            "I appreciate your patience while I look into this."
        ]
    };
    
    return examples[sectionKey] || [];
}