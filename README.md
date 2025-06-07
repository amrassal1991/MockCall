# MockCall - AI Call Simulator

An AI-powered call simulation training tool with speech recognition, text-to-speech, and quality scoring capabilities. Supports both English and Spanish languages.

## Features

### Core Functionality
- **Speech Recognition**: Real-time voice input with automatic timeout
- **Text-to-Speech**: Seamless voice output for AI responses
- **Bilingual Support**: Full English and Spanish language support
- **Quality Scoring**: Real-time quality assessment based on S4 methodology
- **AI Customer Simulation**: Realistic customer personas with various complaint scenarios
- **Quality Insights**: Performance analytics and improvement recommendations

### Enhanced Features
- **🔧 ITG (Issue Type Guide)**: 7-category issue classification system
  - Billing, Technical, Account, Service, Complaint, Sales, General
  - Professional modal dialogs with detailed descriptions
  - Streamlined call routing and categorization

- **📋 LLQ (Line Level Qualification)**: Advanced troubleshooting system
  - Step-by-step documentation workflow
  - Manual step input with "Add Step" functionality
  - Individual step deletion and management
  - Save troubleshooting documentation for call records

- **📊 Call Flow Management**: Comprehensive call tracking
  - 10-interaction limit with progress monitoring
  - Real-time call progress indicators
  - Automatic call completion handling
  - Quality score tracking throughout the call

- **🎯 Real-time Quality Feedback**: Live analysis during calls
  - Instant feedback on agent performance
  - Quality insights and recommendations
  - Performance trend tracking
  - Visual score indicators with detailed breakdowns

- **🛠️ System Navigation**: Professional user interface
  - Modal-based navigation system
  - Responsive design with modern styling
  - Intuitive button layout and accessibility
  - Seamless integration with existing features

## Project Structure

```
MockCall/
├── src/                           # Source modules
│   ├── complaints.js              # Customer complaint scenarios database
│   ├── speechService.js           # Speech recognition and TTS service
│   ├── qualityScoring.js          # Quality assessment and scoring system
│   ├── messageHandler.js          # Message processing and validation
│   ├── callFlowManager.js         # Call flow management and progress tracking
│   ├── systemNavigation.js       # ITG and LLQ system navigation
│   ├── realTimeQualityFeedback.js # Live quality analysis and feedback
│   └── s4QualityAnalyzer.js       # S4 methodology quality analyzer
├── tests/                         # Test files
│   ├── setup.js                   # Test environment setup
│   ├── complaints.test.js         # Complaints database tests
│   ├── speechService.test.js      # Speech service tests
│   ├── qualityScoring.test.js     # Quality scoring tests
│   ├── messageHandler.test.js     # Message handler tests
│   ├── callFlowManager.test.js    # Call flow management tests
│   ├── systemNavigation.test.js   # System navigation tests
│   ├── realTimeQualityFeedback.test.js # Quality feedback tests
│   └── s4QualityAnalyzer.test.js  # S4 analyzer tests
├── css/                           # Stylesheets
│   └── enhanced-features.css      # Enhanced features styling
├── index.html                     # Main application file
├── test-modules.html              # Module testing and debugging page
├── Complains.js                   # Legacy complaints file
├── Qualitys4.html                 # Quality guidelines
├── CHANGELOG.md                   # Project changelog
└── package.json                   # Project configuration
```

## Testing

The project includes comprehensive unit tests with excellent coverage:

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

Current test coverage:
- **Overall**: 77.12% statement coverage (298 tests passing)
- **Complaints Module**: 100% coverage
- **Message Handler**: 100% coverage  
- **Quality Scoring**: 100% coverage
- **Speech Service**: 81.48% coverage
- **Call Flow Manager**: Comprehensive test coverage
- **System Navigation**: Full feature testing
- **Quality Feedback**: Real-time analysis testing

### Test Structure

- **Unit Tests**: Each module has comprehensive unit tests covering all public functions
- **Mock Setup**: Browser APIs (Speech Recognition, Speech Synthesis) are properly mocked
- **Edge Cases**: Tests cover error conditions, edge cases, and invalid inputs
- **Bilingual Testing**: Tests verify both English and Spanish functionality

## Language Support

### English and Spanish
The application fully supports both languages:

- **Speech Recognition**: Recognizes voice commands in both languages
- **Text-to-Speech**: Speaks responses in the selected language
- **UI Messages**: All user interface text is localized
- **Customer Scenarios**: All complaint scenarios include both English and Spanish versions
- **Voice Commands**: Supports commands like "send"/"enviar", "clear"/"limpiar"

### Adding New Languages

To add support for additional languages:

1. Add language-specific complaint text in `src/complaints.js`
2. Update persona prompts in `messageHandler.js`
3. Add voice command translations in `processVoiceCommand()`
4. Update timeout messages in `generateTimeoutMessage()`

## Speech Features

### Speech-to-Text
- Continuous recognition with interim results
- Automatic timeout handling
- Language-specific recognition
- Voice command processing ("send", "clear", "new call")

### Text-to-Speech
- Automatic speech after customer responses
- Configurable voice parameters (rate, pitch, volume)
- Language-appropriate voice selection
- Seamless integration with conversation flow

### Voice Commands
- **"send"/"enviar"**: Send the current message
- **"clear"/"limpiar"**: Clear the input field
- **"new call"/"nueva llamada"**: Start a new call simulation

## Quality Scoring

The quality scoring system is based on Comcast S4 methodology:

### Scoring Sections
1. **S1 - START** (22 points): Greeting, empathy, agenda setting
2. **S2 - SOLVE** (27 points): Information gathering, problem resolution
3. **S3 - SELL** (20 points): Offer presentation, objection handling
4. **S4 - SUMMARIZE** (14 points): Action summary, call closure
5. **BEHAVIORS** (17 points): Tone, listening, rapport building

### Quality Features
- Real-time message analysis
- Performance trend tracking
- Automated insights and recommendations
- Visual score indicators with emojis
- Detailed feedback for improvement

## Enhanced Features Usage

### ITG (Issue Type Guide) System
1. Click the **🔧** button in the top navigation
2. Select from 7 issue categories:
   - **Billing**: Payment, charges, billing disputes
   - **Technical**: Service outages, equipment issues
   - **Account**: Account changes, security, access
   - **Service**: Service requests, installations
   - **Complaint**: Service complaints, escalations
   - **Sales**: New services, upgrades, promotions
   - **General**: General inquiries, information requests
3. Use the categorization to route calls appropriately

### LLQ (Line Level Qualification) Troubleshooting
1. Click the **📋** button to open troubleshooting documentation
2. Add troubleshooting steps manually:
   - Type step description in the input field
   - Click "Add Step" to add to the list
   - Steps are automatically numbered
3. Manage steps:
   - Delete individual steps using the ❌ button
   - Steps renumber automatically
4. Save documentation for call records

### Call Flow Management
- **Progress Tracking**: Monitor call progress with visual indicators
- **Interaction Limits**: Automatic handling of 10-interaction limit
- **Quality Monitoring**: Real-time quality score tracking
- **Call Completion**: Automatic call wrap-up and reporting

### Real-time Quality Feedback
- **Live Analysis**: Instant feedback during conversations
- **Performance Insights**: Detailed recommendations for improvement
- **Score Tracking**: Visual indicators with emoji-based scoring
- **Trend Analysis**: Performance tracking over multiple interactions

## Development

### Prerequisites
- Node.js 14+ 
- Modern web browser with Speech API support

### Setup
```bash
# Install dependencies
npm install

# Run development server
npm run serve

# Run tests
npm test
```

### Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox (limited speech support)
- Safari (limited speech support)
- Edge (limited speech support)

## API Integration

The application integrates with AI services for:
- Customer persona simulation
- Quality assessment
- Response generation

Configure API endpoints in the main application file.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.