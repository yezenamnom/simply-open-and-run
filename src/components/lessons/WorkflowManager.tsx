import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { WorkflowBuilder, WorkflowPlan } from './WorkflowBuilder';
import { useLessons, Lesson } from '@/hooks/useLessons';
import { Workflow, Settings, List, Plus, Edit, Trash2 } from 'lucide-react';
import { AIProviderSettings } from './AIProviderSettings';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface WorkflowManagerProps {
  lesson?: Lesson;
  onClose?: () => void;
}

export const WorkflowManager = ({ lesson, onClose }: WorkflowManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWorkflowsList, setShowWorkflowsList] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkflowPlan | null>(
    lesson?.workflow ? (typeof lesson.workflow === 'string' ? JSON.parse(lesson.workflow) : lesson.workflow) : null
  );
  const { lessons, updateLessonWorkflow, deleteLesson, refreshLessons } = useLessons();
  const { toast } = useToast();

  const handleSave = async (plan: WorkflowPlan) => {
    try {
      // إذا كان هناك lesson محدد، احفظ المخطط معه
      if (lesson) {
        await updateLessonWorkflow(lesson.id, plan);
        await refreshLessons();
        toast({
          title: 'تم الحفظ',
          description: 'تم حفظ المخطط الدراسي بنجاح',
        });
      } else {
        // إذا لم يكن هناك lesson، أنشئ درس جديد لحفظ المخطط
        // أو احفظ المخطط في lesson موجود
        const firstLesson = lessons[0];
        if (firstLesson) {
          await updateLessonWorkflow(firstLesson.id, plan);
          await refreshLessons();
          toast({
            title: 'تم الحفظ',
            description: 'تم حفظ المخطط الدراسي بنجاح',
          });
        } else {
          console.log('Saving new workflow (no lesson available):', plan);
          toast({
            title: 'تحذير',
            description: 'لا توجد دروس محفوظة. احفظ درساً أولاً ثم احفظ المخطط',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ المخطط الدراسي',
        variant: 'destructive',
      });
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  // الحصول على جميع الـ Workflows المحفوظة
  const savedWorkflows = lessons
    .filter(l => l.workflow)
    .map(l => {
      try {
        return {
          lessonId: l.id,
          lessonTitle: l.title,
          workflow: typeof l.workflow === 'string' ? JSON.parse(l.workflow) : l.workflow,
        };
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean) as Array<{ lessonId: string; lessonTitle: string; workflow: WorkflowPlan }>;

  const handleOpenWorkflow = (workflow: WorkflowPlan, lessonId: string) => {
    setEditingPlan(workflow);
    setIsOpen(true);
    setShowWorkflowsList(false);
  };

  const handleDeleteWorkflow = async (lessonId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المخطط الدراسي؟')) {
      await updateLessonWorkflow(lessonId, null); // حذف workflow فقط وليس الدرس
      await refreshLessons(); // تحديث القائمة بعد الحذف
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المخطط الدراسي بنجاح',
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Dialog open={showWorkflowsList} onOpenChange={setShowWorkflowsList}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              title="عرض المخططات المحفوظة"
              onClick={() => setShowWorkflowsList(true)}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">المخططات</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                المخططات الدراسية المحفوظة
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {savedWorkflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد مخططات محفوظة</p>
                  <p className="text-sm mt-2">أنشئ مخططاً جديداً لبدء الاستخدام</p>
                </div>
              ) : (
                savedWorkflows.map((item) => (
                  <Card key={item.lessonId} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{item.workflow.title || item.lessonTitle}</h4>
                          <Badge variant="secondary">{item.workflow.nodes?.length || 0} عنصر</Badge>
                        </div>
                        {item.workflow.description && (
                          <p className="text-sm text-muted-foreground mb-2">{item.workflow.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>الدرس: {item.lessonTitle}</span>
                          {item.workflow.nodes && (
                            <>
                              <span>•</span>
                              <span>{item.workflow.edges?.length || 0} اتصال</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenWorkflow(item.workflow, item.lessonId)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          فتح
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWorkflow(item.lessonId)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  setShowWorkflowsList(false);
                  setEditingPlan(null);
                  setIsOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                إنشاء مخطط جديد
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              title="مخطط دراسي متقدم"
            >
              <Workflow className="h-4 w-4" />
              <span className="hidden sm:inline">مخطط دراسي</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] h-[95vh] p-0">
            <DialogHeader className="p-6 pb-0 flex flex-row items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                {editingPlan ? 'تعديل المخطط الدراسي' : 'إنشاء مخطط دراسي جديد'}
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(true);
                }}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                إعدادات AI
              </Button>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <WorkflowBuilder
                initialPlan={editingPlan || undefined}
                onSave={handleSave}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إعدادات AI Providers</DialogTitle>
          </DialogHeader>
          <AIProviderSettings onConfigChange={() => {}} />
        </DialogContent>
      </Dialog>
    </>
  );
};
