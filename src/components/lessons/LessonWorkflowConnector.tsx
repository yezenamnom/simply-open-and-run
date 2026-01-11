import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowBuilder, WorkflowPlan } from './WorkflowBuilder';
import { useLessons, Lesson } from '@/hooks/useLessons';
import { Link, BookOpen, Workflow } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LessonWorkflowConnectorProps {
  lesson?: Lesson;
  onClose?: () => void;
}

export const LessonWorkflowConnector = ({ lesson, onClose }: LessonWorkflowConnectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(lesson?.id || null);
  const { lessons, updateLessonWorkflow } = useLessons();
  const { toast } = useToast();

  const handleSave = async (plan: WorkflowPlan) => {
    if (!selectedLessonId) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار درس',
        variant: 'destructive',
      });
      return;
    }

    await updateLessonWorkflow(selectedLessonId, plan);
    setIsOpen(false);
    
    toast({
      title: 'نجح الربط',
      description: 'تم ربط المخطط الدراسي بالدرس بنجاح',
    });

    if (onClose) onClose();
  };

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);
  const existingWorkflow = selectedLesson?.workflow 
    ? (typeof selectedLesson.workflow === 'string' 
        ? JSON.parse(selectedLesson.workflow) 
        : selectedLesson.workflow)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Link className="h-4 w-4" />
          ربط بدرس
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            ربط المخطط الدراسي بدرس محفوظ
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">اختر الدرس</label>
            <Select value={selectedLessonId || ''} onValueChange={setSelectedLessonId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر درس محفوظ" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLesson && (
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{selectedLesson.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedLesson.query}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <WorkflowBuilder
            initialPlan={existingWorkflow || undefined}
            onSave={handleSave}
            onClose={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

