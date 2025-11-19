// ==================== VERCEL/ONLINE VERSION - GEMINI ONLY ====================
// This version is optimized for Vercel deployment with only Gemini AI provider
// For localhost with Claude support, use server.js instead

import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI client (REQUIRED for online version)
let genAI;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log('[ONLINE] Gemini API initialized successfully - Gemini-only mode active');
} else {
  console.error('[ONLINE] CRITICAL: GEMINI_API_KEY not configured. Server cannot function without it.');
  throw new Error('GEMINI_API_KEY is required for online version');
}

// ==================== AI PROVIDER ABSTRACTION LAYER ====================

/**
 * Base interface for AI providers
 * All providers must implement these methods for code generation
 */
class AIProvider {
  async generateText(prompt) {
    throw new Error('generateText() must be implemented by subclass');
  }

  getName() {
    throw new Error('getName() must be implemented by subclass');
  }
}

// Claude Provider removed from online version - use localhost version (server.js) for Claude support

/**
 * Gemini 3 Provider
 * Uses Google's Gemini API via @google/genai SDK
 */
class GeminiProvider extends AIProvider {
  constructor() {
    super();
    if (!genAI) {
      throw new Error('Gemini API not configured. Please set GEMINI_API_KEY in .env file.');
    }
  }

  async generateText(prompt) {
    try {
      const result = await genAI.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        generationConfig: {
          temperature: 0.7,  // Lowered from 1.0 for more consistent, production-quality output
          maxOutputTokens: 8192,  // Explicit token limit for code generation
          // Use high thinking level for code generation
          thinkingLevel: 'high'
        }
      });

      // Extract text from the response
      if (result.candidates && result.candidates.length > 0) {
        const candidate = result.candidates[0];
        if (candidate.content && candidate.content.parts) {
          // Combine all text parts
          const textParts = candidate.content.parts
            .filter(part => part.text)
            .map(part => part.text);

          if (textParts.length > 0) {
            return textParts.join('');
          }
        }
      }

      throw new Error('No text generated in Gemini response');
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  getName() {
    return 'gemini';
  }
}

/**
 * Factory function to get the appropriate AI provider (ONLINE VERSION - Gemini only)
 * Always returns Gemini provider regardless of input
 * @param {string} providerName - Ignored in online version, always uses Gemini
 * @returns {AIProvider}
 */
function getAIProvider(providerName = 'gemini') {
  // Online version only supports Gemini
  if (providerName && providerName.toLowerCase() === 'claude') {
    console.warn(`[ONLINE] Claude not supported in online version. Using Gemini instead.`);
  }
  return new GeminiProvider();
}

/**
 * Enhance prompts for Gemini 3's structured format preference (ONLINE VERSION)
 * Always enhances prompts since this version is Gemini-only
 * @param {string} basePrompt - The base prompt to enhance
 * @param {string} provider - Ignored in online version (always Gemini)
 * @returns {string} Enhanced prompt optimized for Gemini
 */
function enhancePromptForProvider(basePrompt, provider = 'gemini') {
  // Online version is Gemini-only, so always enhance

  // Gemini-specific enhancements
  const geminiEnhancements = `

# DESIGN SYSTEM REQUIREMENTS (Follow these guidelines precisely):

## Visual Hierarchy
- Use consistent spacing scale: space-y-2 (0.5rem), space-y-4 (1rem), space-y-6 (1.5rem), space-y-8 (2rem)
- Typography scale: text-3xl/text-2xl (headings), text-lg (subheadings), text-base (body), text-sm (captions)
- Font weights: font-bold (main headings), font-semibold (section headers/emphasis), font-medium (labels), font-normal (body)

## Color Strategy & Contrast
- Primary actions: bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800
- Success states: bg-green-600 text-white hover:bg-green-700
- Warning states: bg-yellow-500 text-white hover:bg-yellow-600
- Destructive actions: bg-red-600 text-white hover:bg-red-700
- Neutral UI: bg-gray-100, bg-gray-200 for backgrounds, text-gray-600/text-gray-700 for text
- WCAG AA compliance: Ensure 4.5:1 contrast ratio minimum for all text

## Interactive Elements (CRITICAL - Never skip these)
- ALL buttons MUST have hover states: hover:bg-opacity-90 or hover:scale-105 or hover:shadow-lg
- ALL buttons MUST have transitions: transition-all duration-200 or transition-colors
- Active states for tactile feedback: active:scale-95 or active:bg-opacity-80
- Disabled states: disabled:opacity-50 disabled:cursor-not-allowed
- Focus visibility for accessibility: focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none

## Layout Patterns
- Cards: rounded-lg p-4 md:p-6 shadow-md bg-white border border-gray-200
- Form inputs: w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
- Buttons: px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold shadow-md hover:shadow-lg
- Consistent padding/margin: Use 4-unit increments (p-4, p-6, p-8, mt-4, mb-6, etc.)

## Accessibility Requirements
- All icon-only buttons need aria-label attributes
- Form inputs need associated <label> elements with htmlFor
- Loading states need aria-live="polite" for screen readers
- Interactive elements need keyboard support (onKeyDown for Enter/Space keys)

# GOOD UI EXAMPLES (Study these patterns):

Example of a well-structured button:
<button
  onClick={handleClick}
  disabled={isLoading}
  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold
             hover:bg-blue-700 active:scale-95 disabled:opacity-50
             transition-all duration-200 shadow-md hover:shadow-lg
             focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none"
  aria-label="Submit form"
>
  {isLoading ? 'Processing...' : 'Submit'}
</button>

Example of a proper form input with label:
<div className="space-y-2">
  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               transition-colors"
    placeholder="you@example.com"
    aria-required="true"
  />
  {error && <p className="text-sm text-red-600">{error}</p>}
</div>

Example of loading state with spinner:
{isLoading && (
  <div className="flex items-center justify-center py-8" aria-live="polite">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
)}

Example of a card layout:
<div className="bg-white rounded-lg shadow-md border border-gray-200 p-6
                hover:shadow-lg transition-shadow duration-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Card Title</h3>
  <p className="text-gray-600">Card content goes here</p>
</div>

# QUALITY CHECKLIST (Verify ALL items before outputting code):
- [ ] All useState declarations have explicit TypeScript types (e.g., useState<string>(''))
- [ ] Every interactive element (button, input, link) has hover and focus states
- [ ] All buttons have transition classes (transition-all or transition-colors)
- [ ] Loading states exist for ALL async operations with visual feedback
- [ ] Error handling with try-catch for ALL API calls and async operations
- [ ] Responsive classes (sm:, md:, lg:) used for mobile-first design
- [ ] Accessibility: aria-labels on icon buttons, aria-live on dynamic content
- [ ] No console.log or debugging code left in the component
- [ ] Proper semantic HTML elements (button not div, input with label, etc.)
- [ ] Consistent spacing using Tailwind's scale (multiples of 4: 4, 8, 12, 16, 20, 24, 32)
- [ ] Component uses w-full h-full on root (no min-h-screen or fixed viewport heights)
- [ ] All async functions have error states displayed to the user
- [ ] TypeScript interfaces defined for all complex objects and props

# OUTPUT FORMAT RULES (CRITICAL - Follow exactly):
1. Output MUST START with: import React
2. Output MUST END with: };
3. NO text before the first import statement
4. NO explanatory text after the final closing brace
5. NO markdown code fences (\`\`\`) around the code
6. NO comments outside the actual TypeScript code
7. Code comments inside the component ARE encouraged for clarity
8. The export MUST be exactly: export const ComponentName: React.FC = () => { ... }

`;

  // For Gemini, we restructure the prompt with their enhancements inserted before the output format
  return basePrompt + geminiEnhancements;
}

// Configure CORS with environment-based origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5174']; // Default for development

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use('/generated-images', express.static(path.join(__dirname, 'public', 'generated-images')));

// Test endpoint to run Claude Code CLI
app.post('/api/test-claude', async (req, res) => {
  const { prompt } = req.body;

  console.log('Received prompt:', prompt);

  try {
    // Spawn Claude CLI with --print flag for non-interactive mode
    // We need to pipe the prompt via stdin, not as an argument
    const claudeProcess = spawn('claude', ['--print'], {
      shell: true,
      cwd: process.cwd()
    });

    let output = '';
    let errorOutput = '';

    // Write the prompt to stdin and close it
    claudeProcess.stdin.write(prompt);
    claudeProcess.stdin.end();

    // Capture stdout
    claudeProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      console.log('Claude output:', chunk);
    });

    // Capture stderr
    claudeProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      console.error('Claude error:', chunk);
    });

    // Handle process completion
    claudeProcess.on('close', (code) => {
      console.log(`Claude process exited with code ${code}`);

      if (code === 0) {
        res.json({
          success: true,
          output: output,
          message: 'Claude executed successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: errorOutput || 'Claude process failed',
          code: code
        });
      }
    });

    // Handle errors
    claudeProcess.on('error', (error) => {
      console.error('Failed to start Claude:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    });

  } catch (error) {
    console.error('Error spawning Claude:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint for Gemini 3
app.post('/api/test-gemini', async (req, res) => {
  const { prompt = 'Say hello and tell me what you can do in one sentence' } = req.body;

  console.log('Testing Gemini 3 with prompt:', prompt);

  try {
    const provider = getAIProvider('gemini');
    const output = await provider.generateText(prompt);

    console.log('Gemini 3 output:', output);

    res.json({
      success: true,
      output: output,
      message: 'Gemini 3 executed successfully',
      model: 'gemini-3-pro-preview'
    });
  } catch (error) {
    console.error('Gemini 3 test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint to create an actual app
app.post('/api/create-app-plan', async (req, res) => {
  const { description, aiProvider = 'claude' } = req.body;

  console.log(`Creating app for: "${description}" using provider: ${aiProvider}`);

  try {
    // Get the appropriate AI provider
    let provider;
    try {
      provider = getAIProvider(aiProvider);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // First, generate a catchy name and short description
    console.log('Generating app name and description...');
    const namePrompt = `Based on this app idea: "${description}"

Generate a JSON response with:
1. A short, punchy app name (2-3 words max, capitalize each word)
2. A concise description (7 words or less)

Output ONLY valid JSON in this exact format:
{"name": "App Name", "shortDescription": "Short description here"}`;

    let nameOutput;
    try {
      nameOutput = await provider.generateText(namePrompt);
    } catch (error) {
      console.error('Error generating app name:', error);
      return res.status(500).json({
        success: false,
        error: `Failed to generate app name with ${aiProvider}: ${error.message}`
      });
    }

    // Parse the name and description
    let appName = description;
    let shortDescription = description;

    try {
      const cleanJson = nameOutput.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
      const nameData = JSON.parse(cleanJson);
      appName = nameData.name || description;
      shortDescription = nameData.shortDescription || description;
      console.log(`Generated name: ${appName}, description: ${shortDescription}`);
    } catch (e) {
      console.error('Failed to parse name generation:', e);
    }

    // Generate component name from the app name
    const componentName = appName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
      .split(' ')
      .filter(word => word.length > 0) // Remove empty strings
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    // Create a prompt for Claude to generate actual React component code
    const prompt = `Create a complete, working React + TypeScript component for this app: "${description}"

IMPORTANT REQUIREMENTS:
1. Generate a single, self-contained React component file
2. Use TypeScript with proper types
3. Use Tailwind CSS for all styling (already available in the project)
4. Make it fully functional and interactive
5. Include proper state management with React hooks
6. The component MUST be named EXACTLY: ${componentName}
7. Export the component as: export const ${componentName}: React.FC = () => { ... }
8. CRITICAL: Always use explicit semicolons after every statement - NEVER rely on ASI
9. When returning template literals, format like: return (\`...\`); with parentheses
10. RESPONSIVE LAYOUT: The component will be rendered inside a modal window. Do NOT use min-h-screen or fixed heights. Instead:
    - Use h-full and w-full on the root container to fill the available space
    - Use flex layout with flex-col or flex-row to organize content
    - Make the UI responsive and fit within the available space WITHOUT scrolling unless content is dynamic
    - Example structure: <div className="w-full h-full flex flex-col p-6">...</div>

AI IMAGE GENERATION (SMART DETECTION):
IMPORTANT: Analyze the app description for image-related keywords. If the app involves images, photos, pictures, galleries, uploads, visual content, graphics, art, drawings, editing, filters, or manipulation - AUTOMATICALLY include the built-in image generator helper.

**Detection Keywords:** image, photo, picture, gallery, upload, camera, visual, graphic, art, draw, edit, filter, manipulate, generate, create, avatar, profile pic, banner, thumbnail, media

**If image features ARE needed, include this custom hook at the top of your component:**
\`\`\`typescript
// Built-in Gemini Image Generator Hook
const useImageGenerator = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URI prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Generate new image from text prompt (text-to-image)
  const generate = async (key: string, prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '21:9' = '16:9') => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch('http://localhost:3001/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio })
      });
      const data = await response.json();
      if (data.success) {
        setImages(prev => ({ ...prev, [key]: data.imageUrl }));
        return data.imageUrl;
      }
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
    return null;
  };

  // Edit existing image with text prompt (image-to-image)
  const editImage = async (key: string, prompt: string, inputImageBase64: string) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch('http://localhost:3001/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, inputImage: inputImageBase64 })
      });
      const data = await response.json();
      if (data.success) {
        setImages(prev => ({ ...prev, [key]: data.imageUrl }));
        return data.imageUrl;
      }
    } catch (error) {
      console.error('Image editing failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
    return null;
  };

  return { images, loading, generate, editImage, fileToBase64 };
};
\`\`\`

**Then use it in your component:**
\`\`\`typescript
const { images, loading, generate, editImage, fileToBase64 } = useImageGenerator();

// TEXT-TO-IMAGE: Generate a new image from text prompt
const handleGenerate = () => {
  generate('hero', 'A beautiful sunset over mountains with vibrant colors', '16:9');
};

// IMAGE-TO-IMAGE: Edit an uploaded image with a text prompt
const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    const base64 = await fileToBase64(file);
    // Edit the uploaded image
    await editImage('edited', 'Add a puffer jacket to this pet', base64);
  }
};

// Display the images
{images.hero && <img src={images.hero} alt="Generated" className="w-full rounded-lg" />}
{images.edited && <img src={images.edited} alt="Edited" className="w-full rounded-lg" />}
{loading.hero && <div>Generating image...</div>}
{loading.edited && <div>Editing image...</div>}
\`\`\`

**CRITICAL RULE: When to use generate() vs editImage():**

🚫 NEVER use \`generate()\` if the user uploaded an image file! This will ignore their upload and create a random new image.

✅ ALWAYS use \`editImage()\` when:
- User uploads/selects a file via <input type="file">
- User drags and drops an image
- User provides their own photo/image
- The app stores uploaded image in state (e.g., setUploadedImage, setOriginalImage)
- You want to MODIFY/TRANSFORM the user's actual image

✅ ONLY use \`generate()\` when:
- Creating brand new images from scratch with NO user upload
- Generating backgrounds, hero banners, placeholder images
- Creating artwork without any input image

**Example scenarios:**
- "Add puffer jacket to my pet" + user uploads photo → Use \`editImage()\` with uploaded base64
- "Generate a sunset background" with no upload → Use \`generate()\`
- "Apply filters to this image" + user uploads photo → Use \`editImage()\` with uploaded base64
- "Create art for my gallery" with no upload → Use \`generate()\`

**Implementation pattern for image upload apps:**
\`\`\`typescript
const [uploadedImage, setUploadedImage] = useState<string>(''); // Store data URI

const handleFileUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    setUploadedImage(e.target?.result as string); // Store as data URI
  };
  reader.readAsDataURL(file);
};

const handleProcess = async () => {
  if (!uploadedImage) return;
  // Extract base64 from data URI
  const base64Data = uploadedImage.split(',')[1];
  // ALWAYS use editImage for uploaded images
  await editImage('result', 'Your transformation prompt', base64Data);
};
\`\`\`
\`\`\`

**If image features are NOT needed:** Skip all image generation code entirely. Do not include the useImageGenerator hook or any image-related functionality.

**Examples of when TO include:**
- "photo gallery app" → YES, include useImageGenerator
- "image upload and edit tool" → YES, include useImageGenerator
- "art generator" → YES, include useImageGenerator
- "profile picture creator" → YES, include useImageGenerator

**Examples of when NOT to include:**
- "todo list app" → NO, skip image generation
- "calculator" → NO, skip image generation
- "weather dashboard" → NO, skip image generation
- "chat app" → NO, skip image generation (unless mentions "profile pics" or "avatars")

OUTPUT FORMAT:
Please output ONLY the component code, starting with imports and ending with the export.
Do not include explanations, markdown code blocks, or extra commentary.
Just pure TypeScript/React code that can be saved directly to a .tsx file.

CRITICAL: The export must be EXACTLY:
export const ${componentName}: React.FC = () => {
  // Component logic here
  return (
    <div className="w-full h-full flex flex-col p-6">
      {/* UI here */}
    </div>
  );
};`;

    console.log(`Generating component with ${aiProvider}...`);
    let output;
    try {
      const enhancedPrompt = enhancePromptForProvider(prompt, aiProvider);
      output = await provider.generateText(enhancedPrompt);
      console.log(`Component generated successfully with ${aiProvider}`);
    } catch (error) {
      console.error(`Error generating component with ${aiProvider}:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to generate component with ${aiProvider}: ${error.message}`
      });
    }

    // Process the generated code
    try {
        // Create generated apps directory if it doesn't exist
        const appsDir = path.join(__dirname, 'src', 'generated-apps');
        if (!fs.existsSync(appsDir)) {
          fs.mkdirSync(appsDir, { recursive: true });
        }

        // Save the component file temporarily for validation
        const fileName = `${componentName}.tsx`;
        const filePath = path.join(appsDir, fileName);

        try {
          // Clean the output - remove markdown code blocks if present
          let cleanedOutput = output.trim();
          if (cleanedOutput.startsWith('```')) {
            cleanedOutput = cleanedOutput
              .replace(/^```[\w]*\n/, '')
              .replace(/\n```$/, '')
              .trim();
          }

          // Add semicolons after template literals in return statements (Babel workaround)
          cleanedOutput = cleanedOutput.replace(/return `([^`]+)`/g, 'return `$1`;');

          fs.writeFileSync(filePath, cleanedOutput);
          console.log(`App saved to: ${filePath}`);

          // Validate the code by trying to parse it
          const { spawn: spawnValidation } = await import('child_process');
          const tscProcess = spawnValidation('npx', ['tsc', '--noEmit', '--jsx', 'preserve', filePath], {
            shell: true,
            cwd: process.cwd()
          });

          let validationError = '';
          tscProcess.stderr.on('data', (data) => {
            validationError += data.toString();
          });

          tscProcess.on('close', (tscCode) => {
            if (tscCode !== 0 && validationError) {
              console.error(`Validation failed for ${aiProvider}:`, validationError);
              // Delete the invalid file
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
              res.status(500).json({
                success: false,
                error: `Generated code has syntax errors. Please try again.`,
                details: validationError,
                provider: aiProvider
              });
              return;
            }

            // Validation passed, save metadata
            console.log(`Validation passed for ${aiProvider} generated code`);
            saveAppMetadata();
          });

          function saveAppMetadata() {
            // Also save app metadata for the grid
            const metadataPath = path.join(appsDir, 'apps.json');
            let apps = [];

            if (fs.existsSync(metadataPath)) {
              apps = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
            }

            apps.push({
              id: Date.now().toString(),
              name: appName,
              componentName: componentName,
              fileName: fileName,
              createdAt: new Date().toISOString(),
              description: shortDescription,
              aiProvider: aiProvider // Store which AI provider was used
            });

            fs.writeFileSync(metadataPath, JSON.stringify(apps, null, 2));

            res.json({
              success: true,
              app: {
                name: appName,
                componentName: componentName,
                fileName: fileName,
                description: shortDescription,
                aiProvider: aiProvider
              },
              message: 'App created and validated successfully'
            });
          }
        } catch (err) {
          console.error('Error saving app:', err);
          res.status(500).json({
            success: false,
            error: 'Failed to save app file'
          });
        }
    } catch (err) {
      console.error('Error processing generated code:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to process generated code'
      });
    }

  } catch (error) {
    console.error('Error creating app plan:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint to get all generated apps
app.get('/api/generated-apps', (req, res) => {
  const metadataPath = path.join(__dirname, 'src', 'generated-apps', 'apps.json');

  if (fs.existsSync(metadataPath)) {
    const apps = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    res.json({ success: true, apps });
  } else {
    res.json({ success: true, apps: [] });
  }
});

// Endpoint to edit an existing app
app.post('/api/edit-app', async (req, res) => {
  const { appId, editInstructions, aiProvider = 'claude' } = req.body;

  console.log(`Editing app: ${appId} with instructions: "${editInstructions}" using provider: ${aiProvider}`);

  try {
    // Get the appropriate AI provider
    let provider;
    try {
      provider = getAIProvider(aiProvider);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    // Load app metadata
    const metadataPath = path.join(__dirname, 'src', 'generated-apps', 'apps.json');

    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ success: false, error: 'No apps found' });
    }

    const apps = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    const app = apps.find(a => a.id === appId);

    if (!app) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    // Read the current app code
    const filePath = path.join(__dirname, 'src', 'generated-apps', app.fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'App file not found' });
    }

    const currentCode = fs.readFileSync(filePath, 'utf-8');

    // Create prompt for Claude to edit the code
    const prompt = `You are editing an existing React + TypeScript component. Here is the current code:

\`\`\`typescript
${currentCode}
\`\`\`

User's edit request: "${editInstructions}"

IMPORTANT REQUIREMENTS:
1. Modify the existing code based on the user's request
2. Maintain the EXACT component name: ${app.componentName}
3. Keep using TypeScript with proper types
4. Keep using Tailwind CSS for styling
5. Maintain the export format: export const ${app.componentName}: React.FC = () => { ... }
6. CRITICAL: Always use explicit semicolons after every statement
7. RESPONSIVE LAYOUT: Keep using w-full h-full on root container with overflow-hidden
8. Make sure the component still fills the modal window without scrollbars

AI IMAGE GENERATION (SMART DETECTION):
IMPORTANT: Check if the edit request involves images, photos, pictures, uploads, or visual content. If YES, add or use the built-in useImageGenerator hook.

**If image features need to be ADDED and don't exist, include this hook:**
\`\`\`typescript
// Built-in Gemini Image Generator Hook
const useImageGenerator = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URI prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Generate new image from text prompt (text-to-image)
  const generate = async (key: string, prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '21:9' = '16:9') => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch('http://localhost:3001/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio })
      });
      const data = await response.json();
      if (data.success) {
        setImages(prev => ({ ...prev, [key]: data.imageUrl }));
        return data.imageUrl;
      }
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
    return null;
  };

  // Edit existing image with text prompt (image-to-image)
  const editImage = async (key: string, prompt: string, inputImageBase64: string) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch('http://localhost:3001/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, inputImage: inputImageBase64 })
      });
      const data = await response.json();
      if (data.success) {
        setImages(prev => ({ ...prev, [key]: data.imageUrl }));
        return data.imageUrl;
      }
    } catch (error) {
      console.error('Image editing failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
    return null;
  };

  return { images, loading, generate, editImage, fileToBase64 };
};
\`\`\`

**CRITICAL RULE: When to use generate() vs editImage():**

🚫 NEVER use \`generate()\` if the user uploaded an image file! This will ignore their upload and create a random new image.

✅ ALWAYS use \`editImage()\` when:
- User uploads/selects a file via <input type="file">
- User drags and drops an image
- User provides their own photo/image
- The app stores uploaded image in state (e.g., setUploadedImage, setOriginalImage)
- You want to MODIFY/TRANSFORM the user's actual image

✅ ONLY use \`generate()\` when:
- Creating brand new images from scratch with NO user upload
- Generating backgrounds, hero banners, placeholder images
- Creating artwork without any input image

**Implementation pattern for image upload apps:**
\`\`\`typescript
const [uploadedImage, setUploadedImage] = useState<string>(''); // Store data URI

const handleFileUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    setUploadedImage(e.target?.result as string); // Store as data URI
  };
  reader.readAsDataURL(file);
};

const handleProcess = async () => {
  if (!uploadedImage) return;
  // Extract base64 from data URI
  const base64Data = uploadedImage.split(',')[1];
  // ALWAYS use editImage for uploaded images
  await editImage('result', 'Your transformation prompt', base64Data);
};
\`\`\`

**If the hook already exists in the code:** Just use it to implement the requested changes following the rules above.
**If edit request has nothing to do with images:** Don't add or modify image-related code.

OUTPUT FORMAT:
Output ONLY the complete updated component code, starting with imports and ending with the export.
Do not include explanations, markdown code blocks, or extra commentary.
Just pure TypeScript/React code that can be saved directly to a .tsx file.`;

    console.log(`Editing component with ${aiProvider}...`);
    let output;
    try {
      const enhancedPrompt = enhancePromptForProvider(prompt, aiProvider);
      output = await provider.generateText(enhancedPrompt);
      console.log(`Component edited successfully with ${aiProvider}`);
    } catch (error) {
      console.error(`Error editing component with ${aiProvider}:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to edit component with ${aiProvider}: ${error.message}`
      });
    }

    try {
      // Clean the output
      let cleanedOutput = output.trim();
      if (cleanedOutput.startsWith('```')) {
        cleanedOutput = cleanedOutput
          .replace(/^```[\w]*\n/, '')
          .replace(/\n```$/, '')
          .trim();
      }

      // Add semicolons after template literals
      cleanedOutput = cleanedOutput.replace(/return `([^`]+)`/g, 'return `$1`;');

      // Save the updated code temporarily for validation
      fs.writeFileSync(filePath, cleanedOutput);
      console.log(`App edited and saved to: ${filePath}`);

      // Validate the edited code with TypeScript compiler
      console.log(`Validating edited code with ${aiProvider}...`);
      const { spawn: spawnValidation } = await import('child_process');
      const tscProcess = spawnValidation('npx', ['tsc', '--noEmit', '--jsx', 'preserve', filePath], {
        shell: true,
        cwd: process.cwd()
      });

      let validationError = '';
      tscProcess.stderr.on('data', (data) => {
        validationError += data.toString();
      });

      tscProcess.on('close', (tscCode) => {
        if (tscCode !== 0 && validationError) {
          console.error(`Validation failed for ${aiProvider} edited code:`, validationError);
          res.status(500).json({
            success: false,
            error: `Generated code has syntax errors. Please try editing again.`,
            details: validationError,
            provider: aiProvider
          });
          return;
        }

        // Validation passed
        console.log(`Validation passed for ${aiProvider} edited code`);
        res.json({
          success: true,
          message: `App edited successfully with ${aiProvider}`,
          provider: aiProvider
        });
      });

      tscProcess.on('error', (error) => {
        console.error('TypeScript validation process error:', error);
        // If validation fails to run, still allow the edit (validation is best-effort)
        res.json({
          success: true,
          message: `App edited successfully with ${aiProvider} (validation skipped)`,
          provider: aiProvider,
          warning: 'Code validation could not be performed'
        });
      });

    } catch (err) {
      console.error('Error saving edited app:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to save edited app'
      });
    }

  } catch (error) {
    console.error('Error editing app:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint to improve a prompt
app.post('/api/improve-prompt', async (req, res) => {
  const { prompt, aiProvider = 'claude' } = req.body;

  console.log(`Improving prompt: "${prompt}" using provider: ${aiProvider}`);

  try {
    // Get the appropriate AI provider
    let provider;
    try {
      provider = getAIProvider(aiProvider);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    const improvePrompt = `You are an expert UI/UX designer helping create beautiful, functional React web apps.

User's basic idea: "${prompt}"

Transform this into a detailed prompt that will help Claude Code generate a polished, professional React component.

ENHANCEMENT RULES:

1. COLOR PALETTE (Always specify):
   - Pick 2-3 harmonious colors with hex codes
   - Ensure good contrast (WCAG AA minimum)
   - Examples: Indigo (#4F46E5) + Pink (#EC4899), Teal (#14B8A6) + Cyan (#06B6D4)

2. LAYOUT & SPACING:
   - Use consistent spacing scale: 8px, 16px, 24px, 32px, 48px
   - Specify padding: generous (24-32px for cards)
   - Border radius: 8-16px for modern look
   - Center main content with max-width constraints

3. TYPOGRAPHY:
   - Define hierarchy: Title (20-24px), Body (14-16px), Small (12-13px)
   - Specify font weights: Semibold for titles (600), Medium for emphasis (500), Regular for body (400)

4. VISUAL ELEMENTS:
   - Add ONE signature visual element (gradient background, illustration, icon, or animation)
   - Use subtle shadows for depth: shadow-sm, shadow-md
   - Glassmorphism/cards: frosted glass effect with backdrop-blur

5. INTERACTIONS (Keep it smooth):
   - Hover states: subtle scale (1.02-1.05) or color change
   - Transitions: 200-300ms ease for snappy feel
   - Loading states: spinner or skeleton UI
   - Button states: clear hover, active, disabled

6. SIMPLICITY CONSTRAINTS:
   - List 3-5 CORE features only (avoid feature creep)
   - Explicitly state what NOT to include
   - One primary action per screen
   - Mobile-responsive: min 44px touch targets

7. FUNCTIONAL CLARITY:
   - Clear input labels and placeholders
   - Visible feedback for all actions (success/error messages)
   - Logical information hierarchy (most important at top)

8. ANIMATION GUIDELINES:
   - Use sparingly: entrance animations only
   - Fade-in: 300ms for new content
   - Slide-in: 200ms for modals/drawers
   - NO distracting continuous animations

OUTPUT FORMAT:
Write a concise but detailed description (3-5 sentences) covering:
- Core functionality
- Visual design (colors, layout, key UI elements)
- One standout visual feature
- What to avoid/exclude

Example output:
"Create a Tic Tac Toe game with a clean 3x3 grid using indigo (#4F46E5) for X and pink (#EC4899) for O. Center the board with generous 32px padding, 16px rounded corners, and subtle shadow-md. Add smooth hover effects (scale 1.05, 200ms) on empty cells and animate the winning line with a fade-in stroke. Display current player turn above the board in 20px semibold text. Include a reset button below. Keep it simple: no AI opponent, no score tracking, no complex animations. Mobile-responsive with 56px cell size for easy tapping."

Now enhance the user's prompt following these rules. Output ONLY the enhanced description.`;

    let output;
    try {
      output = await provider.generateText(improvePrompt);
      console.log(`Prompt improved successfully with ${aiProvider}`);
    } catch (error) {
      console.error(`Error improving prompt with ${aiProvider}:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to improve prompt with ${aiProvider}: ${error.message}`
      });
    }

    res.json({
      success: true,
      improvedPrompt: output.trim()
    });

  } catch (error) {
    console.error('Error improving prompt:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint to delete a generated app
app.delete('/api/generated-apps/:id', (req, res) => {
  const { id } = req.params;
  const metadataPath = path.join(__dirname, 'src', 'generated-apps', 'apps.json');

  try {
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ success: false, error: 'No apps found' });
    }

    const apps = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    const appToDelete = apps.find(app => app.id === id);

    if (!appToDelete) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    // Delete the component file
    const filePath = path.join(__dirname, 'src', 'generated-apps', appToDelete.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from metadata
    const updatedApps = apps.filter(app => app.id !== id);
    fs.writeFileSync(metadataPath, JSON.stringify(updatedApps, null, 2));

    res.json({ success: true, message: 'App deleted successfully' });
  } catch (error) {
    console.error('Error deleting app:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== GEMINI IMAGE GENERATION ENDPOINTS ====================

// Endpoint to generate images from text prompts using Gemini
app.post('/api/gemini/generate-image', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({
      success: false,
      error: 'Gemini API not configured. Please set GEMINI_API_KEY in .env file.'
    });
  }

  const { prompt, aspectRatio = '16:9', returnFormat = 'url' } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required'
    });
  }

  console.log(`Generating image with prompt: "${prompt}" (${aspectRatio})`);

  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseModalities: ['Image'],
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    // Extract image data from response candidates
    if (result.candidates && result.candidates.length > 0) {
      for (const candidate of result.candidates) {
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const imageData = part.inlineData.data; // Base64 data
              const mimeType = part.inlineData.mimeType || 'image/png';

              // Determine format: 'url' saves to disk and returns URL, 'base64' returns raw data
              if (returnFormat === 'base64') {
                return res.json({
                  success: true,
                  image: imageData,
                  mimeType: mimeType,
                  format: 'base64'
                });
              } else {
                // Save to disk and return URL
                const imageBuffer = Buffer.from(imageData, 'base64');
                const extension = mimeType.includes('png') ? 'png' : 'jpg';
                const filename = `gemini-${Date.now()}.${extension}`;
                const imagesDir = path.join(__dirname, 'public', 'generated-images');
                const filepath = path.join(imagesDir, filename);

                // Ensure directory exists
                if (!fs.existsSync(imagesDir)) {
                  fs.mkdirSync(imagesDir, { recursive: true });
                }

                fs.writeFileSync(filepath, imageBuffer);
                console.log(`Image saved to: ${filepath}`);

                return res.json({
                  success: true,
                  imageUrl: `http://localhost:${PORT}/generated-images/${filename}`,
                  filename: filename,
                  mimeType: mimeType,
                  format: 'url'
                });
              }
            }
          }
        }
      }
    }

    // No image found in response
    res.status(500).json({
      success: false,
      error: 'No image generated in response'
    });

  } catch (error) {
    console.error('Gemini image generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate image'
    });
  }
});

// Endpoint to edit images with Gemini (image-to-image with text prompt)
app.post('/api/gemini/edit-image', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({
      success: false,
      error: 'Gemini API not configured. Please set GEMINI_API_KEY in .env file.'
    });
  }

  const { prompt, inputImage, returnFormat = 'url' } = req.body;

  if (!prompt || !inputImage) {
    return res.status(400).json({
      success: false,
      error: 'Both prompt and inputImage (base64) are required'
    });
  }

  console.log(`Editing image with prompt: "${prompt}"`);

  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/png',
              data: inputImage
            }
          }
        ]
      }],
      generationConfig: {
        responseModalities: ['Image']
      }
    });

    // Extract edited image data from response
    if (result.candidates && result.candidates.length > 0) {
      for (const candidate of result.candidates) {
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const imageData = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || 'image/png';

              if (returnFormat === 'base64') {
                return res.json({
                  success: true,
                  image: imageData,
                  mimeType: mimeType,
                  format: 'base64'
                });
              } else {
                // Save to disk and return URL
                const imageBuffer = Buffer.from(imageData, 'base64');
                const extension = mimeType.includes('png') ? 'png' : 'jpg';
                const filename = `gemini-edited-${Date.now()}.${extension}`;
                const imagesDir = path.join(__dirname, 'public', 'generated-images');
                const filepath = path.join(imagesDir, filename);

                if (!fs.existsSync(imagesDir)) {
                  fs.mkdirSync(imagesDir, { recursive: true });
                }

                fs.writeFileSync(filepath, imageBuffer);
                console.log(`Edited image saved to: ${filepath}`);

                return res.json({
                  success: true,
                  imageUrl: `http://localhost:${PORT}/generated-images/${filename}`,
                  filename: filename,
                  mimeType: mimeType,
                  format: 'url'
                });
              }
            }
          }
        }
      }
    }

    res.status(500).json({
      success: false,
      error: 'No edited image generated in response'
    });

  } catch (error) {
    console.error('Gemini image edit error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to edit image'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
