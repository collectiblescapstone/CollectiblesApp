import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SignUpPage from '../page';
import { FlexProps } from '@chakra-ui/react';

jest.mock('../../../components/auth/RegistrationForm', () => ({
  __esModule: true,
  default: ({ type }: { type: string }) => (
    <div data-testid="registration-form">{type}</div>
  ),
}));

jest.mock('@chakra-ui/react', () => {
  return {
    __esModule: true,
    Flex: (props: FlexProps) => <div data-testid="flex">{props.children}</div>,
  };
});

describe('SignInPage', () => {
  it('renders RegistrationForm with type signin', () => {
    render(<SignUpPage />);
    const authForm = screen.getByTestId('registration-form');
    expect(authForm).toBeInTheDocument();
    expect(screen.getByTestId('flex')).toBeInTheDocument();
  });
});
