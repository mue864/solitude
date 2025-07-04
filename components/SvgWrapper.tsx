import React from 'react';
import { SvgProps } from 'react-native-svg';

interface SvgWrapperProps extends SvgProps {
  svg: React.FC<SvgProps>;
}

export const SvgWrapper: React.FC<SvgWrapperProps> = ({ svg: Svg, ...props }) => {
  return <Svg {...props} />;
};
