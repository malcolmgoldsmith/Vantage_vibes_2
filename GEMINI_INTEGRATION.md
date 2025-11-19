# Gemini Image Generation Integration

This document explains how the Google Gemini image generation API has been integrated into your Vantage Vibes app builder.

## Overview

Your Claude Code instances can now **intelligently detect** when apps need images and automatically include Gemini AI image generation capabilities. Claude only adds image features when the app description involves images, photos, galleries, or visual content - keeping non-image apps clean and lightweight.

## Smart Detection

Claude Code automatically analyzes app descriptions for image-related keywords and only includes the `useImageGenerator` hook when needed.

### Detection Keywords
- **Will include image generation:** image, photo, picture, gallery, upload, camera, visual, graphic, art, draw, edit, filter, manipulate, generate, create, avatar, profile pic, banner, thumbnail, media

### Examples

**Apps that WILL include image generation:**
- ✅ "photo gallery app"
- ✅ "image upload and edit tool"
- ✅ "art generator"
- ✅ "profile picture creator"
- ✅ "thumbnail maker"
- ✅ "visual designer"

**Apps that will NOT include image generation:**
- ❌ "todo list app"
- ❌ "calculator"
- ❌ "weather dashboard"
- ❌ "chat app" (unless mentions "profile pics" or "avatars")
- ❌ "timer app"
- ❌ "notes app"

## What Was Added

### 1. Backend Infrastructure

**New API Endpoints:**
- `POST /api/gemini/generate-image` - Generate images from text prompts
- `POST /api/gemini/edit-image` - Edit existing images with text prompts

**File Storage:**
- Created `public/generated-images/` directory
- Configured Express to serve images statically at `/generated-images`

### 2. Environment Configuration

**`.env` file created with:**
```
GEMINI_API_KEY=your_api_key_here
```

Your API key is already configured in the `.env` file.

### 3. Dependencies Installed

```json
{
  "@google/generative-ai": "^0.21.0",
  "dotenv": "^16.4.7"
}
```

### 4. Claude Code Smart Integration

Updated the system prompts in [server.js](server.js) to teach Claude Code about:
- **Smart detection** of image-related app descriptions
- Automatic inclusion of `useImageGenerator` hook when needed
- When to use AI image generation
- Best practices for implementing image features

### 5. Built-in useImageGenerator Hook

When Claude detects an image-related app, it automatically includes this custom hook:

```typescript
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
  const generate = async (
    key: string,
    prompt: string,
    aspectRatio: '1:1' | '16:9' | '9:16' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '21:9' = '16:9'
  ) => {
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
```

**Usage in generated components:**
```typescript
const { images, loading, generate, editImage, fileToBase64 } = useImageGenerator();

// TEXT-TO-IMAGE: Generate a new image from text
const handleGenerate = () => {
  generate('hero', 'A beautiful sunset over mountains', '16:9');
};

// IMAGE-TO-IMAGE: Edit an uploaded image
const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    const base64 = await fileToBase64(file);
    await editImage('edited', 'Add a puffer jacket to this pet', base64);
  }
};

// Display the images
{images.hero && <img src={images.hero} alt="Generated" />}
{images.edited && <img src={images.edited} alt="Edited" />}
{loading.hero && <div>Generating...</div>}
{loading.edited && <div>Editing...</div>}
```

## How It Works

### Architecture Flow

```
User requests app → Claude Code analyzes description →
If image keywords detected:
  ├─ Include useImageGenerator hook in component
  ├─ Add image generation UI/logic
  └─ Component calls /api/gemini/generate-image →
      Backend calls Google Gemini API → Image saved to disk →
      Image URL returned → Component displays image

If NO image keywords detected:
  └─ Generate clean component without image features
```

### Smart Detection Process

1. **User describes app** (e.g., "photo gallery" or "calculator")
2. **Claude analyzes keywords** (looks for: image, photo, picture, upload, gallery, etc.)
3. **Decision:**
   - **Keywords found** → Include `useImageGenerator` hook + image UI
   - **No keywords** → Skip image generation entirely
4. **Component generated** with appropriate features

### API Usage

**Generate an Image:**
```typescript
const response = await fetch('http://localhost:3001/api/gemini/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A serene mountain landscape at sunset with vibrant colors',
    aspectRatio: '16:9',
    returnFormat: 'url' // or 'base64'
  })
});

const data = await response.json();
if (data.success) {
  console.log(data.imageUrl); // http://localhost:3001/generated-images/gemini-1234567890.png
}
```

**Edit an Image:**
```typescript
const response = await fetch('http://localhost:3001/api/gemini/edit-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Add a rainbow to the sky',
    inputImage: base64ImageData, // base64 string without data URI prefix
    returnFormat: 'url'
  })
});
```

### Response Format

**Success Response (URL format):**
```json
{
  "success": true,
  "imageUrl": "http://localhost:3001/generated-images/gemini-1234567890.png",
  "filename": "gemini-1234567890.png",
  "mimeType": "image/png",
  "format": "url"
}
```

**Success Response (Base64 format):**
```json
{
  "success": true,
  "image": "base64_encoded_image_data...",
  "mimeType": "image/png",
  "format": "base64"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Supported Features

### Aspect Ratios
- `1:1` - Square (1024×1024)
- `16:9` - Widescreen (1344×768)
- `9:16` - Portrait (768×1344)
- `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `21:9` - Various proportions

### Image Formats
- PNG (default)
- JPEG

### Generation Modes
1. **Text-to-Image** - Generate from text descriptions
2. **Image-to-Image** - Edit existing images with text prompts

## Pricing & Usage

- **Cost per image:** ~$0.04 USD (1,290 tokens @ $30/1M tokens)
- **Model:** `gemini-2.0-flash-exp`
- **Generation time:** 2-5 seconds typically

## Example: React Component Using Image Generation

```typescript
import React, { useState } from 'react';

export const ImageGallery: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          aspectRatio: '16:9'
        })
      });

      const data = await response.json();
      if (data.success) {
        setImageUrl(data.imageUrl);
      } else {
        console.error('Generation failed:', data.error);
      }
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-4">AI Image Generator</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={generateImage}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {imageUrl && !loading && (
        <img
          src={imageUrl}
          alt="Generated"
          className="w-full rounded-lg shadow-lg"
        />
      )}
    </div>
  );
};
```

## When Claude Code Uses Image Generation

Claude Code is instructed to use image generation for:

1. **Hero sections** - Eye-catching banner images
2. **Backgrounds** - Decorative or thematic backgrounds
3. **Placeholders** - Gallery or portfolio placeholder images
4. **Icons & Illustrations** - Custom visual elements
5. **Dynamic Content** - User-generated image features
6. **Visual Accents** - Any UI element that benefits from AI imagery

### When to Use `generate()` vs `editImage()`

**🚫 CRITICAL RULE: NEVER use `generate()` when the user uploads an image!**

This is the most common mistake - calling `generate()` when the user has uploaded their own photo will IGNORE their upload and create a completely random new image instead.

**✅ ALWAYS use `editImage()` for IMAGE-TO-IMAGE when:**
- User uploads/selects a file via `<input type="file">`
- User drags and drops an image
- User provides their own photo/image
- The app stores uploaded image in state (e.g., `setUploadedImage`, `setOriginalImage`)
- You want to MODIFY/TRANSFORM the user's actual image
- Adding elements to existing photos (e.g., "add puffer jacket to this pet")
- Applying styles or filters to uploaded images
- Example: User uploads bear photo → "add a puffer jacket" → edits the bear image (doesn't generate new dog image)

**✅ ONLY use `generate()` for TEXT-TO-IMAGE when:**
- Creating brand new images from scratch with NO user upload
- Generating hero banners, backgrounds, placeholder images
- Creating artwork, illustrations, or visual elements
- When no input image exists yet
- Example: "Generate a sunset over mountains for the hero section"

**Implementation Pattern:**
```typescript
const [uploadedImage, setUploadedImage] = useState<string>(''); // Store data URI

// When user uploads an image
const handleFileUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    setUploadedImage(e.target?.result as string); // Store as data URI
  };
  reader.readAsDataURL(file);
};

// When processing the uploaded image
const handleProcess = async () => {
  if (!uploadedImage) return;

  // Extract base64 from data URI (remove "data:image/...;base64," prefix)
  const base64Data = uploadedImage.split(',')[1];

  // ✅ CORRECT: Use editImage for uploaded images
  await editImage('result', 'Add a puffer jacket to this pet', base64Data);

  // 🚫 WRONG: Never use generate() when you have an uploaded image
  // await generate('result', 'A pet with a puffer jacket', '1:1'); // This ignores the upload!
};
```

**Important:** Always pass uploaded images to `editImage()`, not `generate()`. Convert File objects to base64 using `fileToBase64()` or extract from data URI before calling `editImage()`.

## Best Practices

### For Claude Code:
- Always show loading states during generation
- Handle errors gracefully with try-catch
- Use descriptive, detailed prompts for better results
- Consider caching images to avoid regeneration
- Choose appropriate aspect ratios for the layout

### For Developers:
- Monitor the `public/generated-images/` directory size
- Implement cleanup for old images if needed
- Consider rate limiting for production use
- Add user authentication if exposing publicly

## Testing the Integration

### 1. Test Basic Generation

```bash
curl -X POST http://localhost:3001/api/gemini/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cute robot assistant", "aspectRatio": "1:1"}'
```

### 2. Test in Generated Apps

Create an app with image generation:
1. Click "Create New App" in Vantage Vibes
2. Describe an app that would use images (e.g., "A photo gallery app with AI-generated nature images")
3. Claude Code will automatically implement image generation

### 3. Verify Server Logs

Start the server and check for:
```
Gemini API initialized successfully
Backend server running on http://localhost:3001
```

## Troubleshooting

### API Key Issues
```
Warning: GEMINI_API_KEY not configured
```
**Solution:** Ensure `.env` file exists with valid API key

### Image Not Displaying
- Check if file exists in `public/generated-images/`
- Verify Express static serving: `http://localhost:3001/generated-images/`
- Check browser console for CORS or network errors

### Generation Errors
- Check server logs for detailed error messages
- Verify API key has proper permissions
- Ensure prompt doesn't violate content policies

## Files Modified

1. **[server.js](server.js)** - Added Gemini client, endpoints, and Claude prompts
2. **[.env](.env)** - Created for API key storage
3. **[package.json](package.json)** - Added dependencies
4. **public/generated-images/** - Created directory for image storage

## Next Steps

The integration is complete and ready to use! When you create apps through Vantage Vibes, Claude Code will now have the ability to generate AI images. Try creating:

- A portfolio website with AI-generated project thumbnails
- A recipe app with food photography
- A travel blog with destination images
- An art gallery with generated artwork
- A storytelling app with illustration generation

## API Reference

### POST /api/gemini/generate-image

**Request Body:**
```typescript
{
  prompt: string;          // Required: Description of image to generate
  aspectRatio?: string;    // Optional: Default "16:9"
  returnFormat?: string;   // Optional: "url" (default) or "base64"
}
```

**Response:**
```typescript
{
  success: boolean;
  imageUrl?: string;       // Present if returnFormat="url"
  image?: string;          // Present if returnFormat="base64"
  filename?: string;
  mimeType: string;
  format: "url" | "base64";
}
```

### POST /api/gemini/edit-image

**Request Body:**
```typescript
{
  prompt: string;          // Required: Edit instruction
  inputImage: string;      // Required: Base64 image data
  returnFormat?: string;   // Optional: "url" (default) or "base64"
}
```

**Response:** Same as generate-image

---

**Integration completed successfully!** Your Claude Code app builder now has AI image generation capabilities powered by Google Gemini.
