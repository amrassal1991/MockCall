/**
 * Message handling utilities for the call simulator
 * Handles message processing, validation, and formatting
 */

/**
 * Process voice commands from speech recognition
 * @param {string} transcript - Raw transcript from speech recognition
 * @returns {Object} Processed command with action and message
 */
export function processVoiceCommand(transcript) {
    const command = transcript.toLowerCase().trim();
    
    // Check for send commands in English and Spanish
    if (command.endsWith('send') || command.endsWith('enviar')) {
        const messageToSend = transcript.replace(/send|enviar/gi, '').trim();
        return {
            action: 'send',
            message: messageToSend,
            isCommand: true
        };
    }
    
    // Check for other commands
    if (command === 'clear' || command === 'limpiar') {
        return {
            action: 'clear',
            message: '',
            isCommand: true
        };
    }
    
    if (command === 'new call' || command === 'nueva llamada') {
        return {
            action: 'newCall',
            message: '',
            isCommand: true
        };
    }
    
    // Default: just text input
    return {
        action: 'input',
        message: transcript,
        isCommand: false
    };
}

/**
 * Validate message content
 * @param {string} message - Message to validate
 * @returns {Object} Validation result
 */
export function validateMessage(message) {
    const result = {
        isValid: true,
        errors: [],
        warnings: []
    };
    
    if (message === null || message === undefined || typeof message !== 'string') {
        result.isValid = false;
        result.errors.push('Message must be a non-empty string');
        return result;
    }
    
    const trimmed = message.trim();
    
    if (trimmed.length === 0) {
        result.isValid = false;
        result.errors.push('Message cannot be empty');
        return result;
    }
    
    if (trimmed.length > 1000) {
        result.warnings.push('Message is very long and may be truncated');
    }
    
    // Check for potentially problematic content
    const problematicPatterns = [
        /\b(fuck|shit|damn)\b/gi,
        /\b(idiot|stupid|moron)\b/gi
    ];
    
    if (problematicPatterns.some(pattern => pattern.test(trimmed))) {
        result.warnings.push('Message contains potentially unprofessional language');
    }
    
    return result;
}

/**
 * Format message for display
 * @param {string} message - Raw message
 * @param {string} sender - Message sender ('agent', 'customer', 'system')
 * @param {string} timestamp - Message timestamp
 * @returns {Object} Formatted message object
 */
export function formatMessage(message, sender, timestamp = null) {
    return {
        id: generateMessageId(),
        text: message.trim(),
        sender: sender,
        timestamp: timestamp || new Date().toISOString(),
        formatted: true
    };
}

/**
 * Generate unique message ID
 * @returns {string} Unique message identifier
 */
export function generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract customer persona prompt based on scenario
 * @param {string} customerName - Customer name
 * @param {string} complaint - Customer complaint
 * @param {string} language - Language code
 * @returns {string} Persona prompt for AI
 */
export function generatePersonaPrompt(customerName, complaint, language = 'en-US') {
    if (language === 'es-ES') {
        return `Eres un cliente de habla hispana llamado ${customerName}. Tu problema es: "${complaint}". Estás frustrado pero intentas ser educado. Mantén tus respuestas relativamente cortas. NO resuelvas el problema demasiado rápido. Si el agente te da una buena solución, acéptala.`;
    }
    
    return `You are a customer named ${customerName}. Your issue is: "${complaint}". You are frustrated but trying to be polite. Keep your responses relatively short. DO NOT solve the issue too quickly. If the agent gives a good resolution, accept it.`;
}

/**
 * Check if message contains timeout indicators
 * @param {string} message - Message to check
 * @returns {boolean} True if message indicates timeout
 */
export function isTimeoutMessage(message) {
    return !message || message.trim().length === 0;
}

/**
 * Generate automatic timeout message
 * @param {string} language - Language code
 * @returns {string} Timeout message
 */
export function generateTimeoutMessage(language = 'en-US') {
    if (language === 'es-ES') {
        return 'Se agotó el tiempo de espera. El mensaje se envía automáticamente.';
    }
    return 'Timeout reached. Message sent automatically.';
}

/**
 * Clean and sanitize message content
 * @param {string} message - Raw message
 * @returns {string} Cleaned message
 */
export function sanitizeMessage(message) {
    if (!message || typeof message !== 'string') {
        return '';
    }
    
    return message
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .substring(0, 1000); // Limit length
}

/**
 * Check if message requires immediate response
 * @param {string} message - Message to analyze
 * @returns {boolean} True if urgent response needed
 */
export function isUrgentMessage(message) {
    const urgentKeywords = [
        'emergency', 'urgent', 'immediately', 'now', 'asap',
        'emergencia', 'urgente', 'inmediatamente', 'ahora'
    ];
    
    const lowerMessage = message.toLowerCase();
    return urgentKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Extract key information from customer message
 * @param {string} message - Customer message
 * @returns {Object} Extracted information
 */
export function extractMessageInfo(message) {
    const info = {
        hasQuestion: message.includes('?'),
        hasComplaint: false,
        hasRequest: false,
        sentiment: 'neutral',
        keywords: []
    };
    
    const lowerMessage = message.toLowerCase();
    
    // Check for complaint indicators
    const complaintWords = ['problem', 'issue', 'wrong', 'error', 'problema', 'error', 'mal'];
    info.hasComplaint = complaintWords.some(word => lowerMessage.includes(word));
    
    // Check for request indicators
    const requestWords = ['please', 'can you', 'could you', 'help', 'por favor', 'puedes', 'ayuda'];
    info.hasRequest = requestWords.some(word => lowerMessage.includes(word));
    
    // Basic sentiment analysis
    const positiveWords = ['good', 'great', 'thanks', 'bueno', 'gracias'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'malo', 'terrible', 'odio'];
    
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) {
        info.sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
        info.sentiment = 'negative';
    }
    
    return info;
}