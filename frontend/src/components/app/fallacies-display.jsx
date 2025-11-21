import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FallacyIcon } from '@/components/icons/fallacy-icons';
import { CheckCircle2 } from 'lucide-react';

export function FallaciesDisplay({ fallacies }) {
  if (fallacies.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
            <div>
              <h3 className="font-headline font-semibold text-lg">¡Todo en orden!</h3>
              <p className="text-muted-foreground">Nuestro análisis no detectó falacias lógicas comunes o sesgos cognitivos en el texto proporcionado.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Falacias y Sesgos Detectados</CardTitle>
        <CardDescription>Haz clic en un elemento para ver una explicación detallada.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {fallacies.map((fallacy, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-4 w-full">
                  <FallacyIcon type={fallacy.type} className="h-6 w-6 text-primary flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="font-headline font-semibold">{fallacy.type}</p>
                    <p className="text-sm text-muted-foreground font-normal line-clamp-1 italic">"{fallacy.passage}"</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pl-14 pt-2">
                <p className="text-foreground">{fallacy.explanation}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
