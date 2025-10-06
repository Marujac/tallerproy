import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../src/components/ui/button';

// Si usas export default, cambia la importación a: import Button from '../src/components/ui/button';

describe('Button component', () => {
  it('renderiza el texto correctamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('ejecuta el callback onClick', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
