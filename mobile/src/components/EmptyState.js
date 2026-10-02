import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';
import AppButton from './AppButton';

export default function EmptyState({ title, message, actionTitle, onAction, loading = false, disabled = false }) {
  return <View style={styles.container}><Text style={styles.mark}>✦</Text><Text style={styles.title}>{title}</Text><Text style={styles.message}>{message}</Text>{actionTitle ? <AppButton title={actionTitle} onPress={onAction} loading={loading} disabled={disabled} style={styles.action} /> : null}</View>;
}

const styles = StyleSheet.create({ container: { alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl }, mark: { color: theme.colors.primary, fontSize: 30 }, title: { color: theme.colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: theme.spacing.base }, message: { color: theme.colors.secondaryText, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: theme.spacing.sm }, action: { marginTop: theme.spacing.lg } });
