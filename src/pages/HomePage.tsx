import { useState } from 'react';
import { Exam, ExamBank } from '../types';

interface Props {
  exams: Exam[];
  banks: ExamBank[];
  onNewExam: () => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  onOpenBank: () => void;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function ExamItem({
  exam,
  onEdit,
  onDelete,
}: {
  exam: Exam;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const totalScore = exam.questions.reduce((s, q) => s + q.score, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm truncate">{exam.title}</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              <span className="text-xs text-gray-500">{exam.subject}</span>
              {exam.grade && (
                <span className="text-xs text-gray-500">پایه {exam.grade}</span>
              )}
              <span className="text-xs text-gray-500">
                {exam.questions.length} سوال • {totalScore} نمره
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{formatDate(exam.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onEdit}
              className="text-indigo-600 hover:bg-indigo-50 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              ✏️ ویرایش
            </button>
            {confirm ? (
              <div className="flex gap-1">
                <button
                  onClick={onDelete}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg"
                >
                  حذف
                </button>
                <button
                  onClick={() => setConfirm(false)}
                  className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg"
                >
                  لغو
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirm(true)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage({
  exams,
  banks,
  onNewExam,
  onEditExam,
  onDeleteExam,
  onOpenBank,
}: Props) {
  const totalQuestions = exams.reduce((s, e) => s + e.questions.length, 0);
  const bankQuestions = banks.reduce((s, b) => s + b.questions.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-lg">
              🎓
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">طراحی آزمون</h1>
              <p className="text-xs text-gray-500">نیکزاد فرد</p>
            </div>
          </div>
          <button
            onClick={onNewExam}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-md shadow-indigo-200"
          >
            + آزمون جدید
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'آزمون‌ها', value: exams.length, icon: '📄', color: 'from-blue-500 to-indigo-600' },
            { label: 'سوالات', value: totalQuestions, icon: '❓', color: 'from-purple-500 to-pink-600' },
            { label: 'بانک سوال', value: bankQuestions, icon: '🗃️', color: 'from-emerald-500 to-teal-600' },
          ].map(stat => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white text-center shadow-lg`}
            >
              <div className="text-2xl">{stat.icon}</div>
              <div className="text-2xl font-bold mt-1">{stat.value}</div>
              <div className="text-xs opacity-80 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onNewExam}
            className="bg-white hover:bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-right shadow-sm hover:shadow-md transition-all group"
          >
            <div className="text-2xl mb-2">✏️</div>
            <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-700">آزمون جدید</p>
            <p className="text-xs text-gray-500 mt-0.5">طراحی آزمون با ۶ نوع سوال</p>
          </button>
          <button
            onClick={onOpenBank}
            className="bg-white hover:bg-purple-50 border border-purple-100 rounded-2xl p-5 text-right shadow-sm hover:shadow-md transition-all group"
          >
            <div className="text-2xl mb-2">🗃️</div>
            <p className="font-bold text-gray-900 text-sm group-hover:text-purple-700">بانک سوالات</p>
            <p className="text-xs text-gray-500 mt-0.5">مدیریت و ذخیره سوالات</p>
          </button>
        </div>

        {/* Exams list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-sm">آزمون‌های ذخیره‌شده</h2>
            {exams.length > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {exams.length} آزمون
              </span>
            )}
          </div>

          {exams.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500 text-sm">هنوز آزمونی ذخیره نشده است</p>
              <button
                onClick={onNewExam}
                className="mt-4 bg-indigo-600 text-white text-sm font-semibold px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                اولین آزمون را بسازید
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {exams.map(exam => (
                <ExamItem
                  key={exam.id}
                  exam={exam}
                  onEdit={() => onEditExam(exam)}
                  onDelete={() => onDeleteExam(exam.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-4">
          <p>تمامی حقوق محفوظ است © {new Date().getFullYear()}</p>
          <p className="mt-0.5">داده‌ها به‌صورت محلی در مرورگر ذخیره می‌شوند</p>
        </div>
      </div>
    </div>
  );
}
