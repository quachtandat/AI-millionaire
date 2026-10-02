import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { clearProfileError, loadProfile, saveProfile, uploadAvatar } from '../../redux/slices/profileSlice';
import { logoutUser, updateCurrentUser } from '../../redux/slices/authSlice';
import Avatar from '../../components/Avatar';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const { user, loading, saving, error } = useSelector((state) => state.profile);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => { dispatch(loadProfile()); }, [dispatch]);

  const save = async () => {
    dispatch(clearProfileError());
    const result = await dispatch(saveProfile({ username: username.trim(), email: email.trim(), avatar_url: user?.avatar_url || null }));
    if (saveProfile.fulfilled.match(result)) { dispatch(updateCurrentUser(result.payload)); setEditing(false); }
  };

  const changeAvatar = async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Cần quyền truy cập ảnh', 'Hãy cho phép truy cập thư viện ảnh để chọn avatar.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85, allowsEditing: true, aspect: [1, 1] });
      const asset = result.assets?.[0];
      if (result.canceled || !asset) return;
      const uploaded = await dispatch(uploadAvatar({ uri: asset.uri, name: asset.fileName, type: asset.mimeType }));
      if (uploadAvatar.fulfilled.match(uploaded)) {
        dispatch(updateCurrentUser(uploaded.payload));
        dispatch(loadProfile());
      }
    } catch {
      Alert.alert('Không thể chọn ảnh', 'Vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>TÀI KHOẢN</Text><Text style={styles.title}>Hồ sơ của bạn</Text>
        {loading && !user ? <ActivityIndicator color="#176B5B" style={styles.loader} /> : null}
        {error ? <View style={styles.errorState}><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Pressable onPress={() => dispatch(loadProfile())}><Text style={styles.retry}>Thử lại</Text></Pressable></View> : null}
        {user ? <>
          <View style={styles.card}>
            <Avatar uri={user.avatar_url} name={user.username} size={76} />
            <Pressable onPress={changeAvatar} disabled={saving} style={styles.changeAvatar}><Text style={styles.changeAvatarText}>{saving ? 'ĐANG TẢI ẢNH…' : 'ĐỔI ẢNH ĐẠI DIỆN'}</Text></Pressable>
            <Text style={styles.label}>Tên người chơi</Text><TextInput value={editing ? username : user.username || ''} onChangeText={setUsername} editable={editing && !saving} style={[styles.input, !editing && styles.readonly]} />
            <Text style={styles.label}>Email</Text><TextInput value={editing ? email : user.email || ''} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" editable={editing && !saving} style={[styles.input, !editing && styles.readonly]} />
            {editing ? <Pressable disabled={saving || !username.trim() || !email.trim()} onPress={save} style={[styles.primary, (saving || !username.trim() || !email.trim()) && styles.disabled]}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>LƯU THAY ĐỔI</Text>}</Pressable> : <Pressable onPress={() => { setUsername(user.username || ''); setEmail(user.email || ''); setEditing(true); }} style={styles.primary}><Text style={styles.primaryText}>CHỈNH SỬA HỒ SƠ</Text></Pressable>}
          </View>
        </> : null}
        <Pressable onPress={() => dispatch(logoutUser())} style={styles.logout}><Text style={styles.logoutText}>ĐĂNG XUẤT</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F4' }, content: { flex: 1, padding: 20 }, eyebrow: { color: '#176B5B', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 }, title: { color: '#14251F', fontSize: 30, fontWeight: '700', marginTop: 8, marginBottom: 24 }, loader: { margin: 32 },
  errorState: { alignItems: 'center', marginBottom: 12 }, error: { color: '#B63838', fontSize: 12, marginBottom: 12 }, retry: { color: '#176B5B', fontSize: 16, fontWeight: '700', padding: 12 }, card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20 }, avatar: { width: 76, height: 76, borderRadius: 26, alignSelf: 'center', marginBottom: 16 }, avatarFallback: { width: 76, height: 76, borderRadius: 26, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: '#DFF1E7', marginBottom: 16 }, avatarInitial: { color: '#176B5B', fontSize: 30, fontWeight: '700' },
  changeAvatar: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, marginBottom: 8 }, changeAvatarText: { color: '#176B5B', fontSize: 12, fontWeight: '700' }, label: { color: '#52645B', fontSize: 12, fontWeight: '700', marginTop: 12, marginBottom: 8 }, input: { minHeight: 50, borderWidth: 1, borderColor: '#DCE4DE', borderRadius: 14, paddingHorizontal: 12, color: '#14251F', fontSize: 16 }, readonly: { backgroundColor: '#F8FAF8' }, primary: { minHeight: 50, borderRadius: 15, backgroundColor: '#176B5B', alignItems: 'center', justifyContent: 'center', marginTop: 24 }, primaryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' }, disabled: { opacity: 0.55 }, logout: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 16 }, logoutText: { color: '#A6413D', fontSize: 12, fontWeight: '700' },
});
