// File: src/components/EquityChart.tsx
import React from 'react';
import Svg, { Path, LinearGradient, Defs, Stop } from 'react-native-svg';
import * as d3 from 'd3-shape';
import { colors } from '../theme';

type Props = {
  values: number[];
  width?: number;
  height?: number;
};

const EquityChart: React.FC<Props> = ({ values, width = 320, height = 160 }) => {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (index: number) => (index / (values.length - 1)) * width;
  const y = (value: number) => height - ((value - min) / (max - min || 1)) * height;

  const line = d3
    .line<number>()
    .x((_, index) => x(index))
    .y((value) => y(value))
    .curve(d3.curveMonotoneX);

  const area = d3
    .area<number>()
    .x((_, index) => x(index))
    .y0(height)
    .y1((value) => y(value))
    .curve(d3.curveMonotoneX);

  const linePath = line(values) ?? '';
  const areaPath = area(values) ?? '';

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="equity" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor={colors.accent} stopOpacity="0.6" />
          <Stop offset="1" stopColor={colors.background} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#equity)" />
      <Path d={linePath} stroke={colors.accent} strokeWidth={2} fill="none" />
    </Svg>
  );
};

export default EquityChart;
