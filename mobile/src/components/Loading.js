import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

export default function Loading({ label = 'Đang tải…' }) {
  return <View accessibilityRole="progressbar" style={styles.container}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={styles.label}>{label}</Text></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.base }, label: { color: theme.colors.secondaryText, fontSize: 16 } });
