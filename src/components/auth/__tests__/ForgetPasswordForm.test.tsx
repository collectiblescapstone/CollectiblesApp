import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Needed for the "toBeInTheDocument" matcher
import ForgetPasswordForm from '../ForgetPasswordForm';
import { renderWithTheme } from '../../../utils/testing-utils';
import { supabase } from '@/lib/supabase';

jest.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

describe('ForgetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Forget Password Form', () => {
    renderWithTheme(<ForgetPasswordForm />);
    expect(
      screen.getByRole('heading', { name: /forgot your password?/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/^Email$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/me@example.com/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it('calls signIn and navigates on successful login', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      error: null,
    });

    renderWithTheme(<ForgetPasswordForm />);
    fireEvent.change(screen.getByPlaceholderText(/me@example.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost:3000/reset-password' }
      );
      expect(
        screen.getByText(/if an account with that email exists/i)
      ).toBeInTheDocument();
    });
  });

  it('shows error message on any error', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      error: 'Some error',
    });
    renderWithTheme(<ForgetPasswordForm />);
    fireEvent.change(screen.getByPlaceholderText(/me@example.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost:3000/reset-password' }
      );
      expect(
        screen.getByText(/There was an error sending the password reset email/i)
      ).toBeInTheDocument();
    });
  });
});
