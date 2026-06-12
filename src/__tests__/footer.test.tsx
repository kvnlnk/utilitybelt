// ---------------------------------------------------------------------------
// Component tests: Footer
// ---------------------------------------------------------------------------
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/footer';

// Mock next/link for static rendering
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    <a href={href}>{children}</a>,
}));

describe('Footer', () => {
  it('renders the current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument();
  });

  it('renders UtilityBelt brand name', () => {
    render(<Footer />);
    expect(screen.getByText(/UtilityBelt/)).toBeInTheDocument();
  });

  it('renders Home link', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /Home/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders Cheatsheets link', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /Cheatsheets/i });
    expect(link).toHaveAttribute('href', '/cheatsheets');
  });
});
