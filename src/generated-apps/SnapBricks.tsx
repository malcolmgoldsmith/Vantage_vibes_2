import React, { useState } from 'react';

interface Brick {
  row: number;
  col: number;
  color: string;
}

interface GridCell {
  row: number;
  col: number;
}

export const Snapbricks: React.FC = () => {
  const GRID_SIZE = 12;
  const BRICK_COLORS = [
    { name: 'Red', value: '#EF4444' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Yellow', value: '#FACC15' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Orange', value: '#F97316' }
  ];

  const [selectedColor, setSelectedColor] = useState<string>(BRICK_COLORS[0].value);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);

  const handleCellClick = (row: number, col: number): void => {
    const existingBrickIndex = bricks.findIndex(b => b.row === row && b.col === col);
    
    if (existingBrickIndex !== -1) {
      setBricks(bricks.filter((_, index) => index !== existingBrickIndex));
    } else {
      setBricks([...bricks, { row, col, color: selectedColor }]);
    }
  };

  const handleClear = (): void => {
    setBricks([]);
  };

  const handleUndo = (): void => {
    if (bricks.length > 0) {
      setBricks(bricks.slice(0, -1));
    }
  };

  const isCellOccupied = (row: number, col: number): boolean => {
    return bricks.some(b => b.row === row && b.col === col);
  };

  const getBrickColor = (row: number, col: number): string | null => {
    const brick = bricks.find(b => b.row === row && b.col === col);
    return brick ? brick.color : null;
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">LEGO Builder</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Selected:</span>
            <div 
              className="w-8 h-8 rounded-lg shadow-sm border-2 border-white"
              style={{ backgroundColor: selectedColor }}
            ></div>
          </div>
          <button
            onClick={handleUndo}
            disabled={bricks.length === 0}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:scale-103 hover:bg-gray-50 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Undo
          </button>
          <button
            onClick={handleClear}
            disabled={bricks.length === 0}
            className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:scale-103 hover:bg-red-600 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="md:w-52 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Brick Colors</h2>
          <div className="grid grid-cols-3 md:grid-cols-2 gap-3">
            {BRICK_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-16 h-16 rounded-xl shadow-sm transition-all hover:scale-105 ${
                  selectedColor === color.value ? 'ring-4 ring-blue-400 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              ></button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-auto">
          <div className="inline-block">
            <div 
              className="grid gap-1 bg-white p-6 rounded-lg shadow-lg"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const row = Math.floor(index / GRID_SIZE);
                const col = index % GRID_SIZE;
                const brickColor = getBrickColor(row, col);
                const isHovered = hoveredCell?.row === row && hoveredCell?.col === col;

                return (
                  <div
                    key={`${row}-${col}`}
                    onClick={() => handleCellClick(row, col)}
                    onMouseEnter={() => setHoveredCell({ row, col })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className="relative w-8 h-8 md:w-10 md:h-10 cursor-pointer"
                  >
                    <div 
                      className="absolute inset-0 border border-gray-200 rounded-sm transition-all"
                      style={{
                        backgroundColor: isHovered && !brickColor ? `${selectedColor}20` : '#F3F4F6',
                        borderColor: isHovered && !brickColor ? selectedColor : '#E5E7EB'
                      }}
                    ></div>
                    
                    {brickColor && (
                      <div 
                        className="absolute inset-0 rounded-sm animate-scale-in"
                        style={{
                          background: `linear-gradient(135deg, ${brickColor} 0%, ${brickColor}dd 100%)`,
                          boxShadow: `0 2px 0 0 ${brickColor}aa, inset 0 1px 0 0 rgba(255,255,255,0.3)`
                        }}
                      >
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black bg-opacity-10"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        .hover\\:scale-103:hover {
          transform: scale(1.03);
        }
        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};