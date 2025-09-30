import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionQuiz } from "./question-quiz";
import { BiasAnalysis } from "./bias-analysis";
import { HelpCircle, Microscope } from "lucide-react";

import type { GenerateQuestionsFromTextOutput } from '@/ai/flows/generate-questions-from-text';
import type { DetectBiasOutput } from '@/ai/flows/detect-bias-in-text';

type AnalysisDisplayProps = {
  questions: GenerateQuestionsFromTextOutput | null;
  biases: DetectBiasOutput | null;
  isLoading: boolean;
};

export function AnalysisDisplay({ questions, biases, isLoading }: AnalysisDisplayProps) {
  const activeTab = questions ? 'questions' : biases ? 'bias' : 'questions';

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
            <div className="text-center">
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription className="mt-2">
                    Your generated questions or bias analysis will appear here.
                </CardDescription>
            </div>
        </div>
      );
    }
    
    return (
      <Tabs defaultValue={activeTab} value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">
            <HelpCircle className="mr-2 h-4 w-4" />
            Critical Questions
          </TabsTrigger>
          <TabsTrigger value="bias">
            <Microscope className="mr-2 h-4 w-4" />
            Bias Analysis
          </TabsTrigger>
        </TabsList>
        <TabsContent value="questions">
          {questions ? (
            <QuestionQuiz questionsData={questions} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              Generate questions to see them here.
            </div>
          )}
        </TabsContent>
        <TabsContent value="bias">
          {biases ? (
            <BiasAnalysis biasData={biases} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              Run bias detection to see results here.
            </div>
          )}
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
