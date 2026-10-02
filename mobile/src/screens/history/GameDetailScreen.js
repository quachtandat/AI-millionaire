import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { loadGameDetail } from '../../redux/slices/historySlice';

export default function GameDetailScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const { detail, detailLoading, error } = useSelector((state) => state.history);
  useEffect(() => { dispatch(loadGameDetail(route.params.gameId)); }, [dispatch, route.params.gameId]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹  Lịch sử</Text></Pressable>
        <Text style={styles.title}>Chi tiết ván chơi</Text>
        {detailLoading ? <ActivityIndicator color="#176B5B" style={styles.loader} /> : null}
        {error && !detailLoading ? <View style={styles.state}><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Pressable onPress={() => dispatch(loadGameDetail(route.params.gameId))}><Text style={styles.backText}>Thử lại</Text></Pressable></View> : null}
        {detail?.game ? <View style={styles.summary}><Text style={styles.summaryLabel}>TRẠNG THÁI · {detail.game.status}</Text><Text style={styles.level}>Câu {detail.game.currentLevel}</Text><Text style={styles.prize}>{Number(detail.game.currentPrize).toLocaleString('vi-VN')} ₫</Text></View> : null}
        {(detail?.answers || []).map((answer, index) => <View key={`${answer.questionId}-${index}`} style={styles.answer}><View style={styles.answerHeader}><Text style={styles.answerLevel}>CÂU {answer.level}</Text><Text style={[styles.answerStatus, answer.isCorrect ? styles.correct : styles.wrong]}>{answer.isCorrect ? 'Đúng' : 'Sai'}</Text></View><Text style={styles.question}>{answer.question}</Text><Text style={styles.selected}>Bạn chọn: {answer.selectedAnswer}</Text></View>)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F4' }, content: { padding: 20, paddingBottom: 32 }, back: { minHeight: 44, justifyContent: 'center' }, backText: { color: '#176B5B', fontSize: 16, fontWeight: '700' }, title: { color: '#14251F', fontSize: 30, fontWeight: '700', marginBottom: 20 }, loader: { margin: 24 }, state: { alignItems: 'center', padding: 20 }, error: { color: '#B63838', marginBottom: 12 },
  summary: { borderRadius: 20, backgroundColor: '#176B5B', padding: 20, marginBottom: 16 }, summaryLabel: { color: '#D6F1E8', fontSize: 12, fontWeight: '700' }, level: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginTop: 12 }, prize: { color: '#FFFFFF', fontSize: 30, fontWeight: '700', marginTop: 8 },
  answer: { borderRadius: 18, backgroundColor: '#FFFFFF', padding: 16, marginBottom: 12 }, answerHeader: { flexDirection: 'row', justifyContent: 'space-between' }, answerLevel: { color: '#77847D', fontSize: 12, fontWeight: '700' }, answerStatus: { fontSize: 12, fontWeight: '700' }, correct: { color: '#176B5B' }, wrong: { color: '#B63838' }, question: { color: '#25362F', fontSize: 16, fontWeight: '700', lineHeight: 23, marginTop: 12 }, selected: { color: '#66736D', fontSize: 12, marginTop: 12 },
});
