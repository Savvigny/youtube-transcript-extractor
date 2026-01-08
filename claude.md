# YouTube Transcript Extractor & Summarizer - Claude Documentation

A web application that extracts YouTube video transcripts and provides AI-powered summarization using Claude or Gemini.

## Overview

This tool streamlines the process of extracting and summarizing YouTube video content. Simply paste a YouTube URL to get the full transcript, then choose between Claude (Haiku 4.5) or Gemini (2.5 Flash) for intelligent summarization.

## Architecture

### Tech Stack
- **Backend**: Node.js with Express
- **Transcript Extraction**: Python with youtube-transcript-api
- **AI Summarization**:
  - Claude Haiku 4.5 (via Anthropic SDK)
  - Gemini 2.5 Flash (via Google Generative AI SDK)
- **Frontend**: Vanilla HTML/CSS/JavaScript with modern styling

### Project Structure
```
.
├── server.js              # Express server with API endpoints
├── get_transcript.py      # Python script for transcript extraction
├── package.json           # Node.js dependencies
├── .env                   # Environment variables (API keys)
├── .env.example          # Template for environment setup
├── public/
│   └── index.html        # Frontend UI
├── README.md             # General documentation
├── GEMINI.md             # Gemini-specific documentation
└── claude.md             # This file
```

## Features

### Transcript Extraction
- Extracts automated/manual transcripts from any YouTube video
- Supports multiple YouTube URL formats:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`
  - Direct video ID (`VIDEO_ID`)
- Returns full transcript text and segmented data with timestamps
- Comprehensive error handling for edge cases

### AI Summarization
- **Claude Haiku 4.5**: Fast, cost-effective summarization
- **Gemini 2.5 Flash**: Alternative AI model option
- Adaptive word count limits based on transcript length:
  - Short transcripts (<500 words): 200-300 word summary
  - Medium transcripts (<2000 words): ~2000 word summary
  - Long transcripts (2000+ words): ~3000 word summary
- Paragraph-formatted output for readability
- Technical focus with clear, professional language

### User Interface
- Clean, modern gradient design
- Real-time loading states
- One-click transcript copying to clipboard
- Side-by-side transcript and summary display
- Responsive design with smooth animations
- Custom scrollbar styling for content areas

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Python 3
- API keys for:
  - Anthropic (Claude)
  - Google AI (Gemini)

### Installation Steps

1. Install Node.js dependencies:
```bash
npm install
```

2. Install Python dependencies:
```bash
pip3 install youtube-transcript-api
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here  # Optional
```

Get API keys from:
- Anthropic: https://console.anthropic.com/keys
- Gemini: https://aistudio.google.com/app/apikey
- YouTube Data API v3: https://console.cloud.google.com/apis/credentials

4. Start the server:
```bash
npm start
```

5. Open your browser:
```
http://localhost:3000
```

## API Endpoints

### GET /api/transcript
Fetches the transcript for a YouTube video.

**Query Parameters:**
- `url` (required): YouTube video URL or video ID

**Success Response (200):**
```json
{
  "videoId": "dQw4w9WgXcQ",
  "transcript": "Full transcript text...",
  "segments": [
    {
      "text": "Transcript segment",
      "start": 0.0,
      "duration": 2.5
    }
  ]
}
```

**Error Response (400/500):**
```json
{
  "error": "Error message"
}
```

**Error Types:**
- `TranscriptsDisabled`: Video has transcripts disabled
- `NoTranscriptFound`: No English transcript available
- `VideoUnavailable`: Video not found or inaccessible
- Invalid YouTube URL
- Python execution errors

**Implementation:** server.js:42-94

### POST /api/summarize
Generates a summary using Claude Haiku 4.5.

**Request Body:**
```json
{
  "transcript": "Full transcript text to summarize..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "summary": "AI-generated summary in paragraph format..."
}
```

**Error Response (400/429/500/503):**
```json
{
  "error": "Error message"
}
```

**Error Types:**
- Missing/empty transcript field (400)
- API key not configured (500)
- Authentication failed (500)
- Rate limit exceeded (429)
- API temporarily unavailable (503)

**Claude Configuration:**
- Model: `claude-haiku-4-5-20251001`
- Max tokens: 8000
- Temperature: 0.5
- System prompt: Expert technical summarizer
- Word count enforcement via system prompt

**Implementation:** server.js:96-185

### POST /api/summarize-gemini
Generates a summary using Gemini 2.5 Flash.

**Request Body:**
```json
{
  "transcript": "Full transcript text to summarize..."
}
```

**Response Format:** Same as `/api/summarize`

**Gemini Configuration:**
- Model: `gemini-2.5-flash`
- Identical prompt to Claude endpoint for consistency
- Dynamic word count limits based on transcript length

**Implementation:** server.js:187-258

## How It Works

### Transcript Extraction Flow
1. User enters YouTube URL in frontend
2. Frontend calls `/api/transcript` with URL
3. Backend extracts video ID from URL (server.js:26-40)
4. Backend executes Python script with video ID
5. Python script uses youtube-transcript-api to fetch transcript
6. Python returns JSON with transcript and segments
7. Backend forwards data to frontend
8. Frontend displays transcript in scrollable container

### Summarization Flow
1. User clicks "Summarize" or "Summarize (Gemini)" button
2. Frontend sends transcript to respective API endpoint
3. Backend validates input and checks API key
4. Backend determines word count target based on transcript length
5. Backend calls Claude/Gemini API with specialized prompt
6. AI generates paragraph-formatted summary within word limit
7. Backend returns summary to frontend
8. Frontend splits summary by double newlines and formats as HTML paragraphs

### Video ID Extraction
The `extractVideoId()` function (server.js:26-40) supports regex patterns for:
- Standard watch URLs
- Shortened youtu.be URLs
- Embed URLs
- Direct 11-character video IDs

### Error Handling
- Python errors mapped to user-friendly messages
- API authentication and rate limit errors
- Network timeout handling
- JSON parsing validation
- Empty/invalid input validation

## Configuration

### Environment Variables
All configuration is done through `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...    # Required for Claude summarization
GEMINI_API_KEY=...              # Required for Gemini summarization
YOUTUBE_API_KEY=...             # Optional, passed to Python script
```

### Server Settings
- **Port**: 3000 (hardcoded in server.js:10)
- **CORS**: Enabled for all origins
- **JSON limit**: 50mb for large transcripts
- **Static files**: Served from `public/` directory

### AI Model Settings

**Claude Haiku 4.5:**
- Fast inference, cost-effective
- 8000 max tokens output
- Temperature 0.5 for balanced creativity/consistency
- Expert technical summarizer system prompt
- Paragraph format enforcement

**Gemini 2.5 Flash:**
- Fast, lightweight model
- Identical prompt engineering to Claude
- Alternative for users preferring Google's AI

## Dependencies

### Node.js (package.json)
- `express` ^4.18.2 - Web server framework
- `@anthropic-ai/sdk` ^0.31.0 - Claude API client
- `@google/generative-ai` ^0.24.1 - Gemini API client
- `cors` ^2.8.5 - Cross-origin resource sharing
- `dotenv` ^17.2.3 - Environment variable management

### Python
- `youtube-transcript-api` - Transcript extraction from YouTube

## Usage Tips

1. **For best results**: Use videos with accurate auto-generated or manual captions
2. **Long videos**: Summaries automatically scale up to 3000 words for comprehensive coverage
3. **Copy functionality**: Click "Copy" to quickly save transcripts to clipboard
4. **Model choice**:
   - Claude: Generally better for technical content
   - Gemini: Fast alternative, good for general content
5. **Error messages**: Specific errors help identify issues (disabled captions, invalid URLs, etc.)

## Limitations

- Only works with videos that have enabled captions/transcripts
- Currently fetches English transcripts only (configurable in get_transcript.py:11)
- Requires active internet connection
- Depends on YouTube's transcript API availability
- Rate limits apply based on API tier (Claude/Gemini)

## Technical Notes

### Python Integration
The Node.js server executes the Python script as a child process using `exec()`. This approach:
- Separates concerns (Node handles HTTP, Python handles YouTube API)
- Leverages Python's robust youtube-transcript-api library
- Returns structured JSON for easy parsing
- Passes environment variables for API key access

### Frontend Architecture
Pure vanilla JavaScript with no frameworks:
- Event-driven with async/await for API calls
- DOM manipulation for dynamic content
- CSS-in-HTML for simplicity
- Responsive design with flexbox
- Custom scrollbar styling for polish

### AI Prompt Engineering
Both Claude and Gemini use identical prompts to ensure consistent output:
- Expert technical summarizer persona
- Clear formatting instructions (paragraphs only, no bullets)
- Dynamic word count limits
- Emphasis on completeness and clarity
- Professional tone enforcement

## Future Enhancement Ideas

- Multi-language transcript support
- Downloadable transcript/summary files
- Timestamp-linked transcript navigation
- Summary length customization
- Additional AI model options
- Batch processing for multiple videos
- Transcript search/highlighting
- Video metadata display

## License

ISC

## Version

1.0.0 - Final Release

---

Created for efficient YouTube content extraction and AI-powered summarization.
