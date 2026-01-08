# YouTube Transcript Extractor

A simple web application that extracts automated transcripts from YouTube videos. Just paste a YouTube URL and get the full transcript instantly.

## Features

- Extract transcripts from any YouTube video with automated captions
- Clean, simple user interface
- Automatic video ID extraction from various YouTube URL formats
- Error handling for edge cases (no captions, invalid URLs, etc.)
- Real-time loading states and error messages

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **API**: youtube-transcript library

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Paste a YouTube URL into the input field and click "Get Transcript"

## Supported YouTube URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `VIDEO_ID` (just the 11-character video ID)

## API Endpoint

### GET /api/transcript

Fetches the transcript for a YouTube video.

**Query Parameters:**
- `url` (required): YouTube video URL or video ID

**Response:**
```json
{
  "videoId": "VIDEO_ID",
  "transcript": "Full transcript text...",
  "segments": [
    {
      "text": "Transcript segment",
      "offset": 0,
      "duration": 1000
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Error Handling

The application handles various error cases:
- Invalid YouTube URLs
- Videos without transcripts
- Disabled transcripts
- Network errors
- Video not found

## Project Structure

```
.
├── server.js          # Express server with API endpoint
├── package.json       # Node.js dependencies
├── public/
│   └── index.html    # Frontend UI
└── README.md         # Documentation
```

## Dependencies

- express: ^4.18.2
- youtube-transcript: ^1.0.6
- cors: ^2.8.5

## Notes

- The app only works with videos that have automated or manual captions enabled
- Some videos may have transcripts disabled by the creator
- The server runs on port 3000 by default
