import { useState } from 'react';
import { ExamBank, Question } from '../types';
import { generateId } from '../utils/id';
import QuestionEditor from '../components/QuestionEditor';
import QuestionCard from '../components/QuestionCard';

interface Props {
  banks: ExamBank[];
  onSaveBank: (bank: ExamBank) => void;
  onDeleteBank: (id: string) => void;
  onAddQuestion: (bankId: string, q: Question) => void;
  onDeleteQuestion: (bankId: string, qId: string) => void;
  onBack: () => void;
}

export default function BankPage({ banks, onSaveBank, onDeleteBank, onAddQuestion, onDeleteQuestion, onBack }: Props) {
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [showNewBank, setShowNewBank] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankSubject, setNewBankSubject] = useState('');
  const [newBankGrade, setNewBankGrade] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | undefined>();
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium">
            ← بازگشت
          </button>
          <h1 className="text-base font-bold text-gray-900">🗃️ بانک سوالات</h1>
          <button
            onClick={() => setShowNewBank(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            + بانک جدید
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* New bank form */}
        {showNewBank && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="font-bold text-gray-800">ایجاد بانک جدید</h3>
            <input
              value={newBankName}
              onChange={e => setNewBankName(e.target.value)}
              placeholder="نام بانک سوالات *"
              className="input-field"
            />
            <div className="grid grid-cols-2 gap-3">
              <input value={newBankSubject} onChange={e => setNewBankSubject(e.target.value)}
                placeholder="درس" className="input-field" />
              <input value={newBankGrade} onChange={e => setNewBankGrade(e.target.value)}
                placeholder="پایه" className="input-field" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateBank}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl text-sm transition-colors">
                ✓ ایجاد
              </button>
              <button onClick={() => setShowNewBank(false)}
                className="px-4 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                انصراف
              </button>
            </div>
          </div>
        )}

        {/* Bank list */}
        {banks.length === 0 && !showNewBank ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="text-4xl mb-3">🗃️</div>
            <p className="text-gray-500 text-sm mb-4">هیچ بانک سوالاتی ندارید</p>
            <button onClick={() => setShowNewBank(true)}
              className="bg-indigo-600 text-white text-sm font-semibold px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
              + ایجاد اولین بانک
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {banks.map(bank => (
              <div key={bank.id}
                className={`bg-white rounded-xl border shadow-sm transition-all cursor-pointer ${
                  selectedBankId === bank.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-100 hover:border-indigo-200'
                }`}
              >
                <div
                  className="p-4 flex items-center justify-between"
                  onClick={() => setSelectedBankId(selectedBankId === bank.id ? null : bank.id)}
                >
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{bank.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {bank.subject && `${bank.subject} • `}{bank.grade && `پایه ${bank.grade} • `}
                      {bank.questions.length} سوال
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {confirmDelete === bank.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); onDeleteBank(bank.id); setConfirmDelete(null); setSelectedBankId(null); }}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg"
                        >حذف</button>
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmDelete(null); }}
                          className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg"
                        >لغو</button>
                      </div>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDelete(bank.id); }}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >🗑️</button>
                    )}
                    <span className={`text-gray-400 text-sm transition-transform ${selectedBankId === bank.id ? 'rotate-180' : ''}`}>▾</span>
                  </div>
                </div>

                {selectedBankId === bank.id && (
                  <div className="border-t border-gray-100 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">سوالات بانک</span>
                      <button
                        onClick={() => { setEditingQ(undefined); setShowEditor(true); }}
                        className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      >+ سوال جدید</button>
                    </div>

                    {showEditor && (
                      <QuestionEditor
                        question={editingQ}
                        onSave={handleSaveQuestion}
                        onCancel={() => { setShowEditor(false); setEditingQ(undefined); }}
                      />
                    )}

                    {bank.questions.length === 0 && !showEditor ? (
                      <p className="text-center text-gray-400 text-sm py-6">سوالی در این بانک وجود ندارد</p>
                    ) : (
                      <div className="space-y-2">
                        {bank.questions.map((q, i) => (
                          <QuestionCard
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
