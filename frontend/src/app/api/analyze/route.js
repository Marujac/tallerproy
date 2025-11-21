import { detectLogicalFallacies } from '@/ai/flows/detect-logical-fallacies';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Por favor, introduce al menos 50 caracteres de texto para analizar.' },
        { status: 400 }
      );
    }

    const fallaciesResult = await detectLogicalFallacies({ text });
    return NextResponse.json({ fallacies: fallaciesResult.fallacies });
  } catch (error) {
    console.error('Error detecting fallacies:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado durante el análisis. Por favor, inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}

