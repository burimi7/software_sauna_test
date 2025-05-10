import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TheTest from './TheTest';

describe('TheTest component with test-ids', () => {
  test('renders textarea and start button', () => {
    render(<TheTest />);
    expect(screen.getByTestId('map-input')).toBeInTheDocument();
    expect(screen.getByTestId('start-button')).toBeInTheDocument();
  });

  test('updates textarea value on input', () => {
    render(<TheTest />);
    const textarea = screen.getByTestId('map-input') as HTMLTextAreaElement;
    fireEvent.input(textarea, { target: { value: '@-B-x' } });
    expect(textarea.value).toBe('@-B-x');
  });

  test('shows error if map has multiple start/end points', () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: '@---@\n---x---x' }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  test('displays collected letters after traversal', async () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: '@-A-x' }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(await screen.findByTestId('letters-output')).toHaveTextContent('A');
  });

  test('simple path follow', async () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: `  @---A---+
          |
  x-B-+   C
      |   |
      +---+` }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(await screen.findByTestId('letters-output')).toHaveTextContent('ACB');
    expect(await screen.findByTestId('path-output')).toHaveTextContent('@---A---+|C|+---+|+-B-x');
  });

  test('simple path intersection', async () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: `  @
  | +-C--+
  A |    |
  +---B--+
    |      x
    |      |
    +---D--+` }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(await screen.findByTestId('letters-output')).toHaveTextContent('ABCD');
    expect(await screen.findByTestId('path-output')).toHaveTextContent('@|A+---B--+|+--C-+|||+---D--+|x');
  });
  

  test('second simple path', async () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: `  @---A---+
          |
  x-B-+   |
      |   |
      +---C` }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(await screen.findByTestId('letters-output')).toHaveTextContent('ACB');
    expect(await screen.findByTestId('path-output')).toHaveTextContent('@---A---+|||C---+|+-B-x');
  });
  
  test('igonre letters read for hte second time', async () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: `     +-O-N-+
     |     |
     |   +-I-+
 @-G-O-+ | | |
     | | +-+ E
     +-+     S
             |
             x` }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(await screen.findByTestId('letters-output')).toHaveTextContent('GOONIES');
    expect(await screen.findByTestId('path-output')).toHaveTextContent('@-G-O|+-+|+-||+-O-N-+|I|+-+|+--+|ES|x');
    // expect(await screen.findByTestId('path-output')).toHaveTextContent('@-G-O-+|+-+|O||+-O-N-+|I|+-+|+-I-+|ES|x');
  });
  
  test('no starting point', async () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: `     -A---+
          |
  x-B-+   C
      |   |
      +---+` }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(await screen.findByTestId('0')).toHaveTextContent('Error');
    // expect(await screen.findByTestId('path-output')).toHaveTextContent('@-G-O-+|+-+|O||+-O-N-+|I|+-+|+-I-+|ES|x');
  });  

  test('displays character path correctly', async () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: '@-C-x' }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    const path = await screen.findByTestId('path-output');
    expect(path).toHaveTextContent('C');
  });

  test('Ignore stuff after end of path', async () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: `  @-A--+
       |
       +-B--x-C--D` }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(await screen.findByTestId('letters-output')).toHaveTextContent('AB');
    expect(await screen.findByTestId('path-output')).toHaveTextContent('@-A--+|+-B--x');
  });

  test('Ignore stuff after end of path', async () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: `   @--A---+
          |
    B-+   C
      |   |
      +---+` }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(await screen.findByTestId('0')).toHaveTextContent('Error');

  });

  test('Fork in path', async () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: `        x-B
          |
   @--A---+
          |
     x+   C
      |   |
      +---+` }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(await screen.findByTestId('0')).toHaveTextContent('Error');

  });

  test('Multiple starting paths', async () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: `  x-B-@-A-x` }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(await screen.findByTestId('0')).toHaveTextContent('Error');

  });

  test('Fake turn', async () => {
    render(<TheTest />);
    fireEvent.input(screen.getByTestId('map-input'), {
      target: { value: `  @-A-+-B-x` }
    });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(await screen.findByTestId('0')).toHaveTextContent('Error');

  });




});
