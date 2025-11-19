# Server Architecture Guide

## Overview

Vantage Vibes uses a **dual-server architecture** to support both local development with Claude Code CLI and online deployment on Vercel with Gemini AI.

## Server Versions

### `server.js` - Localhost Development Server
**Use this for**: Local development on your machine

**Features**:
- Full Claude support (Claude Code CLI + Anthropic API)
- Google Gemini 3 Pro support
- Provider selection via API endpoint
- Claude CLI fallback when API key not configured
- Runs on port 3001 (configurable via .env)

**AI Providers Available**:
- **Claude**: Uses Anthropic API (claude-3-5-sonnet-20241022) with fallback to local Claude Code CLI binary
- **Gemini**: Uses Google Gemini 3 Pro Preview API

**How to Run**:
```bash
npm run server
```

**Environment Variables Required**:
```env
# At least ONE of these is required:
ANTHROPIC_API_KEY=your_anthropic_api_key_here  # For Claude API
# OR rely on Claude Code CLI being installed locally

# Optional but recommended:
GEMINI_API_KEY=your_gemini_api_key_here

# Configuration:
PORT=3001
ALLOWED_ORIGINS=http://localhost:5174
NODE_ENV=development
```

---

### `server-online.js` - Vercel/Online Production Server
**Use this for**: Deployment to Vercel or other serverless platforms

**Features**:
- **Gemini-only mode** (Claude Code CLI cannot run in serverless environments)
- Optimized for Vercel serverless functions
- Automatic fallback: Claude requests redirect to Gemini with warning logs
- No local binary dependencies

**AI Provider Available**:
- **Gemini Only**: Uses Google Gemini 3 Pro Preview API

**How to Run Locally** (for testing):
```bash
npm run server:online
```

**Environment Variables Required**:
```env
# REQUIRED (server will throw error if missing):
GEMINI_API_KEY=your_gemini_api_key_here

# Configuration:
PORT=3001
ALLOWED_ORIGINS=https://yourdomain.vercel.app
NODE_ENV=production
```

**Vercel Deployment**:
The `vercel.json` configuration automatically uses this server for production deployments.

---

## Why Two Servers?

### Problem
Claude Code CLI is a local binary that requires:
- Local installation
- File system access
- Process spawning capabilities

These requirements are **incompatible with Vercel's serverless environment**, which:
- Has ephemeral filesystem
- Restricts process spawning
- Runs in isolated containers

### Solution
By maintaining two separate servers, we get:

1. **Full Local Development** (`server.js`):
   - Access to both Claude and Gemini providers
   - Claude CLI fallback for quick testing without API keys
   - Complete feature parity with all AI capabilities

2. **Deployable Online Version** (`server-online.js`):
   - Gemini-only ensures reliable deployment
   - No binary dependencies
   - Simplified architecture for serverless environments
   - Automatic graceful degradation (Claude requests → Gemini)

---

## Quick Start Guide

### For Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (copy `.env.example` to `.env`):
   ```bash
   cp .env.example .env
   ```

3. **Add your API keys** (at least one):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here  # Optional if Claude CLI installed
   ```

4. **Run the servers**:
   ```bash
   # Terminal 1 - Backend server (with Claude + Gemini)
   npm run server

   # Terminal 2 - Frontend dev server
   npm run dev
   ```

5. **Access the app**: Open http://localhost:5174

### For Vercel Deployment

1. **Configure Vercel environment variables**:
   - `GEMINI_API_KEY` (required)
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://yourdomain.vercel.app`

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Vercel automatically uses** `server-online.js` via the `vercel.json` configuration

---

## API Endpoint Behavior

### `/api/generate` - Generate App Code

**Localhost** (`server.js`):
```json
{
  "prompt": "Create a todo app",
  "provider": "claude"  // or "gemini"
}
```
Response: Uses the specified provider

**Online** (`server-online.js`):
```json
{
  "prompt": "Create a todo app",
  "provider": "claude"  // Request for Claude...
}
```
Response: Automatically uses Gemini instead (logs warning: `[ONLINE] Claude not supported in online version. Using Gemini instead.`)

---

## Frontend Compatibility

The React frontend UI allows selecting between Claude and Gemini providers. This works seamlessly with both server versions:

- **Localhost**: Both options work as expected
- **Online**: Claude selection automatically falls back to Gemini

No frontend code changes needed - the server handles compatibility gracefully.

---

## Logging Differences

### `server.js` logs:
```
[Server] Running on port 3001
[Server] Gemini API initialized successfully
[Server] Anthropic API initialized successfully
Generating app with provider: claude
Using Claude provider (API mode)
```

### `server-online.js` logs:
```
[ONLINE] Running on port 3001
[ONLINE] Gemini API initialized successfully - Gemini-only mode active
Generating app with provider: claude
[ONLINE] Claude not supported in online version. Using Gemini instead.
Using Gemini provider
```

Notice the `[ONLINE]` prefix for easy identification.

---

## Troubleshooting

### "Claude Code CLI failed to execute"
- **Solution**: You're running `server.js` without Claude CLI installed or Anthropic API key configured
- **Fix**: Either install Claude Code CLI or add `ANTHROPIC_API_KEY` to your `.env` file

### "GEMINI_API_KEY is required for online version"
- **Solution**: You're running `server-online.js` without Gemini API key
- **Fix**: Add `GEMINI_API_KEY` to your `.env` file or Vercel environment variables

### Port 3001 already in use
- **Solution**: Another server instance is running
- **Fix**: Run `npx kill-port 3001` or change `PORT` in `.env`

### CORS errors on Vercel
- **Solution**: Frontend origin not whitelisted
- **Fix**: Add your Vercel domain to `ALLOWED_ORIGINS` environment variable in Vercel dashboard

---

## Migration Path

If you want to add Claude API support to the online version in the future:

1. Vercel serverless functions support API calls (not CLI binaries)
2. Remove the Claude CLI fallback logic from `ClaudeProvider`
3. Make `ANTHROPIC_API_KEY` required in online version
4. Re-add the `ClaudeProvider` class to `server-online.js`
5. Update the factory function to support both providers

**Note**: This would increase costs as you'd need both Anthropic and Google API credits for production.

---

## Summary

| Feature | `server.js` (Localhost) | `server-online.js` (Vercel) |
|---------|------------------------|----------------------------|
| Claude CLI Support | ✅ Yes | ❌ No (serverless limitation) |
| Claude API Support | ✅ Yes | ❌ No (removed for simplicity) |
| Gemini API Support | ✅ Yes | ✅ Yes |
| Required API Keys | At least one (or Claude CLI) | Gemini only (required) |
| Deployment Target | Local development | Vercel/serverless |
| Provider Selection | Full choice | Gemini only |
| Fallback Behavior | CLI → API | Claude requests → Gemini |

---

## Related Documentation

- See [DEPLOYMENT.md](DEPLOYMENT.md) for full Vercel deployment guide
- See [.env.example](.env.example) for environment variable templates
- See [vercel.json](vercel.json) for deployment configuration
