import { render, screen } from '@testing-library/react';

import { LogLabels, LogLabelsList } from './LogLabels';

describe('<LogLabels />', () => {
  it('renders notice when no labels are found', () => {
    render(<LogLabels labels={{}} emptyMessage="(no unique labels)" />);
    expect(screen.queryByText('(no unique labels)')).toBeInTheDocument();
  });
  it('renders labels', () => {
    render(<LogLabels labels={{ foo: 'bar', baz: '42' }} />);
    expect(screen.queryByText('foo=bar')).toBeInTheDocument();
    expect(screen.queryByText('baz=42')).toBeInTheDocument();
  });
  it('excludes labels with certain names or labels starting with underscore', () => {
    render(<LogLabels labels={{ foo: 'bar', level: '42', _private: '13' }} />);
    expect(screen.queryByText('foo=bar')).toBeInTheDocument();
    expect(screen.queryByText('level=42')).not.toBeInTheDocument();
    expect(screen.queryByText('13')).not.toBeInTheDocument();
  });
  it('excludes labels with empty string values', () => {
    render(<LogLabels labels={{ foo: 'bar', baz: '' }} />);
    expect(screen.queryByText('foo=bar')).toBeInTheDocument();
    expect(screen.queryByText(/baz/)).not.toBeInTheDocument();
  });
});

describe('<LogLabelsList />', () => {
  it('renders labels', () => {
    render(<LogLabelsList labels={['bar', '42']} />);
    expect(screen.queryByText('bar')).toBeInTheDocument();
    expect(screen.queryByText('42')).toBeInTheDocument();
  });
});
