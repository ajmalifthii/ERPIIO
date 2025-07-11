import { render, screen } from '@testing-library/react';
import { StatsCard } from './StatsCard';
import { CreditCard } from 'lucide-react';

describe('StatsCard', () => {
  it('renders the title and value', () => {
    render(<StatsCard title="Total Sales" value="$10,000" icon={CreditCard} />);
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(<StatsCard title="Total Sales" value="$10,000" icon={CreditCard} />);
    expect(screen.getByTestId('stats-card-icon')).toBeInTheDocument();
  });
});
