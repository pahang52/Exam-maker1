import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType } from 'docx';
import { saveAs } from 'file-saver';
import { ExamData, Question, questionTypeLabels } from '../types';

function toPersianNumbers(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, d => persianDigits[parseInt(d)]);
}

// ===== PDF Export با استفاده از print =====
export async function generatePDF(examData: ExamData, questions: Question[]): Promise<void> {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('لطفاً popup را برای این سایت فعال کنید');
    return;
  }

  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  const grouped = questions.reduce((acc, q) => {
    if (!acc[q.type]) acc[q.type] = [];
    acc[q.type].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const order = ['true-false', 'fill-blank', 'short-answer', 'multiple-choice', 'matching', 'descriptive'];
  let questionNumber = 1;
  let questionsHTML = '';

  for (const type of order) {
    const typeQuestions = grouped[type];
    if (!typeQuestions || typeQuestions.length === 0) continue;

    const typePoints = typeQuestions.reduce((s, q) => s + q.points, 0);
    questionsHTML += `
      <div class="section-header">
        ${questionTypeLabels[type as keyof typeof questionTypeLabels]}
        (${toPersianNumbers(typeQuestions.length)} سوال - ${toPersianNumbers(typePoints)} نمره)
      </div>
    `;

    for (const q of typeQuestions) {
      let questionContent = `<p class="question-text">${toPersianNumbers(questionNumber)}. ${q.question}</p>`;

      if (q.type === 'true-false') {
        questionContent += `<div class="true-false">(   ) صحیح &nbsp;&nbsp;&nbsp;&nbsp; (   ) غلط</div>`;
      } else if (q.type === 'multiple-choice') {
        questionContent += `<div class="options-grid">`;
        q.options.forEach((opt, i) => {
          const letters = ['الف', 'ب', 'ج', 'د', 'ه', 'و'];
          questionContent += `<div class="option">${letters[i]}) ${opt}</div>`;
        });
        questionContent += `</div>`;
      } else if (q.type === 'matching') {
        questionContent += `<div class="matching-grid">
          <div class="matching-col">
            <div class="col-header">ستون الف</div>
            ${q.leftItems.map((item, i) => `<div class="match-item">${toPersianNumbers(i + 1)}. ${item}</div>`).join('')}
          </div>
          <div class="matching-col">
            <div class="col-header">ستون ب</div>
            ${q.rightItems.map((item, i) => {
              const letters = ['الف', 'ب', 'ج', 'د', 'ه'];
              return `<div class="match-item">${letters[i]}. ${item}</div>`;
            }).join('')}
          </div>
        </div>`;
      } else if (q.type === 'descriptive') {
        const linesHTML = Array.from({ length: Math.min(q.lines, 8) })
          .map(() => `<div class="answer-line"></div>`).join('');
        questionContent += `<div class="answer-lines">${linesHTML}</div>`;
      } else {
        questionContent += `<div class="answer-lines"><div class="answer-line"></div><div class="answer-line"></div></div>`;
      }

      questionsHTML += `<div class="question">${questionContent}</div>`;
      questionNumber++;
    }
  }

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>آزمون ${examData.courseName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Vazirmatn', Tahoma, Arial, sans-serif;
          font-size: 13px;
          line-height: 1.8;
          color: #000;
          background: #fff;
          direction: rtl;
        }

        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 15mm 15mm 10mm 15mm;
        }

        .header-box {
          border: 3px solid #000;
          padding: 12px;
          margin-bottom: 15px;
        }

        .header-top {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-bottom: 10px;
          text-align: center;
          font-size: 12px;
        }

        .header-main {
          text-align: center;
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
          padding: 8px 0;
          margin: 8px 0;
        }

        .header-main h1 { font-size: 14px; margin-bottom: 4px; }
        .header-main h2 { font-size: 13px; margin-bottom: 4px; }
        .header-main h3 { font-size: 18px; font-weight: bold; color: #1a56db; }

        .header-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          text-align: center;
          font-size: 12px;
        }

        .student-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 12px;
        }

        .info-field {
          border-bottom: 1px solid #666;
          padding-bottom: 4px;
        }

        .total-points {
          text-align: center;
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 12px;
          padding: 6px;
          background: #f0f4ff;
          border-radius: 4px;
        }

        .section-header {
          background: #e0e0e0;
          padding: 6px 12px;
          font-weight: bold;
          font-size: 13px;
          margin: 12px 0 8px 0;
          border-right: 4px solid #1a56db;
        }

        .question {
          margin-bottom: 12px;
          padding: 0 8px;
        }

        .question-text {
          font-weight: 500;
          margin-bottom: 6px;
          font-size: 13px;
        }

        .true-false {
          padding: 4px 16px;
          font-size: 13px;
          color: #333;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 16px;
          padding: 4px 16px;
        }

        .option { font-size: 12px; }

        .matching-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 4px 16px;
        }

        .col-header {
          font-weight: bold;
          font-size: 12px;
          border-bottom: 1px solid #999;
          margin-bottom: 4px;
          padding-bottom: 2px;
        }

        .match-item { font-size: 12px; padding: 2px 0; }

        .answer-lines { padding: 4px 8px; }
        
        .answer-line {
          border-bottom: 1px solid #666;
          height: 24px;
          margin-bottom: 6px;
        }

        .footer {
          text-align: center;
          border-top: 1px solid #ccc;
          padding-top: 8px;
          margin-top: 20px;
          font-size: 11px;
          color: #666;
        }

        @media print {
          body { background: #fff; }
          .page { margin: 0; padding: 10mm; }
          @page { size: A4; margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header-box">
          <div class="header-main">
            <h1>اداره آموزش و پرورش ${examData.educationOffice || '...........'}</h1>
            <h2>دبیرستان ${examData.schoolName || '...........'}</h2>
            <h3>آزمون درس: ${examData.courseName || '...........'}</h3>
          </div>
          <div class="header-bottom">
            <div>پایه: <strong>${examData.grade || '...........'}</strong></div>
            <div>نوبت: <strong>${examData.examSession || '...........'}</strong></div>
            <div>تاریخ: <strong>${examData.date || '...........'}</strong></div>
            <div>نمره کل: <strong>${toPersianNumbers(totalPoints)} نمره</strong></div>
          </div>
        </div>

        <div class="student-info">
          <div class="info-field">نام و نام خانوادگی: ${examData.studentName || '...........................'}</div>
          <div class="info-field">نام پدر: ${examData.fatherName || '...........................'}</div>
        </div>

        ${questionsHTML}

        <div class="footer">
          <p>طراحی شده توسط: نیکزاد فرد</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// ===== Word Export =====
export async function generateWord(examData: ExamData, questions: Question[]): Promise<void> {
  const children: Paragraph[] = [];

  const rtlRun = (text: string, options: { bold?: boolean; size?: number; italics?: boolean; color?: string } = {}) =>
    new TextRun({ text, rightToLeft: true, bold: options.bold, size: options.size ?? 22, italics: options.italics, color: options.color });

  // ===== سربرگ =====
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [rtlRun(`اداره آموزش و پرورش ${examData.educationOffice}`, { bold: true, size: 26 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [rtlRun(`دبیرستان ${examData.schoolName}`, { bold: true, size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 150, after: 150 },
      children: [rtlRun(`آزمون درس: ${examData.courseName}`, { bold: true, size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [rtlRun(`${examData.examSession}  |  پایه: ${examData.grade}  |  تاریخ: ${examData.date}`, { size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 150, after: 200 },
      children: [
        rtlRun('نام و نام خانوادگی: ___________________   ', { size: 22 }),
        rtlRun('نام پدر: ___________________', { size: 22 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [rtlRun(`نمره کل: ${questions.reduce((s, q) => s + q.points, 0)} نمره`, { bold: true, size: 24 })],
    })
  );

  // ===== سوالات =====
  const grouped = questions.reduce((acc, q) => {
    if (!acc[q.type]) acc[q.type] = [];
    acc[q.type].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const order = ['true-false', 'fill-blank', 'short-answer', 'multiple-choice', 'matching', 'descriptive'];
  let questionNumber = 1;

  for (const type of order) {
    const typeQuestions = grouped[type];
    if (!typeQuestions || typeQuestions.length === 0) continue;

    const typePoints = typeQuestions.reduce((s, q) => s + q.points, 0);

    // عنوان نوع سوال
    children.push(
      new Paragraph({
        spacing: { before: 250, after: 120 },
        shading: { type: ShadingType.SOLID, fill: 'D0D8FF' },
        children: [
          rtlRun(
            `سوالات ${questionTypeLabels[type as keyof typeof questionTypeLabels]} (${typeQuestions.length} سوال - ${typePoints} نمره)`,
            { bold: true, size: 24 }
          ),
        ],
      })
    );

    for (const q of typeQuestions) {
      // متن سوال
      children.push(
        new Paragraph({
          spacing: { before: 150, after: 80 },
          children: [rtlRun(`${questionNumber}. ${q.question}`, { bold: true, size: 22 })],
        })
      );

      if (q.type === 'true-false') {
        children.push(
          new Paragraph({
            indent: { right: 500 },
            spacing: { after: 100 },
            children: [rtlRun('(   ) صحیح          (   ) غلط', { size: 22 })],
          })
        );
      } else if (q.type === 'multiple-choice') {
        const letters = ['الف', 'ب', 'ج', 'د', 'ه', 'و'];
        // گزینه‌ها دو تا دو تا در یک خط
        for (let i = 0; i < q.options.length; i += 2) {
          const text = q.options[i + 1]
            ? `${letters[i]}) ${q.options[i]}          ${letters[i + 1]}) ${q.options[i + 1]}`
            : `${letters[i]}) ${q.options[i]}`;
          children.push(
            new Paragraph({
              indent: { right: 500 },
              spacing: { after: 80 },
              children: [rtlRun(text, { size: 22 })],
            })
          );
        }
      } else if (q.type === 'matching') {
        const letters = ['الف', 'ب', 'ج', 'د', 'ه'];
        // جدول ستون الف و ب
        const maxRows = Math.max(q.leftItems.length, q.rightItems.length);
        const rows: TableRow[] = [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, fill: 'E8E8E8' },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [rtlRun('ستون الف', { bold: true, size: 20 })] })],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, fill: 'E8E8E8' },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [rtlRun('ستون ب', { bold: true, size: 20 })] })],
              }),
            ],
          }),
          ...Array.from({ length: maxRows }, (_, i) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [rtlRun(q.leftItems[i] ? `${i + 1}. ${q.leftItems[i]}` : '', { size: 20 })] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [rtlRun(q.rightItems[i] ? `${letters[i]}. ${q.rightItems[i]}` : '', { size: 20 })] })],
                }),
              ],
            })
          ),
        ];
        children.push(
          new Table({
            width: { size: 80, type: WidthType.PERCENTAGE },
            rows,
          }) as unknown as Paragraph
        );
        children.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
      } else if (q.type === 'descriptive') {
        for (let i = 0; i < Math.min(q.lines, 8); i++) {
          children.push(
            new Paragraph({
              spacing: { before: 150 },
              border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
              children: [rtlRun('', { size: 22 })],
            })
          );
        }
      } else {
        for (let i = 0; i < 2; i++) {
          children.push(
            new Paragraph({
              spacing: { before: 150 },
              border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } },
              children: [rtlRun('', { size: 22 })],
            })
          );
        }
      }

      questionNumber++;
    }
  }

  // فوتر
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 500 },
      border: { top: { color: 'AAAAAA', space: 4, style: BorderStyle.SINGLE, size: 4 } },
      children: [rtlRun('طراحی شده توسط: نیکزاد فرد', { size: 18, italics: true, color: '666666' })],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 900, right: 900, bottom: 900, left: 900 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `exam-${examData.courseName || 'azmon'}-${examData.date || 'date'}.docx`);
}
