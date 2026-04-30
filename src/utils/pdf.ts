import { jsPDF } from 'jspdf';

export function exportToPDF(title: string, content: string, filename: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(title, margin, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const lines = doc.splitTextToSize(content, maxWidth);
  let y = 30;
  const lineHeight = 5;
  const pageHeight = doc.internal.pageSize.getHeight();

  for (const line of lines) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  doc.save(filename);
}
