import { render, screen, fireEvent, act } from '@testing-library/react';
import CompetitiveArena from '@/components/simulations/CompetitiveArena';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Language Context
vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (str: string) => str,
    tNum: (num: any) => String(num),
  }),
}));

describe('CompetitiveArena Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const dummyPlayer1 = { id: 'p1', name: 'Rohan' };
  const dummyPlayer2 = { id: 'p2', name: 'Sakshi' };

  it('renders in waiting state by default', () => {
    render(
      <CompetitiveArena
        title="Test Battle"
        description="Solve calculations quickly!"
        icon={<div>Icon</div>}
        player1={dummyPlayer1}
        player2={dummyPlayer2}
      >
        {({ gameState }) => <div>Game State: {gameState}</div>}
      </CompetitiveArena>
    );

    expect(screen.getByText('Ready for Battle?')).toBeInTheDocument();
    expect(screen.getByText('Solve calculations quickly!')).toBeInTheDocument();
    expect(screen.getByText('START COMPETITION')).toBeInTheDocument();
  });

  it('transitions to running when start competition button is clicked', () => {
    render(
      <CompetitiveArena
        title="Test Battle"
        description="Solve calculations quickly!"
        icon={<div>Icon</div>}
        player1={dummyPlayer1}
        player2={dummyPlayer2}
      >
        {({ gameState }) => <div>Game State: {gameState}</div>}
      </CompetitiveArena>
    );

    const startBtn = screen.getByText('START COMPETITION');
    fireEvent.click(startBtn);

    expect(screen.getByText('Game State: running')).toBeInTheDocument();
  });

  it('calls onGameEnd when manual submit & finish button is clicked', async () => {
    const handleGameEnd = vi.fn().mockResolvedValue(undefined);

    render(
      <CompetitiveArena
        title="Test Battle"
        description="Solve calculations quickly!"
        icon={<div>Icon</div>}
        player1={dummyPlayer1}
        player2={dummyPlayer2}
        onGameEnd={handleGameEnd}
      >
        {({ gameState, addPoint }) => (
          <div>
            <div>Game State: {gameState}</div>
            <button onClick={() => addPoint('A')}>Add A</button>
          </div>
        )}
      </CompetitiveArena>
    );

    // Start game
    fireEvent.click(screen.getByText('START COMPETITION'));

    // Add points
    fireEvent.click(screen.getByText('Add A'));

    // Click finish
    const finishBtn = screen.getByText(/SUBMIT & FINISH/i);
    await act(async () => {
      fireEvent.click(finishBtn);
    });

    expect(handleGameEnd).toHaveBeenCalledWith('A', { a: 1, b: 0 });
    expect(screen.getByText('✓ Battle Saved Live to Database!')).toBeInTheDocument();
  });

  it('calls onGameEnd when timer expires', async () => {
    const handleGameEnd = vi.fn().mockResolvedValue(undefined);

    render(
      <CompetitiveArena
        title="Test Battle"
        description="Solve calculations quickly!"
        icon={<div>Icon</div>}
        duration={10}
        player1={dummyPlayer1}
        player2={dummyPlayer2}
        onGameEnd={handleGameEnd}
      >
        {({ gameState, addPoint }) => (
          <div>
            <div>Game State: {gameState}</div>
            <button onClick={() => addPoint('B')}>Add B</button>
          </div>
        )}
      </CompetitiveArena>
    );

    // Start game
    fireEvent.click(screen.getByText('START COMPETITION'));

    // Add points
    fireEvent.click(screen.getByText('Add B'));

    // Advance timer
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(handleGameEnd).toHaveBeenCalledWith('B', { a: 0, b: 1 });
  });
});
