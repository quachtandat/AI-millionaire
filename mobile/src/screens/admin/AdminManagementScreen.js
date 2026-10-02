import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { logoutUser } from '../../redux/slices/authSlice';
import { clearAdminError, createAdminCategory, deleteAdminQuestion, generateAIDrafts, loadAdminData, loadAdminQuestion, reviewAIDraft, saveAdminQuestion } from '../../redux/slices/adminSlice';

const DIFFICULTY_BY_LEVEL = { 1: 'easy', 2: 'easy', 3: 'easy', 4: 'easy', 5: 'medium', 6: 'medium', 7: 'medium', 8: 'medium', 9: 'medium', 10: 'hard', 11: 'hard', 12: 'hard', 13: 'hard', 14: 'hard', 15: 'hard' };
const emptyForm = { id: null, question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', category_id: null, prize_level: 1, explanation: '', status: 'approved' };

function FilterRow({ title, options, selected, onSelect }) {
  return <View style={styles.filterGroup}><Text style={styles.filterLabel}>{title}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChoices}>{options.map(([label, value]) => <Pressable key={`${title}-${label}`} accessibilityRole="button" onPress={() => onSelect(value)} style={[styles.filterChip, String(selected ?? '') === String(value) && styles.filterChipSelected]}><Text style={[styles.filterChipText, String(selected ?? '') === String(value) && styles.filterChipTextSelected]}>{label}</Text></Pressable>)}</ScrollView></View>;
}

export default function AdminManagementScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { categories, questions, drafts, pagination, filters, loading, loadingQuestion, saving, error } = useSelector((state) => state.admin);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategoryId, setAiCategoryId] = useState(null);
  const [aiLevel, setAiLevel] = useState(1);
  const [aiCount, setAiCount] = useState('3');
  const [form, setForm] = useState(emptyForm);
  const [editorOpen, setEditorOpen] = useState(false);

  useFocusEffect(useCallback(() => { dispatch(loadAdminData({ page: 1, filters: filtersRef.current })); }, [dispatch]));

  const chooseFilter = (key, value) => {
    const nextFilters = { ...filters };
    if (value === '' || value === null) delete nextFilters[key];
    else nextFilters[key] = value;
    dispatch(loadAdminData({ page: 1, filters: nextFilters }));
  };

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const openNewQuestion = () => {
    dispatch(clearAdminError());
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? null });
    setEditorOpen(true);
  };
  const openEditQuestion = async (question) => {
    dispatch(clearAdminError());
    try {
      const fullQuestion = await dispatch(loadAdminQuestion(question.id)).unwrap();
      setForm({ ...emptyForm, ...fullQuestion, category_id: fullQuestion.category_id, prize_level: Number(fullQuestion.prize_level) });
      setEditorOpen(true);
    } catch (_) {}
  };

  const addCategory = async () => {
    const name = categoryName.trim();
    if (!name) return;
    try {
      await dispatch(createAdminCategory({ name, description: categoryDescription.trim() })).unwrap();
      setCategoryName('');
      setCategoryDescription('');
      setCategoryModalOpen(false);
    } catch (_) {}
  };

  const generateQuestionsWithAI = async () => {
    const count = Number(aiCount);
    if (!aiTopic.trim() || !aiCategoryId || !Number.isInteger(count) || count < 1 || count > 10) {
      Alert.alert('Kiểm tra thông tin', 'Nhập chủ đề, chọn danh mục và số lượng từ 1 đến 10.');
      return;
    }
    try {
      await dispatch(generateAIDrafts({ topic: aiTopic.trim(), category_id: Number(aiCategoryId), prize_level: aiLevel, difficulty: DIFFICULTY_BY_LEVEL[aiLevel], count, language: 'vi' })).unwrap();
      setAiTopic('');
      setAiModalOpen(false);
    } catch (_) {}
  };

  const saveQuestion = async () => {
    const payload = {
      ...form,
      category_id: Number(form.category_id),
      prize_level: Number(form.prize_level),
      difficulty: DIFFICULTY_BY_LEVEL[form.prize_level],
    };
    if (!payload.question.trim() || !payload.option_a.trim() || !payload.option_b.trim() || !payload.option_c.trim() || !payload.option_d.trim() || !payload.category_id) {
      Alert.alert('Thiếu thông tin', 'Nhập câu hỏi, đủ bốn đáp án và chọn danh mục.');
      return;
    }
    try {
      await dispatch(saveAdminQuestion(payload)).unwrap();
      setEditorOpen(false);
    } catch (_) {}
  };

  const confirmDelete = (question) => Alert.alert('Xóa câu hỏi?', 'Thao tác này sẽ xóa câu hỏi khỏi ngân hàng.', [
    { text: 'Hủy', style: 'cancel' },
    { text: 'Xóa', style: 'destructive', onPress: () => dispatch(deleteAdminQuestion(question.id)) },
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View><Text style={styles.kicker}>AI MILLIONAIRE · QUẢN TRỊ</Text><Text style={styles.title}>Quản lý nội dung</Text><Text style={styles.subtitle}>Xin chào, {user?.username || 'Admin'}</Text></View>
          <Pressable accessibilityRole="button" onPress={() => dispatch(logoutUser())} style={styles.logout}><Text style={styles.logoutText}>Thoát</Text></Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Câu hỏi AI chờ duyệt</Text><Text style={styles.muted}>{drafts.length} bản nháp</Text></View><Pressable accessibilityRole="button" onPress={() => { dispatch(clearAdminError()); setAiCategoryId(categories[0]?.id ?? null); setAiModalOpen(true); }} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Tạo bằng AI</Text></Pressable></View>
          {drafts.map((draft) => <View key={`draft-${draft.id}`} style={styles.draftCard}>
            <Text style={styles.questionText}>{draft.question}</Text>
            <Text style={styles.draftAnswer}>Đáp án đúng: {draft.correct_answer} · Câu {draft.prize_level}</Text>
            <View style={styles.questionActions}><Pressable accessibilityRole="button" disabled={saving} onPress={() => dispatch(reviewAIDraft({ id: draft.id, action: 'reject' }))} style={[styles.actionButton, styles.deleteButton]}><Text style={styles.deleteText}>Từ chối</Text></Pressable><Pressable accessibilityRole="button" disabled={saving} onPress={() => dispatch(reviewAIDraft({ id: draft.id, action: 'approve' }))} style={[styles.actionButton, styles.approveButton]}><Text style={styles.approveText}>Duyệt</Text></Pressable></View>
          </View>)}
          {!loading && drafts.length === 0 ? <Text style={styles.empty}>Không có bản nháp AI cần duyệt.</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <Pressable accessibilityRole="button" onPress={() => { dispatch(clearAdminError()); setCategoryModalOpen(true); }} style={styles.primaryButton}><Text style={styles.primaryButtonText}>＋ Thêm danh mục</Text></Pressable>
          <View style={styles.chips}>{categories.map((category) => <View key={category.id} style={styles.categoryChip}><Text style={styles.categoryText}>{category.name}</Text></View>)}</View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Ngân hàng câu hỏi</Text><Text style={styles.muted}>{pagination?.total ?? questions.length} câu hỏi</Text></View><Pressable accessibilityRole="button" onPress={openNewQuestion} style={styles.primaryButton}><Text style={styles.primaryButtonText}>＋ Tạo câu hỏi</Text></Pressable></View>
          <Text style={styles.filterHeading}>Lọc câu hỏi</Text>
          <FilterRow title="Danh mục" selected={filters.category_id} onSelect={(value) => chooseFilter('category_id', value)} options={[[ 'Tất cả', '' ], ...categories.map((category) => [category.name, String(category.id)])]} />
          <FilterRow title="Độ khó" selected={filters.difficulty} onSelect={(value) => chooseFilter('difficulty', value)} options={[[ 'Tất cả', '' ], ['Dễ', 'easy'], ['Trung bình', 'medium'], ['Khó', 'hard']]} />
          <FilterRow title="Mức câu" selected={filters.prize_level} onSelect={(value) => chooseFilter('prize_level', value)} options={[[ 'Tất cả', '' ], ...Array.from({ length: 15 }, (_, index) => [`Câu ${index + 1}`, String(index + 1)])]} />
          <FilterRow title="Trạng thái" selected={filters.status} onSelect={(value) => chooseFilter('status', value)} options={[[ 'Tất cả', '' ], ['Đã duyệt', 'approved'], ['Bản nháp', 'draft'], ['Từ chối', 'rejected']]} />
          <FilterRow title="Nguồn câu hỏi" selected={filters.source} onSelect={(value) => chooseFilter('source', value)} options={[[ 'Tất cả', '' ], ['Admin', 'admin'], ['AI', 'ai']]} />
          {Object.keys(filters).length > 0 ? <Pressable accessibilityRole="button" onPress={() => dispatch(loadAdminData({ page: 1, filters: {} }))} style={styles.clearFilters}><Text style={styles.actionText}>Xóa bộ lọc</Text></Pressable> : null}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {loading && questions.length === 0 ? <ActivityIndicator color="#176B5B" style={styles.loader} /> : null}
          {!loading && questions.length === 0 ? <Text style={styles.empty}>Chưa có câu hỏi để hiển thị.</Text> : null}
          {questions.map((question) => <View key={String(question.id)} style={styles.questionCard}>
            <View style={styles.questionMeta}><Text style={styles.metaText}>#{question.id} · Câu {question.prize_level} · {question.category_name || 'Chưa phân loại'}</Text><Text style={styles.status}>{question.status}</Text></View>
            <Text style={styles.questionText}>{question.question}</Text>
            <View style={styles.questionActions}><Pressable accessibilityRole="button" onPress={() => openEditQuestion(question)} style={styles.actionButton}><Text style={styles.actionText}>Chỉnh sửa</Text></Pressable><Pressable accessibilityRole="button" onPress={() => confirmDelete(question)} style={[styles.actionButton, styles.deleteButton]}><Text style={styles.deleteText}>Xóa</Text></Pressable></View>
          </View>)}
          {pagination && pagination.page < pagination.totalPages ? <Pressable accessibilityRole="button" disabled={loading} onPress={() => dispatch(loadAdminData({ page: pagination.page + 1, filters }))} style={styles.moreButton}><Text style={styles.actionText}>{loading ? 'Đang tải…' : 'Tải thêm câu hỏi'}</Text></Pressable> : null}
          <Pressable accessibilityRole="button" disabled={loading} onPress={() => dispatch(loadAdminData({ page: 1, filters }))} style={styles.refresh}><Text style={styles.actionText}>Làm mới dữ liệu</Text></Pressable>
        </View>
      </ScrollView>

      <Modal visible={editorOpen} animationType="slide" onRequestClose={() => setEditorOpen(false)}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.editor} keyboardShouldPersistTaps="handled">
            <View style={styles.sectionHeader}><Text style={styles.title}>{form.id ? 'Sửa câu hỏi' : 'Tạo câu hỏi'}</Text><Pressable accessibilityRole="button" onPress={() => setEditorOpen(false)} style={styles.close}><Text style={styles.actionText}>Đóng</Text></Pressable></View>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <Text style={styles.label}>Nội dung câu hỏi</Text><TextInput value={form.question} onChangeText={(value) => updateForm('question', value)} multiline placeholder="Nhập nội dung câu hỏi" style={[styles.input, styles.multiline]} />
            {['a', 'b', 'c', 'd'].map((letter) => <View key={letter}><Text style={styles.label}>Đáp án {letter.toUpperCase()}</Text><TextInput value={form[`option_${letter}`]} onChangeText={(value) => updateForm(`option_${letter}`, value)} placeholder={`Nhập đáp án ${letter.toUpperCase()}`} style={styles.input} /></View>)}
            <Text style={styles.label}>Đáp án đúng</Text><View style={styles.chips}>{['A', 'B', 'C', 'D'].map((answer) => <Pressable key={answer} onPress={() => updateForm('correct_answer', answer)} style={[styles.choice, form.correct_answer === answer && styles.choiceSelected]}><Text style={[styles.choiceText, form.correct_answer === answer && styles.choiceTextSelected]}>{answer}</Text></Pressable>)}</View>
            <Text style={styles.label}>Danh mục</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{categories.map((category) => <Pressable key={category.id} onPress={() => updateForm('category_id', category.id)} style={[styles.choice, String(form.category_id) === String(category.id) && styles.choiceSelected]}><Text style={[styles.choiceText, String(form.category_id) === String(category.id) && styles.choiceTextSelected]}>{category.name}</Text></Pressable>)}</ScrollView>
            <Text style={styles.label}>Mức câu hỏi</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{Array.from({ length: 15 }, (_, index) => index + 1).map((level) => <Pressable key={level} onPress={() => updateForm('prize_level', level)} style={[styles.choice, Number(form.prize_level) === level && styles.choiceSelected]}><Text style={[styles.choiceText, Number(form.prize_level) === level && styles.choiceTextSelected]}>{level}</Text></Pressable>)}</ScrollView>
            <Text style={styles.muted}>Độ khó: {DIFFICULTY_BY_LEVEL[form.prize_level]}</Text>
            <Text style={styles.label}>Giải thích (không bắt buộc)</Text><TextInput value={form.explanation || ''} onChangeText={(value) => updateForm('explanation', value)} multiline placeholder="Giải thích đáp án" style={[styles.input, styles.multilineSmall]} />
            <Pressable accessibilityRole="button" disabled={saving} onPress={saveQuestion} style={[styles.primaryButton, styles.saveButton, saving && styles.disabled]}><Text style={styles.primaryButtonText}>{saving ? 'ĐANG LƯU…' : 'LƯU CÂU HỎI'}</Text></Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={categoryModalOpen} transparent animationType="fade" onRequestClose={() => setCategoryModalOpen(false)}>
        <View style={styles.modalShade}><View style={styles.categoryModal}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Thêm danh mục</Text><Pressable accessibilityRole="button" onPress={() => setCategoryModalOpen(false)} style={styles.close}><Text style={styles.actionText}>Đóng</Text></Pressable></View>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Text style={styles.label}>Tên danh mục</Text><TextInput accessibilityLabel="Tên danh mục" autoFocus value={categoryName} onChangeText={setCategoryName} placeholder="Ví dụ: Lịch sử Việt Nam" style={styles.input} returnKeyType="next" />
          <Text style={styles.label}>Mô tả (không bắt buộc)</Text><TextInput accessibilityLabel="Mô tả danh mục" value={categoryDescription} onChangeText={setCategoryDescription} placeholder="Mô tả ngắn về danh mục" style={[styles.input, styles.multilineSmall]} multiline />
          <Pressable accessibilityRole="button" disabled={saving || !categoryName.trim()} onPress={addCategory} style={[styles.primaryButton, styles.saveButton, (saving || !categoryName.trim()) && styles.disabled]}><Text style={styles.primaryButtonText}>{saving ? 'ĐANG THÊM…' : 'THÊM DANH MỤC'}</Text></Pressable>
        </View></View>
      </Modal>

      <Modal visible={aiModalOpen} animationType="slide" onRequestClose={() => setAiModalOpen(false)}>
        <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.editor} keyboardShouldPersistTaps="handled">
          <View style={styles.sectionHeader}><Text style={styles.title}>Tạo câu hỏi AI</Text><Pressable accessibilityRole="button" onPress={() => setAiModalOpen(false)} style={styles.close}><Text style={styles.actionText}>Đóng</Text></Pressable></View>
          <Text style={styles.muted}>Câu hỏi tạo ra sẽ được lưu vào hàng chờ duyệt.</Text>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Text style={styles.label}>Chủ đề</Text><TextInput accessibilityLabel="Chủ đề câu hỏi AI" autoFocus value={aiTopic} onChangeText={setAiTopic} placeholder="Ví dụ: Lịch sử Việt Nam" style={styles.input} />
          <Text style={styles.label}>Danh mục</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{categories.map((category) => <Pressable key={category.id} onPress={() => setAiCategoryId(category.id)} style={[styles.choice, String(aiCategoryId) === String(category.id) && styles.choiceSelected]}><Text style={[styles.choiceText, String(aiCategoryId) === String(category.id) && styles.choiceTextSelected]}>{category.name}</Text></Pressable>)}</ScrollView>
          <Text style={styles.label}>Mức câu hỏi</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{Array.from({ length: 15 }, (_, index) => index + 1).map((level) => <Pressable key={level} onPress={() => setAiLevel(level)} style={[styles.choice, aiLevel === level && styles.choiceSelected]}><Text style={[styles.choiceText, aiLevel === level && styles.choiceTextSelected]}>{level}</Text></Pressable>)}</ScrollView>
          <Text style={styles.muted}>Độ khó: {DIFFICULTY_BY_LEVEL[aiLevel]}</Text>
          <Text style={styles.label}>Số câu (1–10)</Text><TextInput accessibilityLabel="Số lượng câu hỏi AI" value={aiCount} onChangeText={setAiCount} keyboardType="number-pad" maxLength={2} style={styles.input} />
          <Pressable accessibilityRole="button" disabled={saving} onPress={generateQuestionsWithAI} style={[styles.primaryButton, styles.saveButton, saving && styles.disabled]}><Text style={styles.primaryButtonText}>{saving ? 'ĐANG TẠO…' : 'TẠO BẢN NHÁP'}</Text></Pressable>
        </ScrollView></SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F4' }, content: { padding: 20, paddingBottom: 36 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }, kicker: { color: '#176B5B', fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }, title: { color: '#14251F', fontSize: 28, fontWeight: '700', marginTop: 8 }, subtitle: { color: '#66736D', fontSize: 14, marginTop: 6 }, logout: { minWidth: 52, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, logoutText: { color: '#176B5B', fontSize: 14, fontWeight: '700' },
  section: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 16 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, sectionTitle: { color: '#14251F', fontSize: 18, fontWeight: '700' }, muted: { color: '#78857E', fontSize: 12, marginTop: 4 }, filterHeading: { color: '#25362F', fontSize: 14, fontWeight: '700', marginTop: 8 }, filterGroup: { marginTop: 10 }, filterLabel: { color: '#78857E', fontSize: 11, fontWeight: '700', marginBottom: 6 }, filterChoices: { flexDirection: 'row', gap: 8, paddingVertical: 2 }, filterChip: { minHeight: 36, borderWidth: 1, borderColor: '#DCE4DE', borderRadius: 999, paddingHorizontal: 12, justifyContent: 'center', backgroundColor: '#FFFFFF' }, filterChipSelected: { backgroundColor: '#E8F3EE', borderColor: '#176B5B' }, filterChipText: { color: '#52645B', fontSize: 12 }, filterChipTextSelected: { color: '#176B5B', fontWeight: '700' }, clearFilters: { alignSelf: 'flex-end', minHeight: 38, justifyContent: 'center', paddingHorizontal: 8 }, addRow: { flexDirection: 'row', gap: 8, marginTop: 14 }, input: { minHeight: 48, borderWidth: 1, borderColor: '#DCE4DE', borderRadius: 12, backgroundColor: '#FFFFFF', color: '#14251F', paddingHorizontal: 14, fontSize: 15 }, categoryInput: { flex: 1 }, smallButton: { minWidth: 68, minHeight: 48, borderRadius: 12, backgroundColor: '#176B5B', alignItems: 'center', justifyContent: 'center' }, smallButtonText: { color: '#FFFFFF', fontWeight: '700' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }, categoryChip: { backgroundColor: '#E8F3EE', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }, draftCard: { borderTopWidth: 1, borderTopColor: '#E7ECE8', paddingTop: 14, marginTop: 8 }, draftAnswer: { color: '#66736D', fontSize: 12, marginTop: 8 }, approveButton: { borderRadius: 10, backgroundColor: '#E8F3EE' }, approveText: { color: '#176B5B', fontSize: 13, fontWeight: '700' },
  primaryButton: { minHeight: 44, borderRadius: 12, backgroundColor: '#176B5B', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 }, primaryButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' }, questionCard: { borderTopWidth: 1, borderTopColor: '#E7ECE8', paddingTop: 14, marginTop: 14 }, questionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, metaText: { color: '#77847D', fontSize: 11, fontWeight: '700', flex: 1 }, status: { color: '#176B5B', fontSize: 11 }, questionText: { color: '#25362F', fontSize: 15, lineHeight: 22, fontWeight: '600', marginTop: 8 }, questionActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }, actionButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 12 }, actionText: { color: '#176B5B', fontSize: 13, fontWeight: '700' }, deleteButton: { borderRadius: 10, backgroundColor: '#FBECEB' }, deleteText: { color: '#B63838', fontSize: 13, fontWeight: '700' }, error: { color: '#B63838', fontSize: 13, marginTop: 12 }, loader: { marginVertical: 24 }, empty: { color: '#78857E', textAlign: 'center', paddingVertical: 24 }, moreButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 12, borderWidth: 1, borderColor: '#DCE4DE', borderRadius: 12 }, refresh: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  editor: { padding: 20, paddingBottom: 44 }, close: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }, label: { color: '#25362F', fontSize: 13, fontWeight: '700', marginTop: 18, marginBottom: 8 }, multiline: { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 }, multilineSmall: { minHeight: 72, textAlignVertical: 'top', paddingTop: 12 }, choice: { minHeight: 40, minWidth: 44, borderRadius: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DCE4DE', backgroundColor: '#FFFFFF' }, choiceSelected: { backgroundColor: '#176B5B', borderColor: '#176B5B' }, choiceText: { color: '#52645B', fontWeight: '700', fontSize: 13 }, choiceTextSelected: { color: '#FFFFFF' }, saveButton: { minHeight: 52, marginTop: 28 }, disabled: { opacity: 0.55 }, modalShade: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(12,29,22,0.45)' }, categoryModal: { borderRadius: 22, padding: 22, backgroundColor: '#FFFFFF' },
});
