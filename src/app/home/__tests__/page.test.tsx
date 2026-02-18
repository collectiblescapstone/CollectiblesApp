import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import HomePage from '../page';
import { useAuth } from '@/context/AuthProvider';
import { User, Session } from '@supabase/supabase-js';
import { renderWithTheme } from '@/utils/testing-utils';

jest.mock('../../../context/AuthProvider.tsx', () => {
  return {
    __esModule: true,
    useAuth: jest.fn(),
  };
});

jest.mock('../../../components/home/PopularCards.tsx', () => {
  return {
    __esModule: true,
    default: () => <div>Popular Cards Component</div>,
  };
});

jest.mock('../../../components/home/Collection.tsx', () => {
  return {
    __esModule: true,
    default: () => <div>Collection Component</div>,
  };
});

jest.mock('../../../components/home/TradeSuggestions.tsx', () => {
  return {
    __esModule: true,
    default: () => <div>Trade Suggestions Component</div>,
  };
});

describe('Home Page', () => {
  it('renders the landing page with a user logged in', () => {
    jest.mocked(useAuth).mockReturnValue({
      session: {
        user: {
          email: 'test@email.com',
        } as User,
      } as Session,
      signOut: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
      loading: false,
    });
    renderWithTheme(<HomePage />);

    // Welcome message and stats
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/cards logged this month/i)).toBeInTheDocument();
    expect(screen.getByText(/total cards in collection/i)).toBeInTheDocument();
    expect(screen.getByText(/cards up for trade/i)).toBeInTheDocument();

    // Other components
    expect(screen.getByText(/Popular Cards Component/i)).toBeInTheDocument();
    expect(screen.getByText(/Collection Component/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Trade Suggestions Component/i)
    ).toBeInTheDocument();
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
    renderWithTheme(<HomePage />);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('renders the spinner when no session', () => {
    jest.mocked(useAuth).mockReturnValue({
      session: null,
      signOut: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
      loading: false,
    });
    renderWithTheme(<HomePage />);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('renders the spinner when no session and loading', () => {
    jest.mocked(useAuth).mockReturnValue({
      session: null,
      signOut: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
      loading: true,
    });
    renderWithTheme(<HomePage />);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });
});
