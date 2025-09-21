// File: src/components/Sparkline.tsx
import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as d3 from 'd3-shape';
import { colors } from '../theme';

type Props = {
  values: number[];
  width?: number;
  height?: number;
  positive?: boolean;
};

const Sparkline: React.FC<Props> = ({ values, width = 120, height = 40, positive = true }) => {
  if (!values.length) return null;
  const xScale = (index: number) => (index / (values.length - 1)) * width;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const yScale = (value: number) => height - ((value - min) / (max - min || 1)) * height;

  const lineGenerator = d3
    .line<number>()
    .x((_, index) => xScale(index))
    .y((value) => yScale(value))
    .curve(d3.curveMonotoneX);

  const areaGenerator = d3
    .area<number>()
    .x((_, index) => xScale(index))
    .y0(height)
    .y1((value) => yScale(value))
    .curve(d3.curveMonotoneX);

  const linePath = lineGenerator(values) ?? '';
  const areaPath = areaGenerator(values) ?? '';

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor={positive ? colors.positive : colors.negative} stopOpacity="0.6" />
          <Stop offset="1" stopColor={colors.background} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#spark)" opacity={0.6} />
      <Path d={linePath} stroke={positive ? colors.positive : colors.negative} strokeWidth={2} fill="none" />
    </Svg>
  );
};

export default Sparkline;
