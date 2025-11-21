import { render, screen } from '@testing-library/react';
import React from 'react';
import { FallaciesDisplay } from '../fallacies-display';

describe('FallaciesDisplay (frontend)', () => {
  test('renders empty-state when no fallacies', () => {
    render(<FallaciesDisplay fallacies={[]} />);
    // Should not show the list title when empty
    expect(
      screen.queryByRole('heading', { name: /Falacias y Sesgos Detectados/i })
    ).toBeNull();
  });

  test('renders list with a detected fallacy', () => {
    const sample = [
      {
        type: 'Ad Hominem',
        passage: 'No escuches el argumento de Juan; es un criminal convicto.',
        explanation:
          'Ataca a la persona en lugar del argumento presentado.',
      },
    ];

    render(<FallaciesDisplay fallacies={sample} />);

    // Title and main item content
    expect(
      screen.getByText(/Falacias y Sesgos Detectados/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Ad Hominem')).toBeInTheDocument();
    expect(
      screen.getByText(/No escuches el argumento de Juan/i)
    ).toBeInTheDocument();
  });
});
