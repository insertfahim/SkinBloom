# 🔑 RapidAPI Setup Guide for Beauty Product APIs

This guide will help you set up API keys for premium beauty product APIs to enhance your product catalog with real-time data from Sephora, Ulta, and other beauty retailers.

## 📋 Table of Contents

1. [Getting Started with RapidAPI](#getting-started-with-rapidapi)
2. [Setting up Sephora API](#sephora-api-setup)
3. [Setting up Ulta API](#ulta-api-setup)
4. [Additional APIs](#additional-apis)
5. [Environment Configuration](#environment-configuration)
6. [Testing APIs](#testing-apis)
7. [Rate Limits & Best Practices](#rate-limits--best-practices)

## 🚀 Getting Started with RapidAPI

### Step 1: Create RapidAPI Account

1. Visit [RapidAPI Hub](https://rapidapi.com/hub)
2. Click **"Sign Up"** in the top right corner
3. Choose your preferred signup method:
   - Email & Password
   - GitHub
   - Google
   - Facebook
4. Verify your email address

### Step 2: Complete Profile Setup

1. Go to your dashboard
2. Add billing information (required for premium APIs)
3. Set up a payment method (Credit/Debit card)

## 🛍️ Sephora API Setup

### Finding the Sephora API

1. Go to [RapidAPI Hub](https://rapidapi.com/hub)
2. Search for "Sephora" in the search bar
3. Look for APIs like:
   - **"Sephora"** by DataCrawler
   - **"Sephora Product Data"** by various providers
   - **"Beauty Products API"** that includes Sephora data

### Subscribing to Sephora API

1. Click on your chosen Sephora API
2. Review the pricing plans:
   - **Basic Plan**: Usually $0-$10/month (limited requests)
   - **Pro Plan**: $20-$50/month (higher limits)
   - **Ultra Plan**: $100+/month (commercial use)
3. Click **"Subscribe"** on your preferred plan
4. Confirm payment details

### Getting Your API Key

1. After subscription, go to the API page
2. Click on the **"Endpoints"** tab
3. Your API key will be shown in the **"X-RapidAPI-Key"** field
4. Copy this key - you'll need it for environment variables

### Example Sephora API Endpoints

```javascript
// Available endpoints typically include:
GET /products/search?query=foundation
GET /products/{productId}
GET /categories
GET /brands
```

## 🏪 Ulta API Setup

### Finding the Ulta API

1. Search for "Ulta" on RapidAPI Hub
2. Look for APIs such as:
   - **"Ulta Beauty"** by various providers
   - **"Beauty Store API"** that includes Ulta
   - **"Cosmetics API"** with Ulta integration

### Subscription Process

Similar to Sephora:
1. Choose your API provider
2. Review pricing (typically $15-$75/month)
3. Subscribe to a plan
4. Get your API key from the endpoint section

## 🔄 Additional APIs

### 1. Target Beauty API
- Search: "Target Beauty API"
- Pricing: $10-$40/month
- Good for: Drugstore and affordable beauty products

### 2. Amazon Beauty API
- Search: "Amazon Product API"
- Look for APIs that support beauty category
- Pricing: $20-$100/month

### 3. CVS/Walgreens Beauty APIs
- Search for pharmacy beauty APIs
- Good for: Skincare and health-focused beauty products

## ⚙️ Environment Configuration

### Step 1: Update your `.env` file

Add these variables to your server's `.env` file:

```bash
# External API Keys
RAPIDAPI_KEY=your_rapidapi_key_here
SEPHORA_API_KEY=your_sephora_specific_key
ULTA_API_KEY=your_ulta_specific_key

# API Endpoints (update based on your chosen APIs)
SEPHORA_API_BASE_URL=https://sephora.p.rapidapi.com
ULTA_API_BASE_URL=https://ulta-beauty.p.rapidapi.com

# Rate limiting
API_RATE_LIMIT_PER_MINUTE=60
API_RATE_LIMIT_PER_HOUR=1000
```

### Step 2: Update External API Service

Your `externalApiService.js` is already configured to use these environment variables. Just update the URLs and headers as needed:

```javascript
// In server/services/externalApiService.js
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const SEPHORA_BASE_URL = process.env.SEPHORA_API_BASE_URL
const ULTA_BASE_URL = process.env.ULTA_API_BASE_URL

const defaultHeaders = {
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'your-api-host.p.rapidapi.com'
}
```

## 🧪 Testing APIs

### Step 1: Test Individual APIs

Use the RapidAPI interface to test your APIs:

1. Go to your subscribed API page
2. Click **"Test Endpoint"**
3. Try sample requests to ensure they work
4. Note the response format for integration

### Step 2: Test in Your Application

```bash
# Start your server
cd server
npm run dev

# Test the external API endpoint
curl "http://localhost:5000/api/products/external?source=sephora"
```

### Step 3: Verify Data Integration

1. Check that products are being fetched
2. Verify data normalization is working
3. Test search and filtering functionality

## 📊 Rate Limits & Best Practices

### Understanding Rate Limits

Most beauty APIs have these limits:
- **Requests per minute**: 60-300
- **Requests per month**: 1,000-50,000
- **Daily limits**: 500-5,000

### Best Practices

1. **Implement Caching**
   ```javascript
   // Cache API responses for 1 hour
   const cacheTimeout = 60 * 60 * 1000 // 1 hour in milliseconds
   ```

2. **Use Request Queuing**
   ```javascript
   // Implement request queue to respect rate limits
   const requestQueue = []
   const processQueue = () => {
     // Process requests with delays
   }
   ```

3. **Monitor Usage**
   - Check your RapidAPI dashboard regularly
   - Set up usage alerts
   - Monitor response times

4. **Fallback Strategy**
   ```javascript
   // Always have fallback data
   if (apiResponse.error || !apiResponse.data) {
     return fallbackDummyData
   }
   ```

## 💡 Cost Optimization Tips

### 1. Choose the Right Plan
- Start with basic plans
- Monitor usage for 2-3 weeks
- Upgrade only when needed

### 2. Optimize API Calls
- Cache responses aggressively
- Batch requests when possible
- Only fetch necessary data fields

### 3. Use Multiple APIs Strategically
- Use cheaper APIs for bulk data
- Use premium APIs for specific searches
- Implement intelligent routing

## 🛠️ Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify key is copied correctly
   - Check if subscription is active
   - Ensure billing is up to date

2. **Rate Limit Exceeded**
   - Implement request delays
   - Cache responses longer
   - Consider upgrading plan

3. **No Data Returned**
   - Check API endpoint URLs
   - Verify request format
   - Test in RapidAPI interface first

### Getting Help

1. **RapidAPI Support**
   - Use the help chat on RapidAPI
   - Check API documentation
   - Contact API provider directly

2. **Community Resources**
   - RapidAPI Community Forums
   - Stack Overflow
   - API provider documentation

## 📈 Next Steps

Once your APIs are set up:

1. **Test thoroughly** with various search terms
2. **Monitor performance** and adjust caching
3. **Scale gradually** as your user base grows
4. **Consider additional APIs** for more product variety

## 🔐 Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for all sensitive data
- **Rotate keys regularly** for security
- **Monitor usage** for unexpected spikes

---

### 📞 Support

If you need help with API setup:
- Check the RapidAPI documentation
- Review the API provider's support resources
- Test endpoints in the RapidAPI interface before integrating

Your SkinBloom application is already configured to handle these APIs - you just need to add the keys and test! 🚀
