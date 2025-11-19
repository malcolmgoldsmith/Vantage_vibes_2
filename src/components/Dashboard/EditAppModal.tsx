import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface EditAppModalProps {
  isOpen: boolean;
  appId: string;
  appName: string;
  onClose: () => void;
  onEditComplete: () => void;
}

export const EditAppModal: React.FC<EditAppModalProps> = ({
  isOpen,
  appId,
  appName,
  onClose,
  onEditComplete
}) => {
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [plan, setPlan] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [aiProvider, setAiProvider] = useState<'claude' | 'gemini'>('claude');

  const steps = [
    'Reading current app code',
    'Analyzing requested changes',
    'Generating updated code',
    'Saving changes'
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setDescription('');
      setIsEditing(false);
      setCurrentStep(0);
      setProgress(0);
      setPlan('');
      setIsComplete(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setIsEditing(true);
    setCurrentStep(1);
    setProgress(0);

    // Simulate progress animation
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length) return prev + 1;
        return prev;
      });
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + 2;
        return prev;
      });
    }, 100);

    try {
      const response = await fetch(`${API_BASE_URL}/api/edit-app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: appId,
          editInstructions: description,
          aiProvider: aiProvider
        })
      });

      const data = await response.json();

      clearInterval(stepInterval);
      clearInterval(progressInterval);

      if (data.success) {
        setCurrentStep(4);
        setProgress(100);
        setPlan(`App Updated Successfully!\n\nChanges applied to ${appName}`);

        // Wait a moment at 100% before showing completion
        setTimeout(() => {
          setIsComplete(true);
        }, 800);
      } else {
        setPlan(`Error: ${data.error}`);
        setIsComplete(true);
      }
    } catch (error) {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setPlan(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsComplete(true);
    }
  };

  const handleClose = () => {
    if (isComplete) {
      onEditComplete();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Edit App</h2>
            <p className="text-sm text-gray-600 mt-1">Editing: {appName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isEditing ? (
            <div className="space-y-4">
              {/* AI Provider Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Provider:
                </label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the changes you want to make:
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Change the color scheme to dark mode, add a new button, fix the alignment..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={6}
                  autoFocus
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Circle with Ripple Animation */}
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative w-32 h-32">
                  {/* Ripple effects */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 opacity-20 animate-ping" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 opacity-30 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 opacity-40 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>

                  {/* Progress Circle */}
                  <svg className="w-full h-full transform -rotate-90 relative z-10">
                    <defs>
                      <linearGradient id="edit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#0891b2" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="url(#edit-gradient)"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>

                  {/* Percentage Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-teal-600">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      index + 1 === currentStep
                        ? 'bg-teal-50 border border-teal-200'
                        : index + 1 < currentStep
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        index + 1 === currentStep
                          ? 'bg-teal-500 text-white animate-pulse'
                          : index + 1 < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {index + 1 < currentStep ? '✓' : index + 1}
                    </div>
                    <span
                      className={`flex-1 ${
                        index + 1 === currentStep
                          ? 'text-teal-900 font-medium'
                          : index + 1 < currentStep
                          ? 'text-green-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {/* Plan/Result */}
              {plan && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{plan}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {!isEditing ? (
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!description.trim()}
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Apply Changes
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              {isComplete ? (
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Done
                </button>
              ) : (
                <div className="text-sm text-gray-500">Processing changes...</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
