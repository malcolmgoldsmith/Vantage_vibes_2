import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Maximize2, Minimize2, Edit } from 'lucide-react';
import { EditAppModal } from './EditAppModal';

interface AppViewerProps {
  appId: string;
  onClose: () => void;
}

export const AppViewer: React.FC<AppViewerProps> = ({ appId, onClose }) => {
  const [app, setApp] = useState<any>(null);
  const [AppComponent, setAppComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string>('');
  const [position, setPosition] = useState({ x: 150, y: 80 });
  const [size, setSize] = useState({ width: 900, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadApp();
  }, [appId]);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;

    const rect = modalRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleEditComplete = async () => {
    // Reload the app to show changes
    await loadApp();
  };

  const loadApp = async () => {
    try {
      // Fetch app metadata
      const response = await fetch('http://localhost:3001/api/generated-apps');
      const data = await response.json();

      if (data.success) {
        const foundApp = data.apps.find((a: any) => a.id === appId);
        if (foundApp) {
          setApp(foundApp);

          // Dynamically import the component with cache busting
          try {
            const module = await import(`../../generated-apps/${foundApp.fileName}?t=${Date.now()}`);
            const ComponentName = foundApp.componentName;

            if (module[ComponentName]) {
              setAppComponent(() => module[ComponentName]);
            } else {
              setError(`Component ${ComponentName} not found in the module`);
            }
          } catch (err) {
            console.error('Error loading component:', err);
            setError(`Failed to load app component: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        } else {
          setError('App not found');
        }
      }
    } catch (err) {
      console.error('Error loading app:', err);
      setError('Failed to load app metadata');
    }
  };

  const modalStyle = isMaximized
    ? { top: 0, left: 0, width: '100%', height: '100%' }
    : {
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`
      };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 flex items-center gap-3">
        <div className="flex-1">
          <h3 className="font-medium text-sm">{app?.name || 'Loading...'}</h3>
        </div>
        <button
          onClick={toggleMinimize}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Restore"
        >
          <Maximize2 size={16} />
        </button>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-40" onClick={onClose} />

      {/* Modal Window */}
      <div
        ref={modalRef}
        className="fixed bg-white rounded-lg shadow-2xl border border-gray-300 z-50 flex flex-col overflow-hidden"
        style={modalStyle}
      >
        {/* Title Bar */}
        <div
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex-1 flex items-center gap-3">
            {app && (
              <>
                <h1 className="text-sm font-semibold">{app.name}</h1>
                <span className="text-xs text-blue-100">-</span>
                <p className="text-xs text-blue-100">{app.description}</p>
              </>
            )}
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-1.5 hover:bg-blue-700 rounded transition-colors"
              title="Edit App"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={toggleMinimize}
              className="p-1.5 hover:bg-blue-700 rounded transition-colors"
              title="Minimize"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={toggleMaximize}
              className="p-1.5 hover:bg-blue-700 rounded transition-colors"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-red-500 rounded transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* App Content */}
        <div className="flex-1 overflow-hidden bg-gray-50">
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="text-red-600 text-lg font-semibold mb-2">Error Loading App</div>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {!error && !AppComponent && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading app...</p>
            </div>
          </div>
        )}

        {!error && AppComponent && (
          <div className="w-full h-full">
            <AppComponent />
          </div>
        )}
        </div>
      </div>

      {/* Edit App Modal */}
      {app && (
        <EditAppModal
          isOpen={isEditModalOpen}
          appId={app.id}
          appName={app.name}
          onClose={() => setIsEditModalOpen(false)}
          onEditComplete={handleEditComplete}
        />
      )}
    </>
  );
};
