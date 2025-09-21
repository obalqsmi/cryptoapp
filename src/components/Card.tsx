// File: src/components/Card.tsx
import React from 'react';
import { View, ViewProps } from 'react-native';
import { colors, radii } from '../theme';

const Card: React.FC<ViewProps> = ({ style, children, ...rest }) => (
  <View
    {...rest}
    style={[{ backgroundColor: colors.card, borderRadius: radii.lg, padding: 16 }, style]}
  >
    {children}
  </View>
);

export default Card;
