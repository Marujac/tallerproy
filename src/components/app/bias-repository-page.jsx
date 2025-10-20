'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import biasData from '@/lib/bias-examples.json';
import { FallacyIcon } from '@/components/icons/fallacy-icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';

export function BiasRepositoryPage() {
  const examples = biasData.examples;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pb-16">
       <div className="flex justify-center items-center mb-8 relative">
         <div className="absolute left-0">
           <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-center">Repositorio de Sesgos</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ejemplos de Falacias y Sesgos</CardTitle>
          <CardDescription>
            Explora estos ejemplos para aprender a identificar falacias lógicas y sesgos cognitivos en diferentes contextos. Haz clic en cada uno para ver una explicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {examples.map((example) => (
              <AccordionItem value={`item-${example.id}`} key={example.id}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-start md:items-center gap-4 w-full">
                    <FallacyIcon type={example.fallacy.type} className="h-8 w-8 text-primary flex-shrink-0 mt-1 md:mt-0" />
                    <div className="flex-grow">
                      <p className="font-headline font-semibold">{example.fallacy.type}</p>
                      <p className="text-sm text-muted-foreground font-normal italic">"{example.fallacy.passage}"</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pl-14 pt-2">
                  <div>
                    <h4 className="font-semibold mb-1">Explicación:</h4>
                    <p className="text-foreground/90">{example.fallacy.explanation}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Texto Original Completo:</h4>
                    <p className="text-muted-foreground italic">"{example.text}"</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
