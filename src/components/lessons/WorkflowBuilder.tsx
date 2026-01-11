import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AI_PROVIDERS, aiProviderService, AIProvider } from '@/lib/api/aiProviders';
import {
  BookOpen,
  Video,
  Target,
  CheckCircle2,
  Link,
  FileText,
  Play,
  Save,
  Trash2,
  Plus,
  Settings,
  X,
  Brain,
  GraduationCap,
  Clock,
  Users,
  Zap,
  Sparkles,
  MessageSquare,
  Calendar,
  Search,
  Send,
  Mail,
  FileText as FileTextIcon,
  BookOpen as BookOpenIcon,
  Download,
  CreditCard,
  StickyNote,
  Timer,
  Coffee,
  Network,
  FileQuestion,
  BookMarked,
  PenTool,
  FileCheck,
  Presentation,
  Mic,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Languages,
  Calculator,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { WorkflowExecutor } from './WorkflowExecutor';
import { useToast } from '@/hooks/use-toast';
import { useLessons } from '@/hooks/useLessons';

export interface WorkflowNode {
  id: string;
  type: 'start' | 'topic' | 'video' | 'quiz' | 'assignment' | 'resource' | 'break' | 'end' | 'ai-research' | 'ai-summarize' | 'ai-generate' | 'ai-analyze' | 'ai-study' | 'whatsapp' | 'telegram' | 'email' | 'pdf-export' | 'lesson-connector' | 'calendar' | 'flashcards' | 'notes' | 'timer' | 'pomodoro' | 'mindmap' | 'quiz-generator' | 'bookmark' | 'highlighter' | 'summary' | 'presentation' | 'recording' | 'image-analyzer' | 'video-analyzer' | 'audio-transcriber' | 'translator' | 'calculator' | 'research' | 'idea-generator' | 'progress-tracker';
  data: {
    label: string;
    description?: string;
    duration?: number;
    content?: string;
    url?: string;
    questions?: string[];
    // AI Agent specific
    aiPrompt?: string;
    aiType?: 'research' | 'summarize' | 'generate' | 'analyze';
    aiModel?: string;
    aiInput?: string; // Input from previous node
    aiOutput?: string; // Output to next node
    aiConfig?: {
      temperature?: number;
      maxTokens?: number;
      searchType?: 'general' | 'news' | 'smart';
      provider?: 'openrouter' | 'openai' | 'anthropic' | 'perplexity' | 'groq' | 'custom';
      model?: string;
      systemPrompt?: string;
      apiKey?: string; // API Key محدد للعقدة (اختياري)
    };
  };
  position: { x: number; y: number };
}

export interface WorkflowPlan {
  id?: string;
  title: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: Array<{ id: string; source: string; target: string }>;
  createdAt?: string;
  updatedAt?: string;
}

interface WorkflowBuilderProps {
  initialPlan?: WorkflowPlan;
  onSave: (plan: WorkflowPlan) => Promise<void>;
  onClose?: () => void;
}

// استخدام CustomNode لجميع أنواع العقد
const nodeTypes = {
  default: CustomNode,
  start: CustomNode,
  end: CustomNode,
  topic: CustomNode,
  video: CustomNode,
  quiz: CustomNode,
  assignment: CustomNode,
  resource: CustomNode,
  break: CustomNode,
  'ai-research': CustomNode,
  'ai-summarize': CustomNode,
  'ai-generate': CustomNode,
  'ai-analyze': CustomNode,
  'ai-study': CustomNode,
  whatsapp: CustomNode,
  telegram: CustomNode,
  email: CustomNode,
  'pdf-export': CustomNode,
  'lesson-connector': CustomNode,
  calendar: CustomNode,
};

// استخدام CustomEdge للخطوط
const edgeTypes = {
  default: CustomEdge,
  smoothstep: CustomEdge,
  straight: CustomEdge,
  step: CustomEdge,
};

// Keep old node types for backward compatibility (not used)
const _oldNodeTypes = {
  _old_start: ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px]',
        'bg-gradient-to-br from-green-500 to-green-600 text-white',
        selected && 'ring-2 ring-green-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Play className="h-4 w-4" />
        <span className="font-semibold text-sm">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs opacity-90 mt-1">{data.description}</p>
      )}
    </div>
  ),
  topic: ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white dark:bg-gray-800',
        'border-blue-500',
        selected && 'ring-2 ring-blue-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <FileText className="h-4 w-4 text-blue-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.description}</p>
      )}
      {data.duration && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{data.duration} دقيقة</span>
        </div>
      )}
    </div>
  ),
  video: ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white dark:bg-gray-800',
        'border-red-500',
        selected && 'ring-2 ring-red-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Video className="h-4 w-4 text-red-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.description}</p>
      )}
      {data.duration && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{data.duration} دقيقة</span>
        </div>
      )}
    </div>
  ),
  quiz: ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white dark:bg-gray-800',
        'border-yellow-500',
        selected && 'ring-2 ring-yellow-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Target className="h-4 w-4 text-yellow-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.description}</p>
      )}
      {data.questions && data.questions.length > 0 && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <Brain className="h-3 w-3" />
          <span>{data.questions.length} سؤال</span>
        </div>
      )}
    </div>
  ),
  assignment: ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white dark:bg-gray-800',
        'border-green-500',
        selected && 'ring-2 ring-green-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.description}</p>
      )}
    </div>
  ),
  resource: ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white dark:bg-gray-800',
        'border-purple-500',
        selected && 'ring-2 ring-purple-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Link className="h-4 w-4 text-purple-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.label}</span>
      </div>
      {data.url && (
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-600 dark:text-purple-400 mt-1 block truncate"
        >
          {data.url}
        </a>
      )}
    </div>
  ),
  break: ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white dark:bg-gray-800',
        'border-gray-400',
        selected && 'ring-2 ring-gray-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.label}</span>
      </div>
      {data.duration && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.duration} دقيقة</p>
      )}
    </div>
  ),
  end: ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px]',
        'bg-gradient-to-br from-red-500 to-red-600 text-white',
        selected && 'ring-2 ring-red-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <GraduationCap className="h-4 w-4" />
        <span className="font-semibold text-sm">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs opacity-90 mt-1">{data.description}</p>
      )}
    </div>
  ),
  'ai-research': ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white dark:bg-gray-800',
        'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20',
        selected && 'ring-2 ring-cyan-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Brain className="h-4 w-4 text-cyan-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.description}</p>
      )}
      <div className="mt-2 flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400">
        <Sparkles className="h-3 w-3" />
        <span>AI Agent</span>
      </div>
    </div>
  ),
  'ai-summarize': ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white dark:bg-gray-800',
        'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20',
        selected && 'ring-2 ring-indigo-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <FileText className="h-4 w-4 text-indigo-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.description}</p>
      )}
      <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
        <Sparkles className="h-3 w-3" />
        <span>AI Agent</span>
      </div>
    </div>
  ),
  'ai-generate': ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white dark:bg-gray-800',
        'border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20',
        selected && 'ring-2 ring-pink-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Zap className="h-4 w-4 text-pink-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.description}</p>
      )}
      <div className="mt-2 flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400">
        <Sparkles className="h-3 w-3" />
        <span>AI Agent</span>
      </div>
    </div>
  ),
  'ai-analyze': ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white dark:bg-gray-800',
        'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
        selected && 'ring-2 ring-orange-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Target className="h-4 w-4 text-orange-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.description}</p>
      )}
      <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
        <Sparkles className="h-3 w-3" />
        <span>AI Agent</span>
      </div>
    </div>
  ),
  whatsapp: ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white dark:bg-gray-800',
        'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
        selected && 'ring-2 ring-green-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="h-4 w-4 text-green-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.label}</span>
      </div>
      {data.whatsappNumber && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.whatsappNumber}</p>
      )}
    </div>
  ),
  calendar: ({ data, selected }: any) => (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white dark:bg-gray-800',
        'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
        selected && 'ring-2 ring-blue-400 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="h-4 w-4 text-blue-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.label}</span>
      </div>
      {data.calendarDate && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.calendarDate}</p>
      )}
    </div>
  ),
};

export const WorkflowBuilder = ({
  initialPlan,
  onSave,
  onClose,
}: WorkflowBuilderProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { lessons } = useLessons();
  const [title, setTitle] = useState(initialPlan?.title || '');
  const [description, setDescription] = useState(initialPlan?.description || '');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [showExecutor, setShowExecutor] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  const initialNodes: Node[] = useMemo(() => {
    if (initialPlan?.nodes) {
      return initialPlan.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      }));
    }
    return [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 100 },
        data: { label: 'بداية الدرس' },
      },
    ];
  }, [initialPlan]);

  const initialEdges: Edge[] = useMemo(() => {
    if (initialPlan?.edges) {
      return initialPlan.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      }));
    }
    return [];
  }, [initialPlan]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      // السماح بعدة اتصالات من نفس المصدر
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${params.sourceHandle || 'default'}-${Date.now()}`,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { strokeWidth: 2 },
      };
      setEdges((eds) => {
        // التحقق من عدم وجود اتصال مكرر
        const exists = eds.some(
          (e) => e.source === params.source && 
                 e.target === params.target &&
                 e.sourceHandle === params.sourceHandle &&
                 e.targetHandle === params.targetHandle
        );
        if (exists) return eds;
        return addEdge(newEdge, eds);
      });
    },
    [setEdges]
  );

  const addNode = useCallback((type: WorkflowNode['type']) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400 + 200,
        y: Math.random() * 300 + 200,
      },
      data: {
        label: getDefaultLabel(type),
        description: '',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setEditingNode(newNode);
    setShowNodeDialog(true);
  }, [setNodes]);

  const getDefaultLabel = (type: WorkflowNode['type']): string => {
    const labels: Record<WorkflowNode['type'], string> = {
      start: 'بداية الدرس',
      topic: 'موضوع جديد',
      video: 'فيديو تعليمي',
      quiz: 'اختبار',
      assignment: 'واجب',
      resource: 'مورد',
      break: 'استراحة',
      end: 'نهاية الدرس',
      'ai-research': 'AI: بحث ذكي',
      'ai-summarize': 'AI: تلخيص',
      'ai-generate': 'AI: توليد محتوى',
      'ai-analyze': 'AI: تحليل',
      'ai-study': 'AI: دراسة وتحليل',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      email: 'Gmail / Email',
      'pdf-export': 'تصدير PDF',
      'lesson-connector': 'ربط درس محفوظ',
      calendar: 'تقويم',
      flashcards: 'بطاقات تعليمية',
      notes: 'ملاحظات',
      timer: 'مؤقت',
      pomodoro: 'بومودورو',
      mindmap: 'خريطة ذهنية',
      'quiz-generator': 'مولد اختبارات',
      bookmark: 'إشارة مرجعية',
      highlighter: 'قلم تمييز',
      summary: 'ملخص',
      presentation: 'عرض تقديمي',
      recording: 'تسجيل صوتي',
      'image-analyzer': 'محلل صور',
      'video-analyzer': 'محلل فيديو',
      'audio-transcriber': 'ناسخ صوتي',
      translator: 'مترجم',
      calculator: 'آلة حاسبة',
      research: 'بحث',
      'idea-generator': 'مولد أفكار',
      'progress-tracker': 'تتبع التقدم',
    };
    return labels[type] || 'عنصر جديد';
  };

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, selectedNode]);

  const updateNode = useCallback((nodeId: string, updates: Partial<Node['data']>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node
      )
    );
  }, [setNodes]);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setEditingNode(node);
    setShowNodeDialog(true);
  }, []);

  const handleSaveNode = useCallback(() => {
    if (editingNode) {
      updateNode(editingNode.id, editingNode.data);
    }
    setShowNodeDialog(false);
    setEditingNode(null);
  }, [editingNode, updateNode]);

  const handleSave = useCallback(async () => {
    const workflowPlan: WorkflowPlan = {
      title,
      description,
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type as WorkflowNode['type'],
        data: node.data,
        position: node.position,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    };

    await onSave(workflowPlan);
  }, [title, description, nodes, edges, onSave]);

  const nodeOptions = [
    { type: 'topic' as const, label: 'موضوع', icon: FileText, color: 'text-blue-500' },
    { type: 'video' as const, label: 'فيديو', icon: Video, color: 'text-red-500' },
    { type: 'quiz' as const, label: 'اختبار', icon: Target, color: 'text-yellow-500' },
    { type: 'assignment' as const, label: 'واجب', icon: CheckCircle2, color: 'text-green-500' },
    { type: 'resource' as const, label: 'مورد', icon: Link, color: 'text-purple-500' },
    { type: 'break' as const, label: 'استراحة', icon: Clock, color: 'text-gray-500' },
    { type: 'end' as const, label: 'نهاية', icon: GraduationCap, color: 'text-red-500' },
  ];

  const studyToolsOptions = [
    { type: 'flashcards' as const, label: 'بطاقات تعليمية', icon: CreditCard, color: 'text-purple-500' },
    { type: 'notes' as const, label: 'ملاحظات', icon: StickyNote, color: 'text-yellow-500' },
    { type: 'timer' as const, label: 'مؤقت', icon: Timer, color: 'text-orange-500' },
    { type: 'pomodoro' as const, label: 'بومودورو', icon: Coffee, color: 'text-red-500' },
    { type: 'mindmap' as const, label: 'خريطة ذهنية', icon: Network, color: 'text-indigo-500' },
    { type: 'quiz-generator' as const, label: 'مولد اختبارات', icon: FileQuestion, color: 'text-teal-500' },
    { type: 'bookmark' as const, label: 'إشارة مرجعية', icon: BookMarked, color: 'text-blue-500' },
    { type: 'highlighter' as const, label: 'قلم تمييز', icon: PenTool, color: 'text-pink-500' },
    { type: 'summary' as const, label: 'ملخص', icon: FileCheck, color: 'text-violet-500' },
    { type: 'presentation' as const, label: 'عرض تقديمي', icon: Presentation, color: 'text-amber-500' },
    { type: 'recording' as const, label: 'تسجيل صوتي', icon: Mic, color: 'text-green-500' },
    { type: 'image-analyzer' as const, label: 'تحليل صورة', icon: ImageIcon, color: 'text-cyan-500' },
    { type: 'video-analyzer' as const, label: 'تحليل فيديو', icon: VideoIcon, color: 'text-red-500' },
    { type: 'audio-transcriber' as const, label: 'نسخ صوتي', icon: Music, color: 'text-purple-500' },
    { type: 'translator' as const, label: 'مترجم', icon: Languages, color: 'text-blue-500' },
    { type: 'calculator' as const, label: 'آلة حاسبة', icon: Calculator, color: 'text-gray-500' },
    { type: 'research' as const, label: 'بحث', icon: Search, color: 'text-teal-500' },
    { type: 'idea-generator' as const, label: 'مولد أفكار', icon: Lightbulb, color: 'text-yellow-500' },
    { type: 'progress-tracker' as const, label: 'تتبع التقدم', icon: TrendingUp, color: 'text-green-500' },
  ];

  const aiNodeOptions = [
    { type: 'ai-research' as const, label: 'AI: بحث ذكي', icon: Brain, color: 'text-cyan-500' },
    { type: 'ai-summarize' as const, label: 'AI: تلخيص', icon: FileText, color: 'text-indigo-500' },
    { type: 'ai-generate' as const, label: 'AI: توليد', icon: Zap, color: 'text-pink-500' },
    { type: 'ai-analyze' as const, label: 'AI: تحليل', icon: Target, color: 'text-orange-500' },
    { type: 'ai-study' as const, label: 'AI: دراسة وتحليل', icon: BookOpenIcon, color: 'text-purple-500' },
  ];

  const integrationNodeOptions = [
    { type: 'email' as const, label: 'Gmail / Email', icon: Mail, color: 'text-red-500' },
    { type: 'whatsapp' as const, label: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
    { type: 'telegram' as const, label: 'Telegram', icon: Send, color: 'text-blue-500' },
    { type: 'pdf-export' as const, label: 'تصدير PDF', icon: Download, color: 'text-orange-500' },
    { type: 'lesson-connector' as const, label: 'ربط درس محفوظ', icon: BookOpenIcon, color: 'text-purple-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="border-b bg-white dark:bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان المخطط الدراسي"
            className="max-w-xs"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف المخطط (اختياري)"
            className="max-w-xs"
            rows={1}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowExecutor(true)}
            disabled={nodes.length === 0}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            تنفيذ
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            <Save className="h-4 w-4 mr-2" />
            حفظ
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              إغلاق
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Node Palette */}
        <div className="w-64 border-r bg-white dark:bg-gray-800 p-4 space-y-4 overflow-y-auto">
          <div>
            <h3 className="font-semibold mb-3 text-sm">إضافة عنصر</h3>
            <div className="space-y-2">
              {nodeOptions.map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => addNode(option.type)}
                >
                  <option.icon className={cn('h-4 w-4', option.color)} />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Agents
            </h3>
            <div className="space-y-2">
              {aiNodeOptions.map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-primary/30 hover:border-primary/50"
                  onClick={() => addNode(option.type)}
                >
                  <option.icon className={cn('h-4 w-4', option.color)} />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500" />
              أدوات دراسية
            </h3>
            <div className="space-y-2">
              {studyToolsOptions.map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-purple-300 hover:border-purple-500"
                  onClick={() => addNode(option.type)}
                >
                  <option.icon className={cn('h-4 w-4', option.color)} />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Link className="h-4 w-4 text-gray-500" />
              التكاملات
            </h3>
            <div className="space-y-2">
              {integrationNodeOptions.map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-gray-300 hover:border-gray-500"
                  onClick={() => addNode(option.type)}
                >
                  <option.icon className={cn('h-4 w-4', option.color)} />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {selectedNode && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">خصائص العنصر</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (selectedNode && confirm('هل تريد حذف هذا العنصر وجميع الخطوط المتصلة به؟')) {
                        deleteNode(selectedNode.id);
                        setSelectedNode(null);
                        toast({
                          title: 'تم الحذف',
                          description: 'تم حذف العنصر والخطوط المتصلة به',
                        });
                      }
                    }}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedNode(null)}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  {selectedNode.data.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  عدد الخطوط المتصلة: {
                    edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length
                  }
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ReactFlow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={() => {
              setSelectedNode(null);
            }}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            deleteKeyCode={['Backspace', 'Delete']}
            multiSelectionKeyCode={['Meta', 'Control']}
            fitView
            className="bg-gray-50 dark:bg-gray-900"
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            }}
          >
            <Background />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const colors: Record<string, string> = {
                  start: '#22c55e',
                  end: '#ef4444',
                  topic: '#3b82f6',
                  video: '#ef4444',
                  quiz: '#eab308',
                  assignment: '#22c55e',
                  resource: '#a855f7',
                  break: '#9ca3af',
                  'ai-research': '#06b6d4',
                  'ai-summarize': '#6366f1',
                  'ai-generate': '#ec4899',
                  'ai-analyze': '#f97316',
                };
                return colors[node.type || 'topic'] || '#6b7280';
              }}
            />
            <Panel position="top-center" className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {nodes.length} عنصر • {edges.length} اتصال
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Node Edit Dialog */}
      <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل العنصر</DialogTitle>
          </DialogHeader>
          {editingNode && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">العنوان</label>
                <Input
                  value={editingNode.data.label || ''}
                  onChange={(e) =>
                    setEditingNode({
                      ...editingNode,
                      data: { ...editingNode.data, label: e.target.value },
                    })
                  }
                  placeholder="عنوان العنصر"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">الوصف</label>
                <Textarea
                  value={editingNode.data.description || ''}
                  onChange={(e) =>
                    setEditingNode({
                      ...editingNode,
                      data: { ...editingNode.data, description: e.target.value },
                    })
                  }
                  placeholder="وصف العنصر (اختياري)"
                  rows={3}
                />
              </div>
              {(editingNode.type === 'topic' || editingNode.type === 'video' || editingNode.type === 'break') && (
                <div>
                  <label className="text-sm font-medium mb-2 block">المدة (بالدقائق)</label>
                  <Input
                    type="number"
                    value={editingNode.data.duration || ''}
                    onChange={(e) =>
                      setEditingNode({
                        ...editingNode,
                        data: { ...editingNode.data, duration: parseInt(e.target.value) || 0 },
                      })
                    }
                    placeholder="المدة"
                  />
                </div>
              )}
              {editingNode.type === 'resource' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">الرابط</label>
                  <Input
                    value={editingNode.data.url || ''}
                    onChange={(e) =>
                      setEditingNode({
                        ...editingNode,
                        data: { ...editingNode.data, url: e.target.value },
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
              )}
              {/* AI Agent Configuration */}
              {(editingNode.type === 'ai-research' || editingNode.type === 'ai-summarize' || 
                editingNode.type === 'ai-generate' || editingNode.type === 'ai-analyze' || 
                editingNode.type === 'ai-study') && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">إعدادات AI Agent</h4>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">الـ Prompt</label>
                    <Textarea
                      value={editingNode.data.aiPrompt || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, aiPrompt: e.target.value },
                        })
                      }
                      placeholder={
                        editingNode.type === 'ai-research' 
                          ? 'مثال: ابحث عن أحدث المعلومات عن...'
                          : editingNode.type === 'ai-summarize'
                          ? 'مثال: لخص المحتوى التالي...'
                          : editingNode.type === 'ai-generate'
                          ? 'مثال: أنشئ محتوى عن...'
                          : 'مثال: حلل المحتوى التالي...'
                      }
                      rows={4}
                    />
                  </div>
                  {/* Provider Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Credential to connect with</Label>
                    <Select
                      value={editingNode.data.aiConfig?.provider || 'openrouter'}
                      onValueChange={(value) => {
                        const provider = value as AIProvider;
                        const config = aiProviderService.getConfig(provider);
                        const defaultModel = config?.defaultModel || AI_PROVIDERS[provider].models[0]?.id || '';
                        setModelSearchQuery(''); // إعادة تعيين البحث عند تغيير Provider
                        setEditingNode({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            aiConfig: {
                              ...editingNode.data.aiConfig,
                              provider,
                              model: defaultModel,
                            },
                          },
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {Object.entries(AI_PROVIDERS).map(([key, provider]) => {
                          const config = aiProviderService.getConfig(key as AIProvider);
                          const isConfigured = config && config.enabled && config.apiKey;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <span>{provider.name}</span>
                                {!isConfigured && (
                                  <span className="text-xs text-muted-foreground">(غير مُعد)</span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Model Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      Model
                      <span className="text-xs text-muted-foreground">(Fixed)</span>
                    </Label>
                    <Select
                      value={editingNode.data.aiConfig?.model || ''}
                      onValueChange={(value) =>
                        setEditingNode({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            aiConfig: {
                              ...editingNode.data.aiConfig,
                              model: value,
                            },
                          },
                        })
                      }
                      disabled={!editingNode.data.aiConfig?.provider}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النموذج" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[400px]">
                        {/* Search Input */}
                        <div className="sticky top-0 z-10 bg-background border-b p-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="text"
                              placeholder="ابحث عن النموذج..."
                              value={modelSearchQuery}
                              onChange={(e) => setModelSearchQuery(e.target.value)}
                              className="pl-8"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        {/* Models List */}
                        <div className="max-h-[300px] overflow-y-auto p-1">
                          {editingNode.data.aiConfig?.provider && 
                            (() => {
                              const provider = editingNode.data.aiConfig.provider as AIProvider;
                              const models = AI_PROVIDERS[provider]?.models || [];
                              const filtered = models.filter((model) => {
                                if (!modelSearchQuery) return true;
                                const query = modelSearchQuery.toLowerCase().trim();
                                if (!query) return true;
                                // البحث في الاسم، ID، Provider
                                return (
                                  model.name.toLowerCase().includes(query) ||
                                  model.id.toLowerCase().includes(query) ||
                                  model.provider.toLowerCase().includes(query) ||
                                  // البحث في أجزاء الاسم
                                  model.name.toLowerCase().split(' ').some(word => word.includes(query)) ||
                                  model.id.toLowerCase().split('/').some(part => part.includes(query))
                                );
                              });
                              
                              if (filtered.length === 0 && modelSearchQuery) {
                                return (
                                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                    لا توجد نتائج لـ "{modelSearchQuery}"
                                    <div className="text-xs mt-1">
                                      جرب البحث بـ: GPT, Claude, Llama, Mistral, Gemini
                                    </div>
                                  </div>
                                );
                              }
                              
                              return (
                                <>
                                  {filtered.map((model) => (
                                    <SelectItem key={model.id} value={model.id}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{model.name}</span>
                                        <span className="text-xs text-muted-foreground">{model.id}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                  {modelSearchQuery && filtered.length > 0 && (
                                    <div className="px-2 py-2 text-xs text-muted-foreground border-t mt-1">
                                      عرض {filtered.length} من {models.length} نموذج
                                    </div>
                                  )}
                                </>
                              );
                            })()
                          }
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* API Key Input - يظهر عند اختيار النموذج */}
                  {editingNode.data.aiConfig?.model && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        API Key <span className="text-xs text-muted-foreground">(اختياري - سيستخدم من الإعدادات إذا لم يتم إدخاله)</span>
                      </Label>
                      <Input
                        type="password"
                        value={editingNode.data.aiConfig?.apiKey || ''}
                        onChange={(e) =>
                          setEditingNode({
                            ...editingNode,
                            data: {
                              ...editingNode.data,
                              aiConfig: {
                                ...editingNode.data.aiConfig,
                                apiKey: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="أدخل API Key (اختياري)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        إذا لم تدخل API Key هنا، سيتم استخدام المفتاح من إعدادات AI Providers
                      </p>
                    </div>
                  )}

                  {/* System Prompt */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">System Prompt (اختياري)</Label>
                    <Textarea
                      value={editingNode.data.aiConfig?.systemPrompt || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            aiConfig: {
                              ...editingNode.data.aiConfig,
                              systemPrompt: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="مثال: أنت مساعد ذكي متخصص في التعليم..."
                      rows={3}
                    />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Temperature</Label>
                      <Input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={editingNode.data.aiConfig?.temperature ?? 0.7}
                        onChange={(e) =>
                          setEditingNode({
                            ...editingNode,
                            data: {
                              ...editingNode.data,
                              aiConfig: {
                                ...editingNode.data.aiConfig,
                                temperature: parseFloat(e.target.value) || 0.7,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Max Tokens</Label>
                      <Input
                        type="number"
                        value={editingNode.data.aiConfig?.maxTokens || 2000}
                        onChange={(e) =>
                          setEditingNode({
                            ...editingNode,
                            data: {
                              ...editingNode.data,
                              aiConfig: {
                                ...editingNode.data.aiConfig,
                                maxTokens: parseInt(e.target.value) || 2000,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  {editingNode.type === 'ai-research' && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">نوع البحث</Label>
                      <Select
                        value={editingNode.data.aiConfig?.searchType || 'smart'}
                        onValueChange={(value) =>
                          setEditingNode({
                            ...editingNode,
                            data: {
                              ...editingNode.data,
                              aiConfig: {
                                ...editingNode.data.aiConfig,
                                searchType: value as 'general' | 'news' | 'smart',
                              },
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smart">بحث ذكي</SelectItem>
                          <SelectItem value="general">بحث عام</SelectItem>
                          <SelectItem value="news">أخبار</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    💡 سيستخدم هذا الـ Agent الذكاء الاصطناعي لتنفيذ المهمة بناءً على المحتوى من العناصر السابقة
                  </div>
                </div>
              )}

              {/* Lesson Connector Configuration */}
              {editingNode.type === 'lesson-connector' && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpenIcon className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">ربط درس محفوظ</h4>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">اختر الدرس</Label>
                    <Select
                      value={editingNode.data.lessonId || ''}
                      onValueChange={(value) => {
                        const lesson = lessons.find(l => l.id === value);
                        setEditingNode({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            lessonId: value,
                            lessonTitle: lesson?.title || '',
                            content: lesson?.content || '',
                          },
                        });
                      }}
                    >
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
                    {editingNode.data.lessonId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        سيتم استخدام محتوى الدرس: {editingNode.data.lessonTitle}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* WhatsApp Configuration */}
              {editingNode.type === 'whatsapp' && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">إعدادات WhatsApp</h4>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">رقم WhatsApp - إرسال إلى شخص معين</Label>
                    <Input
                      value={editingNode.data.whatsappNumber || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, whatsappNumber: e.target.value },
                        })
                      }
                      placeholder="+966501234567 أو 966501234567"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      أدخل رقم WhatsApp الكامل مع رمز الدولة (مثال: +966501234567)
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">الرسالة</Label>
                    <Textarea
                      value={editingNode.data.whatsappMessage || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, whatsappMessage: e.target.value },
                        })
                      }
                      placeholder="اكتب الرسالة أو اتركها فارغة لاستخدام محتوى العنصر السابق"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Telegram Configuration */}
              {editingNode.type === 'telegram' && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Send className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">إعدادات Telegram</h4>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Bot Token</Label>
                    <Input
                      type="password"
                      value={editingNode.data.telegramBotToken || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, telegramBotToken: e.target.value },
                        })
                      }
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Chat ID</Label>
                    <Input
                      value={editingNode.data.telegramChatId || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, telegramChatId: e.target.value },
                        })
                      }
                      placeholder="123456789"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">الرسالة</Label>
                    <Textarea
                      value={editingNode.data.telegramMessage || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, telegramMessage: e.target.value },
                        })
                      }
                      placeholder="اكتب الرسالة أو اتركها فارغة لاستخدام محتوى العنصر السابق"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Email Configuration */}
              {editingNode.type === 'email' && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">إعدادات Email</h4>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">إلى (To)</Label>
                    <Input
                      type="email"
                      value={editingNode.data.emailTo || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, emailTo: e.target.value },
                        })
                      }
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">الموضوع</Label>
                    <Input
                      value={editingNode.data.emailSubject || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, emailSubject: e.target.value },
                        })
                      }
                      placeholder="موضوع الرسالة"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">محتوى الرسالة</Label>
                    <Textarea
                      value={editingNode.data.emailBody || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, emailBody: e.target.value },
                        })
                      }
                      placeholder="اكتب محتوى الرسالة أو اتركها فارغة لاستخدام محتوى العنصر السابق"
                      rows={6}
                    />
                  </div>
                </div>
              )}

              {/* PDF Export Configuration */}
              {editingNode.type === 'pdf-export' && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Download className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">إعدادات تصدير PDF</h4>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">عنوان الملف</Label>
                    <Input
                      value={editingNode.data.pdfTitle || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, pdfTitle: e.target.value },
                        })
                      }
                      placeholder="ملخص الدرس"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">اسم الملف</Label>
                    <Input
                      value={editingNode.data.pdfFilename || ''}
                      onChange={(e) =>
                        setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, pdfFilename: e.target.value },
                        })
                      }
                      placeholder="lesson-summary.pdf"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    💡 سيتم تصدير محتوى العنصر السابق كملف PDF
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNodeDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveNode}>
                  حفظ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Workflow Executor Dialog */}
      <Dialog open={showExecutor} onOpenChange={setShowExecutor}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <WorkflowExecutor
            workflow={{
              title,
              description,
              nodes: nodes.map((node) => ({
                id: node.id,
                type: node.type as WorkflowNode['type'],
                data: node.data,
                position: node.position,
              })),
              edges: edges.map((edge) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
              })),
            }}
            onClose={() => setShowExecutor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

