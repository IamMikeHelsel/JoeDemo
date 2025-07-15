
import React from 'react';

interface GameOverModalProps {
  winner: string | null;
  onPlayAgain: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ winner, onPlayAgain }) => {
  if (!winner) return null;

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-8 text-center max-w-sm w-full mx-4">
        <h2 className="text-4xl font-bold text-yellow-400 mb-4">Game Over</h2>
        <p className="text-xl text-slate-200 mb-8">{winner} has won the battle!</p>
        <button
          onClick={onPlayAgain}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
