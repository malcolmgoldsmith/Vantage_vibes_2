import React, { useState } from 'react';

type Player = 'X' | 'O';
type Board = (Player | null)[];

export const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | null>(null);
  const [isDraw, setIsDraw] = useState(false);

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = (currentBoard: Board): Player | null => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return currentBoard[a];
      }
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isDraw) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else if (newBoard.every((cell) => cell !== null)) {
      setIsDraw(true);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsDraw(false);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          Tic-Tac-Toe
        </h1>
        
        <div className="text-center mb-6">
          {winner ? (
            <p className="text-2xl font-semibold text-green-600">
              🎉 Player {winner} wins!
            </p>
          ) : isDraw ? (
            <p className="text-2xl font-semibold text-orange-600">
              It's a draw!
            </p>
          ) : (
            <p className="text-xl font-medium text-gray-700">
              Current Player: <span className="text-purple-600 font-bold">{currentPlayer}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className={`
                aspect-square bg-gray-50 border-2 border-gray-300 rounded-lg
                text-5xl font-bold transition-all duration-200
                hover:bg-gray-100 hover:border-purple-400
                ${cell === 'X' ? 'text-blue-600' : 'text-pink-600'}
                ${!cell && !winner && !isDraw ? 'cursor-pointer' : 'cursor-not-allowed'}
                ${cell ? 'scale-100' : 'scale-95'}
              `}
              disabled={!!cell || !!winner || isDraw}
            >
              {cell}
            </button>
          ))}
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          New Game
        </button>
      </div>
    </div>
  );
};