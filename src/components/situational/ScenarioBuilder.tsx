import React, { useState } from 'react';
import { Field } from './Field';
import { Plus, Save, Trash2, Play } from 'lucide-react';
import { Position, Question, ScenarioAnimation } from '../../types/situational';
import { AnimationPreview } from './AnimationPreview';

interface Props {
  onSave: (scenario: {
    title: string;
    description: string;
    positions: Position[];
    questions: Question[];
  }) => void;
}

export const ScenarioBuilder: React.FC<Props> = ({ onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctOption: 0,
    explanation: ''
  });
  const [currentAnimation, setCurrentAnimation] = useState<ScenarioAnimation | null>(null);
  const [isPreviewingAnimation, setIsPreviewingAnimation] = useState(false);

  const handleAddQuestion = () => {
    if (!currentQuestion.text || currentQuestion.options.some(opt => !opt)) {
      return;
    }

    setQuestions([
      ...questions,
      {
        id: Math.random().toString(),
        ...currentQuestion,
        animation: currentAnimation || undefined
      }
    ]);

    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: ''
    });
    setCurrentAnimation(null);
    setIsPreviewingAnimation(false);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleAnimationRecorded = (animation: ScenarioAnimation) => {
    setCurrentAnimation(animation);
  };

  const handleSave = () => {
    if (!title || !description || positions.length === 0 || questions.length === 0) {
      return;
    }

    onSave({
      title,
      description,
      positions,
      questions
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Scenario Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="Enter scenario title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="Describe the scenario and situation"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Field Setup</h2>
        {isPreviewingAnimation && currentAnimation ? (
          <div className="space-y-4">
            <AnimationPreview
              positions={positions}
              animation={currentAnimation}
              onComplete={() => setIsPreviewingAnimation(false)}
            />
            <button
              onClick={() => setIsPreviewingAnimation(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back to Editor
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Field 
              positions={positions} 
              onPositionChange={setPositions}
              onAnimationRecorded={handleAnimationRecorded}
            />
            {currentAnimation && (
              <div className="flex items-center justify-between mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-600">
                  ✓ Movement sequence recorded ({currentAnimation.duration.toFixed(1)} seconds)
                </p>
                <button
                  onClick={() => setIsPreviewingAnimation(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Play className="w-4 h-4" />
                  Preview Movement
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
          <button
            onClick={handleAddQuestion}
            disabled={!currentQuestion.text || currentQuestion.options.some(opt => !opt)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        <div className="space-y-6">
          {/* Question Form */}
          <div className="border-b pb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion(prev => ({
                    ...prev,
                    text: e.target.value
                  }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Enter question text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Option {index + 1}
                      {index === currentQuestion.correctOption && (
                        <span className="ml-2 text-green-600">(Correct)</span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index] = e.target.value;
                          setCurrentQuestion(prev => ({
                            ...prev,
                            options: newOptions
                          }));
                        }}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => setCurrentQuestion(prev => ({
                          ...prev,
                          correctOption: index
                        }))}
                        className={`px-3 py-2 rounded-lg border ${
                          index === currentQuestion.correctOption
                            ? 'bg-green-600 text-white border-green-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Correct
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Explanation
                </label>
                <textarea
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion(prev => ({
                    ...prev,
                    explanation: e.target.value
                  }))}
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Explain why this is the correct answer"
                />
              </div>
            </div>
          </div>

          {/* Existing Questions */}
          {questions.map((question, index) => (
            <div key={question.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-800">
                    Question {index + 1}
                  </h3>
                  <p className="text-gray-600">{question.text}</p>
                </div>
                <button
                  onClick={() => handleRemoveQuestion(question.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-2 rounded ${
                      optIndex === question.correctOption
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-500">
                <span className="font-medium">Explanation:</span> {question.explanation}
              </p>

              {question.animation && (
                <div className="mt-2 text-sm text-brand-primary">
                  Includes movement sequence ({question.animation.duration.toFixed(1)}s)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!title || !description || positions.length === 0 || questions.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-lg
            hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Save Scenario
        </button>
      </div>
    </div>
  );
};