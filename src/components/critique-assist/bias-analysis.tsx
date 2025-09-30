import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { DetectBiasOutput } from '@/ai/flows/detect-bias-in-text';

type BiasAnalysisProps = {
  biasData: DetectBiasOutput;
};

export function BiasAnalysis({ biasData }: BiasAnalysisProps) {
  if (!biasData || biasData.biasedPassages.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No potential biases or fallacies were detected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground px-1">Potential Bias & Fallacy Analysis</h3>
      {biasData.biasedPassages.map((item, index) => (
        <Card key={index} className="bg-card shadow">
          <CardContent className="p-4">
            <blockquote className="border-l-4 border-accent pl-4 italic text-muted-foreground">
              "{item.passage}"
            </blockquote>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Badge variant="outline" className="flex items-center gap-2 bg-background text-foreground">
              <AlertTriangle className="h-4 w-4 text-accent" />
              {item.biasCategory}
            </Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
