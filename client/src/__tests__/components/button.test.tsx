/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  /**
   * Test case for rendering the button with default variant
   */
  test('renders button with default variant', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('bg-primary');
  });

  /**
   * Test case for rendering the button with secondary variant
   */
  test('renders button with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const buttonElement = screen.getByRole('button', { name: /secondary/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('bg-secondary');
  });

  /**
   * Test case for rendering the button with outline variant
   */
  test('renders button with outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    const buttonElement = screen.getByRole('button', { name: /outline/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('border');
  });

  /**
   * Test case for rendering the button with different sizes
   */
  test('renders button with different sizes', () => {
    const { rerender } = render(<Button size="default">Default Size</Button>);
    let buttonElement = screen.getByRole('button', { name: /default size/i });
    expect(buttonElement).toBeInTheDocument();
    
    rerender(<Button size="sm">Small Size</Button>);
    buttonElement = screen.getByRole('button', { name: /small size/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('h-9');
    
    rerender(<Button size="lg">Large Size</Button>);
    buttonElement = screen.getByRole('button', { name: /large size/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('h-11');
  });

  /**
   * Test case for rendering the button as disabled
   */
  test('renders disabled button', () => {
    render(<Button disabled>Disabled</Button>);
    const buttonElement = screen.getByRole('button', { name: /disabled/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveClass('opacity-50');
  });
});