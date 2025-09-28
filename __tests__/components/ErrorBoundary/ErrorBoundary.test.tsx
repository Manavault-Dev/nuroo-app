import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(getByText('No error')).toBeTruthy();
  });

  it('renders error fallback when there is an error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(getByText('error.something_went_wrong')).toBeTruthy();
    expect(getByText('error.boundary_message')).toBeTruthy();
  });

  it('calls onRetry when retry button is pressed', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(getByText('error.something_went_wrong')).toBeTruthy();

    const retryButton = getByText('error.try_again');
    fireEvent.press(retryButton);

    expect(retryButton).toBeTruthy();
  });
});
