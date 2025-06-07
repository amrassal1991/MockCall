/**
 * Quality Scoring System for Call Analysis
 * Based on Comcast S4 Quality Training Material guidelines
 */

export const SCORING_GUIDELINES = {
    s1: {
        name: "START",
        maxPoints: 22,
        criteria: [
            { name: "Greeting", maxScore: 3, description: "Agent greets clearly (Comcast Name, Agent First Name, offer assistance)" },
            { name: "Reflect, Relate, Empathize", maxScore: 15, description: "Reflects call reason, empathizes with customer, assures action" },
            { name: "Set Agenda / Auth / Plant Seed", maxScore: 4, description: "Sets agenda, authenticates caller, plants seed for account review" }
        ]
    },
    s2: {
        name: "SOLVE",
        maxPoints: 27,
        criteria: [
            { name: "Obtain Info / Probe", maxScore: 7, description: "Asks effective questions, probes root causes" },
            { name: "Resolve / Address Issue(s)", maxScore: 14, description: "Explains problem cause, provides complete resolution, educates on prevention" },
            { name: "Build Value / Enhance", maxScore: 6, description: "Attempts email capture AND builds value of EXISTING Comcast products/services" }
        ]
    },
    s3: {
        name: "SELL",
        maxPoints: 20,
        criteria: [
            { name: "Transition to Relevant Offer", maxScore: 6, description: "Transitions after resolving issue, uses bridging statements" },
            { name: "Present Offer", maxScore: 6, description: "Presents tailored recommendation, discusses benefits/value" },
            { name: "Overcome Objections", maxScore: 4, description: "Acknowledges objection, attempts to overcome resistance" },
            { name: "Proactively Ask for the Sale", maxScore: 4, description: "Uses closing techniques (choice, assumptive, urgency)" }
        ]
    },
    s4: {
        name: "SUMMARIZE",
        maxPoints: 14,
        criteria: [
            { name: "Summarize Actions", maxScore: 7, description: "Provides clear next steps, documents resolution" },
            { name: "Close Contact", maxScore: 4, description: "Offers additional assistance, personalized closing" },
            { name: "Documentation", maxScore: 3, description: "Documents caller, reason, resolution/actions" }
        ]
    },
    behaviors: {
        name: "BEHAVIORS",
        maxPoints: 17,
        criteria: [
            { name: "Tone, Confidence & Clarity", maxScore: 3, description: "Professional, pleasant, clear, unrushed pace" },
            { name: "Active Listening", maxScore: 3, description: "Verbal cues, avoids interruption, references customer info" },
            { name: "Contact Management", maxScore: 3, description: "Minimizes dead air (<20s), manages holds (<60s)" },
            { name: "Acknowledge / Take Responsibility", maxScore: 4, description: "Assures solution, positive language, avoids blame" },
            { name: "Build Rapport / Demonstrate Concern", maxScore: 4, description: "Genuine interest, acknowledges feelings, personalizes interaction" }
        ]
    }
};

/**
 * Calculate total possible score
 * @returns {number} Maximum possible score
 */
export function getMaxPossibleScore() {
    return Object.values(SCORING_GUIDELINES).reduce((total, section) => total + section.maxPoints, 0);
}

/**
 * Analyze message for quality indicators
 * @param {string} message - Agent message to analyze
 * @param {string} context - Context of the conversation
 * @returns {Object} Quality analysis result
 */
export function analyzeMessageQuality(message, context = '') {
    const analysis = {
        score: 0,
        maxScore: 10,
        feedback: [],
        strengths: [],
        improvements: []
    };

    const lowerMessage = message.toLowerCase();
    
    // Check for greeting elements
    if (lowerMessage.includes('comcast') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        analysis.score += 2;
        analysis.strengths.push('Good greeting');
    }

    // Check for empathy
    const empathyWords = ['understand', 'sorry', 'apologize', 'help', 'assist', 'concern'];
    if (empathyWords.some(word => lowerMessage.includes(word))) {
        analysis.score += 2;
        analysis.strengths.push('Shows empathy');
    }

    // Check for professionalism
    if (!lowerMessage.includes('um') && !lowerMessage.includes('uh') && message.length > 10) {
        analysis.score += 2;
        analysis.strengths.push('Professional communication');
    }

    // Check for questions (probing)
    if (message.includes('?')) {
        analysis.score += 2;
        analysis.strengths.push('Asks clarifying questions');
    }

    // Check for solution-oriented language
    const solutionWords = ['resolve', 'fix', 'solution', 'help', 'address'];
    if (solutionWords.some(word => lowerMessage.includes(word))) {
        analysis.score += 2;
        analysis.strengths.push('Solution-focused approach');
    }

    // Generate feedback
    if (analysis.score < 4) {
        analysis.improvements.push('Consider adding more empathy and professional language');
    }
    if (!message.includes('?') && context !== 'closing') {
        analysis.improvements.push('Ask more probing questions to understand the issue');
    }

    return analysis;
}

/**
 * Generate quality score with emoji indicator
 * @param {number} score - Current score
 * @param {number} maxScore - Maximum possible score
 * @returns {Object} Score with emoji and color
 */
export function getScoreWithIndicator(score, maxScore) {
    const percentage = (score / maxScore) * 100;
    
    let emoji, color, level;
    
    if (percentage >= 80) {
        emoji = '🟢';
        color = 'text-green-400';
        level = 'Excellent';
    } else if (percentage >= 60) {
        emoji = '🟡';
        color = 'text-yellow-400';
        level = 'Good';
    } else if (percentage >= 40) {
        emoji = '🟠';
        color = 'text-orange-400';
        level = 'Needs Improvement';
    } else {
        emoji = '🔴';
        color = 'text-red-400';
        level = 'Poor';
    }
    
    return { emoji, color, level, percentage: Math.round(percentage) };
}

/**
 * Generate insights for quality improvement
 * @param {Array} qualityScores - Array of quality scores from the conversation
 * @returns {Object} Insights and recommendations
 */
export function generateQualityInsights(qualityScores) {
    if (qualityScores.length === 0) {
        return {
            overallTrend: 'No data available',
            recommendations: ['Start the conversation to receive quality feedback'],
            averageScore: 0
        };
    }

    const scores = qualityScores.map(q => q.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Analyze trend
    let trend = 'stable';
    if (scores.length > 1) {
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 1) trend = 'improving';
        else if (secondAvg < firstAvg - 1) trend = 'declining';
    }

    // Generate recommendations
    const recommendations = [];
    
    if (averageScore < 5) {
        recommendations.push('Focus on empathy and active listening');
        recommendations.push('Ask more probing questions to understand customer needs');
    }
    
    if (trend === 'declining') {
        recommendations.push('Maintain energy and engagement throughout the call');
    }
    
    if (averageScore >= 7) {
        recommendations.push('Great job! Continue with current approach');
    } else {
        recommendations.push('Practice S4 methodology: Start, Solve, Sell, Summarize');
    }

    return {
        overallTrend: trend,
        recommendations,
        averageScore: Math.round(averageScore * 10) / 10
    };
}

/**
 * Validate quality score object
 * @param {Object} scoreObj - Quality score object to validate
 * @returns {boolean} True if valid
 */
export function validateQualityScore(scoreObj) {
    if (!scoreObj || scoreObj === null || scoreObj === undefined) {
        return false;
    }
    
    return typeof scoreObj.score === 'number' && 
           typeof scoreObj.maxScore === 'number' &&
           scoreObj.score >= 0 && 
           scoreObj.score <= scoreObj.maxScore &&
           Array.isArray(scoreObj.feedback);
}