import React, { useState } from 'react';
import { QuizQuestion, QuestionType } from '../types';
import { Check, X, ArrowRight, Award, Eye } from 'lucide-react';

interface QuizProps {
  questions: QuizQuestion[];
  onExit: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // State for current question interaction
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleMultipleChoiceSelect = (index: number) => {
    if (selectedOption !== null) return; // Prevent changing
    setSelectedOption(index);
    setShowExplanation(true);
    const correct = index === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
  };

  const handleShortAnswerSubmit = () => {
    setShowExplanation(true);
    // Auto-mark as correct if it's non-empty for now, allowing user to self-verify with the key
    // Realistically, user self-grading is best here
  };

  const handleSelfGrade = (correct: boolean) => {
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      // Reset state
      setSelectedOption(null);
      setShortAnswerInput('');
      setShowExplanation(false);
      setIsCorrect(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-fade-in">
        <div className="bg-yellow-500/20 p-6 rounded-full">
            <Award className="w-16 h-16 text-yellow-400" />
        </div>
        <h2 className="text-4xl font-bold text-white">¡Cuestionario Completado!</h2>
        <p className="text-xl text-slate-300">Puntuación: {score} de {questions.length}</p>
        <div className="w-full bg-slate-700 rounded-full h-4 max-w-md overflow-hidden">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-1000"
            style={{ width: `${(score / questions.length) * 100}%` }}
          />
        </div>
        <button 
          onClick={onExit}
          className="mt-8 bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-full transition-all font-semibold"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-10">
      <div className="flex justify-between items-center mb-6 text-slate-400 text-sm font-medium">
        <span>Pregunta {currentIndex + 1} de {questions.length}</span>
        <span>Puntos: {score}</span>
      </div>

      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 mb-8">
        <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-bold px-2 py-1 rounded text-slate-900 ${currentQuestion.type === QuestionType.MULTIPLE_CHOICE ? 'bg-blue-400' : 'bg-purple-400'}`}>
                {currentQuestion.type === QuestionType.MULTIPLE_CHOICE ? 'Opción Múltiple' : 'Respuesta Corta'}
            </span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-6 leading-relaxed">
          {currentQuestion.question}
        </h3>

        {/* MULTIPLE CHOICE UI */}
        {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && currentQuestion.options && (
            <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
                let baseStyle = "w-full text-left p-4 rounded-xl border border-slate-600 transition-all text-slate-200";
                if (selectedOption === null) {
                baseStyle += " hover:bg-slate-700 hover:border-slate-500 cursor-pointer";
                } else {
                if (idx === currentQuestion.correctAnswer) {
                    baseStyle += " bg-green-900/30 border-green-500 text-green-300";
                } else if (idx === selectedOption) {
                    baseStyle += " bg-red-900/30 border-red-500 text-red-300";
                } else {
                    baseStyle += " opacity-50";
                }
                }

                return (
                <button
                    key={idx}
                    onClick={() => handleMultipleChoiceSelect(idx)}
                    disabled={selectedOption !== null}
                    className={baseStyle}
                >
                    <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {selectedOption !== null && idx === currentQuestion.correctAnswer && <Check className="w-5 h-5 text-green-400" />}
                    {selectedOption === idx && idx !== currentQuestion.correctAnswer && <X className="w-5 h-5 text-red-400" />}
                    </div>
                </button>
                );
            })}
            </div>
        )}

        {/* SHORT ANSWER UI */}
        {currentQuestion.type === QuestionType.SHORT_ANSWER && (
            <div className="space-y-4">
                {!showExplanation ? (
                    <>
                        <textarea
                            value={shortAnswerInput}
                            onChange={(e) => setShortAnswerInput(e.target.value)}
                            placeholder="Escribe tu respuesta aquí..."
                            className="w-full h-32 bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                            onClick={handleShortAnswerSubmit}
                            disabled={!shortAnswerInput.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium"
                        >
                            Verificar Respuesta
                        </button>
                    </>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                            <p className="text-sm text-slate-500 mb-1">Tu respuesta:</p>
                            <p className="text-white mb-4">{shortAnswerInput}</p>
                            <p className="text-sm text-slate-500 mb-1">Respuesta Esperada:</p>
                            <p className="text-green-400 font-medium">{currentQuestion.answerKey}</p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-4 pt-2">
                             <p className="text-slate-300 font-medium">¿Respondiste correctamente?</p>
                             <button onClick={() => handleSelfGrade(true)} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40"><Check /></button>
                             <button onClick={() => handleSelfGrade(false)} className="p-2 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/40"><X /></button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* EXPLANATION */}
        {showExplanation && (currentQuestion.type === QuestionType.MULTIPLE_CHOICE || isCorrect !== null) && (
          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600 animate-fade-in">
            <p className="text-sm text-slate-300">
              <span className="font-bold text-blue-400">Explicación:</span> {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && (
          <div className="flex justify-end">
            <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-bold transition-all"
            >
            {currentIndex === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
            <ArrowRight className="w-5 h-5" />
            </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
