import React, { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';

// Icon components for cleaner SVG handling
const XIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
};

const OIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
};

export const PopTacToe: React.FC = () => {
  // Game State
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  
  // Determine winner or draw
  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  // Handlers
  const handleClick = useCallback((i: number) => {
    if (calculateWinner(board) || board[i]) {
      return;
    }
    
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }, [board, xIsNext]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  // Status Message Logic
  let status;
  let statusColor = "text-slate-700";
  
  if (winner) {
    status = `Winner: Player ${winner}`;
    statusColor = winner === 'X' ? "text-emerald-500" : "text-violet-500";
  } else if (isDraw) {
    status = "It's a Draw!";
    statusColor = "text-slate-500";
  } else {
    status = `Player ${xIsNext ? 'X' : 'O'}'s Turn`;
    statusColor = xIsNext ? "text-emerald-500" : "text-violet-500";
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-6 overflow-hidden relative">
      {/* CSS Animation for the pop effect */}
      <style>{`
        @keyframes pop {
          0% { transform: scale(0); opacity: 0; }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop 200ms ease-out forwards;
        }
      `}</style>

      {/* Main Game Card */}
      <div className="bg-white rounded-[24px] p-8 shadow-lg w-full max-w-[400px] flex flex-col items-center gap-8 border border-slate-100">
        
        {/* Header / Status */}
        <div className={`text-2xl font-semibold transition-colors duration-300 ${statusColor}`}>
          {status}
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-3 gap-3 w-full aspect-square">
          {board.map((square, i) => (
            <button
              key={i}
              className={`
                relative flex items-center justify-center rounded-xl aspect-square
                bg-slate-100 hover:bg-slate-200 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
              `}
              onClick={() => handleClick(i)}
              disabled={!!winner || !!square}
              aria-label={`Square ${i}, ${square ? square : 'empty'}`}
            >
              {square === 'X' && (
                <div className="w-2/3 h-2/3 text-emerald-500 animate-pop">
                  <XIcon className="w-full h-full" />
                </div>
              )}
              {square === 'O' && (
                <div className="w-2/3 h-2/3 text-violet-500 animate-pop">
                  <OIcon className="w-full h-full" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* New Game Button */}
        <button
          onClick={resetGame}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-md
            transition-all duration-200 hover:scale-105 active:scale-95
            ${winner || isDraw ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-400 hover:bg-slate-500'}
          `}
        >
          <RotateCcw size={20} />
          <span>New Game</span>
        </button>

      </div>
      
      {/* Footer Credit / Hint (Optional context) */}
      <div className="mt-6 text-slate-400 text-sm font-medium">
        Local Two Player
      </div>
    </div>
  );
};