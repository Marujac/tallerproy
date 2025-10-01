import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() })
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn()
}));

const { signInWithEmailAndPassword } = require('firebase/auth');

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  it('calls signInWithEmailAndPassword on submit', async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({});
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@email.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@email.com', 'password123');
    });
  });

  it('shows error toast on login failure', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Credenciales inválidas'));
    const toast = require('@/hooks/use-toast').useToast().toast;
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'fail@email.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        variant: 'destructive',
        title: 'Error de Inicio de Sesión',
        description: 'Credenciales inválidas',
      }));
    });
  });
});
