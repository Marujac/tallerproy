'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { QuizAttempt } from '@/types/history';

export function HistoryDisplay() {
  const [history, setHistory] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('quizHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load quiz history:", error);
    }
  }, []);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('quizHistory');
      setHistory([]);
    } catch (error) {
      console.error("Failed to clear quiz history:", error);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No hay historial de cuestionarios todavía.</p>
        <p className="text-sm text-muted-foreground">Completa un cuestionario para ver tus resultados aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center px-1">
        <h3 className="text-lg font-semibold text-foreground">Historial de Cuestionarios</h3>
        <Button variant="outline" size="sm" onClick={handleClearHistory}>
          <Trash2 className="mr-2 h-4 w-4" />
          Limpiar Historial
        </Button>
      </div>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {history.slice().reverse().map((attempt, index) => (
          <Card key={index} className="bg-card shadow-sm">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{formatDate(attempt.date)}</p>
                <p className="text-sm text-muted-foreground">
                  Puntuación: <span className="font-bold text-primary">{attempt.score} / {attempt.totalQuestions}</span>
                </p>
              </div>
              <div className="text-lg font-bold">
                {((attempt.score / attempt.totalQuestions) * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
