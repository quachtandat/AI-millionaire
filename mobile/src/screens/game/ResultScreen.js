import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { clearGame, startGame } from '../../redux/slices/gameSlice';

export default function ResultScreen({ navigation }) {
  const dispatch = useDispatch();
  const { answerResult, currentLevel, currentPrize, loading, error } = useSelector((state) => state.game);
  const won = answerResult?.gameStatus === 'won';
  const stopped = answerResult?.gameStatus === 'stopped';
  const timedOut = answerResult?.timedOut;

  const playAgain = async () => {
    dispatch(clearGame());
    const result = await dispatch(startGame());
    if (startGame.fulfilled.match(result)) navigation.replace('Game');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={[styles.icon, won && styles.iconWin]}><Text style={styles.iconText}>{won ? '✦' : stopped ? 'Ⅱ' : '!'}</Text></View>
        <Text style={styles.eyebrow}>{won ? 'CHÚC MỪNG BẠN' : stopped ? 'CUỘC CHƠI ĐÃ DỪNG' : timedOut ? 'HẾT THỜI GIAN' : 'KẾT THÚC LƯỢT CHƠI'}</Text>
        <Text style={styles.title}>{won ? 'Bạn đã chinh phục đỉnh cao!' : stopped ? 'Bạn đã dừng cuộc chơi.' : timedOut ? 'Bạn đã hết 60 giây để trả lời.' : 'Lần sau sẽ tiến xa hơn.'}</Text>
        <View style={styles.summary}><Text style={styles.summaryLabel}>MỨC ĐẠT ĐƯỢC</Text><Text style={styles.level}>Câu {currentLevel}</Text><View style={styles.divider} /><Text style={styles.summaryLabel}>TIỀN THƯỞNG</Text><Text style={styles.prize}>{Number(currentPrize).toLocaleString('vi-VN')} ₫</Text></View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" disabled={loading} onPress={playAgain} style={[styles.primary, loading && styles.disabled]}>{loading ? <Text style={styles.primaryText}>ĐANG TẠO VÁN MỚI…</Text> : <Text style={styles.primaryText}>CHƠI LẠI</Text>}</Pressable>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Main', { screen: 'HistoryTab' })} style={styles.secondary}><Text style={styles.secondaryText}>XEM LỊCH SỬ</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => { dispatch(clearGame()); navigation.popToTop(); }} style={styles.secondary}><Text style={styles.secondaryText}>VỀ TRANG CHỦ</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F4' }, container: { flex: 1, justifyContent: 'center', padding: 24 }, icon: { width: 68, height: 68, borderRadius: 22, backgroundColor: '#FBE6E4', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24 }, iconWin: { backgroundColor: '#DFF1E7' }, iconText: { color: '#176B5B', fontSize: 30, fontWeight: '700' },
  eyebrow: { color: '#176B5B', fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textAlign: 'center' }, title: { color: '#14251F', fontSize: 30, lineHeight: 35, fontWeight: '700', textAlign: 'center', marginTop: 12 },
  summary: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 24, marginTop: 28, marginBottom: 24 }, summaryLabel: { color: '#77847D', fontSize: 12, fontWeight: '700', letterSpacing: 1 }, level: { color: '#14251F', fontSize: 22, fontWeight: '700', marginTop: 8 }, divider: { height: 1, backgroundColor: '#E7ECE8', marginVertical: 20 }, prize: { color: '#176B5B', fontSize: 30, fontWeight: '700', marginTop: 8 },
  error: { color: '#B63838', textAlign: 'center', marginBottom: 12 }, primary: { minHeight: 54, borderRadius: 16, backgroundColor: '#176B5B', alignItems: 'center', justifyContent: 'center' }, disabled: { opacity: 0.6 }, primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }, secondary: { minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 12 }, secondaryText: { color: '#52645B', fontSize: 12, fontWeight: '700' },
});
