import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from './page.jsx';

jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));

const nav = { push: jest.fn(), replace: jest.fn() };
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  useSearchParams: () => ({ get: () => '/' }),
}));

describe('Signup page', () => {
  beforeEach(() => {
    nav.push.mockReset();
    let call = 0;
    global.fetch = jest.fn(async (url, options) => {
      // header calls
      if (typeof url === 'string' && url.includes('/api/auth/me')) {
        return { ok: true, json: async () => ({ user: null }) };
      }
      // first POST signup -> 409, second POST login -> ok
      if (typeof url === 'string' && url.includes('/api/auth/signup')) {
        return { ok: false, status: 409, json: async () => ({ error: 'dup' }) };
      }
      if (typeof url === 'string' && url.includes('/api/auth/login')) {
        return { ok: true, json: async () => ({ user: { email: 'a@b.com' } }) };
      }
      return { ok: true, json: async () => ({}) };
    });
  });

  test('fallback to login when signup duplicate', async () => {
    render(<Signup />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Ana' } });
    fireEvent.change(inputs[1], { target: { value: 'a@b.com' } });
    const pwd = document.querySelector('input[type="password"]');
    fireEvent.change(pwd, { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.any(Object)));
    expect(nav.push).toHaveBeenCalled();
  });
});
