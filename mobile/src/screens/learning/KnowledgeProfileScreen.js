import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { learningService } from '../../services/learning.service';

function Topic({ item }) { return <View style={styles.topic}><View style={styles.topicTop}><Text style={styles.topicName}>{item.categoryName}</Text><Text style={styles.score}>{item.accuracy}%</Text></View><Text style={styles.meta}>{item.correctAnswers} đúng trong {item.totalAnswers} câu</Text></View>; }

export default function KnowledgeProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(''); try { setProfile(await learningService.getKnowledgeProfile()); } catch (_) { setError('Không thể tải hồ sơ kiến thức.'); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={() => navigation.goBack()}><Text style={styles.link}>‹  Quay lại</Text></Pressable><Text style={styles.title}>Hồ sơ kiến thức</Text>
    {loading && !profile ? <ActivityIndicator color="#176B5B" style={styles.loader} /> : null}{error ? <Pressable onPress={load}><Text style={styles.error}>{error} Thử lại</Text></Pressable> : null}
    {profile ? <><View style={styles.scoreCard}><Text style={styles.scoreLabel}>ĐỘ CHÍNH XÁC TỔNG</Text><Text style={styles.overall}>{profile.overallScore}%</Text><Text style={styles.meta}>Tính từ các câu trả lời đã lưu</Text></View>
      <View style={styles.panel}><Text style={styles.heading}>Chủ đề vững</Text>{profile.strongTopics.length ? profile.strongTopics.map((item) => <Topic key={item.categoryId} item={item} />) : <Text style={styles.empty}>Chưa có chủ đề đạt 80% với dữ liệu hiện có.</Text>}</View>
      <View style={styles.panel}><Text style={styles.heading}>Chủ đề cần cải thiện</Text>{profile.weakTopics.length ? profile.weakTopics.map((item) => <Topic key={item.categoryId} item={item} />) : <Text style={styles.empty}>Chưa xác định được điểm yếu; cần thêm câu trả lời.</Text>}</View>
      <View style={styles.panel}><Text style={styles.heading}>Theo độ khó</Text>{profile.difficulties.map((item) => <Topic key={item.difficulty} item={{ categoryName: item.difficulty, accuracy: item.accuracy, correctAnswers: item.correctAnswers, totalAnswers: item.totalAnswers }} />)}</View>
    </> : null}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#F5F7F4' }, content: { padding: 20, paddingBottom: 36 }, link: { color: '#176B5B', fontWeight: '700', minHeight: 40, textAlignVertical: 'center' }, title: { color: '#14251F', fontSize: 28, fontWeight: '700', marginVertical: 18 }, scoreCard: { backgroundColor: '#176B5B', borderRadius: 22, padding: 24, alignItems: 'center' }, scoreLabel: { color: '#D6F1E8', fontSize: 12, fontWeight: '700' }, overall: { color: '#FFFFFF', fontSize: 42, fontWeight: '700', marginVertical: 8 }, meta: { color: '#78857E', fontSize: 12, marginTop: 5 }, panel: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, marginTop: 16 }, heading: { color: '#14251F', fontSize: 17, fontWeight: '700', marginBottom: 12 }, topic: { borderTopWidth: 1, borderTopColor: '#E7ECE8', paddingVertical: 12 }, topicTop: { flexDirection: 'row', justifyContent: 'space-between' }, topicName: { color: '#25362F', fontSize: 14, fontWeight: '600' }, score: { color: '#176B5B', fontWeight: '700' }, empty: { color: '#78857E', fontSize: 13, lineHeight: 20 }, loader: { margin: 28 }, error: { color: '#B63838', padding: 16 } });
