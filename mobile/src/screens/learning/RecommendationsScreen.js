import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { learningService } from '../../services/learning.service';
import { startSmartQuiz } from '../../redux/slices/gameSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function RecommendationsScreen({ navigation }) {
  const dispatch = useDispatch(); const [items, setItems] = useState([]); const [error, setError] = useState('');
  const { loading } = useSelector((state) => state.game);
  const load = useCallback(async () => { setError(''); try { const data = await learningService.getRecommendations(); setItems(data.recommendations || []); } catch (_) { setError('Không thể tải gợi ý ôn tập.'); } }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const start = async (categoryId) => { const result = await dispatch(startSmartQuiz(categoryId)); if (startSmartQuiz.fulfilled.match(result)) navigation.navigate('Game'); else setError(result.payload || 'Không thể bắt đầu luyện tập.'); };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={() => navigation.goBack()}><Text style={styles.link}>‹  Quay lại</Text></Pressable><Text style={styles.title}>Gợi ý ôn tập</Text>
    {error ? <Pressable onPress={load}><Text style={styles.error}>{error} Thử lại</Text></Pressable> : null}
    {!items.length && !error ? <View style={styles.card}><Text style={styles.body}>Chưa đủ dữ liệu để cá nhân hóa gợi ý. Hãy chơi thêm vài câu hỏi.</Text><Pressable onPress={() => start(null)} disabled={loading} style={styles.button}><Text style={styles.buttonText}>{loading ? 'ĐANG TẠO…' : 'BẮT ĐẦU LUYỆN TẬP'}</Text></Pressable></View> : null}
    {items.map((item) => <View key={item.categoryId} style={styles.card}><Text style={styles.heading}>{item.categoryName}</Text><Text style={styles.meta}>Mức độ đề xuất: {item.difficulty}</Text><Text style={styles.body}>{item.reason}</Text><Pressable onPress={() => start(item.categoryId)} disabled={loading} style={[styles.button, loading && styles.disabled]}><Text style={styles.buttonText}>{loading ? 'ĐANG TẠO…' : 'LUYỆN CHỦ ĐỀ NÀY'}</Text></Pressable></View>)}
    {loading ? <ActivityIndicator color="#176B5B" style={styles.loader} /> : null}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#F5F7F4' }, content: { padding: 20, paddingBottom: 36 }, link: { color: '#176B5B', fontWeight: '700', minHeight: 40, textAlignVertical: 'center' }, title: { color: '#14251F', fontSize: 28, fontWeight: '700', marginVertical: 18 }, card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, marginBottom: 14 }, heading: { color: '#14251F', fontSize: 18, fontWeight: '700' }, meta: { color: '#176B5B', fontSize: 13, marginTop: 8 }, body: { color: '#52645B', fontSize: 14, lineHeight: 21, marginTop: 10 }, button: { minHeight: 46, backgroundColor: '#176B5B', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16 }, buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 }, disabled: { opacity: 0.6 }, error: { color: '#B63838', padding: 14 }, loader: { margin: 20 } });
