import React, { useState, useCallback, useRef, useEffect } from 'react';

// Types for the application
type BrickColor = '#EF4444' | '#3B82F6' | '#F59E0B' | null;
type ToolType = 'paint' | 'erase';

interface GridState {
  cells: BrickColor[];
}

// Preset colors matching the requirements
const COLORS = {
  RED: '#EF4444',
  BLUE: '#3B82F6',
  YELLOW: '#F59E0B',
};

// Icons
const EraserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const RotateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Props for the memoized Cell component
interface CellProps {
  index: number;
  color: BrickColor;
  onPointerDown: (index: number, e: React.PointerEvent) => void;
  onPointerEnter: (index: number, e: React.PointerEvent) => void;
}

// Stud style for the top of the bricks
const studStyle = {
  backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 30%, rgba(0,0,0,0.05) 40%, transparent 50%)`,
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(0,0,0,0.1)',
};

// Memoized 3D Cell Component to handle the 400+ rendering nodes efficiently
const Cell = React.memo(({ index, color, onPointerDown, onPointerEnter }: CellProps) => {
  return (
    <div
      onPointerDown={(e) => onPointerDown(index, e)}
      onPointerEnter={(e) => onPointerEnter(index, e)}
      className="relative group touch-none preserve-3d"
      style={{ transformStyle: 'preserve-3d' }}
      role="button"
      aria-label={`Grid cell ${index + 1}, ${color ? color : 'empty'}`}
    >
      {/* Base Plate / Grid Floor Highlight */}
      <div className={`absolute inset-0 transition-colors duration-200 ${color ? '' : 'group-hover:bg-blue-500/20'} border border-gray-200/10 rounded-sm`} />

      {/* The 3D Brick */}
      {color && (
        <div 
          className="absolute inset-0 w-full h-full animate-in"
          style={{ 
            transformStyle: 'preserve-3d',
            // Initial state for animation
            animation: 'dropIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          }}
        >
          {/* Top Face */}
          <div 
            className="absolute inset-0 rounded-sm border-t border-white/20"
            style={{ 
              backgroundColor: color,
              transform: 'translateZ(12px)',
              ...studStyle
            }}
          />
          
          {/* South Face (Front) */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[12px] origin-bottom"
            style={{ 
              backgroundColor: color,
              filter: 'brightness(0.7)',
              transform: 'rotateX(-90deg) translateY(12px) translateZ(0)',
            }}
          />
          
          {/* East Face (Right) */}
          <div 
            className="absolute top-0 right-0 bottom-0 w-[12px] origin-right"
            style={{ 
              backgroundColor: color,
              filter: 'brightness(0.85)',
              transform: 'rotateY(90deg) translateX(12px) translateZ(0)',
            }}
          />

          {/* West Face (Left) - for rotation support */}
          <div 
            className="absolute top-0 left-0 bottom-0 w-[12px] origin-left"
            style={{ 
              backgroundColor: color,
              filter: 'brightness(0.85)',
              transform: 'rotateY(-90deg) translateX(-12px) translateZ(0)',
            }}
          />

          {/* North Face (Back) - for rotation support */}
          <div 
            className="absolute top-0 left-0 right-0 h-[12px] origin-top"
            style={{ 
              backgroundColor: color,
              filter: 'brightness(0.7)',
              transform: 'rotateX(90deg) translateY(-12px) translateZ(0)',
            }}
          />
        </div>
      )}
    </div>
  );
});

Cell.displayName = 'Cell';

export const SnapBricks: React.FC = () => {
  // Grid configuration
  const GRID_SIZE = 20;
  const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

  // State
  const [grid, setGrid] = useState<BrickColor[]>(Array(TOTAL_CELLS).fill(null));
  const [selectedColor, setSelectedColor] = useState<string>(COLORS.RED);
  const [currentTool, setCurrentTool] = useState<ToolType>('paint');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewRotation, setViewRotation] = useState<number>(45);
  
  const gridRef = useRef<HTMLDivElement>(null);

  // Handlers
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setCurrentTool('paint');
  };

  const handleEraseTool = () => {
    setCurrentTool('erase');
  };

  const handleClearBoard = () => {
    if (window.confirm('Clear the entire board?')) {
      setGrid(Array(TOTAL_CELLS).fill(null));
    }
  };

  const handleRotateView = () => {
    setViewRotation(prev => (prev + 90) % 360);
  };

  const updateCell = useCallback((index: number) => {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      const newValue = currentTool === 'erase' ? null : (selectedColor as BrickColor);
      
      if (newGrid[index] !== newValue) {
        newGrid[index] = newValue;
        return newGrid;
      }
      return prevGrid;
    });
  }, [currentTool, selectedColor]);

  // Interaction Handlers
  const handlePointerDown = useCallback((index: number, e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateCell(index);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [updateCell]);

  const handlePointerEnter = useCallback((index: number, e: React.PointerEvent) => {
    if (isDragging) {
      updateCell(index);
    }
  }, [isDragging, updateCell]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  useEffect(() => {
    const handleGlobalUp = () => setIsDragging(false);
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 font-sans select-none overflow-hidden relative">
      {/* Header */}
      <header className="flex-none p-6 pb-2 text-center z-10 pointer-events-none">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight pointer-events-auto">
          Snap<span className="text-blue-600">Bricks</span> 3D
        </h1>
        <p className="text-gray-500 text-sm mt-2 font-medium pointer-events-auto">Tap to build • Drag to paint</p>
      </header>

      {/* Main 3D Viewport Area */}
      <main className="flex-1 flex items-center justify-center overflow-hidden w-full relative perspective-container">
        {/* The 3D Scene Container */}
        <div 
          className="relative w-full max-w-3xl aspect-square flex items-center justify-center transition-transform duration-500 ease-out"
          style={{ 
            perspective: '1200px',
            transform: 'scale(0.85) translateY(-5%)' // Scale down slightly to fit rotation
          }}
        >
          {/* The Rotatable Board Plane */}
          <div 
            ref={gridRef}
            className="relative transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: `rotateX(54deg) rotateZ(${viewRotation}deg)`,
              width: '600px',
              height: '600px',
            }}
          >
            {/* Board Base/Shadow */}
            <div 
              className="absolute inset-0 bg-white/40 rounded-lg shadow-2xl backdrop-blur-sm"
              style={{ 
                transform: 'translateZ(-20px)',
                boxShadow: '0 40px 60px -10px rgba(0,0,0,0.3), 0 20px 20px -10px rgba(0,0,0,0.1)' 
              }} 
            />
            
            {/* The Grid Surface */}
            <div 
              className="absolute inset-0 bg-white/90 rounded-lg border-4 border-white shadow-inner"
              style={{ 
                transformStyle: 'preserve-3d',
                // Create the base grid pattern
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                `,
                backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`
              }}
            >
              {/* Grid Cells Container */}
              <div 
                className="w-full h-full grid"
                style={{ 
                  transformStyle: 'preserve-3d',
                  gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
                }}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {grid.map((color, index) => (
                  <Cell
                    key={index}
                    index={index}
                    color={color}
                    onPointerDown={handlePointerDown}
                    onPointerEnter={handlePointerEnter}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Control Bar */}
      <footer className="flex-none p-6 pt-2 z-20 flex justify-center w-full mb-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 px-6 py-4 flex items-center gap-4 sm:gap-8 max-w-full overflow-x-auto no-scrollbar">
          
          {/* Color Swatches */}
          <div className="flex items-center gap-3 sm:gap-4 border-r border-gray-200 pr-4 sm:pr-8">
            {Object.entries(COLORS).map(([name, hex]) => (
              <button
                key={name}
                onClick={() => handleColorSelect(hex)}
                className={`
                  group relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                  transition-all duration-200 ease-out
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                  ${selectedColor === hex && currentTool === 'paint' 
                    ? 'scale-110 shadow-lg ring-2 ring-offset-2 ring-gray-400' 
                    : 'hover:scale-105 hover:shadow-md'}
                `}
                aria-label={`Select ${name} color`}
                title={name}
              >
                {/* Color Fill with 3D effect */}
                <div 
                  className="w-full h-full rounded-full border border-black/5 shadow-inner"
                  style={{ 
                    backgroundColor: hex,
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                
                {/* Active Indicator Dot */}
                {selectedColor === hex && currentTool === 'paint' && (
                  <div className="absolute -bottom-2 w-1.5 h-1.5 bg-gray-800 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tools */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Eraser Tool */}
            <button
              onClick={handleEraseTool}
              className={`
                flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                ${currentTool === 'erase'
                  ? 'bg-gray-800 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow'}
              `}
              aria-label="Eraser tool"
              title="Erase"
            >
              <EraserIcon />
            </button>

            {/* Rotate View */}
            <button
              onClick={handleRotateView}
              className="
                flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl
                bg-blue-50 text-blue-600 border border-blue-100
                hover:bg-blue-100 hover:shadow transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                active:scale-95
              "
              aria-label="Rotate board"
              title="Rotate View"
            >
              <RotateIcon />
            </button>

            {/* Clear Tool */}
            <button
              onClick={handleClearBoard}
              className="
                flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl
                bg-red-50 text-red-600 border border-red-100
                hover:bg-red-100 hover:shadow transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                active:scale-95
              "
              aria-label="Clear board"
              title="Clear All"
            >
              <ClearIcon />
            </button>
          </div>

        </div>
      </footer>

      {/* Animation Styles */}
      <style>{`
        @keyframes dropIn {
          from { 
            transform: translateZ(40px); 
            opacity: 0; 
          }
          to { 
            transform: translateZ(0); 
            opacity: 1; 
          }
        }
        .animate-in {
          animation: dropIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        /* Helps with 3D rendering artifacts in some browsers */
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};