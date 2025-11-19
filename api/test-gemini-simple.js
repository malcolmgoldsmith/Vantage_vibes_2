// Simple standalone Gemini test for Vercel (no Express dependencies)
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY not found in environment variables'
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Get prompt from request body
    const { prompt = 'Say hello' } = req.body || {};

    // Call Gemini API
    const result = await genAI.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192
      }
    });

    // Extract response
    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      if (candidate.content && candidate.content.parts) {
        const textParts = candidate.content.parts
          .filter(part => part.text)
          .map(part => part.text);

        if (textParts.length > 0) {
          return res.status(200).json({
            success: true,
            output: textParts.join('\n'),
            message: 'Gemini API working!',
            model: 'gemini-3-pro-preview'
          });
        }
      }
    }

    return res.status(500).json({
      success: false,
      error: 'No text generated in response'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
