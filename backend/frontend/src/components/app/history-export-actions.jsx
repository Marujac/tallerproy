'use client';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText } from 'lucide-react';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeAscii(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '');
}

function toCsvCell(value) {
  const normalized = normalizeAscii(String(value ?? '')).replace(/\r?\n/g, ' ');
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
}

function formatDate(value) {
  return new Date(value).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildCsv(data) {
  const header = ['Fecha', 'Texto Analizado', 'Falacias', 'Puntuacion', 'Cuestionario'];
  const rows = data.map((item) => {
    const fallacies = (item.fallacies || [])
      .map((f) => `${f.type}: ${f.passage}`)
      .join(' | ');
    const questions = (item.questions || [])
      .map((q, index) => `${index + 1}. ${q.question} -> ${q.options?.[q.correctAnswer] ?? ''}`)
      .join(' | ');
    return [
      formatDate(item.timestamp),
      item.text,
      fallacies || 'Sin registros',
      `${item.score}%`,
      questions || 'Sin preguntas',
    ];
  });

  return [header, ...rows]
    .map((row) => row.map((cell) => toCsvCell(cell)).join(','))
    .join('\n');
}

function wrapText(text, maxLength = 90) {
  const clean = normalizeAscii(text).replace(/\s+/g, ' ').trim();
  if (!clean) return [''];
  const words = clean.split(' ');
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function escapePdfText(text) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdf(data) {
  const encoder = new TextEncoder();
  const lines = [
    'Historial de analisis',
    `Generado: ${formatDate(Date.now())}`,
    '',
  ];

  data.forEach((item, index) => {
    lines.push(`Entrada ${index + 1}`);
    lines.push(`Fecha: ${formatDate(item.timestamp)}`);
    lines.push(`Puntuacion: ${item.score}% | Falacias: ${item.fallacies?.length ?? 0}`);
    lines.push(...wrapText(`Texto: ${item.text}`, 95));
    const fallacies = Array.isArray(item.fallacies) ? item.fallacies : [];
    lines.push(`Falacias (${fallacies.length}):`);
    if (fallacies.length) {
      fallacies.forEach((fallacy, i) => {
        lines.push(...wrapText(`${i + 1}. ${fallacy.type || 'Falacia'} - ${fallacy.passage || 'Sin texto'}`, 95));
        if (fallacy.explanation) {
          lines.push(...wrapText(`Explicacion: ${fallacy.explanation}`, 95));
        }
      });
    } else {
      lines.push('Sin registros de falacias');
    }
    const questions = Array.isArray(item.questions) ? item.questions : [];
    lines.push(`Cuestionario (${questions.length}):`);
    if (questions.length) {
      questions.forEach((q, i) => {
        lines.push(...wrapText(`${i + 1}. ${q.question || 'Pregunta'}`, 95));
        if (q.options?.length) {
          lines.push(
            ...wrapText(
              `Respuesta correcta: ${q.options[q.correctAnswer] ?? 'No disponible'}`,
              95
            )
          );
        }
      });
    } else {
      lines.push('Sin preguntas registradas');
    }
    lines.push('');
  });

  const maxLinesPerPage = 45;
  const pagesContent = [];
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pagesContent.push(lines.slice(i, i + maxLinesPerPage));
  }

  const fontObjNumber = 3 + 2 * pagesContent.length;

  const buildStream = (pageLines) => {
    const textLines = ['BT', '/F1 12 Tf', '36 780 Td'];
    pageLines.forEach((line) => {
      wrapText(line, 95).forEach((chunk) => {
        textLines.push(`(${escapePdfText(chunk)}) Tj`);
        textLines.push('0 -16 Td');
      });
    });
    textLines.push('ET');
    return textLines.join('\n');
  };

  const header = '%PDF-1.4\n';
  const objects = [];
  const addObj = (content) => {
    objects.push(content);
    return objects.length;
  };

  const catalogNumber = addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  const pageNumbers = pagesContent.map((_, idx) => 3 + idx);
  const contentNumbers = pagesContent.map((_, idx) => 3 + pagesContent.length + idx);

  addObj(
    `2 0 obj\n<< /Type /Pages /Kids [${pageNumbers
      .map((n) => `${n} 0 R`)
      .join(' ')}] /Count ${pagesContent.length} >>\nendobj\n`
  );

  pagesContent.forEach((_, idx) => {
    const pageNum = pageNumbers[idx];
    const contentNum = contentNumbers[idx];
    addObj(
      `${pageNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentNum} 0 R /Resources << /Font << /F1 ${fontObjNumber} 0 R >> >> >>\nendobj\n`
    );
  });

  pagesContent.forEach((pageLines, idx) => {
    const stream = buildStream(pageLines);
    const length = encoder.encode(stream).length;
    const contentNum = contentNumbers[idx];
    addObj(`${contentNum} 0 obj\n<< /Length ${length} >>\nstream\n${stream}\nendstream\nendobj\n`);
  });

  addObj(`${fontObjNumber} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  let body = header;
  const offsets = [];
  let position = encoder.encode(header).length;

  objects.forEach((obj) => {
    offsets.push(position);
    body += obj;
    position += encoder.encode(obj).length;
  });

  const xrefStart = position;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    xref += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root ${catalogNumber} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  const pdfBytes = encoder.encode(body + xref + trailer);

  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export function HistoryExportActions({ data = [] }) {
  const hasData = Array.isArray(data) && data.length > 0;

  const handleExcel = () => {
    if (!hasData) return;
    const csv = buildCsv(data);
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'historial.csv');
  };

  const handlePdf = () => {
    if (!hasData) return;
    const pdf = buildPdf(data);
    downloadBlob(pdf, 'historial.pdf');
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handleExcel} disabled={!hasData}>
        <FileSpreadsheet className="h-4 w-4" />
        Exportar Excel
      </Button>
      <Button variant="outline" size="sm" onClick={handlePdf} disabled={!hasData}>
        <FileText className="h-4 w-4" />
        Exportar PDF
      </Button>
    </div>
  );
}
