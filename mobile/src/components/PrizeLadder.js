import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PRIZE_LEVELS } from '../constants/game';

export default function PrizeLadder({ currentLevel }) {
  const [expanded, setExpanded] = useState(false);
  const rows = PRIZE_LEVELS.map((prize, index) => ({ level: index + 1, prize })).reverse();

  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)} style={styles.toggle}>
        <Text style={styles.title}>MỐC TIỀN THƯỞNG</Text><Text style={styles.toggleText}>{expanded ? 'Ẩn' : 'Xem 15 mốc'}  {expanded ? '⌃' : '⌄'}</Text>
      </Pressable>
      {expanded ? <View style={styles.list}>{rows.map(({ level, prize }) => <View key={level} style={[styles.row, level === currentLevel && styles.current, [5, 10, 15].includes(level) && styles.milestone]}>
        <Text style={[styles.level, level === currentLevel && styles.currentText]}>{String(level).padStart(2, '0')}</Text><Text style={[styles.prize, level === currentLevel && styles.currentText]}>{prize.toLocaleString('vi-VN')} ₫</Text>
      </View>)}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', borderRadius: 18, marginTop: 20, overflow: 'hidden' }, toggle: { minHeight: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, title: { color: '#52645B', fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }, toggleText: { color: '#176B5B', fontSize: 12, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 12 }, row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderRadius: 8 }, milestone: { marginTop: 4 }, current: { paddingHorizontal: 8, backgroundColor: '#176B5B' }, level: { color: '#77847D', fontSize: 12, fontWeight: '700' }, prize: { color: '#52645B', fontSize: 12, fontWeight: '700' }, currentText: { color: '#FFFFFF', fontWeight: '700' },
});
