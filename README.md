# MockCall - AI Call Simulator

An AI-powered call simulation training tool with speech recognition, text-to-speech, and quality scoring capabilities. Supports both English and Spanish languages.

## Features

- **Speech Recognition**: Real-time voice input with automatic timeout
- **Text-to-Speech**: Seamless voice output for AI responses
- **Bilingual Support**: Full English and Spanish language support
- **Quality Scoring**: Real-time quality assessment based on S4 methodology
- **AI Customer Simulation**: Realistic customer personas with various complaint scenarios
- **Quality Insights**: Performance analytics and improvement recommendations

## Project Structure

```
MockCall/
├── src/                    # Source modules
│   ├── complaints.js       # Customer complaint scenarios database
│   ├── speechService.js    # Speech recognition and TTS service
│   ├── qualityScoring.js   # Quality assessment and scoring system
│   └── messageHandler.js   # Message processing and validation
├── tests/                  # Test files
│   ├── setup.js           # Test environment setup
│   ├── complaints.test.js  # Complaints database tests
│   ├── speechService.test.js # Speech service tests
│   ├── qualityScoring.test.js # Quality scoring tests
│   └── messageHandler.test.js # Message handler tests
├── index.html             # Main application file
├── Complains.js          # Legacy complaints file
├── Qualitys4.html        # Quality guidelines
└── package.json          # Project configuration
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
- **Overall**: 93.69% statement coverage
- **Complaints Module**: 100% coverage
- **Message Handler**: 100% coverage  
- **Quality Scoring**: 100% coverage
- **Speech Service**: 81.48% coverage

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