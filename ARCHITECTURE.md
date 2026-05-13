# Project Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    index.html                             │  │
│  │  - Prompt input interface                                 │  │
│  │  - Response display area                                  │  │
│  │  - Metrics visualization                                  │  │
│  │  - Recommendations section                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│           │                                                       │
│           │ User interactions (clicks, input)                    │
│           ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     app.js                                │  │
│  │  - Event handling                                         │  │
│  │  - API communication                                      │  │
│  │  - 15 Metrics analysis engine                             │  │
│  │  - Prompt quality analysis                                │  │
│  │  - Results visualization                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│           │                                                       │
│           │ HTTP Requests (POST /api/compare)                    │
└───────────┼───────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Node.js Server (server.js)                    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   API Endpoints                           │  │
│  │  - POST /api/compare                                      │  │
│  │  - POST /api/analyze-prompt                               │  │
│  │  - GET  /api/health                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│           │                                                       │
│           │ Parallel API calls                                   │
│           ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AI Service Integration                       │  │
│  │  - callChatGPT()                                          │  │
│  │  - callGemini()                                           │  │
│  │  - callReplicate()                                        │  │
│  │  - callDeepSeek()                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
            │
            │ External API Calls
            │
    ┌───────┴───────┬───────────┬────────────┐
    ▼               ▼           ▼            ▼
┌─────────┐   ┌─────────┐  ┌──────────┐  ┌────────┐
│ OpenAI  │   │ Google  │  │ Replicate│  │ DeepSeek│
│ ChatGPT │   │ Gemini  │  │   API    │  │   API  │
│   API   │   │   API   │  │          │  │  API   │
└─────────┘   └─────────┘  └──────────┘  └────────┘
```

## Data Flow

### 1. User Input Flow
```
User Types Prompt
      │
      ▼
Prompt Input Field (index.html)
      │
      ▼
Click "Compare AI Responses"
      │
      ▼
app.js captures event
      │
      ▼
Validates prompt
      │
      ▼
Sends POST request to /api/compare
```

### 2. Server Processing Flow
```
Server receives POST /api/compare
      │
      ▼
Extract prompt from request body
      │
      ▼
Call all 4 AI APIs in parallel using Promise.all()
      │
      ├─── callChatGPT(prompt)
      ├─── callGemini(prompt)
      ├─── callReplicate(prompt)
      └─── callDeepSeek(prompt)
      │
      ▼
Each function:
  - Records start time
  - Makes HTTP request to AI API
  - Records end time (response time)
  - Returns { response, responseTime, success }
      │
      ▼
Aggregate all responses
      │
      ▼
Send JSON response back to browser
```

### 3. Metrics Analysis Flow
```
Frontend receives AI responses
      │
      ▼
app.js analyzeMetrics(prompt, responses)
      │
      ├─── analyzeResponseTime() ───► Calculate fastest
      ├─── analyzeAccuracy() ────────► Check for facts, citations
      ├─── analyzeComprehensiveness()► Measure depth
      ├─── analyzePrecisionRecall()──► Check relevance
      ├─── analyzeSentimentDetection()► Detect tone
      ├─── analyzeMultiModality() ───► Fixed scores
      ├─── analyzePredictiveAccuracy()► Future statements
      ├─── analyzeScalability() ─────► Fixed scores
      ├─── analyzeExplainability() ──► Explanatory language
      ├─── analyzeContextAwareness() ► Keyword matching
      ├─── analyzeCustomization() ───► Fixed scores
      ├─── analyzePromptSensitivity()► Response quality
      ├─── analyzeKnowledgeFreshness()► Recent references
      ├─── analyzeIntegration() ─────► Fixed scores
      └─── analyzeCostValue() ───────► Fixed scores
      │
      ▼
Calculate overall scores (average of all metrics)
      │
      ▼
Determine winner (highest overall score)
      │
      ▼
Display results in UI
```

### 4. Visualization Flow
```
Metrics calculated
      │
      ├─── displayWinner() ─────────► Show winning AI with trophy
      ├─── displayMetricsGrid() ────► Create metric cards
      ├─── displayMetricsTable() ───► Create comparison table
      └─── displayRecommendations()─► Generate suggestions
      │
      ▼
Update DOM with results
      │
      ▼
Animate score bars (CSS transitions)
      │
      ▼
Scroll to results section
```

## Key Components

### Frontend (Browser)

**index.html**
- Main structure and layout
- Semantic HTML5
- Accessible form elements
- Responsive grid layouts

**styles.css**
- Modern CSS with CSS variables
- Responsive design (mobile-first)
- Smooth animations and transitions
- Professional color scheme

**app.js**
- Event listeners for user interactions
- Fetch API for HTTP requests
- 15 distinct metric calculation functions
- DOM manipulation for results display
- Prompt quality analyzer

### Backend (Server)

**server.js**
- Express.js web server
- CORS middleware for cross-origin requests
- Body parser for JSON requests
- 4 AI API integration functions
- Error handling and logging
- Prompt analysis utilities

### Configuration

**.env**
- API keys (sensitive, not committed)
- Server configuration
- Environment variables

**package.json**
- Node.js dependencies
- NPM scripts
- Project metadata

## The 15 Metrics Explained

### Performance Metrics
1. **Response Time** - Speed of API response (milliseconds)
2. **Scalability** - Infrastructure capacity assessment

### Quality Metrics
3. **Accuracy** - Factual correctness, citations
4. **Comprehensiveness** - Depth and coverage
5. **Precision & Recall** - Relevance and completeness

### Intelligence Metrics
6. **Sentiment Detection** - Emotional awareness
7. **Predictive Accuracy** - Future forecasting ability
8. **Context Awareness** - Understanding of prompt context
9. **Explainability** - Clarity of reasoning

### Capability Metrics
10. **Multi-Modality** - Support for various data types
11. **Customization** - Fine-tuning options
12. **Prompt Sensitivity** - Robustness to prompt variations
13. **Knowledge Freshness** - Up-to-date information

### Business Metrics
14. **Integration** - API and platform support
15. **Cost vs. Value** - ROI assessment

## API Integration Details

### OpenAI (ChatGPT)
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4`
- Auth: Bearer token
- Format: JSON messages array

### Google Gemini
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- Model: `gemini-pro`
- Auth: API key in URL
- Format: Contents array with parts

### Replicate
- Endpoint: `https://api.replicate.com/v1/models/{owner}/{model}/predictions`
- Model: `meta/meta-llama-3-8b-instruct`
- Auth: Token
- Format: Prediction lifecycle (create → poll)

### DeepSeek
- Endpoint: `https://api.deepseek.com/v1/chat/completions`
- Model: `deepseek-chat`
- Auth: Bearer token
- Format: OpenAI-compatible chat completions

## Error Handling Strategy

### Frontend Errors
- Network errors → Show user-friendly message
- Invalid input → Highlight field with message
- Empty prompt → Prevent submission
- API errors → Display error in response card

### Backend Errors
- Missing API key → Return error response
- API timeout → Set timeout limits
- Invalid request → Return 400 status
- Server error → Return 500 with message

### Graceful Degradation
- If one AI fails, others continue
- Show partial results
- Indicate which AIs succeeded/failed
- Allow retry for failed APIs

## Security Considerations

1. **API Keys**: Stored in .env, never exposed to client
2. **CORS**: Enabled for localhost development
3. **Input Validation**: Server validates all inputs
4. **Rate Limiting**: Should be added for production
5. **HTTPS**: Required for production deployment

## Performance Optimizations

1. **Parallel API Calls**: All 4 AIs called simultaneously
2. **Lazy Loading**: Results shown as they arrive
3. **Debouncing**: Prevent rapid repeated calls
4. **Caching**: Future enhancement for repeated prompts
5. **CDN**: For static assets in production

## Deployment Considerations

### Development
- Local server on port 3000
- Hot reload with nodemon
- Debug logging enabled

### Production
- Use process manager (PM2)
- Enable HTTPS
- Add rate limiting
- Implement authentication
- Set up monitoring
- Use environment-specific configs

## Future Enhancements

1. **User Authentication**: Save comparison history
2. **Response Caching**: Reduce API costs
3. **Batch Testing**: Compare multiple prompts
4. **Custom Metrics**: User-defined evaluation criteria
5. **Export Results**: PDF/CSV download
6. **A/B Testing**: Compare prompt variations
7. **Analytics Dashboard**: Usage statistics
8. **Mobile App**: Native iOS/Android versions
