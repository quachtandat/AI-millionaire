import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../theme/theme';

export default function LifelineButton({ title, used, disabled, onPress }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || used }} disabled={disabled || used} onPress={onPress} style={[styles.button, used && styles.used, disabled && styles.disabled]}><Text style={[styles.label, used && styles.usedLabel]}>{used ? '✓ ' : ''}{title}</Text></Pressable>;
}

const styles = StyleSheet.create({ button: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BED7CC', backgroundColor: theme.colors.surface }, used: { backgroundColor: '#E6EBE8', borderColor: '#E6EBE8' }, disabled: { opacity: 0.6 }, label: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' }, usedLabel: { color: '#7E8983' } });
