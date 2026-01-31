
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Database, AttendanceStatus, SchoolClass } from '../types';

const getStatusChar = (status: AttendanceStatus) => {
  switch (status) {
    case AttendanceStatus.PRESENT: return 'P';
    case AttendanceStatus.ABSENT: return 'F';
    case AttendanceStatus.JUSTIFIED: return 'J';
    default: return '-';
  }
};

const drawHeader = (doc: jsPDF, title: string, subtitle: string, db: Database, schoolClass: SchoolClass) => {
  const { teacherName, schoolName } = db.schoolInfo;
  
  doc.setFillColor(13, 148, 136); // Teal 700
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 45, 'F');

  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(204, 251, 241);
  doc.text(subtitle, 14, 28);

  doc.setTextColor(255, 255, 255);
  doc.text(`Escola: ${schoolName || 'Não informada'}`, 14, 36);
  doc.text(`Professor: ${teacherName || 'Não informado'}`, 14, 41);

  const rightAlign = doc.internal.pageSize.getWidth() - 14;
  doc.text(`Turma: ${schoolClass.name}`, rightAlign, 20, { align: 'right' });
  doc.text(`Disciplina: ${schoolClass.subject || 'Geral'}`, rightAlign, 25, { align: 'right' });
  doc.text(`Turno: ${schoolClass.shift || 'Geral'}`, rightAlign, 30, { align: 'right' });
  doc.text(`Data Emissão: ${new Date().toLocaleDateString()}`, rightAlign, 41, { align: 'right' });

  doc.setTextColor(0, 0, 0);
};

// 1. Relatório Mensal Detalhado (Grade de Dias)
export const generateMonthlyDetailedPDF = (db: Database, classId: string, monthStr: string) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const schoolClass = db.classes.find(c => c.id === classId);
  if (!schoolClass) return;

  const students = db.students.filter(s => s.classId === classId).sort((a, b) => a.name.localeCompare(b.name));
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  drawHeader(doc, 'Relatório Mensal Detalhado', `Mês: ${month}/${year}`, db, schoolClass);

  const head = [['#', 'Nome do Aluno', ...Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()), 'Freq %']];
  
  const body = students.map((s) => {
    const studentRecords = db.attendance.filter(a => a.studentId === s.id && a.date.startsWith(monthStr));
    const dayColumns = Array.from({ length: daysInMonth }, (_, i) => {
      const day = (i + 1).toString().padStart(2, '0');
      const record = studentRecords.find(a => a.date === `${monthStr}-${day}`);
      return record ? getStatusChar(record.status) : '-';
    });

    const present = studentRecords.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const total = studentRecords.length;
    const freq = total > 0 ? ((present / total) * 100).toFixed(0) + '%' : '-';

    return [s.rollNumber, s.name, ...dayColumns, freq];
  });

  autoTable(doc, {
    startY: 50,
    head: head,
    body: body,
    theme: 'grid',
    headStyles: { fillColor: [13, 148, 136], fontSize: 7 },
    bodyStyles: { fontSize: 6, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 45 },
      [daysInMonth + 2]: { fontStyle: 'bold', halign: 'center' }
    }
  });

  doc.save(`Mensal_Detalhado_${schoolClass.name}_${monthStr}.pdf`);
};

// 2. Mapa Final Anual (Resumo do Ano)
export const generateAnnualFinalMapPDF = (db: Database, classId: string, year: string) => {
  const doc = new jsPDF();
  const schoolClass = db.classes.find(c => c.id === classId);
  if (!schoolClass) return;

  const students = db.students.filter(s => s.classId === classId).sort((a, b) => a.name.localeCompare(b.name));
  
  drawHeader(doc, 'Mapa Final de Frequência', `Ano Letivo: ${year}`, db, schoolClass);

  const head = [['#', 'Nome do Aluno', 'Presenças', 'Faltas', 'Justificativas', 'Total Dias', '% Final']];
  
  const body = students.map((s) => {
    const records = db.attendance.filter(a => a.studentId === s.id && a.date.startsWith(year));
    const present = records.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const absent = records.filter(a => a.status === AttendanceStatus.ABSENT).length;
    const justified = records.filter(a => a.status === AttendanceStatus.JUSTIFIED).length;
    const total = records.length;
    const freq = total > 0 ? ((present / total) * 100).toFixed(1) + '%' : '-';

    return [s.rollNumber, s.name, present, absent, justified, total, freq];
  });

  autoTable(doc, {
    startY: 55,
    head: head,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136], fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 'auto' },
      6: { fontStyle: 'bold', halign: 'center', textColor: [13, 148, 136] }
    }
  });

  doc.save(`Mapa_Final_${schoolClass.name}_${year}.pdf`);
};

// Mantido o original como "Resumo Simples"
export const generateAttendancePDF = (db: Database, classId: string, month: string) => {
  const doc = new jsPDF();
  const schoolClass = db.classes.find(c => c.id === classId);
  if (!schoolClass) return;

  const students = db.students.filter(s => s.classId === classId).sort((a, b) => a.name.localeCompare(b.name));
  drawHeader(doc, 'Resumo de Frequência', `Período: ${month}`, db, schoolClass);

  const head = [['#', 'Nome do Aluno', 'Presenças', 'Ausências', 'Justificativas', '% Freq.']];
  const body = students.map((s) => {
    const records = db.attendance.filter(a => a.studentId === s.id && a.date.startsWith(month));
    const present = records.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const absent = records.filter(a => a.status === AttendanceStatus.ABSENT).length;
    const justified = records.filter(a => a.status === AttendanceStatus.JUSTIFIED).length;
    const total = records.length;
    const freq = total > 0 ? ((present / total) * 100).toFixed(1) + '%' : '-';

    return [s.rollNumber, s.name, present, absent, justified, freq];
  });

  autoTable(doc, {
    startY: 55,
    head: head,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    columnStyles: { 0: { cellWidth: 10 }, 5: { halign: 'center' } }
  });

  doc.save(`Resumo_${schoolClass.name}_${month}.pdf`);
};
