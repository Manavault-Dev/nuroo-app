import { Button } from '@/components/ui/Button';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';


describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={mockPress} />);
    
    fireEvent.press(getByText('Test Button'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockPress} disabled />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockPress).not.toHaveBeenCalled();
  });

  it('renders with custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <Button title="Test Button" style={customStyle} />
    );
    
    const button = getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('renders with different variants', () => {
    const { getByText } = render(<Button title="Outline Button" variant="outline" />);
    expect(getByText('Outline Button')).toBeTruthy();
  });
});
