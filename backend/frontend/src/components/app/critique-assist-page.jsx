'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AnalysisResults } from '@/components/app/analysis-results';
import { generateQuizAction } from '@/app/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CritiqueAssistPage() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fallacies, setFallacies] = useState(null);
  const [questions, setQuestions] = useState(null);
  const { toast } = useToast();

  const handleAnalyzeFallacies = async () => {
    setIsAnalyzing(true);
    setFallacies(null);
    setQuestions(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Ocurrió un error en el servidor.');
      }
      setFallacies(result.fallacies);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Análisis Fallido',
        description: error.message || 'No se pudo conectar con el servidor.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setFallacies(null);

    const result = await generateQuizAction(text);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Generación Fallida',
        description: result.error,
      });
      setQuestions(null);
    } else if (result.data) {
      setQuestions(result.data.questions);
    }

    setIsGenerating(false);
  };

  const isLoading = isAnalyzing || isGenerating;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pb-16">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Pega texto aquí para comenzar tu análisis crítico..."
              className="min-h-[200px] text-base resize-y bg-background"
              aria-label="Texto para analizar"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleAnalyzeFallacies} disabled={isLoading || !text} className="w-full sm:w-auto">
                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAnalyzing ? 'Detectando...' : 'Detectar Falacias y Sesgos'}
              </Button>
              <Button onClick={handleGenerateQuiz} disabled={isLoading || !text} className="w-full sm:w-auto" variant="secondary">
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGenerating ? 'Generando...' : 'Generar Cuestionario'}
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/repositorio-sesgos">Repositorio</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && !fallacies && !questions && (
        <div className="mt-8">
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {(fallacies !== null || questions !== null) && (
        <div className="mt-8">
          <AnalysisResults fallacies={fallacies} questions={questions} text={text} />
        </div>
      )}
    </div>
  );
}
