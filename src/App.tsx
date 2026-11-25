import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Headphones,
  BarChart3,
  GraduationCap,
  Home,
  Settings2,
  Volume2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Download,
  Upload,
} from 'lucide-react';
import { DEFAULT_COURSES, DEFAULT_LESSONS, DEFAULT_LISTENING, LESSON_JSON_TEMPLATE } from './data';
import { storageService } from './services/storageService';
import { playChineseAudio } from './services/audioService';
import { gradeExercise } from './utils/grading';
import {
  AttemptRecord,
  Course,
  DisplayMode,
  FontScale,
  Lesson,
  QuestionGradeResult,
} from './types/curriculum';
import './styles/tokens.css';

type TabKey = 'home' | 'courses' | 'lesson' | 'listening' | 'results' | 'teacher';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [customCourses, setCustomCourses] = useState<Course[]>(() => storageService.getCustomCourses());
  const [customLessons, setCustomLessons] = useState<Lesson[]>(() => storageService.getCustomLessons());
  const [attempts, setAttempts] = useState<AttemptRecord[]>(() => storageService.getAttempts());
  const [vocabStatus, setVocabStatus] = useState(() => storageService.getVocabStatusMap());

  const courses = useMemo(() => [...DEFAULT_COURSES, ...customCourses], [customCourses]);
  const lessons = useMemo(() => {
    const map = new Map<string, Lesson>();
    DEFAULT_LESSONS.forEach((l) => map.set(l.id, l));
    customLessons.forEach((l) => map.set(l.id, l));
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [customLessons]);

  const [selectedCourseId, setSelectedCourseId] = useState('hsk1');
  const [activeLessonId, setActiveLessonId] = useState('hsk1-01');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('all');
  const [fontScale, setFontScale] = useState<FontScale>('md');
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submittedResults, setSubmittedResults] = useState<Record<string, QuestionGradeResult> | null>(null);
  const [teacherJson, setTeacherJson] = useState(() => JSON.stringify(LESSON_JSON_TEMPLATE, null, 2));
  const [toast, setToast] = useState<string | null>(null);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const openLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setAnswers({});
    setSubmittedResults(null);
    setActiveTab('lesson');
  };

  const handleSubmitLesson = () => {
    const resMap: Record<string, QuestionGradeResult> = {};
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let review = 0;

    activeLesson.exercises.forEach((ex) => {
      const r = gradeExercise(ex, answers[ex.id]);
      resMap[ex.id] = r;
      if (r.status === 'correct') correct += 1;
      else if (r.status === 'incorrect') incorrect += 1;
      else if (r.status === 'needs_teacher_review') review += 1;
      else unanswered += 1;
    });

    const total = activeLesson.exercises.length;
    const scorePercent = total ? Math.round((correct / total) * 100) : 0;
    setSubmittedResults(resMap);
    const updated = storageService.saveAttempt({
      id: `att-${Date.now()}`,
      lessonId: activeLesson.id,
      lessonTitle: `${activeLesson.zhTitle} (${activeLesson.viTitle})`,
      courseId: activeLesson.courseId,
      timestamp: new Date().toISOString(),
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      reviewCount: review,
      totalQuestions: total,
      scorePercent,
    });
    setAttempts(updated);
    notify(`Đã nộp bài! Kết quả: ${correct}/${total} câu đúng (${scorePercent}%).`);
  };

  const handleSaveTeacherJson = () => {
    try {
      const parsed = JSON.parse(teacherJson) as Lesson;
      if (!parsed.id || !parsed.zhTitle || !Array.isArray(parsed.vocabulary)) {
        notify('JSON chưa đúng định dạng bài học (thiếu id, zhTitle hoặc vocabulary).');
        return;
      }
      const next = [...customLessons.filter((l) => l.id !== parsed.id), parsed];
      setCustomLessons(next);
      storageService.saveCustomLessons(next);
      notify(`Đã lưu cục bộ bài học "${parsed.zhTitle}"!`);
    } catch {
      notify('Lỗi cú pháp JSON. Vui lòng kiểm tra dấu phẩy và ngoặc kép.');
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([teacherJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hanlin-lesson.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fontSizePx = fontScale === 'sm' ? 14 : fontScale === 'lg' ? 19 : 16;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border-soft)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: 'var(--brand-primary)' }}>
          <GraduationCap size={26} />
          <span>TIẾNG TRUNG YINGYING DADA</span>
          <span className="zh-text" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            YingYing DaDa
          </span>
        </div>
        <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['home', 'Trang chủ', Home],
            ['courses', 'Khóa học HSK', BookOpen],
            ['lesson', 'Bài học', BookOpen],
            ['listening', 'Luyện nghe', Headphones],
            ['results', 'Kết quả', BarChart3],
            ['teacher', 'Giáo viên', Settings2],
          ].map(([key, label, Icon]) => {
            const Comp = Icon as React.ElementType;
            const active = activeTab === key;
            return (
              <button
                key={key as string}
                onClick={() => setActiveTab(key as TabKey)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: '1px solid ' + (active ? 'var(--brand-primary)' : 'var(--border-soft)'),
                  background: active ? 'var(--brand-primary)' : 'var(--bg-surface)',
                  color: active ? '#fff' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                <Comp size={15} />
                {label as string}
              </button>
            );
          })}
        </nav>
      </header>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 50,
            background: 'var(--text-primary)',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          {toast}
        </div>
      )}

      <main style={{ maxWidth: 1240, width: '100%', margin: '0 auto', padding: '24px 20px', fontSize: fontSizePx }}>
        {activeTab === 'home' && (
          <section style={{ display: 'grid', gap: 24 }}>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius-lg)',
                padding: 28,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 24,
                alignItems: 'center',
              }}
            >
              <div>
                <p className="zh-text" style={{ color: 'var(--brand-primary)', fontWeight: 700, margin: 0 }}>
                  开启你的中文学习之旅
                </p>
                <h1 style={{ fontSize: 32, lineHeight: 1.25, margin: '8px 0 12px' }}>
                  CÙNG BẠN CHINH PHỤC TIẾNG TRUNG
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                  Học tiếng Trung từng bước, luyện tập mỗi ngày và tự tin chinh phục các cấp độ HSK New HSK 1 (HSK 3.0).
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => openLesson(lessons[0].id)}
                    style={{
                      background: 'var(--brand-primary)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 22px',
                      borderRadius: 12,
                      fontWeight: 700,
                    }}
                  >
                    Bắt đầu học ngay
                  </button>
                  <button
                    onClick={() => setActiveTab('courses')}
                    style={{
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-strong)',
                      padding: '12px 22px',
                      borderRadius: 12,
                      fontWeight: 600,
                    }}
                  >
                    Khám phá khóa học
                  </button>
                </div>
              </div>
              <img
                src="./images/hero-desk.jpg"
                alt="Không gian học tiếng Trung Tiếng Trung YingYing DaDa"
                style={{ width: '100%', borderRadius: 16, objectFit: 'cover' }}
              />
            </div>

            <h2>Khóa học HSK</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {courses.map((course) => {
                const courseLessons = lessons.filter((l) => l.courseId === course.id);
                return (
                  <div
                    key={course.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-soft)',
                      borderRadius: 'var(--radius-md)',
                      padding: 18,
                    }}
                  >
                    <span
                      style={{
                        background: course.accentColor,
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {course.code}
                    </span>
                    <h3 style={{ margin: '10px 0 4px' }}>{course.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{course.description}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {courseLessons.length} bài học · Mục tiêu {course.targetVocab} từ
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setActiveTab('courses');
                      }}
                      style={{
                        width: '100%',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-strong)',
                        padding: '9px 14px',
                        borderRadius: 10,
                        fontWeight: 600,
                      }}
                    >
                      Vào học →
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'courses' && (
          <section>
            <h2>Danh sách bài học ({selectedCourseId.toUpperCase()})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
              {lessons
                .filter((l) => l.courseId === selectedCourseId)
                .map((lesson) => (
                  <div
                    key={lesson.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-soft)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                    }}
                  >
                    <img src={`./${lesson.image}`} alt={lesson.viTitle} style={{ width: '100%', height: 170, objectFit: 'cover' }} />
                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)' }}>BÀI {lesson.order}</div>
                      <h3 className="zh-text" style={{ margin: '4px 0' }}>
                        {lesson.zhTitle}
                      </h3>
                      <p style={{ margin: '0 0 10px', color: 'var(--text-secondary)' }}>{lesson.viTitle}</p>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                        {lesson.vocabulary.length} từ vựng · {lesson.exercises.length} bài tập · ~{lesson.estimatedMinutes} phút
                      </div>
                      <button
                        onClick={() => openLesson(lesson.id)}
                        style={{
                          width: '100%',
                          background: 'var(--brand-primary)',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 14px',
                          borderRadius: 10,
                          fontWeight: 700,
                        }}
                      >
                        Mở bài học →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {activeTab === 'lesson' && activeLesson && (
          <section style={{ display: 'grid', gap: 20 }}>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <strong className="zh-text" style={{ fontSize: 22 }}>
                  Bài {activeLesson.order}: {activeLesson.zhTitle}
                </strong>
                <div style={{ color: 'var(--text-secondary)' }}>{activeLesson.viTitle}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(['hanzi', 'pinyin', 'all'] as DisplayMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDisplayMode(mode)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-strong)',
                      background: displayMode === mode ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                      color: displayMode === mode ? '#fff' : 'var(--text-primary)',
                      fontWeight: 600,
                    }}
                  >
                    {mode === 'hanzi' ? 'Ẩn' : mode === 'pinyin' ? 'Pinyin' : 'Tất cả'}
                  </button>
                ))}
                {(['sm', 'md', 'lg'] as FontScale[]).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setFontScale(sz)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border-strong)',
                      background: fontScale === sz ? 'var(--text-primary)' : 'var(--bg-subtle)',
                      color: fontScale === sz ? '#fff' : 'var(--text-primary)',
                    }}
                  >
                    {sz === 'sm' ? 'A-' : sz === 'lg' ? 'A+' : 'A'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: 20, border: '1px solid var(--border-soft)' }}>
              <h3>PHẦN 1: TỪ VỰNG (生词 · {activeLesson.vocabulary.length} từ)</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {activeLesson.vocabulary.map((v, i) => (
                  <div
                    key={v.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 12,
                      background: 'var(--bg-subtle)',
                    }}
                  >
                    <strong>{i + 1}</strong>
                    <div>
                      <span className="zh-text" style={{ fontSize: 22, fontWeight: 700, marginRight: 10 }}>
                        {v.hanzi}
                      </span>
                      {displayMode !== 'hanzi' && <span style={{ color: 'var(--brand-primary)', marginRight: 10 }}>{v.pinyin}</span>}
                      {displayMode === 'all' && <span>{v.meaning} ({v.pos})</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => playChineseAudio(v.hanzi)}
                        title="Nghe phát âm"
                        style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-strong)', background: '#fff' }}
                      >
                        <Volume2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          const next = vocabStatus[v.id] === 'review' ? 'mastered' : 'review';
                          setVocabStatus(storageService.setVocabStatus(v.id, next));
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 8,
                          border: '1px solid var(--border-strong)',
                          background: vocabStatus[v.id] === 'mastered' ? 'var(--status-correct-bg)' : '#fff',
                        }}
                      >
                        {vocabStatus[v.id] === 'mastered' ? 'Đã thuộc' : vocabStatus[v.id] === 'review' ? 'Cần ôn' : 'Đánh dấu'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: 20, border: '1px solid var(--border-soft)' }}>
              <h3>PHẦN 5: BÀI TẬP TƯƠNG TÁC ({activeLesson.exercises.length} câu)</h3>
              <div style={{ display: 'grid', gap: 14 }}>
                {activeLesson.exercises.map((ex, idx) => {
                  const res = submittedResults?.[ex.id];
                  return (
                    <div
                      key={ex.id}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: '1px solid var(--border-soft)',
                        background:
                          res?.status === 'correct'
                            ? 'var(--status-correct-bg)'
                            : res?.status === 'incorrect'
                              ? 'var(--status-wrong-bg)'
                              : 'var(--bg-subtle)',
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>
                        Câu {idx + 1}. {ex.prompt}
                      </div>
                      {ex.options && (
                        <div style={{ display: 'grid', gap: 8 }}>
                          {ex.options.map((opt) => (
                            <label key={opt} style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                              <input
                                type={ex.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                                name={ex.id}
                                disabled={Boolean(submittedResults)}
                                checked={
                                  ex.type === 'multiple_choice'
                                    ? ((answers[ex.id] as string[]) || []).includes(opt)
                                    : answers[ex.id] === opt
                                }
                                onChange={() => {
                                  if (ex.type === 'multiple_choice') {
                                    const cur = (answers[ex.id] as string[]) || [];
                                    const next = cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt];
                                    setAnswers({ ...answers, [ex.id]: next });
                                  } else {
                                    setAnswers({ ...answers, [ex.id]: opt });
                                  }
                                }}
                              />
                              <span className="zh-text">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {ex.type === 'true_false' && (
                        <div style={{ display: 'flex', gap: 10 }}>
                          {[true, false].map((val) => (
                            <button
                              key={String(val)}
                              disabled={Boolean(submittedResults)}
                              onClick={() => setAnswers({ ...answers, [ex.id]: val })}
                              style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                border: '1px solid var(--border-strong)',
                                background: answers[ex.id] === val ? 'var(--brand-primary)' : '#fff',
                                color: answers[ex.id] === val ? '#fff' : 'var(--text-primary)',
                              }}
                            >
                              {val ? 'Đúng' : 'Sai'}
                            </button>
                          ))}
                        </div>
                      )}
                      {(ex.type === 'fill_blank' || ex.type === 'translate_vi_zh' || ex.type === 'translate_zh_vi') && (
                        <input
                          type="text"
                          disabled={Boolean(submittedResults)}
                          value={String(answers[ex.id] || '')}
                          onChange={(e) => setAnswers({ ...answers, [ex.id]: e.target.value })}
                          placeholder={ex.placeholder || 'Nhập câu trả lời của bạn...'}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-strong)' }}
                        />
                      )}
                      {res && (
                        <div style={{ marginTop: 10, fontSize: 14 }}>
                          <strong>
                            {res.status === 'correct' ? (
                              <CheckCircle2 size={15} style={{ verticalAlign: 'middle' }} />
                            ) : res.status === 'needs_teacher_review' ? (
                              <AlertCircle size={15} style={{ verticalAlign: 'middle' }} />
                            ) : (
                              <XCircle size={15} style={{ verticalAlign: 'middle' }} />
                            )}{' '}
                            {res.status === 'correct'
                              ? 'Chính xác!'
                              : res.status === 'needs_teacher_review'
                                ? 'Cần giáo viên chấm'
                                : res.status === 'unanswered'
                                  ? 'Chưa làm'
                                  : 'Chưa chính xác'}
                          </strong>
                          <div>Giải thích: {ex.explanation}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                {!submittedResults ? (
                  <button
                    onClick={handleSubmitLesson}
                    style={{
                      background: 'var(--brand-primary)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 10,
                      fontWeight: 700,
                    }}
                  >
                    Nộp bài & Chấm điểm
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAnswers({});
                      setSubmittedResults(null);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--brand-jade)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 10,
                      fontWeight: 700,
                    }}
                  >
                    <RotateCcw size={16} /> Làm lại bài
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'listening' && (
          <section style={{ display: 'grid', gap: 16 }}>
            <h2>Khu vực Luyện nghe (听力)</h2>
            {DEFAULT_LISTENING.map((item) => (
              <div
                key={item.id}
                style={{ background: 'var(--bg-surface)', padding: 18, borderRadius: 14, border: '1px solid var(--border-soft)' }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)' }}>
                  {item.lessonLabel} · {item.typeLabel}
                </div>
                <p style={{ fontWeight: 600 }}>{item.prompt}</p>
                <button
                  onClick={() => playChineseAudio(item.audioText, item.audioFile)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--brand-primary)',
                    color: '#fff',
                  }}
                >
                  <Volume2 size={16} /> Nghe phát âm (TTS dự phòng)
                </button>
              </div>
            ))}
          </section>
        )}

        {activeTab === 'results' && (
          <section style={{ display: 'grid', gap: 16 }}>
            <h2>Thống kê kết quả học tập</h2>
            {attempts.length === 0 ? (
              <p>Bạn chưa nộp bài kiểm tra nào. Hãy mở một bài học HSK 1 để làm bài và xem biểu đồ tiến độ.</p>
            ) : (
              attempts.map((a) => (
                <div
                  key={a.id}
                  style={{
                    background: 'var(--bg-surface)',
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid var(--border-soft)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong>{a.lessonTitle}</strong>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(a.timestamp).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {a.correctCount}/{a.totalQuestions} ({a.scorePercent}%)
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === 'teacher' && (
          <section style={{ display: 'grid', gap: 14 }}>
            <h2>Khu vực Quản lý Nội dung dành cho Giáo viên</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Lưu ý GitHub Pages: Khi không có backend, bài học chỉnh sửa tại đây được lưu cục bộ trên trình duyệt (LocalStorage).
              Hãy nhấn <strong>Xuất file JSON</strong> để lưu vào thư mục <code>src/data/</code> trên GitHub.
            </p>
            <textarea
              rows={18}
              value={teacherJson}
              onChange={(e) => setTeacherJson(e.target.value)}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                padding: 14,
                borderRadius: 12,
                border: '1px solid var(--border-strong)',
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSaveTeacherJson}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--brand-primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontWeight: 700,
                }}
              >
                <Upload size={16} /> Lưu cục bộ & Xem thử
              </button>
              <button
                onClick={handleExportJson}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-strong)',
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                <Download size={16} /> Xuất file JSON
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
