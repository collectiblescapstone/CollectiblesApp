import { render } from '@testing-library/react';
import { ChakraUIProvider } from '@/context/ChakraUIProvider';

export const renderWithTheme = (ui: React.ReactNode) => {
  return render(ui, {
    wrapper: ChakraUIProvider,
  });
};
