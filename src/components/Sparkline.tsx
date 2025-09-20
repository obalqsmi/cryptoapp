// File: src/components/Sparkline.tsx
import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as d3 from 'd3-shape';
import { colors } from '../theme';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, width = 80, height = 32, color = colors.accent }) => {
  const path = React.useMemo(() => {
    if (!data.length) return '';
    const x = (index: number) => (index / Math.max(data.length - 1, 1)) * width;
    const [min, max] = [Math.min(...data), Math.max(...data)];
    const y = (value: number) => {
      if (max === min) {
        return height / 2;
      }
      return height - ((value - min) / (max - min)) * height;
    };
    const line = d3
      .line<number>()
      .x((_, index) => x(index))
      .y((value) => y(value))
      .curve(d3.curveMonotoneX);
    return line(data) ?? '';
  }, [data, height, width]);

  const fillPath = React.useMemo(() => {
    if (!path) return '';
    return `${path} L ${width} ${height} L 0 ${height} Z`;
  }, [path, width, height]);

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.35} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {fillPath ? <Path d={fillPath} fill="url(#sparklineFill)" /> : null}
      {path ? <Path d={path} stroke={color} strokeWidth={2} fill="none" /> : null}
    </Svg>
  );
};

export default Sparkline;
