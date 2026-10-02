import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { loadHistory } from '../../redux/slices/historySlice';
import { useFocusEffect } from '@react-navigation/native';
import EmptyState from '../../components/EmptyState';
import { clearGameError, startGame } from '../../redux/slices/gameSlice';

const statusLabel = { won: 'Đã thắng', lost: 'Đã thua', stopped: 'Đã dừng', playing: 'Đang chơi' };

export default function HistoryScreen({ navigation }) {
  const dispatch = useDispatch();
  const { games, loading, error } = useSelector((state) => state.history);
  const { loading: startingGame, error: gameError } = useSelector((state) => state.game);
  useFocusEffect(useCallback(() => { dispatch(loadHistory()); }, [dispatch]));

  const startFromEmpty = async () => {
    dispatch(clearGameError());
    const result = await dispatch(startGame());
    if (startGame.fulfilled.match(result)) navigation.navigate('Game');
  };

  const renderItem = ({ item }) => (
    <Pressable accessibilityRole="button" onPress={() => navigation.navigate('GameDetail', { gameId: item.gameId })} style={styles.row}>
      <View style={styles.rowTop}><Text style={styles.gameId}>GAME #{item.gameId}</Text><Text style={styles.status}>{statusLabel[item.status] || item.status}</Text></View>
      <View style={styles.rowBottom}><Text style={styles.level}>Câu {item.currentLevel}</Text><Text style={styles.prize}>{Number(item.currentPrize).toLocaleString('vi-VN')} ₫</Text></View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList data={games} keyExtractor={(item) => String(item.gameId)} renderItem={renderItem} contentContainerStyle={styles.content}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.eyebrow}>THÀNH TÍCH CỦA BẠN</Text><Text style={styles.title}>Lịch sử chơi</Text></View>}
        ListEmptyComponent={!loading && !error ? <EmptyState title="Chưa có phiên chơi nào" message={gameError || 'Bắt đầu ván đầu tiên để lưu lại hành trình của bạn.'} actionTitle="CHƠI NGAY" onAction={startFromEmpty} loading={startingGame} /> : null}
        ListFooterComponent={error ? <View style={styles.state}><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Pressable onPress={() => dispatch(loadHistory())}><Text style={styles.retry}>Thử lại</Text></Pressable></View> : loading ? <ActivityIndicator color="#176B5B" style={styles.loader} /> : null}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(loadHistory())} tintColor="#176B5B" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F4' }, content: { padding: 20, paddingBottom: 28, flexGrow: 1 }, header: { marginBottom: 24 }, eyebrow: { color: '#176B5B', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 }, title: { color: '#14251F', fontSize: 30, fontWeight: '700', marginTop: 8 },
  row: { borderRadius: 18, backgroundColor: '#FFFFFF', padding: 16, marginBottom: 12 }, rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, gameId: { color: '#77847D', fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }, status: { color: '#176B5B', fontSize: 12, fontWeight: '700' }, rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }, level: { color: '#25362F', fontSize: 16 }, prize: { color: '#176B5B', fontSize: 16, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28, paddingBottom: 64 }, emptyIcon: { color: '#176B5B', fontSize: 30 }, emptyTitle: { color: '#14251F', fontSize: 22, fontWeight: '700', marginTop: 16 }, emptyCopy: { color: '#66736D', fontSize: 12, lineHeight: 21, textAlign: 'center', marginTop: 8 }, state: { alignItems: 'center', padding: 20 }, error: { color: '#B63838', textAlign: 'center', fontSize: 12 }, retry: { color: '#176B5B', fontSize: 12, fontWeight: '700', padding: 16 }, loader: { margin: 20 },
});
