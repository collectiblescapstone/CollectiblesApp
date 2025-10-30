import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import Page from '../page';
import { useAuth } from '@/context/AuthProvider';
import { User, Session } from '@supabase/supabase-js';
import { ButtonProps, FlexProps, HeadingProps } from '@chakra-ui/react';

jest.mock('@chakra-ui/react', () => {
  return {
    __esModule: true,
    Flex: (props: FlexProps) => <div>{props.children}</div>,
    Heading: (props: HeadingProps) => <h1>{props.children}</h1>,
    Button: (props: ButtonProps) => (
      <button onClick={props.onClick}>{props.children}</button>
    ),
  };
});

jest.mock('../../context/AuthProvider.tsx', () => {
  return {
    __esModule: true,
    useAuth: jest.fn(),
  };
});

describe('Page', () => {
  it('renders the landing page with no user logged in', () => {
    jest.mocked(useAuth).mockReturnValue({
      session: null,
      signOut: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
    });
    render(<Page />);

    expect(
      screen.getByText(/Welcome to Collectibles App!/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Go to Login/i)).toBeInTheDocument();
  });

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
    });
    render(<Page />);

    expect(
      screen.getByText(/Welcome to Collectibles App!/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Logged in as: test@email.com/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Sign Out/i));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
