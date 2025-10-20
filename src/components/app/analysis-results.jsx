import { FallaciesDisplay } from '@/components/app/fallacies-display';
import { QuestionsDisplay } from '@/components/app/questions-display';

export function AnalysisResults({ fallacies, questions, text }) {
  if (fallacies !== null) {
    return <FallaciesDisplay fallacies={fallacies} />;
  }

  if (questions !== null) {
    return <QuestionsDisplay questions={questions} text={text} fallacies={fallacies || []} />;
  }

  return null;
}
