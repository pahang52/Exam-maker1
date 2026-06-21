import { useState } from 'react';
import { Question, QuestionType, Option, MatchingPair } from '../types';
import { generateId } from '../utils/id';

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'چند گزینه‌ای',
  true_false: 'صحیح و غلط',
  short_answer: 'جواب کوتاه',
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
  question?: Question;
  onSave: (q: Question) => void;
  onCancel: () => void;
}

const defaultOptions = (): Option[] => [
  { id: generateId(), text: '' },
  { id: generateId(), text: '' },
  { id: generateId(), text: '' },
  { id: generateId(), text: '' },
];

const defaultPairs = (): MatchingPair[] => [
  { id: generateId(), left: '', right: '' },
  { id: generateId(), left: '', right: '' },
  { id: generateId(), left: '', right: '' },
];

export default function QuestionEditor({ question, onSave, onCancel }: Props) {
  const [type, setType] = useState<QuestionType>(question?.type || 'multiple_choice');
  const [text, setText] = useState(question?.text || '');
  const [options, setOptions] = useState<Option[]>(question?.options || defaultOptions());
  const [correctAnswer, setCorrectAnswer] = useState<string | boolean>(
    question?.correctAnswer ?? ''
  );
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>(
    question?.matchingPairs || defaultPairs()
  );
  const [score, setScore] = useState(question?.score || 1);
  const [hint, setHint] = useState(question?.hint || '');
  const [error, setError] = useState('');

  const handleTypeChange = (t: QuestionType) => {
    setType(t);
    setError('');
    if (t === 'multiple_choice') setOptions(question?.options || defaultOptions());
    if (t === 'true_false') setCorrectAnswer(true);
    if (t === 'matching') setMatchingPairs(question?.matchingPairs || defaultPairs());
  };

  const updateOption = (id: string, text: string) => {
    setOptions(opts => opts.map(o => (o.id === id ? { ...o, text } : o)));
  };

  const addOption = () => {
    if (options.length < 6) setOptions(opts => [...opts, { id: generateId(), text: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) setOptions(opts => opts.filter(o => o.id !== id));
  };

  const updatePair = (id: string, side: 'left' | 'right', val: string) => {
    setMatchingPairs(ps => ps.map(p => (p.id === id ? { ...p, [side]: val } : p)));
  };

  const addPair = () => {
    if (matchingPairs.length < 6)
      setMatchingPairs(ps => [...ps, { id: generateId(), left: '', right: '' }]);
  };

  const removePair = (id: string) => {
    if (matchingPairs.length > 2)
      setMatchingPairs(ps => ps.filter(p => p.id !== id));
  };

  const validate = (): boolean => {
    if (!text.trim()) { setError('متن سوال را وارد کنید'); return false; }
    if (type === 'multiple_choice') {
      if (options.some(o => !o.text.trim())) { setError('همه گزینه‌ها را پر کنید'); return false; }
      if (!correctAnswer) { setError('گزینه صحیح را انتخاب کنید'); return false; }
    }
    if (type === 'matching') {
      if (matchingPairs.some(p => !p.left.trim() || !p.right.trim())) {
        setError('همه جفت‌ها را پر کنید'); return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    const q: Question = {
      id: question?.id || generateId(),
      type,
      text: text.trim(),
      score,
      hint: hint.trim() || undefined,
      ...(type === 'multiple_choice' && { options, correctAnswer }),
      ...(type === 'true_false' && { correctAnswer }),
      ...(type === 'short_answer' && { correctAnswer: (correctAnswer as string) || '' }),
      ...(type === 'fill_blank' && { correctAnswer: (correctAnswer as string) || '' }),
      ...(type === 'matching' && { matchingPairs }),
    };
    onSave(q);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-5">
      {/* Type selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">نوع سوال</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(TYPE_LABELS) as QuestionType[]).map(t => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-medium transition-all ${
                type === t
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-200 text-gray-600'
              }`}
            >
              <span className="text-lg">{TYPE_ICONS[t]}</span>
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Question text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">متن سوال *</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          placeholder="سوال خود را اینجا بنویسید..."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
      </div>

      {/* Multiple choice options */}
      {type === 'multiple_choice' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">گزینه‌ها</label>
          <div className="space-y-2">
            {options.map((opt, idx) => {
              const labels = ['الف', 'ب', 'ج', 'د', 'ه', 'و'];
              return (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={correctAnswer === opt.id}
                    onChange={() => setCorrectAnswer(opt.id)}
                    className="accent-indigo-600 w-4 h-4 flex-shrink-0"
                    title="گزینه صحیح"
                  />
                  <span className="text-xs text-gray-500 w-6 text-center font-bold">{labels[idx]}</span>
                  <input
                    value={opt.text}
                    onChange={e => updateOption(opt.id, e.target.value)}
                    placeholder={`گزینه ${labels[idx]}`}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(opt.id)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none"
                    >×</button>
                  )}
                </div>
              );
            })}
          </div>
          {options.length < 6 && (
            <button
              onClick={addOption}
              className="mt-2 text-indigo-600 text-sm hover:underline"
            >+ افزودن گزینه</button>
          )}
          <p className="text-xs text-gray-400 mt-1">دایره کنار گزینه صحیح را انتخاب کنید</p>
        </div>
      )}

      {/* True/False */}
      {type === 'true_false' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">پاسخ صحیح</label>
          <div className="flex gap-4">
            {[true, false].map(val => (
              <button
                key={String(val)}
                onClick={() => setCorrectAnswer(val)}
                className={`flex-1 py-2 rounded-xl border-2 font-medium text-sm transition-all ${
                  correctAnswer === val
                    ? val
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {val ? '✅ صحیح' : '❌ غلط'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Short answer / Fill blank */}
      {(type === 'short_answer' || type === 'fill_blank') && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">پاسخ صحیح (اختیاری)</label>
          <input
            value={correctAnswer as string}
            onChange={e => setCorrectAnswer(e.target.value)}
            placeholder="پاسخ صحیح را بنویسید..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      )}

      {/* Matching pairs */}
      {type === 'matching' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">جفت‌های مطابقت</label>
          <div className="space-y-2">
            {matchingPairs.map((pair, idx) => (
              <div key={pair.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-5 text-center">{idx + 1}</span>
                <input
                  value={pair.left}
                  onChange={e => updatePair(pair.id, 'left', e.target.value)}
                  placeholder="ستون الف"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <span className="text-gray-400">↔</span>
                <input
                  value={pair.right}
                  onChange={e => updatePair(pair.id, 'right', e.target.value)}
                  placeholder="ستون ب"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                {matchingPairs.length > 2 && (
                  <button
                    onClick={() => removePair(pair.id)}
                    className="text-red-400 hover:text-red-600 text-lg"
                  >×</button>
                )}
              </div>
            ))}
          </div>
          {matchingPairs.length < 6 && (
            <button onClick={addPair} className="mt-2 text-indigo-600 text-sm hover:underline">
              + افزودن ردیف
            </button>
          )}
        </div>
      )}

      {/* Score & Hint */}
      <div className="flex gap-3">
        <div className="w-32">
          <label className="block text-sm font-semibold text-gray-700 mb-1">نمره</label>
          <input
            type="number"
            min={0.25}
            step={0.25}
            value={score}
            onChange={e => setScore(parseFloat(e.target.value) || 1)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">راهنمایی (اختیاری)</label>
          <input
            value={hint}
            onChange={e => setHint(e.target.value)}
            placeholder="راهنمایی برای دانش‌آموز..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          💾 ذخیره سوال
        </button>
        <button
          onClick={onCancel}
          className="px-6 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}
