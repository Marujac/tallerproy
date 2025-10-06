'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateQuestions, handleDetectBias } from '@/app/actions';
import type {
  GenerateQuestionsFromTextOutput,
} from '@/ai/flows/generate-questions-from-text';
import type {
  DetectBiasOutput,
} from '@/ai/flows/detect-bias-in-text';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Wand2 } from 'lucide-react';
import { AnalysisDisplay } from '@/components/critique-assist/analysis-display';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<GenerateQuestionsFromTextOutput | null>(null);
  const [biases, setBiases] = useState<DetectBiasOutput | null>(null);
  const [isLoading, setIsLoading] = useState<'questions' | 'bias' | null>(null);
  const { toast } = useToast();

  const onGenerateQuestions = async () => {
    setIsLoading('questions');
    setQuestions(null);
    setBiases(null);
    try {
      const result = await handleGenerateQuestions({ text, numQuestions: 5 });
      setQuestions(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al Generar Preguntas',
        description: error instanceof Error ? error.message : 'Ocurrió un error desconocido.',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const onDetectBias = async () => {
    setIsLoading('bias');
    setQuestions(null);
    setBiases(null);
    try {
      const result = await handleDetectBias({ text });
      setBiases(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al Detectar Sesgo',
        description: error instanceof Error ? error.message : 'Ocurrió un error desconocido.',
      });
    } finally {
      setIsLoading(null);
    }
  };

  if (authLoading || !user) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card className="w-full">
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="min-h-[300px] w-full" />
                        <div className="flex gap-4 mt-4">
                            <Skeleton className="h-10 w-48" />
                            <Skeleton className="h-10 w-48" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="w-full min-h-[400px]">
                     <CardContent className="pt-6">
                        <div className="space-y-4 mt-4 p-4">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                     </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Tutor de Lectura Crítica</CardTitle>
              <CardDescription>Pega tu texto a continuación para comenzar.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ingresa o pega tu texto aquí..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[300px] text-base"
                aria-label="Text Input"
              />
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button onClick={onGenerateQuestions} disabled={!text || !!isLoading} className="w-full sm:w-auto">
                  {isLoading === 'questions' ? (
                    <span className="flex items-center"><Wand2 className="mr-2 h-4 w-4 animate-spin" />Generando...</span>
                  ) : (
                    <span className="flex items-center"><Wand2 className="mr-2 h-4 w-4" />Generar Preguntas</span>
                  )}
                </Button>
                <Button onClick={onDetectBias} disabled={!text || !!isLoading} variant="secondary" className="w-full sm:w-auto">
                  {isLoading === 'bias' ? (
                    <span className="flex items-center"><Wand2 className="mr-2 h-4 w-4 animate-spin" />Analizando...</span>
                  ) : (
                    <span className="flex items-center"><Wand2 className="mr-2 h-4 w-4" />Detectar Sesgo</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <AnalysisDisplay
          questions={questions}
          biases={biases}
          isLoading={!!isLoading}
        />
      </div>
    </div>
  );
}
