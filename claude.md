# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                        # Install Node.js dependencies
pip3 install youtube-transcript-api # Install Python dependency
npm start                          # Start server at http://localhost:3000
```

## Architecture

Node.js/Express server that spawns a Python subprocess for YouTube transcript extraction, then offers AI summarization via Claude or Gemini APIs.

**Request Flow:**
1. Frontend (`public/index.html`) → Express API (`server.js`)
2. `/api/transcript` → spawns `get_transcript.py` via `child_process.exec()`
3. `/api/summarize` → Anthropic SDK (Claude Haiku 4.5)
4. `/api/summarize-gemini` → Google Generative AI SDK (Gemini 2.5 Flash, falls back to 3 Flash on rate limit)

**Key Files:**
- `server.js` - Express server with all API endpoints (lines 42-94 transcript, 96-185 Claude, 187-311 Gemini)
- `get_transcript.py` - Python script using `youtube-transcript-api`, returns JSON to stdout
- `public/index.html` - Single-page frontend with vanilla JS

## Environment Variables

Required in `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...  # For Claude summarization
GEMINI_API_KEY=...            # For Gemini summarization
YOUTUBE_API_KEY=...           # Optional
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/transcript?url=` | GET | Extract YouTube transcript via Python subprocess |
| `/api/summarize` | POST | Summarize with Claude (body: `{transcript: string}`) |
| `/api/summarize-gemini` | POST | Summarize with Gemini (body: `{transcript: string}`) |

## Key Implementation Details

- Video ID extraction supports: watch URLs, youtu.be short links, embed URLs, raw 11-char IDs (`server.js:26-40`)
- Python errors (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable) mapped to user-friendly messages
- Summary word count adapts to transcript length: <500 words → 200-300, <2000 → 2000, 2000+ → 3000
- Both AI endpoints use identical prompts for consistent output (paragraph format, no bullets)
- Gemini has automatic fallback to `gemini-3-flash-preview` on 429 rate limit errors
