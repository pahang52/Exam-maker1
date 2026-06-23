import { useState } from 'react';
import { Question, QuestionType, Option, MatchingPair } from '../types';
import { generateId } from '../utils/id';

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

  const updateOption = (id: string, value: string) => {
    setOptions(opts => opts.map(o => (o.id === id ? { ...o, text: value } : o)));
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
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-md p-4 space-y-4">
      {/* Type selector */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">نوع سوال</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TYPE_LABELS) as QuestionType[]).map(t => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                type === t
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              <span>{TYPE_ICONS[t]}</span>
              <span>{TYPE_LABELS[t]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Question text */}
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">متن سوال *</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="متن سوال را اینجا بنویسید..."
          rows={3}
          className="input-field resize-none"
        />
      </div>

      {/* Multiple choice options */}
      {type === 'multiple_choice' && (
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-2 block">گزینه‌ها</label>
          <div className="space-y-2">
            {options.map((opt, i) => {
              const labels = ['الف', 'ب', 'ج', 'د', 'ه', 'و'];
              return (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={correctAnswer === opt.id}
                    onChange={() => setCorrectAnswer(opt.id)}
                    className="accent-indigo-600 w-4 h-4 flex-shrink-0"
                  />
                  <span className="text-xs text-gray-500 w-5 flex-shrink-0">{labels[i]}</span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={e => updateOption(opt.id, e.target.value)}
                    placeholder={`گزینه ${labels[i]}`}
                    className="input-field"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(opt.id)}
                      className="text-red-400 hover:text-red-600 text-sm px-1 flex-shrink-0"
                    >✕</button>
                  )}
                </div>
              );
            })}
          </div>
          {options.length < 6 && (
            <button
              onClick={addOption}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              + افزودن گزینه
            </button>
          )}
          <p className="text-xs text-gray-400 mt-1">گزینه صحیح را با کلیک روی دایره انتخاب کنید</p>
        </div>
      )}

      {/* True/False */}
      {type === 'true_false' && (
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-2 block">پاسخ صحیح</label>
          <div className="flex gap-3">
            <button
              onClick={() => setCorrectAnswer(true)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                correctAnswer === true
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
              }`}
            >✅ صحیح</button>
            <button
              onClick={() => setCorrectAnswer(false)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                correctAnswer === false
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
              }`}
            >❌ غلط</button>
          </div>
        </div>
      )}

      {/* Short answer / Fill blank */}
      {(type === 'short_answer' || type === 'fill_blank') && (
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">پاسخ صحیح (اختیاری)</label>
          <input
            type="text"
            value={correctAnswer as string}
            onChange={e => setCorrectAnswer(e.target.value)}
            placeholder="پاسخ صحیح را وارد کنید"
            className="input-field"
          />
        </div>
      )}

      {/* Matching pairs */}
      {type === 'matching' && (
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-2 block">جفت‌ها</label>
          <div className="space-y-2">
            {matchingPairs.map((pair, i) => (
              <div key={pair.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 flex-shrink-0">{i + 1}.</span>
                <input
                  type="text"
                  value={pair.left}
                  onChange={e => updatePair(pair.id, 'left', e.target.value)}
                  placeholder="ستون الف"
                  className="input-field"
                />
                <span className="text-gray-400 flex-shrink-0">↔</span>
                <input
                  type="text"
                  value={pair.right}
                  onChange={e => updatePair(pair.id, 'right', e.target.value)}
                  placeholder="ستون ب"
                  className="input-field"
                />
                {matchingPairs.length > 2 && (
                  <button
                    onClick={() => removePair(pair.id)}
                    className="text-red-400 hover:text-red-600 text-sm px-1 flex-shrink-0"
                  >✕</button>
                )}
              </div>
            ))}
          </div>
          {matchingPairs.length < 6 && (
            <button
              onClick={addPair}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              + افزودن جفت
            </button>
          )}
        </div>
      )}

      {/* Score & Hint */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">نمره</label>
          <input
            type="number"
            min={0.25}
            step={0.25}
            value={score}
            onChange={e => setScore(parseFloat(e.target.value) || 1)}
            className="input-field"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">راهنمایی (اختیاری)</label>
          <input
            type="text"
            value={hint}
            onChange={e => setHint(e.target.value)}
            placeholder="راهنمایی کوتاه"
            className="input-field"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button onClick={handleSave} className="btn-primary flex-1">
          💾 ذخیره سوال
        </button>
        <button onClick={onCancel} className="btn-secondary flex-1">
          انصراف
        </button>
      </div>
    </div>
  );
}
