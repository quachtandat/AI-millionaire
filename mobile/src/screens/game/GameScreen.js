import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { activateLifeline, answerQuestion, clearGameError, clearLifelineResult, stopGame, timeoutCurrentGame } from '../../redux/slices/gameSlice';
import PrizeLadder from '../../components/PrizeLadder';
import QuestionOption from '../../components/QuestionOption';
import LifelineButton from '../../components/LifelineButton';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function GameScreen({ navigation }) {
  const [lifelineDisplay, setLifelineDisplay] = useState(null);
  const dispatch = useDispatch();
  const { game, currentQuestion, currentLevel, currentPrize, lifelines, removedOptions, answerResult, answering, timingOut, lifelineLoading, error } = useSelector((state) => state.game);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const busy = answering || timingOut || lifelineLoading || timeRemaining === 0;
  const confirmStop = useCallback(() => {
    if (busy) {
      Alert.alert('Đang xử lý', 'Hãy chờ câu trả lời hiện tại hoàn tất rồi thử lại.');
      return;
    }
    Alert.alert('Dừng cuộc chơi?', 'Bạn có chắc muốn dừng cuộc chơi?', [
      { text: 'Tiếp tục chơi', style: 'cancel' },
      { text: 'Dừng chơi', style: 'destructive', onPress: () => dispatch(stopGame()) },
    ]);
  }, [busy, dispatch]);
  useEffect(() => navigation.addListener('beforeRemove', (event) => {
    if (game?.status !== 'playing') return;
    event.preventDefault();
    confirmStop();
  }), [confirmStop, game?.status, navigation]);

  useEffect(() => {
    if (answerResult?.gameOver) navigation.replace('Result');
  }, [answerResult?.gameOver, navigation]);

  useEffect(() => {
    setTimeRemaining(60);
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (!currentQuestion?.id || game?.status !== 'playing') return undefined;
    const questionStartedAt = Date.now();
    let timeoutRequestPending = false;
    let retryTimeoutAt = 0;
    const updateTimer = () => {
      const remaining = Math.max(60 - Math.floor((Date.now() - questionStartedAt) / 1000), 0);
      setTimeRemaining(remaining);
      if (remaining === 0 && !timeoutRequestPending && Date.now() >= retryTimeoutAt) {
        timeoutRequestPending = true;
        dispatch(timeoutCurrentGame({ expectedLevel: currentLevel })).unwrap().catch(() => {
          timeoutRequestPending = false;
          retryTimeoutAt = Date.now() + 5000;
        });
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentQuestion?.id, currentLevel, game?.status, dispatch]);

  const answer = (letter) => {
    dispatch(clearGameError());
    dispatch(answerQuestion(letter));
  };

  const activate = async (kind) => {
    dispatch(clearGameError());
    try {
      const result = await dispatch(activateLifeline(kind)).unwrap();
      dispatch(clearLifelineResult());
      setLifelineDisplay({ kind, result: result.result });
    } catch (_) {
      // The API error is shown in the game screen.
    }
  };

  if (!currentQuestion) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator size="large" color="#176B5B" /><Text style={styles.body}>Đang tải câu hỏi…</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topline}><View><Text style={styles.eyebrow}>CÂU HỎI {currentLevel} / 15</Text><Text style={styles.prize}>{Number(currentPrize).toLocaleString('vi-VN')} ₫</Text></View><View style={[styles.timerBadge, timeRemaining <= 10 && styles.timerUrgent]}><Text style={[styles.timerText, timeRemaining <= 10 && styles.timerTextUrgent]}>◷  {timeRemaining}s</Text></View></View>
        <View style={styles.timerTrack}><View style={[styles.timerProgress, timeRemaining <= 10 && styles.timerProgressUrgent, { width: `${(timeRemaining / 60) * 100}%` }]} /></View>
        <PrizeLadder currentLevel={currentLevel} />
        <View style={styles.questionCard}><Text style={styles.question}>{currentQuestion.text}</Text></View>
        {answerResult?.isCorrect && !answerResult?.gameOver ? <View accessibilityRole="alert" style={styles.success}><Text style={styles.successText}>✓  Chính xác! Bạn đã lên câu {currentLevel}.</Text></View> : null}
        <View style={styles.options}>
          {OPTION_LABELS.map((letter) => <QuestionOption key={letter} letter={letter} text={currentQuestion.options[letter]} removed={removedOptions.includes(letter)} disabled={busy} onPress={() => answer(letter)} />)}
        </View>
        {answering ? <View style={styles.inlineLoading}><ActivityIndicator color="#176B5B" /><Text style={styles.body}>Đang kiểm tra đáp án…</Text></View> : timingOut ? <View style={styles.inlineLoading}><ActivityIndicator color="#B63838" /><Text style={styles.body}>Hết giờ. Đang lưu kết quả…</Text></View> : null}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Text style={styles.lifelineHeading}>QUYỀN TRỢ GIÚP</Text>
        <View style={styles.lifelines}>
          {[
            ['fifty-fifty', '50:50'], ['audience', 'Khán giả'], ['phone', 'Gọi điện'],
          ].map(([kind, label]) => <LifelineButton key={kind} title={label} used={lifelines[kind]} disabled={busy} onPress={() => activate(kind)} />)}
        </View>
        <Pressable accessibilityRole="button" disabled={busy} onPress={confirmStop} style={styles.stop}><Text style={styles.stopText}>DỪNG CHƠI</Text></Pressable>
      </ScrollView>
      <Modal transparent visible={Boolean(lifelineDisplay)} animationType="fade" onRequestClose={() => setLifelineDisplay(null)}>
        <View style={styles.modalShade}><View style={styles.modalCard}>
          <Pressable accessibilityRole="button" onPress={() => setLifelineDisplay(null)} style={styles.modalClose}><Text style={styles.modalCloseText}>Đóng</Text></Pressable>
          <Text style={styles.modalTitle}>{lifelineDisplay?.kind === 'audience' ? 'Ý kiến khán giả' : lifelineDisplay?.kind === 'phone' ? 'Gọi điện thoại' : '50:50'}</Text>
          {lifelineDisplay?.kind === 'audience' ? OPTION_LABELS.map((letter) => {
            const value = Number(lifelineDisplay.result.percentages?.[letter] || 0);
            return <View key={letter} style={styles.barRow}><Text style={styles.barLetter}>{letter}</Text><View style={styles.barTrack}><View style={[styles.barFill, { width: `${value}%` }]} /></View><Text style={styles.barValue}>{value}%</Text></View>;
          }) : <Text style={styles.modalBody}>{lifelineDisplay?.kind === 'phone' ? lifelineDisplay.result.advice : `Đã loại đáp án ${lifelineDisplay?.result.removedOptions?.join(' và ') || ''}.`}</Text>}
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F4' }, content: { padding: 20, paddingBottom: 32 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }, eyebrow: { color: '#176B5B', fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }, prize: { color: '#14251F', fontSize: 22, fontWeight: '700', marginTop: 8 }, levelBadge: { minHeight: 40, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#E2EFE8', justifyContent: 'center' }, levelText: { color: '#176B5B', fontSize: 12, fontWeight: '700' },
  timerBadge: { minWidth: 68, minHeight: 40, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#E2EFE8', alignItems: 'center', justifyContent: 'center' }, timerUrgent: { backgroundColor: '#FBE6E4' }, timerText: { color: '#176B5B', fontSize: 14, fontWeight: '700' }, timerTextUrgent: { color: '#B63838' }, timerTrack: { height: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: '#E2E9E4', marginTop: -12, marginBottom: 16 }, timerProgress: { height: '100%', backgroundColor: '#176B5B' }, timerProgressUrgent: { backgroundColor: '#B63838' },
  questionCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 24, minHeight: 132, justifyContent: 'center', shadowColor: '#153D31', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2 }, question: { color: '#14251F', fontSize: 22, fontWeight: '700', lineHeight: 29 },
  options: { gap: 12, marginTop: 20 }, option: { minHeight: 58, flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#DCE4DE', backgroundColor: '#FFFFFF', paddingHorizontal: 16 }, optionPressed: { borderColor: '#176B5B', backgroundColor: '#E8F3EE' }, optionRemoved: { opacity: 0.35 }, optionBusy: { opacity: 0.6 }, optionLetter: { width: 32, color: '#176B5B', fontSize: 16, fontWeight: '700' }, optionText: { flex: 1, color: '#25362F', fontSize: 16, lineHeight: 22 },
  inlineLoading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }, body: { color: '#66736D', fontSize: 12 }, error: { color: '#B63838', fontSize: 12, marginTop: 12 }, lifelineHeading: { color: '#77847D', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 24, marginBottom: 12 }, lifelines: { flexDirection: 'row', gap: 8 }, lifeline: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BED7CC', backgroundColor: '#FFFFFF' }, lifelineUsed: { backgroundColor: '#E6EBE8', borderColor: '#E6EBE8' }, lifelineText: { color: '#176B5B', fontSize: 12, fontWeight: '700' }, lifelineTextUsed: { color: '#7E8983' }, stop: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: '#D8DFDA', alignItems: 'center', justifyContent: 'center', marginTop: 20 }, stopText: { color: '#52645B', fontSize: 12, fontWeight: '700' },
  success: { backgroundColor: '#DFF1E7', padding: 12, borderRadius: 14, marginTop: 12 }, successText: { color: '#176B5B', fontSize: 12, fontWeight: '700' },
  modalShade: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(12, 29, 22, 0.45)', padding: 24 }, modalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24 }, modalClose: { alignSelf: 'flex-end', minHeight: 40, justifyContent: 'center', paddingHorizontal: 8 }, modalCloseText: { color: '#176B5B', fontWeight: '700' }, modalTitle: { color: '#14251F', fontSize: 22, fontWeight: '700', marginBottom: 20 }, modalBody: { color: '#52645B', fontSize: 16, lineHeight: 24 }, barRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }, barLetter: { width: 20, color: '#52645B', fontWeight: '700' }, barTrack: { flex: 1, height: 16, borderRadius: 8, backgroundColor: '#E7ECE8', overflow: 'hidden' }, barFill: { height: '100%', borderRadius: 8, backgroundColor: '#176B5B' }, barValue: { width: 40, textAlign: 'right', color: '#25362F', fontSize: 12, fontWeight: '700' },
});
