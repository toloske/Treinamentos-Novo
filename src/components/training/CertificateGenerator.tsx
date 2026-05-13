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

      // 1. Background (Subtle Cream/White)
      pdf.setFillColor(255, 255, 252);
      pdf.rect(0, 0, 297, 210, 'F');

      // 2. Gold Borders
      const goldColor = [197, 160, 82]; // Classic Gold
      pdf.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
      
      // Outer thick border
      pdf.setLineWidth(2);
      pdf.rect(8, 8, 281, 194);
      
      // Inner thin border
      pdf.setLineWidth(0.5);
      pdf.rect(12, 12, 273, 186);

      // 3. Corner Accents (Gold)
      pdf.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
      pdf.rect(8, 8, 15, 15, 'F'); // TL
      pdf.rect(274, 8, 15, 15, 'F'); // TR
      pdf.rect(8, 187, 15, 15, 'F'); // BL
      pdf.rect(274, 187, 15, 15, 'F'); // BR

      // 4. Top Medallion for Logo (Dark Blue/Slate with Gold Frame)
      pdf.setFillColor(15, 23, 42); // Dark Slate
      pdf.circle(148.5, 35, 22, 'F');
      pdf.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
      pdf.setLineWidth(1.5);
      pdf.circle(148.5, 35, 23, 'S');

      // 4.1 Logo (on the medallion)
      try {
        pdf.addImage('/logo.png', 'PNG', 133.5, 20, 30, 30);
      } catch (e) {
        console.warn('Logo not found');
      }

      // 5. Title
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      pdf.setFontSize(38);
      pdf.text(driver.is_recycling ? 'CERTIFICADO DE RECICLAGEM' : 'CERTIFICADO', 148.5, 75, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42);
      pdf.text('DE CONCLUSÃO DE TREINAMENTO', 148.5, 82, { align: 'center', charSpace: 2 });

      // 6. Subtitle
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(14);
      pdf.text('Pelo presente documento, certificamos com honra que', 148.5, 98, { align: 'center' });

      // 7. Driver Name
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(32);
      pdf.text(driver.name, 148.5, 115, { align: 'center' });
      
      // Decorative line under name
      pdf.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
      pdf.setLineWidth(1);
      const nameWidth = pdf.getTextWidth(driver.name);
      pdf.line(148.5 - (nameWidth / 2) - 15, 120, 148.5 + (nameWidth / 2) + 15, 120);

      // 8. Main Text
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(13);
      const cpfFormatted = driver.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      const docText1 = driver.is_recycling 
        ? `concluiu com distinção o programa de reciclagem e atualização operacional`
        : `concluiu com distinção o treinamento de integração e diretrizes operacionais`;
      const docText2 = `da TransManá Logística, estando apto(a) para o exercício de suas funções.`;
      pdf.text(docText1, 148.5, 135, { align: 'center' });
      pdf.text(docText2, 148.5, 142, { align: 'center' });

      // 8.1 Recycling Dates Info
      if (driver.is_recycling && driver.previous_training_at) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        const prevDate = new Date(driver.previous_training_at).toLocaleDateString('pt-BR');
        pdf.text(`Treinamento Anterior: ${prevDate}   |   Reciclagem Atual: ${new Date().toLocaleDateString('pt-BR')}`, 148.5, 150, { align: 'center' });
      }

      // 9. Seal (Bottom Right)
      pdf.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
      pdf.circle(255, 165, 15, 'F');
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.circle(255, 165, 13, 'S');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(6);
      pdf.text('QUALIDADE', 255, 163, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text('TransManá', 255, 168, { align: 'center' });

      // LGPD Clause (Bottom Center)
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      const lgpdText = `Este documento é pessoal e intransferível. Validado em conformidade com a LGPD (Lei 13.709/2018).`;
      pdf.text(lgpdText, 148.5, 192, { align: 'center' });

      // 10. Modules Section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);
      pdf.text('MÓDULOS DE TREINAMENTO:', 148.5, 160, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      const modsText = modules.map(m => m.title).join('  |  ');
      pdf.text(modsText, 148.5, 168, { align: 'center', maxWidth: 200 });

      // 11. Date (Bottom Left)
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(9);
      pdf.text(`EMITIDO EM: ${new Date().toLocaleDateString('pt-BR')}`, 45, 168, { align: 'center' });

      // 8. Date and Footer (Signatures Removed)
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(10);
      pdf.text(`Data de Conclusão: ${new Date().toLocaleDateString('pt-BR')}`, 148.5, 186, { align: 'center' });


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
