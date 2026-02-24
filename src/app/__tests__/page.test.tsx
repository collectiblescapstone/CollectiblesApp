import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

describe('Landing Page', () => {
  afterEach(() => {
    jest.useRealTimers();
    // restore any mocked document.getElementById
    (document.getElementById as any) = originalGetElementById;
    jest.clearAllMocks();
  });

  const originalGetElementById = document.getElementById;

  it('renders static landing content', () => {
    render(<Page />);

    expect(
      screen.getByText(/Kollec is a final year computer science capstone project/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/2026 TSH B129/i)).toBeInTheDocument();

    // Navigation buttons exist
    expect(screen.getByRole('button', { name: /About/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Features/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /FAQ/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();

    // Anchors have proper hrefs
    const signupAnchor = screen.getByLabelText('Go to Sign Up page');
    const loginAnchor = screen.getByLabelText('Go to Login page');
    expect(signupAnchor.getAttribute('href')).toBe('/sign-up');
    expect(loginAnchor.getAttribute('href')).toBe('/sign-in');
  });

  it('shows a countdown timer and updates as time advances', () => {
    // Use fake timers so we can control system time
    jest.useFakeTimers();

    // Target in page.tsx is new Date(2026, 3, 7, 10, 0, 0)
    // Start 10 seconds before target
    const start = new Date(2026, 3, 7, 9, 59, 50);
    (jest as any).setSystemTime(start);

    render(<Page />);

    // Let the interval run at least once to populate the timer values
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // After 1s, 9 seconds remaining
    expect(screen.getByText(/0:00:00:09/)).toBeInTheDocument();

    // Advance a further 3 seconds -> 6 seconds remaining
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText(/0:00:00:06/)).toBeInTheDocument();
  });

  it('shows launch message when target time is reached or passed', () => {
    jest.useFakeTimers();

    // Set time just after target
    const afterTarget = new Date(2026, 3, 7, 10, 0, 1);
    (jest as any).setSystemTime(afterTarget);

    render(<Page />);

    // Allow the interval to run and set launch state
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(
      screen.getByText(/Come see our demo at the capstone expo!/i)
    ).toBeInTheDocument();
  });

  it('handles anchor clicks by scrolling to and focusing the target element', () => {
    render(<Page />);

    const mockEl = {
      scrollIntoView: jest.fn(),
      focus: jest.fn(),
    } as unknown as HTMLElement;

    // Replace document.getElementById to return our mock element for #about
    (document.getElementById as any) = jest.fn((id: string) => {
      if (id === 'about') return mockEl;
      return null;
    });

    // Click the About button (which is inside the anchor)
    fireEvent.click(screen.getByRole('button', { name: /About/i }));

    expect((document.getElementById as any)).toHaveBeenCalledWith('about');
    expect(mockEl.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(mockEl.focus).toHaveBeenCalledWith({ preventScroll: true });
  });
});
