
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAttendance } from '../store/AttendanceContext';
import { FileText, Download, Filter, CalendarDays, BarChart3, Info } from 'lucide-react';
import { generateAttendancePDF, generateMonthlyDetailedPDF, generateAnnualFinalMapPDF } from '../services/pdfService';

type ReportType = 'monthly_summary' | 'monthly_detailed' | 'annual_map';

const Reports: React.FC = () => {
  const { db } = useAttendance();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [reportType, setReportType] = useState<ReportType>('monthly_detailed');

  const handleGenerate = () => {
    if (!selectedClass) {
      alert('Selecione uma turma para gerar o relatório.');
      return;
    }

    switch (reportType) {
      case 'monthly_summary':
        generateAttendancePDF(db, selectedClass, selectedMonth);
        break;
      case 'monthly_detailed':
        generateMonthlyDetailedPDF(db, selectedClass, selectedMonth);
        break;
      case 'annual_map':
        const year = selectedMonth.split('-')[0];
        generateAnnualFinalMapPDF(db, selectedClass, year);
        break;
    }
  };

  const reportOptions = [
    { id: 'monthly_detailed', label: 'Mensal Detalhado', desc: 'Grade diária (P/F/J) do mês.', icon: <CalendarDays /> },
    { id: 'monthly_summary', label: 'Resumo Mensal', desc: 'Totais e porcentagens do mês.', icon: <FileText /> },
    { id: 'annual_map', label: 'Mapa Final Anual', desc: 'Resumo acumulado de todo o ano.', icon: <BarChart3 /> },
  ];

  return (
    <Layout title="Relatórios e Mapas" onBack={() => window.location.hash = '#/'}>
      <div className="space-y-6 pb-20">
        
        {/* Seleção de Tipo de Relatório */}
        <div className="grid grid-cols-1 gap-3">
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">Tipo de Documento</label>
          {reportOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setReportType(opt.id as ReportType)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                reportType === opt.id 
                  ? 'border-teal-600 bg-teal-50 shadow-sm' 
                  : 'border-white bg-white shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                reportType === opt.id ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {React.cloneElement(opt.icon as React.ReactElement, { className: 'w-6 h-6' })}
              </div>
              <div>
                <h4 className={`font-black text-sm ${reportType === opt.id ? 'text-teal-900' : 'text-gray-700'}`}>{opt.label}</h4>
                <p className="text-[10px] text-gray-500 font-medium">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Configurações do Relatório */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Turma de Referência</label>
            <select 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-700 outline-none focus:ring-2 focus:ring-teal-500 font-bold text-sm appearance-none"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Selecione a Turma...</option>
              {db.classes.filter(c => c.schoolId === db.currentSchoolId).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              {reportType === 'annual_map' ? 'Ano Letivo' : 'Mês de Referência'}
            </label>
            <input 
              type={reportType === 'annual_map' ? 'number' : 'month'}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-700 outline-none focus:ring-2 focus:ring-teal-500 font-bold text-sm"
              value={reportType === 'annual_map' ? selectedMonth.split('-')[0] : selectedMonth}
              onChange={(e) => {
                if (reportType === 'annual_map') {
                  setSelectedMonth(`${e.target.value}-01`);
                } else {
                  setSelectedMonth(e.target.value);
                }
              }}
              min="2020"
              max="2099"
            />
          </div>

          <button 
            onClick={handleGenerate}
            className="w-full py-4 bg-teal-700 text-white rounded-2xl shadow-xl shadow-teal-100 flex items-center justify-center gap-3 font-black hover:bg-teal-800 active:scale-95 transition-all text-sm uppercase tracking-wider"
          >
            <Download className="w-5 h-5" /> Gerar Arquivo PDF
          </button>
        </div>

        {/* Dica Contextual */}
        <div className="bg-orange-50 p-5 rounded-[24px] border border-orange-100 flex gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
             <Info className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h4 className="text-orange-800 font-bold text-xs mb-1 uppercase tracking-wider">Dica Profissional</h4>
            <p className="text-[11px] text-orange-700 leading-relaxed font-medium">
              {reportType === 'monthly_detailed' 
                ? 'Este relatório é ideal para diários de classe físicos, pois gera uma grade completa com cada dia do mês em orientação paisagem.'
                : reportType === 'annual_map'
                ? 'O Mapa Final consolida todos os registros do ano selecionado, sendo a peça chave para o fechamento do conselho de classe.'
                : 'Use o Resumo Mensal para envios rápidos a coordenação ou pais de alunos.'}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
