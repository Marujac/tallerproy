'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getQuizHistory, clearQuizHistory } from '@/lib/firestore';
import type { QuizAttempt } from '@/types/history';
import { Skeleton } from '../ui/skeleton';

export function HistoryDisplay() {
  const { user } = useAuth();
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsubscribe = getQuizHistory(user.uid, (attempts) => {
        setHistory(attempts);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setHistory([]);
      setLoading(false);
    }
  }, [user]);

  const handleClearHistory = async () => {
    if (user) {
      await clearQuizHistory(user.uid);
      // The onSnapshot listener will automatically update the state to an empty array
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

  if (loading) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-9 w-32" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    )
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
        <Button variant="outline" size="sm" onClick={handleClearHistory} disabled={history.length === 0}>
          <Trash2 className="mr-2 h-4 w-4" />
          Limpiar Historial
        </Button>
      </div>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {history.map((attempt) => (
          <Card key={attempt.id} className="bg-card shadow-sm">
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
