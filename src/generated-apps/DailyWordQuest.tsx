import React, { useState, useEffect } from 'react';

interface Word {
  word: string;
  definition: string;
  options: string[];
  correctAnswer: string;
}

const wordDatabase: Word[] = [
  {
    word: 'Ephemeral',
    definition: 'Lasting for a very short time',
    options: ['Eternal', 'Temporary', 'Ancient', 'Modern'],
    correctAnswer: 'Temporary'
  },
  {
    word: 'Ubiquitous',
    definition: 'Present, appearing, or found everywhere',
    options: ['Rare', 'Common', 'Hidden', 'Mysterious'],
    correctAnswer: 'Common'
  },
  {
    word: 'Serendipity',
    definition: 'The occurrence of events by chance in a happy way',
    options: ['Misfortune', 'Planning', 'Lucky accident', 'Disaster'],
    correctAnswer: 'Lucky accident'
  },
  {
    word: 'Ineffable',
    definition: 'Too great or extreme to be expressed in words',
    options: ['Describable', 'Indescribable', 'Simple', 'Clear'],
    correctAnswer: 'Indescribable'
  },
  {
    word: 'Mellifluous',
    definition: 'Sweet or musical; pleasant to hear',
    options: ['Harsh', 'Smooth-sounding', 'Quiet', 'Loud'],
    correctAnswer: 'Smooth-sounding'
  }
];

export const DailyWordQuest: React.FC = () => {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  useEffect(() => {
    if (gameStarted && !currentWord) {
      loadNewWord();
    }
  }, [gameStarted]);

  const loadNewWord = (): void => {
    const randomIndex = Math.floor(Math.random() * wordDatabase.length);
    setCurrentWord(wordDatabase[randomIndex]);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answer: string): void => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = (): void => {
    if (!selectedAnswer || !currentWord) return;
    setShowResult(true);
    setAttempts(attempts + 1);
    if (selectedAnswer === currentWord.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = (): void => {
    loadNewWord();
  };

  const handleStart = (): void => {
    setGameStarted(true);
    setScore(0);
    setAttempts(0);
  };

  const handleRestart = (): void => {
    setScore(0);
    setAttempts(0);
    setCurrentWord(null);
    setGameStarted(false);
  };

  if (!gameStarted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-4xl font-bold text-purple-900">Word of the Day Quest</h1>
          <p className="text-lg text-gray-700">Test your vocabulary knowledge! Match words with their correct definitions.</p>
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const isCorrect = selectedAnswer === currentWord.correctAnswer;
  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  return (
    <div className="w-full h-full flex flex-col p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow">
            <span className="text-sm text-gray-600">Score: </span>
            <span className="font-bold text-purple-600">{score}/{attempts}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow">
            <span className="text-sm text-gray-600">Accuracy: </span>
            <span className="font-bold text-blue-600">{accuracy}%</span>
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
        >
          Restart
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-purple-900">{currentWord.word}</h2>
            <p className="text-lg text-gray-600 italic">{currentWord.definition}</p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-700">Choose the best match:</p>
            {currentWord.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentWord.correctAnswer;
              let buttonClass = 'w-full p-4 text-left rounded-lg border-2 transition-all ';
              
              if (showResult) {
                if (isCorrectAnswer) {
                  buttonClass += 'border-green-500 bg-green-50 text-green-900';
                } else if (isSelected && !isCorrectAnswer) {
                  buttonClass += 'border-red-500 bg-red-50 text-red-900';
                } else {
                  buttonClass += 'border-gray-200 bg-gray-50 text-gray-500';
                }
              } else {
                buttonClass += isSelected
                  ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-md'
                  : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <span className="font-medium">{option}</span>
                  {showResult && isCorrectAnswer && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                  {showResult && isSelected && !isCorrectAnswer && (
                    <span className="ml-2 text-red-600">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
              <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? '🎉 Correct!' : '❌ Incorrect!'}
              </p>
              {!isCorrect && (
                <p className="text-sm text-gray-700 mt-1">
                  The correct answer is: <span className="font-bold">{currentWord.correctAnswer}</span>
                </p>
              )}
            </div>
          )}

          <div className="flex justify-center pt-4">
            {!showResult ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  selectedAnswer
                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Next Word →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};