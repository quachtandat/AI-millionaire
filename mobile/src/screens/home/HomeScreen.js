import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { clearGameError, startGame } from '../../redux/slices/gameSlice';
import AppButton from '../../components/AppButton';
import Avatar from '../../components/Avatar';
import ErrorMessage from '../../components/ErrorMessage';
import { loadStatistics } from '../../redux/slices/statisticsSlice';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { loading, error } = useSelector((state) => state.game);
  const { data: stats, error: statsError } = useSelector((state) => state.statistics);

  useFocusEffect(useCallback(() => { dispatch(loadStatistics()); }, [dispatch]));

  const play = async (navigation) => {
    dispatch(clearGameError());
    const result = await dispatch(startGame());
    if (startGame.fulfilled.match(result)) navigation.navigate('Game');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}><View style={styles.greeting}><Avatar uri={user?.avatar_url} name={user?.username} size={52} /><View><Text style={styles.eyebrow}>AI MILLIONAIRE</Text><Text style={styles.title}>Xin chào, {user?.username || 'người chơi'}!</Text></View></View><Pressable accessibilityRole="button" onPress={() => dispatch(logoutUser())} style={styles.logout}><Text style={styles.logoutText}>Thoát</Text></Pressable></View>
      <View style={styles.card}><Text style={styles.cardEyebrow}>SẴN SÀNG CHƯA?</Text><Text style={styles.cardTitle}>Triệu phú tiếp theo có thể là bạn.</Text><Text style={styles.cardCopy}>Mỗi câu trả lời đúng đưa bạn tiến gần hơn tới đỉnh cao.</Text></View>
      <View style={styles.profile}><Text style={styles.profileLabel}>THÀNH TÍCH</Text><View style={styles.stats}><View><Text style={styles.profileValue}>{stats?.gamesPlayed ?? '—'}</Text><Text style={styles.statLabel}>Ván đã chơi</Text></View><View><Text style={styles.profileValue}>{Number(stats?.highestPrize || 0).toLocaleString('vi-VN')} ₫</Text><Text style={styles.statLabel}>Mốc cao nhất</Text></View></View></View>
      {statsError ? <ErrorMessage message={statsError} onRetry={() => dispatch(loadStatistics())} /> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <AppButton title="CHƠI NGAY" loading={loading} onPress={() => play(navigation)} style={styles.play} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F4', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }, greeting: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eyebrow: { color: '#176B5B', fontSize: 12, fontWeight: '700', letterSpacing: 1.3 }, title: { color: '#14251F', fontSize: 22, fontWeight: '700', marginTop: 8 },
  logout: { minWidth: 60, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, logoutText: { color: '#176B5B', fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: '#176B5B', borderRadius: 24, padding: 24, marginTop: 36 }, cardEyebrow: { color: '#D6F1E8', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 }, cardTitle: { color: '#FFFFFF', fontSize: 30, lineHeight: 32, fontWeight: '700', marginTop: 16 }, cardCopy: { color: '#E1F0EA', fontSize: 16, lineHeight: 23, marginTop: 12 },
  profile: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginTop: 24 }, profileLabel: { color: '#77847D', fontSize: 12, fontWeight: '700', letterSpacing: 1 }, profileValue: { color: '#14251F', fontSize: 16, marginTop: 8, fontWeight: '700' }, stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }, statLabel: { color: '#66736D', fontSize: 12, marginTop: 4 },
  error: { color: '#B63838', fontSize: 12, marginTop: 16 }, play: { minHeight: 56, borderRadius: 16, backgroundColor: '#176B5B', alignItems: 'center', justifyContent: 'center', marginTop: 24 }, playText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.6 }, disabled: { opacity: 0.6 },
});
