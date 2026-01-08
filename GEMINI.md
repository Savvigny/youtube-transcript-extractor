# Project Overview

This project is a web application that extracts transcripts from YouTube videos and provides a summary of the transcript. It consists of a Node.js backend using Express and a vanilla HTML/CSS/JavaScript frontend.

The backend has two main API endpoints:
-   `/api/transcript`: This endpoint takes a YouTube URL, extracts the video ID, and then uses a Python script (`get_transcript.py`) to fetch the transcript using the `youtube_transcript_api` library.
-   `/api/summarize`: This endpoint takes a transcript as input and uses the Anthropic (Claude) API to generate a summary.

The frontend provides a user interface to input a YouTube URL, view the transcript, and request a summary.

# Building and Running

## Prerequisites

-   Node.js and npm
-   Python 3
-   A YouTube Data API v3 key
-   An Anthropic API key

## Installation

1.  Install Node.js dependencies:
    ```bash
    npm install
    ```
2.  Install Python dependencies:
    ```bash
    pip install youtube_transcript_api
    ```

## Running the Application

1.  Create a `.env` file in the root of the project and add your API keys:
    ```
    YOUTUBE_API_KEY=your_youtube_api_key
    ANTHROPIC_API_KEY=your_anthropic_api_key
    ```
2.  Start the server:
    ```bash
    npm start
    ```
3.  Open your browser and navigate to `http://localhost:3000`.

# Development Conventions

## Backend

-   The backend is written in JavaScript using Node.js and the Express framework.
-   It relies on a Python script for transcript extraction, which is executed using `child_process`.
-   Environment variables are managed with the `dotenv` package.
-   The server provides a RESTful API for the frontend.

## Frontend

-   The frontend is a single HTML file with inline CSS and JavaScript.
-   It uses `fetch` to communicate with the backend API.
-   It dynamically updates the DOM to display the transcript and summary.

## Error Handling

-   The backend includes error handling for invalid YouTube URLs, missing transcripts, and API errors.
-   The frontend displays user-friendly error messages.
