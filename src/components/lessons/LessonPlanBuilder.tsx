import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  GripVertical, 
  FileText,
  Video,
  Image as ImageIcon,
  Link,
  Brain,
  Target,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface LessonNode {
  id: string;
  type: 'topic' | 'video' | 'quiz' | 'assignment' | 'resource';
  title: string;
  content?: string;
  position: { x: number; y: number };
  connections?: string[]; // IDs of connected nodes
}

export interface LessonPlan {
  id?: string;
  title: string;
  description?: string;
  nodes: LessonNode[];
  createdAt?: string;
  updatedAt?: string;
}

interface LessonPlanBuilderProps {
  initialPlan?: LessonPlan;
  onSave: (plan: LessonPlan) => Promise<void>;
  onCancel?: () => void;
}

export const LessonPlanBuilder = ({
  initialPlan,
  onSave,
  onCancel
}: LessonPlanBuilderProps) => {
  const [plan, setPlan] = useState<LessonPlan>(
    initialPlan || {
      title: '',
      description: '',
      nodes: []
    }
  );
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const addNode = useCallback((type: LessonNode['type']) => {
    const newNode: LessonNode = {
      id: `node-${Date.now()}`,
      type,
      title: '',
      content: '',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100
      },
      connections: []
    };
    setPlan(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    setSelectedNode(newNode.id);
  }, []);

  const deleteNode = useCallback((id: string) => {
    setPlan(prev => ({
      ...prev,
      nodes: prev.nodes
        .filter(n => n.id !== id)
        .map(n => ({
          ...n,
          connections: n.connections?.filter(c => c !== id) || []
        }))
    }));
    if (selectedNode === id) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const updateNode = useCallback((id: string, updates: Partial<LessonNode>) => {
    setPlan(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === id ? { ...n, ...updates } : n
      )
    }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = plan.nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggedNode(nodeId);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - node.position.x,
        y: e.clientY - rect.top - node.position.y
      });
    }
  }, [plan.nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newPosition = {
      x: e.clientX - rect.left - dragOffset.x,
      y: e.clientY - rect.top - dragOffset.y
    };

    updateNode(draggedNode, { position: newPosition });
  }, [draggedNode, dragOffset, updateNode]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const getNodeIcon = (type: LessonNode['type']) => {
    switch (type) {
      case 'topic':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'quiz':
        return <Target className="h-4 w-4" />;
      case 'assignment':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'resource':
        return <Link className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getNodeColor = (type: LessonNode['type']) => {
    switch (type) {
      case 'topic':
        return 'bg-blue-500';
      case 'video':
        return 'bg-red-500';
      case 'quiz':
        return 'bg-yellow-500';
      case 'assignment':
        return 'bg-green-500';
      case 'resource':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const selectedNodeData = plan.nodes.find(n => n.id === selectedNode);

  return (
    <div className="flex h-full">
      {/* Sidebar - Toolbox */}
      <div className="w-64 border-r bg-card p-4 space-y-4">
        <div>
          <h3 className="font-semibold mb-2">عنوان الخطة</h3>
          <Input
            value={plan.title}
            onChange={(e) => setPlan(prev => ({ ...prev, title: e.target.value }))}
            placeholder="أدخل عنوان الخطة الدراسية"
            className="mb-2"
          />
          <Textarea
            value={plan.description || ''}
            onChange={(e) => setPlan(prev => ({ ...prev, description: e.target.value }))}
            placeholder="وصف الخطة (اختياري)"
            rows={3}
          />
        </div>

        <div>
          <h3 className="font-semibold mb-2">إضافة عنصر</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => addNode('topic')}
            >
              <FileText className="h-4 w-4" />
              موضوع
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => addNode('video')}
            >
              <Video className="h-4 w-4" />
              فيديو
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => addNode('quiz')}
            >
              <Target className="h-4 w-4" />
              اختبار
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => addNode('assignment')}
            >
              <CheckCircle2 className="h-4 w-4" />
              واجب
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => addNode('resource')}
            >
              <Link className="h-4 w-4" />
              مورد
            </Button>
          </div>
        </div>

        {/* Node Properties */}
        {selectedNodeData && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">خصائص العنصر</h3>
            <div className="space-y-2">
              <Input
                value={selectedNodeData.title}
                onChange={(e) => updateNode(selectedNodeData.id, { title: e.target.value })}
                placeholder="عنوان العنصر"
              />
              <Textarea
                value={selectedNodeData.content || ''}
                onChange={(e) => updateNode(selectedNodeData.id, { content: e.target.value })}
                placeholder="المحتوى (اختياري)"
                rows={3}
              />
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => deleteNode(selectedNodeData.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                حذف
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t pt-4 space-y-2">
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
            onClick={() => onSave(plan)}
            disabled={!plan.title.trim()}
          >
            <Save className="h-5 w-5 mr-2" />
            حفظ الخطة الدراسية
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onCancel}
            >
              إلغاء
            </Button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-muted/20">
        <div
          ref={canvasRef}
          className="w-full h-full relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {plan.nodes.map((node) => (
            <Card
              key={node.id}
              className={cn(
                "absolute cursor-move p-3 min-w-[200px] transition-all",
                selectedNode === node.id && "ring-2 ring-primary",
                draggedNode === node.id && "opacity-75"
              )}
              style={{
                left: node.position.x,
                top: node.position.y
              }}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(node.id);
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-1.5 rounded text-white", getNodeColor(node.type))}>
                  {getNodeIcon(node.type)}
                </div>
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="font-medium text-sm mb-1">
                {node.title || 'عنوان العنصر'}
              </div>
              {node.content && (
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {node.content}
                </div>
              )}
            </Card>
          ))}

          {plan.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">ابدأ ببناء خطتك الدراسية</p>
                <p className="text-sm">اسحب العناصر من الشريط الجانبي</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

