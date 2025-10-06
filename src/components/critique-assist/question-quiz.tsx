'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, ArrowRight, RotateCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { addQuizAttempt } from '@/lib/firestore';
import type { GenerateQuestionsFromTextOutput } from '@/ai/flows/generate-questions-from-text';
import type { QuizAttempt } from '@/types/history';

type QuestionQuizProps = {
  questionsData: GenerateQuestionsFromTextOutput;
};

type AnswerState = {
  selected: string;
  isCorrect: boolean;
};

export function QuestionQuiz({ questionsData }: QuestionQuizProps) {
  const { questions } = questionsData;
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnsweredCurrent = answers.hasOwnProperty(currentQuestionIndex);
  
  const progressPercentage = ((currentQuestionIndex + (hasAnsweredCurrent ? 1 : 0)) / questions.length) * 100;
  const isQuizFinished = currentQuestionIndex === questions.length - 1 && hasAnsweredCurrent;
  const score = Object.values(answers).filter(a => a.isCorrect).length;

  useEffect(() => {
    if (isQuizFinished && user) {
      const newAttempt: Omit<QuizAttempt, 'id'> = {
        userId: user.uid,
        date: new Date().toISOString(),
        score,
        totalQuestions: questions.length,
      };
      addQuizAttempt(newAttempt).catch(error => {
        console.error("Failed to save quiz history to Firestore:", error);
      });
    }
  }, [isQuizFinished, score, questions.length, user]);


  const handleCheckAnswer = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQuestion.answer;
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: { selected: selectedOption, isCorrect }
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedOption(null);
  };
  

  if (isQuizFinished) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>¡Cuestionario Completo!</CardTitle>
          <CardDescription>Has respondido todas las preguntas.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-5xl font-bold text-primary">{score} / {questions.length}</p>
          <p className="text-muted-foreground mt-2">Respuestas Correctas</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRestart} className="w-full">
            <RotateCw className="mr-2 h-4 w-4" />
            Intentar de Nuevo
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pregunta {currentQuestionIndex + 1} de {questions.length}</CardTitle>
        <Progress value={progressPercentage} className="mt-2" />
        <CardDescription className="pt-4 text-lg font-semibold text-foreground">
          {currentQuestion.question}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOption || ''}
          onValueChange={setSelectedOption}
          disabled={hasAnsweredCurrent}
          className="space-y-3"
        >
          {currentQuestion.options.map((option, i) => {
            const answerState = answers[currentQuestionIndex];
            const isSelected = answerState?.selected === option;
            const isCorrectAnswer = currentQuestion.answer === option;

            let indicator = null;
            if (hasAnsweredCurrent) {
              if (isSelected && answerState.isCorrect) {
                indicator = <CheckCircle2 className="h-5 w-5 text-chart-2" />;
              } else if (isSelected && !answerState.isCorrect) {
                indicator = <XCircle className="h-5 w-5 text-destructive" />;
              } else if (isCorrectAnswer) {
                indicator = <CheckCircle2 className="h-5 w-5 text-chart-2" />;
              }
            }

            return (
              <Label
                key={i}
                htmlFor={`option-${i}`}
                className={`flex items-center gap-4 rounded-md border p-4 transition-colors ${
                  hasAnsweredCurrent && isCorrectAnswer ? 'border-chart-2 bg-chart-2/10' : ''
                } ${
                  hasAnsweredCurrent && isSelected && !isCorrectAnswer ? 'border-destructive bg-destructive/10' : ''
                } ${
                  !hasAnsweredCurrent ? 'cursor-pointer hover:bg-accent/5' : 'cursor-default'
                }`}
              >
                <RadioGroupItem value={option} id={`option-${i}`} />
                <span className="flex-1 text-base">{option}</span>
                {indicator}
              </Label>
            );
          })}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        {hasAnsweredCurrent && !answers[currentQuestionIndex].isCorrect && (
            <div className="rounded-md border border-chart-2/50 bg-chart-2/10 p-3 text-sm text-chart-2">
                <strong>Respuesta Correcta: </strong>{currentQuestion.answer}
            </div>
        )}
        {hasAnsweredCurrent ? (
           <Button onClick={handleNextQuestion} className="w-full">
            Siguiente Pregunta <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleCheckAnswer} disabled={!selectedOption} className="w-full">
            Verificar Respuesta
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
