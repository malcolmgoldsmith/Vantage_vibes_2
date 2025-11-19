import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface CreateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { id: 1, label: 'Creating plan', shortLabel: 'Creating plan' },
  { id: 2, label: 'Developing logic', shortLabel: 'Developing logic' },
  { id: 3, label: 'Designing screens', shortLabel: 'Designing screens' },
  { id: 4, label: 'Final touches', shortLabel: 'Final touches' }
];

export const CreateAppModal: React.FC<CreateAppModalProps> = ({ isOpen, onClose }) => {
  const [appDescription, setAppDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [plan, setPlan] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [subTask, setSubTask] = useState('');
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isImproving, setIsImproving] = useState(false);
  const [aiProvider, setAiProvider] = useState<'claude' | 'gemini'>('claude');

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setAppDescription('');
      setIsGenerating(false);
      setCurrentStep(0);
      setProgress(0);
      setPlan('');
      setIsComplete(false);
      setSubTask('');
      setElapsedTime(0);
    }
  }, [isOpen]);

  // Timer for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && !isComplete) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, isComplete, startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}min ${secs}s`;
  };

  const handleGenerate = async () => {
    if (!appDescription.trim()) return;

    setIsGenerating(true);
    setCurrentStep(1);
    setProgress(0);
    setPlan('');
    setIsComplete(false);
    setStartTime(Date.now());
    setSubTask('Analyzing requirements...');

    try {
      // More realistic progress simulation with slower, non-linear progression
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          // Slow down progress as it gets higher (more realistic)
          let increment;
          if (prev < 30) {
            increment = 0.8; // Fast at start (0-30%)
          } else if (prev < 60) {
            increment = 0.5; // Medium speed (30-60%)
          } else if (prev < 80) {
            increment = 0.3; // Slower (60-80%)
          } else if (prev < 90) {
            increment = 0.2; // Much slower (80-90%)
          } else {
            increment = 0.1; // Very slow (90-95%)
          }

          const next = prev + increment;
          if (next >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return next;
        });
      }, 200); // Update every 200ms for smooth animation

      // Step progression with sub-tasks - aligned with progress ranges
      const stepInterval = setInterval(() => {
        setProgress((currentProgress) => {
          // Update step based on progress percentage
          if (currentProgress < 25) {
            setCurrentStep(1);
            setSubTask('Analyzing requirements...');
          } else if (currentProgress < 50) {
            setCurrentStep(2);
            setSubTask('Building core functionality...');
          } else if (currentProgress < 75) {
            setCurrentStep(3);
            setSubTask('Crafting user interface...');
          } else if (currentProgress < 95) {
            setCurrentStep(4);
            setSubTask('Adding final polish...');
          }
          return currentProgress;
        });
      }, 500); // Check progress every 500ms

      const response = await fetch(`${API_BASE_URL}/api/create-app-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: appDescription,
          aiProvider: aiProvider
        })
      });

      const data = await response.json();

      clearInterval(stepInterval);
      clearInterval(progressInterval);

      if (data.success) {
        setCurrentStep(4);
        setProgress(100);
        setPlan(data.app ? `App Created: ${data.app.name}\nComponent: ${data.app.componentName}\nFile: ${data.app.fileName}` : 'App created successfully!');

        // Wait a moment at 100% before showing completion
        setTimeout(() => {
          setIsComplete(true);
        }, 800);
      } else {
        setPlan(`Error: ${data.error}`);
        setIsComplete(true);
      }
    } catch (error) {
      setPlan(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsComplete(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprovePrompt = async () => {
    if (!appDescription.trim()) return;

    setIsImproving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/improve-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: appDescription,
          aiProvider: aiProvider
        })
      });

      const data = await response.json();
      console.log('Improve prompt response:', data);

      if (data.success && data.improvedPrompt) {
        console.log('Setting improved prompt:', data.improvedPrompt);
        setAppDescription(data.improvedPrompt);
      } else {
        console.error('Failed to improve prompt:', data.error);
      }
    } catch (error) {
      console.error('Error improving prompt:', error);
    } finally {
      setIsImproving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create New App
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!isGenerating && !isComplete && (
            <div className="space-y-3">
              <p className="text-gray-600 text-xs">
                Describe your app idea and we'll help you create it. Use the enhance button to add visual design details!
              </p>
              <div className="space-y-2">
                {/* AI Provider Selector */}
                <label className="block">
                  <span className="text-xs font-medium text-gray-700 mb-1 block">AI Provider</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAiProvider('claude')}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        aiProvider === 'claude'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Claude Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiProvider('gemini')}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        aiProvider === 'gemini'
                          ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Gemini 3
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-gray-700 mb-1 block">App Description</span>
                  <textarea
                    value={appDescription}
                    onChange={(e) => setAppDescription(e.target.value)}
                    placeholder="e.g., simple calculator"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    rows={3}
                    autoFocus
                  />
                </label>
                <button
                  onClick={handleImprovePrompt}
                  disabled={!appDescription.trim() || isImproving}
                  className="w-full px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isImproving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Improving...</span>
                    </>
                  ) : (
                    <span>✨ Improve my prompt</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-4">
              {/* Zen Animation & Progress Circle */}
              <div className="flex items-start gap-4">
                {/* Wabi-style Ripple Animation */}
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24">
                    {/* Ripple circles */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 opacity-20 animate-ping" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 opacity-30 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 opacity-40 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>

                    {/* Center droplet */}
                    <div className="absolute inset-6 rounded-full bg-gradient-to-br from-teal-500 to-cyan-700 flex items-center justify-center shadow-lg">
                      <div className="w-6 h-6 rounded-full bg-white opacity-30"></div>
                    </div>

                    {/* Circular Progress Indicator */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Percentage Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-700">{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                      {appDescription.split(' ').slice(0, 15).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      {appDescription.split(' ').length > 15 && '...'}
                    </h3>
                    <p className="text-gray-500 text-xs">
                      Estimated time {formatTime(elapsedTime + 30)}
                    </p>
                  </div>

                  {/* Step List */}
                  <div className="space-y-2">
                    {steps.map((step) => {
                      const isCompleted = currentStep > step.id;
                      const isCurrent = currentStep === step.id;
                      const isPending = currentStep < step.id;

                      return (
                        <div
                          key={step.id}
                          className="flex items-start gap-2"
                        >
                          {/* Step Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {isCompleted && (
                              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                <Check size={10} className="text-white" />
                              </div>
                            )}
                            {isCurrent && (
                              <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                              </div>
                            )}
                            {isPending && (
                              <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                            )}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1">
                            <div className={`font-medium text-xs ${
                              isCompleted ? 'text-gray-400 line-through' :
                              isCurrent ? 'text-gray-900' :
                              'text-gray-400'
                            }`}>
                              {step.label}
                            </div>
                            {isCurrent && subTask && (
                              <div className="text-gray-600 text-xs mt-0.5 animate-pulse">
                                {subTask}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isComplete && plan && (
            <div className="space-y-3">
              <div className="text-center pb-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                  <Check size={24} className="text-green-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  App Plan Created!
                </h3>
                <p className="text-gray-500 text-xs line-clamp-2">
                  Your {appDescription.split(' ').slice(0, 10).join(' ')}{appDescription.split(' ').length > 10 && '...'} is ready
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700">{plan}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          {!isGenerating && !isComplete && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!appDescription.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Generate Plan
              </button>
            </>
          )}
          {isComplete && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
