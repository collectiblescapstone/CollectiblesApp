import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import HomePage from '../page';
import { useAuth } from '@/context/AuthProvider';
import { User, Session } from '@supabase/supabase-js';
import {
  BoxProps,
  ButtonProps,
  FlexProps,
  HeadingProps,
  SpinnerProps,
} from '@chakra-ui/react';

jest.mock('@chakra-ui/react', () => {
  return {
    __esModule: true,
    Flex: (props: FlexProps) => <div>{props.children}</div>,
    Heading: (props: HeadingProps) => <h1>{props.children}</h1>,
    Button: (props: ButtonProps) => (
      <button onClick={props.onClick}>{props.children}</button>
    ),
    Box: (props: BoxProps) => <div>{props.children}</div>,
    Spinner: (props: SpinnerProps) => (
      <div data-testid="loading-spinner">Loading...</div>
    ),
  };
});

jest.mock('../../../context/AuthProvider.tsx', () => {
  return {
    __esModule: true,
    useAuth: jest.fn(),
  };
});

describe('Home Page', () => {
  it('renders the landing page with a user logged in', () => {
    const mockSignOut = jest.fn();
    jest.mocked(useAuth).mockReturnValue({
      session: {
        user: {
          email: 'test@email.com',
        } as User,
      } as Session,
      signOut: mockSignOut,
      signUp: jest.fn(),
      signIn: jest.fn(),
      loading: false,
    });
    render(<HomePage />);

    expect(
      screen.getByText(/Logged in as: test@email.com/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Sign Out/i));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('renders the spinner when loading', () => {
    jest.mocked(useAuth).mockReturnValue({
      session: {
        user: {
          email: 'test@email.com',
        } as User,
      } as Session,
      signOut: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
      loading: true,
    });
    render(<HomePage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders the spinner when no session', () => {
    jest.mocked(useAuth).mockReturnValue({
      session: null,
      signOut: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
      loading: false,
    });
    render(<HomePage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders the spinner when no session and loading', () => {
    jest.mocked(useAuth).mockReturnValue({
      session: null,
      signOut: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
      loading: true,
    });
    render(<HomePage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
