import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './page.jsx';

jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));

// Mock next/navigation and expose push for assertions
const nav = { push: jest.fn(), replace: jest.fn(), get: () => '/' };
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  useSearchParams: () => ({ get: () => '/' }),
}));

describe('Login page', () => {
  beforeEach(() => {
    nav.push.mockReset();
    // Mock fetch for header /api/auth/me and login
    global.fetch = jest.fn(async (url, options) => {
      if (typeof url === 'string' && url.includes('/api/auth/login')) {
        return { ok: true, json: async () => ({ user: { email: 'ana@example.com' } }) };
      }
      if (typeof url === 'string' && url.includes('/api/auth/me')) {
        return { ok: true, json: async () => ({ user: null }) };
      }
      return { ok: true, json: async () => ({}) };
    });
  });

  test('submits credentials and navigates on success', async () => {
    render(<Login />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'ana@example.com' } });
    const pwd = document.querySelector('input[type="password"]');
    fireEvent.change(pwd, { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Ses/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.any(Object)));
    expect(nav.push).toHaveBeenCalled();
  });
});
