import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, registerUser } from '../../redux/slices/authSlice';
import AppInput from '../../components/AppInput';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');

  const submit = async () => {
    dispatch(clearAuthError());
    setNotice('');
    const result = await dispatch(registerUser({ username: username.trim(), email: email.trim(), password }));
    if (registerUser.fulfilled.match(result)) {
      setNotice('Tạo tài khoản thành công. Hãy đăng nhập để bắt đầu.');
      setTimeout(() => navigation.navigate('Login'), 900);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}><Text style={styles.link}>‹  Đăng nhập</Text></Pressable>
        <Text style={styles.kicker}>BẮT ĐẦU HÀNH TRÌNH</Text><Text style={styles.title}>Tạo tài khoản</Text><Text style={styles.subtitle}>Lưu thành tích và tiếp tục chơi bất cứ lúc nào.</Text>
        <View style={styles.form}>
          <AppInput label="Tên người chơi" accessibilityLabel="Tên người chơi" autoCapitalize="none" value={username} onChangeText={setUsername} placeholder="Tên hiển thị" style={styles.input} editable={!loading} />
          <AppInput label="Email" accessibilityLabel="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="ban@email.com" style={styles.input} editable={!loading} />
          <AppInput label="Mật khẩu" accessibilityLabel="Mật khẩu" secureTextEntry value={password} onChangeText={setPassword} placeholder="Ít nhất 6 ký tự" style={styles.input} editable={!loading} />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}
          <Pressable accessibilityRole="button" disabled={loading || !username.trim() || !email.trim() || password.length < 6} onPress={submit} style={[styles.button, (loading || !username.trim() || !email.trim() || password.length < 6) && styles.disabled]}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>TẠO TÀI KHOẢN</Text>}</Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F4' }, container: { flex: 1, justifyContent: 'center', padding: 24 },
  back: { minHeight: 44, justifyContent: 'center', marginBottom: 20 }, link: { color: '#176B5B', fontWeight: '700', fontSize: 16 },
  kicker: { color: '#176B5B', fontSize: 12, fontWeight: '700', letterSpacing: 1.3 }, title: { color: '#14251F', fontSize: 30, fontWeight: '700', marginTop: 8 }, subtitle: { color: '#66736D', fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 24 },
  form: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#153D31', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 3 }, label: { color: '#25362F', fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 12 }, input: { minHeight: 52, borderWidth: 1, borderColor: '#DCE4DE', borderRadius: 14, paddingHorizontal: 16, color: '#14251F', fontSize: 16 },
  error: { color: '#B63838', fontSize: 12, marginTop: 12 }, notice: { color: '#176B5B', fontSize: 12, marginTop: 12 }, button: { minHeight: 52, borderRadius: 16, backgroundColor: '#176B5B', alignItems: 'center', justifyContent: 'center', marginTop: 24 }, disabled: { opacity: 0.55 }, buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.6 },
});
