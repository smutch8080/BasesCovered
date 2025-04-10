import React, { useState } from 'react';
import { Field } from './Field';
import { CheckCircle, XCircle, ArrowRight, Trophy } from 'lucide-react';
import { Position, Question, ScenarioAnimation } from '../../types/situational';
import { AnimationPreview } from './AnimationPreview';

interface Props {
  title: string;
  description: string;
  positions: Position[];
  questions: Question[];
  onComplete: (score: number) => void;
}

export const ScenarioPlayer: React.FC<Props> = ({
  title,
  description,
  positions,
  questions,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isScenarioComplete = isLastQuestion && selectedAnswer !== null && !showAnimation;

  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(optionIndex);
    const isCorrect = optionIndex === currentQuestion.correctOption;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAnswers([...answers, isCorrect]);

    // If there's an animation, show it before showing the explanation
    if (currentQuestion.animation) {
      setShowAnimation(true);
    } else {
      setShowExplanation(true);
    }
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(score);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowAnimation(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {showAnimation && currentQuestion.animation ? (
          <AnimationPreview
            positions={positions}
            animation={currentQuestion.animation}
            onComplete={handleAnimationComplete}
          />
        ) : (
          <Field positions={positions} isEditable={false} />
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h3>
          <div className="text-sm text-gray-600">
            Score: {score}/{questions.length}
          </div>
        </div>

        <p className="text-gray-800 mb-6">{currentQuestion.text}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`p-4 rounded-lg border text-left transition-colors ${
                selectedAnswer === null
                  ? 'hover:bg-gray-50'
                  : selectedAnswer === index
                  ? index === currentQuestion.correctOption
                    ? 'bg-green-100 border-green-500'
                    : 'bg-red-100 border-red-500'
                  : index === currentQuestion.correctOption
                  ? 'bg-green-100 border-green-500'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {selectedAnswer !== null && index === currentQuestion.correctOption && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {selectedAnswer === index && index !== currentQuestion.correctOption && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        {selectedAnswer !== null && !showAnimation && showExplanation && (
          <div className={`p-4 rounded-lg mb-6 ${
            selectedAnswer === currentQuestion.correctOption
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className="text-gray-800">{currentQuestion.explanation}</p>
          </div>
        )}

        {selectedAnswer !== null && !showAnimation && (
          <div className="flex justify-end">
            {isScenarioComplete ? (
              <button
                onClick={() => onComplete(score)}
                className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
              >
                <Trophy className="w-4 h-4" />
                Complete Scenario
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
              >
                Next Question
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};