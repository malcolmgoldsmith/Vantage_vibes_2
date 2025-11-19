import React, { useState, useEffect } from 'react';
import { X, Circle, RefreshCw, Trophy } from 'lucide-react';

type Player = 'X' | 'O';
type CellValue = Player | null;

interface WinState {
  winner: Player | 'Draw' | null;
  line: number[] | null;
}

export const EmeraldTacToe: React.FC = () => {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winState, setWinState] = useState<WinState>({ winner: null, line: null });
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Sound effects placeholders (could be expanded)
  // const playClickSound = () => { ... };

  const calculateWinner = (squares: CellValue[]): WinState => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
      [0, 4, 8], [2, 4, 6]             // Diagonal
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a] as Player, line: lines[i] };
      }
    }

    if (!squares.includes(null)) {
      return { winner: 'Draw', line: null };
    }

    return { winner: null, line: null };
  };

  const handleClick = (index: number) => {
    if (board[index] || winState.winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  useEffect(() => {
    const result = calculateWinner(board);
    if (result.winner) {
      setWinState(result);
    }
  }, [board]);

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      setBoard(Array(9).fill(null));
      setIsXNext(true);
      setWinState({ winner: null, line: null });
      setIsResetting(false);
    }, 300);
  };

  // Helper to determine cell styling based on state
  const getCellClasses = (index: number, value: CellValue) => {
    const isWinningCell = winState.line?.includes(index);
    const baseClasses = "w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center text-4xl shadow-sm border border-gray-200 transition-all duration-200";
    const hoverClasses = !value && !winState.winner ? "hover:scale-105 hover:shadow-md cursor-pointer hover:bg-gray-100" : "cursor-default";
    const winningClasses = isWinningCell ? "ring-4 ring-opacity-50 animate-pulse" : "";
    
    // Determine ring color for winning cells
    let ringColor = "";
    if (isWinningCell) {
      ringColor = value === 'X' ? "ring-emerald-400 bg-emerald-50" : "ring-amber-400 bg-amber-50";
    }

    return `${baseClasses} ${hoverClasses} ${winningClasses} ${ringColor}`;;
  };

  const getStatusMessage = () => {
    if (winState.winner === 'Draw') return "It's a Draw!";
    if (winState.winner) return `Player ${winState.winner} Wins!`;;
    return `Current Turn: Player ${isXNext ? 'X' : 'O'}`;;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-6 font-sans overflow-y-auto">
      
      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center transition-all duration-300 ease-in-out transform">
        
        {/* Header / Status Area */}
        <div className="mb-8 text-center">
          <h1 className="text-[20px] font-semibold text-gray-800 flex items-center justify-center gap-2 min-h-[32px]">
            {winState.winner && winState.winner !== 'Draw' && (
              <Trophy className={`w-5 h-5 ${winState.winner === 'X' ? 'text-emerald-500' : 'text-amber-500'} animate-bounce`} />
            )}
            <span className={`${
              winState.winner === 'X' ? 'text-emerald-600' : 
              winState.winner === 'O' ? 'text-amber-600' : 
              'text-gray-700'
            } transition-colors duration-300`}>
              {getStatusMessage()}
            </span>
          </h1>
          <div className="h-1 w-16 mx-auto mt-2 rounded-full bg-gray-200 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${isXNext ? 'bg-emerald-500 translate-x-0' : 'bg-amber-500 translate-x-full'}`}
              style={{ width: '100%', transform: isXNext ? 'translateX(-50%)' : 'translateX(50%)' }}
            />
          </div>
        </div>

        {/* Game Grid */}
        <div 
          className="grid grid-cols-3 gap-3 mb-4 p-2 bg-white rounded-2xl"
          role="grid"
          aria-label="Tic Tac Toe Board"
        >
          {board.map((value, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!!value || !!winState.winner}
              className={getCellClasses(index, value)}
              aria-label={`Square ${index}, ${value ? value : 'empty'}`}
              tabIndex={0}
            >
              {value === 'X' && (
                <X 
                  className={`w-10 h-10 text-emerald-500 transition-all duration-300 ${isResetting ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} 
                  strokeWidth={3} 
                />
              )}
              {value === 'O' && (
                <Circle 
                  className={`w-10 h-10 text-amber-500 transition-all duration-300 ${isResetting ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} 
                  strokeWidth={3} 
                />
              )}
            </button>
          ))}
        </div>

        {/* Reset Button Container */}
        <div className={`mt-6 transition-all duration-500 ease-in-out ${winState.winner ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <button
            onClick={handleReset}
            disabled={!winState.winner}
            className="group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-white transition-all duration-200 bg-gray-900 rounded-lg hover:bg-gray-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Reset Game"
          >
            <RefreshCw className={`w-4 h-4 mr-2 transition-transform duration-500 group-hover:rotate-180`} />
            <span>Reset Game</span>
          </button>
        </div>
        
        {/* Visual Decoration (subtle player indicators if needed for persistent reminder) */}
        <div className="mt-8 flex justify-between w-full px-4 text-sm font-medium text-gray-400">
          <div className="flex items-center gap-1">
            <X className="w-4 h-4" /> Player 1
          </div>
          <div className="flex items-center gap-1">
            <Circle className="w-4 h-4" /> Player 2
          </div>
        </div>
      </div>
    </div>
  );
};