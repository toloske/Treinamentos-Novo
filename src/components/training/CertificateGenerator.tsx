import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import type { Driver, Module } from '../../services/dataService';

interface CertProps {
  driver: Driver;
  modules: Module[];
  compact?: boolean;
}

const CertificateGenerator: React.FC<CertProps> = ({ driver, modules, compact }) => {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      // Create a native PDF bypassing html2canvas to avoid modern CSS (oklch) parsing issues
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4' // 297 x 210 mm
      });

      // 1. Background elements
      pdf.setFillColor(219, 234, 254); // #dbeafe (blue-100)
      pdf.circle(0, 0, 70, 'F'); // Top left corner decor

      pdf.setFillColor(224, 231, 255); // #e0e7ff (indigo-100)
      pdf.circle(297, 210, 90, 'F'); // Bottom right corner decor

      // 2. Border
      pdf.setDrawColor(30, 58, 138); // #1e3a8a
      pdf.setLineWidth(5);
      pdf.rect(10, 10, 277, 190);

      // 3. Title
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(79, 70, 229); // #4f46e5
      pdf.setFontSize(36);
      pdf.text('CERTIFICADO DE CONCLUSÃO', 148.5, 45, { align: 'center' });

      // 4. Subtitle
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105); // #475569
      pdf.setFontSize(16);
      pdf.text('Certificamos que', 148.5, 65, { align: 'center' });

      // 5. Driver Name
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42); // #0f172a
      pdf.setFontSize(28);
      pdf.text(driver.name, 148.5, 85, { align: 'center' });
      
      // Underline name
      const nameWidth = pdf.getTextWidth(driver.name);
      pdf.setDrawColor(226, 232, 240); // #e2e8f0
      pdf.setLineWidth(1);
      pdf.line(148.5 - (nameWidth / 2) - 10, 90, 148.5 + (nameWidth / 2) + 10, 90);

      // 6. Main Text & LGPD
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(12);
      const cpfFormatted = driver.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      const docText1 = `portador(a) do CPF ${cpfFormatted}, concluiu com êxito o programa de`;
      const docText2 = `Onboarding de Motoristas, cumprindo a carga horária e aprovado em todos os requisitos exigidos.`;
      pdf.text(docText1, 148.5, 105, { align: 'center' });
      pdf.text(docText2, 148.5, 112, { align: 'center' });

      // LGPD Clause
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184); // #94a3b8
      const lgpdText = `O motorista declara que realizou pessoalmente os módulos, estando de acordo com as normas de segurança. Declara também seu consentimento para o tratamento de seus dados pessoais (Nome e CPF) exclusivamente para registro de treinamento, conforme a LGPD (Lei 13.709/2018).`;
      pdf.text(lgpdText, 148.5, 122, { align: 'center', maxWidth: 220 });

      // 7. Modules Section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139); // #64748b
      pdf.text('MÓDULOS CONCLUÍDOS', 148.5, 138, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      const modsText = modules.map(m => m.title).join('   •   ');
      
      pdf.text(modsText, 148.5, 148, { align: 'center', maxWidth: 250 });

      // 8. Signatures Footer
      pdf.setDrawColor(148, 163, 184); // #94a3b8
      pdf.setLineWidth(0.5);

      // Left - Motorista
      pdf.line(30, 180, 100, 180);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(10);
      pdf.text('Assinatura do Motorista', 65, 186, { align: 'center' });

      // Center - Date
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(10);
      pdf.text(`Data de Conclusão: ${new Date().toLocaleDateString('pt-BR')}`, 148.5, 186, { align: 'center' });

      // Right - Instructor
      pdf.line(197, 180, 267, 180);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(10);
      pdf.text('Assinatura do Instrutor', 232, 186, { align: 'center' });

      // Save PDF
      pdf.save(`Certificado_Onboarding_${driver.name.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      alert("Erro ao gerar PDF: " + (error as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={generatePDF}
        disabled={generating}
        title="Baixar Certificado"
        className="inline-flex items-center justify-center p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors disabled:opacity-50"
      >
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={generatePDF}
      disabled={generating}
      className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
    >
      {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
      <span>{generating ? 'Gerando...' : 'Baixar Certificado'}</span>
    </button>
  );
};

export default CertificateGenerator;
