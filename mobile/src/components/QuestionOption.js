import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../theme/theme';

export default function QuestionOption({ letter, text, disabled, removed, onPress }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Đáp án ${letter}: ${text}`} disabled={disabled || removed} onPress={onPress} style={({ pressed }) => [styles.option, pressed && styles.pressed, removed && styles.removed, disabled && styles.disabled]}>
    <Text style={styles.letter}>{letter}</Text><Text style={styles.text}>{text}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({ option: { minHeight: 58, flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.base }, pressed: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft }, removed: { opacity: 0.35 }, disabled: { opacity: 0.6 }, letter: { width: 32, color: theme.colors.primary, fontSize: 16, fontWeight: '700' }, text: { flex: 1, color: theme.colors.body, fontSize: 16, lineHeight: 24 } });
