// Customer Complaints Database for Comcast Social Medium Business
export const complaints = {
    internet: [
        {
            id: "int_001",
            type: "Service Interruption",
            scenario: "Internet service has been intermittent for the past 24 hours, affecting business operations",
            initialComplaint: { 
                "en-US": "My business internet keeps dropping every hour! We've lost thousands in sales because our payment system is down. This is completely unacceptable for a business account!", 
                "es-ES": "¡El internet de mi negocio se cae cada hora! Hemos perdido miles en ventas porque nuestro sistema de pago no funciona. ¡Esto es completamente inaceptable para una cuenta de negocios!"
            }, 
            customerName: "Maria Garcia",
            difficulty: "high", 
            customerType: "Frustrated", 
            topic: "Internet Service"
        },
        {
            id: "int_002",
            type: "Speed Issues",
            scenario: "Business customer reporting significantly slower speeds than promised",
            initialComplaint: { 
                "en-US": "We're only getting 50Mbps when we're paying for 300Mbps. Our video conferences with clients keep freezing!", 
                "es-ES": "Solo estamos recibiendo 50Mbps cuando pagamos por 300Mbps. ¡Nuestras videoconferencias con clientes se congelan!"
            }, 
            customerName: "John Smith",
            difficulty: "medium", 
            customerType: "Inquiry", 
            topic: "Internet Speed"
        }
    ],
    billing: [
        {
            id: "bill_001",
            type: "Incorrect Charge",
            scenario: "Customer sees an unexpected charge on their monthly bill",
            initialComplaint: { 
                "en-US": "Why was I charged for 'premium support'? I never asked for that and I want it removed immediately.", 
                "es-ES": "¿Por qué me cobraron por 'soporte premium'? Nunca lo pedí y quiero que lo quiten de inmediato."
            }, 
            customerName: "David Chen",
            difficulty: "low", 
            customerType: "Inquiry", 
            topic: "Billing"
        }
    ],
    fraud: [
        {
            id: "fraud_001",
            type: "Unauthorized Activity",
            scenario: "Customer reports suspicious activity on their account",
            initialComplaint: { 
                "en-US": "Someone used my account to order services I didn't authorize! This is fraud!", 
                "es-ES": "¡Alguien usó mi cuenta para pedir servicios que no autoricé! ¡Esto es un fraude!"
            },
            customerName: "Sarah Connor",
            difficulty: "critical",
            customerType: "Fraudster (Simulated)",
            topic: "Account Security"
        }
    ],
    technical: [
        {
            id: "tech_001",
            type: "Technical Support",
            scenario: "Customer needs help setting up new equipment",
            initialComplaint: { 
                "en-US": "I just got my new modem, but I can't get it to connect to the internet. Can you walk me through it?", 
                "es-ES": "Acabo de recibir mi nuevo módem, pero no puedo conectarlo a internet. ¿Puedes guiarme?"
            },
            customerName: "Robert Johnson",
            difficulty: "low",
            customerType: "Inquiry",
            topic: "Technical Support"
        }
    ],
    rude: [
        {
            id: "rude_001",
            type: "Service Complaint",
            scenario: "Customer is extremely angry about a recent service interaction",
            initialComplaint: { 
                "en-US": "This is the third time I've called about this! Your service is absolutely terrible, and I want to speak to a supervisor NOW!", 
                "es-ES": "¡Esta es la tercera vez que llamo por esto! ¡Su servicio es absolutamente terrible y quiero hablar con un supervisor AHORA MISMO!"
            },
            customerName: "Karen Miller",
            difficulty: "critical",
            customerType: "Rude",
            topic: "Service Complaint"
        }
    ]
};

/**
 * Get all available scenarios from complaints database
 * @returns {Array} Array of all complaint scenarios
 */
export function getAllScenarios() {
    return Object.values(complaints).flat();
}

/**
 * Filter scenarios by customer type
 * @param {string} customerType - The customer type to filter by
 * @returns {Array} Filtered scenarios
 */
export function filterByCustomerType(customerType) {
    if (customerType === 'Any') return getAllScenarios();
    return getAllScenarios().filter(scenario => scenario.customerType === customerType);
}

/**
 * Filter scenarios by topic
 * @param {string} topic - The topic to filter by
 * @returns {Array} Filtered scenarios
 */
export function filterByTopic(topic) {
    if (topic === 'Any') return getAllScenarios();
    return getAllScenarios().filter(scenario => scenario.topic === topic);
}

/**
 * Get a random scenario from filtered results
 * @param {string} customerType - Customer type filter
 * @param {string} topic - Topic filter
 * @returns {Object} Random scenario object
 */
export function getRandomScenario(customerType = 'Any', topic = 'Any') {
    let availableScenarios = getAllScenarios();
    
    if (customerType !== 'Any') {
        availableScenarios = filterByCustomerType(customerType);
    }
    if (topic !== 'Any') {
        availableScenarios = availableScenarios.filter(s => s.topic === topic);
    }
    
    if (availableScenarios.length === 0) {
        availableScenarios = getAllScenarios(); // Fallback to all scenarios
    }
    
    return availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
}