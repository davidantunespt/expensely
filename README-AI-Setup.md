# AI Receipt Processing Setup

This document explains how to configure and use the AI-powered receipt processing system.

## Quick Start

1. **Get a Gemini API Key**

   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your environment variables

2. **Set Environment Variable**

   ```bash
   # Add to your .env.local file
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Test the Setup**
   - Upload a receipt image (JPG, PNG) or PDF
   - The system will automatically extract vendor, amount, date, category, etc.

## Configuration

### Switching AI Providers

Edit `src/lib/config/ai.ts` to change the AI provider:

```typescript
// Change this line to switch providers
export const AI_PROVIDER: "gemini" | "openai" = "gemini";
```

### Supported Providers

- **Gemini** (Default): Fast, cost-effective, excellent vision capabilities
- **OpenAI** (Coming soon): GPT-4 Vision, requires OpenAI API key

### Model Configuration

You can adjust the AI behavior by modifying the config:

```typescript
export const GEMINI_CONFIG: AIConfig = {
  apiKey: process.env.GEMINI_API_KEY || "",
  model: "gemini-1.5-flash", // or "gemini-1.5-pro" for better accuracy
  temperature: 0.1, // Lower = more consistent, Higher = more creative
  maxTokens: 1000,
};
```

## API Key Setup

### Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and add to your environment:
   ```
   GEMINI_API_KEY=your_key_here
   ```

### OpenAI API Key (Future)

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Add to environment:
   ```
   OPENAI_API_KEY=your_key_here
   ```

## Supported File Types

- **Images**: JPG, PNG
- **Documents**: PDF
- **Size Limit**: 10MB maximum

## Expected Output

The AI extracts the following information:

```typescript
{
  vendor: "Business name",
  date: "2024-01-15", // YYYY-MM-DD format
  amount: 12.45,
  category: "Meals", // Auto-categorized
  description: "Brief description",
  isDeductible: true, // Business expense detection
  paymentMethod: "Credit Card",
  taxAmount: 1.12
}
```

## Error Handling

The system provides clear error messages for:

- Missing API keys
- Unsupported file types
- File size limits
- API quota issues
- Network problems

## Adding New AI Providers

To add a new AI provider:

1. **Create the service class** in `src/lib/services/AIService.ts`:

   ```typescript
   export class NewAIService implements AIService {
     async processReceipt(file: File) {
       // Implementation here
     }
   }
   ```

2. **Update the factory function**:

   ```typescript
   export function createAIService(provider, config) {
     switch (provider) {
       case "newai":
         return new NewAIService(config);
       // ... existing cases
     }
   }
   ```

3. **Add configuration** in `src/lib/config/ai.ts`

## Cost Optimization

- **Gemini 1.5 Flash**: ~$0.001 per image (very cost-effective)
- **Gemini 1.5 Pro**: Higher accuracy, slightly more expensive
- Use Flash for most cases, Pro for complex receipts

## Troubleshooting

### "AI service not configured" Error

- Check that your API key is set in environment variables
- Restart your development server after adding the key

### "Unsupported file type" Error

- Only JPG, PNG, and PDF files are supported
- Check the file extension matches the actual file type

### "File too large" Error

- Maximum file size is 10MB
- Compress images or split large PDFs

### API Quota Exceeded

- Check your usage in the AI provider's console
- Upgrade your plan if needed
- Implement rate limiting if processing many files

## Security Notes

- API keys are server-side only (not exposed to client)
- Files are processed securely through AI APIs
- No file data is stored permanently
- Always use environment variables for API keys
