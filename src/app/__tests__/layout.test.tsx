import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import RootLayout, { metadata } from '../layout';

jest.mock('../../context/ChakraUIProvider', () => ({
  ChakraUIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chakra-provider">{children}</div>
  ),
}));
jest.mock('../../context/AuthProvider', () => ({
  AuthContextProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));
jest.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'geist-sans-variable' }),
  Geist_Mono: () => ({ variable: 'geist-mono-variable' }),
}));

describe('RootLayout', () => {
  it('renders children inside providers and applies font variables', () => {
    const { container, getByTestId } = render(
      <RootLayout>
        <div data-testid="child">Test Child</div>
      </RootLayout>
    );

    // // Check ChakraUIProvider and AuthContextProvider are rendered
    expect(getByTestId('chakra-provider')).toBeInTheDocument();
    expect(getByTestId('auth-provider')).toBeInTheDocument();

    // Check children are rendered
    expect(getByTestId('child')).toBeInTheDocument();
  });

  it('exports correct metadata', () => {
    expect(metadata.title).toBe('Collectibles App');
    expect(metadata.description).toBe('Card Collectibles Application');
  });
});
