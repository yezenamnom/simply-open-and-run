import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Brain, FileText, Loader2, Sparkles } from 'lucide-react';
import { Lesson } from '@/hooks/useLessons';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { perplexityApi } from '@/lib/api/perplexity';
import { formatSummaryContent } from '@/lib/sanitize';

interface LessonSummaryProps {
  lessons: Lesson[];
}

export const LessonSummary = ({ lessons }: LessonSummaryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleToggleLesson = (lessonId: string) => {
    setSelectedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleSelectAll = () => {
    setSelectedLessons(lessons.map(l => l.id));
  };

  const handleDeselectAll = () => {
    setSelectedLessons([]);
  };

  const generateSummary = async () => {
    if (selectedLessons.length === 0) {
      toast({
        title: 'تحذير',
        description: 'يرجى تحديد درس واحد على الأقل',
        variant: 'destructive',
      });
      return;
    }

    setSummarizing(true);
    setSummary('');

    try {
      const selectedLessonsData = lessons.filter(l => selectedLessons.includes(l.id));
      
      // بناء prompt للتلخيص
      const lessonsContent = selectedLessonsData
        .map((lesson, index) => {
          return `
الدرس ${index + 1}: ${lesson.title}
السؤال: ${lesson.query}
المحتوى: ${lesson.content.substring(0, 500)}...
          `.trim();
        })
        .join('\n\n---\n\n');

      const prompt = language === 'ar'
        ? `قم بإنشاء تلخيص احترافي شامل للدروس التالية. يجب أن يتضمن:
1. نظرة عامة على المواضيع الرئيسية
2. النقاط المهمة من كل درس
3. الروابط والعلاقات بين الدروس
4. الخلاصة والتوصيات

الدروس:
${lessonsContent}

قدم التلخيص بشكل منظم واحترافي مع استخدام العناوين والترقيم.`
        : `Create a professional comprehensive summary of the following lessons. It should include:
1. Overview of main topics
2. Key points from each lesson
3. Links and relationships between lessons
4. Summary and recommendations

Lessons:
${lessonsContent}

Present the summary in an organized and professional manner with headings and numbering.`;

      const result = await perplexityApi.search(prompt, 'smart', language);

      if (result.success && result.content) {
        setSummary(result.content);
        toast({
          title: 'نجح التلخيص',
          description: 'تم إنشاء التلخيص بنجاح',
        });
      } else {
        throw new Error(result.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: 'خطأ',
        description: 'فشل إنشاء التلخيص',
        variant: 'destructive',
      });
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="تلخيص احترافي"
        >
          <Brain className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            تلخيص احترافي للدروس
          </DialogTitle>
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
              {selectedLessons.length} من {lessons.length} محدد
            </div>
          </div>

          {/* Lessons List */}
          <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
            {lessons.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد دروس محفوظة</p>
              </div>
            ) : (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Checkbox
                    checked={selectedLessons.includes(lesson.id)}
                    onCheckedChange={() => handleToggleLesson(lesson.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1">{lesson.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {lesson.query}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Generate Button */}
          <Button
            className="w-full gap-2"
            onClick={generateSummary}
            disabled={summarizing || selectedLessons.length === 0}
          >
            {summarizing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري التلخيص...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                إنشاء تلخيص احترافي
              </>
            )}
          </Button>

          {/* Summary Result */}
          {summary && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-semibold">التلخيص:</span>
              </div>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: formatSummaryContent(summary) }}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  navigator.clipboard.writeText(summary);
                  toast({
                    title: 'تم النسخ',
                    description: 'تم نسخ التلخيص',
                  });
                }}
              >
                نسخ التلخيص
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

