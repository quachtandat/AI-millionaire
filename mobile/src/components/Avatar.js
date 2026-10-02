import { Image, StyleSheet, Text, View } from 'react-native';

export default function Avatar({ uri, name, size = 72 }) {
  const style = { width: size, height: size, borderRadius: Math.round(size * 0.34) };
  return uri ? <Image source={{ uri }} style={[styles.avatar, style]} /> : <View style={[styles.fallback, style]}><Text style={styles.initial}>{(name || '?').slice(0, 1).toUpperCase()}</Text></View>;
}

const styles = StyleSheet.create({ avatar: { backgroundColor: '#E8F3EE' }, fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#DFF1E7' }, initial: { color: '#176B5B', fontSize: 22, fontWeight: '700' } });
