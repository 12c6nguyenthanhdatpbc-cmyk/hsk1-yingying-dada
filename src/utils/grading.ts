import { Exercise, QuestionGradeResult } from '../types/curriculum';

function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:，。！？；："'“”‘’]/g, '')
    .replace(/\s+/g, ' ');
}

export function gradeExercise(ex: Exercise, userAnswer: unknown): QuestionGradeResult {
  const maxPoints = ex.points || 1;
  if (
    userAnswer === undefined ||
    userAnswer === null ||
    userAnswer === '' ||
    (Array.isArray(userAnswer) && userAnswer.length === 0) ||
    (typeof userAnswer === 'object' && !Array.isArray(userAnswer) && Object.keys(userAnswer as object).length === 0)
  ) {
    return { questionId: ex.id, status: 'unanswered', earnedPoints: 0, maxPoints };
  }

  switch (ex.type) {
    case 'single_choice':
    case 'pinyin_for_hanzi':
    case 'hanzi_for_pinyin':
    case 'listening_choice':
    case 'reading_comp': {
      const ok = userAnswer === ex.answer;
      return { questionId: ex.id, status: ok ? 'correct' : 'incorrect', earnedPoints: ok ? maxPoints : 0, maxPoints };
    }
    case 'true_false': {
      const ok = userAnswer === ex.answer;
      return { questionId: ex.id, status: ok ? 'correct' : 'incorrect', earnedPoints: ok ? maxPoints : 0, maxPoints };
    }
    case 'multiple_choice': {
      const expected = [...((ex.answer as string[]) || [])].sort();
      const actual = [...((userAnswer as string[]) || [])].sort();
      const ok = expected.length === actual.length && expected.every((v, i) => v === actual[i]);
      return { questionId: ex.id, status: ok ? 'correct' : 'incorrect', earnedPoints: ok ? maxPoints : 0, maxPoints };
    }
    case 'fill_blank': {
      const clean = normalizeText(String(userAnswer));
      const accepted = (ex.acceptedAnswers || []).map(normalizeText);
      const ok = accepted.includes(clean);
      return { questionId: ex.id, status: ok ? 'correct' : 'incorrect', earnedPoints: ok ? maxPoints : 0, maxPoints };
    }
    case 'word_order': {
      const seq = (userAnswer as string[]).join('');
      const sequences = ex.acceptedSequences || (Array.isArray(ex.answer) ? [ex.answer as string[]] : []);
      const ok = sequences.some((s) => s.join('') === seq);
      return { questionId: ex.id, status: ok ? 'correct' : 'incorrect', earnedPoints: ok ? maxPoints : 0, maxPoints };
    }
    case 'matching': {
      const pairs = ex.pairs || [];
      const map = (userAnswer as Record<string, string>) || {};
      if (Object.keys(map).length < pairs.length) {
        return { questionId: ex.id, status: 'unanswered', earnedPoints: 0, maxPoints, note: 'Chưa nối đủ tất cả cặp từ.' };
      }
      const ok = pairs.every((p) => map[p.left] === p.right);
      return { questionId: ex.id, status: ok ? 'correct' : 'incorrect', earnedPoints: ok ? maxPoints : 0, maxPoints };
    }
    case 'translate_vi_zh':
    case 'translate_zh_vi': {
      const clean = normalizeText(String(userAnswer));
      const accepted = (ex.acceptedAnswers || []).map(normalizeText);
      if (accepted.includes(clean)) {
        return { questionId: ex.id, status: 'correct', earnedPoints: maxPoints, maxPoints, note: 'Khớp đáp án chuẩn.' };
      }
      const keywords = (ex.requiredKeywords || []).map(normalizeText);
      const matched = keywords.filter((kw) => clean.includes(kw));
      if (keywords.length > 0 && matched.length === keywords.length) {
        return {
          questionId: ex.id,
          status: 'correct',
          earnedPoints: maxPoints,
          maxPoints,
          note: 'Đủ từ khóa cốt lõi theo quy tắc chấm của giáo viên.',
        };
      }
      if (clean.length >= 2) {
        return {
          questionId: ex.id,
          status: 'needs_teacher_review',
          earnedPoints: 0,
          maxPoints,
          note: 'Câu tự luận có cách diễn đạt khác đáp án mẫu — cần giáo viên xem và chấm trực tiếp (không tự động kết luận sai).',
        };
      }
      return { questionId: ex.id, status: 'incorrect', earnedPoints: 0, maxPoints };
    }
    default:
      return { questionId: ex.id, status: 'unanswered', earnedPoints: 0, maxPoints };
  }
}
