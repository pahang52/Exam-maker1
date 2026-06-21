import { Question, QuestionType } from '../types';

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'چند گزینه‌ای',
  true_false: 'صحیح و غلط',
  short_answer: 'جواب کوتاه',
  fill_blank: 'جای خالی',
  descriptive: 'تشریحی',
  matching: 'جور کردنی',
};

const TYPE_COLORS: Record<QuestionType, string> = {
  multiple_choice: 'bg-blue-100 text-blue-700',
  true_false: 'bg-green-100 text-green-700',
  short_answer: 'bg-yellow-100 text-yellow-700',
  fill_blank: 'bg-purple-100 text-purple-700',
  descriptive: 'bg-orange-100 text-orange-700',
  matching: 'bg-pink-100 text-pink-700',
};

interface Props {
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

export default function QuestionCard({ question, index, onEdit, onDelete, onDuplicate }: Props) {
  const optionLabels = ['الف', 'ب', 'ج', 'د', 'ه', 'و'];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[question.type]}`}>
            {TYPE_LABELS[question.type]}
          </span>
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
          {question.score} نمره
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-800 leading-relaxed font-medium">{question.text}</p>

      {question.type === 'multiple_choice' && question.options && (
        <div className="mt-2 space-y-1">
          {question.options.map((opt, i) => {
            const isCorrect = question.correctAnswer === opt.id;
            return (
              <div
                key={opt.id}
                className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg ${
                  isCorrect ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600'
                }`}
              >
                <span className="font-bold w-5">{optionLabels[i]})</span>
                <span>{opt.text}</span>
                {isCorrect && <span className="mr-auto">✓</span>}
              </div>
            );
          })}
        </div>
      )}

      {question.type === 'true_false' && (
        <div className="mt-2 text-xs">
          <span className={`px-3 py-1 rounded-full font-semibold ${
            question.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            پاسخ: {question.correctAnswer ? 'صحیح ✅' : 'غلط ❌'}
          </span>
        </div>
      )}

      {(question.type === 'short_answer' || question.type === 'fill_blank') && question.correctAnswer && (
        <div className="mt-2 text-xs text-gray-500">
          پاسخ: <span className="text-indigo-600 font-medium">{question.correctAnswer as string}</span>
        </div>
      )}

      {question.type === 'matching' && question.matchingPairs && (
        <div className="mt-2 space-y-1">
          {question.matchingPairs.map((pair, i) => (
            <div key={pair.id} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-bold">{i + 1}.</span>
              <span className="bg-blue-50 px-2 py-0.5 rounded">{pair.left}</span>
              <span>↔</span>
              <span className="bg-green-50 px-2 py-0.5 rounded">{pair.right}</span>
            </div>
          ))}
        </div>
      )}

      {question.hint && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
          💡 {question.hint}
        </div>
      )}

      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
        <button
          onClick={onEdit}
          className="flex-1 text-xs text-indigo-600 hover:bg-indigo-50 py-1.5 rounded-lg transition-colors font-medium"
        >
          ✏️ ویرایش
        </button>
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className="flex-1 text-xs text-gray-600 hover:bg-gray-50 py-1.5 rounded-lg transition-colors font-medium"
          >
            📋 کپی
          </button>
        )}
        <button
          onClick={onDelete}
          className="flex-1 text-xs text-red-500 hover:bg-red-50 py-1.5 rounded-lg transition-colors font-medium"
        >
          🗑️ حذف
        </button>
      </div>
    </div>
  );
}
