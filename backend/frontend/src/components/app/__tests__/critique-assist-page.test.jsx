import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CritiqueAssistPage } from '../critique-assist-page';

jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));

jest.mock('@/app/actions', () => ({
  generateQuizAction: jest.fn(),
}));

const { generateQuizAction } = require('@/app/actions');

describe('CritiqueAssistPage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'fetch').mockImplementation(async (url, options) => {
      if (typeof url === 'string' && url.includes('/api/analyze')) {
        return {
          ok: true,
          json: async () => ({
            fallacies: [
              { type: 'Ad Hominem', passage: '...', explanation: '...' },
            ],
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  test('disables actions without text and enables after input', () => {
    render(<CritiqueAssistPage />);
    const analyzeBtn = screen.getByRole('button', { name: /Detectar Falacias y Sesgos/i });
    const quizBtn = screen.getByRole('button', { name: /Generar Cuestionario/i });
    expect(analyzeBtn).toBeDisabled();
    expect(quizBtn).toBeDisabled();

    const textarea = screen.getByLabelText('Texto para analizar');
    fireEvent.change(textarea, { target: { value: 'x'.repeat(80) } });
    expect(analyzeBtn).not.toBeDisabled();
    expect(quizBtn).not.toBeDisabled();
  });

  test('analyze flow shows fallacies results', async () => {
    render(<CritiqueAssistPage />);
    const textarea = screen.getByLabelText('Texto para analizar');
    fireEvent.change(textarea, { target: { value: 'x'.repeat(80) } });
    fireEvent.click(screen.getByRole('button', { name: /Detectar Falacias y Sesgos/i }));

    expect(global.fetch).toHaveBeenCalledWith('/api/analyze', expect.any(Object));

    // Title rendered by FallaciesDisplay
    expect(await screen.findByText(/Falacias y Sesgos Detectados/i)).toBeInTheDocument();
  });

  test('quiz flow shows questions', async () => {
    generateQuizAction.mockResolvedValue({ data: { questions: [
      { question: 'Q?', options: ['a','b','c','d'], correctAnswer: 0, explanation: '...' },
    ] } });

    render(<CritiqueAssistPage />);
    const textarea = screen.getByLabelText('Texto para analizar');
    fireEvent.change(textarea, { target: { value: 'x'.repeat(80) } });
    fireEvent.click(screen.getByRole('button', { name: /Generar Cuestionario/i }));

    await waitFor(() => expect(generateQuizAction).toHaveBeenCalled());
    expect(await screen.findByText(/Cuestionario de Pensamiento Crítico/i)).toBeInTheDocument();
  });
});

