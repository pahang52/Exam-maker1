import { Exam, Question, QuestionType } from '../types';
import jsPDF from 'jspdf';

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'چند گزینه‌ای',
  true_false: 'صحیح و غلط',
  short_answer: 'کوتاه',
  fill_blank: 'جای خالی',
  descriptive: 'تشریحی',
  matching: 'جور کردنی',
};

function questionToText(q: Question, index: number): string {
  let text = `${index + 1}. [${TYPE_LABELS[q.type]}] ${q.text} (${q.score} نمره)\n`;
  if (q.type === 'multiple_choice' && q.options) {
    q.options.forEach((opt, i) => {
      const labels = ['الف', 'ب', 'ج', 'د'];
      text += `  ${labels[i] || i + 1}) ${opt.text}\n`;
    });
  }
  if (q.type === 'true_false') {
    text += `  صحیح ☐  غلط ☐\n`;
  }
  if (q.type === 'fill_blank' || q.type === 'short_answer') {
    text += `  پاسخ: ___________________________\n`;
  }
  if (q.type === 'matching' && q.matchingPairs) {
    text += `  ستون الف:\n`;
    q.matchingPairs.forEach((p, i) => {
      text += `    ${i + 1}. ${p.left}\n`;
    });
    text += `  ستون ب:\n`;
    const shuffled = [...q.matchingPairs].sort(() => Math.random() - 0.5);
    shuffled.forEach((p, i) => {
      const letters = ['الف', 'ب', 'ج', 'د', 'ه'];
      text += `    ${letters[i] || i + 1}. ${p.right}\n`;
    });
  }
  if (q.type === 'descriptive') {
    text += `  \n  \n  \n`;
  }
  return text + '\n';
}

export function exportToText(exam: Exam): void {
  const totalScore = exam.questions.reduce((s, q) => s + q.score, 0);
  let content = '';
  content += `آزمون: ${exam.title}\n`;
  content += `درس: ${exam.subject} | پایه: ${exam.grade}\n`;
  content += `معلم: ${exam.teacherName} | مدرسه: ${exam.schoolName}\n`;
  content += `سال تحصیلی: ${exam.academicYear} | مدت: ${exam.duration} دقیقه\n`;
  content += `مجموع نمرات: ${totalScore}\n`;
  content += '─'.repeat(50) + '\n\n';
  exam.questions.forEach((q, i) => {
    content += questionToText(q, i);
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${exam.title}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(exam: Exam): void {
  const blob = new Blob([JSON.stringify(exam, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${exam.title}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportToPDF(exam: Exam): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFont('helvetica');
  doc.setR2L(true);

  const margin = 20;
  const pageWidth = 210;
  const usableWidth = pageWidth - margin * 2;
  let y = margin;

  const addText = (text: string, size: number, bold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, usableWidth);
    if (y + lines.length * (size * 0.35 + 2) > 280) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines, pageWidth - margin, y, { align: 'right' });
    y += lines.length * (size * 0.35 + 2) + 2;
  };

  const totalScore = exam.questions.reduce((s, q) => s + q.score, 0);

  addText(`${exam.title}`, 18, true);
  addText(`درس: ${exam.subject} | پایه: ${exam.grade}`, 11);
  addText(`معلم: ${exam.teacherName} | مدرسه: ${exam.schoolName}`, 11);
  addText(
    `سال تحصیلی: ${exam.academicYear} | مدت: ${exam.duration} دقیقه | مجموع: ${totalScore} نمره`,
    10
  );

  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  exam.questions.forEach((q, i) => {
    const label = TYPE_LABELS[q.type];
    addText(`${i + 1}. [${label}] ${q.text} (${q.score} نمره)`, 11, true);

    if (q.type === 'multiple_choice' && q.options) {
      const labels = ['الف', 'ب', 'ج', 'د'];
      q.options.forEach((opt, idx) => {
        addText(`  ${labels[idx] || idx + 1}) ${opt.text}`, 10);
      });
    }
    if (q.type === 'true_false') {
      addText(`  صحیح [ ]   غلط [ ]`, 10);
    }
    if (q.type === 'fill_blank' || q.type === 'short_answer') {
      addText(`  پاسخ: .......................................`, 10);
    }
    if (q.type === 'matching' && q.matchingPairs) {
      addText(`  ستون الف:`, 10, true);
      q.matchingPairs.forEach((p, idx) =>
        addText(`    ${idx + 1}. ${p.left}`, 10)
      );
      addText(`  ستون ب:`, 10, true);
      const shuffled = [...q.matchingPairs].sort(() => Math.random() - 0.5);
      const letters = ['الف', 'ب', 'ج', 'د', 'ه'];
      shuffled.forEach((p, idx) =>
        addText(`    ${letters[idx] || idx + 1}. ${p.right}`, 10)
      );
    }
    if (q.type === 'descriptive') {
      addText(`  .................................................................`, 10);
      addText(`  .................................................................`, 10);
    }
    y += 3;
  });

  doc.save(`${exam.title}.pdf`);
}
