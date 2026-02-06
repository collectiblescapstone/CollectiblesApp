import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ResetPasswordPage from '../page';
import { FlexProps } from '@chakra-ui/react';

jest.mock('../../../components/auth/ResetPasswordForm', () => ({
  __esModule: true,
  default: () => <div data-testid="reset-password-form" />,
}));

jest.mock('@chakra-ui/react', () => {
  return {
    __esModule: true,
    Flex: (props: FlexProps) => <div data-testid="flex">{props.children}</div>,
  };
});

describe('ResetPasswordPage', () => {
  it('renders AuthForm with type signin', () => {
    render(<ResetPasswordPage />);
    const authForm = screen.getByTestId('reset-password-form');
    expect(authForm).toBeInTheDocument();
    expect(screen.getByTestId('flex')).toBeInTheDocument();
  });
});
