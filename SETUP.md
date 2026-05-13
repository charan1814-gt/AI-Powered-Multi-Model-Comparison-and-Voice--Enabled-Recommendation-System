# Setup Instructions for AI Comparison Tool

## Quick Start Guide

### 1. Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages:
- express (web server)
- axios (HTTP client for API calls)
- cors (cross-origin resource sharing)
- dotenv (environment variables)
- body-parser (request parsing)

### 2. Configure API Keys

1. Copy `.env.example` to create your `.env` file:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit the `.env` file and add your API keys:

**OpenAI (ChatGPT):**
- Sign up at: https://platform.openai.com/
- Get API key from: https://platform.openai.com/api-keys
- Add to .env: `OPENAI_API_KEY=sk-...`

**Google Gemini:**
- Sign up at: https://makersuite.google.com/app/apikey
- Get API key from Google AI Studio
- Add to .env: `GEMINI_API_KEY=...`

**Replicate:**
- Sign up at: https://replicate.com/
- Get API token from: https://replicate.com/account/api-tokens
- Add to .env: `REPLICATE_API_TOKEN=...`

**DeepSeek:**
- Sign up at: https://platform.deepseek.com/
- Get API key from console
- Add to .env: `DEEPSEEK_API_KEY=...`

### 3. Start the Server

```powershell
npm start
```

For development with auto-restart:
```powershell
npm run dev
```

### 4. Open the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Usage Guide

### Basic Usage

1. **Enter Your Prompt**: Type your question in the text area
2. **Analyze Prompt** (Optional): Click to get prompt quality analysis and suggestions
3. **Compare AI Responses**: Click to fetch responses from all 4 AI tools
4. **Review Results**: Compare responses and view detailed metric analysis

### Prompt Tips

✅ **Good Prompt Example:**
```
"Explain the concept of machine learning to a 10-year-old child, 
using simple analogies and real-world examples. Keep it under 200 words."
```

❌ **Poor Prompt Example:**
```
"Tell me about AI"
```

### Features

- **Real-time Comparison**: Get responses from all 4 AI tools simultaneously
- **15 Metric Analysis**: Comprehensive evaluation including:
  - Response Time
  - Accuracy
  - Comprehensiveness
  - Precision & Recall
  - Sentiment Detection
  - Multi-Modality Support
  - Predictive Accuracy
  - Scalability
  - Explainability
  - Context Awareness
  - Customization
  - Prompt Sensitivity
  - Knowledge Freshness
  - Integration & API Support
  - Cost vs. Value

- **Prompt Improvement**: Get suggestions to enhance your prompts
- **Visual Comparison**: See metrics in both grid and table formats
- **Winner Determination**: Automatic calculation of best overall AI
- **Recommendations**: Tailored suggestions based on your needs

## Troubleshooting

### Issue: "Network error" message

**Solution**: Ensure the server is running with `npm start`

### Issue: "Unable to fetch response" for specific AI

**Solutions**:
1. Check that the API key is correctly set in `.env`
2. Verify the API key has sufficient credits/quota
3. Check if the API endpoint is accessible (firewall/network)

### Issue: All AIs return errors

**Solutions**:
1. Verify all API keys are correct in `.env`
2. Check internet connection
3. Ensure `.env` file is in the project root
4. Restart the server after changing `.env`

### Issue: Port 3000 already in use

**Solution**: Change the PORT in `.env`:
```
PORT=3001
```

## API Testing

Test the server health:
```powershell
curl http://localhost:3000/api/health
```

Test prompt analysis:
```powershell
$body = @{prompt = "Test prompt"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/analyze-prompt -Method POST -Body $body -ContentType "application/json"
```

## Project Structure

```
AI-Comparison-Tool/
├── index.html          # Main HTML interface
├── styles.css          # Styling and responsive design
├── app.js              # Frontend logic and metrics analysis
├── server.js           # Backend API server
├── package.json        # Node.js dependencies
├── .env               # API keys (create from .env.example)
├── .env.example       # Template for environment variables
├── .gitignore         # Git ignore rules
└── README.md          # Documentation
```

## Cost Considerations

**API Pricing (Approximate):**
- **OpenAI GPT-4**: ~$0.03 per 1K tokens
- **Google Gemini**: Free tier available, then ~$0.001 per 1K characters
- **Replicate**: Usage-based by model
- **DeepSeek**: pricing varies by model and usage

**Cost per Comparison**: Approximately $0.05-$0.15 depending on prompt length and response size

## Performance Tips

1. **Use concise prompts** to reduce API costs and response time
2. **Cache frequent comparisons** (future enhancement)
3. **Set response length limits** in API calls if needed
4. **Monitor API usage** through respective dashboards

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use environment variables** for all sensitive data
3. **Implement rate limiting** for production use
4. **Add authentication** if deploying publicly
5. **Use HTTPS** in production

## Future Enhancements

- [ ] Response caching to reduce API costs
- [ ] User authentication and history
- [ ] Export results to PDF/CSV
- [ ] Side-by-side response comparison
- [ ] Custom metric weights
- [ ] Batch prompt testing
- [ ] A/B testing mode
- [ ] Integration with more AI models

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API provider documentation
3. Check server logs in the terminal
4. Verify all dependencies are installed

## License

MIT License - Feel free to modify and distribute
