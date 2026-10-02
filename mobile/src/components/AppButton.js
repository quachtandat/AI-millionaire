import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../theme/theme';

export default function AppButton({ title, onPress, loading = false, disabled = false, variant = 'primary', style }) {
  const unavailable = disabled || loading;
  return <Pressable accessibilityRole="button" disabled={unavailable} onPress={onPress} style={({ pressed }) => [styles.base, variant === 'secondary' && styles.secondary, variant === 'danger' && styles.danger, unavailable && styles.disabled, pressed && !unavailable && styles.pressed, style]}>
    {loading ? <ActivityIndicator color={variant === 'secondary' ? theme.colors.primary : '#FFFFFF'} /> : <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{title}</Text>}
  </Pressable>;
}

const styles = StyleSheet.create({ base: { minHeight: 52, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.lg }, secondary: { backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: theme.colors.border }, danger: { backgroundColor: theme.colors.danger }, label: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }, secondaryLabel: { color: theme.colors.primary }, disabled: { opacity: 0.55 }, pressed: { opacity: 0.86 } });
