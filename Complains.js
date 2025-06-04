// Customer Complaints Database for Comcast Social Medium Business
export const complaints = {
    internet: [
        {
            id: "int_001",
            type: "Service Interruption",
            scenario: "Internet service has been intermittent for the past 24 hours, affecting business operations",
            initialComplaint: "My business internet keeps dropping every hour! We've lost thousands in sales because our payment system is down. This is completely unacceptable for a business account!",
            difficulty: "high",
            businessImpact: "High - Payment system affected",
            expectedResponses: [
                "Acknowledge urgency for business customer",
                "Express understanding of revenue impact",
                "Immediate troubleshooting steps",
                "Offer business-specific solution/compensation"
            ]
        },
        {
            id: "int_002",
            type: "Speed Issues",
            scenario: "Business customer reporting significantly slower speeds than promised in their plan",
            initialComplaint: "We're only getting 50Mbps when we're paying for 300Mbps. Our video conferences with clients keep freezing!",
            difficulty: "medium",
            businessImpact: "Medium - Client communications affected",
            expectedResponses: [
                "Verify plan details",
                "Run speed test",
                "Check peak usage times",
                "Discuss business-grade solutions"
            ]
        }
    ],
    billing: [
        {
            id: "bill_001",
            type: "Unexpected Charges",
            scenario: "Business owner finds unexpected equipment charges on their bill",
            initialComplaint: "There's a $200 charge for equipment we never received! This is the third billing issue in two months!",
            difficulty: "high",
            businessImpact: "Medium - Financial impact",
            expectedResponses: [
                "Immediate bill review",
                "Clear explanation of charges",
                "Quick resolution timeline",
                "Preventive measures for future"
            ]
        },
        {
            id: "bill_002",
            type: "Contract Dispute",
            scenario: "Customer disputes automatic renewal terms of business contract",
            initialComplaint: "Nobody told me the contract would auto-renew for two years! We're opening a new location and need to revise our services.",
            difficulty: "high",
            businessImpact: "High - Business expansion affected",
            expectedResponses: [
                "Review contract terms",
                "Explain renewal process",
                "Discuss business growth options",
                "Offer contract flexibility"
            ]
        }
    ],
    support: [
        {
            id: "supp_001",
            type: "Response Time",
            scenario: "Business customer waited 48 hours for critical support response",
            initialComplaint: "I've been trying to get help for two days! We're a business customer paying premium rates for supposedly priority support!",
            difficulty: "high",
            businessImpact: "High - Business operations affected",
            expectedResponses: [
                "Immediate acknowledgment of delay",
                "Explain priority support process",
                "Immediate escalation",
                "Preventive measures discussion"
            ]
        },
        {
            id: "supp_002",
            type: "Installation Delay",
            scenario: "New business setup delayed due to installation scheduling",
            initialComplaint: "Our grand opening is in 3 days and the internet still isn't installed! We can't delay opening our business!",
            difficulty: "high",
            businessImpact: "Critical - Business opening affected",
            expectedResponses: [
                "Acknowledge critical timeline",
                "Immediate escalation to field ops",
                "Provide temporary solution",
                "Compensation discussion"
            ]
        }
    ],
    equipment: [
        {
            id: "equip_001",
            type: "Hardware Malfunction",
            scenario: "Business router repeatedly rebooting during peak hours",
            initialComplaint: "Our router keeps rebooting during lunch rush! We can't process any card payments and customers are leaving!",
            difficulty: "medium",
            businessImpact: "High - Revenue directly affected",
            expectedResponses: [
                "Immediate technical assessment",
                "Temporary workaround",
                "Equipment replacement options",
                "Business interruption compensation"
            ]
        }
    ]
};

// Difficulty weights for scoring
export const difficultyWeights = {
    low: 1.0,
    medium: 1.2,
    high: 1.5,
    critical: 2.0
};

// Response time expectations (in minutes)
export const responseTimeTargets = {
    initial: 5,
    followup: 10,
    resolution: {
        low: 60,
        medium: 45,
        high: 30,
        critical: 15
    }
};
