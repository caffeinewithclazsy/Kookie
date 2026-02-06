<div align="center">
  <h1>🍪 Kookie: Multimodal AI Companion</h1>
  <p>A voice-first AI companion that adapts its personality based on your tone and emotional state</p>
</div>

## 🌟 Features

- **🎙️ Voice-First Interaction**: Natural conversation through microphone input
- **🧠 Adaptive Empathy**: Analyzes tone, pacing, and emotional state
- **🎭 Personality Modes**: Switches between tutor and friend modes automatically
- **📝 Real-time Transcription**: Live audio-to-text conversion with visualization
- **🔮 Emotional Intelligence**: Context-aware responses based on user sentiment
- **🎨 Interactive UI**: Dynamic orb visualization that responds to voice input

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- A Google Gemini API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/caffeinewithclazsy/Kookie.git
   cd Kookie
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your API key:**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Visit `http://localhost:3000` (or the port shown in terminal)

## 🎛️ Usage

1. **Click the microphone button** (🎤) to start recording
2. **Allow microphone access** when prompted by your browser
3. **Speak naturally** - Kookie will:
   - Visualize your voice input through the animated orb
   - Transcribe your speech in real-time
   - Respond with appropriate personality mode
4. **Click stop** (⏹️) when finished to see the complete transcription

## 🛠️ Development

### Project Structure
```
kookie/
├── components/
│   ├── Orb.tsx          # Animated voice visualization
│   └── TranscriptionPanel.tsx  # Conversation display
├── utils/
│   └── audioHelpers.ts  # Audio processing utilities
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite configuration
└── package.json        # Project dependencies
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables
- `GEMINI_API_KEY` - Your Google Gemini API key (required)

## 🔧 Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6.2
- **AI Backend**: Google Gemini API
- **Audio Processing**: Web Audio API
- **Styling**: Tailwind CSS
- **Deployment**: Ready for Google AI Studio

## 🎯 Key Features Explained

### Adaptive Personality System
Kookie automatically switches between two modes:
- **Tutor Mode**: Educational and informative responses
- **Friend Mode**: Casual and conversational interactions

The mode is determined by analyzing your:
- Speech patterns
- Question complexity
- Tone and pacing
- Contextual cues

### Audio Processing
- Real-time microphone input handling
- Advanced noise suppression and echo cancellation
- Audio level visualization
- PCM audio format processing

### Transcription System
- Live audio-to-text conversion
- Timestamped conversation history
- Formatted output display
- Error handling and recovery

## 🔒 Privacy & Security

- All audio processing happens locally in your browser
- No audio data is stored or transmitted without your consent
- API keys are stored locally in environment variables
- Microphone access is requested only when needed

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini API for the AI capabilities
- React and Vite communities for excellent development tools
- Web Audio API for audio processing capabilities

## 📞 Support

For support, email kundanpatil311007@gmailgit .com or open an issue in the repository.

---
<div align="center">
  <p>Built with ❤️ using React, TypeScript, and Google AI</p>
</div>