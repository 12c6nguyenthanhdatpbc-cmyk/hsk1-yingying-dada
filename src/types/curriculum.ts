export type DisplayMode = 'hanzi' | 'pinyin' | 'all';
export type FontScale = 'sm' | 'md' | 'lg';
export type VocabStatus = 'new' | 'mastered' | 'review';

export interface Course {
  id: string;
  code: string;
  title: string;
  zhTitle: string;
  levelGroup: string;
  description: string;
  targetVocab: number;
  status: 'active' | 'ready_for_content' | 'roadmap';
  accentColor: string;
  lessonIds: string[];
}

export interface VocabItem {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  pos: string;
  exampleZh: string;
  examplePinyin: string;
  exampleVi: string;
  explanation: string;
  collocations: string[];
  extraExample: string;
}

export interface DialogueLine {
  speaker: string;
  side: 'left' | 'right';
  zh: string;
  pinyin: string;
  vi: string;
}

export interface Dialogue {
  id: string;
  title: string;
  context: string;
  audioFile?: string;
  lines: DialogueLine[];
}

export interface GrammarPoint {
  id: string;
  title: string;
  formula: string;
  usage: string;
  explanation: string;
  examples: { zh: string; pinyin: string; vi: string }[];
  commonMistake: string;
  comparison: string;
}

export interface SentencePattern {
  zh: string;
  pinyin: string;
  vi: string;
}

export type ExerciseType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'word_order'
  | 'matching'
  | 'pinyin_for_hanzi'
  | 'hanzi_for_pinyin'
  | 'listening_choice'
  | 'translate_vi_zh'
  | 'translate_zh_vi'
  | 'reading_comp'
  | 'pinyin_to_hanzi_write'
  | 'meaning_bank_select'
  | 'translate_batch_vi_zh';

export interface Exercise {
  id: string;
  type: ExerciseType;
  points: number;
  prompt: string;
  zhPrompt?: string;
  pinyinPrompt?: string;
  passageZh?: string;
  passagePinyin?: string;
  options?: string[];
  tokens?: string[];
  pairs?: { left: string; right: string }[];
  audioText?: string;
  audioFile?: string;
  placeholder?: string;
  answer?: unknown;
  sampleAnswer?: string;
  acceptedAnswers?: string[];
  acceptedSequences?: string[][];
  requiredKeywords?: string[];
  explanation: string;
  relatedKnowledge: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  order: number;
  group: string;
  zhTitle: string;
  pinyinTitle: string;
  viTitle: string;
  image: string;
  estimatedMinutes: number;
  summary: string;
  vocabulary: VocabItem[];
  dialogues: Dialogue[];
  grammar: GrammarPoint[];
  patterns: SentencePattern[];
  exercises: Exercise[];
}

export interface ListeningItem {
  id: string;
  courseId: string;
  lessonId: string;
  lessonLabel: string;
  type:
    | 'listen_picture'
    | 'listen_response'
    | 'listen_pinyin'
    | 'listen_hanzi'
    | 'listen_dialogue'
    | 'listen_fill';
  typeLabel: string;
  prompt: string;
  audioFile?: string;
  audioText: string;
  transcriptPinyin: string;
  transcriptVi: string;
  options?: { id: string; label: string; icon?: string }[];
  acceptedAnswers?: string[];
  answer: string;
  explanation: string;
}

export type GradeStatus = 'correct' | 'incorrect' | 'unanswered' | 'needs_teacher_review';

export interface QuestionGradeResult {
  questionId: string;
  status: GradeStatus;
  earnedPoints: number;
  maxPoints: number;
  note?: string;
}

export interface AttemptRecord {
  id: string;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  timestamp: string;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  reviewCount: number;
  totalQuestions: number;
  scorePercent: number;
}
