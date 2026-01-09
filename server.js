require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Initialize Gemini client
const geminiApiKey = process.env.GEMINI_API_KEY;
console.log('Gemini API Key present:', !!geminiApiKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

app.get('/api/transcript', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = extractVideoId(url);

    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const pythonScript = path.join(__dirname, 'get_transcript.py');

    // Pass YouTube API key from environment variable
    const env = {
      ...process.env,
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || ''
    };

    exec(`python3 "${pythonScript}" "${videoId}"`, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error fetching transcript:', stderr);

        let errorMessage = 'Failed to fetch transcript';

        if (stderr.includes('TranscriptsDisabled')) {
          errorMessage = 'Transcripts are disabled for this video';
        } else if (stderr.includes('NoTranscriptFound')) {
          errorMessage = 'No transcript available for this video';
        } else if (stderr.includes('VideoUnavailable')) {
          errorMessage = 'Video not found or unavailable';
        }

        return res.status(500).json({ error: errorMessage });
      }

      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch (parseError) {
        console.error('Error parsing transcript:', parseError);
        res.status(500).json({ error: 'Failed to parse transcript data' });
      }
    });

  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ error: 'Failed to fetch transcript. Please try again.' });
  }
});

app.post('/api/summarize', async (req, res) => {
  try {
    const { transcript } = req.body;

    console.log('Received summarize request, transcript length:', transcript?.length);

    // Validate input
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript field is required' });
    }

    if (typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Transcript cannot be empty' });
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    console.log('Calling Claude API...');

    // Determine target word count based on transcript length
    const transcriptLength = transcript.split(/\s+/).length;
    let targetWords;
    if (transcriptLength < 500) {
      targetWords = '200-300';
    } else if (transcriptLength < 2000) {
      targetWords = '2000';
    } else {
      targetWords = '3000';
    }

    // Call Claude API for summarization
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
      temperature: 0.5,
      system: `You are an expert technical summarizer specializing in YouTube video transcripts. Your task is to create a comprehensive, well-structured summary that captures all key information while maintaining clarity and readability.

When summarizing:
- Use clear, professional language
- Organize content into logical paragraphs
- Include all major topics and insights
- Maintain context and relationships between ideas
- Avoid bullet points; use paragraph format exclusively
- Aim for completeness while being concise

IMPORTANT: Your summary must NOT exceed ${targetWords} words. This is a strict maximum word count limit.`,
      messages: [
        {
          role: 'user',
          content: `Please summarize the following YouTube video transcript:\n\n${transcript}`
        }
      ]
    });

    // Extract summary from response
    const summary = message.content[0].text;

    console.log('Claude API response received, summary length:', summary.length);

    res.json({
      success: true,
      summary: summary
    });

  } catch (error) {
    console.error('Error generating summary:', error);

    // Handle specific API errors
    if (error.status === 401) {
      return res.status(500).json({ error: 'Anthropic API authentication failed. Check your API key.' });
    }

    if (error.status === 400 && error.error?.error?.message) {
      return res.status(400).json({ error: error.error.error.message });
    }

    if (error.status === 429) {
      return res.status(429).json({ error: 'API rate limit exceeded. Please try again in a moment.' });
    }

    if (error.status >= 500) {
      return res.status(503).json({ error: 'Anthropic API temporarily unavailable' });
    }

    res.status(500).json({ error: 'Failed to generate summary. Please try again.' });
  }
});

app.post('/api/summarize-gemini', async (req, res) => {
  try {
    const { transcript } = req.body;

    console.log('Received Gemini summarize request, transcript length:', transcript?.length);

    // Validate input
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript field is required' });
    }

    if (typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Transcript cannot be empty' });
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    console.log('Calling Gemini API with model: gemini-2.0-flash-lite');

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Determine target word count based on transcript length
    const transcriptLength = transcript.split(/\s+/).length;
    let targetWords;
    if (transcriptLength < 500) {
      targetWords = '200-300';
    } else if (transcriptLength < 2000) {
      targetWords = '2000';
    } else {
      targetWords = '3000';
    }

    const prompt = `You are an expert technical summarizer specializing in YouTube video transcripts. Your task is to create a comprehensive, well-structured summary that captures all key information while maintaining clarity and readability.

When summarizing:
- Use clear, professional language
- Organize content into logical paragraphs
- Include all major topics and insights
- Maintain context and relationships between ideas
- Avoid bullet points; use paragraph format exclusively
- Aim for completeness while being concise

IMPORTANT: Your summary must NOT exceed ${targetWords} words. This is a strict maximum word count limit.

Please summarize the following YouTube video transcript:

${transcript}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    console.log('Gemini API response received, summary length:', summary.length);

    res.json({
      success: true,
      summary: summary
    });

  } catch (error) {
    console.error('Error generating Gemini summary:', error);

    // Plan B: Fallback for Rate Limiting (429)
    if (error.status === 429) {
      try {
        console.log('Gemini 2.5 rate limit hit. Switching to Plan B: gemini-3-flash-preview');
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        
        // Retrieve transcript from request body again
        const { transcript } = req.body;
        
        // Re-calculate target words
        const transcriptLength = transcript.split(/\s+/).length;
        let targetWords;
        if (transcriptLength < 500) {
          targetWords = '200-300';
        } else if (transcriptLength < 2000) {
          targetWords = '2000';
        } else {
          targetWords = '3000';
        }

        const prompt = `You are an expert technical summarizer specializing in YouTube video transcripts. Your task is to create a comprehensive, well-structured summary that captures all key information while maintaining clarity and readability.

When summarizing:
- Use clear, professional language
- Organize content into logical paragraphs
- Include all major topics and insights
- Maintain context and relationships between ideas
- Avoid bullet points; use paragraph format exclusively
- Aim for completeness while being concise

IMPORTANT: Your summary must NOT exceed ${targetWords} words. This is a strict maximum word count limit.

Please summarize the following YouTube video transcript:

${transcript}`;

        const result = await fallbackModel.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();
        
        console.log('Fallback Plan B successful. Summary length:', summary.length);
        
        return res.json({
          success: true,
          summary: summary
        });
        
      } catch (fallbackError) {
        console.error('Plan B failed:', fallbackError);
        // If fallback fails, proceed to standard error handling below
      }
    }

    if (error.status) {
      return res.status(error.status).json({ error: error.message || 'Gemini API Error' });
    }

    res.status(500).json({ error: 'Failed to generate summary with Gemini. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
