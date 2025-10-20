'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export function QuestionsDisplay({ questions, text, fallacies }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    questions.forEach((q, qIndex) => {
      if (answers[qIndex] === q.correctAnswer) {
        correctCount++;
      }
    });
    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);

    setIsSaving(true);
    const analysisData = {
      text,
      fallacies,
      questions,
      score: finalScore,
      timestamp: Date.now(),
    };

    try {
      const resp = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Error al guardar en el servidor');
      }
    } catch (error) {
      console.error('Error saving history:', error);
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: error.message || 'No se pudo guardar el historial en la base de datos.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  const getResultIcon = (questionIndex) => {
    if (!submitted) return null;
    const isCorrect = answers[questionIndex] === questions[questionIndex].correctAnswer;
    return isCorrect ? (
      <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500 ml-2" />
    );
  };
  
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cuestionario de Pensamiento Crítico</CardTitle>
        <CardDescription>Responde las siguientes preguntas para poner a prueba tu comprensión.</CardDescription>
      </CardHeader>
      <CardContent>
        {submitted && score !== null && (
          <div className="mb-8 p-4 rounded-lg bg-muted">
            <h3 className="text-lg font-bold text-center mb-2">Tu Puntaje: {score}%</h3>
            <Progress value={score} className="w-full" />
          </div>
        )}
        <div className="space-y-8">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="space-y-4">
              <div className="flex items-center">
                <p className="font-semibold text-foreground">
                  {qIndex + 1}. {q.question}
                </p>
                {getResultIcon(qIndex)}
              </div>
              <RadioGroup
                value={answers[qIndex]?.toString()}
                onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value))}
                disabled={submitted}
                className="space-y-2"
              >
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}o${oIndex}`} />
                    <Label htmlFor={`q${qIndex}o${oIndex}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              {submitted && (
                <div className="p-3 rounded-md bg-muted/50 text-sm">
                  <p><strong>Respuesta Correcta:</strong> {q.options[q.correctAnswer]}</p>
                  <p><strong>Explicación:</strong> {q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-4">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={!allAnswered || isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Revisar Respuestas
            </Button>
          ) : (
            <Button onClick={handleReset}>
              Intentar de Nuevo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
