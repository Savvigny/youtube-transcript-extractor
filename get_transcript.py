#!/usr/bin/env python3
import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable

def get_transcript(video_id):
    try:
        # Initialize API and fetch transcript
        api = YouTubeTranscriptApi()
        transcript = api.fetch(video_id, languages=['en'])
        transcript_list = transcript.snippets

        # Extract text segments
        text_segments = []
        full_text_parts = []

        for item in transcript_list:
            text = item.text.strip() if hasattr(item, 'text') else ''
            if text:
                full_text_parts.append(text)
                text_segments.append({
                    'text': text,
                    'start': item.start if hasattr(item, 'start') else 0,
                    'duration': item.duration if hasattr(item, 'duration') else 0
                })

        result = {
            'videoId': video_id,
            'transcript': ' '.join(full_text_parts),
            'segments': text_segments
        }

        print(json.dumps(result))
        sys.exit(0)

    except TranscriptsDisabled:
        error = {'error': 'Transcripts are disabled for this video'}
        print(json.dumps(error), file=sys.stderr)
        sys.exit(1)
    except NoTranscriptFound:
        error = {'error': 'No transcript available for this video'}
        print(json.dumps(error), file=sys.stderr)
        sys.exit(1)
    except VideoUnavailable:
        error = {'error': 'Video not found or unavailable'}
        print(json.dumps(error), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        error = {'error': str(e)}
        print(json.dumps(error), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Video ID is required'}), file=sys.stderr)
        sys.exit(1)

    video_id = sys.argv[1]
    get_transcript(video_id)
