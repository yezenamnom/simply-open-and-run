import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LessonPlanBuilder, LessonPlan } from './LessonPlanBuilder';
import { useLessons } from '@/hooks/useLessons';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { Lesson } from '@/hooks/useLessons';

interface LessonPlanManagerProps {
  lesson?: Lesson;
  onClose?: () => void;
}

export const LessonPlanManager = ({ lesson, onClose }: LessonPlanManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(
    lesson?.plan ? JSON.parse(JSON.stringify(lesson.plan)) : null
  );
  const { updateLessonPlan } = useLessons();

  const handleSave = async (plan: LessonPlan) => {
    if (!lesson) return;
    
    await updateLessonPlan(lesson.id, plan);
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="gap-2 bg-primary hover:bg-primary/90">
          <BookOpen className="h-5 w-5" />
          {lesson?.plan ? 'تعديل الخطة الدراسية' : 'بناء خطة دراسية'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {lesson?.plan ? 'تعديل الخطة الدراسية' : 'إنشاء خطة دراسية جديدة'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <LessonPlanBuilder
            initialPlan={editingPlan || undefined}
            onSave={handleSave}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

