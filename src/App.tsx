import { useState } from 'react';
import { Exam } from './types';
import { useExamStore, useBankStore } from './store/useStore';
import HomePage from './pages/HomePage';
import ExamBuilder from './pages/ExamBuilder';
import BankPage from './pages/BankPage';

type Page = 'home' | 'builder' | 'bank';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [editingExam, setEditingExam] = useState<Exam | undefined>();

  const { exams, saveExam, deleteExam } = useExamStore();
  const { banks, saveBank, deleteBank, addQuestionToBank, deleteQuestionFromBank } = useBankStore();

  const handleNewExam = () => {
    setEditingExam(undefined);
    setPage('builder');
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setPage('builder');
  };

  const handleSaveExam = (exam: Exam) => {
    saveExam(exam);
  };

  return (
    <>
      {page === 'home' && (
        <HomePage
          exams={exams}
          banks={banks}
          onNewExam={handleNewExam}
          onEditExam={handleEditExam}
          onDeleteExam={deleteExam}
          onOpenBank={() => setPage('bank')}
        />
      )}
      {page === 'builder' && (
        <ExamBuilder
          exam={editingExam}
          banks={banks}
          onSave={handleSaveExam}
          onBack={() => setPage('home')}
        />
      )}
      {page === 'bank' && (
        <BankPage
          banks={banks}
          onSaveBank={saveBank}
          onDeleteBank={deleteBank}
          onAddQuestion={addQuestionToBank}
          onDeleteQuestion={deleteQuestionFromBank}
          onBack={() => setPage('home')}
        />
      )}
    </>
  );
}
