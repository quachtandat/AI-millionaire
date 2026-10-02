import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, loginUser } from '../../redux/slices/authSlice';
import AppInput from '../../components/AppInput';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = () => {
    dispatch(clearAuthError());
    dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.brand}><Text style={styles.kicker}>AI MILLIONAIRE</Text><Text style={styles.title}>Sẵn sàng chinh phục{ '\n' }triệu câu hỏi?</Text><Text style={styles.subtitle}>Đăng nhập để tiếp tục hành trình của bạn.</Text></View>
        <View style={styles.form}>
          <AppInput label="Email" accessibilityLabel="Email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="ban@email.com" style={styles.input} editable={!loading} />
          <AppInput label="Mật khẩu" accessibilityLabel="Mật khẩu" autoComplete="password" secureTextEntry value={password} onChangeText={setPassword} placeholder="Nhập mật khẩu" style={styles.input} editable={!loading} onSubmitEditing={submit} />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" disabled={loading || !email.trim() || !password} onPress={submit} style={({ pressed }) => [styles.button, (pressed || loading) && styles.buttonPressed, (!email.trim() || !password) && styles.buttonDisabled]}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>}
          </Pressable>
          <View style={styles.footer}><Text style={styles.footerText}>Chưa có tài khoản? </Text><Pressable onPress={() => { dispatch(clearAuthError()); navigation.navigate('Register'); }} hitSlop={8}><Text style={styles.link}>Đăng ký</Text></Pressable></View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F4' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  brand: { marginBottom: 40 }, kicker: { color: '#176B5B', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 },
  title: { color: '#14251F', fontSize: 30, fontWeight: '700', lineHeight: 38 }, subtitle: { color: '#66736D', fontSize: 16, marginTop: 12, lineHeight: 24 },
  form: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#153D31', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  label: { color: '#25362F', fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 12 }, input: { minHeight: 52, borderWidth: 1, borderColor: '#DCE4DE', borderRadius: 14, paddingHorizontal: 16, color: '#14251F', fontSize: 16 },
  error: { color: '#B63838', fontSize: 12, marginTop: 12 },
  button: { minHeight: 52, borderRadius: 16, backgroundColor: '#176B5B', alignItems: 'center', justifyContent: 'center', marginTop: 24 }, buttonPressed: { opacity: 0.86 }, buttonDisabled: { opacity: 0.55 }, buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.6 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, minHeight: 44, alignItems: 'center' }, footerText: { color: '#66736D', fontSize: 12 }, link: { color: '#176B5B', fontSize: 12, fontWeight: '700' },
});
