import { useState } from 'react';
import { Exam, Question, ExamBank } from '../types';
import { generateId } from '../utils/id';
import { exportToText, exportToJSON, exportToPDF } from '../utils/export';
import QuestionEditor from '../components/QuestionEditor';
import QuestionItem from '../components/QuestionItem';

interface Props {
  exam?: Exam;
  banks: ExamBank[];
  onSave: (exam: Exam) => void;
  onBack: () => void;
}

interface ExamInfo {
  title: string;
  subject: string;
  grade: string;
  teacherName: string;
  schoolName: string;
  duration: number;
  academicYear: string;
  description: string;
}

export default function ExamBuilder({ exam, banks, onSave, onBack }: Props) {
  const [info, setInfo] = useState<ExamInfo>({
    title: exam?.title || '',
    subject: exam?.subject || '',
    grade: exam?.grade || '',
    teacherName: exam?.teacherName || '',
    schoolName: exam?.schoolName || '',
    duration: exam?.duration || 60,
    academicYear: exam?.academicYear || '1403-1404',
    description: exam?.description || '',
  });

  const [questions, setQuestions] = useState<Question[]>(exam?.questions || []);
  const [showEditor, setShowEditor] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | undefined>();
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [tab, setTab] = useState<'info' | 'questions'>('info');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const totalScore = questions.reduce((s, q) => s + q.score, 0);

  const handleAddQuestion = (q: Question) => {
    if (editingQ) {
      setQuestions(qs => qs.map(x => (x.id === editingQ.id ? q : x)));
    } else {
      setQuestions(qs => [...qs, q]);
    }
    setShowEditor(false);
    setEditingQ(undefined);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(qs => qs.filter(q => q.id !== id));
  };

  const handleSave = () => {
    if (!info.title.trim()) {
      setError('عنوان آزمون را وارد کنید');
      setTab('info');
      return;
    }
    const e: Exam = {
      id: exam?.id || generateId(),
      ...info,
      questions,
      createdAt: exam?.createdAt || new Date().toISOString(),
    };
    onSave(e);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setError('');
  };

  const handleImportFromBank = () => {
    const bank = banks.find(b => b.id === selectedBankId);
    if (!bank) return;
    const newQs = bank.questions.filter(bq => !questions.find(q => q.id === bq.id));
    setQuestions(qs => [...qs, ...newQs]);
    setShowBankPicker(false);
  };

  const handleExportPDF = async () => {
    if (!info.title.trim()) { setError('ابتدا عنوان آزمون را وارد کنید'); setTab('info'); return; }
    setExporting(true);
    const e: Exam = { id: exam?.id || generateId(), ...info, questions, createdAt: exam?.createdAt || new Date().toISOString() };
    await exportToPDF(e);
    setExporting(false);
  };

  const handleExportText = () => {
    if (!info.title.trim()) { setError('ابتدا عنوان آزمون را وارد کنید'); setTab('info'); return; }
    const e: Exam = { id: exam?.id || generateId(), ...info, questions, createdAt: exam?.createdAt || new Date().toISOString() };
    exportToText(e);
  };

  const handleExportJSON = () => {
    if (!info.title.trim()) { setError('ابتدا عنوان آزمون را وارد کنید'); setTab('info'); return; }
    const e: Exam = { id: exam?.id || generateId(), ...info, questions, createdAt: exam?.createdAt || new Date().toISOString() };
    exportToJSON(e);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1 font-medium"
          >
            ← بازگشت
          </button>
          <h2 className="font-bold text-gray-900 text-sm flex-1 text-center truncate">
            {exam ? 'ویرایش آزمون' : 'آزمون جدید'}
          </h2>
          <button
            onClick={handleSave}
            className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'
            }`}
          >
            {saved ? '✓ ذخیره شد' : '💾 ذخیره'}
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-4 pb-0 flex gap-1">
          <button
            onClick={() => setTab('info')}
            className={`text-sm font-medium px-4 py-2 border-b-2 transition-colors ${
              tab === 'info'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            اطلاعات آزمون
          </button>
          <button
            onClick={() => setTab('questions')}
            className={`text-sm font-medium px-4 py-2 border-b-2 transition-colors ${
              tab === 'questions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            سوالات ({questions.length})
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Info Tab */}
        {tab === 'info' && (
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">اطلاعات پایه آزمون</h3>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">عنوان آزمون *</label>
              <input
                type="text"
                value={info.title}
                onChange={e => setInfo(i => ({ ...i, title: e.target.value }))}
                placeholder="مثال: آزمون نوبت اول ریاضی"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">درس</label>
                <input
                  type="text"
                  value={info.subject}
                  onChange={e => setInfo(i => ({ ...i, subject: e.target.value }))}
                  placeholder="مثال: ریاضی"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">پایه تحصیلی</label>
                <input
                  type="text"
                  value={info.grade}
                  onChange={e => setInfo(i => ({ ...i, grade: e.target.value }))}
                  placeholder="مثال: هفتم"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">نام معلم</label>
                <input
                  type="text"
                  value={info.teacherName}
                  onChange={e => setInfo(i => ({ ...i, teacherName: e.target.value }))}
                  placeholder="نام و نام خانوادگی"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">نام مدرسه</label>
                <input
                  type="text"
                  value={info.schoolName}
                  onChange={e => setInfo(i => ({ ...i, schoolName: e.target.value }))}
                  placeholder="نام مدرسه"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">مدت آزمون (دقیقه)</label>
                <input
                  type="number"
                  min={5}
                  value={info.duration}
                  onChange={e => setInfo(i => ({ ...i, duration: parseInt(e.target.value) || 60 }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">سال تحصیلی</label>
                <input
                  type="text"
                  value={info.academicYear}
                  onChange={e => setInfo(i => ({ ...i, academicYear: e.target.value }))}
                  placeholder="1403-1404"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">توضیحات (اختیاری)</label>
              <textarea
                value={info.description}
                onChange={e => setInfo(i => ({ ...i, description: e.target.value }))}
                placeholder="توضیحات آزمون..."
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <button
              onClick={() => setTab('questions')}
              className="btn-primary w-full"
            >
              ادامه: افزودن سوالات ←
            </button>
          </div>
        )}

        {/* Questions Tab */}
        {tab === 'questions' && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="card p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">مجموع سوالات</p>
                <p className="text-lg font-bold text-gray-900">{questions.length} سوال</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">مجموع نمرات</p>
                <p className="text-lg font-bold text-indigo-600">{totalScore} نمره</p>
              </div>
              <div className="flex gap-2">
                {banks.length > 0 && (
                  <button
                    onClick={() => setShowBankPicker(!showBankPicker)}
                    className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-xl font-medium hover:bg-purple-100 transition-colors"
                  >
                    📥 از بانک
                  </button>
                )}
                <button
                  onClick={() => { setEditingQ(undefined); setShowEditor(true); }}
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  + سوال جدید
                </button>
              </div>
            </div>

            {/* Bank picker */}
            {showBankPicker && (
              <div className="card p-4 space-y-3 border-purple-100">
                <p className="text-sm font-bold text-gray-900">وارد کردن از بانک سوالات</p>
                <select
                  value={selectedBankId}
                  onChange={e => setSelectedBankId(e.target.value)}
                  className="input-field"
                >
                  <option value="">انتخاب بانک...</option>
                  {banks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.questions.length} سوال)
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleImportFromBank}
                    disabled={!selectedBankId}
                    className="btn-primary text-sm flex-1 disabled:opacity-50"
                  >
                    وارد کردن همه سوالات
                  </button>
                  <button
                    onClick={() => setShowBankPicker(false)}
                    className="btn-secondary text-sm"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            )}

            {/* Question editor */}
            {showEditor && (
              <QuestionEditor
                question={editingQ}
                onSave={handleAddQuestion}
                onCancel={() => { setShowEditor(false); setEditingQ(undefined); }}
              />
            )}

            {/* Questions list */}
            {questions.length === 0 && !showEditor ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                <div className="text-4xl mb-3">❓</div>
                <p className="text-gray-500 text-sm">هنوز سوالی اضافه نشده است</p>
                <button
                  onClick={() => setShowEditor(true)}
                  className="mt-4 bg-indigo-600 text-white text-sm font-semibold px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  اولین سوال را اضافه کنید
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionItem
                    key={q.id}
                    question={q}
                    index={i}
                    onEdit={() => { setEditingQ(q); setShowEditor(true); }}
                    onDelete={() => handleDeleteQuestion(q.id)}
                  />
                ))}
              </div>
            )}

            {/* Export */}
            {questions.length > 0 && (
              <div className="card p-4 space-y-3">
                <p className="text-sm font-bold text-gray-900">خروجی آزمون</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="flex flex-col items-center gap-1 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-medium text-red-700 transition-colors disabled:opacity-50"
                  >
                    <span className="text-lg">📄</span>
                    PDF
                  </button>
                  <button
                    onClick={handleExportText}
                    className="flex flex-col items-center gap-1 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-medium text-blue-700 transition-colors"
                  >
                    <span className="text-lg">📝</span>
                    متن
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex flex-col items-center gap-1 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-medium text-amber-700 transition-colors"
                  >
                    <span className="text-lg">💾</span>
                    JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
