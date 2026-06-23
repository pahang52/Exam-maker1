import { useState } from 'react';
import { Question, QuestionType } from '../types';

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'چند گزینه‌ای',
  true_false: 'صحیح و غلط',
  short_answer: 'کوتاه‌پاسخ',
  fill_blank: 'جای خالی',
  descriptive: 'تشریحی',
  matching: 'جور کردنی',
};

const TYPE_ICONS: Record<QuestionType, string> = {
  multiple_choice: '🔘',
  true_false: '✅',
  short_answer: '✏️',
  fill_blank: '🔲',
  descriptive: '📝',
  matching: '🔗',
};

interface Props {
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function QuestionItem({ question, index, onEdit, onDelete }: Props) {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-gray-400">{index + 1}.</span>
              <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full">
                {TYPE_ICONS[question.type]} {TYPE_LABELS[question.type]}
              </span>
              <span className="text-xs bg-amber-50 text-amber-600 font-medium px-2 py-0.5 rounded-full">
                {question.score} نمره
              </span>
            </div>
            <p className="text-sm text-gray-800 font-medium line-clamp-2">{question.text}</p>
            {question.hint && (
              <p className="text-xs text-gray-400 mt-1 italic">💡 {question.hint}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onEdit}
              className="text-indigo-600 hover:bg-indigo-50 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              ✏️
            </button>
            {confirm ? (
              <div className="flex gap-1">
                <button onClick={onDelete} className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg">حذف</button>
                <button onClick={() => setConfirm(false)} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg">لغو</button>
              </div>
            ) : (
              <button onClick={() => setConfirm(true)} className="text-red-400 hover:text-red-600 text-xs px-1">🗑️</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
