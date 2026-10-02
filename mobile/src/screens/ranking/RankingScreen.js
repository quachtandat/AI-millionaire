import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loadRanking } from '../../redux/slices/rankingSlice';

export default function RankingScreen() {
  const dispatch = useDispatch();
  const { entries, loading, error } = useSelector((state) => state.ranking);
  useFocusEffect(useCallback(() => { dispatch(loadRanking()); }, [dispatch]));

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList data={entries} keyExtractor={(item, index) => `${item.rank}-${item.username}-${index}`} contentContainerStyle={styles.content}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.eyebrow}>CỘNG ĐỒNG</Text><Text style={styles.title}>Bảng xếp hạng</Text><Text style={styles.subtitle}>Thành tích cao nhất của người chơi.</Text></View>}
        renderItem={({ item }) => <View style={[styles.row, item.rank <= 3 && styles.topRow]}><View style={[styles.rank, item.rank === 1 && styles.first]}><Text style={[styles.rankText, item.rank === 1 && styles.firstText]}>{item.rank}</Text></View><View style={styles.player}><Text style={styles.name}>{item.username}</Text><Text style={styles.meta}>Mức cao nhất · {item.highestLevel}</Text></View><Text style={styles.prize}>{Number(item.highestPrize).toLocaleString('vi-VN')} ₫</Text></View>}
        ListEmptyComponent={!loading && !error ? <View style={styles.empty}><Text style={styles.emptyTitle}>Chưa có bảng xếp hạng</Text><Text style={styles.emptyCopy}>Hãy là người đầu tiên ghi dấu thành tích.</Text></View> : null}
        ListFooterComponent={error ? <View style={styles.state}><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Pressable onPress={() => dispatch(loadRanking())}><Text style={styles.retry}>Thử lại</Text></Pressable></View> : loading ? <ActivityIndicator color="#176B5B" style={styles.loader} /> : null}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(loadRanking())} tintColor="#176B5B" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F4' }, content: { padding: 20, paddingBottom: 28, flexGrow: 1 }, header: { marginBottom: 24 }, eyebrow: { color: '#176B5B', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 }, title: { color: '#14251F', fontSize: 30, fontWeight: '700', marginTop: 8 }, subtitle: { color: '#66736D', fontSize: 12, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 17, padding: 12, marginBottom: 12 }, topRow: { borderWidth: 1, borderColor: '#D8E8DF' }, rank: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#EEF3EF', justifyContent: 'center', alignItems: 'center' }, rankText: { color: '#52645B', fontSize: 16, fontWeight: '700' }, first: { backgroundColor: '#E6B954' }, firstText: { color: '#FFFFFF' }, player: { flex: 1, marginLeft: 12 }, name: { color: '#14251F', fontSize: 16, fontWeight: '700' }, meta: { color: '#77847D', fontSize: 12, marginTop: 4 }, prize: { color: '#176B5B', fontSize: 12, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 64 }, emptyTitle: { color: '#14251F', fontSize: 16, fontWeight: '700' }, emptyCopy: { color: '#66736D', fontSize: 12, textAlign: 'center', marginTop: 8 }, state: { alignItems: 'center', padding: 20 }, error: { color: '#B63838' }, retry: { color: '#176B5B', fontWeight: '700', padding: 16 }, loader: { margin: 20 },
});
