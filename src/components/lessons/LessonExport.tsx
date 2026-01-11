import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Share2, FileText, BookOpen, Loader2 } from 'lucide-react';
import { Lesson } from '@/hooks/useLessons';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface LessonExportProps {
  lessons: Lesson[];
  selectedLessons?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export const LessonExport = ({ 
  lessons, 
  selectedLessons = [], 
  onSelectionChange 
}: LessonExportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSelection, setLocalSelection] = useState<string[]>(selectedLessons);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleToggleLesson = (lessonId: string) => {
    const newSelection = localSelection.includes(lessonId)
      ? localSelection.filter(id => id !== lessonId)
      : [...localSelection, lessonId];
    
    setLocalSelection(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  const handleSelectAll = () => {
    const allIds = lessons.map(l => l.id);
    setLocalSelection(allIds);
    if (onSelectionChange) {
      onSelectionChange(allIds);
    }
  };

  const handleDeselectAll = () => {
    setLocalSelection([]);
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  const exportToPDF = async () => {
    if (localSelection.length === 0) {
      toast({
        title: 'تحذير',
        description: 'يرجى تحديد درس واحد على الأقل',
        variant: 'destructive',
      });
      return;
    }

    setExporting(true);
    try {
      const selectedLessonsData = lessons.filter(l => localSelection.includes(l.id));
      
      // إنشاء محتوى PDF
      const pdfContent = generatePDFContent(selectedLessonsData);
      
      // استخدام jsPDF أو مكتبة أخرى لإنشاء PDF
      // هنا سنستخدم window.print() كحل مؤقت
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        printWindow.print();
      }
      
      toast({
        title: 'نجح التصدير',
        description: `تم تصدير ${selectedLessonsData.length} درس بنجاح`,
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تصدير PDF',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const shareLessons = async () => {
    if (localSelection.length === 0) {
      toast({
        title: 'تحذير',
        description: 'يرجى تحديد درس واحد على الأقل',
        variant: 'destructive',
      });
      return;
    }

    try {
      const selectedLessonsData = lessons.filter(l => localSelection.includes(l.id));
      const shareData = {
        title: 'دروس محفوظة',
        text: `تم مشاركة ${selectedLessonsData.length} درس`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: نسخ الرابط
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'تم نسخ الرابط',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const generatePDFContent = (lessonsData: Lesson[]): string => {
    let html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>الدروس المحفوظة</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
          .lesson { margin-bottom: 40px; page-break-inside: avoid; }
          .lesson-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #1a1a1a; }
          .lesson-content { line-height: 1.8; color: #333; }
          .lesson-meta { color: #666; font-size: 14px; margin-bottom: 15px; }
          .citations { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
          .citation { margin: 5px 0; color: #0066cc; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1 style="text-align: center; margin-bottom: 30px;">الدروس المحفوظة</h1>
    `;

    lessonsData.forEach((lesson, index) => {
      html += `
        <div class="lesson">
          <div class="lesson-title">${index + 1}. ${lesson.title}</div>
          <div class="lesson-meta">
            السؤال: ${lesson.query}<br>
            تاريخ الإنشاء: ${new Date(lesson.created_at).toLocaleDateString('ar-SA')}
          </div>
          <div class="lesson-content">${lesson.content}</div>
          ${lesson.citations.length > 0 ? `
            <div class="citations">
              <strong>المصادر:</strong>
              ${lesson.citations.map((cite, i) => 
                `<div class="citation">${i + 1}. ${cite}</div>`
              ).join('')}
            </div>
          ` : ''}
        </div>
      `;
    });

    html += `
      </body>
      </html>
    `;

    return html;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="تصدير / مشاركة"
        >
          <Download className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تصدير ومشاركة الدروس</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                تحديد الكل
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
              >
                إلغاء التحديد
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {localSelection.length} من {lessons.length} محدد
            </div>
          </div>

          {/* Lessons List */}
          <div className="border rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
            {lessons.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد دروس محفوظة</p>
              </div>
            ) : (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Checkbox
                    checked={localSelection.includes(lesson.id)}
                    onCheckedChange={() => handleToggleLesson(lesson.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1">{lesson.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {lesson.query}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(lesson.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              className="flex-1 gap-2"
              onClick={exportToPDF}
              disabled={exporting || localSelection.length === 0}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              تصدير PDF
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={shareLessons}
              disabled={localSelection.length === 0}
            >
              <Share2 className="h-4 w-4" />
              مشاركة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

