import { useState, useCallback } from 'react';
import { Exam, ExamBank, Question } from '../types';

const STORAGE_KEY_EXAMS = 'exam_maker_exams';
const STORAGE_KEY_BANKS = 'exam_maker_banks';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.error('خطا در ذخیره‌سازی');
  }
}

export function useExamStore() {
  const [exams, setExams] = useState<Exam[]>(() =>
    loadFromStorage<Exam[]>(STORAGE_KEY_EXAMS, [])
  );

  const saveExam = useCallback((exam: Exam) => {
    setExams(prev => {
      const exists = prev.findIndex(e => e.id === exam.id);
      let updated: Exam[];
      if (exists >= 0) {
        updated = prev.map(e => (e.id === exam.id ? exam : e));
      } else {
        updated = [exam, ...prev];
      }
      saveToStorage(STORAGE_KEY_EXAMS, updated);
      return updated;
    });
  }, []);

  const deleteExam = useCallback((id: string) => {
    setExams(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveToStorage(STORAGE_KEY_EXAMS, updated);
      return updated;
    });
  }, []);

  const getExam = useCallback(
    (id: string) => exams.find(e => e.id === id),
    [exams]
  );

  return { exams, saveExam, deleteExam, getExam };
}

export function useBankStore() {
  const [banks, setBanks] = useState<ExamBank[]>(() =>
    loadFromStorage<ExamBank[]>(STORAGE_KEY_BANKS, [])
  );

  const saveBank = useCallback((bank: ExamBank) => {
    setBanks(prev => {
      const exists = prev.findIndex(b => b.id === bank.id);
      let updated: ExamBank[];
      if (exists >= 0) {
        updated = prev.map(b => (b.id === bank.id ? bank : b));
      } else {
        updated = [bank, ...prev];
      }
      saveToStorage(STORAGE_KEY_BANKS, updated);
      return updated;
    });
  }, []);

  const deleteBank = useCallback((id: string) => {
    setBanks(prev => {
      const updated = prev.filter(b => b.id !== id);
      saveToStorage(STORAGE_KEY_BANKS, updated);
      return updated;
    });
  }, []);

  const addQuestionToBank = useCallback(
    (bankId: string, question: Question) => {
      setBanks(prev => {
        const updated = prev.map(b => {
          if (b.id !== bankId) return b;
          const exists = b.questions.findIndex(q => q.id === question.id);
          const questions =
            exists >= 0
              ? b.questions.map(q => (q.id === question.id ? question : q))
              : [...b.questions, question];
          return { ...b, questions, updatedAt: new Date().toISOString() };
        });
        saveToStorage(STORAGE_KEY_BANKS, updated);
        return updated;
      });
    },
    []
  );

  const deleteQuestionFromBank = useCallback(
    (bankId: string, questionId: string) => {
      setBanks(prev => {
        const updated = prev.map(b => {
          if (b.id !== bankId) return b;
          return {
            ...b,
            questions: b.questions.filter(q => q.id !== questionId),
            updatedAt: new Date().toISOString(),
          };
        });
        saveToStorage(STORAGE_KEY_BANKS, updated);
        return updated;
      });
    },
    []
  );

  const getBank = useCallback(
    (id: string) => banks.find(b => b.id === id),
    [banks]
  );

  return {
    banks,
    saveBank,
    deleteBank,
    addQuestionToBank,
    deleteQuestionFromBank,
    getBank,
  };
}
