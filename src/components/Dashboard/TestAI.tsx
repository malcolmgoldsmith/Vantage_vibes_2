import React, { useState } from 'react';
import { Sparkles, Bot } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export const TestAI: React.FC = () => {
  const [claudeResult, setClaudeResult] = useState<string>('');
  const [geminiResult, setGeminiResult] = useState<string>('');
  const [claudeLoading, setClaudeLoading] = useState(false);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [testPrompt, setTestPrompt] = useState('Say hello and tell me what you can do in one sentence');

  const testClaude = async () => {
    setClaudeLoading(true);
    setClaudeResult('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/test-claude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: testPrompt })
      });
      const data = await response.json();
      if (data.success) {
        setClaudeResult(data.output);
      } else {
        setClaudeResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setClaudeResult(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setClaudeLoading(false);
    }
  };

  const testGemini = async () => {
    setGeminiLoading(true);
    setGeminiResult('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/test-gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: testPrompt })
      });
      const data = await response.json();
      if (data.success) {
        setGeminiResult(data.output);
      } else {
        setGeminiResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setGeminiResult(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGeminiLoading(false);
    }
  };

  const testBoth = async () => {
    await Promise.all([testClaude(), testGemini()]);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">AI Provider Test</h1>
          </div>
          <p className="text-gray-600">Test both Claude Code and Gemini 3 API responses</p>
        </div>

        {/* Test Prompt Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Prompt
          </label>
          <textarea
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Enter a test prompt..."
          />
        </div>

        {/* Test Buttons */}
        <div className="flex gap-3">
          <button
            onClick={testClaude}
            disabled={claudeLoading || !testPrompt.trim()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {claudeLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Testing Claude...</span>
              </>
            ) : (
              <>
                <Bot size={20} />
                <span>Test Claude Code</span>
              </>
            )}
          </button>

          <button
            onClick={testGemini}
            disabled={geminiLoading || !testPrompt.trim()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {geminiLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Testing Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Test Gemini 3</span>
              </>
            )}
          </button>

          <button
            onClick={testBoth}
            disabled={claudeLoading || geminiLoading || !testPrompt.trim()}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
          >
            Test Both
          </button>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Claude Result */}
          <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center gap-2">
              <Bot className="text-white" size={20} />
              <h3 className="font-semibold text-white">Claude Code Response</h3>
            </div>
            <div className="p-4">
              {claudeLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 text-sm">Processing with Claude...</p>
                  </div>
                </div>
              ) : claudeResult ? (
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{claudeResult}</pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Bot size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Click "Test Claude Code" to see the response</p>
                </div>
              )}
            </div>
          </div>

          {/* Gemini Result */}
          <div className="bg-white rounded-xl shadow-md border-2 border-purple-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 flex items-center gap-2">
              <Sparkles className="text-white" size={20} />
              <h3 className="font-semibold text-white">Gemini 3 Response</h3>
            </div>
            <div className="p-4">
              {geminiLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 text-sm">Processing with Gemini 3...</p>
                  </div>
                </div>
              ) : geminiResult ? (
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{geminiResult}</pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Sparkles size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Click "Test Gemini 3" to see the response</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Testing Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Claude uses the local Claude Code CLI</li>
            <li>• Gemini uses the Google Gemini 3 Pro Preview API</li>
            <li>• Try different prompts to compare responses</li>
            <li>• Both providers use the same prompts for fair comparison</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
