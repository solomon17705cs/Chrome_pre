# AI Assistant Chrome Extension

A Chrome extension that uses Chrome's built-in AI APIs (Prompt API, Summarizer API, Writer API, and Rewriter API) to provide various AI-powered features.

## Features

### Chat with Multiple Modes
- **💬 Chat**: Normal conversation with AI
- **🧠 Mind Map**: Generate mind maps in NotebookLM-style format
- **🗺️ Roadmap**: Create project roadmaps with phases and timelines
- **📇 Flashcard**: Generate study flashcards
- **📊 PowerPoint**: Create presentation outlines

### Summarize
Summarize text with customizable options:
- **Types**: Key Points, TL;DR, Teaser, Headline
- **Lengths**: Short, Medium, Long
- **Formats**: Markdown, Plain Text

### Write
Generate new content with:
- **Tones**: Formal, Neutral, Casual
- **Lengths**: Short, Medium, Long
- **Formats**: Markdown, Plain Text

### Rewrite
Rewrite existing text with:
- **Tones**: More Formal, As Is, More Casual
- **Lengths**: Shorter, As Is, Longer
- **Formats**: As Is, Markdown, Plain Text

## Requirements

Before using this extension, ensure your system meets these requirements:

### Operating System
- Windows 10 or 11
- macOS 13+ (Ventura and onwards)
- Linux
- ChromeOS (Platform 16389.0.0+) on Chromebook Plus devices

### Hardware
- **Storage**: At least 22 GB free space on your Chrome profile volume
- **GPU**: More than 4 GB VRAM, OR
- **CPU**: 16 GB RAM + 4 CPU cores minimum
- **Network**: Unlimited/unmetered connection (required for model download)

### Browser
- Chrome 128+ with AI features enabled

## Installation

1. **Download or clone this repository**

2. **Open Chrome and navigate to**: `chrome://extensions/`

3. **Enable Developer Mode** (toggle in top right corner)

4. **Click "Load unpacked"**

5. **Select the extension folder** containing `manifest.json`

6. **The extension icon will appear** in your Chrome toolbar

## First-Time Setup

When you first use the extension:

1. Click the extension icon to open the sidebar
2. The AI model will need to be downloaded (about 22 GB)
3. Download requires a user interaction (click anywhere in the extension)
4. Download progress will be displayed in the status indicator
5. Once downloaded, all features will be available

## Usage

### Opening the Extension
Click the extension icon in your Chrome toolbar to open the AI Assistant sidebar on the right side of your browser.

### Chat Mode
1. Select your desired mode (Chat, Mind Map, Roadmap, Flashcard, or PowerPoint)
2. Type your message in the input box
3. Click "Send" or press Enter
4. For multimodal input, click the 📎 button to attach images or audio files

### Summarize
1. Click the "Summarize" tab
2. Configure type, length, and format
3. Paste or type text to summarize
4. Click "Summarize"

### Write
1. Click the "Write" tab
2. Configure tone, length, and format
3. Enter your writing prompt
4. Optionally add context
5. Click "Write"

### Rewrite
1. Click the "Rewrite" tab
2. Configure tone, length, and format
3. Paste text to rewrite
4. Optionally add context
5. Click "Rewrite"

## File Support

The Prompt API (used in Chat modes) supports multimodal input:
- **Images**: PNG, JPG, GIF, etc.
- **Audio**: MP3, WAV, etc.

To use files:
1. Click the 📎 attachment button
2. Select one or more files
3. Files will appear in the preview area
4. Type your message and send

## Privacy & Security

- All AI processing happens **locally on your device**
- No data is sent to external servers
- The Gemini Nano model is downloaded once and stored locally
- Your conversations and content remain private

## Troubleshooting

### "Unavailable" Status
- Check that your system meets hardware requirements
- Ensure you have at least 22 GB free storage
- Verify you're on an unmetered network connection
- Try visiting `chrome://on-device-internals` to check model status

### Model Won't Download
- Click anywhere in the extension to trigger user interaction
- Check your internet connection
- Ensure you're not on a metered connection
- Check storage space

### Slow Performance
- GPU acceleration provides best performance
- Ensure other resource-intensive applications are closed
- Check that your GPU meets the requirements (>4GB VRAM)

## Technical Details

### Architecture
- **Frontend**: HTML, CSS, JavaScript
- **APIs Used**: Chrome Built-in AI APIs
  - Prompt API (via `self.ai.languageModel`)
  - Summarizer API (via `self.ai.summarizer`)
  - Writer API (via `self.ai.writer`)
  - Rewriter API (via `self.ai.rewriter`)

### File Structure
```
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── sidepanel.html         # Main UI
├── styles.css             # Styling
├── app.js                 # Main application logic
├── prompt-api.js          # Prompt API handler
├── summarizer-api.js      # Summarizer API handler
├── writer-api.js          # Writer API handler
├── rewriter-api.js        # Rewriter API handler
└── icons/                 # Extension icons
```

## Permissions

This extension requires:
- `activeTab`: To interact with the current tab
- `sidePanel`: To display the sidebar interface
- `storage`: To save user preferences

## License

MIT License

## Support

For issues or questions:
1. Check the troubleshooting section
2. Visit `chrome://on-device-internals` for model status
3. Check Chrome's AI API documentation

## Acknowledgments

Built using Chrome's experimental Built-in AI APIs powered by Gemini Nano.
