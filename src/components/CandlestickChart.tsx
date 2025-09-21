// File: src/components/CandlestickChart.tsx
import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { Candle } from '../types';
import { colors } from '../theme';

type Props = {
  candles: Candle[];
  width?: number;
  height?: number;
};

const CandlestickChart: React.FC<Props> = ({ candles, width = 320, height = 180 }) => {
  if (!candles.length) return <View style={{ height }} />;
  const slice = candles.slice(-60);
  const max = Math.max(...slice.map((candle) => candle.high));
  const min = Math.min(...slice.map((candle) => candle.low));
  const candleWidth = width / slice.length;

  const scaleY = (value: number) => height - ((value - min) / (max - min || 1)) * height;

  return (
    <Svg width={width} height={height}>
      {slice.map((candle, index) => {
        const x = index * candleWidth + candleWidth / 2;
        const color = candle.close >= candle.open ? colors.positive : colors.negative;
        const top = scaleY(candle.high);
        const bottom = scaleY(candle.low);
        const bodyTop = scaleY(Math.max(candle.open, candle.close));
        const bodyBottom = scaleY(Math.min(candle.open, candle.close));
        const bodyHeight = Math.max(2, bodyBottom - bodyTop);
        return (
          <React.Fragment key={candle.time}>
            <Line x1={x} x2={x} y1={top} y2={bottom} stroke={color} strokeWidth={1} />
            <Rect
              x={x - candleWidth * 0.3}
              y={bodyTop}
              width={candleWidth * 0.6}
              height={bodyHeight}
              fill={color}
              rx={2}
            />
          </React.Fragment>
        );
      })}
    </Svg>
  );
};

export default CandlestickChart;
