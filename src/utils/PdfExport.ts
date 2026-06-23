import jsPDF from "jspdf";
import { ExamInfo, Question, QUESTION_TYPE_LABELS } from "../types";

// Helper to reverse Persian/Arabic text for jsPDF rendering
function reverseText(text: string): string {
  if (!text) return "";
  // Split by space, reverse words for RTL
  return text.split(" ").reverse().join(" ");
}

function pt(text: string): string {
  return reverseText(text);
}

export async function exportToPDF(
  examInfo: ExamInfo,
  questions: Question[]
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  // Try to use a Unicode font — fall back to Helvetica which supports basic latin
  // Since we can't embed a full Persian font easily, we'll render headers as labels
  // and use the browser print approach for full Persian support
  doc.setFont("helvetica", "bold");

  // Header Box
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, y, contentWidth, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(pt("طراح سوالات - نیکزاد"), pageWidth / 2, y + 8, {
    align: "center",
  });
  y += 18;

  // Info Section
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const infoRows = [
    [
      `نام و نام خانوادگی: ${examInfo.studentName || "---"}`,
      `نام پدر: ${examInfo.fatherName || "---"}`,
    ],
    [
      `درس: ${examInfo.subject || "---"}`,
      `پایه: ${examInfo.grade || "---"}`,
    ],
    [
      `اداره آموزش و پرورش: ${examInfo.district || "---"}`,
      `دبیرستان: ${examInfo.school || "---"}`,
    ],
    [
      `تاریخ امتحان: ${examInfo.examDate || "---"}`,
      `نام دبیر: ${examInfo.teacherName || "---"}`,
    ],
    [
      `مدت امتحان: ${examInfo.duration || "---"} دقیقه`,
      `بارم کل: ${examInfo.totalScore} نمره`,
    ],
  ];

  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y, contentWidth, infoRows.length * 8 + 4, "F");
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, y, contentWidth, infoRows.length * 8 + 4, "S");

  y += 6;
  infoRows.forEach((row) => {
    doc.text(pt(row[0]), pageWidth - margin - 2, y, { align: "right" });
    doc.text(pt(row[1]), margin + contentWidth / 2 - 2, y, { align: "right" });
    y += 8;
  });
  y += 6;

  // Divider
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Questions
  const typeGroups: Record<string, Question[]> = {};
  questions.forEach((q) => {
    if (!typeGroups[q.type]) typeGroups[q.type] = [];
    typeGroups[q.type].push(q);
  });

  const typeOrder = [
    "truefalse",
    "fill",
    "multiple",
    "matching",
    "short",
    "descriptive",
  ];

  let globalNum = 1;

  typeOrder.forEach((type) => {
    const group = typeGroups[type];
    if (!group || group.length === 0) return;

    const totalScore = group.reduce((sum, q) => sum + q.score, 0);

    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    // Section header
    doc.setFillColor(219, 234, 254);
    doc.rect(margin, y, contentWidth, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 64, 175);
    const label = QUESTION_TYPE_LABELS[type as keyof typeof QUESTION_TYPE_LABELS];
    doc.text(
      pt(`${label} (بارم: ${totalScore} نمره)`),
      pageWidth - margin - 2,
      y + 6,
      { align: "right" }
    );
    y += 13;

    group.forEach((q) => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);

      if (q.type === "truefalse") {
        doc.text(
          pt(`${globalNum}. ${q.text}   [ صحیح ☐  /  غلط ☐ ]   (${q.score} نمره)`),
          pageWidth - margin - 2,
          y,
          { align: "right", maxWidth: contentWidth }
        );
        y += 10;
      } else if (q.type === "fill") {
        const filled = q.text.replace(/_+/g, "  ___________  ");
        doc.text(pt(`${globalNum}. ${filled}   (${q.score} نمره)`), pageWidth - margin - 2, y, {
          align: "right",
          maxWidth: contentWidth,
        });
        y += 10;
      } else if (q.type === "multiple") {
        doc.text(
          pt(`${globalNum}. ${q.text}   (${q.score} نمره)`),
          pageWidth - margin - 2,
          y,
          { align: "right", maxWidth: contentWidth }
        );
        y += 8;
        const opts = ["الف", "ب", "ج", "د"];
        q.options.forEach((opt, oi) => {
          doc.text(
            pt(`${opts[oi]}) ${opt}`),
            pageWidth - margin - 10,
            y,
            { align: "right" }
          );
          y += 7;
        });
        y += 2;
      } else if (q.type === "matching") {
        doc.text(
          pt(`${globalNum}. جور کردنی   (${q.score} نمره)`),
          pageWidth - margin - 2,
          y,
          { align: "right" }
        );
        y += 8;
        const half = contentWidth / 2 - 5;
        q.leftItems.forEach((item, li) => {
          doc.text(pt(`${li + 1}. ${item}`), pageWidth - margin - 2, y, {
            align: "right",
            maxWidth: half,
          });
          if (q.rightItems[li]) {
            doc.text(pt(`${String.fromCharCode(65 + li)}. ${q.rightItems[li]}`), margin + half, y, {
              align: "right",
              maxWidth: half,
            });
          }
          y += 7;
        });
        y += 2;
      } else if (q.type === "short") {
        doc.text(
          pt(`${globalNum}. ${q.text}   (${q.score} نمره)`),
          pageWidth - margin - 2,
          y,
          { align: "right", maxWidth: contentWidth }
        );
        y += 8;
        doc.setDrawColor(180, 180, 180);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
      } else if (q.type === "descriptive") {
        doc.text(
          pt(`${globalNum}. ${q.text}   (${q.score} نمره)`),
          pageWidth - margin - 2,
          y,
          { align: "right", maxWidth: contentWidth }
        );
        y += 8;
        const lineCount = q.lines || 4;
        for (let i = 0; i < lineCount; i++) {
          doc.setDrawColor(180, 180, 180);
          doc.line(margin, y, pageWidth - margin, y);
          y += 8;
        }
        y += 2;
      }

      globalNum++;
    });

    y += 4;
  });

  // Footer
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(37, 99, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(pt("طراحی شده با برنامه طراح سوالات - نیکزاد"), pageWidth / 2, y, {
    align: "center",
  });

  doc.save("exam_nikzad.pdf");
}
