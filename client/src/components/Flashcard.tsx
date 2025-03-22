import { useState, useEffect } from "react";

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  toggleFlip: () => void;
}

export default function Flashcard({ front, back, isFlipped, toggleFlip }: FlashcardProps) {
  // Add this style to the component
  const style = `
    .card-flip {
      perspective: 1000px;
    }

    .card-inner {
      transition: transform 0.6s;
      transform-style: preserve-3d;
    }

    .card-inner.flipped {
      transform: rotateY(180deg);
    }

    .card-front, .card-back {
      backface-visibility: hidden;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .card-back {
      transform: rotateY(180deg);
    }
  `;

  return (
    <>
      <style>{style}</style>
      <div className="card-flip h-64 mb-4">
        <div className={`card-inner relative w-full h-full ${isFlipped ? 'flipped' : ''}`}>
          <div className="card-front bg-white rounded-lg border border-gray-200 shadow p-6 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-900">{front}</h3>
            </div>
          </div>
          <div className="card-back bg-white rounded-lg border border-gray-200 shadow p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">{back}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
