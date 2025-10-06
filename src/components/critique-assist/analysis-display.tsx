import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionQuiz } from "./question-quiz";
import { BiasAnalysis } from "./bias-analysis";
import { HistoryDisplay } from "./history-display";
import { HelpCircle, Microscope, History } from "lucide-react";

import type { GenerateQuestionsFromTextOutput } from '@/ai/flows/generate-questions-from-text';
import type { DetectBiasOutput } from '@/ai/flows/detect-bias-in-text';

type AnalysisDisplayProps = {
  questions: GenerateQuestionsFromTextOutput | null;
  biases: DetectBiasOutput | null;
  isLoading: boolean;
};

export function AnalysisDisplay({ questions, biases, isLoading }: AnalysisDisplayProps) {
  const [activeTab, setActiveTab] = useState('questions');

  useEffect(() => {
    if (questions) {
      setActiveTab('questions');
    } else if (biases) {
      setActiveTab('bias');
    }
  }, [questions, biases]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 mt-4 p-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }

    if (!questions && !biases) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Tabs defaultValue="history" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions">
                <HelpCircle className="mr-2 h-4 w-4" />
                Preguntas Críticas
              </TabsTrigger>
              <TabsTrigger value="bias">
                <Microscope className="mr-2 h-4 w-4" />
                Análisis de Sesgo
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="mr-2 h-4 w-4" />
                Historial
              </TabsTrigger>
            </TabsList>
            <TabsContent value="questions">
              <div className="text-center py-16 text-muted-foreground">
                Genera preguntas para verlas aquí.
              </div>
            </TabsContent>
            <TabsContent value="bias">
              <div className="text-center py-16 text-muted-foreground">
                Ejecuta la detección de sesgos para ver los resultados aquí.
              </div>
            </TabsContent>
            <TabsContent value="history">
              <HistoryDisplay />
            </TabsContent>
          </Tabs>
        </div>
      );
    }
    
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions">
            <HelpCircle className="mr-2 h-4 w-4" />
            Preguntas Críticas
          </TabsTrigger>
          <TabsTrigger value="bias">
            <Microscope className="mr-2 h-4 w-4" />
            Análisis de Sesgo
          </TabsTrigger>
           <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>
        <TabsContent value="questions">
          {questions ? (
            <QuestionQuiz questionsData={questions} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              Genera preguntas para verlas aquí.
            </div>
          )}
        </TabsContent>
        <TabsContent value="bias">
          {biases ? (
            <BiasAnalysis biasData={biases} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              Ejecuta la detección de sesgos para ver los resultados aquí.
            </div>
          )}
        </TabsContent>
        <TabsContent value="history">
          <HistoryDisplay />
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Card className="w-full min-h-[400px]">
      <CardContent className="pt-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
