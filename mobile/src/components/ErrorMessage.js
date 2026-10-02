import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

export default function ErrorMessage({ message, onRetry }) {
  return <View style={styles.container}><Text accessibilityRole="alert" style={styles.message}>{message}</Text>{onRetry ? <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}><Text style={styles.retryText}>Thử lại</Text></Pressable> : null}</View>;
}

const styles = StyleSheet.create({ container: { alignItems: 'center', padding: theme.spacing.lg }, message: { color: theme.colors.danger, fontSize: 16, textAlign: 'center' }, retry: { minHeight: 44, justifyContent: 'center', paddingHorizontal: theme.spacing.base }, retryText: { color: theme.colors.primary, fontSize: 16, fontWeight: '700' } });
