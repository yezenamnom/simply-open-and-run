import jsPDF from 'jspdf';

export interface PDFConfig {
  title: string;
  content: string;
  filename?: string;
}

export const pdfApi = {
  async exportToPDF(config: PDFConfig): Promise<{ success: boolean; filename?: string; error?: string }> {
    try {
      const doc = new jsPDF();
      
      // إضافة العنوان
      doc.setFontSize(18);
      doc.text(config.title, 14, 20);
      
      // إضافة المحتوى
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(config.content, 180);
      let y = 35;
      
      lines.forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 14, y);
        y += 7;
      });
      
      // حفظ الملف
      const filename = config.filename || `${config.title.replace(/\s+/g, '-')}.pdf`;
      doc.save(filename);
      
      return {
        success: true,
        filename,
      };
    } catch (error: any) {
      console.error('PDF Export error:', error);
      return {
        success: false,
        error: error.message || 'فشل تصدير PDF',
      };
    }
  },
};

