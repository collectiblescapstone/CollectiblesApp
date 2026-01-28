import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SignInPage from '../page';
import { FlexProps } from '@chakra-ui/react';

jest.mock('../../../components/auth/AuthForm', () => ({
  __esModule: true,
  default: ({ type }: { type: string }) => (
    <div data-testid="auth-form">{type}</div>
  ),
}));

jest.mock('@chakra-ui/react', () => {
  return {
    __esModule: true,
    Flex: (props: FlexProps) => <div data-testid="flex">{props.children}</div>,
  };
});

describe('SignInPage', () => {
  it('renders AuthForm with type signin', () => {
    render(<SignInPage />);
    const authForm = screen.getByTestId('auth-form');
    expect(authForm).toBeInTheDocument();
    expect(screen.getByTestId('flex')).toBeInTheDocument();
  });
});
