# AI Meme Generator Backend

This is the Express-based backend for the AI Meme Generator. It handles communication with the Google Gemini API and provides a proxy for fetching external meme templates.

## Features

- **AI Caption Generation**: Leverages `gemini-1.5-flash` to generate witty meme captions.
- **Image Proxy**: Bypasses CORS restrictions when loading remote meme templates from allowed hosts.
- **Health Check**: Provides an endpoint for frontend connectivity verification.

## Setup

1.  **Set Environment Variables**:
    Create a `.env` file or export the following variable:
    ```bash
    GEMINI_API_KEY=your_actual_api_key_here
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

## API Endpoints

- `POST /api/generate-captions-from-image`: Generates captions based on a base64 image.
- `POST /api/generate-captions-from-text`: Generates captions based on a template name.
- `GET /api/template-image?url=...`: Proxies an external image.
- `GET /api/health`: Backend health check.
