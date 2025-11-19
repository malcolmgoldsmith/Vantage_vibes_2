import React, { useState, useEffect, useCallback } from 'react';

// Type definitions for game state
type Player = 'X' | 'O' | null;
type WinningLine = number[] | null;

interface GameState {
  squares: Player[];
  xIsNext: boolean;
  winner: Player | 'Draw' | null;
  winningLine: WinningLine;
}

export const GlassTacToe: React.FC = () => {
  // Initial state setup
  const [gameState, setGameState] = useState<GameState>({
    squares: Array(9).fill(null),
    xIsNext: true,
    winner: null,
    winningLine: null,
  });

  // Function to calculate winner
  const calculateWinner = useCallback((squares: Player[]): { winner: Player | 'Draw' | null; line: WinningLine } => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }

    if (!squares.includes(null)) {
      return { winner: 'Draw', line: null };
    }

    return { winner: null, line: null };
  }, []);

  // Handle cell click
  const handleSquareClick = (i: number) => {
    if (gameState.squares[i] || gameState.winner) return;

    const nextSquares = [...gameState.squares];
    nextSquares[i] = gameState.xIsNext ? 'X' : 'O';

    const { winner, line } = calculateWinner(nextSquares);

    setGameState({
      squares: nextSquares,
      xIsNext: !gameState.xIsNext,
      winner: winner,
      winningLine: line,
    });
  };

  // Reset game
  const handleRestart = () => {
    setGameState({
      squares: Array(9).fill(null),
      xIsNext: true,
      winner: null,
      winningLine: null,
    });
  };

  // Render helper for status message
  const getStatusMessage = () => {
    if (gameState.winner === 'Draw') return "It's a Draw!";
    if (gameState.winner) return `Player ${gameState.winner} Wins!`;;
    return `Player ${gameState.xIsNext ? 'X' : 'O'}'s Turn`;;
  };

  // Render X Icon (Emerald)
  const renderX = () => (
    <svg 
      viewBox="0 0 24 24" 
      className="w-12 h-12 text-[#10B981] drop-shadow-sm"
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );

  // Render O Icon (Rose)
  const renderO = () => (
    <svg 
      viewBox="0 0 24 24" 
      className="w-12 h-12 text-[#F43F5E] drop-shadow-sm"
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );

  // Determine cell styling based on game state
  const getCellClasses = (i: number) => {
    const baseClasses = "w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center text-4xl shadow-sm border border-white/40 transition-all duration-200 ease-out";
    const hoverClasses = !gameState.winner && !gameState.squares[i] ? "hover:scale-105 hover:bg-white/60 hover:shadow-md cursor-pointer" : "cursor-default";
    
    let stateClasses = "bg-white/30 backdrop-blur-sm";

    // Victory State Logic
    if (gameState.winner && gameState.winner !== 'Draw') {
      if (gameState.winningLine?.includes(i)) {
        // Winning cells: Pulse and Glow
        stateClasses = "bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.6)] scale-105 z-10 ring-4 ring-[#10B981]/30 animate-pulse";
        if (gameState.winner === 'O') {
            stateClasses = "bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.6)] scale-105 z-10 ring-4 ring-[#F43F5E]/30 animate-pulse";
        }
      } else {
        // Losing cells: Dimmed
        stateClasses = "bg-white/10 opacity-40 blur-[1px] scale-95";
      }
    } else if (gameState.squares[i]) {
      // Occupied but game ongoing
      stateClasses = "bg-white/50";
    }

    return `${baseClasses} ${hoverClasses} ${stateClasses}`;;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 font-sans text-gray-800 overflow-hidden">
      
      {/* Glassmorphic Card Container */}
      <div className="relative flex flex-col items-center bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.05)] max-w-md w-full transition-all duration-500">
        
        {/* Header / Status */}
        <div className="mb-8 text-center">
          <h2 
            className={`text-[20px] font-semibold tracking-wide transition-colors duration-300 ${
              gameState.winner === 'X' ? 'text-[#10B981]' : 
              gameState.winner === 'O' ? 'text-[#F43F5E]' : 
              'text-gray-700'
            }`}
            role="status"
            aria-live="polite"
          >
            {getStatusMessage()}
          </h2>
          <div className="h-1 w-16 bg-gray-200 rounded-full mx-auto mt-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                gameState.xIsNext ? 'bg-[#10B981] translate-x-0' : 'bg-[#F43F5E] translate-x-full'
              } ${gameState.winner ? 'w-full translate-x-0 opacity-0' : 'w-1/2'}`} 
            />
          </div>
        </div>

        {/* Game Grid */}
        <div 
          className="grid grid-cols-3 gap-3 sm:gap-4 p-3 bg-white/20 rounded-2xl shadow-inner border border-white/30"
          role="grid"
          aria-label="Tic-Tac-Toe Board"
        >
          {gameState.squares.map((square, i) => (
            <button
              key={i}
              onClick={() => handleSquareClick(i)}
              disabled={!!square || !!gameState.winner}
              className={getCellClasses(i)}
              aria-label={
                square 
                  ? `Cell ${i + 1}, occupied by Player ${square}` 
                  : `Cell ${i + 1}, empty`
              }
              role="gridcell"
            >
              <span 
                className={`transform transition-all duration-300 ${
                  square ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                }`}
              >
                {square === 'X' && renderX()}
                {square === 'O' && renderO()}
              </span>
            </button>
          ))}
        </div>

        {/* Restart Button */}
        <button
          onClick={handleRestart}
          className="mt-8 px-8 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-lg active:scale-95 active:shadow-inner transition-all duration-200 border border-gray-100 group flex items-center gap-2 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          aria-label="Restart Game"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-transform group-hover:rotate-180 duration-500"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>Restart Game</span>
        </button>

      </div>

      {/* Decorative blurred elements for background depth */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#10B981]/10 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#F43F5E]/10 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
    </div>
  );
};