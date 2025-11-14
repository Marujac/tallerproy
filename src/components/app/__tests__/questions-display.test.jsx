import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuestionsDisplay } from '../questions-display';

// Mock UI radio group to simplify interactions
jest.mock('@/components/ui/radio-group', () => {
  const React = require('react');
  const Ctx = React.createContext(() => {});
  const RadioGroup = ({ onValueChange, children, ...props }) => (
    React.createElement(Ctx.Provider, { value: onValueChange },
      React.createElement('div', props, children)
    )
  );
  const RadioGroupItem = ({ id, value }) => {
    const change = React.useContext(Ctx);
    return React.createElement('button', { id, type: 'button', onClick: () => change && change(value) });
  };
  return { __esModule: true, RadioGroup, RadioGroupItem };
});

jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));

describe('QuestionsDisplay', () => {
  const questions = [
    {
      question: 'Q1',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 1,
      explanation: 'Because',
    },
    {
      question: 'Q2',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 2,
      explanation: 'Because',
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: async () => ({ id: '1' }) }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('enables submit after all answers and saves history; shows score', async () => {
    render(<QuestionsDisplay questions={questions} text="t" fallacies={[]} />);

    const submit = screen.getByRole('button', { name: /Revisar Respuestas/i });
    expect(submit).toBeDisabled();

    // Select answers using mocked radio items by id
    fireEvent.click(document.getElementById('q0o1'));
    fireEvent.click(document.getElementById('q1o2'));

    expect(submit).not.toBeDisabled();

    fireEvent.click(submit);

    await screen.findByText(/Tu Puntaje: 100%/i);

    expect(global.fetch).toHaveBeenCalledWith('/api/history', expect.objectContaining({ method: 'POST' }));

    // Validate score saved
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.score).toBe(100);
  });
});
