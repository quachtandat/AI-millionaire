import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { learningService } from '../../services/learning.service';

function ScoreRow({ label, score, detail }) {
  const percent = Math.max(0, Math.min(100, Number(score || 0)));
  return <View style={styles.row}><View style={styles.rowHeader}><Text style={styles.name}>{label}</Text><Text style={styles.value}>{percent.toFixed(1)}%{detail ? ` · ${detail}` : ''}</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${percent}%` }]} /></View></View>;
}

export default function PerformanceScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(''); try { setData(await learningService.getPerformance()); } catch (_) { setError('Không thể tải phân tích. Hãy thử lại.'); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={() => navigation.goBack()}><Text style={styles.link}>‹  Quay lại</Text></Pressable>
    <Text style={styles.title}>Hiệu suất của bạn</Text>
    {loading && !data ? <ActivityIndicator color="#176B5B" style={styles.loader} /> : null}
    {error ? <Pressable onPress={load}><Text style={styles.error}>{error}  ·  Thử lại</Text></Pressable> : null}
    {data ? <>
      <View style={styles.cards}><View style={styles.card}><Text style={styles.cardValue}>{data.overall.accuracy ?? 0}%</Text><Text style={styles.caption}>Độ chính xác</Text></View><View style={styles.card}><Text style={styles.cardValue}>{data.overall.gamesPlayed ?? 0}</Text><Text style={styles.caption}>Ván chơi</Text></View><View style={styles.card}><Text style={styles.cardValue}>{data.responseTime.averageResponseTime == null ? '—' : `${data.responseTime.averageResponseTime}s`}</Text><Text style={styles.caption}>Thời gian TB</Text></View><View style={styles.card}><Text style={styles.cardValue}>{Number(data.overall.highestPrize || 0).toLocaleString('vi-VN')} ₫</Text><Text style={styles.caption}>Mốc thưởng cao nhất</Text></View></View>
      <View style={styles.panel}><Text style={styles.heading}>Theo danh mục</Text>{data.categories.length ? data.categories.map((item) => <ScoreRow key={item.categoryId} label={item.categoryName} score={item.accuracy} detail={`${item.correctAnswers}/${item.totalAnswers}`} />) : <Text style={styles.empty}>Chơi vài ván để xem tiến độ theo danh mục.</Text>}</View>
      <View style={styles.panel}><Text style={styles.heading}>Theo độ khó</Text>{data.difficulties.length ? data.difficulties.map((item) => <ScoreRow key={item.difficulty} label={item.difficulty} score={item.accuracy} detail={`${item.totalAnswers} câu`} />) : <Text style={styles.empty}>Chưa có câu trả lời được ghi nhận.</Text>}</View>
      <Text style={styles.caption}>Nhanh nhất: {data.responseTime.fastestAnswer == null ? '—' : `${data.responseTime.fastestAnswer}s`}  ·  Chậm nhất: {data.responseTime.slowestAnswer == null ? '—' : `${data.responseTime.slowestAnswer}s`}</Text>
    </> : null}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#F5F7F4' }, content: { padding: 20, paddingBottom: 36 }, title: { color: '#14251F', fontSize: 28, fontWeight: '700', marginVertical: 18 }, link: { color: '#176B5B', fontWeight: '700', minHeight: 40, textAlignVertical: 'center' }, loader: { margin: 32 }, error: { color: '#B63838', paddingVertical: 16 }, cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, card: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, minHeight: 90, justifyContent: 'center' }, cardValue: { color: '#176B5B', fontSize: 18, fontWeight: '700' }, caption: { color: '#66736D', fontSize: 12, marginTop: 6 }, panel: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, marginTop: 16 }, heading: { color: '#14251F', fontSize: 17, fontWeight: '700', marginBottom: 12 }, row: { marginVertical: 9 }, rowHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, name: { color: '#25362F', fontWeight: '600', flex: 1 }, value: { color: '#66736D', fontSize: 12 }, track: { height: 7, borderRadius: 4, backgroundColor: '#E7ECE8', marginTop: 7, overflow: 'hidden' }, fill: { height: '100%', borderRadius: 4, backgroundColor: '#176B5B' }, empty: { color: '#78857E', fontSize: 13, paddingVertical: 12 } });
