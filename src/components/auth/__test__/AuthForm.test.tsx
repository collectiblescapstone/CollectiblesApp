import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Needed for the "toBeInTheDocument" matcher
import AuthForm from '../AuthForm';
import {
  ButtonProps,
  FieldLabelProps,
  FieldRootProps,
  HeadingProps,
  InputProps,
  StackProps,
  TextProps,
} from '@chakra-ui/react';
import { PasswordInputProps } from '@/components/ui/password-input';

// Mock Chakra UI components used in AuthForm
jest.mock('@chakra-ui/react', () => ({
  Button: (props: ButtonProps) => (
    <button onClick={props.onClick}>{props.children}</button>
  ),
  Field: {
    Root: (props: FieldRootProps) => <div>{props.children}</div>,
    Label: (props: FieldLabelProps) => <label>{props.children}</label>,
    RequiredIndicator: () => <span data-testid="required-indicator">*</span>,
  },
  Heading: (props: HeadingProps) => (
    <h1 data-testid="form-title">{props.children}</h1>
  ),
  Input: (props: InputProps) => (
    <input
      placeholder={props.placeholder}
      value={props.value}
      onChange={props.onChange}
    />
  ),
  VStack: (props: StackProps) => <div>{props.children}</div>,
  Text: (props: TextProps) => <span>{props.children}</span>,
}));

jest.mock('../../ui/password-input', () => ({
  PasswordInput: (props: PasswordInputProps) => (
    <input
      type="password"
      placeholder={props.placeholder}
      value={props.value}
      onChange={props.onChange}
    />
  ),
}));
const signInMock = jest.fn();
const pushMock = jest.fn();

jest.mock('../../../context/AuthProvider', () => ({
  useAuth: () => ({
    signIn: signInMock,
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
    render(<AuthForm />);
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

  it('calls signIn and navigates on successful login', async () => {
    signInMock.mockResolvedValue({ success: true });

    render(<AuthForm />);
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
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  it('shows error alert on failed login', async () => {
    signInMock.mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });

    render(<AuthForm />);
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
});
