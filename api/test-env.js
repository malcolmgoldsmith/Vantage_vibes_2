// Simple standalone test endpoint for Vercel
export default function handler(req, res) {
  // Check if GEMINI_API_KEY exists
  const hasKey = !!process.env.GEMINI_API_KEY;
  const keyLength = process.env.GEMINI_API_KEY?.length || 0;

  // Return diagnostic info
  res.status(200).json({
    success: true,
    environment: {
      hasGeminiKey: hasKey,
      keyLength: keyLength,
      keyPreview: hasKey ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'NOT FOUND',
      nodeEnv: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1',
      vercelEnv: process.env.VERCEL_ENV
    },
    message: hasKey ? 'GEMINI_API_KEY is available!' : 'GEMINI_API_KEY is NOT available'
  });
}
