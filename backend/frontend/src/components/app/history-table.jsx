'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function HistoryTable({ data }) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Fecha</TableHead>
            <TableHead>Texto Analizado</TableHead>
            <TableHead className="text-center w-[120px]">Falacias</TableHead>
            <TableHead className="text-center w-[120px]">Puntuación</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <Accordion type="single" collapsible className="w-full">
        {data.map((item) => (
          <AccordionItem value={item.id} key={item.id} className="border-b last:border-b-0">
            <AccordionTrigger asChild>
              <div className="group flex w-full items-center text-sm font-normal hover:bg-muted/50 transition-colors">
                 <div className="p-4 w-[150px] text-left">{format(new Date(item.timestamp), "d MMM yyyy, HH:mm", { locale: es })}</div>
                 <div className="p-4 grow text-left max-w-xs truncate">{item.text}</div>
                 <div className="p-4 w-[120px] text-center">{item.fallacies.length}</div>
                 <div className="p-4 w-[120px] text-center font-bold">{item.score}%</div>
                 <div className="p-4 w-[50px] text-right">
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                 </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-6 bg-muted/50 border-t">
                <h4 className="font-semibold mb-2">Texto Completo:</h4>
                <p className="mb-4 text-muted-foreground whitespace-pre-wrap">{item.text}</p>
                <h4 className="font-semibold mb-2">Falacias Encontradas:</h4>
                {item.fallacies.length > 0 ? (
                   <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    {item.fallacies.map((fallacy, index) => (
                      <li key={index}>
                        <strong>{fallacy.type}:</strong> "{fallacy.passage}" - {fallacy.explanation}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No se encontraron falacias en este análisis.</p>
                )}
                 <h4 className="font-semibold mt-4 mb-2">Cuestionario:</h4>
                 <div className="space-y-4">
                  {item.questions.map((q, i) => (
                    <div key={i} className="text-sm text-muted-foreground">
                      <p><strong>{i+1}. {q.question}</strong></p>
                      <p className="text-green-600 dark:text-green-400">Respuesta correcta: {q.options[q.correctAnswer]}</p>
                    </div>
                  ))}
                 </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
