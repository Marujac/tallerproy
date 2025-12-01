'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Clock3, Plus, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/use-session';

const timeMatcher = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export default function Horarios() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: sessionLoading } = useSession();

  const [times, setTimes] = useState([]);
  const [newTime, setNewTime] = useState('08:00');
  const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [channels, setChannels] = useState({ texts: true, reminders: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login?next=/horarios');
    }
  }, [sessionLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/schedule');
        const data = await res.json();
        if (res.status === 401) {
          router.replace('/login?next=/horarios');
          return;
        }
        if (!res.ok) throw new Error(data.error || 'No se pudieron cargar tus horarios.');

        setTimes(Array.isArray(data.times) && data.times.length ? data.times : ['08:00']);
        setTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
        setChannels({
          texts: data.channels?.texts !== false,
          reminders: data.channels?.reminders !== false,
        });
        setLastSavedAt(data.updatedAt || null);
      } catch (e) {
        setError(e.message || 'Error inesperado al obtener horarios.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, router]);

  const sortedTimes = useMemo(() => [...times].sort(), [times]);

  const addTime = () => {
    setError('');
    if (!timeMatcher.test(newTime)) {
      setError('Usa el formato HH:MM en 24 horas.');
      return;
    }
    if (times.includes(newTime)) {
      setError('Ese horario ya esta en la lista.');
      return;
    }
    setTimes((prev) => [...prev, newTime]);
  };

  const removeTime = (value) => {
    setTimes((prev) => prev.filter((time) => time !== value));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ times: sortedTimes, timezone, channels }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.replace('/login?next=/horarios');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar el horario.');

      setTimes(data.times || sortedTimes);
      setLastSavedAt(data.updatedAt || Date.now());
      toast({
        title: 'Horarios guardados',
        description: 'Usaremos estos horarios para enviarte textos y recordatorios.',
      });
    } catch (e) {
      setError(e.message || 'Error al guardar los horarios.');
    } finally {
      setSaving(false);
    }
  };

  if (sessionLoading || !user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5" />
              Horarios preferidos
            </CardTitle>
            <CardDescription>
              Define en que momentos quieres recibir los textos y recordatorios. Ajusta tu zona horaria y agrega varios horarios si lo necesitas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No se pudo completar</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Zona horaria</Label>
                    <Input
                      id="timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder="America/Bogota"
                    />
                    <p className="text-xs text-muted-foreground">
                      Usamos esta zona horaria para calcular los envios.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-time">Agregar horario (24h)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="new-time"
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                      />
                      <Button type="button" variant="secondary" onClick={addTime}>
                        <Plus className="h-4 w-4" />
                        Agregar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Puedes guardar hasta 12 horarios distintos.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Horarios configurados</Label>
                  {sortedTimes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Todavia no agregas horarios.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {sortedTimes.map((time) => (
                        <div
                          key={time}
                          className="flex items-center gap-2 rounded-full border border-border px-3 py-1"
                        >
                          <span className="font-mono text-sm">{time}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeTime(time)}
                            aria-label={`Quitar ${time}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Que quieres recibir</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="flex items-start gap-3 rounded-lg border border-border p-3">
                      <input
                        type="checkbox"
                        checked={channels.texts}
                        onChange={(e) => setChannels((prev) => ({ ...prev, texts: e.target.checked }))}
                        className="mt-1 h-4 w-4 accent-primary"
                      />
                      <div>
                        <p className="font-medium leading-none">Textos y materiales</p>
                        <p className="text-sm text-muted-foreground">Recibe los textos que necesitas revisar en los horarios elegidos.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 rounded-lg border border-border p-3">
                      <input
                        type="checkbox"
                        checked={channels.reminders}
                        onChange={(e) => setChannels((prev) => ({ ...prev, reminders: e.target.checked }))}
                        className="mt-1 h-4 w-4 accent-primary"
                      />
                      <div>
                        <p className="font-medium leading-none">Recordatorios</p>
                        <p className="text-sm text-muted-foreground">Activa avisos para no perderte ningun envio programado.</p>
                      </div>
                    </label>
                  </div>
                </div>

                {lastSavedAt && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Guardado</AlertTitle>
                    <AlertDescription>
                      Ultima vez guardado: {new Date(lastSavedAt).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button type="button" onClick={handleSave} disabled={saving || sortedTimes.length === 0}>
                    {saving ? 'Guardando...' : 'Guardar horarios'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
