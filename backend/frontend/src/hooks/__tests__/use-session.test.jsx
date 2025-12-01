import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from '../use-session';

function TestComp() {
  const { user, loading } = useSession();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="user">{user ? user.email : ''}</div>
    </div>
  );
}

describe('useSession hook', () => {
  beforeEach(() => {
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ user: { id: 'u1', name: 'Demo', email: 'demo@demo.com' } }) }));
  });
  afterEach(() => jest.resetAllMocks());

  test('loads user and switches loading to false', async () => {
    render(<TestComp />);
    expect(screen.getByTestId('loading').textContent).toBe('true');
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user').textContent).toBe('demo@demo.com');
  });
});

