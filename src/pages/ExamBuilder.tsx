import { useState } from 'react';
import { Exam, Question } from '../types';
import { generateId } from '../utils/id';
import QuestionEditor from '../components/QuestionEditor';
import QuestionCard from '../components/QuestionCard';
import { exportToPDF, exportToText, exportToJSON } from '../utils/export';

interface Props {
  exam?: Exam;
  onSave: (exam: Exam) => void;
  onBack: () => void;
}

const emptyExam = (): Partial<Exam> => ({
  title: '',
  subject: '',
  grade: '',
  duration: 60,
  teacherName: '',
  schoolName: '',
  academicYear: '1403-1404',
  description: '',
  questions: [],
});

type Tab = 'info' | 'questions' | 'preview';

export default function ExamBuilder({ exam, onSave, onBack }: Props) {
  const [info, setInfo] = useState<Partial<Exam>>(exam || emptyExam());
  const [questions, setQuestions] = useState<Question[]>(exam?.questions || []);
  const [tab, setTab] = useState<Tab>('info');
  const [showEditor, setShowEditor] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | undefined>();
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInfo = () => {
    const e: Record<string, string> = {};
    if (!info.title?.trim()) e.title = 'عنوان آزمون الزامی است';
    if (!info.subject?.trim()) e.subject = 'نام درس الزامی است';
    if (!info.grade?.trim()) e.grade = 'پایه الزامی است';
    if (!info.teacherName?.trim()) e.teacherName = 'نام معلم الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveQuestion = (q: Question) => {
    if (editingQ) {
      setQuestions(qs => qs.map(x => (x.id === q.id ? q : x)));
    } else {
      setQuestions(qs => [...qs, q]);
    }
    setShowEditor(false);
    setEditingQ(undefined);
  };

  const handleDelete = (id: string) => {
    setQuestions(qs => qs.filter(q => q.id !== id));
  };

  const handleDuplicate = (q: Question) => {
    const copy: Question = { ...q, id: generateId() };
    setQuestions(qs => [...qs, copy]);
  };

  const handleSaveExam = () => {
    if (!validateInfo()) { setTab('info'); return; }
    const now = new Date().toISOString();
    const result: Exam = {
      id: exam?.id || generateId(),
      title: info.title!,
      subject: info.subject!,
      grade: info.grade!,
      duration: info.duration || 60,
      teacherName: info.teacherName!,
      schoolName: info.schoolName || '',
      academicYear: info.academicYear || '1403-1404',
      description: info.description,
      questions,
      createdAt: exam?.createdAt || now,
    };
    onSave(result);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const currentExam = (): Exam => ({
    id: exam?.id || generateId(),
    title: info.title || 'آزمون',
    subject: info.subject || '',
    grade: info.grade || '',
    duration: info.duration || 60,
    teacherName: info.teacherName || '',
    schoolName: info.schoolName || '',
    academicYear: info.academicYear || '1403-1404',
    description: info.description,
    questions,
    createdAt: exam?.createdAt || new Date().toISOString(),
  });

  const totalScore = questions.reduce((s, q) => s + q.score, 0);

  const optionLabels = ['الف', 'ب', 'ج', 'د', 'ه', 'و'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← بازگشت
          </button>
          <h1 className="text-base font-bold text-gray-900 truncate max-w-[180px]">
            {exam ? 'ویرایش آزمون' : 'آزمون جدید'}
          </h1>
          <button
            onClick={handleSaveExam}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {saved ? '✓ ذخیره شد' : '💾 ذخیره'}
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-4 flex border-t border-gray-100">
          {(['info', 'questions', 'preview'] as Tab[]).map(t => {
            const labels: Record<Tab, string> = { info: '📋 اطلاعات', questions: `❓ سوالات (${questions.length})`, preview: '👁️ پیش‌نمایش' };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Info Tab */}
        {tab === 'info' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-800">اطلاعات آزمون</h2>
            <div className="grid grid-cols-1 gap-4">
              <Field label="عنوان آزمون *" error={errors.title}>
                <input value={info.title || ''} onChange={e => setInfo(i => ({ ...i, title: e.target.value }))}
                  placeholder="مثال: آزمون نوبت اول ریاضی"
                  className="input-field" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="نام درس *" error={errors.subject}>
                  <input value={info.subject || ''} onChange={e => setInfo(i => ({ ...i, subject: e.target.value }))}
                    placeholder="مثال: ریاضی" className="input-field" />
                </Field>
                <Field label="پایه تحصیلی *" error={errors.grade}>
                  <input value={info.grade || ''} onChange={e => setInfo(i => ({ ...i, grade: e.target.value }))}
                    placeholder="مثال: هفتم" className="input-field" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="نام معلم *" error={errors.teacherName}>
                  <input value={info.teacherName || ''} onChange={e => setInfo(i => ({ ...i, teacherName: e.target.value }))}
                    placeholder="نام و نام خانوادگی" className="input-field" />
                </Field>
                <Field label="نام مدرسه">
                  <input value={info.schoolName || ''} onChange={e => setInfo(i => ({ ...i, schoolName: e.target.value }))}
                    placeholder="نام مدرسه" className="input-field" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="مدت آزمون (دقیقه)">
                  <input type="number" value={info.duration || 60} onChange={e => setInfo(i => ({ ...i, duration: parseInt(e.target.value) || 60 }))}
                    className="input-field" />
                </Field>
                <Field label="سال تحصیلی">
                  <input value={info.academicYear || ''} onChange={e => setInfo(i => ({ ...i, academicYear: e.target.value }))}
                    placeholder="1403-1404" className="input-field" />
                </Field>
              </div>
              <Field label="توضیحات (اختیاری)">
                <textarea value={info.description || ''} onChange={e => setInfo(i => ({ ...i, description: e.target.value }))}
                  rows={2} placeholder="توضیحات اضافی..." className="input-field resize-none" />
              </Field>
            </div>
            <button
              onClick={() => { if (validateInfo()) setTab('questions'); }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              رفتن به بخش سوالات ←
            </button>
          </div>
        )}

        {/* Questions Tab */}
        {tab === 'questions' && (
          <div className="space-y-4">
            {/* Stats bar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
              <div className="flex gap-4 text-sm">
                <span className="text-gray-500">تعداد سوالات: <strong className="text-gray-900">{questions.length}</strong></span>
                <span className="text-gray-500">مجموع نمرات: <strong className="text-indigo-600">{totalScore}</strong></span>
              </div>
              <button
                onClick={() => { setEditingQ(undefined); setShowEditor(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                + سوال جدید
              </button>
            </div>

            {showEditor && (
              <QuestionEditor
                question={editingQ}
                onSave={handleSaveQuestion}
                onCancel={() => { setShowEditor(false); setEditingQ(undefined); }}
              />
            )}

            {questions.length === 0 && !showEditor && (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-gray-500 text-sm">هنوز سوالی اضافه نشده است</p>
                <button
                  onClick={() => { setEditingQ(undefined); setShowEditor(true); }}
                  className="mt-4 bg-indigo-600 text-white text-sm font-semibold px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  + افزودن اولین سوال
                </button>
              </div>
            )}

            <div className="space-y-3">
              {questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={i}
                  onEdit={() => { setEditingQ(q); setShowEditor(true); }}
                  onDelete={() => handleDelete(q.id)}
                  onDuplicate={() => handleDuplicate(q)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {tab === 'preview' && (
          <div className="space-y-4">
            {/* Export buttons */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">خروجی گرفتن:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => exportToPDF(currentExam())}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  📄 خروجی PDF
                </button>
                <button
                  onClick={() => exportToText(currentExam())}
                  className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  📃 خروجی متنی
                </button>
                <button
                  onClick={() => exportToJSON(currentExam())}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  💾 خروجی JSON
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 font-['Vazirmatn']" dir="rtl">
              <div className="text-center border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">{info.title || 'عنوان آزمون'}</h2>
                <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600 flex-wrap">
                  <span>درس: {info.subject}</span>
                  <span>پایه: {info.grade}</span>
                  <span>مدت: {info.duration} دقیقه</span>
                  <span>مجموع: {totalScore} نمره</span>
                </div>
                <div className="flex justify-center gap-6 mt-1 text-sm text-gray-600 flex-wrap">
                  <span>معلم: {info.teacherName}</span>
                  {info.schoolName && <span>مدرسه: {info.schoolName}</span>}
                  <span>سال تحصیلی: {info.academicYear}</span>
                </div>
              </div>

              {questions.length === 0 ? (
                <p className="text-center text-gray-400 py-8">سوالی برای پیش‌نمایش وجود ندارد</p>
              ) : (
                <div className="space-y-6">
                  {questions.map((q, i) => (
                    <div key={q.id} className="space-y-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {i + 1}. {q.text}
                        <span className="text-xs text-gray-400 font-normal mr-2">({q.score} نمره)</span>
                      </p>
                      {q.type === 'multiple_choice' && q.options && (
                        <div className="grid grid-cols-2 gap-1 pr-4">
                          {q.options.map((opt, idx) => (
                            <span key={opt.id} className="text-xs text-gray-700">
                              {optionLabels[idx]}) {opt.text}
                            </span>
                          ))}
                        </div>
                      )}
                      {q.type === 'true_false' && (
                        <div className="flex gap-6 pr-4 text-xs text-gray-600">
                          <label className="flex items-center gap-1"><input type="radio" disabled /> صحیح</label>
                          <label className="flex items-center gap-1"><input type="radio" disabled /> غلط</label>
                        </div>
                      )}
                      {(q.type === 'short_answer' || q.type === 'fill_blank') && (
                        <div className="border-b border-dashed border-gray-300 mx-4 h-6" />
                      )}
                      {q.type === 'descriptive' && (
                        <div className="space-y-1">
                          {[1, 2, 3].map(n => (
                            <div key={n} className="border-b border-dashed border-gray-300 mx-4 h-6" />
                          ))}
                        </div>
                      )}
                      {q.type === 'matching' && q.matchingPairs && (
                        <div className="grid grid-cols-2 gap-4 pr-4">
                          <div>
                            <p className="text-xs font-bold mb-1">ستون الف:</p>
                            {q.matchingPairs.map((p, idx) => (
                              <p key={p.id} className="text-xs text-gray-700">{idx + 1}. {p.left}</p>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs font-bold mb-1">ستون ب:</p>
                            {[...q.matchingPairs].sort(() => Math.random() - 0.5).map((p, idx) => (
                              <p key={p.id} className="text-xs text-gray-700">{optionLabels[idx]}. {p.right}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
