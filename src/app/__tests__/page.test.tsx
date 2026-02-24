import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from '../page';
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

describe('Page', () => {
  it('renders the landing page with no user logged in', () => {
    render(<Page />);

    expect(screen.getByText(/Kollec/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Features/i)).toBeInTheDocument();
  });
});
