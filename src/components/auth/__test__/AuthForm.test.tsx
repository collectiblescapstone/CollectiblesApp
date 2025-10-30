import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Needed for the "toBeInTheDocument" matcher
import AuthForm from '../AuthForm';

// Mock Chakra UI components used in AuthForm
jest.mock('@chakra-ui/react', () => ({
  Button: (props: any) => (
    <button onClick={props.onClick}>{props.children}</button>
  ),
  Field: {
    Root: (props: any) => <div {...props} />,
    Label: (props: any) => <label {...props} />,
    RequiredIndicator: () => <span data-testid="required-indicator">*</span>,
  },
  Heading: (props: any) => <h1 data-testid="form-title" {...props} />,
  Input: ({ backgroundColor, ...props }: any) => <input {...props} />,
  VStack: ({ backgroundColor, ...props }: any) => <div {...props} />,
  Text: (props: any) => <span {...props} />,
  Link: (props: any) => <a {...props} />,
}));

jest.mock('../../ui/password-input', () => ({
  PasswordInput: ({ backgroundColor, ...props }: any) => (
    <input type="password" {...props} />
  ),
}));

// Mock useAuth and useRouter
const signInMock = jest.fn();
const signUpMock = jest.fn();
const pushMock = jest.fn();

jest.mock('../../../context/AuthProvider', () => ({
  useAuth: () => ({
    signIn: signInMock,
    signUp: signUpMock,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('AuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Sign In form', () => {
    render(<AuthForm type="signin" />);
    expect(
      screen.getByRole('heading', { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/me@example.com/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it('renders Sign Up form', () => {
    render(<AuthForm type="signup" />);
    expect(
      screen.getByRole('heading', { name: /sign up/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/me@example.com/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/don't have an account/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it('calls signIn and navigates on successful login', async () => {
    signInMock.mockResolvedValue({ success: true });
    window.alert = jest.fn();

    render(<AuthForm type="signin" />);
    fireEvent.change(screen.getByPlaceholderText(/me@example.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(window.alert).toHaveBeenCalledWith('Login successful!');
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  it('shows error alert on failed login', async () => {
    signInMock.mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });
    window.alert = jest.fn();

    render(<AuthForm type="signin" />);
    fireEvent.change(screen.getByPlaceholderText(/me@example.com/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Login failed: Invalid credentials'
      );
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it('calls signUp and navigates on successful signup', async () => {
    signUpMock.mockResolvedValue({ success: true });
    window.alert = jest.fn();

    render(<AuthForm type="signup" />);
    fireEvent.change(screen.getByPlaceholderText(/me@example.com/i), {
      target: { value: 'newuser@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'newpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith(
        'newuser@example.com',
        'newpassword'
      );
      expect(window.alert).toHaveBeenCalledWith(
        'Sign-up successful! Please check your email to confirm your account.'
      );
      expect(pushMock).toHaveBeenCalledWith('/sign-in');
    });
  });

  it('shows error alert on failed signup', async () => {
    signUpMock.mockResolvedValue({
      success: false,
      error: { message: 'Email already exists' },
    });
    window.alert = jest.fn();

    render(<AuthForm type="signup" />);
    fireEvent.change(screen.getByPlaceholderText(/me@example.com/i), {
      target: { value: 'existing@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Sign-up failed: Email already exists'
      );
      expect(pushMock).not.toHaveBeenCalled();
    });
  });
});
