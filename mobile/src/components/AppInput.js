import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme/theme';

export default function AppInput({ label, style, ...inputProps }) {
  return <View style={styles.container}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor="#8A9691" {...inputProps} style={[styles.input, style]} /></View>;
}

const styles = StyleSheet.create({ container: { marginTop: theme.spacing.md }, label: { color: theme.colors.body, fontSize: 12, fontWeight: '700', marginBottom: theme.spacing.sm }, input: { minHeight: 52, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, paddingHorizontal: theme.spacing.base, color: theme.colors.text, fontSize: 16, backgroundColor: theme.colors.surface } });
