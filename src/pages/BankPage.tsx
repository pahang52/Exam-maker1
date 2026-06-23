import { useState } from 'react';
import { ExamBank, Question } from '../types';
import { generateId } from '../utils/id';
import QuestionEditor from '../components/QuestionEditor';
import QuestionItem from '../components/QuestionItem';

interface Props {
  banks: ExamBank[];
  onSaveBank: (bank: ExamBank) => void;
  onDeleteBank: (id: string) => void;
  onAddQuestion: (bankId: string, question: Question) => void;
  onDeleteQuestion: (bankId: string, questionId: string) => void;
  onBack: () => void;
}

export default function BankPage({
  banks,
  onSaveBank,
  onDeleteBank,
  onAddQuestion,
  onDeleteQuestion,
  onBack,
}: Props) {
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | undefined>();
  const [showNewBank, setShowNewBank] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankSubject, setNewBankSubject] = useState('');
  const [newBankGrade, setNewBankGrade] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleCreateBank = () => {
    if (!newBankName.trim()) return;
    const bank: ExamBank = {
      id: generateId(),
      name: newBankName.trim(),
      subject: newBankSubject.trim(),
      grade: newBankGrade.trim(),
      questions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveBank(bank);
    setNewBankName('');
    setNewBankSubject('');
    setNewBankGrade('');
    setShowNewBank(false);
    setSelectedBankId(bank.id);
  };

  const handleSaveQuestion = (q: Question) => {
    if (!selectedBankId) return;
    onAddQuestion(selectedBankId, q);
    setShowEditor(false);
    setEditingQ(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1 font-medium"
          >
            ← بازگشت
          </button>
          <h2 className="font-bold text-gray-900 text-sm flex-1 text-center">بانک سوالات</h2>
          <button
            onClick={() => setShowNewBank(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-md shadow-purple-200"
          >
            + بانک جدید
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* New bank form */}
        {showNewBank && (
          <div className="card p-4 space-y-3 border-purple-100">
            <p className="text-sm font-bold text-gray-900">ایجاد بانک جدید</p>
            <input
              type="text"
              value={newBankName}
              onChange={e => setNewBankName(e.target.value)}
              placeholder="نام بانک سوالات *"
              className="input-field"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newBankSubject}
                onChange={e => setNewBankSubject(e.target.value)}
                placeholder="درس"
                className="input-field"
              />
              <input
                type="text"
                value={newBankGrade}
                onChange={e => setNewBankGrade(e.target.value)}
                placeholder="پایه"
                className="input-field"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateBank}
                disabled={!newBankName.trim()}
                className="btn-primary text-sm flex-1 disabled:opacity-50"
              >
                ایجاد بانک
              </button>
              <button
                onClick={() => { setShowNewBank(false); setNewBankName(''); setNewBankSubject(''); setNewBankGrade(''); }}
                className="btn-secondary text-sm"
              >
                انصراف
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {banks.length === 0 && !showNewBank ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <div className="text-4xl mb-3">🗃️</div>
            <p className="text-gray-500 text-sm">هیچ بانک سوالاتی ندارید</p>
            <button
              onClick={() => setShowNewBank(true)}
              className="mt-4 bg-purple-600 text-white text-sm font-semibold px-6 py-2 rounded-xl hover:bg-purple-700 transition-colors"
            >
              اولین بانک را بسازید
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {banks.map(bank => (
              <div key={bank.id} className="card overflow-hidden">
                {/* Bank header */}
                <button
                  className="w-full p-4 text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedBankId(selectedBankId === bank.id ? null : bank.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{bank.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {bank.subject && `${bank.subject} • `}
                      {bank.grade && `پایه ${bank.grade} • `}
                      {bank.questions.length} سوال
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 mr-2">
                    {confirmDelete === bank.id ? (
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => { onDeleteBank(bank.id); setConfirmDelete(null); setSelectedBankId(null); }}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg"
                        >
                          حذف
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg"
                        >
                          لغو
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDelete(bank.id); }}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        🗑️
                      </button>
                    )}
                    <span className={`text-gray-400 transition-transform ${selectedBankId === bank.id ? 'rotate-180' : ''}`}>
                      ▾
                    </span>
                  </div>
                </button>

                {/* Bank body */}
                {selectedBankId === bank.id && (
                  <div className="border-t border-gray-100 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-500">سوالات بانک</p>
                      <button
                        onClick={() => { setEditingQ(undefined); setShowEditor(true); }}
                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
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

                    {bank.questions.length === 0 && !showEditor ? (
                      <div className="text-center py-6 text-sm text-gray-400">
                        <div className="text-2xl mb-2">❓</div>
                        سوالی در این بانک وجود ندارد
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {bank.questions.map((q, i) => (
                          <QuestionItem
                            key={q.id}
                            question={q}
                            index={i}
                            onEdit={() => { setEditingQ(q); setShowEditor(true); }}
                            onDelete={() => onDeleteQuestion(bank.id, q.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
