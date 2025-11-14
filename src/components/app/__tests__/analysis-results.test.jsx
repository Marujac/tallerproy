import React from 'react';
import { render, screen } from '@testing-library/react';
import { AnalysisResults } from '../analysis-results';

describe('AnalysisResults', () => {
  test('renders FallaciesDisplay when fallacies present', () => {
    render(
      <AnalysisResults
        fallacies={[{ type: 'Ad Hominem', passage: '...', explanation: '...' }]}
        questions={null}
        text={'t'}
      />
    );
    expect(screen.getByText(/Falacias y Sesgos Detectados/i)).toBeInTheDocument();
  });

  test('renders QuestionsDisplay when questions present', () => {
    render(
      <AnalysisResults
        fallacies={null}
        questions={[{ question: 'Q', options: ['a','b','c','d'], correctAnswer: 0, explanation: 'x' }]}
        text={'t'}
      />
    );
    expect(screen.getByText(/Cuestionario de Pensamiento Crítico/i)).toBeInTheDocument();
  });
});

