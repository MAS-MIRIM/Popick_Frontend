import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import Splash from '../../screens/Splash';

describe('Splash Screen', () => {
  it('renders correctly', () => {
    const {getByTestId} = render(<Splash onFinish={() => {}} />);

    // TouchableWithoutFeedback should be rendered
    expect(() => getByTestId('splash-container')).not.toThrow();
  });

  it('calls onFinish when pressed', () => {
    const onFinishMock = jest.fn();
    const {getByTestId} = render(<Splash onFinish={onFinishMock} />);

    // Press the touchable container
    const container = getByTestId('splash-container');
    fireEvent.press(container);

    expect(onFinishMock).toHaveBeenCalledTimes(1);
  });
});
