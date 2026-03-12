import React from 'react';
import { View, Text } from 'react-native';
import { COLORS, FONT_SIZE } from '../../constants/theme';
import { fmtCompact } from '../../engine/planner';

type Point = { x: number; y: number };

interface BarChartProps {
  data: Point[];
  height?: number;
  barGap?: number;
}

export function BarChart({ data, height = 200, barGap = 2 }: BarChartProps) {
  if (!data.length) return null;

  const maxY = Math.max(...data.map((d) => d.y), 1);
  const yTicks = 4;
  const tickVals = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxY * i) / yTicks),
  );

  // Choose step for x-axis labels (~6 visible)
  const n = data.length;
  const rough = Math.ceil(n / 6);
  const step = rough <= 1 ? 1 : rough <= 2 ? 2 : 5;

  const plotHeight = height - 24; // reserve space for x labels

  return (
    <View style={{ height, flexDirection: 'row' }}>
      {/* Y-axis labels */}
      <View style={{ width: 52, flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 24 }}>
        {tickVals
          .slice()
          .reverse()
          .map((v, idx) => (
            <Text key={idx} style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs, textAlign: 'right' }}>
              {v >= 1000 ? fmtCompact(v) : `$${v}`}
            </Text>
          ))}
      </View>

      {/* Plot area */}
      <View style={{ flex: 1, marginLeft: 4 }}>
        {/* Grid lines */}
        {tickVals.map((_, i) => (
          <View
            key={`grid-${i}`}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: (plotHeight * (yTicks - i)) / yTicks,
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
          />
        ))}

        {/* Bars row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: plotHeight }}>
          {data.map((d, i) => {
            const barHeight = Math.max(2, (d.y / maxY) * plotHeight);
            const showLabel = d.x % step === 0 || i === data.length - 1;
            return (
              <View
                key={i}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: barGap / 2 }}
              >
                <View
                  style={{
                    width: '100%',
                    height: barHeight,
                    backgroundColor: 'rgba(255,255,255,0.82)',
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3,
                  }}
                />
              </View>
            );
          })}
        </View>

        {/* X-axis labels */}
        <View style={{ flexDirection: 'row', height: 20, marginTop: 4 }}>
          {data.map((d, i) => {
            const showLabel = d.x % step === 0 || i === data.length - 1;
            return (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                {showLabel ? (
                  <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>{d.x}</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
