# AI Comparison Tool

A unified AI evaluation platform that compares responses from Grok, Gemini, Replicate, and DeepSeek, scores them with weighted metrics, and recommends the best model for each prompt.

## Features

- **Unified Multi-Model Comparison**: Compare responses from 4 leading AI tools in one workflow
- **Weighted Scoring Engine**: Rank models by weighted Accuracy, Relevance, Clarity, and Quality
- **Best-Model Recommendation**: Automatically recommend the top-performing model for the current prompt
- **Voice Interface**: Speech-to-text prompt capture and text-to-speech response playback
- **Real-Time Dashboard**: Live ranking bars and core-metric visualization per run
- **Prompt Improvement Advisor**: Intelligent suggestions and improved prompt variants
- **Modular Architecture**: Dedicated backend evaluation engine for scalable extension

## Core Weighted Metrics

1. Accuracy
2. Relevance
3. Clarity
4. Quality

Operational metric:
- Response Time (for speed insights and recommendation context)

Default weights:
- Accuracy: 0.35
- Relevance: 0.25
- Clarity: 0.20
- Quality: 0.20

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your API keys:
   ```
   GROK_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   REPLICATE_API_TOKEN=your_key_here
   DEEPSEEK_API_KEY=your_key_here
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter your prompt in the text area
2. Click "Compare AI Responses"
3. View real-time responses from all 4 AI tools
4. Review weighted ranking, winner recommendation, and dashboard charts
5. Use prompt improvement suggestions to refine and re-run

## API Endpoints

- `POST /api/compare` - Fetches model responses and returns weighted evaluation
- `POST /api/evaluate` - Evaluates provided responses with optional custom weights
- `POST /api/analyze-prompt` - Analyzes prompt quality and generates improvements
- `GET /api/weights` - Returns default metric weights
- `GET /api/health` - Service health check

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **APIs**: xAI Grok, Google Gemini, Replicate, DeepSeek

## License

MIT
