import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SharePlanCardProps {
  nextMove: string;
  phase: string;
  // Timeline items — only pass if finite and > 0
  starterEfMonths?: number;
  debtFreeMonths?: number;
  fullEfMonths?: number;
}

function fmtM(months: number): string {
  const m = Math.ceil(months);
  return `~${m} ${m === 1 ? 'month' : 'months'}`;
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.tlRow}>
      <Text style={s.tlLabel}>{label}</Text>
      <Text style={s.tlValue}>{value}</Text>
    </View>
  );
}

export const SharePlanCard = React.forwardRef<View, SharePlanCardProps>(
  ({ nextMove, phase, starterEfMonths, debtFreeMonths, fullEfMonths }, ref) => {
    const hasTimeline = starterEfMonths || debtFreeMonths || fullEfMonths;

    const phaseLabel =
      phase === 'debt' ? 'Debt Payoff'
      : phase === 'ef' ? 'Emergency Fund'
      : phase === '401k' ? '401(k) Match'
      : 'Investing';

    return (
      <View ref={ref} style={s.card} collapsable={false}>
        {/* Header */}
        <Text style={s.brand}>SAVR</Text>
        <Text style={s.subtitle}>My Financial Plan</Text>

        <View style={s.divider} />

        {/* Phase badge */}
        <View style={s.badge}>
          <Text style={s.badgeText}>{phaseLabel}</Text>
        </View>

        {/* Next Move */}
        <Text style={s.nextMoveLabel}>Next Move</Text>
        <Text style={s.nextMove}>{nextMove}</Text>

        {/* Timeline */}
        {hasTimeline && (
          <>
            <View style={s.divider} />
            <Text style={s.tlHeader}>Timeline</Text>
            {starterEfMonths ? (
              <TimelineRow label="Starter Emergency Fund" value={fmtM(starterEfMonths)} />
            ) : null}
            {debtFreeMonths ? (
              <TimelineRow label="Debt Freedom" value={fmtM(debtFreeMonths)} />
            ) : null}
            {fullEfMonths ? (
              <TimelineRow label="Full Emergency Fund" value={fmtM(fullEfMonths)} />
            ) : null}
          </>
        )}

        {/* Footer */}
        <View style={s.divider} />
        <Text style={s.footer}>Built with SAVR</Text>
      </View>
    );
  },
);

const s = StyleSheet.create({
  card: {
    width: 340,
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  brand: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  badgeText: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextMoveLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  nextMove: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  tlHeader: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tlLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    flex: 1,
  },
  tlValue: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    textAlign: 'center',
  },
});
