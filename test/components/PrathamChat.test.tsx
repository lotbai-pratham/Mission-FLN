import { render, screen, fireEvent } from '@testing-library/react';
import PrathamChat from '@/components/PrathamChat';
import { describe, it, expect, vi } from 'vitest';

// Mock the chat action since we don't want to make real API calls in tests
vi.mock('@/app/actions/chat', () => ({
  askPratham: vi.fn().mockResolvedValue({ content: 'Mocked AI response' }),
}));

// Mock ResizeObserver for JSDOM
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

describe('PrathamChat Component', () => {
  it('renders the floating action button (FAB) by default', () => {
    render(<PrathamChat />);
    // The button has a span with "Ask Pratham!"
    expect(screen.getByText('Ask Pratham!')).toBeInTheDocument();
  });

  it('opens the chat panel when the FAB is clicked', () => {
    render(<PrathamChat />);
    const fabButton = screen.getByText('Ask Pratham!').closest('button');
    fireEvent.click(fabButton!);
    
    // Check for elements that are only in the open panel
    expect(screen.getByText(/Hi, I'm Pratham!/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask anything about FLN/i)).toBeInTheDocument();
  });

  it('allows user to type and send a message', async () => {
    render(<PrathamChat />);
    // Open chat
    fireEvent.click(screen.getByText('Ask Pratham!').closest('button')!);
    
    // Type in the input
    const input = screen.getByPlaceholderText(/Ask anything about FLN/i);
    fireEvent.change(input, { target: { value: 'What is TaRL?' } });
    
    // Submit the form
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    // User message should appear immediately
    expect(await screen.findByText('What is TaRL?')).toBeInTheDocument();
  });
});
