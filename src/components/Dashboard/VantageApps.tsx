import React, { useState, useEffect } from 'react';
import { Plus, Search, TestTube2 } from 'lucide-react';
import { AppCard } from './AppCard';
import { CreateAppModal } from './CreateAppModal';
import { AppViewer } from './AppViewer';
import { TestAI } from './TestAI';

interface GeneratedApp {
  id: string;
  name: string;
  componentName: string;
  fileName: string;
  createdAt: string;
  description: string;
}

export const VantageApps: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedApps, setGeneratedApps] = useState<GeneratedApp[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [showTestAI, setShowTestAI] = useState(false);

  // Load generated apps on mount
  useEffect(() => {
    loadGeneratedApps();
  }, []);

  const loadGeneratedApps = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/generated-apps');
      const data = await response.json();
      if (data.success) {
        setGeneratedApps(data.apps || []);
      }
    } catch (error) {
      console.error('Failed to load generated apps:', error);
    }
  };

  const handleAppCreated = () => {
    // Reload apps when a new one is created
    loadGeneratedApps();
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this app? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/generated-apps/${appId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        // Reload the apps list
        loadGeneratedApps();

        // If the deleted app was currently selected, close the viewer
        if (selectedAppId === appId) {
          setSelectedAppId(null);
        }
      } else {
        alert(`Failed to delete app: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting app:', error);
      alert('Failed to delete app. Please try again.');
    }
  };

  const testClaudeIntegration = async () => {
    setIsLoading(true);
    setTestResult('Sending request to Claude...');

    try {
      const response = await fetch('http://localhost:3001/api/test-claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Say hello and tell me what you can do in one sentence'
        })
      });

      const data = await response.json();

      if (data.success) {
        setTestResult(`✅ Success! Claude responded:\n${data.output}`);
      } else {
        setTestResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  // Show Test AI page if enabled
  if (showTestAI) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowTestAI(false)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Apps
        </button>
        <TestAI />
      </div>
    );
  }

  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Vantage Apps</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTestAI(true)}
            className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-colors shadow-md"
          >
            <TestTube2 size={16} className="mr-2" />
            Test AI Providers
          </button>
          <button
            onClick={testClaudeIntegration}
            disabled={isLoading}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Testing...' : 'Test Claude'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Create New App
          </button>
        </div>
      </div>
      {testResult && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <pre className="text-xs whitespace-pre-wrap font-mono">{testResult}</pre>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center mb-4">
          <h3 className="font-medium text-base mr-4">Explore Apps</h3>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input type="text" className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 p-2" placeholder="Search apps..." />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Generated Apps */}
          {generatedApps.map((app) => (
            <AppCard
              key={app.id}
              name={app.name}
              description={app.description}
              icon="/pasted-image.png"
              color="#3B82F6"
              onClick={() => setSelectedAppId(app.id)}
              onDelete={() => handleDeleteApp(app.id)}
            />
          ))}

          {generatedApps.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-500">
              <p className="text-lg">No apps yet. Click "Create New App" to get started!</p>
            </div>
          )}
        </div>
      </div>

      <CreateAppModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          handleAppCreated();
        }}
      />

      {selectedAppId && (
        <AppViewer
          appId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
        />
      )}
    </div>;
};