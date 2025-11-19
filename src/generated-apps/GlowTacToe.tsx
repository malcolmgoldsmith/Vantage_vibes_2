import React, { useState, useEffect } from 'react';

type Player = 'X' | 'O' | null;
type Board = Player[];
type WinningLine = number[] | null;

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const GlowTacToe: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<WinningLine>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [orbs, setOrbs] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);

  useEffect(() => {
    const newOrbs = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 200 + 100,
      duration: Math.random() * 20 + 15,
    }));
    setOrbs(newOrbs);
  }, []);

  const checkWinner = (currentBoard: Board): WinningLine => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return combination;
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const winLine = checkWinner(newBoard);
    if (winLine) {
      setWinner(currentPlayer);
      setWinningLine(winLine);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
    setShowConfetti(false);
  };

  const isBoardFull = board.every((cell) => cell !== null);
  const isDraw = isBoardFull && !winner;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full blur-3xl opacity-20 animate-float"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: orb.id % 2 === 0 ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'linear-gradient(135deg, #ec4899, #a855f7)',
            animation: `float ${orb.duration}s ease-in-out infinite`,
          }}
        />
      ))}

      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: '50%',
                top: '50%',
                background: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#ec4899' : '#a855f7',
                animationDelay: `${Math.random() * 0.5}s`,
                '--tx': `${Math.random() * 400 - 200}px`,
                '--ty': `${Math.random() * 400 - 200}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 text-white transition-all duration-300">
            {winner ? `Player ${winner} Wins!` : isDraw ? "It's a Draw!" : `Player ${currentPlayer}'s Turn`}
          </h1>
        </div>

        <div
          className="relative backdrop-blur-lg bg-white/10 p-6 rounded-3xl shadow-2xl"
          style={{
            boxShadow: '0 8px 32px 0 rgba(139, 92, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={!!cell || !!winner || isDraw}
                className={`w-20 h-20 backdrop-blur-md bg-white/10 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center text-5xl font-bold ${
                  !cell && !winner && !isDraw ? 'hover:scale-105 hover:bg-purple-500/20 cursor-pointer' : 'cursor-default'
                } ${winningLine?.includes(index) ? 'animate-pulse bg-white/20' : ''}`}
                style={{
                  boxShadow: winningLine?.includes(index) ? '0 0 20px rgba(139, 92, 246, 0.6)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {cell && (
                  <span
                    className="animate-fade-in-scale"
                    style={{
                      background: cell === 'X' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'linear-gradient(135deg, #ec4899, #a855f7)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {cell}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={resetGame}
          className="px-8 py-3 backdrop-blur-md bg-white/10 rounded-full font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-purple-500/50"
          style={{
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
          }}
        >
          Reset Game
        </button>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(30px, -30px);
          }
          66% {
            transform: translate(-20px, 20px);
          }
        }

        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes confetti {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx, 0), var(--ty, 0)) rotate(720deg);
          }
        }

        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s ease-out;
        }

        .animate-confetti {
          animation: confetti 1.5s ease-out forwards;
        }

        .animate-float {
          animation: float var(--duration, 15s) ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};