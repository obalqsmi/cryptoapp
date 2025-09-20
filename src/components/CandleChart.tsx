// File: src/components/CandleChart.tsx
import React from 'react';
import { View, Text, StyleSheet, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { Candle } from '../types';
import { colors, spacing } from '../theme';
import { formatCurrency } from '../utils/format';

interface CandleChartProps {
  candles: Candle[];
  width?: number;
  height?: number;
  currency: string;
}

const CandleChart: React.FC<CandleChartProps> = ({ candles, width = 320, height = 220, currency }) => {
  const [visibleCount, setVisibleCount] = React.useState(60);
  const [cursorIndex, setCursorIndex] = React.useState<number | null>(null);
  const pinchDistanceRef = React.useRef<number | null>(null);

  const visibleCandles = React.useMemo(() => candles.slice(-visibleCount), [candles, visibleCount]);

  const [min, max] = React.useMemo(() => {
    if (!visibleCandles.length) {
      return [0, 1];
    }
    const lows = visibleCandles.map((candle) => candle.low);
    const highs = visibleCandles.map((candle) => candle.high);
    return [Math.min(...lows), Math.max(...highs)];
  }, [visibleCandles]);

  const scaleX = React.useCallback(
    (index: number) => (index / Math.max(visibleCandles.length - 1, 1)) * width,
    [visibleCandles.length, width],
  );

  const scaleY = React.useCallback(
    (value: number) => {
      if (max === min) return height / 2;
      return height - ((value - min) / (max - min)) * height;
    },
    [height, max, min],
  );

  const handleDrag = React.useCallback(
    (event: GestureResponderEvent, _gestureState: PanResponderGestureState) => {
      const x = event.nativeEvent.locationX;
      const index = Math.round((x / width) * (visibleCandles.length - 1));
      setCursorIndex(Math.min(Math.max(index, 0), visibleCandles.length - 1));
    },
    [visibleCandles.length, width],
  );

  const handlePinch = React.useCallback(
    (event: GestureResponderEvent) => {
      const touches = event.nativeEvent.touches;
      if (touches.length < 2) return;
      const [touch1, touch2] = touches;
      const distance = Math.abs(touch1.locationX - touch2.locationX);
      if (pinchDistanceRef.current !== null) {
        const delta = distance - pinchDistanceRef.current;
        if (Math.abs(delta) > 12) {
          setVisibleCount((prev) => {
            const next = delta > 0 ? prev - 5 : prev + 5;
            return Math.max(20, Math.min(candles.length, next));
          });
          pinchDistanceRef.current = distance;
        }
      } else {
        pinchDistanceRef.current = distance;
      }
    },
    [candles.length],
  );

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          if (event.nativeEvent.touches.length === 1) {
            const x = event.nativeEvent.locationX;
            const index = Math.round((x / width) * (visibleCandles.length - 1));
            setCursorIndex(Math.min(Math.max(index, 0), visibleCandles.length - 1));
          }
          if (event.nativeEvent.touches.length === 2) {
            const [touch1, touch2] = event.nativeEvent.touches;
            pinchDistanceRef.current = Math.abs(touch1.locationX - touch2.locationX);
          }
        },
        onPanResponderMove: (event, gestureState) => {
          if (event.nativeEvent.touches.length === 1) {
            handleDrag(event, gestureState);
          }
          if (event.nativeEvent.touches.length === 2) {
            handlePinch(event);
          }
        },
        onPanResponderRelease: () => {
          setCursorIndex(null);
          pinchDistanceRef.current = null;
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [handleDrag, handlePinch, visibleCandles.length, width],
  );

  const cursorCandle = cursorIndex !== null ? visibleCandles[cursorIndex] : undefined;

  return (
    <View>
      <View style={styles.header}>
        {cursorCandle ? (
          <Text style={styles.price}>{formatCurrency(cursorCandle.close, currency)}</Text>
        ) : (
          <Text style={styles.price}>{formatCurrency(visibleCandles[visibleCandles.length - 1]?.close ?? 0, currency)}</Text>
        )}
        {cursorCandle ? (
          <Text style={styles.caption}>
            O {formatCurrency(cursorCandle.open, currency)} · H {formatCurrency(cursorCandle.high, currency)} · L{' '}
            {formatCurrency(cursorCandle.low, currency)}
          </Text>
        ) : null}
      </View>
      <View style={{ width, height }} {...panResponder.panHandlers}>
        <Svg width={width} height={height}>
          {visibleCandles.map((candle, index) => {
            const x = scaleX(index);
            const candleWidth = Math.max(width / Math.max(visibleCandles.length * 1.6, 1), 4);
            const openY = scaleY(candle.open);
            const closeY = scaleY(candle.close);
            const highY = scaleY(candle.high);
            const lowY = scaleY(candle.low);
            const isUp = candle.close >= candle.open;
            const color = isUp ? colors.success : colors.danger;
            return (
              <React.Fragment key={candle.timestamp}>
                <Line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth={1} />
                <Rect
                  x={x - candleWidth / 2}
                  y={Math.min(openY, closeY)}
                  width={candleWidth}
                  height={Math.max(Math.abs(closeY - openY), 2)}
                  fill={color}
                  rx={2}
                />
              </React.Fragment>
            );
          })}
          {cursorIndex !== null ? (
            <Line
              x1={scaleX(cursorIndex)}
              x2={scaleX(cursorIndex)}
              y1={0}
              y2={height}
              stroke={colors.textMuted}
              strokeDasharray="4 4"
            />
          ) : null}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  price: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  caption: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default CandleChart;
