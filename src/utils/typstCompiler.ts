import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { $typst } from '@myriaddreamin/typst.ts';
import { ExamPaper } from '../types/exam';
import { generateTypstCode } from './typstGenerator';

export interface CompilationResult {
  status: 'success' | 'compiling' | 'error';
  svgOutput?: string;
  pdfBlobUrl?: string;
  errorMessage?: string;
}

/**
 * Compiles Typst source string into a PDF Uint8Array or Blob using WASM
 */
export async function compileTypstToPdf(typstCode: string): Promise<Uint8Array | null> {
  try {
    // Attempt compilation using WASM typst compiler
    if (typeof $typst !== 'undefined' && typeof $typst.pdf === 'function') {
      const pdfBytes = await $typst.pdf({
        mainContent: typstCode,
      });
      if (pdfBytes && pdfBytes.length > 0) {
        return pdfBytes;
      }
    }
  } catch (err) {
    console.warn('WASM Typst compilation notice:', err);
  }
  return null;
}

/**
 * Native vector PDF renderer using jsPDF for crisp, real text PDF document
 */
export function generateNativeVectorPdf(paper: ExamPaper): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const { school, groups } = paper;
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Header - School Name
  if (school.name) {
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    const schoolNameStr = school.name.toUpperCase();
    const splitName = doc.splitTextToSize(schoolNameStr, contentWidth);
    doc.text(splitName, pageWidth / 2, y, { align: 'center' });
    y += splitName.length * 6;
  }

  // Address
  if (school.address) {
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    const addrStr = `${school.address} ${school.estd ? `| ESTD. ${school.estd}` : ''}`;
    doc.text(addrStr, pageWidth / 2, y, { align: 'center' });
    y += 5;
  }

  // Exam Title
  if (school.examTitle) {
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text(school.examTitle, pageWidth / 2, y, { align: 'center' });
    const textWidth = doc.getTextWidth(school.examTitle);
    doc.line(pageWidth / 2 - textWidth / 2, y + 0.8, pageWidth / 2 + textWidth / 2, y + 0.8);
    y += 7;
  }

  // Meta Information Table
  y += 2;
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);

  const subjText = `Subject: ${school.subject === 'Custom' ? school.customSubject || 'General' : school.subject}`;
  const gradeText = `Grade/Level: ${school.grade || 'N/A'}`;
  const timeText = `Time: ${school.time || 'Standard'}`;
  const marksText = `Full Marks: ${school.fullMarks}  |  Pass Marks: ${school.passMarks}`;

  doc.text(subjText, margin, y);
  doc.text(gradeText, pageWidth - margin, y, { align: 'right' });
  y += 5;

  doc.text(timeText, margin, y);
  doc.text(marksText, pageWidth - margin, y, { align: 'right' });
  y += 4;

  // Double Divider Rule
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 1.2;
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Instructions
  if (school.instructions) {
    checkPageBreak(12);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, contentWidth, 9, 'F');
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.text(`Instructions: ${school.instructions}`, margin + 3, y + 5.5);
    y += 12;
  }

  // Questions Groups
  let qNum = 1;
  groups.forEach((group) => {
    checkPageBreak(12);
    y += 3;

    doc.setFont('times', 'bolditalic');
    doc.setFontSize(10.5);
    const groupHeader = `${group.name} ${group.description ? `-- ${group.description}` : ''}`;
    doc.text(groupHeader, margin, y);
    y += 2;

    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont('times', 'normal');
    doc.setFontSize(10);

    group.questions.forEach((q) => {
      // Calculate question height
      const qNumStr = `${qNum}.`;
      const qMarkStr = `[${q.marks}]`;
      const qTextWidth = contentWidth - 20;

      const fullText = q.type === 'true_false' ? `${q.text || ''}  [ True / False ]` : (q.text || '');
      const splitQuestionText = doc.splitTextToSize(fullText, qTextWidth);
      const estHeight = splitQuestionText.length * 4.5 + (q.subQuestions?.length || 0) * 4.5 + 8;

      checkPageBreak(estHeight);

      const qStartY = y;

      // Question Number
      doc.setFont('times', 'bold');
      doc.text(qNumStr, margin, y);

      // Question Text
      doc.setFont('times', 'normal');
      doc.text(splitQuestionText, margin + 7, y);

      // Question Marks Right Aligned
      doc.setFont('times', 'bold');
      doc.text(qMarkStr, pageWidth - margin, y, { align: 'right' });

      y += splitQuestionText.length * 4.5 + 1;

      // MCQ Options in vector PDF
      if (q.options && q.options.length > 0) {
        checkPageBreak(10);
        doc.setFont('times', 'normal');
        doc.setFontSize(9.5);
        const colWidth = (contentWidth - 14) / 2;
        q.options.forEach((opt, oIdx) => {
          const isSecondCol = oIdx % 2 === 1;
          const optX = margin + 7 + (isSecondCol ? colWidth : 0);
          const optStr = `(${String.fromCharCode(97 + oIdx)}) ${opt}`;
          doc.text(optStr, optX, y);
          if (isSecondCol || oIdx === q.options!.length - 1) {
            y += 4.5;
          }
        });
        doc.setFontSize(10);
      }

      // Match the Following in vector PDF
      if (q.matchPairs && (q.matchPairs.columnA?.length > 0 || q.matchPairs.columnB?.length > 0)) {
        const rowCount = Math.max(q.matchPairs.columnA?.length || 0, q.matchPairs.columnB?.length || 0);
        checkPageBreak(12 + rowCount * 5);
        y += 1;
        doc.setFont('times', 'bold');
        doc.setFontSize(9.5);
        const colWidth = (contentWidth - 14) / 2;
        doc.text('Column A', margin + 7, y);
        doc.text('Column B', margin + 7 + colWidth, y);
        y += 4.5;
        doc.setFont('times', 'normal');
        for (let mIdx = 0; mIdx < rowCount; mIdx++) {
          const itemA = q.matchPairs.columnA?.[mIdx] ? `(${mIdx + 1}) ${q.matchPairs.columnA[mIdx]}` : '';
          const itemB = q.matchPairs.columnB?.[mIdx] ? `(${String.fromCharCode(97 + mIdx)}) ${q.matchPairs.columnB[mIdx]}` : '';
          doc.text(itemA, margin + 7, y);
          doc.text(itemB, margin + 7 + colWidth, y);
          y += 4.5;
        }
        doc.setFontSize(10);
      }

      // Nepali Text if present
      if (q.textNepali) {
        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        const splitNepali = doc.splitTextToSize(q.textNepali, qTextWidth);
        doc.text(splitNepali, margin + 7, y);
        y += splitNepali.length * 4 + 1;
        doc.setFontSize(10);
      }

      // Sub Questions
      if (q.subQuestions && q.subQuestions.length > 0) {
        doc.setFont('times', 'normal');
        q.subQuestions.forEach((sq, sqIdx) => {
          checkPageBreak(5);
          const subLabel = `(${String.fromCharCode(97 + sqIdx)})`;
          doc.setFont('times', 'bold');
          doc.text(subLabel, margin + 11, y);
          doc.setFont('times', 'normal');

          const splitSub = doc.splitTextToSize(sq, qTextWidth - 10);
          doc.text(splitSub, margin + 18, y);
          y += splitSub.length * 4.5 + 1;
        });
      }

      // OR Choice
      if (q.orQuestion) {
        checkPageBreak(8);
        y += 2;
        doc.setFont('times', 'bolditalic');
        doc.text('-- OR --', pageWidth / 2, y, { align: 'center' });
        y += 4.5;

        doc.setFont('times', 'normal');
        const splitOr = doc.splitTextToSize(q.orQuestion, qTextWidth);
        doc.text(splitOr, margin + 7, y);
        y += splitOr.length * 4.5 + 1;
      }

      // Diagram Box
      if (q.hasDiagramBox) {
        checkPageBreak(15);
        y += 2;
        doc.setLineWidth(0.2);
        doc.setLineDashPattern([2, 2], 0);
        doc.rect(margin + 7, y, contentWidth - 14, 12);
        doc.setLineDashPattern([], 0);
        doc.setFont('times', 'italic');
        doc.setFontSize(8.5);
        doc.text(
          `[ Diagram Box: ${q.diagramTitle || 'Space for Diagram'} ]`,
          pageWidth / 2,
          y + 7,
          { align: 'center' }
        );
        y += 15;
      }

      y += 2;
      qNum++;
    });
  });

  // Signatures
  if (school.showSignatures) {
    checkPageBreak(25);
    y += 12;
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + 45, y);
    doc.line(pageWidth - margin - 45, y, pageWidth - margin, y);
    y += 4;
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text(school.teacherSignatureLabel || 'Subject Teacher', margin, y);
    doc.text(
      school.headmasterSignatureLabel || 'Headmaster / Exam Dept.',
      pageWidth - margin,
      y,
      { align: 'right' }
    );
  }

  // Page Numbers Footer on every page
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text('Best of Luck!', margin, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
    doc.text('Exam Paper Studio', pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  return doc;
}

/**
 * Downloads the paper as a PDF file (supports WASM Typst compile, vector PDF, or canvas fallback)
 */
export async function downloadPaperPdf(
  elementIdOrPaper: string | ExamPaper,
  filename: string = 'Exam_Paper',
  paperObj?: ExamPaper
): Promise<boolean> {
  try {
    let paper: ExamPaper | null = null;

    if (typeof elementIdOrPaper !== 'string') {
      paper = elementIdOrPaper;
    } else if (paperObj) {
      paper = paperObj;
    }

    const safeFilename = (filename || 'Exam_Paper')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '_') + '.pdf';

    // 1. If paper data is provided, try WASM Typst compilation first
    if (paper) {
      const typstCode = generateTypstCode(paper);
      const wasmPdfBytes = await compileTypstToPdf(typstCode);

      if (wasmPdfBytes) {
        const blob = new Blob([wasmPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = safeFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
      }

      // 2. Fallback to native vector jsPDF generation (creates real text/vector PDF!)
      const vectorPdf = generateNativeVectorPdf(paper);
      vectorPdf.save(safeFilename);
      return true;
    }

    // 3. Fallback to html2canvas on DOM element if no paper struct passed
    const elementId = typeof elementIdOrPaper === 'string' ? elementIdOrPaper : 'printable-paper';
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`PDF export error: Element with id '${elementId}' not found.`);
      return false;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.transform = 'none';
          clonedEl.style.margin = '0';
          if (clonedEl.parentElement) {
            clonedEl.parentElement.style.transform = 'none';
          }
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    pdf.save(safeFilename);
    return true;
  } catch (err) {
    console.error('PDF export error:', err);
    try {
      window.print();
      return true;
    } catch (printErr) {
      console.error('Fallback print error:', printErr);
      return false;
    }
  }
}

