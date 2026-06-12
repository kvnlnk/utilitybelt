// ---------------------------------------------------------------------------
// Component tests: ToolLayout — input, processing, error/empty states
// ---------------------------------------------------------------------------
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolLayout } from '@/components/tool-layout';

// Mock next/link (used by Button -> shadcn -> Sheet dependency)
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    <a href={href}>{children}</a>,
}));

describe('ToolLayout', () => {
  const mockProcess = vi.fn();

  it('renders title and description', () => {
    mockProcess.mockReturnValue({ output: '' });
    render(
      <ToolLayout
        title="JSON Formatter"
        description="Pretty-print your JSON"
        process={mockProcess}
      />,
    );
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
    expect(screen.getByText('Pretty-print your JSON')).toBeInTheDocument();
  });

  it('renders input label and textarea', () => {
    mockProcess.mockReturnValue({ output: '' });
    render(
      <ToolLayout
        title="Test"
        description="Test tool"
        inputLabel="Your Input"
        process={mockProcess}
      />,
    );
    expect(screen.getByText('Your Input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your input here…')).toBeInTheDocument();
  });

  it('calls process with input on button click', () => {
    mockProcess.mockReturnValue({ output: '{"ok":true}' });
    render(
      <ToolLayout
        title="Test"
        description="Test tool"
        process={mockProcess}
      />,
    );

    const textarea = screen.getByPlaceholderText('Enter your input here…');
    fireEvent.change(textarea, { target: { value: '{"ok":true}' } });

    const button = screen.getByText('Process');
    fireEvent.click(button);

    expect(mockProcess).toHaveBeenCalledWith('{"ok":true}');
  });

  it('displays output after processing', () => {
    mockProcess.mockReturnValue({ output: '{"result":"success"}' });
    render(
      <ToolLayout
        title="Test"
        description="Test tool"
        process={mockProcess}
      />,
    );

    const textarea = screen.getByPlaceholderText('Enter your input here…');
    fireEvent.change(textarea, { target: { value: 'input' } });
    fireEvent.click(screen.getByText('Process'));

    // Output should be in a readonly textarea
    const outputTextarea = screen.getByDisplayValue('{"result":"success"}');
    expect(outputTextarea).toBeInTheDocument();
    expect(outputTextarea).toHaveAttribute('readonly');
  });

  it('clears error when input changes', () => {
    const errProcess = vi.fn().mockReturnValueOnce({ output: '', error: 'Bad input' });
    const okProcess = vi.fn().mockReturnValueOnce({ output: 'ok' });

    const process = vi.fn()
      .mockImplementationOnce(() => ({ output: '', error: 'Bad input' }))
      .mockImplementationOnce(() => ({ output: 'ok' }));

    render(
      <ToolLayout
        title="Test"
        description="Test tool"
        process={process}
      />,
    );

    // Trigger error
    const textarea = screen.getByPlaceholderText('Enter your input here…');
    fireEvent.change(textarea, { target: { value: 'bad' } });
    fireEvent.click(screen.getByText('Process'));

    expect(screen.getByText('Bad input')).toBeInTheDocument();

    // Change input — error should disappear
    fireEvent.change(textarea, { target: { value: 'good' } });
    expect(screen.queryByText('Bad input')).not.toBeInTheDocument();
  });

  it('shows empty state when output is empty', () => {
    mockProcess.mockReturnValue({ output: '' });
    render(
      <ToolLayout
        title="Test"
        description="Test tool"
        process={mockProcess}
      />,
    );

    expect(screen.getByText('Process')).toBeInTheDocument();
    expect(screen.queryByText('Output')).not.toBeInTheDocument();
  });
});
