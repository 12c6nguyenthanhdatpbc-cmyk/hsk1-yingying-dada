import { AttemptRecord, Course, Lesson, VocabStatus } from '../types/curriculum';

const KEYS = {
  ATTEMPTS: 'hanlin_attempts_v1',
  VOCAB_STATUS: 'hanlin_vocab_status_v1',
  CUSTOM_LESSONS: 'hanlin_custom_lessons_v1',
  CUSTOM_COURSES: 'hanlin_custom_courses_v1',
  PREFS: 'hanlin_prefs_v1',
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Bỏ qua nếu trình duyệt chặn lưu trữ cục bộ
  }
}

export const storageService = {
  getAttempts: (): AttemptRecord[] => safeRead(KEYS.ATTEMPTS, []),
  saveAttempt: (record: AttemptRecord): AttemptRecord[] => {
    const next = [record, ...safeRead<AttemptRecord[]>(KEYS.ATTEMPTS, [])];
    safeWrite(KEYS.ATTEMPTS, next);
    return next;
  },
  getVocabStatusMap: (): Record<string, VocabStatus> => safeRead(KEYS.VOCAB_STATUS, {}),
  setVocabStatus: (vocabId: string, status: VocabStatus): Record<string, VocabStatus> => {
    const next = { ...safeRead<Record<string, VocabStatus>>(KEYS.VOCAB_STATUS, {}), [vocabId]: status };
    safeWrite(KEYS.VOCAB_STATUS, next);
    return next;
  },
  getCustomLessons: (): Lesson[] => safeRead(KEYS.CUSTOM_LESSONS, []),
  saveCustomLessons: (lessons: Lesson[]): void => safeWrite(KEYS.CUSTOM_LESSONS, lessons),
  getCustomCourses: (): Course[] => safeRead(KEYS.CUSTOM_COURSES, []),
  saveCustomCourses: (courses: Course[]): void => safeWrite(KEYS.CUSTOM_COURSES, courses),
  getPrefs: () => safeRead(KEYS.PREFS, { displayMode: 'all', fontScale: 'md' }),
  savePrefs: (prefs: { displayMode: string; fontScale: string }) => safeWrite(KEYS.PREFS, prefs),
};
