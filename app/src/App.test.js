import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the form', () => {
  render(<App />);
  const linkElement = screen.getByText(/Register your business/i);
  expect(linkElement).toBeInTheDocument();
});
