# API Keys Setup Guide

## Overview
This application requires API keys from four AI service providers. Follow the steps below to obtain and configure each API key.

---

## 1. OpenAI (ChatGPT) API Key

### Sign Up & Get API Key
1. Visit: https://platform.openai.com/signup
2. Create an account or sign in
3. Go to: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. **Important**: Save it immediately - you won't see it again!

### Add Credits
- Go to: https://platform.openai.com/account/billing
- Add payment method and purchase credits
- Minimum: $5 (recommended $20 for testing)

### Add to .env
```
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY_HERE>
```

### Pricing
- GPT-4: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- GPT-3.5-Turbo: ~$0.0015 per 1K tokens (cheaper alternative)

---

## 2. Google Gemini API Key

### Sign Up & Get API Key
1. Visit: https://makersuite.google.com/app/apikey
   - OR: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Select "Create API key in new project" or choose existing project
5. Copy the API key

### Free Tier
- 60 queries per minute
- No credit card required initially
- Generous free quota for testing

### Add to .env
```
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx
```

### Pricing
- Free tier: 60 requests/minute
- Pay-as-you-go: ~$0.00025 per 1K characters (very affordable)

---

## 3. Replicate API Token

### Sign Up & Get API Key
1. Visit: https://replicate.com/
2. Sign up for an account
3. Visit: https://replicate.com/account/api-tokens
4. Generate a new API token
5. Copy the token

### Billing
- Usage-based pricing by model
- Billing details: https://replicate.com/account/billing

### Add to .env
```
REPLICATE_API_TOKEN=r8-xxxxxxxxxxxxxxxxxxxxxxx
```

### Pricing
- Pay-per-use: varies by model

---

## 4. DeepSeek API Key

### Sign Up & Get API Key
1. Visit: https://platform.deepseek.com/
2. Sign up for an account
3. Go to: https://platform.deepseek.com/api-keys
4. Click "Create new key"
5. Copy the API key

### Add Credits
- Go to: https://platform.deepseek.com/billing
- Add payment method
- Purchase credits (recommended $10-$20 for testing)

### Add to .env
```
DEEPSEEK_API_KEY=<YOUR_DEEPSEEK_API_KEY_HERE>
```

### Pricing
- DeepSeek pricing varies by model and usage. Check the dashboard for current rates.

---

## Complete .env File Example

After obtaining all API keys, your `.env` file should look like this:

```env
# API Keys for AI Services
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY_HERE>
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY_HERE>
REPLICATE_API_TOKEN=<YOUR_REPLICATE_API_TOKEN_HERE>
DEEPSEEK_API_KEY=<YOUR_DEEPSEEK_API_KEY_HERE>

# Server Configuration
PORT=3000
NODE_ENV=development
```

---

## Testing Your API Keys

### Test OpenAI
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_OPENAI_KEY"
    "Content-Type" = "application/json"
}
$body = @{
    model = "gpt-4"
    messages = @(@{role = "user"; content = "Hello!"})
} | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.openai.com/v1/chat/completions" -Method POST -Headers $headers -Body $body
```

### Test Gemini
```powershell
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_GEMINI_KEY"
$body = @{
    contents = @(@{parts = @(@{text = "Hello!"})})
} | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"
```

### Test DeepSeek
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_DEEPSEEK_KEY"
    "Content-Type" = "application/json"
}
$body = @{
    model = "deepseek-chat"
    messages = @(@{role = "user"; content = "Hello!"})
} | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.deepseek.com/v1/chat/completions" -Method POST -Headers $headers -Body $body
```

---

## Cost Optimization Tips

1. **Start with Gemini**: Has the most generous free tier
2. **Use GPT-3.5-Turbo**: Instead of GPT-4 for initial testing (much cheaper)
3. **Set Usage Limits**: Configure spending limits in each provider's dashboard
4. **Monitor Usage**: Check usage dashboards regularly
5. **Cache Results**: Store comparison results to avoid repeated API calls

---

## Budget Estimation

### For 100 Comparisons (Average 500 tokens per prompt/response):

| Provider | Cost per Comparison | Total for 100 |
|----------|---------------------|---------------|
| OpenAI GPT-4 | $0.10 - $0.15 | $10 - $15 |
| Gemini | $0.00 - $0.02 | $0 - $2 |
| Replicate | Usage-based | Varies |
| DeepSeek | Varies by usage | Varies |
| **Total** | **~$0.20** | **~$20** |

### Recommended Initial Budget:
- **OpenAI**: $10
- **Gemini**: $0 (use free tier)
- **Replicate**: $10+ (depends on usage)
- **DeepSeek**: $10
- **Total**: $40 for comprehensive testing

---

## Troubleshooting API Issues

### Error: "Invalid API key"
- Double-check you copied the entire key
- Ensure no extra spaces before/after the key in .env
- Restart the server after updating .env

### Error: "Insufficient quota"
- Add credits to your account
- Check usage limits in provider dashboard
- Wait for quota reset (if using free tier)

### Error: "Rate limit exceeded"
- Wait a few minutes before retrying
- Reduce number of simultaneous requests
- Upgrade to higher tier plan

### Error: "Model not found"
- Verify you're using correct model names
- Check if model is available in your region
- Update to latest API version

---

## Security Best Practices

1. **Never share your API keys** publicly
2. **Never commit .env file** to Git
3. **Rotate keys regularly** (every 3-6 months)
4. **Use separate keys** for development and production
5. **Monitor usage** for suspicious activity
6. **Set spending limits** in provider dashboards
7. **Revoke unused keys** immediately

---

## Alternative: Free Testing Mode

If you don't want to pay for all APIs initially, you can:

1. **Start with Gemini only** (generous free tier)
2. **Modify server.js** to return mock responses for other AIs
3. **Test the interface** without actual API calls
4. **Add real APIs** gradually as you test

To use mock responses, comment out actual API calls in server.js and return:
```javascript
return {
    response: "Mock response for testing",
    responseTime: 1000,
    success: true
};
```

---

## Need Help?

- **OpenAI**: https://help.openai.com/
- **Gemini**: https://ai.google.dev/docs
- **Replicate**: https://replicate.com/docs
- **DeepSeek**: https://platform.deepseek.com/docs

---

## Next Steps

1. ✅ Obtain all API keys
2. ✅ Add them to `.env` file
3. ✅ Test each API individually
4. ✅ Start the server: `npm start`
5. ✅ Open http://localhost:3000
6. ✅ Test with sample prompts
7. ✅ Monitor usage and costs
